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
              <Link to="/orders" className="nav-link">My Orders</Link>
              <Link to="/cart" className="nav-link cart-link">
                🛒 Cart {cartItemsCount > 0 && <span className="cart-badge">{cartItemsCount}</span>}
              </Link>
              <div className="nav-user">
                <span>Hi, {user?.firstName}</span>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
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
