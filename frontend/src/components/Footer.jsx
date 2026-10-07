import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="ss-footer">
      <button className="ss-footer-backtop" onClick={scrollToTop}>Back to top</button>

      <div className="ss-footer-main">
        <div className="ss-footer-inner">
          <div className="ss-footer-col">
            <h4>ABOUT</h4>
            <a href="#">Contact Us</a>
            <a href="#">About ShopSphere</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="ss-footer-col">
            <h4>HELP</h4>
            <a href="#">Payments</a>
            <a href="#">Shipping</a>
            <a href="#">Cancellation & Returns</a>
            <a href="#">FAQ</a>
          </div>
          <div className="ss-footer-col">
            <h4>CONSUMER POLICY</h4>
            <a href="#">Return Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Security</a>
            <a href="#">Privacy</a>
          </div>
          <div className="ss-footer-col">
            <h4>SOCIAL</h4>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
            <a href="#">LinkedIn</a>
          </div>
          <div className="ss-footer-col">
            <h4>SELL WITH US</h4>
            <a href="#">Become a Seller</a>
            <a href="#">Advertise</a>
          </div>
        </div>
      </div>

      <div className="ss-footer-bottom">
        <div className="ss-footer-bottom-inner">
          <span>© {new Date().getFullYear()} ShopSphere. All rights reserved.</span>
          <span className="ss-footer-links">
            <Link to="/products">Shop</Link>
            <Link to="/login">Account</Link>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
