import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Addresses.css';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      setShowForm(false);
      setEditingId(null);
      setFormData({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/addresses/${id}`);
        toast.success('Address deleted');
        fetchAddresses();
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading addresses...</div>;

  return (
    <div className="addresses-container animate-fade-in">
      <div className="addresses-header">
        <h2>My Addresses</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false }); }}>
          {showForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {showForm && (
        <form className="address-form card" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2">
            <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleInputChange} required /></div>
            <div className="form-group"><label className="form-label">Phone</label><input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Address Line</label><input type="text" name="addressLine" className="form-control" value={formData.addressLine} onChange={handleInputChange} required /></div>
          <div className="grid grid-cols-2">
            <div className="form-group"><label className="form-label">City</label><input type="text" name="city" className="form-control" value={formData.city} onChange={handleInputChange} required /></div>
            <div className="form-group"><label className="form-label">State</label><input type="text" name="state" className="form-control" value={formData.state} onChange={handleInputChange} required /></div>
            <div className="form-group"><label className="form-label">PIN Code</label><input type="text" name="postalCode" className="form-control" value={formData.postalCode} onChange={handleInputChange} required /></div>
            <div className="form-group"><label className="form-label">Country</label><input type="text" name="country" className="form-control" value={formData.country} onChange={handleInputChange} required /></div>
          </div>
          <div className="form-group flex align-center gap-2">
            <input type="checkbox" name="isDefault" id="isDefault" checked={formData.isDefault} onChange={handleInputChange} />
            <label htmlFor="isDefault">Set as Default Address</label>
          </div>
          <button type="submit" className="btn btn-primary">Save Address</button>
        </form>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="no-addresses card">
          <div className="no-products-icon">📍</div>
          <h3>No Addresses Found</h3>
          <p>Add your delivery address to proceed with orders seamlessly.</p>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="addresses-grid grid grid-cols-2">
          {addresses.map(addr => (
            <div key={addr.id} className="address-card card">
              {addr.isDefault && <span className="badge badge-primary default-badge">Default</span>}
              <h4>{addr.fullName}</h4>
              <p>{addr.addressLine}</p>
              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
              <p>{addr.country}</p>
              <p>Phone: {addr.phone}</p>
              <div className="address-actions mt-4 flex gap-2">
                <button onClick={() => handleEdit(addr)} className="btn btn-secondary">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Addresses;
