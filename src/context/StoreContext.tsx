/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShippingConfig, ShippingDetails, Order } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  shippingConfig: ShippingConfig;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  updateShippingConfig: (config: ShippingConfig) => void;
  processCheckout: (shippingDetails: ShippingDetails, cardBrand: string) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
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

  // Load initial data
  useEffect(() => {
    const savedProducts = localStorage.getItem('brewery_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('brewery_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    const savedOrders = localStorage.getItem('brewery_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders([]);
    }

    const savedShipping = localStorage.getItem('brewery_shipping_config');
    if (savedShipping) {
      setShippingConfig(JSON.parse(savedShipping));
    }

    const savedCart = localStorage.getItem('brewery_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sync to local storage helper
  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('brewery_products', JSON.stringify(updated));
  };

  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    localStorage.setItem('brewery_orders', JSON.stringify(updated));
  };

  const saveCart = (updated: CartItem[]) => {
    setCart(updated);
    localStorage.setItem('brewery_cart', JSON.stringify(updated));
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantity + quantity;
      // Cap at product stock
      updatedCart[existingIndex].quantity = Math.min(newQty, product.stock);
    } else {
      updatedCart.push({ product, quantity: Math.min(quantity, product.stock) });
    }

    saveCart(updatedCart);
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

    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Admin Product operations
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `beer-${Date.now()}`;
    const productWithId: Product = { ...newProd, id };
    const updatedPrs = [...products, productWithId];
    saveProducts(updatedPrs);
  };

  const updateProduct = (id: string, updatedP: Product) => {
    const updatedPrs = products.map((p) => (p.id === id ? updatedP : p));
    saveProducts(updatedPrs);

    // Sync product in active cart search as well
    const updatedCart = cart.map((item) => {
      if (item.product.id === id) {
        return { ...item, product: updatedP };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const deleteProduct = (id: string) => {
    const updatedPrs = products.filter((p) => p.id !== id);
    saveProducts(updatedPrs);

    // Also remove from cart if present
    const updatedCart = cart.filter((item) => item.product.id !== id);
    saveCart(updatedCart);
  };

  const updateShippingConfig = (config: ShippingConfig) => {
    setShippingConfig(config);
    localStorage.setItem('brewery_shipping_config', JSON.stringify(config));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveOrders(updatedOrders);
  };

  // Checkout transaction
  const processCheckout = (shippingDetails: ShippingDetails, cardBrand: string) => {
    // 1. Perform stock validation check
    const outOfStockItems: string[] = [];
    cart.forEach((item) => {
      const dbProduct = products.find((p) => p.id === item.product.id);
      if (!dbProduct || dbProduct.stock < item.quantity) {
        outOfStockItems.push(item.product.name);
      }
    });

    if (outOfStockItems.length > 0) {
      return {
        success: false,
        error: `Lo sentimos, los siguientes productos no tienen suficiente stock: ${outOfStockItems.join(', ')}.`,
      };
    }

    // 2. Calculate subtotals and discounts
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shippingCost = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.basePrice;
    const total = subtotal + shippingCost;

    // 3. Deduct stock from the db products list
    const updatedProducts = products.map((p) => {
      const cartItem = cart.find((item) => item.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    // Save updated products to DB
    saveProducts(updatedProducts);

    // 4. Create Order
    const newOrder: Order = {
      id: `CL-ORD-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`,
      date: new Date().toISOString(),
      items: [...cart],
      shippingDetails,
      subtotal,
      shippingCost,
      total,
      status: 'Pendiente',
      paymentId: `WP-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);

    // 5. Trigger dispatch mock data notification payload
    console.log('[E-Commerce Dispatch Notification Service]: Order created', {
      orderId: newOrder.id,
      dispatchAddress: `${shippingDetails.address}, ${shippingDetails.commune}`,
      items: newOrder.items.map(item => `${item.product.name} x${item.quantity}`),
      subtotal: newOrder.subtotal,
      shippingCost: newOrder.shippingCost,
      total: newOrder.total
    });

    // Clear active cart
    saveCart([]);

    return {
      success: true,
      order: newOrder,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        shippingConfig,
        cart,
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
