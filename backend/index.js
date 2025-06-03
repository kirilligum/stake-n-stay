import { Hono } from 'hono'

import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import bookingRoutes from './routes/bookings.js';

const app = new Hono()

// Basic error handling
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

// Not Found handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found.' }, 404)
})

// Mount auth routes
app.route('/api/auth', authRoutes);

// Mount property routes
app.route('/api/properties', propertyRoutes);

// Mount booking routes
app.route('/api/bookings', bookingRoutes);

app.get('/', (c) => {
  return c.text('Hello World from Hono backend!')
})

// A simple health check route
app.get('/health', (c) => {
  return c.json({ status: 'ok', message: 'Backend is healthy' });
})

export default {
  port: process.env.PORT || 3001, // Make port configurable
  fetch: app.fetch,
}
