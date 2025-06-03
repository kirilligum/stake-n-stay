import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Using the configured axios instance
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // This will be updated to use a function from api.js e.g. api.getMyBookings()
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch your bookings.');
      console.error('Fetch bookings error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]); // Re-fetch if auth state changes, though typically only on load if already auth'd

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    try {
      // This will be updated to use a function from api.js e.g. api.cancelBooking(bookingId)
      await api.put(`/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully. Your points should be refunded if applicable.');
      // Refresh the list of bookings
      fetchBookings();
      // Potentially update user points in AuthContext if backend confirms refund details
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.');
      console.error('Cancel booking error:', err.response?.data || err.message);
    }
  };

  // Basic inline styles
  const containerStyle = { padding: '20px', maxWidth: '900px', margin: 'auto' };
  const bookingItemStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' // Allow wrapping for smaller screens
  };
  const detailsStyle = { flexGrow: 1, marginRight: '15px' };
  const titleStyle = { fontSize: '1.2em', fontWeight: 'bold', marginBottom: '5px' };
  const dateStyle = { color: '#555', marginBottom: '3px' };
  const statusStyle = (status) => ({
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    color: 'white',
    background: status === 'confirmed' ? '#28a745' : (status === 'cancelled' ? '#dc3545' : '#6c757d'),
    display: 'inline-block',
    marginTop: '5px'
  });
   const buttonStyle = (color = '#dc3545', disabled = false) => ({
    padding: '8px 12px',
    backgroundColor: disabled ? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    minWidth: '100px', // Ensure buttons have some width
    textAlign: 'center'
  });
  const propertyImageStyle = {
    width: '100px',
    height: '70px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '15px'
  };


  if (authLoading || loading) return <p style={{textAlign: 'center', padding: '20px'}}>Loading your bookings...</p>;

  if (!isAuthenticated && !authLoading) {
      return <p style={{color: 'red', textAlign: 'center', padding: '20px'}}>Please <Link to="/login">login</Link> to view your bookings.</p>;
  }

  if (error) return <p style={{color: 'red', textAlign: 'center', padding: '20px'}}>{error}</p>;

  return (
    <div style={containerStyle}>
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet. <Link to="/properties">Find a property to book!</Link></p>
      ) : (
        <div>
          {bookings.map((booking) => (
            <div key={booking.BookingID} style={bookingItemStyle}>
              <img
                src={booking.PropertyImages && booking.PropertyImages.length > 0 ? booking.PropertyImages[0] : 'https://via.placeholder.com/100x70.png?text=No+Image'}
                alt={booking.PropertyTitle || 'Property'}
                style={propertyImageStyle}
              />
              <div style={detailsStyle}>
                <h3 style={titleStyle}>{booking.PropertyTitle || 'Property Title Missing'}</h3>
                <p style={dateStyle}><strong>Check-in:</strong> {new Date(booking.CheckInDate).toLocaleDateString()}</p>
                <p style={dateStyle}><strong>Check-out:</strong> {new Date(booking.CheckOutDate).toLocaleDateString()}</p>
                <p style={dateStyle}><strong>Total Points:</strong> {booking.TotalPrice}</p>
                <p style={dateStyle}><strong>Status:</strong> <span style={statusStyle(booking.Status.toLowerCase())}>{booking.Status}</span></p>
              </div>
              <div>
                {booking.Status.toLowerCase() === 'confirmed' && ( // Example: Only allow cancellation for 'confirmed' bookings
                  <button
                    onClick={() => handleCancelBooking(booking.BookingID)}
                    style={buttonStyle()}
                  >
                    Cancel Booking
                  </button>
                )}
                 <Link to={`/properties/${booking.PropertyID}`} style={{...buttonStyle('#007bff'), display: 'block', marginTop: '10px'}}>View Property</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
