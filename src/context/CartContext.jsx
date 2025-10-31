"use client";

// 1. Importe o 'useCallback'
import React, { 
  createContext, 
  useContext, 
  useState, 
  useMemo, 
  useCallback 
} from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 2. O 'total' é calculado e memoizado.
  // Ele NÃO usa 'useState'. Ele é apenas uma variável.
  const total = useMemo(() => {
    // Calcula a soma
    return cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }, [cart]); // O 'useMemo' só vai rodar de novo se o 'cart' mudar.

  // 3. Funções são envolvidas em 'useCallback'
  // Isso garante que elas não sejam recriadas a cada renderização.
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []); // O array vazio [] é porque 'setCart' tem garantia de ser estável

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // 4. O objeto 'value' também é memoizado
  // Isso otimiza os componentes que consomem o contexto.
  const value = useMemo(() => ({
    cart,
    total,
    addToCart,
    removeFromCart,
    clearCart,
  }), [cart, total, addToCart, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}