import { users } from "./auth.ts"; // To update user balances
import { v4 as uuidv4 } from "https://deno.land/std@0.208.0/uuid/mod.ts";

export interface PointTransaction {
  id: string;
  user_id: number; // Assuming user_id is a number as in the users array
  booking_id?: string | null; // Optional, used if related to a booking
  points_amount: number; // Positive for credit, negative for debit
  transaction_type: 'booking_payment' | 'booking_refund' | 'admin_grant' | 'initial_balance' | 'other';
  description: string;
  created_at: string;
}

// In-memory store for point transactions
export const point_transactions_db: PointTransaction[] = [];

export function addPointTransaction(
  user_id: number,
  points_amount: number,
  transaction_type: PointTransaction['transaction_type'],
  related_booking_id: string | null = null,
  description: string
): PointTransaction | null {
  const user = users.find(u => u.id === user_id);

  if (!user) {
    console.error(`User with ID ${user_id} not found. Cannot add point transaction.`);
    return null;
  }

  // Update user's balance
  // Ensure points_balance exists, initialize if not (though it should be by signup)
  if (user.points_balance === undefined) {
      user.points_balance = 0;
  }
  user.points_balance += points_amount;

  const newTransaction: PointTransaction = {
    id: uuidv4.generate(),
    user_id,
    booking_id: related_booking_id,
    points_amount,
    transaction_type,
    description,
    created_at: new Date().toISOString(),
  };

  point_transactions_db.push(newTransaction);
  console.log("Point Transactions DB:", point_transactions_db); // For debugging
  console.log(`User ${user.username} new balance after transaction: ${user.points_balance}`);

  return newTransaction;
}

export async function getMyPointTransactions(ctx: Context) {
  try {
    const user = ctx.state.user as any;
    if (!user || !user.user_id) {
      ctx.response.status = 401;
      ctx.response.body = { error: "User not authenticated properly." };
      return;
    }

    const userTransactions = point_transactions_db.filter(pt => pt.user_id === user.user_id);
    ctx.response.status = 200;
    ctx.response.body = { transactions: userTransactions };

  } catch (error) {
    console.error("Get MyPointTransactions error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}

export async function grantPointsToUser(ctx: Context) {
  try {
    const adminUser = ctx.state.user as any; // Admin status already checked by middleware

    const body = ctx.request.body({ type: "json" });
    const { target_user_id, points_to_grant, description } = await body.value;

    if (target_user_id === undefined || points_to_grant === undefined) {
      ctx.response.status = 400;
      ctx.response.body = { error: "target_user_id and points_to_grant are required." };
      return;
    }

    if (typeof points_to_grant !== 'number' || points_to_grant <= 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "points_to_grant must be a positive number." };
      return;
    }

    const targetUser = users.find(u => u.id === Number(target_user_id));
    if (!targetUser) {
      ctx.response.status = 404;
      ctx.response.body = { error: `User with ID ${target_user_id} not found.` };
      return;
    }

    const grantDescription = description || `Admin grant by ${adminUser.username} (ID: ${adminUser.user_id})`;

    const transaction = addPointTransaction(
      Number(target_user_id),
      points_to_grant,
      'admin_grant',
      null,
      grantDescription
    );

    if (transaction) {
      ctx.response.status = 200;
      ctx.response.body = {
        message: "Points granted successfully.",
        transaction,
        target_user_new_balance: users.find(u => u.id === Number(target_user_id))?.points_balance
      };
    } else {
      ctx.response.status = 500; // Should be caught by addPointTransaction if user not found, but as a fallback.
      ctx.response.body = { error: "Failed to grant points." };
    }
  } catch (error) {
    console.error("GrantPointsToUser error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error during point grant." };
     if (error instanceof TypeError && error.message.includes("Cannot destructure property")) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body. Expected JSON with target_user_id and points_to_grant." };
    }
  }
}


export async function getUserPointTransactions(ctx: Context) {
  try {
    // Admin status checked by middleware
    const { target_user_id } = ctx.params;
    if (!target_user_id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "target_user_id parameter is required." };
        return;
    }

    const userIdNum = Number(target_user_id);
    if (isNaN(userIdNum)) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid target_user_id format." };
        return;
    }

    const targetUser = users.find(u => u.id === userIdNum);
    if (!targetUser) {
      ctx.response.status = 404;
      ctx.response.body = { error: `User with ID ${userIdNum} not found.` };
      return;
    }

    const userTransactions = point_transactions_db.filter(pt => pt.user_id === userIdNum);
    ctx.response.status = 200;
    ctx.response.body = { user_id: userIdNum, username: targetUser.username, transactions: userTransactions };

  } catch (error) {
    console.error("GetUserPointTransactions error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error." };
  }
}
