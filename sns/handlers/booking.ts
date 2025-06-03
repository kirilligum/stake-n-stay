import { Context, djwt } from "../deps.ts";
import { listings_db } from "./listing.ts";
import { users } from "./auth.ts";
import { addPointTransaction } from "./point.ts"; // Import the new point transaction handler
import { v4 as uuidv4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";

interface Booking {
  id: string;
  guest_id: number; // from JWT user_id
  listing_id: string;
  check_in_date: string; // ISO date string
  check_out_date: string; // ISO date string
  num_guests: number;
  total_points_charged: number;
  status: 'confirmed' | 'cancelled_by_guest' | 'cancelled_by_host'; // Example statuses
  created_at: string;
  updated_at: string;
}

// Temporary in-memory store for bookings
const bookings_db: Booking[] = [];

// Helper to check date validity and if check_in is before check_out
function areDatesValid(checkInStr: string, checkOutStr: string): boolean {
    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare with the start of today

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return false; // Invalid date format
    return checkIn >= today && checkOut > checkIn;
}

// Helper for basic overlap check
function isBookingOverlap(
    listingId: string,
    newCheckIn: Date,
    newCheckOut: Date
): boolean {
    return bookings_db.some(booking => {
        if (booking.listing_id === listingId && booking.status === 'confirmed') {
            const existingCheckIn = new Date(booking.check_in_date);
            const existingCheckOut = new Date(booking.check_out_date);
            // Overlap if (StartA < EndB) and (EndA > StartB)
            return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn;
        }
        return false;
    });
}


export async function createBooking(ctx: Context) {
  try {
    const guest = ctx.state.user as any; // Populated by authMiddleware
    if (!guest || guest.user_id === undefined || guest.points_balance === undefined) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly or missing user data." };
      return;
    }

    const body = ctx.request.body({ type: "json" });
    const { listing_id, check_in_date, check_out_date, num_guests } = await body.value;

    // --- Validation ---
    if (!listing_id || !check_in_date || !check_out_date || !num_guests) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required fields: listing_id, check_in_date, check_out_date, num_guests." };
      return;
    }

    if (!areDatesValid(check_in_date, check_out_date)) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid dates. Ensure check-in is not in the past and check-out is after check-in." };
        return;
    }

    const listing = listings_db.find(l => l.id === listing_id);
    if (!listing) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Listing not found." };
      return;
    }

    if (typeof num_guests !== 'number' || num_guests <= 0) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Number of guests must be a positive integer." };
        return;
    }
    if (num_guests > (listing.max_guests || 1)) {
      ctx.response.status = 400;
      ctx.response.body = { error: `Number of guests exceeds the maximum allowed for this listing (${listing.max_guests}).` };
      return;
    }

    // Basic availability check (no overlapping confirmed bookings)
    const newCheckInDate = new Date(check_in_date);
    const newCheckOutDate = new Date(check_out_date);
    if (isBookingOverlap(listing_id, newCheckInDate, newCheckOutDate)) {
        ctx.response.status = 409; // Conflict
        ctx.response.body = { error: "The listing is not available for the selected dates (overlap with existing booking)." };
        return;
    }

    // --- Calculation ---
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const nights = Math.round(Math.abs((newCheckOutDate.getTime() - newCheckInDate.getTime()) / oneDay));
    if (nights <= 0) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Check-out date must be after check-in date." };
        return;
    }
    const total_points_charged = nights * listing.price_per_night_points;

    // --- Points Check & Deduction ---
    // The JWT's points_balance is used for the initial check
    if (guest.points_balance < total_points_charged) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Insufficient points balance.", current_balance: guest.points_balance, points_needed: total_points_charged };
      return;
    }

    const booking_id = uuidv4.generate(); // Generate booking ID first

    // Use addPointTransaction for authoritative deduction
    const paymentTransaction = addPointTransaction(
        guest.user_id,
        -total_points_charged, // Negative for debit
        'booking_payment',
        booking_id,
        `Payment for booking ${booking_id}`
    );

    if (!paymentTransaction) {
        // This indicates an internal issue, like user not found in the 'users' array by addPointTransaction
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to process point transaction for booking payment." };
        return;
    }

    // --- Create Booking ---
    const newBooking: Booking = {
      id: booking_id, // Use the generated ID
      guest_id: guest.user_id,
      listing_id,
      check_in_date,
      check_out_date,
      num_guests,
      total_points_charged,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    bookings_db.push(newBooking);
    console.log("Bookings DB:", bookings_db); // For debugging

    ctx.response.status = 201; // Created
    ctx.response.body = { message: "Booking created successfully", booking: newBooking, new_balance: guestUserRecord.points_balance };

  } catch (error) {
    console.error("Create booking error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error during booking creation." };
    if (error instanceof TypeError && error.message.includes("Cannot destructure property")) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body. Expected JSON with booking details." };
    }
  }
}

