# Airbnb Clone - Full Stack Application

A full-featured Airbnb clone built with Next.js, Express.js, MongoDB, and TypeScript. This application includes user authentication, property listings, booking management, and a modern responsive UI.

## 🚀 Features

### User Management
- ✅ User registration and authentication
- ✅ JWT-based secure authentication
- ✅ User profiles with avatar upload
- ✅ Host and guest roles

### Property Listings
- ✅ Create, edit, and delete listings
- ✅ Image upload and gallery
- ✅ Search and filtering functionality
- ✅ Property types and amenities
- ✅ Rating and review system

### Booking System
- ✅ Calendar-based booking
- ✅ Availability checking
- ✅ Price calculation with fees
- ✅ Booking status management
- ✅ Host and guest booking views

### Modern UI/UX
- ✅ Responsive design with Tailwind CSS
- ✅ Interactive image galleries
- ✅ Loading states and animations
- ✅ Toast notifications
- ✅ Mobile-friendly navigation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **React DatePicker** - Date selection
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Modern icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin requests

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd airbnb-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Database
MONGODB_URI=mongodb://localhost:27017/airbnb-clone

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 5. Run the Application

Start both the backend and frontend:

```bash
# Terminal 1 - Start the backend server
npm run server:dev

# Terminal 2 - Start the Next.js frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
airbnb-clone/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── listings/          # Listing pages
│   └── bookings/          # Booking pages
├── components/            # Reusable React components
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   ├── ListingCard.tsx
│   ├── BookingCard.tsx
│   └── ...
├── context/              # React context providers
│   └── AuthContext.tsx
├── server/               # Express.js backend
│   ├── index.js         # Server entry point
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── uploads/         # File uploads directory
├── public/              # Static assets
└── README.md
```

## 🔧 Available Scripts

```bash
# Frontend development
npm run dev              # Start Next.js development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Backend development
npm run server          # Start Express server (production)
npm run server:dev      # Start Express server (development with nodemon)
```

## 🌟 Key Features Walkthrough

### User Authentication
1. Register a new account or login with existing credentials
2. JWT tokens are stored securely for session management
3. Protected routes require authentication

### Creating Listings
1. Navigate to "Become a Host" after logging in
2. Fill out the property details form
3. Upload multiple images for your listing
4. Set pricing and availability

### Booking Process
1. Search for properties using filters
2. Select dates and number of guests
3. View detailed pricing breakdown
4. Confirm booking (requires authentication)

### Host Management
1. View and manage your listings
2. Accept or decline booking requests
3. Update property information

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- File upload restrictions
- CORS configuration

## 🎨 UI/UX Features

- Fully responsive design
- Modern Airbnb-inspired interface
- Smooth animations and transitions
- Loading states and error handling
- Interactive image galleries
- Mobile-optimized navigation

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Railway/Heroku)
1. Create a new project on your hosting platform
2. Connect your GitHub repository
3. Set environment variables
4. Deploy the backend service

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Set up a new cluster
3. Update the MONGODB_URI in your environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file
- For MongoDB Atlas, ensure your IP is whitelisted

**Port Already in Use**
- Change the PORT in your .env file
- Kill the process using the port: `lsof -ti:3000 | xargs kill`

**Module Not Found Errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Image Upload Issues**
- Ensure the server/uploads directory exists
- Check file permissions
- Verify multer configuration

## 📧 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Future Enhancements

- Real-time messaging between hosts and guests
- Payment integration (Stripe)
- Advanced search with map integration
- Email notifications
- Advanced analytics dashboard
- Mobile app with React Native
- Multi-language support
- Social media authentication

---

**Happy Hosting! 🏠✨**