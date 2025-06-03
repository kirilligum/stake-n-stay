import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Using the configured axios instance
import { AuthContext } from '../context/AuthContext';
import DatePicker from 'react-datepicker'; // Import DatePicker

const PropertyDetails = () => {
  const { id: propertyId } = useParams(); // Property ID from route
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext); // For checking ownership and booking
  const navigate = useNavigate();

  // State for booking date pickers
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/properties/${propertyId}`);
        setProperty(response.data);
      } catch (err) {
        setError(err.response?.data?.error || `Failed to fetch property details for ID ${propertyId}.`);
        console.error('Fetch property details error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const handleBookingSubmit = async () => {
    setBookingError('');
    setBookingSuccess('');

    if (!startDate || !endDate) {
      setBookingError('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }
    if (new Date(startDate) < new Date(Date.now() - 86400000)) {
        setBookingError('Check-in date cannot be in the past.');
        return;
    }


    const bookingData = {
      property_id: parseInt(propertyId),
      // Format dates to YYYY-MM-DD string or whatever your backend expects
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      // number_of_guests: 1, // Or get from an input
    };

    try {
      // This will be updated to use a function from api.js e.g. api.createBooking(bookingData)
      const response = await api.post('/bookings', bookingData);
      setBookingSuccess(response.data.message || 'Booking request successful! Your points have been updated.');
      // Optionally, update user's points in AuthContext if backend sends new balance
      // Or redirect to a 'my-bookings' page
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Booking failed. Please try again.');
      console.error('Booking submission error:', err.response?.data || err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await api.delete(`/properties/${propertyId}`);
      alert('Property deleted successfully.');
      navigate('/properties'); // Redirect to property list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete property.');
      console.error('Delete property error:', err);
    }
  };

  // Basic inline styles
  const containerStyle = { padding: '20px', maxWidth: '800px', margin: 'auto' };
  const imageStyle = { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' };
  const bookingSectionStyle = { marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9'};
  const datePickerContainerStyle = { display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center'};
  const titleStyle = { fontSize: '2em', fontWeight: 'bold', marginBottom: '10px' };
  const sectionTitleStyle = { fontSize: '1.5em', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px'};
  const buttonContainerStyle = { marginTop: '20px', display: 'flex', gap: '10px' };
  const messageStyle = (isError) => ({
    color: isError ? 'red' : 'green',
    margin: '10px 0',
    padding: '10px',
    border: `1px solid ${isError ? 'red' : 'green'}`,
    borderRadius: '4px',
    background: isError ? '#ffe0e0' : '#e0ffe0'
  });
   const buttonStyle = (color = '#007bff', disabled = false) => ({
    padding: '10px 15px',
    backgroundColor: disabled? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none'
  });

  // Custom input for DatePicker for styling
  const CustomDatePickerInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <button onClick={onClick} ref={ref} style={{...inputStyle, width: 'auto', background: 'white', color: 'black', textAlign: 'left'}}>
      {value || placeholder}
    </button>
  ));
  const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' };


  if (loading || authLoading) return <p style={{textAlign: 'center', padding: '20px'}}>Loading property details...</p>;
  if (error) return <p style={{color: 'red', textAlign: 'center', padding: '20px'}}>{error}</p>;
  if (!property) return <p style={{textAlign: 'center', padding: '20px'}}>Property not found.</p>;

  const isOwner = isAuthenticated && user && property.OwnerUserID === user.UserID;
  const isAdmin = isAuthenticated && user && user.Role === 'admin';
  const canBook = isAuthenticated && !isOwner && !isAdmin; // User can book if authenticated and not owner/admin

  const imageUrl = property.Images && property.Images.length > 0 ? property.Images[0] : 'https://via.placeholder.com/800x400.png?text=No+Image';

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>{property.Title}</h1>
      <img src={imageUrl} alt={property.Title || 'Property Image'} style={imageStyle} />

      <p><strong>Location:</strong> {property.Address}, {property.City}, {property.Country}</p>
      <p><strong>Price:</strong> {property.PricePerNight} Points / night</p> {/* Assuming price is in points */}

      {isOwner || isAdmin ? (
        <div style={buttonContainerStyle}>
          <Link to={`/properties/${propertyId}/edit`} style={buttonStyle()}>Edit Property</Link>
          <button onClick={handleDelete} style={buttonStyle('red')}>Delete Property</button>
        </div>
      ) : null}

      {/* Booking Section */}
      {canBook && (
        <div style={bookingSectionStyle}>
          <h2 style={{...sectionTitleStyle, borderBottom: 'none', marginTop: 0}}>Book this Property</h2>
          {bookingError && <p style={messageStyle(true)}>{bookingError}</p>}
          {bookingSuccess && <p style={messageStyle(false)}>{bookingSuccess}</p>}
          <div style={datePickerContainerStyle}>
            <label htmlFor="startDate" style={{marginRight: '5px'}}>Check-in:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select check-in date"
              customInput={<CustomDatePickerInput />}
              id="startDate"
            />
            <label htmlFor="endDate" style={{marginRight: '5px', marginLeft: '10px'}}>Check-out:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ? new Date(new Date(startDate).setDate(startDate.getDate() + 1)) : new Date()}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select check-out date"
              customInput={<CustomDatePickerInput />}
              id="endDate"
              disabled={!startDate}
            />
          </div>
          <button onClick={handleBookingSubmit} style={buttonStyle('#28a745')} disabled={!startDate || !endDate}>
            Request to Book
          </button>
        </div>
      )}

      <h2 style={sectionTitleStyle}>Description</h2>
      <p>{property.Description || 'No description available.'}</p>

      <h2 style={sectionTitleStyle}>Details</h2>
      <ul>
        <li><strong>Type:</strong> {property.PropertyType || 'N/A'}</li>
        <li><strong>Rooms:</strong> {property.NumberOfRooms || 'N/A'}</li>
        <li><strong>Bathrooms:</strong> {property.NumberOfBathrooms || 'N/A'}</li>
        {/* Add more details as available from your schema */}
      </ul>

      <h2 style={sectionTitleStyle}>Amenities</h2>
      {property.Amenities && property.Amenities.length > 0 ? (
        // Assuming Amenities is a comma-separated string or an array
        typeof property.Amenities === 'string' ?
          property.Amenities.split(',').map((item, index) => <span key={index} style={{marginRight: '10px', background: '#f0f0f0', padding: '5px', borderRadius: '3px'}}>{item.trim()}</span>) :
          Array.isArray(property.Amenities) ?
            property.Amenities.map((item, index) => <span key={index} style={{marginRight: '10px', background: '#f0f0f0', padding: '5px', borderRadius: '3px'}}>{item}</span>) :
            <p>No amenities listed.</p>
      ) : (
        <p>No amenities listed.</p>
      )}

      {/* Add sections for availability, booking form (future), etc. */}
      <Link to="/properties" style={{display: 'block', marginTop: '30px', textAlign: 'center', ...buttonStyle('#555')}}>Back to Property List</Link>
    </div>
  );
};

export default PropertyDetails;
