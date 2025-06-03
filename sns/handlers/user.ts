import { Context } from "../deps.ts";

export async function getMe(ctx: Context) {
  // ctx.state.user is populated by the authMiddleware
  if (ctx.state.user) {
    ctx.response.status = 200;
    ctx.response.body = { user: ctx.state.user };
  } else {
    // This case should ideally not be reached if authMiddleware is applied correctly
    ctx.response.status = 401;
    ctx.response.body = { error: "No user data found. Authentication required." };
  }
}
