import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = filter ? `/admin/orders?status=${filter}&size=100` : `/admin/orders?size=100`;
      const res = await api.get(endpoint);
      if (res.data.success) {
        setOrders(res.data.data.content);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders(); // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'CONFIRMED': return 'badge-info';
      case 'SHIPPED': return 'badge-primary';
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  if (loading && orders.length === 0) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-table-container animate-fade-in">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Manage Orders</h2>
        
        <div className="filter-controls">
          <select 
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Orders</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="font-monospace">{order.orderNumber}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.customerName}</td>
                <td className="font-semibold">${order.totalAmount.toFixed(2)}</td>
                <td>
                  <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  <select 
                    className="form-control" 
                    style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={order.orderStatus === 'CANCELLED' || order.orderStatus === 'DELIVERED'}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="empty-table">No orders found.</div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
