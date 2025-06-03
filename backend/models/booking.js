// backend/models/booking.js
import { Pool } from 'pg';
import dbConfig from '../config/db.js';

let pool;
if (process.env.NODE_ENV !== 'test') {
  pool = new Pool(dbConfig);
}

/**
 * Checks if a property is available for booking during the given dates.
 * @param {number} propertyId - The ID of the property.
 * @param {string} startDate - The check-in date (YYYY-MM-DD).
 * @param {string} endDate - The check-out date (YYYY-MM-DD).
 * @param {number|null} excludeBookingId - Optional: A booking ID to exclude from the check (for updates).
 * @returns {Promise<boolean>} True if available, false otherwise.
 */
async function isPropertyAvailable(propertyId, startDate, endDate, excludeBookingId = null) {
  console.log(`[Booking Model] Checking availability for property ${propertyId} from ${startDate} to ${endDate}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Assuming available (placeholder).');
    return true; // Placeholder for environments without a DB
  }

  // This query checks for overlapping bookings that are 'confirmed'.
  // It assumes that startDate and endDate are exclusive for the check-out day.
  // (i.e., a booking from 2023-01-01 to 2023-01-05 means the guest leaves on the 5th, so the 5th is available for a new check-in)
  // Adjust date logic if your interpretation of start/end dates is different.
  let query = `
    SELECT COUNT(*)
    FROM Bookings
    WHERE PropertyID = $1
      AND Status = 'confirmed'
      AND CheckInDate < $3 -- New booking's checkout date
      AND CheckOutDate > $2 -- New booking's checkin date
  `;
  const values = [propertyId, startDate, endDate];

  if (excludeBookingId) {
    query += ` AND BookingID != $${values.length + 1}`;
    values.push(excludeBookingId);
  }
  query += ';';

  try {
    const result = await pool.query(query, values);
    const count = parseInt(result.rows[0].count, 10);
    console.log(`[Booking Model] Found ${count} overlapping confirmed bookings.`);
    return count === 0; // Available if no overlapping confirmed bookings
  } catch (error) {
    console.error('[Booking Model] Error checking property availability:', error);
    throw error; // Or return false as a safety measure
  }
}

/**
 * Creates a new booking in the database.
 * @param {object} bookingData - Data for the new booking.
 *  Includes user_id, property_id, start_date, end_date, total_price (or total_points_charged), status.
 * @returns {Promise<object>} The newly created booking object.
 */
async function createBooking(bookingData) {
  const {
    user_id, property_id, check_in_date, check_out_date,
    total_price, // Or total_points_charged, adjust column name as per schema
    status = 'confirmed', // Default to confirmed, or 'pending' if payment/further steps needed
    number_of_guests = 1,
    special_requests = null
  } = bookingData;

  console.log(`[Booking Model] Attempting to create booking for user ${user_id} on property ${property_id}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Returning placeholder.');
    return {
      BookingID: Date.now(),
      GuestUserID: user_id,
      PropertyID: property_id,
      CheckInDate: check_in_date,
      CheckOutDate: check_out_date,
      TotalPrice: total_price,
      Status: status,
      NumberOfGuests: number_of_guests,
      BookingDate: new Date().toISOString()
    };
  }

  const query = `
    INSERT INTO Bookings (
      GuestUserID, PropertyID, CheckInDate, CheckOutDate, TotalPrice, Status, NumberOfGuests, SpecialRequests
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  // Ensure date format is 'YYYY-MM-DD' if your DB expects that. JS Date objects might need formatting.
  const values = [
    user_id, property_id, check_in_date, check_out_date, total_price,
    status, number_of_guests, special_requests
  ];

  try {
    const result = await pool.query(query, values);
    console.log('[Booking Model] Booking created successfully:', result.rows[0].BookingID);
    return result.rows[0];
  } catch (error) {
    console.error('[Booking Model] Error creating booking:', error);
    // Consider specific error codes, e.g., foreign key violation if user/property doesn't exist
    throw error;
  }
}

/**
 * Retrieves a single booking by its ID.
 * @param {number} id - The ID of the booking.
 * @returns {Promise<object|null>} The booking object or null if not found.
 */
async function getBookingById(id) {
  console.log(`[Booking Model] Attempting to get booking by ID: ${id}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Placeholder logic.');
    if (id === 1 || id === "1") return { BookingID: 1, GuestUserID: 1, PropertyID: 1, Status: 'confirmed' };
    return null;
  }

  // Consider joining with Users (Guest) and Properties for more complete info if needed often
  const query = 'SELECT * FROM Bookings WHERE BookingID = $1;';
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      console.log(`[Booking Model] Booking found by ID: ${id}`);
      return result.rows[0];
    }
    console.log(`[Booking Model] No booking found with ID: ${id}`);
    return null;
  } catch (error) {
    console.error('[Booking Model] Error getting booking by ID:', error);
    throw error;
  }
}

