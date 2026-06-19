import React, { createContext, useContext, useState } from 'react';
import { api } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = qty;
        return [...prevItems, { product, quantity: initialQty }];
      }
    });
  };

  const updateQuantity = (productId, qty) => {
    const safeQty = Math.max(0, qty);
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: safeQty }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setSelectedCustomer(null);
    setCartItems([]);
  };

  const estimatedTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!selectedCustomer) {
      return { success: false, error: 'Please select a customer profile first.' };
    }
    if (cartItems.length === 0) {
      return { success: false, error: 'Please add at least one product to the order.' };
    }

    setOrderLoading(true);
    try {
      const itemsPayload = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      const response = await api.post('/orders', {
        customer_id: selectedCustomer.id,
        items: itemsPayload,
      });

      clearCart();
      return { success: true, order: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to place order. Transaction aborted.';
      return { success: false, error: message };
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        selectedCustomer,
        cartItems,
        orderLoading,
        selectCustomer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        estimatedTotal,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
