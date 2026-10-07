import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="ss-profile-container">
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <span>Your Account</span>
      </div>

      <h1 className="ss-profile-title">Your Account</h1>

      <div className="ss-profile-grid">
        <Link to="/orders" className="ss-profile-card">
          <div className="ss-profile-icon">📦</div>
          <div className="ss-profile-info">
            <h3>Your Orders</h3>
            <p>Track, return, or buy things again</p>
          </div>
        </Link>
        
        <Link to="/addresses" className="ss-profile-card">
          <div className="ss-profile-icon">📍</div>
          <div className="ss-profile-info">
            <h3>Your Addresses</h3>
            <p>Edit addresses for orders and gifts</p>
          </div>
        </Link>
        
        <Link to="/wishlist" className="ss-profile-card">
          <div className="ss-profile-icon">❤️</div>
          <div className="ss-profile-info">
            <h3>Your Wishlist</h3>
            <p>View and manage saved items</p>
          </div>
        </Link>

        <div className="ss-profile-details card">
          <div className="ss-profile-header-banner">
             <div className="ss-profile-avatar-large">
               {getInitials(user?.firstName, user?.lastName)}
             </div>
          </div>
          <div className="ss-profile-details-content">
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p className="ss-profile-email">{user?.email}</p>
            <div className="ss-profile-role-badge">
              {user?.roles?.includes('ROLE_ADMIN') ? 'Administrator' : 'Customer'}
            </div>
            
            <button className="btn btn-secondary w-full" onClick={logout} style={{marginTop: '24px'}}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
