import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase'; // Corrected path
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Card from '../components/Card'; // Assuming Card component path
// import './ListingsPage.css'; // Create if needed

function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const listingsCollectionRef = collection(db, 'listings');
        // Optional: Order listings, e.g., by creation date descending
        const q = query(listingsCollectionRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(listingsData);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return <p>Loading listings...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error fetching listings: {error}</p>;
  }

  return (
    <div className="listingsPage" style={{ padding: '20px' }}>
      <h1>Available Places</h1>
      {listings.length === 0 && !loading && (
        <p>No listings available at the moment. Why not <a href="/create-listing">create one</a>?</p>
      )}
      <div className="listings-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {listings.map(listing => (
          <Card key={listing.id} listing={listing} />
        ))}
      </div>
      {/* Basic search/filter stubs can be added here later */}
      {/*
      <div className="filters" style={{ marginTop: '20px', padding: '10px', border: '1px solid #eee' }}>
        <input type="text" placeholder="Search by location..." />
        <select>
          <option value="">Sort by Price</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>
      */}
    </div>
  );
}

export default ListingsPage;
