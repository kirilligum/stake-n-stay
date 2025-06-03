import { Hono } from 'hono';
import { BearerAuth } from 'hono/bearer-auth';

// This JWT_SECRET should ideally be from environment variables or a shared config
// For now, it's redefined here. Ensure it's the SAME as in api/[[route]].js
const JWT_SECRET = "your-super-secret-key";

const propertiesApp = new Hono().basePath('/api/properties'); // This basePath might be redundant if mounted correctly

// Mock Property Data
let MOCK_PROPERTIES = [
    { id: "prop1", name: "Cozy Beachfront Cottage", description: "A lovely cottage by the sea.", location: "Beachville", price_per_night_points: 100, owner_id: "mock-admin-id-1" },
    { id: "prop2", name: "Modern Downtown Apartment", description: "Sleek apartment in the city center.", location: "Cityburg", price_per_night_points: 150, owner_id: "mock-admin-id-1" }
];

// --- Middleware for checking admin role ---
const adminOnly = async (c, next) => {
  const payload = c.get('jwtPayload');
  if (!payload || payload.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  await next();
};

// --- Protected Endpoint: Create Property (Admin Only) ---
propertiesApp.post(
  '/',
  BearerAuth({ secret: JWT_SECRET }), // First, verify token
  adminOnly,                         // Then, check if admin
  async (c) => {
    try {
      const { name, description, location, price_per_night_points } = await c.req.json();
      const payload = c.get('jwtPayload');

      if (!name || !description || !location || price_per_night_points === undefined) {
        return c.json({ error: 'Missing required property fields' }, 400);
      }
      if (typeof price_per_night_points !== 'number' || price_per_night_points <= 0) {
          return c.json({ error: 'Price must be a positive number' }, 400);
      }

      const newProperty = {
        id: `prop${MOCK_PROPERTIES.length + 1}`,
        name,
        description,
        location,
        price_per_night_points,
        owner_id: payload.userId, // Set owner from admin's JWT
      };

      MOCK_PROPERTIES.push(newProperty);
      console.log('New property created by admin:', payload.email, newProperty);
      return c.json({ message: 'Property created successfully', property: newProperty }, 201);
    } catch (error) {
      console.error('Create property error:', error);
      return c.json({ error: 'Invalid request or server error' }, 400);
    }
  }
);

// --- Public Endpoint: View Properties ---
propertiesApp.get('/', async (c) => {
  return c.json({ properties: MOCK_PROPERTIES });
});

export default propertiesApp;
