import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders?size=50');
        if (res.data.success) {
          setOrders(res.data.data.content);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="ss-orders-container">
        <h1 className="ss-orders-title">Your Orders</h1>
        {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{height: '150px', marginBottom: '16px'}}></div>)}
      </div>
    );
  }

  return (
    <div className="ss-orders-container">
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/profile">Your Account</Link><span>›</span>
        <span>Your Orders</span>
      </div>

      <h1 className="ss-orders-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="ss-no-orders">
          <div className="ss-no-orders-icon">📦</div>
          <h2>You haven't placed any orders yet</h2>
          <p>When you do, their details will show up here.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="ss-orders-list">
          {orders.map(order => (
            <div key={order.id} className="ss-order-card">
              <div className="ss-order-header">
                <div className="ss-order-header-info">
                  <div className="ss-order-header-col">
                    <span className="ss-order-label">ORDER PLACED</span>
                    <span className="ss-order-value">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="ss-order-header-col">
                    <span className="ss-order-label">TOTAL</span>
                    <span className="ss-order-value">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="ss-order-header-col">
                    <span className="ss-order-label">SHIP TO</span>
                    <span className="ss-order-value ss-ship-to">
                      {order.shippingAddress?.fullName || 'User'} ▾
                    </span>
                  </div>
                </div>
                <div className="ss-order-header-actions">
                  <span className="ss-order-label">ORDER # {order.orderNumber}</span>
                  <Link to={`/orders/${order.id}`} className="ss-order-details-link">View order details</Link>
                </div>
              </div>
              
              <div className="ss-order-body">
                <div className="ss-order-status">
                  <h3 className={
                    order.orderStatus === 'DELIVERED' ? 'text-success' : 
                    order.orderStatus === 'CANCELLED' ? 'text-danger' : 'text-primary'
                  }>
                    {order.orderStatus === 'DELIVERED' ? 'Delivered' : 
                     order.orderStatus === 'CANCELLED' ? 'Cancelled' : 
                     order.orderStatus === 'SHIPPED' ? 'Shipped' : 'Preparing for Dispatch'}
                  </h3>
                  <p>Package status: {order.orderStatus}</p>
                </div>

                <div className="ss-order-items-preview">
                  {order.items?.map(item => (
                    <div key={item.id} className="ss-order-item-mini">
                      <div className="ss-item-mini-img">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt={item.productName} />
                        ) : (
                          <div className="ss-cart-img-placeholder">Img</div>
                        )}
                      </div>
                      <div className="ss-item-mini-info">
                        <Link to={`/products/${item.productId}`} className="ss-item-mini-name">{item.productName}</Link>
                        <span className="ss-item-mini-qty">Qty: {item.quantity}</span>
                      </div>
                      <div className="ss-item-mini-actions">
                        <Link to={`/products/${item.productId}`} className="btn btn-secondary btn-sm w-full">Buy it again</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
