import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import PropertyForm from './components/PropertyForm';
import MyBookings from './components/MyBookings'; // Import MyBookings
import './App.css';
import "react-datepicker/dist/react-datepicker.css"; // Import react-datepicker CSS

// Simple Home component
const Home = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Welcome to the Property Booking Platform</h1>
    <p>Your one-stop solution for finding and booking rental properties.</p>
    <p>
      <Link to="/properties" style={{ marginRight: '10px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Browse Properties</Link>
      {!localStorage.getItem('token') && ( // Rough check, AuthContext is better for real UI
        <>
          | <Link to="/login" style={{ margin: '0 10px', textDecoration: 'none', color: '#007bff' }}>Login</Link>
          or <Link to="/register" style={{ marginLeft: '5px', textDecoration: 'none', color: '#007bff' }}>Register</Link>
        </>
      )}
    </p>
  </div>
);

// Placeholder for a Dashboard component (to be protected)
const Dashboard = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>User Dashboard</h2>
    <p>This is a protected area. Only logged-in users can see this.</p>
    <p><Link to="/create-property">Create New Property Listing</Link></p>
    {/* Add more dashboard content here, like user's properties, bookings etc. */}
  </div>
);


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container" style={{ marginTop: '20px', padding: '0 15px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/properties" element={<PropertyList />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/create-property" element={<ProtectedRoute />}>
              <Route index element={<PropertyForm />} />
            </Route>
            <Route path="/properties/:id/edit" element={<ProtectedRoute />}>
              <Route index element={<PropertyForm />} />
            </Route>
            <Route path="/my-bookings" element={<ProtectedRoute />}>
              <Route index element={<MyBookings />} />
            </Route>

            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <p>Sorry, the page you are looking for does not exist.</p>
                <Link to="/">Go to Homepage</Link>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
