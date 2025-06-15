import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage, auth } from '../firebase/firebase'; // Corrected path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import './CreateListingPage.css'; // Create if needed

function CreateListingPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(''); // Price in points
  const [amenities, setAmenities] = useState(''); // Comma-separated
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!auth.currentUser) {
      setError("You must be logged in to create a listing.");
      setIsSubmitting(false);
      return;
    }

    if (!image) {
      setError("Please upload an image for the listing.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `listings/${auth.currentUser.uid}/${Date.now()}_${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error("Image upload error:", uploadError);
          setError(`Image upload failed: ${uploadError.message}`);
          setIsSubmitting(false);
        },
        async () => {
          // 2. Get image URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // 3. Store listing data in Firestore
          const listingsCollectionRef = collection(db, 'listings');
          await addDoc(listingsCollectionRef, {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email, // Optional: store user email for easier display
            name,
            description,
            location,
            price: Number(price), // Ensure price is stored as a number
            amenities: amenities.split(',').map(item => item.trim()).filter(item => item), // Store as an array
            imageUrl: downloadURL,
            imagePath: uploadTask.snapshot.ref.fullPath, // Optional: store image path for deletion
            createdAt: serverTimestamp(),
            // Add other relevant fields: e.g., availability, number of rooms, etc.
          });

          setIsSubmitting(false);
          setUploadProgress(0);
          navigate('/'); // Redirect to homepage or listings page
        }
      );
    } catch (err) {
      console.error("Listing creation error:", err);
      setError(`Listing creation failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createListingPage" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Create New Listing</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="location">Location (e.g., City, Country):</label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="price">Price (in points per night):</label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="amenities">Amenities (comma-separated, e.g., Wifi, Kitchen):</label>
          <input type="text" id="amenities" value={amenities} onChange={(e) => setAmenities(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="image">Image:</label>
          <input type="file" id="image" onChange={handleImageChange} accept="image/*" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        {uploadProgress > 0 && <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting || uploadProgress > 0} style={{ padding: '10px 15px' }}>
          {isSubmitting ? 'Submitting...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}

export default CreateListingPage;
