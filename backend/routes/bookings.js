import { Hono } from 'hono';
import { verifyToken } from '../middleware/auth.js';
import {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  // getBookingsByPropertyId, // For future use by property owners
  updateBookingStatus,
  isPropertyAvailable,
} from '../models/booking.js';
import { findUserById, updateUserPoints } from '../models/user.js';
import { getPropertyById as getPropertyDetails } from '../models/property.js'; // Renamed to avoid conflict
import { createTransaction } from '../models/pointsTransaction.js';

const bookings = new Hono();

// POST /api/bookings - Create a new booking (Protected)
bookings.post('/', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload', message: 'UserID is missing.' }, 403);
    }
    const userId = payload.UserID;

    const { property_id, start_date, end_date, number_of_guests = 1, special_requests = null } = await c.req.json();

    // Basic validation
    if (!property_id || !start_date || !end_date) {
      return c.json({ error: 'Missing required fields', message: 'Property ID, start date, and end date are required.' }, 400);
    }
    // Add more robust date validation (e.g., start_date before end_date, not in past)
    if (new Date(start_date) >= new Date(end_date)) {
        return c.json({ error: 'Invalid dates', message: 'Check-out date must be after check-in date.' }, 400);
    }
    if (new Date(start_date) < new Date(Date.now() - 86400000) ) { // Allow booking for today, but not past days
        return c.json({ error: 'Invalid dates', message: 'Check-in date cannot be in the past.' }, 400);
    }


    // 1. Check property availability
    const available = await isPropertyAvailable(property_id, start_date, end_date);
    if (!available) {
      return c.json({ error: 'Property not available', message: 'The selected dates are not available for this property.' }, 409); // 409 Conflict
    }

    // 2. Fetch property details to get price (points per night)
    const property = await getPropertyDetails(property_id);
    if (!property) {
      return c.json({ error: 'Property not found' }, 404);
    }
    // Assuming PricePerNight is the points cost. If you have a separate points field, use that.
    const pointsPerNight = property.PricePerNight;
    if (typeof pointsPerNight !== 'number' || pointsPerNight <= 0) {
        return c.json({ error: 'Invalid property data', message: 'Price (points) per night for the property is invalid or not set.' }, 500);
    }

    // 3. Calculate total points
    const nights = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        return c.json({ error: 'Invalid date range', message: 'Booking must be for at least one night.'}, 400);
    }
    const totalPointsCharged = nights * pointsPerNight;

    // 4. Check user's points balance
    const user = await findUserById(userId);
    if (!user) {
      return c.json({ error: 'User not found' }, 404); // Should not happen if token is valid
    }
    if (user.PointsBalance < totalPointsCharged) {
      return c.json({ error: 'Insufficient points', message: `You need ${totalPointsCharged} points, but have ${user.PointsBalance}.` }, 403);
    }

    // 5. Create the booking
    const bookingData = {
      user_id: userId,
      property_id,
      check_in_date: start_date,
      check_out_date: end_date,
      total_price: totalPointsCharged, // Storing points in 'TotalPrice' column as per schema
      status: 'confirmed', // Or 'pending' if further confirmation/payment needed
      number_of_guests,
      special_requests
    };
    const newBooking = await createBooking(bookingData);

    // 6. Deduct points from user
    const newBalance = user.PointsBalance - totalPointsCharged;
    await updateUserPoints(userId, newBalance);

    // 7. Log points transaction
    try {
      await createTransaction({
        user_id: userId,
        type: 'spend_booking',
        amount: -totalPointsCharged, // Negative for spending
        related_booking_id: newBooking.BookingID, // Corrected: newBooking.BookingID
        description: `Booked property: ${property.Title}` // Corrected: property.Title
      });
    } catch (transactionError) {
      console.error('[Bookings Route POST /] Error logging points transaction:', transactionError.message);
      // Non-critical error, so don't fail the whole booking if this fails. Maybe log to a different system.
    }

    return c.json({ message: 'Booking created successfully', booking: newBooking, newPointsBalance: newBalance }, 201);
  } catch (error) {
    console.error('[Bookings Route POST /] Error:', error.message, error.stack);
    return c.json({ error: 'Failed to create booking', details: error.message }, 500);
  }
});

