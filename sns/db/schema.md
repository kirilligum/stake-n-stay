# Stake 'n' Stay (SNS) Database Schema

This document outlines the database schema for the Stake 'n' Stay application.

## Entities

1. **User**
   - `user_id`: INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL (depending on DB)
   - `username`: TEXT NOT NULL UNIQUE
   - `password_hash`: TEXT NOT NULL
   - `email`: TEXT NOT NULL UNIQUE
   - `full_name`: TEXT
   - `is_admin`: BOOLEAN DEFAULT FALSE
   - `points_balance`: INTEGER DEFAULT 0
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. **Listing** (Properties/Accommodations)
   - `listing_id`: INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL
   - `admin_id`: INTEGER NOT NULL (Foreign Key to User.user_id)
   - `title`: TEXT NOT NULL
   - `description`: TEXT
   - `address`: TEXT
   - `price_per_night_points`: INTEGER NOT NULL
   - `max_guests`: INTEGER DEFAULT 1
   - `amenities`: TEXT (JSON array or comma-separated string)
   - `photos`: TEXT (JSON array of URLs)
   - `available_from`: DATE
   - `available_to`: DATE
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY (`admin_id`) REFERENCES `User`(`user_id`)

3. **Booking**
   - `booking_id`: INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL
   - `guest_id`: INTEGER NOT NULL (Foreign Key to User.user_id)
   - `listing_id`: INTEGER NOT NULL (Foreign Key to Listing.listing_id)
   - `check_in_date`: DATE NOT NULL
   - `check_out_date`: DATE NOT NULL
   - `num_guests`: INTEGER NOT NULL
   - `total_points_charged`: INTEGER NOT NULL
   - `status`: TEXT NOT NULL DEFAULT 'pending' -- e.g., 'pending', 'confirmed',
     'cancelled_by_guest', 'cancelled_by_host', 'completed'
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY (`guest_id`) REFERENCES `User`(`user_id`)
   - FOREIGN KEY (`listing_id`) REFERENCES `Listing`(`listing_id`)

4. **PointTransaction** (To track changes in points for auditability)
   - `transaction_id`: INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL
   - `user_id`: INTEGER NOT NULL (Foreign Key to User.user_id)
   - `booking_id`: INTEGER (Foreign Key to Booking.booking_id, NULLABLE)
   - `points_amount`: INTEGER NOT NULL -- (Positive for earning/credit, negative
     for spending/debit)
   - `transaction_type`: TEXT NOT NULL -- e.g., 'booking_payment',
     'booking_refund', 'admin_grant', 'initial_balance'
   - `description`: TEXT
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`)
   - FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`booking_id`)

## Relationships Summary

- A `User` can be an `admin` (host) or a guest.
- An `admin` `User` can have multiple `Listing`s.
- A guest `User` can make multiple `Booking`s.
- Each `Booking` is for one `Listing`.
- `PointTransaction`s track changes to a `User`'s `points_balance`. Transactions
  can be linked to a `Booking`.

## Notes

- Data types like `INTEGER PRIMARY KEY AUTOINCREMENT` are typical for SQLite.
  For PostgreSQL, `SERIAL PRIMARY KEY` would be used.
- `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` is a common way to automatically track
  creation/update times.
- Fields like `amenities` and `photos` are stored as TEXT (e.g., JSON strings).
  Depending on query needs, these could be normalized into separate tables.
- Added `num_guests` to `Booking` table.
- Added `available_from` and `available_to` to `Listing` table for basic
  availability. More complex availability might require a separate table.

```
```
