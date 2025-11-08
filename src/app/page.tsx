"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Importe o ícone de loading

export default function LoginPage() {
  // Estados da UI
  const [step, setStep] = useState("CHOICE"); // 'CHOICE', 'REQUEST_CODE' ou 'VERIFY_CODE'
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  // Dados do formulário
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");

  const router = useRouter();
  
  const API_URL = "http://127.0.0.1:8000/api";

  // --- MUDANÇA 1: Função para formatar o telefone (máscara) ---
  const formatarTelefone = (value: string) => {
    // Remove tudo que não é dígito
    const digitos = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos do celular)
    if (digitos.length > 11) return telefone; // Mantém o valor anterior se estourar

    let formatado = '';
    if (digitos.length > 0) {
      formatado = `(${digitos.substring(0, 2)}`;
    }
    if (digitos.length >= 3) {
      // Formato para celular (9XXXX-XXXX)
      formatado += `) ${digitos.substring(2, 7)}`;
    }
    if (digitos.length >= 8) {
      formatado += `-${digitos.substring(7, 11)}`;
    }
    
    // Se o usuário estiver apagando, permite que os parênteses fiquem
    if (digitos.length <= 2 && value.length > telefone.length) {
       return `(${digitos}`;
    }

    return formatado;
  };

  // --- MUDANÇA 2: Converter para E.164 ANTES de enviar ---
  const converterParaE164 = (telefoneFormatado: string) => {
    const digitos = telefoneFormatado.replace(/\D/g, '');
    // Assume DDI +55 (Brasil)
    return `+55${digitos}`;
  }


  // --- ETAPA 1 REAL: Pedir o código via API ---
  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    
    // --- MUDANÇA 3: Validar e Converter o número ---
    const digitos = telefone.replace(/\D/g, '');
    if (digitos.length < 10 || digitos.length > 11) { // 10 para fixo (não ideal) ou 11 para celular
      setMensagem("❌ Por favor, digite um telefone válido com DDD.");
      return;
    }
    const telefoneE164 = converterParaE164(telefone);
    // --- Fim da Mudança ---

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/phone/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia o número formatado
        body: JSON.stringify({ phone: telefoneE164 }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao solicitar o código.");
      }

      // Sucesso!
      // Mensagem de sucesso agora usa o telefone formatado (E.164)
      setMensagem(`✅ Código enviado para ${telefoneE164}!`); 
      setStep("VERIFY_CODE");

    } catch (error: any) {
      setMensagem(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // --- ETAPA 2 REAL: Verificar o código via API ---
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    // --- MUDANÇA 4: Converter o número também na verificação ---
    const telefoneE164 = converterParaE164(telefone);
    // --- Fim da Mudança ---

    try {
      const res = await fetch(`${API_URL}/auth/phone/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia o número E.164 e o código
        body: JSON.stringify({ phone: telefoneE164, code: codigo }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Código inválido.");
      }

      const data = await res.json();
      localStorage.setItem("authToken", data.access_token);
      router.push("/consulta_restaurante");

    } catch (error: any) {
      setMensagem(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Funções para Títulos e Textos dinâmicos
  function getTitulo() {
    if (step === "REQUEST_CODE") return "Digite seu telefone";
    if (step === "VERIFY_CODE") return "Verifique seu telefone";
    return "Acesse sua conta";
  }

  function getDescricao() {
    if (step === "REQUEST_CODE") return "Enviaremos um código de acesso para seu número.";
    // O estado 'telefone' já está formatado, ex: (11) 99999-8888
    if (step === "VERIFY_CODE") return `Digite o código que enviamos para ${telefone}.`;
    return "Escolha como deseja continuar.";
  }


  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen p-8"
      style={{
        background: "linear-gradient(to bottom right, #FF7B00, #FF3D00)",
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <div className="flex justify-center items-center mb-6">
          <span
            className="text-5xl font-extrabold"
            style={{ color: "#FF3D00" }}
          >
            iFome
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {getTitulo()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getDescricao()}
        </p>
        
        {step !== "CHOICE" && (
          <form 
            onSubmit={step === "REQUEST_CODE" ? handleRequestCode : handleVerifyCode} 
            className="flex flex-col items-center"
          >
            {step === "REQUEST_CODE" && (
              // --- MUDANÇA 5: Input de telefone atualizado ---
              <input
                type="tel"
                placeholder="(XX) XXXXX-XXXX" // Novo placeholder
                value={telefone}
                // Aplica a formatação a cada mudança
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))} 
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            )}

            {step === "VERIFY_CODE" && (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código de 6 dígitos"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                step === "REQUEST_CODE" ? "Enviar Código" : "Verificar e Entrar"
              )}
            </button>
          </form>
        )}

        {/* --- Botões de Navegação (Voltar / Trocar número) --- */}
        {step === "VERIFY_CODE" && (
             <button
               onClick={() => {
                 setStep("REQUEST_CODE");
                 setMensagem("");
                 setCodigo("");
               }}
               disabled={loading}
               className="mt-6 text-sm text-gray-600 hover:text-gray-900"
             >
               Digitar outro número
             </button>
        )}
        
        {step === "REQUEST_CODE" && (
             <button
               onClick={() => {
                 setStep("CHOICE");
                 setMensagem("");
                 setTelefone(""); // Limpa o telefone ao voltar
               }}
               disabled={loading}
               className="mt-6 text-sm text-gray-600 hover:text-gray-900"
             >
               Ver outras opções
             </button>
        )}

        {mensagem && (
          <p
            className={`mt-4 font-semibold ${
              mensagem.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensagem}
          </p>
        )}

        {/* --- Opções de Login (Etapa Inicial) --- */}
        {step === "CHOICE" && (
          <>
            <button
              onClick={() => setStep("REQUEST_CODE")}
              className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center mb-4"
            >
              Entrar com Telefone
            </button>
            
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500">Ou continue com</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </>
        )}

        {/* --- Botões Sociais --- */}
        <div className="flex flex-col space-y-3">
          <a
            href="http://127.0.0.1:8000/api/auth/google"
            className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-300"
          >
            {/* ... svg do Google ... */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.28 6.42C13.02 13.98 18.08 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.61h12.94c-.58 2.96-2.26 5.48-4.84 7.21l7.32 5.67C43.98 37.6 46.98 31.63 46.98 24.55z"></path><path fill="#FBBC05" d="M10.84 28.19c-.45-1.35-.7-2.78-.7-4.25s.25-2.9.7-4.25l-8.28-6.42C.96 16.14 0 20.01 0 24s.96 7.86 2.56 10.78l8.28-6.59z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.32-5.67c-2.13 1.44-4.84 2.28-7.57 2.28-5.92 0-10.98-4.46-13.16-10.43l-8.28 6.42C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Entrar com Google
          </a>

          <a
            href="http://127.0.0.1:8000/api/auth/facebook"
            className="flex items-center justify-center w-full bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
          >
            {/* ... svg do Facebook ... */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.57 11.57 5 14.03 5c1.13 0 2.1.08 2.39.12v2.7h-1.6c-1.4 0-1.67.67-1.67 1.63V12h3.02l-.4 3H14.76v6.8c4.56-.93 8-4.96 8-9.8z"></path></svg>
            Entrar com Facebook
          </a>
        </div>
      </div>
    </main>
  );
}