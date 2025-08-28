// src/hooks/useCartSafe.ts
import defUseCart, { useCart as namedUseCart } from "../contexts/CartContext";

// Fallback-Objekt, falls wirklich gar kein Provider/Funktion verfügbar ist
const fallback = {
  items: [] as any[],
  count: 0,
  isOpen: false,
  add: (_p: any, _q?: number) => {},
  remove: (_id: number) => {},
  clear: () => {},
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
};

function resolveHook(): (() => typeof fallback) {
  const cand: any =
    typeof namedUseCart === "function"
      ? namedUseCart
      : typeof (defUseCart as any) === "function"
      ? defUseCart
      : null;

  if (!cand) {
    // liefert eine Funktion, die immer den Fallback zurückgibt
    return () => fallback;
  }
  return cand as any;
}

/** Immer sicherer Cart-Hook – bricht nie mit „is not a function“. */
export default function useCartSafe() {
  try {
    const hook = resolveHook();
    const v = hook();
    // falls ein leeres/ungültiges Objekt kommt, dennoch absichern
    return v && typeof v === "object" ? v : fallback;
  } catch {
    return fallback;
  }
}

// optional auch als named export anbieten
export { useCartSafe as useCart };
