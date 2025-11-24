"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ShoppingBag,
  Calendar
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

// Função para formatar data
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Função para formatar moeda
const formatCurrency = (val) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

// Configuração visual dos status (simplificada para lista)
const statusColors = {
  "PENDENTE": "text-yellow-600 bg-yellow-50 border-yellow-200",
  "CONFIRMADO": "text-blue-600 bg-blue-50 border-blue-200",
  "EM_PREPARO": "text-orange-600 bg-orange-50 border-orange-200",
  "SAIU_PARA_ENTREGA": "text-purple-600 bg-purple-50 border-purple-200",
  "CONCLUIDO": "text-green-600 bg-green-50 border-green-200",
  "CANCELADO": "text-red-600 bg-red-50 border-red-200",
};

const statusIcons = {
  "PENDENTE": Clock,
  "CONFIRMADO": CheckCircle,
  "EM_PREPARO": Clock,
  "SAIU_PARA_ENTREGA": Clock, 
  "CONCLUIDO": CheckCircle,
  "CANCELADO": XCircle,
};

export default function HistoricoPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Chama a rota GET /api/pedidos/ que criamos no backend
        const response = await axios.get(`${API_BASE_URL}/pedidos/`);
        setPedidos(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setError("Não foi possível carregar seu histórico.");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  // Renderização do Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pb-10">
        <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <Link href="/consulta_restaurante">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </Link>
              <h1 className="text-2xl font-bold">Meus Pedidos</h1>
            </div>
        </header>
        <main className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-32" />
            ))}
        </main>
      </div>
    );
  }

  // Renderização de Erro
  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-10">
            <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                <Link href="/consulta_restaurante">
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                    </button>
                </Link>
                <h1 className="text-2xl font-bold">Meus Pedidos</h1>
                </div>
            </header>
            <main className="max-w-2xl mx-auto p-4 mt-4">
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <p className="text-gray-500">{error}</p>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* Cabeçalho Laranja */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/consulta_restaurante">
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Meus Pedidos</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4 space-y-4">
        {pedidos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">Nenhum pedido ainda</h3>
            <p className="text-gray-500 mb-6">Que tal experimentar algo novo hoje?</p>
            <Link href="/consulta_restaurante">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md">
                Ver Restaurantes
              </button>
            </Link>
          </div>
        ) : (
          // Lista de Pedidos
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const statusStyle = statusColors[pedido.status] || "text-gray-600 bg-gray-50 border-gray-200";
              const Icon = statusIcons[pedido.status] || Clock;

              return (
                <motion.div
                  key={pedido.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/pedidos/${pedido.id}`}>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${pedido.status === 'CONCLUIDO' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             <ShoppingBag size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                                {pedido.restaurant_id} 
                            </h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Calendar size={12} /> {formatDate(pedido.criado_em)}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle} flex items-center gap-1`}>
                           <Icon size={12} />
                           {pedido.status}
                        </span>
                      </div>

                      <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                                {pedido.itens ? pedido.itens.length : 0} {pedido.itens && pedido.itens.length === 1 ? 'item' : 'itens'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Total:</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(pedido.total_price)}</span>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors ml-2" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}