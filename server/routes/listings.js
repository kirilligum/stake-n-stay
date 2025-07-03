const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/Listing');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all listings with optional filters
router.get('/', async (req, res) => {
  try {
    const { city, country, propertyType, minPrice, maxPrice, guests, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };
    
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (country) query['location.country'] = new RegExp(country, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (guests) query.maxGuests = { $gte: Number(guests) };

    const listings = await Listing.find(query)
      .populate('host', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('host', 'name avatar phone bio')
      .populate('reviews.user', 'name avatar');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new listing
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      address,
      city,
      country,
      propertyType,
      bedrooms,
      bathrooms,
      maxGuests,
      amenities
    } = req.body;

    const images = req.files.map(file => `/uploads/${file.filename}`);

    const listing = new Listing({
      title,
      description,
      price: Number(price),
      location: { address, city, country },
      images,
      propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      maxGuests: Number(maxGuests),
      amenities: Array.isArray(amenities) ? amenities : [amenities],
      host: req.user._id
    });

    await listing.save();

    // Add listing to user's listings
    await User.findByIdAndUpdate(req.user._id, {
      $push: { listings: listing._id },
      isHost: true
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('host', 'name avatar');

    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    // Remove listing from user's listings
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { listings: req.params.id }
    });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review to listing
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user already reviewed this listing
    const existingReview = listing.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this listing' });
    }

    listing.reviews.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });

    listing.rating = listing.calculateAverageRating();
    await listing.save();

    await listing.populate('reviews.user', 'name avatar');

    res.json(listing);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;