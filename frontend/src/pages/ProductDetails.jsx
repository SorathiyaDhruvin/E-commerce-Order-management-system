import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="product-details-skeleton animate-fade-in">
        <div className="skeleton-image skeleton"></div>
        <div className="skeleton-info">
          <div className="skeleton-line skeleton" style={{width: '30%', height: '2rem'}}></div>
          <div className="skeleton-line skeleton" style={{width: '80%', height: '3rem'}}></div>
          <div className="skeleton-line skeleton" style={{width: '40%', height: '2rem'}}></div>
          <div className="skeleton-line skeleton" style={{width: '100%', height: '10rem'}}></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-container animate-fade-in">
      <div className="product-details-grid">
        <div className="product-details-image-container">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="product-details-image" />
          ) : (
            <div className="product-details-image-placeholder">No Image Available</div>
          )}
        </div>
        
        <div className="product-details-info">
          <div className="product-meta">
            <span className="product-category">{product.categoryName}</span>
            <span className="product-brand">{product.brand}</span>
          </div>
          
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price-container">
            <span className="product-price">₹{product.price.toFixed(2)}</span>
            {product.stockQuantity > 0 ? (
              <span className="badge badge-success">In Stock ({product.stockQuantity})</span>
            ) : (
              <span className="badge badge-danger">Out of Stock</span>
            )}
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>
          
          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input 
                  type="number" 
                  id="quantity" 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stockQuantity}
                />
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => setQuantity(prev => Math.min(product.stockQuantity, prev + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              className="btn btn-primary btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || addingToCart}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
