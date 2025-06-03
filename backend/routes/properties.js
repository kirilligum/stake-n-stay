import { Hono } from 'hono';
import { verifyToken } from '../middleware/auth.js'; // Custom JWT middleware
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../models/property.js';

const properties = new Hono();

// POST /api/properties - Create a new property (Protected)
properties.post('/', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload', message: 'UserID is missing from token.' }, 403);
    }
    const owner_id = payload.UserID;

    const propertyData = await c.req.json();

    // Basic validation (can be expanded with a validation library)
    if (!propertyData.title || !propertyData.price_per_night || !propertyData.address || !propertyData.city || !propertyData.country) {
      return c.json({ error: 'Missing required fields', message: 'Title, price, address, city, and country are required.' }, 400);
    }
    if (isNaN(parseFloat(propertyData.price_per_night)) || parseFloat(propertyData.price_per_night) <= 0) {
        return c.json({ error: 'Invalid price', message: 'Price per night must be a positive number.' }, 400);
    }
    // Add more validation for other fields (rooms, bathrooms, type etc.)

    const newPropertyData = { ...propertyData, owner_id };
    const newProperty = await createProperty(newPropertyData);

    return c.json({ message: 'Property created successfully', property: newProperty }, 201);
  } catch (error) {
    console.error('[Properties Route POST /] Error:', error.message);
    return c.json({ error: 'Failed to create property', details: error.message }, 500);
  }
});

// GET /api/properties - Get all properties (Public)
properties.get('/', async (c) => {
  try {
    // Example: /api/properties?city=Lisbon&minPrice=50&maxPrice=200
    const filters = c.req.query(); // Gets all query parameters as an object
    const propertyList = await getAllProperties(filters);
    return c.json(propertyList);
  } catch (error) {
    console.error('[Properties Route GET /] Error:', error.message);
    return c.json({ error: 'Failed to retrieve properties', details: error.message }, 500);
  }
});

// GET /api/properties/:id - Get a single property by ID (Public)
properties.get('/:id', async (c) => {
  try {
    const { id } = c.req.param();
    if (isNaN(parseInt(id))) {
        return c.json({ error: 'Invalid property ID format' }, 400);
    }
    const property = await getPropertyById(parseInt(id));
    if (!property) {
      return c.json({ error: 'Property not found' }, 404);
    }
    return c.json(property);
  } catch (error) {
    console.error(`[Properties Route GET /:id] Error for ID ${c.req.param('id')}:`, error.message);
    return c.json({ error: 'Failed to retrieve property', details: error.message }, 500);
  }
});

// PUT /api/properties/:id - Update a property (Protected)
properties.put('/:id', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload', message: 'UserID is missing from token.' }, 403);
    }
    const userId = payload.UserID;
    const { id } = c.req.param();
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
        return c.json({ error: 'Invalid property ID format' }, 400);
    }

    // Fetch the property to check ownership
    const existingProperty = await getPropertyById(propertyId);
    if (!existingProperty) {
      return c.json({ error: 'Property not found' }, 404);
    }

    // Authorization: Check if the logged-in user owns the property
    if (existingProperty.OwnerUserID !== userId && payload.Role !== 'admin') { // Allow admin to update any
      return c.json({ error: 'Forbidden', message: 'You are not authorized to update this property.' }, 403);
    }

    const updateData = await c.req.json();
    // Add validation for updateData here
    if (updateData.price_per_night && (isNaN(parseFloat(updateData.price_per_night)) || parseFloat(updateData.price_per_night) <= 0)) {
        return c.json({ error: 'Invalid price', message: 'Price per night must be a positive number.' }, 400);
    }


    const updatedProperty = await updateProperty(propertyId, updateData);
    if (!updatedProperty) { // Should ideally not happen if getPropertyById found it, but good practice
        return c.json({ error: 'Property not found after update attempt, or no changes made.' }, 404);
    }
    return c.json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    console.error(`[Properties Route PUT /:id] Error for ID ${c.req.param('id')}:`, error.message);
    return c.json({ error: 'Failed to update property', details: error.message }, 500);
  }
});

// DELETE /api/properties/:id - Delete a property (Protected)
properties.delete('/:id', verifyToken, async (c) => {
  try {
    const payload = c.get('jwtPayload');
     if (!payload || !payload.UserID) {
      return c.json({ error: 'Invalid token payload', message: 'UserID is missing from token.' }, 403);
    }
    const userId = payload.UserID;
    const { id } = c.req.param();
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
        return c.json({ error: 'Invalid property ID format' }, 400);
    }

    // Fetch the property to check ownership
    const existingProperty = await getPropertyById(propertyId);
    if (!existingProperty) {
      return c.json({ error: 'Property not found' }, 404);
    }

    // Authorization: Check if the logged-in user owns the property
    if (existingProperty.OwnerUserID !== userId && payload.Role !== 'admin') { // Allow admin to delete any
      return c.json({ error: 'Forbidden', message: 'You are not authorized to delete this property.' }, 403);
    }

    const deletedResult = await deleteProperty(propertyId);
     if (!deletedResult) { // If deleteProperty returns null on not found
        return c.json({ error: 'Property not found or already deleted' }, 404);
    }

    return c.json({ message: `Property ${propertyId} deleted successfully` }, 200); // Or 204 No Content if preferred (no body)
  } catch (error) {
    console.error(`[Properties Route DELETE /:id] Error for ID ${c.req.param('id')}:`, error.message);
    return c.json({ error: 'Failed to delete property', details: error.message }, 500);
  }
});

export default properties;