export async function getGuestBookings(ctx: Context) {
  try {
    const guest = ctx.state.user as any;
    if (!guest || guest.user_id === undefined) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const guestBookings = bookings_db.filter(b => b.guest_id === guest.user_id);

    ctx.response.status = 200;
    ctx.response.body = { bookings: guestBookings };

  } catch (error) {
    console.error("Get guest bookings error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}

export async function getListingBookings(ctx: Context) {
  try {
    const user = ctx.state.user as any;
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const { listing_id } = ctx.params;
    if (!listing_id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Listing ID parameter is required." };
      return;
    }

    const listing = listings_db.find(l => l.id === listing_id);
    if (!listing) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Listing not found." };
      return;
    }

    // Authorization: Only the admin of the listing can view its bookings
    if (listing.admin_id !== user.user_id) {
      ctx.response.status = 403; // Forbidden
      ctx.response.body = { error: "You are not authorized to view bookings for this listing." };
      return;
    }

    const listingBookings = bookings_db.filter(b => b.listing_id === listing_id);

    ctx.response.status = 200;
    ctx.response.body = { bookings: listingBookings };

  } catch (error) {
    console.error("Get listing bookings error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}

export async function cancelBooking(ctx: Context) {
  try {
    const user = ctx.state.user as any;
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const { booking_id } = ctx.params;
    if (!booking_id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Booking ID parameter is required." };
      return;
    }

    const bookingIndex = bookings_db.findIndex(b => b.id === booking_id);
    if (bookingIndex === -1) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Booking not found." };
      return;
    }

    const booking = bookings_db[bookingIndex];
    const listing = listings_db.find(l => l.id === booking.listing_id);

    let newStatus: Booking['status'] | null = null;
    const wasConfirmed = booking.status === 'confirmed';

    // Authorization checks
    if (user.user_id === booking.guest_id) {
      newStatus = 'cancelled_by_guest';
    } else if (listing && user.user_id === listing.admin_id) {
      newStatus = 'cancelled_by_host';
    } else {
      ctx.response.status = 403; // Forbidden
      ctx.response.body = { error: "You are not authorized to cancel this booking." };
      return;
    }

    if (booking.status === newStatus) {
        ctx.response.status = 200; // Or 400 if re-cancelling is an error
        ctx.response.body = { message: "Booking is already in this state.", booking };
        return;
    }

    booking.status = newStatus;
    booking.updated_at = new Date().toISOString();

    // Simulate point refund if it was confirmed and now cancelled
    if (wasConfirmed && (newStatus === 'cancelled_by_guest' || newStatus === 'cancelled_by_host')) {
        const refundTransaction = addPointTransaction(
            booking.guest_id,
            booking.total_points_charged, // Positive for credit
            'booking_refund',
            booking.id,
            `Refund for cancelled booking ${booking.id}`
        );
        if (!refundTransaction) {
            console.error(`Failed to process point refund transaction for booking ${booking.id}. User ID: ${booking.guest_id}`);
            // This is problematic as the booking is cancelled but refund failed.
            // In a real system, this might warrant rolling back the cancellation or flagging for manual review.
            // For now, we log it. The booking status is already updated.
            ctx.response.status = 500; // Indicate a server-side issue with the refund part
            ctx.response.body = { message: "Booking cancelled, but point refund processing encountered an issue. Please contact support.", booking };
            return;
        }
         // The user's points_balance in the 'users' array is now updated.
         // JWT will be stale until next login.
    }

    bookings_db[bookingIndex] = booking;
    console.log("Bookings DB after cancellation:", bookings_db);

    ctx.response.status = 200;
    ctx.response.body = { message: "Booking cancelled successfully.", booking };

  } catch (error) {
    console.error("Cancel booking error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error during booking cancellation." };
  }
}
