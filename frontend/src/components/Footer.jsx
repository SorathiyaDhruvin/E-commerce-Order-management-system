import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>ShopSphere</h3>
          <p>Your one-stop destination for premium products.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Shop</h4>
            <ul>
              <li><a href="/products">All Products</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Offers</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Shipping & Returns</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
