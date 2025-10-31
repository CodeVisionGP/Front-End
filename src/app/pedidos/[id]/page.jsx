"use client";

import React from 'react';
import { useParams } from 'next/navigation'; 
import { useNotificacoes } from '../../hooks/useNotificacoes'; // Importa o hook
import { Loader2 } from 'lucide-react'; 

export default function PaginaDoPedido() {
  // 1. Pega os parâmetros da URL (ex: o '123' de /pedidos/123)
  const params = useParams();
  const idDoPedido = params.id;

  // 2. ✅✅ PASSA O ID PARA O HOOK ✅✅
  // Agora o hook sabe em qual "sala" do WebSocket ele deve entrar
  const statusAtual = useNotificacoes(idDoPedido);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Acompanhando seu pedido
        </h1>
        <p className="text-gray-600">Pedido #{idDoPedido}</p>
      </div>

      <div className="status-tracker p-6 mt-8 bg-gray-50 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-semibold text-gray-700">
          STATUS ATUAL:
        </h3>
        <div className="flex justify-center items-center mt-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF4E00]" />
          <strong className="text-xl text-[#FF4E00] ml-3">
            {statusAtual}
          </strong>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Aguardando atualização do restaurante...
        </p>
      </div>
    </div>
  );
}