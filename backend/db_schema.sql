-- Users Table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL, -- Store hashed passwords, not plain text
    Email VARCHAR(255) UNIQUE NOT NULL,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    Role VARCHAR(50) NOT NULL DEFAULT 'user', -- e.g., 'user', 'admin', 'property_owner'
    RegistrationDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    LastLoginDate TIMESTAMP WITH TIME ZONE,
    ProfilePictureURL TEXT,
    ContactNumber VARCHAR(50),
    Address TEXT,
    PointsBalance INTEGER DEFAULT 0 CHECK (PointsBalance >= 0) -- Loyalty points
);

-- Properties Table
CREATE TABLE Properties (
    PropertyID SERIAL PRIMARY KEY,
    OwnerUserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE, -- Foreign Key to Users table
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Address TEXT NOT NULL,
    City VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL,
    PropertyType VARCHAR(100), -- e.g., 'Apartment', 'House', 'Villa'
    NumberOfRooms INTEGER,
    NumberOfBathrooms INTEGER,
    PricePerNight DECIMAL(10, 2) NOT NULL CHECK (PricePerNight > 0),
    AvailabilityStartDate DATE,
    AvailabilityEndDate DATE,
    Status VARCHAR(50) DEFAULT 'available', -- e.g., 'available', 'booked', 'maintenance'
    ListedDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    Amenities TEXT, -- Could be a JSONB or array of strings for better querying
    Images TEXT[] -- Array of URLs or paths to images
);

-- Bookings Table
CREATE TABLE Bookings (
    BookingID SERIAL PRIMARY KEY,
    GuestUserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE, -- Foreign Key to Users table
    PropertyID INTEGER NOT NULL REFERENCES Properties(PropertyID) ON DELETE CASCADE, -- Foreign Key to Properties table
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    TotalPrice DECIMAL(10, 2) NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'confirmed', 'cancelled', 'completed'
    BookingDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    NumberOfGuests INTEGER NOT NULL DEFAULT 1,
    SpecialRequests TEXT,
    CONSTRAINT chk_dates CHECK (CheckOutDate > CheckInDate)
);

-- PointsTransactions Table
-- Tracks changes to user loyalty points
CREATE TABLE PointsTransactions (
    TransactionID SERIAL PRIMARY KEY,
    UserID INTEGER NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
    BookingID INTEGER REFERENCES Bookings(BookingID) ON DELETE SET NULL, -- Optional: link points to a specific booking
    PointsChanged INTEGER NOT NULL, -- Can be positive (earned) or negative (spent)
    TransactionType VARCHAR(100) NOT NULL, -- e.g., 'booking_earned', 'referral_bonus', 'redeemed_for_discount'
    TransactionDate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    Description TEXT, -- Optional: more details about the transaction
    RelatedPropertyID INTEGER REFERENCES Properties(PropertyID) ON DELETE SET NULL -- Optional: if points are related to a specific property promotion
);

-- Indexes for frequently queried columns (examples)
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_properties_city ON Properties(City);
CREATE INDEX idx_properties_owner ON Properties(OwnerUserID);
CREATE INDEX idx_bookings_guest ON Bookings(GuestUserID);
CREATE INDEX idx_bookings_property ON Bookings(PropertyID);
CREATE INDEX idx_pointstransactions_user ON PointsTransactions(UserID);

-- It might be beneficial to add more specific constraints or indexes based on query patterns.
-- For example, ensuring that a user cannot book their own property (if that's a business rule)
-- or composite indexes for common filtering/sorting operations.
