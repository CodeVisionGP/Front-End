"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, MapPin, CreditCard } from "lucide-react";

import { useCart } from "@/context/CartContext";
import PaymentMethodSelector from "@/components/ui/PaymentMethodSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = "http://localhost:8000/api";
const PEDIDOS_URL = "http://localhost:8000/pedidos";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [obs, setObs] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addrErrors, setAddrErrors] = useState({});
  const [address, setAddress] = useState({
    nomeDestinatario: "",
    cep: "",
    numero: "",
    rua: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // ======================== 🔍 Buscar endereço ========================
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        setLoadingAddress(true);
        const userId = 4;
        const response = await axios.get(
          `${API_BASE_URL}/api/usuarios/${userId}/endereco`
        );
        if (response.data) setAddress(response.data);
      } catch (error) {
        console.error("Erro ao carregar endereço:", error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchUserAddress();
  }, []);

  // ======================== ✅ Validação ==============================
  const validateForm = () => {
    const errors = {};
    if (!address.nomeDestinatario) errors.nomeDestinatario = "Campo obrigatório";
    if (!address.cep) errors.cep = "Campo obrigatório";
    if (!address.numero) errors.numero = "Campo obrigatório";
    if (!address.rua) errors.rua = "Campo obrigatório";
    if (!address.bairro) errors.bairro = "Campo obrigatório";
    if (!address.cidade) errors.cidade = "Campo obrigatório";
    if (!address.estado) errors.estado = "Campo obrigatório";
    setAddrErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ======================== 🚀 Enviar pedido ==========================
  const handleConfirm = async () => {
    if (!validateForm()) return;

    if (!selectedPayment || !selectedPayment.method) {
      alert("Por favor, selecione um método de pagamento.");
      return;
    }

    setSubmitting(true);

    const orderData = {
      items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      total,
      address,
      paymentMethod: selectedPayment.method.codigo,
      observations: obs,
      changeFor: selectedPayment.troco || null,
    };

    try {
      const response = await fetch(PEDIDOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Falha ao criar pedido");

      const novoPedido = await response.json();
      const newOrderId = novoPedido.id;

      alert("Pedido confirmado com sucesso!");
      clearCart();
      router.push(`/pedidos/${newOrderId}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar o pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // ======================== 🎨 Layout ================================
  return (
    <motion.div
      className="container mx-auto p-4 md:p-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Finalizar Pedido
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Endereço */}
        <motion.div
          className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-orange-500" />
            <h3 className="text-lg font-semibold">Endereço de entrega</h3>
          </div>

          {loadingAddress ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
              <p className="mt-3 text-gray-500">Carregando endereço...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(address).map((key) => (
                <div key={key}>
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Label>
                  <Input
                    value={address[key]}
                    onChange={(e) =>
                      setAddress({ ...address, [key]: e.target.value })
                    }
                    placeholder={`Digite ${key}`}
                    className={
                      addrErrors[key]
                        ? "border-red-400 focus-visible:ring-red-400"
                        : ""
                    }
                  />
                  {addrErrors[key] && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagamento */}
        <motion.aside
          className="md:col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-orange-500" />
            <h3 className="text-lg font-semibold">Pagamento</h3>
          </div>

          <PaymentMethodSelector
            onSelectMethod={setSelectedPayment}
            totalOrderValue={total}
          />

          <Label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Observações (opcional)
          </Label>
          <Textarea
            placeholder="Ex.: Tirar a cebola, entregar no portão..."
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />

          <Button
            onClick={handleConfirm}
            disabled={submitting || cart.length === 0}
            className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              `Confirmar pedido (R$ ${total.toFixed(2)})`
            )}
          </Button>
        </motion.aside>
      </div>
    </motion.div>
  );
}
