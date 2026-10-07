import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart.items.length) {
    return (
      <div className="cart-container animate-fade-in">
        <h1 className="cart-title">Your Cart</h1>
        <div className="cart-skeleton">
          <div className="skeleton-line skeleton" style={{height: '100px', marginBottom: '1rem'}}></div>
          <div className="skeleton-line skeleton" style={{height: '100px', marginBottom: '1rem'}}></div>
          <div className="skeleton-line skeleton" style={{height: '100px'}}></div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container animate-fade-in">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container animate-fade-in">
      <h1 className="cart-title">Your Cart ({cart.items.length} items)</h1>
      
      <div className="cart-grid">
        <div className="cart-items">
          <div className="cart-header">
            <div className="col-product">Product</div>
            <div className="col-price">Price</div>
            <div className="col-quantity">Quantity</div>
            <div className="col-subtotal">Subtotal</div>
            <div className="col-actions"></div>
          </div>
          
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="col-product">
                <div className="cart-item-image-container">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-image-placeholder">No Image</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <Link to={`/products/${item.productId}`} className="cart-item-name">
                    {item.productName}
                  </Link>
                </div>
              </div>
              
              <div className="col-price">₹{item.price.toFixed(2)}</div>
              
              <div className="col-quantity">
                <div className="quantity-controls small">
                  <button 
                    type="button" 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    readOnly
                  />
                  <button 
                    type="button" 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="col-subtotal font-semibold">
                ₹{item.subtotal.toFixed(2)}
              </div>
              
              <div className="col-actions">
                <button 
                  className="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          <div className="cart-actions">
            <button className="btn btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
            <Link to="/products" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </div>
        
        <div className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cart.total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Estimated Total</span>
            <span>₹{cart.total.toFixed(2)}</span>
          </div>
          
          <button 
            className="btn btn-primary w-full btn-checkout"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
          
          <div className="secure-checkout">
            <span className="lock-icon">🔒</span> Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
