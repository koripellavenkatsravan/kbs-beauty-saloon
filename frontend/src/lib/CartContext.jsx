import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOCAL_CART_KEY = "kbs_local_cart";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token, auth } = useAuth();
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Persist local cart
  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  }, [items, user]);

  // Sync with server on login (merge local + server)
  useEffect(() => {
    const sync = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get(`${API}/cart`, auth);
        const server = data.items || [];
        const local = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
        const merged = [...server];
        for (const li of local) {
          if (!merged.some((s) => s.service_id === li.service_id)) {
            merged.push(li);
            await axios.post(`${API}/cart/add`, li, auth);
          }
        }
        setItems(merged);
        localStorage.removeItem(LOCAL_CART_KEY);
      } catch (e) { /* silent */ }
    };
    sync();
    // eslint-disable-next-line
  }, [token]);

  const addItem = useCallback(async (service) => {
    const item = { service_id: service.id, name: service.name, price: service.price };
    if (items.some((x) => x.service_id === item.service_id)) return;
    if (token) {
      const { data } = await axios.post(`${API}/cart/add`, item, auth);
      setItems(data.items || []);
    } else {
      setItems((prev) => [...prev, item]);
    }
  }, [items, token, auth]);

  const removeItem = useCallback(async (service_id) => {
    if (token) {
      const { data } = await axios.post(`${API}/cart/remove`, { service_id, name: "", price: 0 }, auth);
      setItems(data.items || []);
    } else {
      setItems((prev) => prev.filter((x) => x.service_id !== service_id));
    }
  }, [token, auth]);

  const clear = useCallback(async () => {
    if (token) { await axios.post(`${API}/cart/clear`, {}, auth); }
    setItems([]);
    localStorage.removeItem(LOCAL_CART_KEY);
  }, [token, auth]);

  const subtotal = items.reduce((s, x) => s + (x.price || 0), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clear, subtotal, tax, total,
      cartOpen, setCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
