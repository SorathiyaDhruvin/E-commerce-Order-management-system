import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Addresses.css';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', default: false
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) setAddresses(res.data.data);
    } catch (e) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', default: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr) => {
    setFormData({ ...addr });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/addresses/${id}`);
        toast.success('Address deleted');
        fetchAddresses();
      } catch (e) { toast.error('Failed to delete address'); }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (e) { toast.error('Failed to update default address'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', formData);
        toast.success('Address added');
      }
      fetchAddresses();
      resetForm();
    } catch (e) { toast.error('Failed to save address'); }
  };

  if (loading) {
    return <div className="ss-addresses-container">Loading...</div>;
  }

  return (
    <div className="ss-addresses-container">
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/profile">Your Account</Link><span>›</span>
        <span>Your Addresses</span>
      </div>

      <div className="ss-addresses-header">
        <h1>Your Addresses</h1>
      </div>

      {showForm ? (
        <div className="ss-address-form-card">
          <h2>{editingId ? 'Edit Address' : 'Add a new address'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Flat, House no., Building, Company, Apartment</label>
              <input type="text" className="form-control" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Town/City</label>
                <input type="text" className="form-control" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-control" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input type="text" className="form-control" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" className="form-control" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
              </div>
            </div>
            <div className="form-group checkbox-group" style={{display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px'}}>
              <input type="checkbox" id="defaultAddr" checked={formData.default} onChange={e => setFormData({...formData, default: e.target.checked})} />
              <label htmlFor="defaultAddr">Make this my default address</label>
            </div>
            <div className="ss-address-form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Address' : 'Add Address'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="ss-addresses-grid">
          <div className="ss-address-card ss-address-add-card" onClick={() => setShowForm(true)}>
            <div className="ss-add-icon">+</div>
            <h2>Add address</h2>
          </div>

          {addresses.map(addr => (
            <div key={addr.id} className="ss-address-card">
              <div className="ss-address-card-header">
                {addr.default && <span className="ss-default-badge">Default</span>}
              </div>
              <div className="ss-address-details">
                <strong>{addr.fullName}</strong>
                <p>{addr.addressLine}</p>
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
                <p>Phone number: {addr.phone}</p>
              </div>
              <div className="ss-address-actions">
                <button onClick={() => handleEdit(addr)}>Edit</button>
                <span className="ss-action-divider">|</span>
                <button onClick={() => handleDelete(addr.id)}>Remove</button>
                {!addr.default && (
                  <>
                    <span className="ss-action-divider">|</span>
                    <button onClick={() => handleSetDefault(addr.id)}>Set as Default</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
