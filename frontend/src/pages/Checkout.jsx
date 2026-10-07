import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  useEffect(() => {
    if (cart.items.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cart, loading, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.data.success) {
          setAddresses(res.data.data);
          const defaultAddress = res.data.data.find(a => a.default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (res.data.data.length > 0) {
            setSelectedAddressId(res.data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        const savedAddress = res.data.data;
        setAddresses([...addresses, savedAddress]);
        setSelectedAddressId(savedAddress.id);
        setShowAddressForm(false);
        setNewAddress({
          fullName: '', phone: '', addressLine: '', 
          city: '', state: '', postalCode: '', country: ''
        });
        toast.success('Address saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', { shippingAddressId: selectedAddressId });
      
      if (res.data.success) {
        const orderId = res.data.data.id;
        toast.success('Order placed successfully!');
        await fetchCart(); // Refresh cart
        
        // Auto-simulate payment for demo purposes
        try {
          await api.post(`/orders/${orderId}/pay`);
          toast.success('Payment simulated successfully!');
        } catch (payErr) {
          console.error('Payment simulation failed', payErr);
        }
        
        navigate(`/orders`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return <div className="checkout-container">Loading...</div>;
  }

  return (
    <div className="checkout-container animate-fade-in">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-grid">
        <div className="checkout-details">
          
          <div className="checkout-section card">
            <h2>1. Shipping Address</h2>
            
            {addresses.length > 0 && !showAddressForm ? (
              <div className="address-list">
                {addresses.map(address => (
                  <label 
                    key={address.id} 
                    className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="address" 
                      value={address.id} 
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="address-radio"
                    />
                    <div className="address-info">
                      <p className="address-name">{address.fullName} 
                        {address.default && <span className="badge badge-info ml-2">Default</span>}
                      </p>
                      <p>{address.addressLine}</p>
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                      <p className="address-phone">📞 {address.phone}</p>
                    </div>
                  </label>
                ))}
                <button 
                  className="btn btn-secondary mt-4" 
                  onClick={() => setShowAddressForm(true)}
                >
                  + Add New Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="address-form">
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" name="fullName" className="form-control" value={newAddress.fullName} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" name="phone" className="form-control" value={newAddress.phone} onChange={handleAddressChange} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Address Line</label>
                  <input type="text" name="addressLine" className="form-control" value={newAddress.addressLine} onChange={handleAddressChange} required />
                </div>
                
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" name="city" className="form-control" value={newAddress.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State/Province</label>
                    <input type="text" name="state" className="form-control" value={newAddress.state} onChange={handleAddressChange} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input type="text" name="postalCode" className="form-control" value={newAddress.postalCode} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" className="form-control" value={newAddress.country} onChange={handleAddressChange} required />
                  </div>
                </div>
                
                <div className="address-form-actions">
                  {addresses.length > 0 && (
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary">Save Address</button>
                </div>
              </form>
            )}
          </div>
          
          <div className="checkout-section card">
            <h2>2. Payment Method</h2>
            <div className="payment-simulation">
              <p>For this demonstration, payment will be automatically simulated.</p>
              <div className="dummy-card">
                <div className="dummy-card-icon">💳</div>
                <span>Test Credit Card ending in 4242</span>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="checkout-summary">
          <div className="card summary-card">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.id} className="summary-item">
                  <div className="summary-item-image">
                    {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} /> : <div>img</div>}
                  </div>
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.productName}</div>
                    <div className="summary-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="summary-item-price">${item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-full btn-place-order"
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
            >
              {placingOrder ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
