"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, Wallet, Loader2, AlertTriangle } from "lucide-react";

// ===================================================================
// ⚙️ CONFIGURAÇÃO DA API
// ===================================================================
const API_URL = "http://localhost:8000/api/payment_methods";

const iconMap = {
  PIX: Wallet,
  CARTAO: CreditCard,
  DINHEIRO: DollarSign,
};

// ===================================================================
// 🔘 COMPONENTE DE BOTÃO DE MÉTODO
// ===================================================================
const MethodButton = ({ icon: Icon, name, selected, onClick, requiresChange }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition duration-200 ${
      selected
        ? "border-red-600 bg-red-50 shadow-md"
        : "border-gray-200 bg-white hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center">
      <Icon
        className={`w-6 h-6 mr-3 ${selected ? "text-red-600" : "text-gray-500"}`}
      />
      <span
        className={`font-semibold ${selected ? "text-gray-900" : "text-gray-700"}`}
      >
        {name}
      </span>
    </div>
    {requiresChange && (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-300">
        Requer Troco
      </span>
    )}
  </motion.button>
);

// ===================================================================
// 💳 COMPONENTE PRINCIPAL
// ===================================================================
export default function PaymentMethodSelector({ onSelectMethod, totalOrderValue }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [trocoValue, setTrocoValue] = useState("");

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await axios.get(API_URL);
        setMethods(res.data);
      } catch (err) {
        console.error("Erro ao carregar métodos:", err);
        setError("Falha ao carregar métodos de pagamento.");
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  const handleSelection = (method) => {
    setSelectedMethod(method);
    if (method.codigo !== "DINHEIRO") setTrocoValue("");

    onSelectMethod({
      method,
      troco: method.codigo === "DINHEIRO" ? trocoValue : null,
    });
  };

  const handleTrocoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setTrocoValue(value);

    if (selectedMethod) {
      onSelectMethod({
        method: selectedMethod,
        troco: value,
      });
    }
  };

  const formatTrocoDisplay = (value) => {
    const cents = parseInt(value.replace(/\D/g, ""), 10) || 0;
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatCurrencyBRL = (n) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(Number(n) || 0);

  // -------------------------------------------------------------------
  // 🖼️ Renderização
  // -------------------------------------------------------------------
  if (loading)
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto" />
        <p className="mt-2 text-gray-600">Carregando opções de pagamento...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-100 rounded-lg border border-red-400 flex items-center">
        <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        Escolha o Método de Pagamento
      </h2>

      {methods.map((method) => {
        const Icon = iconMap[method.codigo] || CreditCard;
        return (
          <MethodButton
            key={method.id}
            icon={Icon}
            name={method.nome}
            requiresChange={method.requer_troco}
            selected={selectedMethod?.id === method.id}
            onClick={() => handleSelection(method)}
          />
        );
      })}

      {selectedMethod?.codigo === "DINHEIRO" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow-inner"
        >
          <label
            htmlFor="troco"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Precisa de troco para quanto? (Valor atual do pedido:{" "}
            {formatCurrencyBRL(totalOrderValue)})
          </label>

          <input
            id="troco"
            type="text"
            value={trocoValue}
            onChange={handleTrocoChange}
            placeholder="Ex: 5000 (para R$ 50,00)"
            className="w-full border border-yellow-300 rounded-lg p-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <p className="text-sm text-gray-600 mt-1">
            Troco para:{" "}
            <span className="font-bold text-yellow-700">
              {trocoValue ? formatTrocoDisplay(trocoValue) : "—"}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
