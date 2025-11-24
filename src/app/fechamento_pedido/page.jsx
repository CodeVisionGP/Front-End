"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  Loader2, MapPin, CreditCard, Bike, Rocket, CalendarClock 
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// 🔗 Config
const API_BASE_URL = "http://localhost:8000/api";
const USER_ID = 2;

// 💰 Formatação
const formatCurrency = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, subtotal, deliveryFee, checkout, fetchCart, loading: loadingCart } = useCart();

  // 💳 Pagamento / Observações
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [obs, setObs] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🚚 Entrega
  const [deliveryType, setDeliveryType] = useState("NORMAL");
  const [scheduledTime, setScheduledTime] = useState("");

  // 📍 Endereço e Cartões
  const [address, setAddress] = useState({ id: null, rua: "", numero: "", bairro: "" });
  const [userCards, setUserCards] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [addrErrors, setAddrErrors] = useState({});

  // 🔍 Buscar Endereço
  const fetchUserAddress = useCallback(async () => {
    try {
      setLoadingAddress(true);
      const { data } = await axios.get(`${API_BASE_URL}/restaurantes/endereco/${USER_ID}`);
      if (data) setAddress(data);
    } catch (err) {
      if (err.response?.status === 404) setAddrErrors({ api: "Endereço não cadastrado." });
      console.error("Erro endereço:", err);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  // 💳 Buscar Cartões
  const fetchUserCards = useCallback(async () => {
    try {
      setLoadingCards(true);
      const { data } = await axios.get(`${API_BASE_URL}/payment_methods/cards/${USER_ID}`);
      setUserCards(data);
    } catch (err) {
      console.error("Erro ao buscar cartões:", err);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  // 🚀 Buscar info inicial
  useEffect(() => {
    fetchUserAddress();
    fetchUserCards();
  }, []);

  // 🧺 Garantia de carrinho carregado
  useEffect(() => {
    if (cart.length === 0 && !loadingCart) fetchCart();
  }, [cart.length, loadingCart, fetchCart]);

  // 🧾 Confirmar Pedido
  const handleConfirm = async () => {
    if (!address.id || !selectedPayment || cart.length === 0)
      return alert("Verifique os dados do pedido.");

    if (deliveryType === "AGENDADA" && !scheduledTime)
      return alert("Escolha um horário para agendamento.");

    const paymentMethodCode = selectedPayment.method.codigo;
    const cardToken = selectedPayment.card?.token_gateway ?? null;

    setSubmitting(true);

    try {
      const newOrder = await checkout(
        address.id,
        paymentMethodCode,
        obs,
        deliveryType,
        scheduledTime,
        cardToken
      );
      alert("Pedido realizado com sucesso!");
      router.push(`/pedidos/${newOrder.id}`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 🏍️ Componente de opção de entrega
  const DeliveryOption = ({ type, icon: Icon, title, desc, price }) => {
    const active = deliveryType === type;
    return (
      <div
        onClick={() => setDeliveryType(type)}
        className={`cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all ${
          active ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : "border-gray-200 hover:border-orange-300"
        }`}
      >
        <div className={`p-2 rounded-full ${active ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
          <Icon size={24} />
        </div>
        <div className="flex-grow">
          <h4 className={`font-bold ${active ? "text-orange-900" : "text-gray-700"}`}>{title}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
        {price && <span className="text-sm font-bold text-gray-700">+{formatCurrency(price)}</span>}
      </div>
    );
  };

  // 📌 Render
  return (
    <motion.div className="container mx-auto p-4 md:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 🛵 Seção de entrega + Endereço */}
        <div className="md:col-span-2 space-y-6">
          {/* Tipo de entrega */}
          <motion.div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bike className="text-orange-500" />
              <h3 className="text-lg font-semibold">Tipo de Entrega</h3>
            </div>

            <div className="grid gap-3">
              <DeliveryOption type="NORMAL" icon={Bike} title="Entrega Padrão" desc="30-45 min" />
              <DeliveryOption type="RAPIDA" icon={Rocket} title="Entrega Flash" desc="Prioridade (15-25 min)" price={5.0} />
              <DeliveryOption type="AGENDADA" icon={CalendarClock} title="Agendar" desc="Escolha o melhor horário" />
            </div>

            {deliveryType === "AGENDADA" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4">
                <Label>Horário de Entrega</Label>
                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="mt-1" required />
              </motion.div>
            )}
          </motion.div>

          {/* Endereço */}
          <motion.div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-orange-500" />
              <h3 className="text-lg font-semibold">Endereço</h3>
            </div>

            {loadingAddress ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Input
                disabled
                value={`${address.rua}, ${address.numero} - ${address.bairro}`}
                className="bg-gray-50"
              />
            )}
          </motion.div>
        </div>

        {/* 💳 Pagamento */}
        <motion.aside className="md:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-orange-500" />
            <h3 className="text-lg font-semibold">Pagamento</h3>
          </div>

          <PaymentMethodSelector
            onSelectMethod={setSelectedPayment}
            totalOrderValue={total}
            userCards={userCards}
            loadingCards={loadingCards}
          />

          {/* 💵 Totais */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Entrega</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            {deliveryType === "RAPIDA" && (
              <div className="flex justify-between text-orange-600">
                <span>Flash</span>
                <span>{formatCurrency(5.0)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(total + (deliveryType === "RAPIDA" ? 5.0 : 0))}</span>
            </div>
          </div>

          {/* 🗒 Observações */}
          <Label className="mt-4 block">Observações</Label>
          <Textarea value={obs} onChange={(e) => setObs(e.target.value)} />

          {/* ✔ Botão final */}
          <Button
            onClick={handleConfirm}
            disabled={submitting || cart.length === 0}
            className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {submitting ? <Loader2 className="animate-spin" /> : "Confirmar Pedido"}
          </Button>
        </motion.aside>
      </div>
    </motion.div>
  );
}
