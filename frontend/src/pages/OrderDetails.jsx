import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/helpers';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="ss-order-details-container">
        <div className="skeleton" style={{height: '32px', width: '200px', marginBottom: '16px'}}></div>
        <div className="skeleton" style={{height: '200px', marginBottom: '16px'}}></div>
        <div className="skeleton" style={{height: '300px'}}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="ss-order-details-container">
        <div className="ss-error-card">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="ss-order-details-container">
      <div className="ss-breadcrumb">
        <Link to="/">Home</Link><span>›</span>
        <Link to="/profile">Your Account</Link><span>›</span>
        <Link to="/orders">Your Orders</Link><span>›</span>
        <span>Order Details</span>
      </div>

      <div className="ss-order-details-header">
        <h1>Order Details</h1>
        <div className="ss-order-meta">
          <span>Ordered on {formatDate(order.createdAt)}</span>
          <span className="ss-divider">|</span>
          <span>Order# {order.orderNumber}</span>
        </div>
      </div>

      <div className="ss-order-details-grid">
        {/* Left Column: Shipping & Summary */}
        <div className="ss-order-info-col">
          <div className="ss-info-box">
            <h3>Shipping Address</h3>
            {order.shippingAddress ? (
              <div className="ss-address-details">
                <strong>{order.shippingAddress.fullName}</strong>
                <p>{order.shippingAddress.addressLine}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p>No shipping address provided.</p>
            )}
          </div>

          <div className="ss-info-box">
            <h3>Payment Method</h3>
            <p>Status: <span className={order.paymentStatus === 'PAID' ? 'text-success' : 'text-warning'}>
              {order.paymentStatus}
            </span></p>
          </div>

          <div className="ss-info-box ss-summary-box">
            <h3>Order Summary</h3>
            <div className="ss-summary-row">
              <span>Item(s) Subtotal:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="ss-summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="ss-summary-divider"></div>
            <div className="ss-summary-row ss-summary-total">
              <span>Grand Total:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Items */}
        <div className="ss-order-items-col">
          <div className="ss-items-box">
            <h3 className={
              order.orderStatus === 'DELIVERED' ? 'text-success' : 
              order.orderStatus === 'CANCELLED' ? 'text-danger' : 'text-primary'
            }>
              {order.orderStatus === 'DELIVERED' ? 'Delivered' : 
               order.orderStatus === 'CANCELLED' ? 'Cancelled' : 
               order.orderStatus === 'SHIPPED' ? 'Shipped' : 'Preparing for Dispatch'}
            </h3>
            
            <div className="ss-details-item-list">
              {order.items?.map(item => (
                <div key={item.id} className="ss-details-item">
                  <div className="ss-details-item-img">
                    {item.productImageUrl ? (
                      <img src={item.productImageUrl} alt={item.productName} />
                    ) : (
                      <div className="ss-cart-img-placeholder">Img</div>
                    )}
                  </div>
                  <div className="ss-details-item-info">
                    <Link to={`/products/${item.productId}`} className="ss-details-item-name">{item.productName}</Link>
                    <span className="ss-details-item-price">{formatPrice(item.price)}</span>
                    <span className="ss-details-item-qty">Qty: {item.quantity}</span>
                    <div className="ss-details-item-actions">
                      <Link to={`/products/${item.productId}`} className="btn btn-secondary btn-sm">Buy it again</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
