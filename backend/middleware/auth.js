import jwt from 'jsonwebtoken';
import dbConfig from '../config/db.js'; // Assuming JWT_SECRET is here

const JWT_SECRET = dbConfig.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Backend cannot operate securely.");
  // In a real app, you might want to throw an error or exit if the secret is missing
}

export const verifyToken = (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'No token provided', message: 'Authorization header is missing.' }, 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return c.json({ error: 'Invalid token format', message: 'Token must be in "Bearer <token>" format.' }, 401);
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set('jwtPayload', decoded); // Make payload available on context (e.g., c.get('jwtPayload'))
    // console.log('Token verified, payload:', decoded);
    return next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error('JWT verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return c.json({ error: 'Token expired', message: error.message }, 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return c.json({ error: 'Invalid token', message: error.message }, 401);
    }
    return c.json({ error: 'Failed to authenticate token', message: 'An unexpected error occurred during token verification.' }, 500);
  }
};

// Optional: Middleware to check for specific roles if needed in the future
// export const authorizeRole = (roles) => {
//   return (c, next) => {
//     const payload = c.get('jwtPayload');
//     if (!payload || !payload.Role || !roles.includes(payload.Role)) {
//       return c.json({ error: 'Forbidden', message: 'You do not have the required role to access this resource.' }, 403);
//     }
//     return next();
//   };
// };
