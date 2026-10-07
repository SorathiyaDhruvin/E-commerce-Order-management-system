import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛍️' },
    { path: '/', label: 'Back to Store', icon: '🏪' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">ShopSphere Admin</Link>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">{user?.firstName?.charAt(0) || 'A'}</div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.firstName} {user?.lastName}</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="btn-admin-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <h2>
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="admin-header-actions">
            <span className="admin-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
