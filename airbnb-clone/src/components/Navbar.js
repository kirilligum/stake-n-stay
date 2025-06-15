import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import './Navbar.css';

function Navbar() {
  const { currentUser, logout, loading } = useAuth(); // Get currentUser and logout from context
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Handle logout error (e.g., display a message to the user)
    }
  };

  // Optional: Show a loading state or nothing while auth is being determined
  if (loading) {
    return (
      <nav className="navbar">
        <Link to="/">
          <img className="navbar__logo" src="https://assets.stickpng.com/images/580b57fcd9996e24bc43c513.png" alt="Airbnb logo" />
        </Link>
        <div className="navbar__right">
          <p>Loading...</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link to="/">
        <img className="navbar__logo" src="https://assets.stickpng.com/images/580b57fcd9996e24bc43c513.png" alt="Airbnb logo" />
      </Link>

      <div className="navbar__search_placeholder">
        {/* Search bar will be implemented here */}
      </div>

      <div className="navbar__right">
        {/* Link to create listing - consider making this protected too */}
        {currentUser && <Link to="/create-listing" style={{marginRight: '10px'}}>Become a host</Link>}

        {currentUser ? (
          <>
            <span style={{marginRight: '10px'}}>Welcome, {currentUser.displayName || currentUser.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{marginRight: '10px'}}>Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
