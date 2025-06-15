import React from 'react';
import './Loading.css'; // We'll create this CSS file next

function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading, please wait...</p>
    </div>
  );
}

export default Loading;
