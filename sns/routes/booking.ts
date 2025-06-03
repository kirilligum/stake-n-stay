import { Router } from "../deps.ts";
import {
    createBooking,
    getGuestBookings,
    getListingBookings,
    cancelBooking
} from "../handlers/booking.ts";
import { authMiddleware, adminRequiredMiddleware } from "../middleware/auth.ts"; // adminRequiredMiddleware might not be strictly needed if handler logic is sufficient

const router = new Router();

// POST /api/bookings - Create a new booking (Authenticated users)
router.post(
    "/api/bookings",
    authMiddleware,
    createBooking
);

// GET /api/bookings/my-bookings - Get all bookings for the authenticated user
router.get(
    "/api/bookings/my-bookings",
    authMiddleware,
    getGuestBookings
);

// GET /api/listings/:listing_id/bookings - Get all bookings for a specific listing (Listing Admin only)
router.get(
    "/api/listings/:listing_id/bookings",
    authMiddleware, // Ensures user is logged in; handler checks if they are the admin of this specific listing
    getListingBookings
);

// PATCH /api/bookings/:booking_id/cancel - Cancel a booking (Guest or Listing Admin)
router.patch(
    "/api/bookings/:booking_id/cancel",
    authMiddleware, // Ensures user is logged in; handler checks if they are guest or listing admin
    cancelBooking
);

export default router;
