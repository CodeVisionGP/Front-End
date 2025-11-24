"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, DollarSign, Wallet, Loader2, AlertTriangle, ChevronDown, CheckCircle, Plus } from "lucide-react";

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
// 🔘 COMPONENTE DE BOTÃO DE MÉTODO (Mantido)
// ===================================================================
const MethodButton = ({ icon: Icon, name, selected, onClick, requiresChange, disabled=false }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition duration-200 ${
      selected
        ? "border-red-600 bg-red-50 shadow-md"
        : "border-gray-200 bg-white hover:bg-gray-50"
    } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
// 💳 COMPONENTE PRINCIPAL (ATUALIZADO)
// ===================================================================
export default function PaymentMethodSelector({ onSelectMethod, totalOrderValue, userCards = [], loadingCards = false }) {
  const [methods, setMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true); // Renomeado para evitar conflito com loadingCards
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null); // 🌟 NOVO: Cartão selecionado
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
        setLoadingMethods(false);
      }
    };
    fetchMethods();
  }, []);


  // 🛑 Função de Notificação de Seleção para o CheckoutPage
  const notifySelection = (method, card = null) => {
    onSelectMethod({
      method,
      card: card, // Passa o objeto do cartão selecionado
      troco: method.codigo === "DINHEIRO" ? trocoValue : null,
    });
  };


  // 🛑 Handler para a Seleção do Método Principal
  const handleSelection = (method) => {
    setSelectedMethod(method);
    if (method.codigo !== "DINHEIRO") setTrocoValue("");
    
    // Limpa o cartão se mudar de 'CARTAO' para outro método
    if (method.codigo !== "CARTAO") {
        setSelectedCard(null);
        notifySelection(method, null);
    } else {
        // Se for "CARTAO" e tiver cartões salvos, tenta selecionar o primeiro
        if (userCards.length > 0 && !selectedCard) {
            setSelectedCard(userCards[0]);
            notifySelection(method, userCards[0]);
        } else {
            notifySelection(method, selectedCard);
        }
    }
  };
  
  // 🛑 Handler para a Seleção do Cartão Salvo
  const handleCardSelection = (card) => {
      setSelectedCard(card);
      // Notifica o CheckoutPage com o método principal e o cartão específico
      notifySelection(selectedMethod, card);
  };


  const handleTrocoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setTrocoValue(value);

    if (selectedMethod) {
      notifySelection(selectedMethod, null);
    }
  };

  // ... Funções de formatação (mantidas) ...
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
  if (loadingMethods)
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

      <AnimatePresence>
          {selectedMethod?.codigo === "CARTAO" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pl-4 border-l-4 border-red-600 space-y-3"
            >
              <h4 className="font-semibold text-gray-700 mt-2">
                Cartões Salvos ({userCards.length})
              </h4>
              
              {loadingCards ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              ) : userCards.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nenhum cartão salvo. Adicione um novo.
                  </div>
              ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userCards.map((card) => (
                          <motion.button
                              key={card.id}
                              onClick={() => handleCardSelection(card)}
                              className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all ${
                                  selectedCard?.id === card.id
                                      ? "border-red-600 bg-red-50 ring-1 ring-red-300"
                                      : "border-gray-200 hover:bg-gray-50"
                              }`}
                          >
                              <div className="flex items-center gap-2 text-sm">
                                  <CreditCard className="w-4 h-4 text-red-500" />
                                  <span className="font-medium">{card.apelido || card.bandeira}</span>
                                  <span className="text-xs text-gray-500">**** **** **** {card.ultimos_quatro_digitos}</span>
                              </div>
                              {selectedCard?.id === card.id && <CheckCircle className="w-4 h-4 text-green-500" />}
                          </motion.button>
                      ))}
                  </div>
              )}
              {/* Adicionar opção de novo cartão aqui se necessário */}
            </motion.div>
          )}

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
      </AnimatePresence>
    </div>
  );
}