"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");

    try {
      // --- INÍCIO DA CORREÇÃO ---
      // O FastAPI com OAuth2PasswordRequestForm espera dados de formulário,
      // não JSON. E espera os campos 'username' e 'password'.
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", senha);

      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      // --- FIM DA CORREÇÃO ---

      const data = await response.json();

      if (response.ok) {
        // Se desejar, pode salvar o token aqui (ex: localStorage)
        // localStorage.setItem("access_token", data.access_token);
        router.push("/consulta_restaurante");
      } else {
        setMensagem(`❌ ${data.detail || "Credenciais inválidas"}`);
      }
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao conectar com o servidor.");
    }
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
          Entrar na sua conta
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            type="submit"
            className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-orange-500 transition-colors duration-300"
          >
            Entrar
          </button>
        </form>

        {mensagem && (
          <p
            className={`mt-4 font-semibold ${
              mensagem.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {mensagem}
          </p>
        )}

        {/* --- BOTÕES DE LOGIN SOCIAL ADICIONADOS --- */}
        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">Ou continue com</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex flex-col space-y-3">
          {/* Botão para o Google */}
          <a
            href="http://127.0.0.1:8000/api/auth/google"
            className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-300"
          >
            {/* Ícone do Google (SVG simples) */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.28 6.42C13.02 13.98 18.08 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.61h12.94c-.58 2.96-2.26 5.48-4.84 7.21l7.32 5.67C43.98 37.6 46.98 31.63 46.98 24.55z"></path>
              <path fill="#FBBC05" d="M10.84 28.19c-.45-1.35-.7-2.78-.7-4.25s.25-2.9.7-4.25l-8.28-6.42C.96 16.14 0 20.01 0 24s.96 7.86 2.56 10.78l8.28-6.59z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.32-5.67c-2.13 1.44-4.84 2.28-7.57 2.28-5.92 0-10.98-4.46-13.16-10.43l-8.28 6.42C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Entrar com Google
          </a>

          {/* Botão para o Facebook */}
          <a
            href="http://127.0.0.1:8000/api/auth/facebook"
            className="flex items-center justify-center w-full bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
          >
             {/* Ícone do Facebook (SVG simples) */}
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.57 11.57 5 14.03 5c1.13 0 2.1.08 2.39.12v2.7h-1.6c-1.4 0-1.67.67-1.67 1.63V12h3.02l-.4 3H14.76v6.8c4.56-.93 8-4.96 8-9.8z"></path>
            </svg>
            Entrar com Facebook
          </a>
        </div>
        {/* --- FIM DOS BOTÕES SOCIAIS --- */}


        <a
          href="/cadastro_usuario"
          className="block mt-8 text-orange-600 hover:text-orange-400 font-semibold transition-colors duration-200"
        >
          Criar uma nova conta
        </a>
      </div>
    </main>
  );
}