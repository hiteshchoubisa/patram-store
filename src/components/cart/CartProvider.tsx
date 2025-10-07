"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type CartLine = { id: string; name: string; price: number; qty: number; photo?: string | null };

type CartCtx = {
  lines: CartLine[];
  add: (l: CartLine, openCart?: boolean) => void;
  updateQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(lines));
  }, [lines]);

  function add(line: CartLine, openCart: boolean = true) {
    console.log('Adding to cart:', line);
    setLines(ls => {
      const i = ls.findIndex(l => l.id === line.id);
      if (i >= 0) {
        const next = [...ls];
        next[i] = { ...next[i], qty: next[i].qty + line.qty };
        console.log('Updated existing cart item:', next[i]);
        return next;
      }
      console.log('Added new cart item:', line);
      return [...ls, line];
    });
    if (openCart) {
      setOpen(true);
    }
  }
  function updateQty(id: string, qty: number) {
    setLines(ls => ls.map(l => l.id === id ? { ...l, qty: Math.max(1, qty) } : l));
  }
  function remove(id: string) { setLines(ls => ls.filter(l => l.id !== id)); }
  function clear() { setLines([]); }

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <Ctx.Provider value={{ lines, add, updateQty, remove, clear, total, count, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("CartProvider missing");
  return ctx;
}