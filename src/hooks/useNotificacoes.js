"use client";
import { useEffect, useState } from 'react';

// 1. Defina a URL do WebSocket (note o 'ws://' e não 'http://')
// Esta URL deve bater com o seu 'main.py'
const WS_URL = "ws://localhost:8000/ws/order/";

export function useNotificacoes(orderId) {
  // 2. O estado inicial
  const [statusPedido, setStatusPedido] = useState('Pedido recebido, aguardando confirmação...');

  useEffect(() => {
    // 3. Só tenta conectar se a página já tiver o ID do pedido
    if (!orderId) {
      return;
    }

    // 4. Cria a conexão WebSocket nativa para O PEDIDO ESPECÍFICO
    const ws = new WebSocket(`${WS_URL}${orderId}`);

    // O que fazer ao conectar
    ws.onopen = () => {
      console.log(`Conectado ao WebSocket para o pedido ${orderId}`);
    };

    // 5. O QUE FAZER QUANDO RECEBER MENSAGEM
    ws.onmessage = (event) => {
      // O backend envia JSON, então precisamos "parsear" a string
      const data = JSON.parse(event.data);
      
      console.log('Notificação recebida do backend:', data);

      // 6. Atualiza o estado
      // (Seu manager envia { "status": "..." }
      //  Se enviar { "mensagem": "..." }, o 'if' abaixo pega)
      if (data && data.status) {
        setStatusPedido(data.status); 
      } else if (data && data.mensagem) {
        setStatusPedido(data.mensagem);
      }
    };

    // O que fazer ao fechar
    ws.onclose = () => {
      console.log(`Desconectado do WebSocket (Pedido ${orderId})`);
    };

    // O que fazer em caso de erro
    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };

    // 7. Limpa a conexão quando o usuário sai da página
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [orderId]); // Este 'useEffect' roda de novo se o orderId mudar

  // 8. Retorna o status para a página
  return statusPedido;
}