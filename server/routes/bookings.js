const express = require('express');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is trying to book their own listing
    if (listing.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own listing' });
    }

    // Check if dates are available
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      listing: listingId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lte: checkInDate }, checkOut: { $gt: checkInDate } },
        { checkIn: { $lt: checkOutDate }, checkOut: { $gte: checkOutDate } },
        { checkIn: { $gte: checkInDate }, checkOut: { $lte: checkOutDate } }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Selected dates are not available' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;

    const booking = new Booking({
      listing: listingId,
      guest: req.user._id,
      host: listing.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      totalPrice,
      message
    });

    await booking.save();

    // Add booking to user and listing
    await User.findByIdAndUpdate(req.user._id, {
      $push: { bookings: booking._id }
    });

    await Listing.findByIdAndUpdate(listingId, {
      $push: { bookings: booking._id }
    });

    await booking.populate([
      { path: 'listing', select: 'title images location price' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('listing', 'title images location price')
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get host's bookings
router.get('/host-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('listing', 'title images location price')
      .populate('guest', 'name avatar email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get host bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only host can confirm/cancel bookings, only guest can cancel their own bookings
    if (booking.host.toString() !== req.user._id.toString() && 
        !(booking.guest.toString() === req.user._id.toString() && status === 'cancelled')) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    await booking.populate([
      { path: 'listing', select: 'title images location price' },
      { path: 'guest', select: 'name email avatar' },
      { path: 'host', select: 'name email avatar' }
    ]);

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title images location price amenities')
      .populate('guest', 'name email avatar phone')
      .populate('host', 'name email avatar phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.guest._id.toString() !== req.user._id.toString() && 
        booking.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;