// GET /api/bookings/my-bookings - Get all bookings for the logged-in user (Protected)
bookings.get('/my-bookings', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload' }, 403);
    }
    const userId = payload.UserID;
    const userBookings = await getBookingsByUserId(userId);
    return c.json(userBookings);
  } catch (error) {
    console.error('[Bookings Route GET /my-bookings] Error:', error.message);
    return c.json({ error: 'Failed to retrieve your bookings', details: error.message }, 500);
  }
});

// GET /api/bookings/:id - Get a specific booking by ID (Protected)
bookings.get('/:id', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
     if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload' }, 403);
    }
    const currentUserId = payload.UserID;
    const { id } = c.req.param();
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
        return c.json({ error: 'Invalid booking ID format' }, 400);
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Authorization: User must be the guest OR the owner of the property booked (or admin)
    const propertyOfBooking = await getPropertyDetails(booking.PropertyID);
    if (booking.GuestUserID !== currentUserId && (!propertyOfBooking || propertyOfBooking.OwnerUserID !== currentUserId) && payload.Role !== 'admin' ) {
      return c.json({ error: 'Forbidden', message: 'You are not authorized to view this booking.' }, 403);
    }

    return c.json(booking);
  } catch (error) {
    console.error(`[Bookings Route GET /:id] Error for ID ${c.req.param('id')}:`, error.message);
    return c.json({ error: 'Failed to retrieve booking', details: error.message }, 500);
  }
});

// PUT /api/bookings/:id/cancel - Cancel a booking (Protected)
bookings.put('/:id/cancel', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload' }, 403);
    }
    const userId = payload.UserID;
    const { id } = c.req.param();
    const bookingId = parseInt(id);

     if (isNaN(bookingId)) {
        return c.json({ error: 'Invalid booking ID format' }, 400);
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Authorization: Only the user who made the booking can cancel it (or admin)
    // Add time-based restrictions for cancellation if needed (e.g., not allowed if check-in is too soon)
    if (booking.GuestUserID !== userId && payload.Role !== 'admin') {
      return c.json({ error: 'Forbidden', message: 'You are not authorized to cancel this booking.' }, 403);
    }

    if (booking.Status === 'cancelled') {
        return c.json({ message: 'Booking is already cancelled.', booking }, 200);
    }
    if (booking.Status !== 'confirmed') { // Or other cancellable statuses
        return c.json({ error: 'Cannot cancel booking', message: `Booking status is '${booking.Status}', which cannot be cancelled.`}, 400);
    }


    const updatedBooking = await updateBookingStatus(bookingId, 'cancelled');

    // Placeholder: Logic for refunding points
    // This should be transactional with the status update
    // Fetch user again to ensure fresh points balance before refunding
    const userForRefund = await findUserById(booking.GuestUserID); // Use GuestUserID from booking
    if (userForRefund) {
      const pointsToRefund = booking.TotalPrice;
      const newBalance = userForRefund.PointsBalance + pointsToRefund;
      await updateUserPoints(userForRefund.UserID, newBalance); // Use UserID from userForRefund
      console.log(`[Bookings Route PUT /:id/cancel] Points ${pointsToRefund} refunded to user ${userForRefund.UserID}. New balance: ${newBalance}`);

      // Log points transaction for refund
      try {
        // Fetch property title for description - might already have `propertyOfBooking` if fetched earlier for auth
        let propertyTitle = 'Unknown Property';
        const relatedProperty = await getPropertyDetails(booking.PropertyID);
        if (relatedProperty) propertyTitle = relatedProperty.Title;

        await createTransaction({
          user_id: userForRefund.UserID,
          type: 'refund_cancellation',
          amount: pointsToRefund, // Positive for refund
          related_booking_id: booking.BookingID, // Corrected: booking.BookingID
          description: `Cancelled booking for property: ${propertyTitle}`
        });
      } catch (transactionError) {
        console.error('[Bookings Route PUT /:id/cancel] Error logging points transaction for refund:', transactionError.message);
        // Non-critical for the cancellation itself
      }
      return c.json({ message: 'Booking cancelled successfully and points refunded.', booking: updatedBooking, newPointsBalance: newBalance });
    } else {
        console.error(`[Bookings Route PUT /:id/cancel] User ${booking.GuestUserID} not found for points refund.`);
        return c.json({ message: 'Booking cancelled, but points refund failed (user not found).', booking: updatedBooking });
    }

  } catch (error) {
    console.error(`[Bookings Route PUT /:id/cancel] Error for ID ${c.req.param('id')}:`, error.message);
    return c.json({ error: 'Failed to cancel booking', details: error.message }, 500);
  }
});


export default bookings;
