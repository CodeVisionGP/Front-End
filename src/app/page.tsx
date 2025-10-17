// This is the recommended code for your login page
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import the Next.js router

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const router = useRouter(); // 2. Initialize the router

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");

    try {
      // 3. Call your JSON API, not the HTML route
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          // 4. Send JSON
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }), // 5. Send data as a JSON string
      });

      const data = await response.json();

      if (response.ok) {
        // 6. SUCCESS: Use the Next.js router to change the page
        router.push("/consulta_restaurante"); // Or "/consulta-items"
      } else {
        // 7. FAILURE: Set the error message from the API
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
              mensagem.includes("✅")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {mensagem}
          </p>
        )}

        <a
          href="/cadastro_usuario"
          className="block mt-6 text-orange-600 hover:text-orange-400 font-semibold transition-colors duration-200"
        >
          Criar uma nova conta
        </a>

        <a
          href="/cadastro_endereco"
          className="block mt-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          Cadastrar Endereço
        </a>
      </div>
    </main>
  );
}