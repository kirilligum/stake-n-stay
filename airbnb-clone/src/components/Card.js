import React from 'react';
import { Link } from 'react-router-dom';
// import './Card.css'; // Assuming Card.css exists or will be created

function Card({ listing }) {
  if (!listing) {
    return null; // Or some placeholder for loading/error
  }

  return (
    <div className="card" style={{ border: '1px solid #ddd', margin: '10px', padding: '10px', width: '300px' }}>
      <Link to={`/listing/${listing.id}`}>
        <img src={listing.imageUrl} alt={listing.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
        <h3>{listing.name}</h3>
      </Link>
      <p>Location: {listing.location}</p>
      <p>Price: {listing.price} points/night</p>
      {/* Add more details or styling as needed */}
    </div>
  );
}

export default Card;
