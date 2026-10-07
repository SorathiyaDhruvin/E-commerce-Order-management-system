import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          ShopSphere
        </Link>
        
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        <nav className="navbar-nav">
          <Link to="/products" className="nav-link">Products</Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin() && <Link to="/admin" className="nav-link">Admin Dashboard</Link>}
              <Link to="/wishlist" className="nav-link">Wishlist</Link>
              <Link to="/cart" className="nav-link cart-link">
                🛒 Cart {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
              </Link>
              <div className="nav-user" onMouseLeave={() => setShowDropdown(false)}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="user-dropdown-btn">
                  <div className="nav-avatar">{user?.firstName?.charAt(0) || 'U'}</div>
                  <span>Hi, {user?.firstName}</span>
                </button>
                {showDropdown && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user?.firstName} {user?.lastName}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>My Profile</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>My Orders</Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setShowDropdown(false)}>Wishlist</Link>
                    <Link to="/addresses" className="dropdown-item" onClick={() => setShowDropdown(false)}>Saved Addresses</Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item text-danger">Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
