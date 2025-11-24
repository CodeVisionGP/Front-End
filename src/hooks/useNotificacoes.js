import { useState, useEffect, useRef } from 'react';

// --- CONFIGURAÇÃO DA URL DO WEBSOCKET ---
// Se estiver rodando localmente (localhost), use: "ws://localhost:8000/ws/order"
// Se estiver usando Ngrok, use o formato WSS (Secure WebSocket) para evitar bloqueios.
// Substitua a URL abaixo pela sua URL do Ngrok ATUAL (sem o http:// ou https://)

const NGROK_HOST = "unnoisily-prominent-ermelinda.ngrok-free.dev"; 
const WS_URL = `wss://${NGROK_HOST}/ws/order`;

export function useNotificacoes(orderId) {
  const [status, setStatus] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    console.log(`🔌 Tentando conectar ao WebSocket: ${WS_URL}/${orderId}`);
    
    // Tenta criar a conexão
    try {
        const socket = new WebSocket(`${WS_URL}/${orderId}`);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log(`✅ WebSocket CONECTADO! Pedido #${orderId}`);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("📩 Notificação recebida:", data);
            
            // O backend pode mandar o objeto inteiro ou só o status
            const novoStatus = data.status || data;
            setStatus(novoStatus);
          } catch (error) {
            console.error("Erro ao processar mensagem do WebSocket:", error);
            // Se não for JSON, tenta usar o texto puro como status
            if (event.data) {
                 setStatus(event.data);
            }
          }
        };

        socket.onclose = (event) => {
          console.log(`❌ WebSocket desconectado. Código: ${event.code}, Razão: ${event.reason}`);
        };

        socket.onerror = (error) => {
          // O evento de erro do WebSocket no navegador não contém detalhes por segurança
          console.error("⚠️ Erro no WebSocket. Verifique se a URL WSS está correta e se o backend está rodando.");
        };

    } catch (e) {
        console.error("Erro crítico ao iniciar WebSocket:", e);
    }

    // Cleanup: Fecha a conexão quando o componente desmontar ou o ID mudar
    return () => {
      if (socketRef.current) {
        // Verifica se está aberto antes de fechar para evitar erros
        if (socketRef.current.readyState === 1) { 
            socketRef.current.close();
        }
      }
    };
  }, [orderId]);

  return status;
}