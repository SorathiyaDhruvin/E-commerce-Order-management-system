import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlistItems(res.data.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        toast.success('Removed from wishlist');
        fetchWishlist();
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (productId) => {
    const added = await addToCart(productId, 1);
    if (added) {
      await removeFromWishlist(productId);
    }
  };

  if (loading) {
    return (
      <div className="ss-wishlist-container">
        <h1>Your Wishlist</h1>
        <div className="ss-wishlist-grid">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{height: '300px'}}></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="ss-wishlist-container">
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/profile">Your Account</Link><span>›</span>
        <span>Your Wishlist</span>
      </div>

      <div className="ss-wishlist-header">
        <h1>Your Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="ss-wishlist-empty">
          <h2>Your wishlist is empty</h2>
          <p>Explore our products and add your favorites here!</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="ss-wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item.id} className="ss-wishlist-card">
              <Link to={`/products/${item.productId}`} className="ss-wishlist-img">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName} />
                ) : (
                  <div className="ss-cart-img-placeholder">Img</div>
                )}
              </Link>
              <div className="ss-wishlist-info">
                <Link to={`/products/${item.productId}`} className="ss-wishlist-name">{item.productName}</Link>
                <div className="ss-wishlist-price">{formatPrice(item.price)}</div>
                <div className="ss-wishlist-actions">
                  <button className="btn btn-primary btn-sm w-full" onClick={() => handleAddToCart(item.productId)}>
                    Add to Cart
                  </button>
                  <button className="btn btn-secondary btn-sm w-full mt-2" onClick={() => removeFromWishlist(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
