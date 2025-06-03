import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserByUsername, updateUserPoints, findUserById } from '../models/user.js'; // Added updateUserPoints, findUserById
import { createTransaction } from '../models/pointsTransaction.js'; // Added createTransaction
// We will need JWT_SECRET, let's assume it's in db.js for now or a new auth.js config
import dbConfig from '../config/db.js'; // Assuming JWT_SECRET might be added here

const auth = new Hono();

// JWT Secret - Placeholder - In a real app, use an environment variable!
const JWT_SECRET = dbConfig.JWT_SECRET || 'your-very-secret-key-fallback';
if (!dbConfig.JWT_SECRET) {
    console.warn("JWT_SECRET is not defined in dbConfig, using fallback. THIS IS NOT SECURE FOR PRODUCTION.");
}

// Registration route
auth.post('/register', async (c) => {
  try {
    const { username, email, password, firstName, lastName } = await c.req.json();

    // Basic input validation
    if (!username || !email || !password) {
      return c.json({ error: 'Username, email, and password are required' }, 400);
    }
    if (password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Check if username or email already exists
    const existingUserByUsername = await findUserByUsername(username);
    if (existingUserByUsername) {
      return c.json({ error: 'Username already exists' }, 409); // 409 Conflict
    }
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
      return c.json({ error: 'Email already exists' }, 409);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new user
    // Note: createUser in user.js is conceptual and needs actual DB logic
    const newUserPlaceholder = await createUser(username, email, passwordHash, firstName, lastName);

    // --- Signup Bonus Logic ---
    let finalUserResponse = { ...newUserPlaceholder }; // Start with what createUser returned
    delete finalUserResponse.PasswordHash; // Ensure password hash is not in the final response

    if (newUserPlaceholder && newUserPlaceholder.UserID) { // Check if user creation was successful (UserID exists)
        const signupBonus = 100; // Define signup bonus points
        try {
            await updateUserPoints(newUserPlaceholder.UserID, signupBonus);
            console.log(`[Auth Route /register] Awarded ${signupBonus} signup bonus to user ${newUserPlaceholder.UserID}`);

            // Log signup bonus transaction
            await createTransaction({
                user_id: newUserPlaceholder.UserID,
                type: 'earn_signup',
                amount: signupBonus,
                description: 'Signup bonus'
            });

            // Fetch the complete user data to include the new points balance in the response
            const createdUserWithPoints = await findUserById(newUserPlaceholder.UserID);
            if (createdUserWithPoints) {
                 // Ensure password hash is not included from findUserById if it selected it (it shouldn't based on current model)
                const { PasswordHash, ...safeUser } = createdUserWithPoints;
                finalUserResponse = safeUser;
            } else {
                 finalUserResponse.PointsBalance = signupBonus; // Fallback if fetch fails, show at least the bonus
            }

        } catch (bonusError) {
            console.error(`[Auth Route /register] Error applying signup bonus for user ${newUserPlaceholder.UserID}:`, bonusError.message);
            // Don't fail registration if bonus fails, but log it.
            // The initial userResponse (without updated points) will be returned.
        }
    }
    // --- End Signup Bonus Logic ---

    return c.json({ message: 'User registered successfully', user: finalUserResponse }, 201);
  } catch (error) {
    console.error('[Auth Route /register] Error:', error.message);
    // Handle specific errors thrown by createUser (like DB connection issues or constraint violations)
    if (error.message.includes('already exists')) {
        return c.json({ error: error.message }, 409);
    }
    return c.json({ error: 'Registration failed', details: error.message }, 500);
  }
});

// Login route
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Basic input validation
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find the user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return c.json({ error: 'Invalid credentials (user not found)' }, 401);
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return c.json({ error: 'Invalid credentials (password mismatch)' }, 401);
    }

    // Generate a JWT
    const payload = {
      UserID: user.UserID,
      Username: user.Username,
      Role: user.Role, // Include role for potential frontend use
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    // Exclude password hash from the response
    const { PasswordHash, ...userResponse } = user;

    return c.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('[Auth Route /login] Error:', error.message);
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

export default auth;
