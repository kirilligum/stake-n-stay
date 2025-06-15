import { Context } from "../deps.ts";
import { v4 as uuidv4 } from "https://deno.land/std@0.208.0/uuid/mod.ts"; // For generating unique IDs

interface Listing {
  id: string;
  admin_id: number; // Assuming user_id from JWT payload is a number
  title: string;
  description: string;
  address: string; // Added address
  price_per_night_points: number;
  max_guests?: number; // Optional
  amenities?: string[]; // Optional
  photos?: string[]; // Optional
  created_at: string;
  updated_at: string;
}

// Temporary in-memory store for listings
export const listings_db: Listing[] = []; // Exported for booking handler
let listingIdCounter = 1; // Simple counter for now, consider UUID for more robustness

export async function createListing(ctx: Context) {
  try {
    const user = ctx.state.user as any; // Populated by authMiddleware
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const body = ctx.request.body({ type: "json" });
    const {
      title,
      description,
      price_per_night_points,
      address, // Added
      max_guests, // Added
      amenities, // Added
      photos, // Added
    } = await body.value;

    // Basic validation
    if (
      !title || !description || price_per_night_points === undefined || !address
    ) {
      ctx.response.status = 400; // Bad Request
      ctx.response.body = {
        error:
          "Title, description, address, and price_per_night_points are required.",
      };
      return;
    }
    if (
      typeof price_per_night_points !== "number" || price_per_night_points <= 0
    ) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Price per night must be a positive number.",
      };
      return;
    }

    const newListing: Listing = {
      id: uuidv4.generate(), // Generate a UUID for the listing
      admin_id: user.user_id,
      title,
      description,
      address,
      price_per_night_points,
      max_guests: max_guests || 1,
      amenities: amenities || [],
      photos: photos || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    listings_db.push(newListing);
    console.log("Listings DB:", listings_db); // For debugging

    ctx.response.status = 201; // Created
    ctx.response.body = {
      message: "Listing created successfully",
      listing: newListing,
    };
  } catch (error) {
    console.error("Create listing error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Internal server error during listing creation.",
    };
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot destructure property")
    ) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Invalid request body. Expected JSON with listing details.",
      };
    }
  }
}

export async function getListings(ctx: Context) {
  try {
    ctx.response.status = 200;
    ctx.response.body = { listings: listings_db };
  } catch (error) {
    console.error("Get listings error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}

export async function updateListing(ctx: Context) {
  try {
    const user = ctx.state.user as any;
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const { id } = ctx.params;
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Listing ID is required for update." };
      return;
    }

    const body = ctx.request.body({ type: "json" });
    const updates = await body.value;

    // Basic validation for updates
    if (Object.keys(updates).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "No update data provided." };
      return;
    }
    if (
      updates.price_per_night_points !== undefined &&
      (typeof updates.price_per_night_points !== "number" ||
        updates.price_per_night_points <= 0)
    ) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Price per night must be a positive number.",
      };
      return;
    }

    const listingIndex = listings_db.findIndex((l) => l.id === id);
    if (listingIndex === -1) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Listing not found." };
      return;
    }

    const listingToUpdate = listings_db[listingIndex];

    // Ownership check: Only the admin who created the listing can update it
    if (listingToUpdate.admin_id !== user.user_id) {
      ctx.response.status = 403; // Forbidden
      ctx.response.body = {
        error: "You are not authorized to update this listing.",
      };
      return;
    }

    // Apply updates - only allow certain fields to be updated
    const allowedUpdates = [
      "title",
      "description",
      "address",
      "price_per_night_points",
      "max_guests",
      "amenities",
      "photos",
    ];
    let updated = false;
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        (listingToUpdate as any)[key] = updates[key];
        updated = true;
      }
    }

    if (updated) {
      listingToUpdate.updated_at = new Date().toISOString();
    }

    listings_db[listingIndex] = listingToUpdate;
    console.log("Updated Listing:", listingToUpdate); // For debugging

    ctx.response.status = 200; // OK
    ctx.response.body = {
      message: "Listing updated successfully",
      listing: listingToUpdate,
    };
  } catch (error) {
    console.error("Update listing error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Internal server error during listing update.",
    };
    if (
      error instanceof TypeError &&
      error.message.includes("Cannot destructure property")
    ) {
      ctx.response.status = 400;
      ctx.response.body = {
        error: "Invalid request body. Expected JSON with listing details.",
      };
    }
  }
}

export async function deleteListing(ctx: Context) {
  try {
    const user = ctx.state.user as any;
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const { id } = ctx.params;
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Listing ID is required for deletion." };
      return;
    }

    const listingIndex = listings_db.findIndex((l) => l.id === id);

    if (listingIndex === -1) {
      ctx.response.status = 404; // Not Found
      ctx.response.body = { error: "Listing not found." };
      return;
    }

    // Ownership check: Only the admin who created the listing can delete it
    if (listings_db[listingIndex].admin_id !== user.user_id) {
      ctx.response.status = 403; // Forbidden
      ctx.response.body = {
        error: "You are not authorized to delete this listing.",
      };
      return;
    }

    listings_db.splice(listingIndex, 1);
    console.log("Listings DB after delete:", listings_db); // For debugging

    ctx.response.status = 204; // No Content
    // No body needed for 204
  } catch (error) {
    console.error("Delete listing error:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Internal server error during listing deletion.",
    };
  }
}

export async function getListingById(ctx: Context) {
  try {
    const { id } = ctx.params;
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Listing ID is required." };
      return;
    }

    const listing = listings_db.find((l) => l.id === id);

    if (listing) {
      ctx.response.status = 200;
      ctx.response.body = { listing };
    } else {
      ctx.response.status = 404; // Not Found
      ctx.response.body = { error: "Listing not found." };
    }
  } catch (error) {
    console.error("Get listing by ID error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}
