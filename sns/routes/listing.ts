import { Router } from "../deps.ts";
import {
    createListing,
    getListings,
    getListingById,
    updateListing,
    deleteListing
} from "../handlers/listing.ts";
import { authMiddleware, adminRequiredMiddleware } from "../middleware/auth.ts";

const router = new Router();

// POST /api/listings - Create a new listing (Admin only)
router.post(
    "/api/listings",
    authMiddleware,       // First, ensure user is authenticated
    adminRequiredMiddleware, // Then, ensure user is an admin
    createListing         // Finally, handle listing creation
);

// GET /api/listings - Get all listings (Public)
router.get("/api/listings", getListings);

// GET /api/listings/:id - Get a specific listing by ID (Public)
router.get("/api/listings/:id", getListingById);

// PUT /api/listings/:id - Update a specific listing (Admin who owns it)
router.put(
    "/api/listings/:id",
    authMiddleware,
    adminRequiredMiddleware, // Ensures user is an admin; ownership is checked in handler
    updateListing
);

// DELETE /api/listings/:id - Delete a specific listing (Admin who owns it)
router.delete(
    "/api/listings/:id",
    authMiddleware,
    adminRequiredMiddleware, // Ensures user is an admin; ownership is checked in handler
    deleteListing
);

export default router;
