"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Importe useRouter
import { useNotificacoes } from '@/hooks/useNotificacoes';
import axios from 'axios'; 
import { 
  Loader2, CheckCircle, Clock, Truck, XCircle, Utensils, Package, KeyRound, Star 
} from 'lucide-react'; 

const API_BASE_URL = "http://localhost:8000/api";

// --- CONFIGURAÇÃO VISUAL DOS STATUS ---
const statusConfig = {
  "PENDENTE": { 
    label: "Aguardando Confirmação", 
    color: "text-yellow-600", 
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: Clock,
    progress: 15,
    message: "O restaurante recebeu o seu pedido e está a analisá-lo."
  },
  "CONFIRMADO": { 
    label: "Pedido Confirmado!", 
    color: "text-blue-600", 
    bg: "bg-blue-50", 
    border: "border-blue-200",
    icon: CheckCircle,
    progress: 35,
    message: "O restaurante aceitou o seu pedido. Logo começará a preparação."
  },
  "EM_PREPARO": { 
    label: "A Preparar o seu Pedido", 
    color: "text-orange-600", 
    bg: "bg-orange-50", 
    border: "border-orange-200",
    icon: Utensils,
    progress: 60,
    message: "A cozinha está a trabalhar no seu pedido agora mesmo."
  },
  "SAIU_PARA_ENTREGA": { 
    label: "Saiu para Entrega", 
    color: "text-purple-600", 
    bg: "bg-purple-50", 
    border: "border-purple-200",
    icon: Truck,
    progress: 85,
    message: "O seu pedido está a caminho! Fique atento ao estafeta."
  },
  "CONCLUIDO": { 
    label: "Pedido Entregue", 
    color: "text-green-600", 
    bg: "bg-green-50", 
    border: "border-green-200",
    icon: Package,
    progress: 100,
    message: "Bom apetite! O pedido foi finalizado com sucesso."
  },
  "CANCELADO": { 
    label: "Pedido Cancelado", 
    color: "text-red-600", 
    bg: "bg-red-50", 
    border: "border-red-200",
    icon: XCircle,
    progress: 100,
    message: "Infelizmente este pedido foi cancelado pelo restaurante."
  },
};

export default function PaginaDoPedido() {
  const params = useParams();
  const router = useRouter(); // Inicialize o router
  const idDoPedido = params.id;
  
  // 1. Hook do WebSocket: Escuta atualizações em tempo real
  const dadosDoSocket = useNotificacoes(idDoPedido);
  
  // Estado local para controlar o status exibido
  const [statusAtual, setStatusAtual] = useState("PENDENTE");
  const [codigoEntrega, setCodigoEntrega] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Buscar Status Inicial e Código
  useEffect(() => {
    const fetchStatusInicial = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/pedidos/${idDoPedido}`);
        if (response.data) {
            if (response.data.status) {
                console.log("Status inicial carregado:", response.data.status);
                setStatusAtual(response.data.status);
            }
            if (response.data.codigo_entrega) {
                setCodigoEntrega(response.data.codigo_entrega);
            }
        }
      } catch (error) {
        console.error("Erro ao buscar status inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idDoPedido) {
        fetchStatusInicial();
    }
  }, [idDoPedido]);

  // 3. Atualizar com WebSocket (Tempo Real)
  useEffect(() => {
    if (dadosDoSocket) {
      console.log("🔔 Atualização via Socket recebida:", dadosDoSocket);
      
      const novoStatus = dadosDoSocket.status || dadosDoSocket;
      
      if (novoStatus && statusConfig[novoStatus]) {
        setStatusAtual(novoStatus);
      }

      // Atualiza código se vier no socket
      if (dadosDoSocket.codigo_entrega) {
          setCodigoEntrega(dadosDoSocket.codigo_entrega);
      }
    }
  }, [dadosDoSocket]);

  const config = statusConfig[statusAtual] || statusConfig["PENDENTE"];
  const Icon = config.icon;

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500">
        
        {/* Cabeçalho */}
        <div className="bg-white p-8 text-center border-b border-gray-100">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Acompanhar Pedido
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 inline-block px-3 py-1 rounded-full">
            #{idDoPedido}
          </p>
        </div>

        {/* Área do Status */}
        <div className={`p-10 flex flex-col items-center transition-colors duration-700 ${config.bg}`}>
          
          {/* Ícone Animado */}
          <div className={`p-6 rounded-full bg-white shadow-md mb-6 ${config.color} relative transition-transform duration-500 transform hover:scale-110`}>
            <Icon 
              className={`w-16 h-16 ${
                ['PENDENTE', 'EM_PREPARO'].includes(statusAtual) ? 'animate-pulse' : ''
              }`} 
            />
            
            {/* Indicador de "Ao Vivo" para entrega */}
            {statusAtual === 'SAIU_PARA_ENTREGA' && (
               <span className="absolute top-0 right-0 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
               </span>
            )}
          </div>
          
          <h2 className={`text-3xl font-bold ${config.color} mb-3 text-center transition-colors duration-500`}>
            {config.label}
          </h2>
          
          <p className="text-gray-700 text-center mb-8 max-w-xs mx-auto leading-relaxed font-medium">
            {config.message}
          </p>

          {/* CÓDIGO DE ENTREGA (Se disponível) */}
          {statusAtual === 'SAIU_PARA_ENTREGA' && codigoEntrega && (
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200 text-center mb-8 animate-in fade-in zoom-in w-full">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">
                    Informe ao Entregador
                </p>
                <div className="flex items-center justify-center gap-3 bg-purple-50 p-3 rounded-lg">
                    <KeyRound className="text-purple-600 w-8 h-8" />
                    <span className="text-4xl font-mono font-black text-gray-800 tracking-[0.2em]">
                        {codigoEntrega}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Este código é necessário para receber o pedido.
                </p>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="w-full relative pt-2">
            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200 shadow-inner">
              <div 
                style={{ width: `${config.progress}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${config.color.replace('text-', 'bg-')} transition-all duration-1000 ease-in-out`}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-semibold uppercase tracking-wide">
              <span>Recebido</span>
              <span>Entregue</span>
            </div>
          </div>
          
        </div>

        {/* Rodapé / Info Extra */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100 space-y-3">
          
          {/* --- BOTÃO DE AVALIAR (NOVO) --- */}
          {/* Só aparece se o pedido estiver CONCLUIDO */}
          {statusAtual === 'CONCLUIDO' && (
             <button 
               onClick={() => router.push(`/avaliacao/${idDoPedido}`)}
               className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-6 rounded-xl shadow-md transition-all transform hover:-translate-y-1 border-2 border-yellow-300"
             >
               <Star className="w-5 h-5 fill-yellow-900" />
               Avaliar este Pedido
             </button>
          )}

          <button 
            onClick={() => router.push('/consulta_restaurante')}
            className="w-full text-sm font-bold text-gray-600 hover:text-gray-800 py-2 transition-colors"
          >
            Voltar ao Menu
          </button>

          {/* Indicador de tempo real (se não finalizado) */}
          {!['CONCLUIDO', 'CANCELADO'].includes(statusAtual) && (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 pt-2">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wider">A atualizar em tempo real</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}