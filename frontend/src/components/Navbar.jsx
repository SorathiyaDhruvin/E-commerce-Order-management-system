import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getInitials, getDeliveryLocation, setDeliveryLocation } from '../utils/helpers';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveryLocation, setDeliveryLoc] = useState(getDeliveryLocation() || { pincode: '390019', city: 'Vadodara' });
  const [pinInput, setPinInput] = useState('');
  const accountRef = useRef(null);
  const locationRef = useRef(null);

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (e) { /* silent */ }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setShowLocationModal(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
    navigate('/');
  };

  const handlePinSubmit = () => {
    if (pinInput.length === 6) {
      const loc = { pincode: pinInput, city: '' };
      setDeliveryLoc(loc);
      setDeliveryLocation(loc);
      setShowLocationModal(false);
      setPinInput('');
    }
  };

  return (
    <>
      {/* === TOP HEADER === */}
      <header className="ss-header">
        <div className="ss-header-inner">
          {/* Mobile hamburger */}
          <button className="ss-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>

          {/* Logo */}
          <Link to="/" className="ss-logo">
            <span className="ss-logo-text">ShopSphere</span>
            <span className="ss-logo-tagline">Explore <span className="ss-logo-plus">Plus</span></span>
          </Link>

          {/* Delivery Location */}
          <div className="ss-deliver" ref={locationRef}>
            <button className="ss-deliver-btn" onClick={() => setShowLocationModal(!showLocationModal)} aria-label="Change delivery location">
              <span className="ss-deliver-icon">📍</span>
              <div className="ss-deliver-info">
                <span className="ss-deliver-label">Deliver to</span>
                <span className="ss-deliver-location">{deliveryLocation.city || deliveryLocation.pincode}</span>
              </div>
            </button>
            {showLocationModal && (
              <div className="ss-deliver-dropdown">
                <h4>Choose your delivery location</h4>
                <p>Enter an Indian PIN code</p>
                <div className="ss-pin-input-row">
                  <input
                    type="text" maxLength="6" placeholder="Enter PIN code"
                    value={pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="form-control"
                  />
                  <button className="btn btn-blue btn-sm" onClick={handlePinSubmit}>Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="ss-search">
            <input
              type="text" className="ss-search-input"
              placeholder="Search for products, brands and more"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
            />
            <button type="submit" className="ss-search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </form>

          {/* Nav Links */}
          <nav className="ss-nav">
            {/* Account */}
            <div className="ss-nav-item ss-account" ref={accountRef}>
              <button
                className="ss-nav-btn"
                onClick={() => isAuthenticated ? setShowAccountMenu(!showAccountMenu) : navigate('/login')}
                onMouseEnter={() => isAuthenticated && setShowAccountMenu(true)}
              >
                <span className="ss-nav-label">Hello, {isAuthenticated ? user?.firstName : 'Sign in'}</span>
                <span className="ss-nav-value">Account & Lists ▾</span>
              </button>
              {showAccountMenu && isAuthenticated && (
                <div className="ss-account-dropdown" onMouseLeave={() => setShowAccountMenu(false)}>
                  <div className="ss-dropdown-header">
                    <div className="ss-dropdown-avatar">{getInitials(user?.firstName, user?.lastName)}</div>
                    <div>
                      <strong>{user?.firstName} {user?.lastName}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>
                  <div className="ss-dropdown-divider"></div>
                  <Link to="/profile" className="ss-dropdown-item" onClick={() => setShowAccountMenu(false)}>My Profile</Link>
                  <Link to="/orders" className="ss-dropdown-item" onClick={() => setShowAccountMenu(false)}>My Orders</Link>
                  <Link to="/wishlist" className="ss-dropdown-item" onClick={() => setShowAccountMenu(false)}>My Wishlist</Link>
                  <Link to="/addresses" className="ss-dropdown-item" onClick={() => setShowAccountMenu(false)}>Saved Addresses</Link>
                  {isAdmin() && (
                    <Link to="/admin" className="ss-dropdown-item ss-admin-link" onClick={() => setShowAccountMenu(false)}>Admin Dashboard</Link>
                  )}
                  <div className="ss-dropdown-divider"></div>
                  <button className="ss-dropdown-item ss-logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

            {/* Orders */}
            <Link to={isAuthenticated ? '/orders' : '/login'} className="ss-nav-item ss-nav-link-item">
              <span className="ss-nav-label">Returns</span>
              <span className="ss-nav-value">& Orders</span>
            </Link>

            {/* Wishlist */}
            <Link to={isAuthenticated ? '/wishlist' : '/login'} className="ss-nav-item ss-nav-link-item ss-hide-mobile">
              <span className="ss-nav-label">Your</span>
              <span className="ss-nav-value">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link to={isAuthenticated ? '/cart' : '/login'} className="ss-cart-link">
              <div className="ss-cart-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartItemsCount > 0 && <span className="ss-cart-count">{cartItemsCount}</span>}
              </div>
              <span className="ss-cart-text">Cart</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* === CATEGORY NAV BAR === */}
      <nav className="ss-catbar">
        <div className="ss-catbar-inner">
          <Link to="/products" className="ss-catbar-item ss-catbar-all">
            <span className="ss-hamburger-icon">☰</span> All
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="ss-catbar-item">
              {cat.name}
            </Link>
          ))}
          <Link to="/products" className="ss-catbar-item ss-catbar-deals">Deals</Link>
        </div>
      </nav>

      {/* === MOBILE MENU OVERLAY === */}
      {mobileMenuOpen && (
        <div className="ss-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="ss-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="ss-mobile-menu-header">
              <div className="ss-mobile-avatar">{isAuthenticated ? getInitials(user?.firstName, user?.lastName) : '👤'}</div>
              <span>{isAuthenticated ? `Hello, ${user?.firstName}` : 'Hello, Sign in'}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="ss-mobile-close">✕</button>
            </div>
            <div className="ss-mobile-menu-body">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileMenuOpen(false)}>{cat.name}</Link>
              ))}
              <div className="ss-mobile-divider"></div>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>My Wishlist</Link>
                  <Link to="/addresses" onClick={() => setMobileMenuOpen(false)}>My Addresses</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
                  {isAdmin() && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
