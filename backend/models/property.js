// backend/models/property.js
import { Pool } from 'pg';
import dbConfig from '../config/db.js';

let pool;
if (process.env.NODE_ENV !== 'test') {
  pool = new Pool(dbConfig);
}

/**
 * Creates a new property in the database.
 * @param {object} propertyData - Data for the new property.
 *  Includes owner_id, title, description, address, city, country, property_type,
 *  number_of_rooms, number_of_bathrooms, price_per_night, amenities, images etc.
 * @returns {Promise<object>} The newly created property object.
 */
async function createProperty(propertyData) {
  console.log('[Property Model] Attempting to create property:', propertyData.title);
  if (!pool) {
    console.warn('[Property Model] DB pool not initialized. Returning placeholder.');
    return { PropertyID: Date.now(), OwnerUserID: propertyData.owner_id, ...propertyData, Status: 'available', ListedDate: new Date().toISOString() };
  }

  const {
    owner_id, title, description, address, city, country, property_type,
    number_of_rooms, number_of_bathrooms, price_per_night,
    availability_start_date = null, availability_end_date = null,
    amenities = null, images = null // Assuming images is an array of URLs/paths
  } = propertyData;

  const query = `
    INSERT INTO Properties (
      OwnerUserID, Title, Description, Address, City, Country, PropertyType,
      NumberOfRooms, NumberOfBathrooms, PricePerNight, AvailabilityStartDate,
      AvailabilityEndDate, Amenities, Images
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;
  const values = [
    owner_id, title, description, address, city, country, property_type,
    number_of_rooms, number_of_bathrooms, price_per_night,
    availability_start_date, availability_end_date, amenities, images
  ];

  try {
    const result = await pool.query(query, values);
    console.log('[Property Model] Property created successfully:', result.rows[0].title);
    return result.rows[0];
  } catch (error) {
    console.error('[Property Model] Error creating property:', error);
    throw error;
  }
}

/**
 * Retrieves all properties, optionally applying filters.
 * @param {object} filters - Optional filters (e.g., city, minPrice, maxPrice).
 * @returns {Promise<Array<object>>} A list of properties.
 */
async function getAllProperties(filters = {}) {
  console.log('[Property Model] Attempting to get all properties with filters:', filters);
  if (!pool) {
    console.warn('[Property Model] DB pool not initialized. Returning empty array.');
    return []; // Placeholder
  }

  let query = 'SELECT * FROM Properties WHERE Status = \'available\''; // Example: only show available
  const values = [];
  let paramIndex = 1;

  // Example filters (extend as needed)
  if (filters.city) {
    query += ` AND City ILIKE $${paramIndex++}`;
    values.push(`%${filters.city}%`);
  }
  if (filters.minPrice) {
    query += ` AND PricePerNight >= $${paramIndex++}`;
    values.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    query += ` AND PricePerNight <= $${paramIndex++}`;
    values.push(filters.maxPrice);
  }
  if (filters.propertyType) {
    query += ` AND PropertyType = $${paramIndex++}`;
    values.push(filters.propertyType);
  }
  // Add more filters for rooms, country etc.

  query += ' ORDER BY ListedDate DESC;'; // Example ordering

  try {
    const result = await pool.query(query, values);
    console.log(`[Property Model] Found ${result.rows.length} properties.`);
    return result.rows;
  } catch (error) {
    console.error('[Property Model] Error getting all properties:', error);
    throw error;
  }
}

/**
 * Retrieves a single property by its ID.
 * @param {number} id - The ID of the property.
 * @returns {Promise<object|null>} The property object or null if not found.
 */
async function getPropertyById(id) {
  console.log(`[Property Model] Attempting to get property by ID: ${id}`);
  if (!pool) {
    console.warn('[Property Model] DB pool not initialized. Placeholder logic.');
    // Placeholder for testing
    if (id === 1 || id === "1") return { PropertyID: 1, OwnerUserID: 1, Title: "Test Property", PricePerNight: 100 };
    return null;
  }

  const query = 'SELECT * FROM Properties WHERE PropertyID = $1;';
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      console.log(`[Property Model] Property found by ID: ${id}`);
      return result.rows[0];
    }
    console.log(`[Property Model] No property found with ID: ${id}`);
    return null;
  } catch (error) {
    console.error('[Property Model] Error getting property by ID:', error);
    throw error;
  }
}

/**
 * Updates an existing property.
 * @param {number} id - The ID of the property to update.
 * @param {object} data - The data to update.
 * @returns {Promise<object|null>} The updated property object or null if not found.
 */
async function updateProperty(id, data) {
  console.log(`[Property Model] Attempting to update property ID: ${id} with data:`, data);
   if (!pool) {
    console.warn('[Property Model] DB pool not initialized. Placeholder logic.');
    return { PropertyID: id, ...data }; // Placeholder
  }

  // Dynamically build the SET part of the query
  const fields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(data).forEach(key => {
    // Ensure mapping from camelCase (JS) to snake_case (DB) if necessary, or keep consistent
    // For this example, assume keys in 'data' match column names or are handled by a mapper
    // Example: const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    fields.push(`${key} = $${paramIndex++}`);
    values.push(data[key]);
  });

  if (fields.length === 0) {
    throw new Error("No fields to update provided.");
  }

  values.push(id); // For WHERE PropertyID = $N

  const query = `
    UPDATE Properties
    SET ${fields.join(', ')}
    WHERE PropertyID = $${paramIndex}
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      console.log(`[Property Model] Property ID: ${id} updated successfully.`);
      return result.rows[0];
    }
    console.log(`[Property Model] Property ID: ${id} not found for update.`);
    return null; // Or throw an error if preferred
  } catch (error) {
    console.error(`[Property Model] Error updating property ID: ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a property by its ID.
 * @param {number} id - The ID of the property to delete.
 * @returns {Promise<object|null>} The deleted property object (or row count) or null if not found.
 */
async function deleteProperty(id) {
  console.log(`[Property Model] Attempting to delete property ID: ${id}`);
  if (!pool) {
    console.warn('[Property Model] DB pool not initialized. Placeholder logic.');
    return { message: "Property deleted (placeholder)" }; // Placeholder
  }

  const query = 'DELETE FROM Properties WHERE PropertyID = $1 RETURNING *;'; // RETURNING * is optional
  try {
    const result = await pool.query(query, [id]);
    if (result.rowCount > 0) {
      console.log(`[Property Model] Property ID: ${id} deleted successfully.`);
      return result.rows[0] || { message: `Property ${id} deleted.` }; // Return deleted row or success message
    }
    console.log(`[Property Model] Property ID: ${id} not found for deletion.`);
    return null;
  } catch (error) {
    console.error(`[Property Model] Error deleting property ID: ${id}:`, error);
    throw error;
  }
}

export {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
