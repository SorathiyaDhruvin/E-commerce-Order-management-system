import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading dashboard data...</div>;
  }

  if (!stats) {
    return <div className="admin-error">Failed to load dashboard data.</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="stats-grid grid grid-cols-4">
        
        <div className="stat-card card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-info">
            <p className="stat-label">Total Revenue</p>
            <h3 className="stat-value">${stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon orders">🛍️</div>
          <div className="stat-info">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats.totalOrders}</h3>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon users">👥</div>
          <div className="stat-info">
            <p className="stat-label">Total Users</p>
            <h3 className="stat-value">{stats.totalUsers}</h3>
          </div>
        </div>
        
        <div className="stat-card card">
          <div className="stat-icon products">📦</div>
          <div className="stat-info">
            <p className="stat-label">Total Products</p>
            <h3 className="stat-value">{stats.totalProducts}</h3>
          </div>
        </div>
        
      </div>
      
      <div className="dashboard-sections grid grid-cols-2">
        
        <div className="dashboard-section card">
          <h3 className="section-title">Order Status</h3>
          <div className="status-items">
            <div className="status-item">
              <div className="status-label">
                <span className="status-dot pending"></span>
                Pending Orders
              </div>
              <span className="status-value">{stats.pendingOrders}</span>
            </div>
            <div className="status-item">
              <div className="status-label">
                <span className="status-dot delivered"></span>
                Delivered Orders
              </div>
              <span className="status-value">{stats.deliveredOrders}</span>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section card">
          <h3 className="section-title">Inventory Alerts</h3>
          <div className="alert-item">
            <div className="alert-icon">⚠️</div>
            <div className="alert-info">
              <h4>Low Stock Products</h4>
              <p>{stats.lowStockProducts} products are running low on stock (≤ 5 items).</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
