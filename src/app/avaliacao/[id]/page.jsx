"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Star, ArrowLeft, MessageSquare, CheckCircle, Home, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = "http://localhost:8000/api";

export default function AvaliacaoPage() {
  const params = useParams();
  const router = useRouter();
  const pedidoId = params.id;

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  // Novos estados para controle
  const [verificando, setVerificando] = useState(true);
  const [jaAvaliado, setJaAvaliado] = useState(false);

  // 1. Verifica se já foi avaliado assim que a tela carrega
  useEffect(() => {
    const verificarAvaliacao = async () => {
      try {
        // Tenta buscar a avaliação deste pedido
        // OBS: Seu backend precisa ter uma rota GET que retorna a avaliação pelo ID do pedido
        // Se retornar dados (200 OK), significa que já existe.
        await axios.get(`${API_BASE_URL}/avaliacoes/pedido/${pedidoId}`);
        setJaAvaliado(true);
      } catch (error) {
        // Se der 404 (Not Found), significa que ainda não foi avaliado
        if (error.response && error.response.status === 404) {
            setJaAvaliado(false);
        } else {
            console.error("Erro ao verificar status:", error);
            // Em caso de erro de conexão, assumimos falso para não bloquear, 
            // ou tratamos como erro. Aqui deixarei seguir.
            setJaAvaliado(false); 
        }
      } finally {
        setVerificando(false);
      }
    };

    if (pedidoId) {
        verificarAvaliacao();
    }
  }, [pedidoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nota === 0) {
        alert("Por favor, selecione uma nota de 1 a 5.");
        return;
    }

    setEnviando(true);
    try {
      await axios.post(`${API_BASE_URL}/avaliacoes/`, {
        pedido_id: pedidoId,
        nota: nota,
        comentario: comentario
      });
      setSucesso(true);
      setEnviando(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Erro ao enviar avaliação.";
      
      // Se o erro for "Já avaliado" (caso o usuário tente forçar), atualiza a tela
      if (msg.toLowerCase().includes("já avaliado") || err.response?.status === 409) {
          setJaAvaliado(true);
      } else {
          alert(msg);
      }
      setEnviando(false);
    }
  };

  // TELA DE CARREGAMENTO (Enquanto verifica)
  if (verificando) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
            <div className="flex flex-col items-center text-orange-600">
                <Loader2 className="animate-spin w-10 h-10 mb-2" />
                <p>Verificando pedido...</p>
            </div>
        </div>
      );
  }

  // TELA: JÁ AVALIADO (Caso a pessoa volte para a página)
  if (jaAvaliado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full"
        >
            <AlertCircle className="w-20 h-20 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-800">Avaliação Existente</h2>
            <p className="text-gray-600 mt-2 mb-8">
                Este pedido já foi avaliado anteriormente. Agradecemos seu feedback!
            </p>
            
            <button
                onClick={() => router.push("/consulta_restaurante")}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
                <Home size={20} />
                Voltar para o Início
            </button>
        </motion.div>
      </div>
    );
  }

  // TELA: SUCESSO (Acabou de avaliar agora)
  if (sucesso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full"
        >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800">Obrigado!</h2>
            <p className="text-gray-600 mt-2 mb-8">Sua avaliação foi enviada com sucesso.</p>
            
            <button
                onClick={() => router.push("/consulta_restaurante")}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
                <Home size={20} />
                Voltar para o Início
            </button>
        </motion.div>
      </div>
    );
  }

  // TELA PRINCIPAL (Formulário)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4 flex items-center justify-center">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-orange-500 p-6 text-white flex items-center">
            <button 
                onClick={() => router.back()} 
                className="mr-4 hover:bg-orange-600 p-2 rounded-full transition"
                type="button"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">Avaliar Pedido #{pedidoId}</h1>
        </div>

        <div className="p-8">
            <p className="text-center text-gray-600 mb-6">
                Como foi sua experiência com este pedido?
            </p>

            <form onSubmit={handleSubmit}>
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setNota(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star 
                                size={40} 
                                className={`${star <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                            />
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="w-full flex items-center justify-center mb-2 text-gray-600 font-medium">
                         <MessageSquare size={16} className="mr-2"/> Comentário (Opcional)
                    </label>
                    <textarea
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-gray-50"
                        placeholder="A comida estava quentinha? A entrega foi rápida?"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {enviando ? "Enviando..." : "Enviar Avaliação"}
                </button>
            </form>
        </div>
      </motion.div>
    </div>
  );
}