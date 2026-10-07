import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
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
  const [step, setStep] = useState(1);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India'
  });

  useEffect(() => {
    if (cart.items.length === 0 && !loading) navigate('/cart');
  }, [cart, loading, navigate]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.data.success) {
          setAddresses(res.data.data);
          const def = res.data.data.find(a => a.default) || res.data.data[0];
          if (def) setSelectedAddressId(def.id);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        const saved = res.data.data;
        setAddresses([...addresses, saved]);
        setSelectedAddressId(saved.id);
        setShowAddressForm(false);
        setNewAddress({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India' });
        toast.success('Address saved');
      }
    } catch (e) { toast.error('Failed to save address'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', { shippingAddressId: selectedAddressId });
      if (res.data.success) {
        const orderId = res.data.data.id;
        toast.success('Order placed successfully!');
        await fetchCart();
        try { await api.post(`/orders/${orderId}/pay`); } catch (e) { /* silent */ }
        navigate('/orders');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setPlacingOrder(false); }
  };

  if (loading) return <div className="ss-checkout-container" style={{padding: '48px', textAlign: 'center'}}>Loading...</div>;

  const selectedAddr = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="ss-checkout-container">
      {/* Steps */}
      <div className="ss-steps">
        <div className={`ss-step ${step >= 1 ? 'active' : ''}`}><span>1</span> Delivery Address</div>
        <div className={`ss-step ${step >= 2 ? 'active' : ''}`}><span>2</span> Order Summary</div>
        <div className={`ss-step ${step >= 3 ? 'active' : ''}`}><span>3</span> Payment</div>
      </div>

      <div className="ss-checkout-grid">
        <div className="ss-checkout-main">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="ss-checkout-section">
              <h2>Select Delivery Address</h2>
              {addresses.length > 0 && !showAddressForm ? (
                <>
                  {addresses.map(addr => (
                    <label key={addr.id} className={`ss-addr-option ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                      <input type="radio" name="address" checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)} />
                      <div>
                        <strong>{addr.fullName}</strong> {addr.default && <span className="badge badge-info">Default</span>}
                        <p>{addr.addressLine}</p>
                        <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                        <p>{addr.country} · 📞 {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                  <button className="btn btn-secondary" onClick={() => setShowAddressForm(true)}>+ Add New Address</button>
                  <div className="ss-step-actions">
                    <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!selectedAddressId}>
                      Deliver Here
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveAddress} className="ss-addr-form">
                  <div className="grid grid-cols-2">
                    <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-control" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input type="text" className="form-control" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} required /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Address</label><input type="text" className="form-control" value={newAddress.addressLine} onChange={e => setNewAddress({...newAddress, addressLine: e.target.value})} required /></div>
                  <div className="grid grid-cols-2">
                    <div className="form-group"><label className="form-label">City</label><input type="text" className="form-control" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">State</label><input type="text" className="form-control" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">PIN Code</label><input type="text" className="form-control" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} required /></div>
                    <div className="form-group"><label className="form-label">Country</label><input type="text" className="form-control" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} required /></div>
                  </div>
                  <div className="ss-step-actions">
                    {addresses.length > 0 && <button type="button" className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>}
                    <button type="submit" className="btn btn-primary">Save & Deliver Here</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Step 2: Order Summary */}
          {step === 2 && (
            <div className="ss-checkout-section">
              <h2>Order Summary</h2>
              {selectedAddr && (
                <div className="ss-deliver-to">
                  <strong>Deliver to: {selectedAddr.fullName}</strong>
                  <p>{selectedAddr.addressLine}, {selectedAddr.city}, {selectedAddr.state} — {selectedAddr.postalCode}</p>
                  <button className="ss-change-btn" onClick={() => setStep(1)}>Change</button>
                </div>
              )}
              <div className="ss-order-items">
                {cart.items.map(item => (
                  <div key={item.id} className="ss-order-item">
                    <div className="ss-order-item-img">
                      {item.productImageUrl ? <img src={item.productImageUrl} alt={item.productName} /> : <div className="ss-cart-img-placeholder">Img</div>}
                    </div>
                    <div className="ss-order-item-info">
                      <span>{item.productName}</span>
                      <span className="text-secondary">Qty: {item.quantity}</span>
                    </div>
                    <div className="ss-order-item-price">{formatPrice(item.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="ss-step-actions">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="ss-checkout-section">
              <h2>Payment</h2>
              <div className="ss-payment-info">
                <p>💳 Payment will be processed securely.</p>
                <p className="text-secondary text-sm">For demo: payment is auto-simulated on order placement.</p>
              </div>
              <div className="ss-step-actions">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placingOrder}>
                  {placingOrder ? 'Processing...' : 'Place Order & Pay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Details Sidebar */}
        <div className="ss-checkout-sidebar">
          <h3>PRICE DETAILS</h3>
          <div className="ss-summary-row"><span>Price ({cart.items.length} items)</span><span>{formatPrice(cart.total)}</span></div>
          <div className="ss-summary-row"><span>Delivery</span><span className="text-success">Free</span></div>
          <div className="ss-summary-divider"></div>
          <div className="ss-summary-row ss-summary-total"><span>Total Amount</span><span>{formatPrice(cart.total)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
