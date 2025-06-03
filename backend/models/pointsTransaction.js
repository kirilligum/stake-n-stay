// backend/models/pointsTransaction.js
import { Pool } from 'pg';
import dbConfig from '../config/db.js';

let pool;
if (process.env.NODE_ENV !== 'test') {
  pool = new Pool(dbConfig);
}

/**
 * Creates a new points transaction in the database.
 * @param {object} transactionData - Data for the new transaction.
 *  Includes user_id, type (e.g., 'earn_signup', 'spend_booking', 'refund_cancellation'),
 *  amount (can be positive for earning, negative for spending),
 *  related_booking_id (optional), related_property_id (optional), description.
 * @returns {Promise<object>} The newly created transaction object.
 */
async function createTransaction(transactionData) {
  const {
    user_id,
    type,
    amount,
    related_booking_id = null,
    related_property_id = null, // Added for future use, e.g. property owner bonus
    description = null,
  } = transactionData;

  console.log(`[PointsTransaction Model] Attempting to create transaction for user ${user_id}: ${type}, amount ${amount}`);
  if (!pool) {
    console.warn('[PointsTransaction Model] DB pool not initialized. Returning placeholder.');
    return {
      TransactionID: Date.now(),
      UserID: user_id,
      Type: type,
      Amount: amount,
      RelatedBookingID: related_booking_id,
      RelatedPropertyID: related_property_id,
      Description: description,
      TransactionDate: new Date().toISOString(),
    };
  }

  const query = `
    INSERT INTO PointsTransactions (
      UserID, BookingID, PointsChanged, TransactionType, Description, RelatedPropertyID
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  // Mapping our more generic 'type' and 'amount' to schema's 'TransactionType' and 'PointsChanged'
  const values = [
    user_id,
    related_booking_id,
    amount, // PointsChanged
    type,   // TransactionType
    description,
    related_property_id
  ];

  try {
    const result = await pool.query(query, values);
    console.log('[PointsTransaction Model] Transaction created successfully:', result.rows[0].TransactionID);
    return result.rows[0];
  } catch (error) {
    console.error('[PointsTransaction Model] Error creating transaction:', error);
    // Consider specific error codes, e.g., foreign key violation if user_id doesn't exist
    throw error;
  }
}

export { createTransaction };
