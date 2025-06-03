import { Hono } from 'hono';
import { sign, verify, decode } from 'hono/jwt';
import { BearerAuth } from 'hono/bearer-auth';

// This JWT_SECRET should ideally be from environment variables or a shared config
const JWT_SECRET = "your-super-secret-key";

// --- Main App ---
const app = new Hono().basePath('/api');

// --- Auth App ---
const authApp = new Hono();
const secureApp = new Hono(); // For routes under /auth that need JWT verification

// Mock user data (moved here, will be specific to authApp)
const MOCK_USERS = [
  { id: "mock-user-id-1", email: "test@example.com", password: "password", role: "user" },
  { id: "mock-admin-id-1", email: "admin@example.com", password: "adminpassword", role: "admin" } // Added admin user
];

// --- Authentication Middleware for secureApp (protects /auth/me) ---
secureApp.use('*', BearerAuth({ secret: JWT_SECRET }));

secureApp.get('/me', (c) => {
  const payload = c.get('jwtPayload');
  if (!payload) {
    return c.json({ error: "Payload not found" }, 500);
  }
  return c.json({ user: payload });
});

// Mount secureApp onto authApp for /auth/me
authApp.route('/me', secureApp); // So full path is /api/auth/me

// --- Public Auth Routes ---
authApp.post('/register', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Log the received data (replace with database saving later)
    console.log('Registration attempt for email:', email);

    // Mock: Check if user already exists
    if (MOCK_USERS.find(user => user.email === email)) {
      return c.json({ error: 'User already exists' }, 409); // 409 Conflict
    }

    // Mock: "Save" the new user (in a real app, hash the password)
    const newUser = { id: `mock-user-id-${MOCK_USERS.length + 1}`, email, password, role: "user" }; // Default role "user"
    MOCK_USERS.push(newUser);
    console.log('New user registered (mock):', { id: newUser.id, email: newUser.email, role: newUser.role });

    return c.json({ message: 'User registered successfully (mock)', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Invalid request body or server error' }, 400);
  }
});

authApp.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Mock user lookup
    const user = MOCK_USERS.find(u => u.email === email);

    if (!user) {
      return c.json({ error: 'Invalid credentials - user not found' }, 401); // 401 Unauthorized
    }

    // Mock password check
    if (user.password !== password) {
      return c.json({ error: 'Invalid credentials - password incorrect' }, 401); // 401 Unauthorized
    }

    // Log successful login
    console.log('Login successful for user:', email);

    // Sign the JWT
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role, // Add other relevant user info
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
    };
    const token = await sign(payload, JWT_SECRET);

    return c.json({ message: 'Login successful', token: token });
  } catch (error) {
    console.error('Login error:', error.message);
    return c.json({ error: 'Invalid request body or server error' }, 400);
  }
});

// Mount authApp onto the main app
app.route('/auth', authApp);

// --- Properties App ---
import propertiesApp from '../properties/[[route]]'; // Import from the properties directory
app.route('/properties', propertiesApp); // Mounts under /api/properties

export default app;