/**
 * Retrieves all bookings for a given user.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array<object>>} A list of bookings.
 */
async function getBookingsByUserId(userId) {
  console.log(`[Booking Model] Attempting to get bookings for user ID: ${userId}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Returning empty array.');
    return [];
  }
  // Join with Properties table to get property titles, images etc. for display
  const query = `
    SELECT b.*, p.Title as PropertyTitle, p.Images as PropertyImages
    FROM Bookings b
    JOIN Properties p ON b.PropertyID = p.PropertyID
    WHERE b.GuestUserID = $1
    ORDER BY b.CheckInDate DESC;
  `;
  try {
    const result = await pool.query(query, [userId]);
    console.log(`[Booking Model] Found ${result.rows.length} bookings for user ID: ${userId}`);
    return result.rows;
  } catch (error) {
    console.error('[Booking Model] Error getting bookings by user ID:', error);
    throw error;
  }
}

/**
 * Retrieves all bookings for a given property.
 * @param {number} propertyId - The ID of the property.
 * @returns {Promise<Array<object>>} A list of bookings.
 */
async function getBookingsByPropertyId(propertyId) {
  console.log(`[Booking Model] Attempting to get bookings for property ID: ${propertyId}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Returning empty array.');
    return [];
  }
   // Join with Users table to get guest information
  const query = `
    SELECT b.*, u.Username as GuestUsername, u.Email as GuestEmail
    FROM Bookings b
    JOIN Users u ON b.GuestUserID = u.UserID
    WHERE b.PropertyID = $1
    ORDER BY b.CheckInDate DESC;
  `;
  try {
    const result = await pool.query(query, [propertyId]);
    console.log(`[Booking Model] Found ${result.rows.length} bookings for property ID: ${propertyId}`);
    return result.rows;
  } catch (error) {
    console.error('[Booking Model] Error getting bookings by property ID:', error);
    throw error;
  }
}

/**
 * Updates the status of an existing booking.
 * @param {number} id - The ID of the booking to update.
 * @param {string} status - The new status (e.g., 'cancelled', 'confirmed', 'completed').
 * @returns {Promise<object|null>} The updated booking object or null if not found.
 */
async function updateBookingStatus(id, status) {
  console.log(`[Booking Model] Attempting to update booking ID: ${id} to status: ${status}`);
  if (!pool) {
    console.warn('[Booking Model] DB pool not initialized. Placeholder logic.');
    return { BookingID: id, Status: status };
  }

  const query = 'UPDATE Bookings SET Status = $1 WHERE BookingID = $2 RETURNING *;';
  try {
    const result = await pool.query(query, [status, id]);
    if (result.rows.length > 0) {
      console.log(`[Booking Model] Booking ID: ${id} status updated to ${status}.`);
      return result.rows[0];
    }
    console.log(`[Booking Model] Booking ID: ${id} not found for status update.`);
    return null;
  } catch (error) {
    console.error(`[Booking Model] Error updating booking status for ID: ${id}:`, error);
    throw error;
  }
}

export {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  getBookingsByPropertyId,
  updateBookingStatus,
  isPropertyAvailable,
};
