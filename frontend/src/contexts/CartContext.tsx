// src/contexts/CartContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Product } from "../lib/api";

export type CartItem = { product: Product; qty: number };

// State-Shape, wie bolt.new es typischerweise nutzt
type CartState = { items: CartItem[] };

// Komplette API – kompatibel zu bolt.new + unsere alten Felder
type CartCtx = {
  // bolt.new Stil
  state: CartState;
  addItem: (product: Product, qty?: number) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number; // Summe aus product.price, falls vorhanden
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Backwards-Compat (falls irgendwo noch verwendet)
  items: CartItem[];
  count: number;
  isOpen: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "lampadina.cart.v1";

const CartContext = createContext<CartCtx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  // Laden aus localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Speichern in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (product: Product, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((ci) => ci.product.id === product.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { product, qty }];
    });
  };

  const addToCart = addItem; // Alias (bolt.new verwendet oft addToCart)

  const removeItem = (productId: number) =>
    setItems((prev) => prev.filter((ci) => ci.product.id !== productId));

  const updateQuantity = (productId: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((ci) => ci.product.id !== productId);
      const i = prev.findIndex((ci) => ci.product.id === productId);
      if (i < 0) return prev;
      const copy = [...prev];
      copy[i] = { ...copy[i], qty };
      return copy;
    });
  };

  const clearCart = () => setItems([]);

  const getTotalItems = () => items.reduce((n, i) => n + i.qty, 0);

  const getTotalPrice = () =>
    items.reduce((sum, i) => sum + (Number(i.product.price ?? 0) * i.qty), 0);

  const openCart = () => setOpen(true);
  const closeCart = () => setOpen(false);
  const toggleCart = () => setOpen((v) => !v);

  // Backwards-Compat-Werte
  const count = useMemo(getTotalItems, [items]);
  const add = addItem;
  const remove = removeItem;
  const clear = clearCart;

  const value: CartCtx = {
    // bolt.new
    state: { items },
    addItem,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    openCart,
    closeCart,
    toggleCart,
    // kompatibel
    items,
    count,
    isOpen,
    add,
    remove,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook (named) */
export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // Fallback, damit nie ein White-Screen entsteht
    const dummy: CartCtx = {
      state: { items: [] },
      addItem: () => {},
      addToCart: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
      openCart: () => {},
      closeCart: () => {},
      toggleCart: () => {},
      items: [],
      count: 0,
      isOpen: false,
      add: () => {},
      remove: () => {},
      clear: () => {},
    };
    return dummy;
  }
  return ctx;
}

/** Default-Export = Hook (kompatibel zu `import useCart from ...`) */
export default useCart;
