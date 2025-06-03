import { djwt, Context, Middleware } from "../deps.ts";
import { jwtKey } from "../config.ts";

export const authMiddleware: Middleware = async (ctx: Context, next) => {
  const authHeader = ctx.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401; // Unauthorized
    ctx.response.body = { error: "Authorization header is missing or malformed." };
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "No token provided." };
    return;
  }

  try {
    const payload = await djwt.verify(token, jwtKey);
    ctx.state.user = payload; // Attach user payload to context state
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    if (error instanceof djwt.errors.Expired) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Token has expired." };
    } else if (error instanceof djwt.errors.Invalid) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid token." };
    }
    else {
        ctx.response.status = 401; // Unauthorized
        ctx.response.body = { error: "Token verification failed." };
    }
  }
};

export const adminRequiredMiddleware: Middleware = async (ctx: Context, next) => {
  // This middleware should run AFTER authMiddleware, so ctx.state.user should be populated.
  if (!ctx.state.user || !(ctx.state.user as any).is_admin) {
    ctx.response.status = 403; // Forbidden
    ctx.response.body = { error: "Admin access required." };
    return;
  }
  await next();
};
