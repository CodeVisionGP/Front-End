"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  X,
  ChevronRight,
  Minus,
  Plus,
  Utensils,
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Frown,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";

// ===================================================================
// ⚙️ CONFIGURAÇÕES
// ===================================================================
const API_BASE_URL = "http://localhost:8000/api";
const USER_ID_MOCK = "4";

// ===================================================================
// 💡 FUNÇÕES AUXILIARES
// ===================================================================
const formatCurrencyBRL = (n) => {
  if (Number.isNaN(n)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number(n) || 0);
};

// ===================================================================
// 💠 COMPONENTES BÁSICOS
// ===================================================================
const Card = ({ className, children }) => (
  <div className={`rounded-2xl bg-white shadow-lg border border-gray-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ className, children, disabled, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    disabled={disabled}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4E00]
      disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

// ===================================================================
// 🛒 ITEM DA SACOLA
// ===================================================================
const SacolaItem = ({ item, onUpdate, onDelete }) => {
  const itemTotal = item.preco_unitario * item.quantidade;

  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
          <Utensils className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">{item.nome}</h3>
          <p className="text-sm text-gray-500">{formatCurrencyBRL(item.preco_unitario)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-300 rounded-full">
          <Button
            onClick={() => onUpdate(item.id, item.quantidade - 1)}
            className="p-1 h-8 w-8 bg-white text-gray-600 hover:bg-gray-100 rounded-full"
            disabled={item.quantidade <= 1}
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="px-3 text-sm font-semibold text-neutral-700">
            {item.quantidade}
          </span>

          <Button
            onClick={() => onUpdate(item.id, item.quantidade + 1)}
            className="p-1 h-8 w-8 bg-white text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="font-bold text-neutral-800 w-20 text-right">
            {formatCurrencyBRL(itemTotal)}
          </span>

          <Button
            onClick={() => onDelete(item.id)}
            className="p-2 bg-[#FF4E00]/10 text-[#FF4E00] hover:bg-[#FF4E00] hover:text-white rounded-full h-8 w-8 transition"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// 🧺 PÁGINA SACOLA
// ===================================================================
export default function SacolaPage() {
  const [sacola, setSacola] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = USER_ID_MOCK;

  // 🔹 Buscar itens da sacola
  useEffect(() => {
    const fetchSacola = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/sacola/${userId}`);
        setSacola(response.data);
      } catch (err) {
        console.error("Erro ao carregar sacola:", err);
        setError("Não foi possível carregar sua sacola. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchSacola();
  }, [userId]);

  // 🔹 Atualizar item
  const handleUpdateItem = async (itemId, newQuantity) => {
    if (newQuantity <= 0) return handleDeleteItem(itemId);
    setSacola((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantidade: newQuantity } : item))
    );
    try {
      await axios.put(`${API_BASE_URL}/sacola/${userId}/${itemId}`, {
        quantidade: newQuantity,
      });
    } catch {
      setError("Erro ao atualizar item da sacola.");
    }
  };

  // 🔹 Remover item
  const handleDeleteItem = async (itemId) => {
    setSacola((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await axios.delete(`${API_BASE_URL}/sacola/${userId}/${itemId}`);
    } catch {
      setError("Erro ao remover item da sacola.");
    }
  };

  // 💰 Cálculos
  const subtotal = useMemo(
    () => sacola.reduce((acc, item) => acc + item.preco_unitario * item.quantidade, 0),
    [sacola]
  );
  const taxaEntrega = 10.0;
  const total = subtotal + taxaEntrega;

  const isCheckoutDisabled = sacola.length === 0 || loading;

  // ===================================================================
  // 🎨 RENDERIZAÇÃO CONDICIONAL
  // ===================================================================
  const renderContent = () => {
    if (loading)
      return (
        <div className="text-center py-20 text-gray-600">
          <ShoppingCart className="w-12 h-12 mx-auto animate-bounce text-[#FF4E00]" />
          <p className="mt-4 text-lg">Carregando sua sacola...</p>
        </div>
      );

    if (error)
      return (
        <div className="text-center py-20 bg-[#FFE1D6] rounded-xl border border-[#FF4E00]/40 text-[#E84300]">
          <p className="font-semibold">{error}</p>
        </div>
      );

    if (sacola.length === 0)
      return (
        <div className="text-center py-20 text-gray-500">
          <Frown className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl font-bold">Sua sacola está vazia.</p>
          <p className="mt-2 text-gray-600">Adicione alguns itens deliciosos!</p>
          <Button
            onClick={() => (window.location.href = "/consulta_restaurante")}
            className="mt-6 bg-[#FF4E00] hover:bg-[#E84300] text-white px-6 py-3 shadow-lg rounded-xl"
          >
            Voltar aos Restaurantes
          </Button>
        </div>
      );

    return (
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 🧾 Itens */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-neutral-800">
              Itens na Sacola ({sacola.length}){" "}
              <span className="text-gray-500 font-normal text-base ml-2">
                ({formatCurrencyBRL(subtotal)})
              </span>
            </h2>
            <div className="divide-y divide-gray-100">
              {sacola.map((item) => (
                <SacolaItem
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* 💰 Resumo do Pedido */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-2 border-[#FF4E00]/40">
            <h2 className="text-xl font-bold mb-4 text-[#FF4E00]">Resumo do Pedido</h2>

            <div className="space-y-3 border-b pb-4 mb-4 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrencyBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Entrega:</span>
                <span>{formatCurrencyBRL(taxaEntrega)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold text-neutral-800">
              <span>Total:</span>
              <span className="text-[#FF4E00]">{formatCurrencyBRL(total)}</span>
            </div>

            <Link
              href="/fechamento_pedido"
              passHref
              className={isCheckoutDisabled ? "pointer-events-none" : ""}
              aria-disabled={isCheckoutDisabled}
              tabIndex={isCheckoutDisabled ? -1 : undefined}
            >
              <Button
                className="w-full mt-6 bg-[#FF4E00] hover:bg-[#E84300] text-white py-3 text-lg shadow-2xl flex items-center justify-center gap-2"
                disabled={isCheckoutDisabled}
              >
                <CheckCircle size={20} /> Ir para Pagamento
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  };

  // ===================================================================
  // 🧭 RETORNO FINAL
  // ===================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF7A00] to-[#FF4E00] pb-16 flex flex-col items-center">
      <div className="max-w-6xl w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 mt-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center mb-10"
        >
          <Button
            onClick={() => window.history.back()}
            className="p-2 bg-[#FFF4EF] hover:bg-[#FFE1D6] text-[#FF4E00] rounded-full h-10 w-10 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-3xl font-extrabold text-neutral-800 flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2 text-[#FF4E00]" /> Sua Sacola
          </h1>
        </motion.div>

        {renderContent()}
      </div>
    </div>
  );
}
