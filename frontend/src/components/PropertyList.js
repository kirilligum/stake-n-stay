import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // Using the configured axios instance

// Optional: PropertyCard component for individual property display
const PropertyCard = ({ property }) => {
  // Basic inline styles for the card
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px',
    width: '300px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };
  const imageStyle = {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px'
  };
  const titleStyle = {
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginBottom: '5px'
  };
  const priceStyle = {
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: '10px'
  };
  const linkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    alignSelf: 'flex-start', // Aligns button to the left
    padding: '8px 12px',
    border: '1px solid #007bff',
    borderRadius: '4px',
    textAlign: 'center', // Centers text within the button-like link
    display: 'inline-block', // Allows padding and border
    marginTop: 'auto' // Pushes link to the bottom if card height varies
  };


  // Assuming property.Images is an array of URLs and we take the first one
  // Or use a placeholder if no images are available
  const imageUrl = property.Images && property.Images.length > 0 ? property.Images[0] : 'https://via.placeholder.com/300x200.png?text=No+Image';

  return (
    <div style={cardStyle}>
      <img src={imageUrl} alt={property.Title || 'Property Image'} style={imageStyle} />
      <h3 style={titleStyle}>{property.Title}</h3>
      <p>{property.City}, {property.Country}</p>
      <p style={priceStyle}>${property.PricePerNight} / night</p>
      <Link to={`/properties/${property.PropertyID}`} style={linkStyle}>View Details</Link>
    </div>
  );
};


const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchProperties = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      // The actual API call will be updated once api.js has getProperties
      // For now, using a direct api.get call as a placeholder for that structure
      const response = await api.get('/properties', { params: filterParams });
      setProperties(response.data || []); // Assuming response.data is an array
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch properties.');
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(); // Fetch all properties on initial load
  }, [fetchProperties]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties({ city: cityFilter });
  };

  // Basic inline styles
  const listContainerStyle = {
    padding: '20px'
  };
  const filterFormStyle = {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px'
  };
  const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flexGrow: 1
  };
  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  const propertyGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px', // Gap between cards
    justifyContent: 'center' // Center cards if they don't fill the row
  };

  if (loading) return <p style={{textAlign: 'center', padding: '20px'}}>Loading properties...</p>;
  if (error) return <p style={{color: 'red', textAlign: 'center', padding: '20px'}}>{error}</p>;

  return (
    <div style={listContainerStyle}>
      <h2>Available Properties</h2>
      <form onSubmit={handleFilterSubmit} style={filterFormStyle}>
        <input
          type="text"
          placeholder="Filter by city..."
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Filter</button>
      </form>
      {properties.length === 0 ? (
        <p>No properties found matching your criteria.</p>
      ) : (
        <div style={propertyGridStyle}>
          {properties.map((property) => (
            <PropertyCard key={property.PropertyID} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
