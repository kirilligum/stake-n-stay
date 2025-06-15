import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import AuthProvider
import { AuthProvider } from './contexts/AuthContext';

// Import Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ListingsPage from './pages/ListingsPage'; // Assuming this is a public page
import ListingDetailsPage from './pages/ListingDetailsPage'; // Assuming this is public
import CreateListingPage from './pages/CreateListingPage';
import UserProfilePage from './pages/UserProfilePage';
import SearchResultsPage from './pages/SearchResultsPage'; // Assuming this is public

// Import Common Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="app-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listing/:listingId" element={<ListingDetailsPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/create-listing" element={<CreateListingPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                {/* Add other routes that need protection here, e.g., /my-bookings */}
              </Route>

              {/* Catch-all or 404 Not Found route - Optional */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
