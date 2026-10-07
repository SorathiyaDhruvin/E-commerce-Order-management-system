import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const timelineSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = timelineSteps.indexOf(order.orderStatus);

  return (
    <div className="order-details-container animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2>Order Details <span className="text-secondary text-sm ml-2">#{order.orderNumber}</span></h2>
        <Link to="/orders" className="btn btn-secondary">Back to Orders</Link>
      </div>

      <div className="timeline-container card mb-6">
        <div className="timeline">
          {timelineSteps.map((step, index) => {
            let statusClass = "timeline-step ";
            if (index < currentStepIndex) statusClass += "completed";
            else if (index === currentStepIndex) statusClass += "active";
            
            return (
              <div key={step} className={statusClass}>
                <div className="step-circle"></div>
                <div className="step-label">{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card p-6">
            <h3 className="mb-4 border-b pb-2">Items in Order</h3>
            <div className="order-items-list">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b">
                  <div className="flex items-center gap-4">
                    <img src={item.productImageUrl || 'https://via.placeholder.com/80'} alt={item.productName} className="w-20 h-20 object-cover rounded" />
                    <div>
                      <h4 className="font-semibold">{item.productName}</h4>
                      <p className="text-sm text-secondary">Qty: {item.quantity} x ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="font-semibold">₹{item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card p-6 mb-6">
            <h3 className="mb-4 border-b pb-2">Order Summary</h3>
            <div className="flex justify-between mb-2"><span className="text-secondary">Subtotal</span><span>₹{order.totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between mb-2"><span className="text-secondary">Shipping</span><span>Free</span></div>
            <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t"><span>Total</span><span>₹{order.totalAmount.toFixed(2)}</span></div>
            <div className="mt-4 pt-4 border-t">
              <span className="text-secondary block mb-1">Payment Status:</span>
              <span className={`badge ₹{order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 border-b pb-2">Shipping Address</h3>
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-secondary text-sm">{order.shippingAddress.phone}</p>
            <p className="mt-2 text-sm">{order.shippingAddress.addressLine}</p>
            <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
            <p className="text-sm">{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
