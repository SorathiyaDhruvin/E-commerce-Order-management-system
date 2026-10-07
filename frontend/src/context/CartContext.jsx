import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCart({ items: [], total: 0 });
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.get('/cart');
            if (response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            return false;
        }
        
        try {
            const response = await api.post('/cart/items', { productId, quantity });
            if (response.data.success) {
                setCart(response.data.data);
                toast.success("Added to cart");
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add item');
            return false;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
            if (response.data.success) {
                setCart(response.data.data);
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update quantity');
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const response = await api.delete(`/cart/items/${itemId}`);
            if (response.data.success) {
                setCart(response.data.data);
                toast.success("Removed from cart");
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove item');
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const response = await api.delete('/cart/clear');
            if (response.data.success) {
                setCart({ items: [], total: 0 });
                return true;
            }
        } catch (error) {
            console.error('Failed to clear cart', error);
            return false;
        }
    };

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
