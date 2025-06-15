import React from 'react';
import './Footer.css'; // We'll create this CSS file next

function Footer() {
  return (
    <div className='footer'>
      <p>© {new Date().getFullYear()} Airbnb Clone! No rights reserved - this is a demo!</p>
      <p>Privacy · Terms · Sitemap · Company Details</p>
    </div>
  );
}

export default Footer;
