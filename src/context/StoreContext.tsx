/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShippingConfig, ShippingDetails, Order } from '../types';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  shippingConfig: ShippingConfig;
  cart: CartItem[];
  successfulOrderToShow: Order | null;
  setSuccessfulOrderToShow: (order: Order | null) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: string, product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateShippingConfig: (config: ShippingConfig) => Promise<boolean>;
  processCheckout: (shippingDetails: ShippingDetails, useSandbox?: boolean) => Promise<{ success: boolean; error?: string; paymentUrl?: string }>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  refreshProducts: () => void;
  refreshOrders: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({
    basePrice: 3500,
    freeShippingThreshold: 25000,
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [successfulOrderToShow, setSuccessfulOrderToShow] = useState<Order | null>(null);

  // Load initial data from Backend server
  const loadBackendData = async () => {
    try {
      const prodRes = await fetch('/api/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      const ordRes = await fetch('/api/orders');
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }

      const configRes = await fetch('/api/shipping-config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setShippingConfig(configData);
      }
    } catch (err) {
      console.error('Error loading full-stack database from backend:', err);
    }
  };

  useEffect(() => {
    loadBackendData();

    // Load cart from client storage
    const savedCart = localStorage.getItem('brewery_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Capture Webpay payment return status inside the URL query
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const orderId = params.get('order_id');

    if (paymentStatus === 'success' && orderId) {
      // Clear cart globally
      setCart([]);
      localStorage.removeItem('brewery_cart');

      // Fetch active orders to locate the matching order and open receipt view
      fetch('/api/orders')
        .then((res) => res.json())
        .then((ordersList: Order[]) => {
          setOrders(ordersList);
          const foundOrder = ordersList.find((o) => o.id === orderId);
          if (foundOrder) {
            setSuccessfulOrderToShow(foundOrder);
          }
        })
        .catch((err) => console.error('Error fetching order receipt from backend:', err));
    }
  }, []);

  const saveCartLocally = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem('brewery_cart', JSON.stringify(updated));
  };

  // Cart operations (Client-side)
  const addToCart = (product: Product, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart = [...cart];

    const currentDBProduct = products.find((p) => p.id === product.id) || product;

    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantity + quantity;
      updatedCart[existingIndex].quantity = Math.min(newQty, currentDBProduct.stock);
    } else {
      updatedCart.push({ product: currentDBProduct, quantity: Math.min(quantity, currentDBProduct.stock) });
    }

    saveCartLocally(updatedCart);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    let updatedCart = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.min(Math.max(1, quantity), product.stock) };
      }
      return item;
    });

    saveCartLocally(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    saveCartLocally(updatedCart);
  };

  const clearCart = () => {
    saveCartLocally([]);
  };

  // Synchronizers with Backend
  const syncProductsToBackend = async (updatedList: Product[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedList),
      });
      if (res.ok) {
        setProducts(updatedList);
        return true;
      }
    } catch (err) {
      console.error('Error writing product to server database:', err);
    }
    return false;
  };

  // Product Admin operations
  const addProduct = async (newProd: Omit<Product, 'id'>): Promise<boolean> => {
    const id = `beer-${Date.now()}`;
    const productWithId: Product = { ...newProd, id };
    const updated = [...products, productWithId];
    return await syncProductsToBackend(updated);
  };

  const updateProduct = async (id: string, updatedP: Product): Promise<boolean> => {
    const updatedList = products.map((p) => (p.id === id ? updatedP : p));
    const success = await syncProductsToBackend(updatedList);
    if (success) {
      // Sync in-cart metadata
      const updatedCart = cart.map((item) => {
        if (item.product.id === id) {
          return { ...item, product: updatedP };
        }
        return item;
      });
      saveCartLocally(updatedCart);
    }
    return success;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const updatedList = products.filter((p) => p.id !== id);
    const success = await syncProductsToBackend(updatedList);
    if (success) {
      const updatedCart = cart.filter((item) => item.product.id !== id);
      saveCartLocally(updatedCart);
    }
    return success;
  };

  const updateShippingConfig = async (config: ShippingConfig): Promise<boolean> => {
    try {
      const res = await fetch('/api/shipping-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setShippingConfig(config);
        return true;
      }
    } catch (err) {
      console.error('Error writing config to server:', err);
    }
    return false;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status }),
      });
      if (res.ok) {
        const bodyObj = await res.json();
        if (bodyObj.success) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
          return true;
        }
      }
    } catch (err) {
      console.error('Error updating order status near backend:', err);
    }
    return false;
  };

  // Checkout Session Generation
  const processCheckout = async (shippingDetails: ShippingDetails, useSandbox: boolean = false): Promise<{ success: boolean; error?: string; paymentUrl?: string }> => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingDetails,
          items: cart,
          useSandbox,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          paymentUrl: data.paymentUrl,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Ocurrió un error inesperado al procesar el pago.',
        };
      }
    } catch (err) {
      console.error('Checkout error:', err);
      return {
        success: false,
        error: 'Error de red al intentar conectar con el servidor comercial.',
      };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        shippingConfig,
        cart,
        successfulOrderToShow,
        setSuccessfulOrderToShow,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShippingConfig,
        processCheckout,
        updateOrderStatus,
        refreshProducts: loadBackendData,
        refreshOrders: loadBackendData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
