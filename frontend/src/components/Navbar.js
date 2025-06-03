import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  // Basic inline styles
  const navStyle = {
    background: '#333',
    color: '#fff',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    margin: '0 10px',
  };
  const userInfoStyle = {
    marginRight: '20px',
  };
   const buttonStyle = {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  };


  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/properties" style={linkStyle}>Properties</Link> {/* Link to Property List */}
      </div>
      <div>
        {isAuthenticated ? (
          <>
            {user && (
              <span style={userInfoStyle}>
                Welcome, {user.Username}!
                {typeof user.PointsBalance !== 'undefined' && (
                  <span style={{marginLeft: '10px', borderLeft: '1px solid #555', paddingLeft: '10px'}}>
                    Points: {user.PointsBalance}
                  </span>
                )}
              </span>
            )}
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/my-bookings" style={linkStyle}>My Bookings</Link>
            <Link to="/create-property" style={linkStyle}>Create Listing</Link>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
