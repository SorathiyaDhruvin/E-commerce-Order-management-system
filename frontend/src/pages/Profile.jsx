import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.success) {
          setProfile({
            firstName: res.data.data.firstName || '',
            lastName: res.data.data.lastName || '',
            email: res.data.data.email || '',
            phone: res.data.data.phone || ''
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          {profile.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
        </div>
        <h3>{profile.firstName} {profile.lastName}</h3>
        <p>{profile.email}</p>
      </div>
      <div className="profile-content">
        <h2>My Profile</h2>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" className="form-control" value={profile.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" className="form-control" value={profile.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email (Read Only)</label>
            <input type="email" className="form-control" value={profile.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" name="phone" className="form-control" value={profile.phone} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Profile;
