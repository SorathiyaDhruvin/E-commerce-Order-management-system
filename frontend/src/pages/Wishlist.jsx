import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.product.id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading wishlist...</div>;

  return (
    <div className="product-listing-container animate-fade-in" style={{paddingTop: '2rem'}}>
      <div className="listing-header">
        <h2>My Wishlist</h2>
      </div>
      
      {wishlist.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">♡</div>
          <h3>Your wishlist is empty</h3>
          <p>Start saving products you love.</p>
          <Link to="/products" className="btn btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="products-grid grid grid-cols-4">
          {wishlist.map(item => (
            <div key={item.id} className="product-card card">
              <div className="product-image-container">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">No Image</div>
                )}
              </div>
              <div className="product-info">
                <span className="product-brand">{item.product.brand}</span>
                <h3 className="product-name">{item.product.name}</h3>
                <div className="product-price">${item.product.price.toFixed(2)}</div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => addToCart(item.product.id, 1)} className="btn btn-primary" style={{flex: 1, padding: '0.5rem'}}>Add to Cart</button>
                  <button onClick={() => removeFromWishlist(item.product.id)} className="btn btn-danger" style={{padding: '0.5rem'}}>Remove</button>
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
