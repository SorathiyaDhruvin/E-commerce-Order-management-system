import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 });

  const fetchOrders = async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${page}&size=10`);
      if (res.data.success) {
        setOrders(res.data.data.content);
        setPagination({
          page: res.data.data.page,
          totalPages: res.data.data.totalPages
        });
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
    window.scrollTo(0, 0);
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
    return (
      <div className="orders-container animate-fade-in">
        <h1 className="orders-title">My Orders</h1>
        <div className="orders-skeleton">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton-line skeleton" style={{height: '150px', marginBottom: '1rem'}}></div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container animate-fade-in">
        <h1 className="orders-title">My Orders</h1>
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h2>No orders found</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container animate-fade-in">
      <h1 className="orders-title">My Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card card">
            <div className="order-header">
              <div className="order-header-info">
                <div className="order-date">
                  <span className="label">Order Placed:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-total">
                  <span className="label">Total:</span>
                  <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="order-number">
                  <span className="label">Order #:</span>
                  <span className="font-monospace">{order.orderNumber}</span>
                </div>
              </div>
              <div className="order-status-badges">
                <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
                {order.paymentStatus === 'PAID' && (
                  <span className="badge badge-success ml-2">PAID</span>
                )}
              </div>
            </div>
            
            <div className="order-body">
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-image">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} />
                      ) : (
                        <div>Img</div>
                      )}
                    </div>
                    <div className="order-item-details">
                      <Link to={`/products/${item.productId}`} className="order-item-name">
                        {item.productName}
                      </Link>
                      <div className="order-item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="order-item-subtotal">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-shipping">
                <h4>Shipping Address</h4>
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page === 0}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page + 1} of {pagination.totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={pagination.page >= pagination.totalPages - 1}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
