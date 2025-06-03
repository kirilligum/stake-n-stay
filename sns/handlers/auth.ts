import { bcrypt, Context, djwt } from "../deps.ts";
import { jwtKey } from "../config.ts";

// Temporary in-memory store for users
export const users: any[] = []; // Exported for booking handler
let userIdCounter = 1;

export async function signup(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const { username, email, password } = await body.value;

    // Basic validation
    if (!username || !email || !password) {
      ctx.response.status = 400; // Bad Request
      ctx.response.body = { error: "Username, email, and password are required." };
      return;
    }

    // Check for existing user
    if (users.some(user => user.username === username || user.email === email)) {
      ctx.response.status = 409; // Conflict
      ctx.response.body = { error: "Username or email already exists." };
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password);

    // Create and store user
    const newUser = {
      id: userIdCounter++,
      username,
      email,
      passwordHash, // Store hash, not plain password
      points_balance: 1000, // Initial points balance
    };
    users.push(newUser);

    console.log("Users:", users); // For debugging

    // Return success response (excluding passwordHash)
    const { passwordHash: _, ...userResponse } = newUser;
    ctx.response.status = 201; // Created
    ctx.response.body = { message: "User created successfully", user: userResponse };

  } catch (error) {
    console.error("Signup error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error during signup." };
    if (error instanceof TypeError && error.message.includes("Cannot destructure property")) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body. Expected JSON with username, email, and password." };
    }
  }
}

export async function login(ctx: Context) {
  try {
    const body = ctx.request.body({ type: "json" });
    const { email, username, password } = await body.value;

    if (!password || (!email && !username)) {
      ctx.response.status = 400; // Bad Request
      ctx.response.body = { error: "Password and either email or username are required." };
      return;
    }

    const user = users.find(u => u.email === email || u.username === username);

    if (!user) {
      ctx.response.status = 401; // Unauthorized
      ctx.response.body = { error: "Invalid credentials." };
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      const isAdmin = user.id === 1; // First user is admin

      // Ensure we get the latest points_balance from the users array, which is the authoritative source
      const authoritativeUser = users.find(u => u.id === user.id);
      const currentPointsBalance = authoritativeUser ? authoritativeUser.points_balance : user.points_balance;


      const payload: djwt.Payload = {
        user_id: user.id, // Ensure this is consistently named
        username: user.username,
        is_admin: isAdmin,
        points_balance: currentPointsBalance, // Use authoritative points balance
        // Set expiration to 1 hour from now
        exp: djwt.setExpiration(new Date().getTime() + 60000 * 60),
      };
      const header: djwt.Header = {
        alg: "HS256",
        typ: "JWT",
      };

      const token = await djwt.create(header, payload, jwtKey);

      ctx.response.status = 200; // OK
      ctx.response.body = {
        message: "Login successful",
        token,
        user: { id: user.id, username: user.username, email: user.email }
      };
    } else {
      ctx.response.status = 401; // Unauthorized
      ctx.response.body = { error: "Invalid credentials." };
    }

  } catch (error) {
    console.error("Login error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error during login." };
    if (error instanceof TypeError && error.message.includes("Cannot destructure property")) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body. Expected JSON." };
    }
  }
}

export async function logout(ctx: Context) {
  // For JWT, logout is primarily a client-side responsibility (deleting the token).
  // Server can provide a confirmation message.
  // If using refresh tokens or server-side session state, more complex logic would be here.
  ctx.response.status = 200;
  ctx.response.body = { message: "Logged out successfully" };
}
