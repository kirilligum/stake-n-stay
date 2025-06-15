# Stake 'n' Stay (SNS)

Stake 'n' Stay is a simplified Airbnb clone where an admin acts as the host and
users can book stays using a point system. This project is built with Deno for
the backend and React (with Vite) for the frontend.

**Current Status:** All core backend logic is implemented with in-memory data
storage. The frontend is set up with basic routing and placeholder pages.

## Prerequisites

- **Deno:** Ensure Deno is installed. (See: https://deno.land/#installation)
- **Node.js and npm:** Required for the frontend build process (Vite/React).
  (See: https://nodejs.org/)

## Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd sns
   ```

2. **Build the frontend:** This command installs frontend dependencies and then
   builds the static assets into the `sns/public` directory.
   ```bash
   deno task build-frontend
   ```
   _Alternatively, you can navigate to the `frontend` directory and run the
   build manually:_
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

## Running the Application

1. **Start the Deno backend server:** From the root `sns` directory:
   ```bash
   deno task dev
   ```
   Or, for more explicit permissions (adjust as necessary if new permissions are
   added later):
   ```bash
   deno run --allow-net --allow-read --allow-env main.ts
   ```
   The server will typically start on `http://localhost:8000`.

2. **Access the application:** Open your web browser and navigate to
   `http://localhost:8000`. You should see the basic React frontend.

## Implemented Use Cases & Features

### Backend (API Endpoints - all data is in-memory)

- **Users & Authentication:**
  - `POST /auth/signup`: Register a new user (first user becomes admin,
    subsequent users are guests with an initial point balance).
  - `POST /auth/login`: Log in an existing user, returns a JWT.
  - `POST /auth/logout`: (Placeholder, JWT logout is client-side).
  - `GET /api/users/me`: Get current logged-in user's details (requires JWT).
- **Listings (Properties):**
  - `POST /api/listings`: Admin creates a new listing (requires admin JWT).
  - `GET /api/listings`: Get all listings (public).
  - `GET /api/listings/:id`: Get a specific listing by ID (public).
  - `PUT /api/listings/:id`: Admin updates their own listing (requires admin JWT
    & ownership).
  - `DELETE /api/listings/:id`: Admin deletes their own listing (requires admin
    JWT & ownership).
- **Bookings:**
  - `POST /api/bookings`: Guest creates a booking for a listing (requires JWT,
    deducts points).
  - `GET /api/bookings/my-bookings`: Guest views their own bookings (requires
    JWT).
  - `PATCH /api/bookings/:booking_id/cancel`: Guest or Listing Admin cancels a
    booking (requires JWT, refunds points).
  - `GET /api/listings/:listing_id/bookings`: Listing Admin views bookings for
    their listing (requires admin JWT & ownership).
- **Point System:**
  - `GET /api/points/history`: User views their point transaction history
    (requires JWT).
  - `POST /api/points/grant`: Admin grants points to a user (requires admin
    JWT).
  - `GET /api/users/:target_user_id/points/history`: Admin views a specific
    user's point history (requires admin JWT).

### Frontend (Navigable Shell)

- **Basic Pages:** Home, Listings, Login, Sign Up - accessible via the Navbar.
- **Client-Side Routing:** Implemented with `react-router-dom`.
- **Build Process:** Vite compiles React code into static assets served by Deno.

## Development Notes

- **Data Persistence:** All data (users, listings, bookings, points) is
  currently stored in-memory and will be lost when the server stops. A database
  integration (e.g., SQLite, PostgreSQL) is a future step.
- **Admin User:** The first user to sign up via the API (`/auth/signup`) is
  automatically designated as an admin.
- **Frontend Development:** To work on the frontend with live reloading:
  ```bash
  cd frontend
  npm run dev
  ```
  This will typically start a Vite development server on a different port (e.g.,
  `http://localhost:5173`). API requests from this dev server would need to be
  proxied to the Deno backend at `http://localhost:8000`. (Vite proxy config is
  not yet set up).

```
```
