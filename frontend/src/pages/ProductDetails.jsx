import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryCheck, setDeliveryCheck] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) setProduct(res.data.data);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    setAddingToCart(true);
    const added = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (added) navigate('/cart');
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryCheck({ available: true, days: '3-5 business days' });
    }
  };

  if (loading) {
    return (
      <div className="ss-pd-container">
        <div className="ss-pd-grid">
          <div className="ss-pd-image-col"><div className="skeleton" style={{height: '400px'}}></div></div>
          <div className="ss-pd-info-col">
            <div className="skeleton" style={{height: '24px', width: '40%', marginBottom: '12px'}}></div>
            <div className="skeleton" style={{height: '32px', width: '80%', marginBottom: '12px'}}></div>
            <div className="skeleton" style={{height: '24px', width: '30%', marginBottom: '24px'}}></div>
            <div className="skeleton" style={{height: '120px'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="ss-pd-container">
        <div className="ss-pd-not-found">
          <h2>Product not found</h2>
          <p>The product you are looking for does not exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-pd-container">
      {/* Breadcrumb */}
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/products">Products</Link><span>›</span>
        {product.categoryName && <><Link to={`/products?category=${product.categoryId}`}>{product.categoryName}</Link><span>›</span></>}
        <span>{product.name}</span>
      </div>

      <div className="ss-pd-grid">
        {/* Image Section */}
        <div className="ss-pd-image-col">
          <div className="ss-pd-image-box">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="ss-pd-no-image">No Image Available</div>
            )}
          </div>
          <div className="ss-pd-actions-mobile">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stockQuantity === 0 || addingToCart}>
              {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button className="btn btn-blue btn-lg" onClick={handleBuyNow} disabled={product.stockQuantity === 0 || addingToCart}>
              ⚡ Buy Now
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="ss-pd-info-col">
          {product.brand && <span className="ss-pd-brand">{product.brand}</span>}
          <h1 className="ss-pd-title">{product.name}</h1>

          <div className="ss-pd-price-box">
            <span className="ss-pd-price">{formatPrice(product.price)}</span>
            <span className="ss-pd-tax-note">Inclusive of all taxes</span>
          </div>

          {/* Stock Status */}
          <div className="ss-pd-stock">
            {product.stockQuantity > 0 ? (
              <span className="ss-in-stock-badge">✓ In Stock ({product.stockQuantity} available)</span>
            ) : (
              <span className="ss-out-stock-badge">✕ Out of Stock</span>
            )}
          </div>

          {/* Delivery Check */}
          <div className="ss-pd-delivery">
            <h4>Delivery</h4>
            <div className="ss-pd-pin-row">
              <input type="text" placeholder="Enter PIN code" maxLength="6" value={pincode}
                onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setDeliveryCheck(null); }}
                className="form-control" />
              <button className="btn btn-secondary btn-sm" onClick={checkDelivery}>Check</button>
            </div>
            {deliveryCheck && (
              <p className="ss-pd-delivery-result">
                {deliveryCheck.available ? `✓ Delivery available — ${deliveryCheck.days}` : '✕ Not available at this location'}
              </p>
            )}
          </div>

          {/* Quantity */}
          {product.stockQuantity > 0 && (
            <div className="ss-pd-qty">
              <label>Quantity:</label>
              <div className="ss-qty-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>−</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} disabled={quantity >= product.stockQuantity}>+</button>
              </div>
            </div>
          )}

          {/* Action Buttons Desktop */}
          <div className="ss-pd-actions-desktop">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stockQuantity === 0 || addingToCart}>
              {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button className="btn btn-blue btn-lg" onClick={handleBuyNow} disabled={product.stockQuantity === 0 || addingToCart}>
              ⚡ Buy Now
            </button>
          </div>

          {/* Description */}
          <div className="ss-pd-description">
            <h3>Product Description</h3>
            <p>{product.description || 'No description available for this product.'}</p>
          </div>

          {/* Details Table */}
          <div className="ss-pd-specs">
            <h3>Product Details</h3>
            <table>
              <tbody>
                {product.brand && <tr><td>Brand</td><td>{product.brand}</td></tr>}
                {product.categoryName && <tr><td>Category</td><td>{product.categoryName}</td></tr>}
                <tr><td>In Stock</td><td>{product.stockQuantity > 0 ? 'Yes' : 'No'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
