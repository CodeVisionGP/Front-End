// src/context/Providers.jsx

// 1. Este arquivo PRECISA ter o "use client"
"use client";

// 2. Importe o CartProvider do arquivo que você acabou de salvar
import { CartProvider } from "@/context/CartContext"; 

// 3. Este componente "embrulha" todos os seus providers
export default function Providers({ children }) {
  return (
    <CartProvider>
      {/* Se você tiver outros providers (ex: AuthProvider),
          eles entram aqui também, um dentro do outro */}
      {children}
    </CartProvider> // <-- ✅ CORRIGIDO! (antes era CartCartProvider)
  );
}