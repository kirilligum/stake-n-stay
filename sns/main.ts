import { Application, send } from "./deps.ts"; // Import send
import authRouter from "./routes/auth.ts";
import userRouter from "./routes/user.ts";
import listingRouter from "./routes/listing.ts";
import bookingRouter from "./routes/booking.ts";
import pointRouter from "./routes/point.ts"; // Import the new point router

const app = new Application();

// Logger middleware (simple)
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Use routes
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(userRouter.routes());
app.use(userRouter.allowedMethods());

app.use(listingRouter.routes());
app.use(listingRouter.allowedMethods());

app.use(bookingRouter.routes());
app.use(bookingRouter.allowedMethods());

app.use(pointRouter.routes());
app.use(pointRouter.allowedMethods());

// Static file serving middleware
app.use(async (ctx, next) => {
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch (e) {
    if (e.name === "NotFound" || e.status === 404) { // Oak's send might throw different error types
      await next();
    } else {
      console.error(`Error in static file middleware: ${e.name} - ${e.message}`);
      throw e;
    }
  }
});

// SPA catch-all for GET requests
app.use(async (ctx, next) => {
  if (ctx.request.method === "GET" && !ctx.response.body && ctx.request.accepts("html") && !ctx.request.url.pathname.startsWith("/api")) {
    try {
      await send(ctx, "/index.html", {
        root: `${Deno.cwd()}/public`,
      });
    } catch (e) {
      console.error("Error serving SPA index.html:", e);
      // Let Oak handle the error response if index.html is truly not found or other error occurs
      if (e.name === "NotFound" || e.status === 404) {
          ctx.response.status = 404;
          ctx.response.body = "SPA Fallback: index.html not found.";
      } else {
          throw e;
      }
    }
  } else {
      await next(); // If not a GET request for HTML or if an API route was already matched, or if body already set.
  }
});

const port = 8000;
console.log(`Server listening on http://localhost:${port}`);

app.addEventListener("error", (evt) => {
  console.error("APP ERROR:", evt.error);
});

await app.listen({ port });
