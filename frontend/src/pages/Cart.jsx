import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading && !cart.items.length) {
    return (
      <div className="ss-cart-container">
        <h1 className="ss-cart-title">Shopping Cart</h1>
        {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{height: '80px', marginBottom: '8px'}}></div>)}
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="ss-cart-container">
        <div className="ss-cart-empty">
          <h2>Your Shopping Cart is Empty</h2>
          <p>Add products to your cart and they will appear here.</p>
          <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-cart-container">
      <div className="ss-cart-grid">
        {/* Cart Items */}
        <div className="ss-cart-items-section">
          <div className="ss-cart-header">
            <h1>Shopping Cart ({cart.items.length} items)</h1>
            <button className="ss-clear-btn" onClick={clearCart}>Remove All</button>
          </div>

          {cart.items.map((item) => (
            <div key={item.id} className="ss-cart-item">
              <div className="ss-cart-item-image">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName} />
                ) : (
                  <div className="ss-cart-img-placeholder">No Image</div>
                )}
              </div>
              <div className="ss-cart-item-info">
                <Link to={`/products/${item.productId}`} className="ss-cart-item-name">{item.productName}</Link>
                <div className="ss-cart-item-price">{formatPrice(item.price)}</div>
                <div className="ss-cart-item-controls">
                  <div className="ss-qty-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                    <input type="number" value={item.quantity} readOnly />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="ss-remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
              <div className="ss-cart-item-subtotal">{formatPrice(item.subtotal)}</div>
            </div>
          ))}

          <div className="ss-cart-continue">
            <Link to="/products">← Continue Shopping</Link>
          </div>
        </div>

        {/* Price Details */}
        <div className="ss-cart-summary">
          <h3>PRICE DETAILS</h3>
          <div className="ss-summary-row">
            <span>Price ({cart.items.length} items)</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          <div className="ss-summary-row">
            <span>Delivery Charges</span>
            <span className="text-success">Free</span>
          </div>
          <div className="ss-summary-divider"></div>
          <div className="ss-summary-row ss-summary-total">
            <span>Total Amount</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          <button className="btn btn-primary w-full ss-checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Buy
          </button>
          <div className="ss-secure-note">🔒 Safe and Secure Payments</div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
