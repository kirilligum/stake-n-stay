// backend/models/user.js
import { Pool } from 'pg';
import dbConfig from '../config/db.js'; // We'll use this for actual DB connection later

// Placeholder for database connection pool
// In a real setup, you would initialize and manage this pool properly.
let pool;
if (process.env.NODE_ENV !== 'test') { // Avoid creating real connections during tests if not needed
  pool = new Pool(dbConfig);
}


/**
 * Creates a new user in the database.
 * @param {string} username - The user's username.
 * @param {string} email - The user's email.
 * @param {string} passwordHash - The user's hashed password.
 * @returns {Promise<object>} The newly created user object (or throws an error).
 */
async function createUser(username, email, passwordHash, firstName = null, lastName = null, role = 'user') {
  // This is a conceptual function. Actual implementation requires a DB connection.
  console.log(`[User Model] Attempting to create user: ${username}, ${email}`);
  if (!pool) {
    console.warn('[User Model] DB pool not initialized. Returning placeholder.');
    // Placeholder response for environments without a DB
    return { UserID: Date.now(), Username: username, Email: email, Role: role, PointsBalance: 0 };
  }

  const query = `
    INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING UserID, Username, Email, Role, RegistrationDate, PointsBalance;
  `;
  const values = [username, email, passwordHash, firstName, lastName, role];

  try {
    const result = await pool.query(query, values);
    if (result.rows.length > 0) {
      console.log(`[User Model] User ${username} created successfully.`);
      return result.rows[0];
    }
    throw new Error('User creation failed, no rows returned.');
  } catch (error) {
    console.error('[User Model] Error creating user:', error);
    // Check for unique constraint violation (example for PostgreSQL)
    if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_username_key') {
            throw new Error('Username already exists.');
        } else if (error.constraint === 'users_email_key') {
            throw new Error('Email already exists.');
        }
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Finds a user by their email address.
 * @param {string} email - The user's email.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
async function findUserByEmail(email) {
  console.log(`[User Model] Attempting to find user by email: ${email}`);
  if (!pool) {
    console.warn('[User Model] DB pool not initialized. Placeholder logic.');
    // Placeholder logic for environments without a DB
    if (email === "test@example.com") {
      return { UserID: 1, Username: "testuser", Email: email, PasswordHash: "hashed_password", Role: "user" };
    }
    return null;
  }

  const query = 'SELECT * FROM Users WHERE Email = $1;';
  try {
    const result = await pool.query(query, [email]);
    if (result.rows.length > 0) {
      console.log(`[User Model] User found by email: ${email}`);
      return result.rows[0];
    }
    console.log(`[User Model] No user found with email: ${email}`);
    return null;
  } catch (error) {
    console.error('[User Model] Error finding user by email:', error);
    throw error;
  }
}

/**
 * Finds a user by their username.
 * @param {string} username - The user's username.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
async function findUserByUsername(username) {
  console.log(`[User Model] Attempting to find user by username: ${username}`);
  if (!pool) {
    console.warn('[User Model] DB pool not initialized. Placeholder logic.');
    // Placeholder logic for environments without a DB
    if (username === "testuser") {
      return { UserID: 1, Username: username, Email: "test@example.com", PasswordHash: "hashed_password", Role: "user" };
    }
    return null;
  }

  const query = 'SELECT * FROM Users WHERE Username = $1;';
  try {
    const result = await pool.query(query, [username]);
    if (result.rows.length > 0) {
      console.log(`[User Model] User found by username: ${username}`);
      return result.rows[0];
    }
    console.log(`[User Model] No user found with username: ${username}`);
    return null;
  } catch (error) {
    console.error('[User Model] Error finding user by username:', error);
    throw error;
  }
}

/**
 * Finds a user by their ID.
 * @param {number} id - The user's ID.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
async function findUserById(id) {
  console.log(`[User Model] Attempting to find user by ID: ${id}`);
  if (!pool) {
    console.warn('[User Model] DB pool not initialized. Placeholder logic.');
    if (id === 1 || id === "1") { // Assuming ID 1 is a test user
      return { UserID: 1, Username: "testuser", Email: "test@example.com", PasswordHash: "hashed_password", Role: "user", PointsBalance: 1000 };
    }
    return null;
  }

  const query = 'SELECT UserID, Username, Email, Role, FirstName, LastName, RegistrationDate, LastLoginDate, ProfilePictureURL, ContactNumber, Address, PointsBalance FROM Users WHERE UserID = $1;'; // Exclude PasswordHash
  try {
    const result = await pool.query(query, [id]);
    if (result.rows.length > 0) {
      console.log(`[User Model] User found by ID: ${id}`);
      return result.rows[0];
    }
    console.log(`[User Model] No user found with ID: ${id}`);
    return null;
  } catch (error) {
    console.error('[User Model] Error finding user by ID:', error);
    throw error;
  }
}

/**
 * Updates a user's points balance.
 * @param {number} id - The user's ID.
 * @param {number} newBalance - The new points balance for the user.
 * @returns {Promise<object|null>} The updated user object (or just the points balance) or null if user not found.
 */
async function updateUserPoints(id, newBalance) {
  console.log(`[User Model] Attempting to update points for user ID: ${id} to ${newBalance}`);
  if (newBalance < 0) {
    throw new Error("Points balance cannot be negative.");
  }
  if (!pool) {
    console.warn('[User Model] DB pool not initialized. Placeholder logic for points update.');
    // Placeholder for testing
    const user = await findUserById(id); // Simulate fetching user
    if (user) {
        user.PointsBalance = newBalance;
        return { UserID: id, PointsBalance: newBalance };
    }
    return null;
  }

  const query = 'UPDATE Users SET PointsBalance = $1 WHERE UserID = $2 RETURNING UserID, Username, PointsBalance;';
  try {
    const result = await pool.query(query, [newBalance, id]);
    if (result.rows.length > 0) {
      console.log(`[User Model] Points updated for user ID: ${id}. New balance: ${newBalance}`);
      return result.rows[0];
    }
    console.log(`[User Model] User ID: ${id} not found for points update.`);
    return null;
  } catch (error) {
    console.error('[User Model] Error updating user points:', error);
    // Check for constraint violations, e.g., points cannot be negative if enforced by DB
    if (error.constraint === 'users_pointsbalance_check' && error.code === '23514') { // Example check constraint name
        throw new Error("Points balance cannot be negative (database constraint).");
    }
    throw error;
  }
}

export { createUser, findUserByEmail, findUserByUsername, findUserById, updateUserPoints };
