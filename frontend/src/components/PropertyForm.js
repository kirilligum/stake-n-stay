import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Using the configured axios instance
import { AuthContext } from '../context/AuthContext';

const PropertyForm = () => {
  const { id: propertyId } = useParams(); // For editing existing property
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    country: '',
    property_type: 'Apartment', // Default value
    number_of_rooms: '',
    number_of_bathrooms: '',
    price_per_night: '',
    amenities: '', // Comma-separated string
    images: '', // Comma-separated string of URLs
    // availability_start_date: '',
    // availability_end_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (propertyId) {
      setIsEditMode(true);
      setIsLoading(true);
      api.get(`/properties/${propertyId}`)
        .then(response => {
          const prop = response.data;
          // Ensure all fields in formData are pre-filled if they exist in prop
          const amenitiesStr = Array.isArray(prop.Amenities) ? prop.Amenities.join(', ') : (prop.Amenities || '');
          const imagesStr = Array.isArray(prop.Images) ? prop.Images.join(', ') : (prop.Images || '');

          setFormData({
            title: prop.Title || '',
            description: prop.Description || '',
            address: prop.Address || '',
            city: prop.City || '',
            country: prop.Country || '',
            property_type: prop.PropertyType || 'Apartment',
            number_of_rooms: prop.NumberOfRooms || '',
            number_of_bathrooms: prop.NumberOfBathrooms || '',
            price_per_night: prop.PricePerNight || '',
            amenities: amenitiesStr,
            images: imagesStr,
          });
          // Security check: ensure the current user is the owner if editing
          if (user && prop.OwnerUserID !== user.UserID && user.Role !== 'admin') {
            setError("You are not authorized to edit this property.");
            // Potentially disable form or redirect
          }
        })
        .catch(err => {
          setError('Failed to load property data for editing.');
          console.error(err);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsEditMode(false);
      // Reset form for creation if needed, or rely on initial state
      setFormData({
        title: '', description: '', address: '', city: '', country: '',
        property_type: 'Apartment', number_of_rooms: '', number_of_bathrooms: '',
        price_per_night: '', amenities: '', images: '',
      });
    }
  }, [propertyId, user]); // Add user to dependency array for owner check

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isAuthenticated) {
        setError("You must be logged in to create or edit properties.");
        setIsLoading(false);
        return;
    }

    // Basic validation
    if (!formData.title || !formData.price_per_night || !formData.address || !formData.city || !formData.country) {
      setError('Title, Price, Address, City, and Country are required.');
      setIsLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.price_per_night)) || parseFloat(formData.price_per_night) <= 0) {
        setError('Price per night must be a positive number.');
        setIsLoading(false);
        return;
    }
    if (formData.number_of_rooms && (isNaN(parseInt(formData.number_of_rooms)) || parseInt(formData.number_of_rooms) < 0)) {
        setError('Number of rooms must be a non-negative integer.');
        setIsLoading(false);
        return;
    }
     if (formData.number_of_bathrooms && (isNaN(parseInt(formData.number_of_bathrooms)) || parseInt(formData.number_of_bathrooms) < 0)) {
        setError('Number of bathrooms must be a non-negative integer.');
        setIsLoading(false);
        return;
    }


    // Prepare data for API (e.g., convert comma-separated strings to arrays if backend expects arrays)
    const apiData = {
      ...formData,
      // Ensure numeric fields are numbers
      price_per_night: parseFloat(formData.price_per_night),
      number_of_rooms: formData.number_of_rooms ? parseInt(formData.number_of_rooms) : null,
      number_of_bathrooms: formData.number_of_bathrooms ? parseInt(formData.number_of_bathrooms) : null,
      // Convert comma-separated strings to arrays for amenities and images
      // Assuming backend expects arrays. If it expects text, this can be removed.
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(s => s),
      images: formData.images.split(',').map(s => s.trim()).filter(s => s),
    };

    try {
      let response;
      if (isEditMode) {
        // Actual API call will be updated once api.js has updateProperty
        response = await api.put(`/properties/${propertyId}`, apiData);
        alert('Property updated successfully!');
      } else {
        // Actual API call will be updated once api.js has createProperty
        response = await api.post('/properties', apiData);
        alert('Property created successfully!');
      }
      navigate(`/properties/${response.data.property?.PropertyID || propertyId}`); // Navigate to details page
    } catch (err) {
      setError(err.response?.data?.error || (isEditMode ? 'Failed to update property.' : 'Failed to create property.'));
      console.error(err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic inline styles
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' };
  const inputStyle = { margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' };
  const textareaStyle = { ...inputStyle, minHeight: '100px', resize: 'vertical' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };
  const errorStyle = { color: 'red', margin: '10px 0' };
  const selectStyle = { ...inputStyle };


  if (authLoading || (isEditMode && isLoading && !formData.title)) { // Show loading if auth is loading OR if in edit mode and property data hasn't loaded
      return <p style={{textAlign: 'center', padding: '20px'}}>Loading form...</p>;
  }

  if (!isAuthenticated && !authLoading) { // If done loading auth state and still not authenticated
    return <p style={{color: 'red', textAlign: 'center', padding: '20px'}}>You must be logged in to access this page. <Link to="/login">Login</Link></p>;
  }

  // Further check for edit mode authorization after property data has loaded
  if (isEditMode && error.includes("not authorized")) {
    return <p style={errorStyle}>{error} <Link to="/">Go Home</Link></p>;
  }


  return (
    <div style={formStyle}>
      <h2>{isEditMode ? 'Edit Property' : 'Create New Property'}</h2>
      {error && <p style={errorStyle}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Property Title" style={inputStyle} required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" style={textareaStyle} />
        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" style={inputStyle} required />
        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" style={inputStyle} required />
        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" style={inputStyle} required />

        <select name="property_type" value={formData.property_type} onChange={handleChange} style={selectStyle}>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Condo">Condo</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Other">Other</option>
        </select>

        <input type="number" name="number_of_rooms" value={formData.number_of_rooms} onChange={handleChange} placeholder="Number of Rooms (e.g., 3)" style={inputStyle} min="0" />
        <input type="number" name="number_of_bathrooms" value={formData.number_of_bathrooms} onChange={handleChange} placeholder="Number of Bathrooms (e.g., 2)" style={inputStyle} min="0" />
        <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} placeholder="Price per Night (e.g., 100)" style={inputStyle} required min="0.01" step="0.01" />

        <textarea name="amenities" value={formData.amenities} onChange={handleChange} placeholder="Amenities (comma-separated, e.g., WiFi, Pool, Kitchen)" style={textareaStyle} />
        <textarea name="images" value={formData.images} onChange={handleChange} placeholder="Image URLs (comma-separated)" style={textareaStyle} />
        {/* Add fields for availability_start_date, availability_end_date if needed (type="date") */}

        <button type="submit" style={buttonStyle} disabled={isLoading || (isEditMode && error.includes("not authorized"))}>
          {isLoading ? 'Submitting...' : (isEditMode ? 'Update Property' : 'Create Property')}
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;
