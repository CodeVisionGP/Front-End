"use client";

import React, { useEffect } from "react";

// Esta página funciona como uma "ponte" que o usuário verá por apenas um instante.
// A sua única responsabilidade é capturar o token de autenticação que o backend
// envia de volta na URL após um login social bem-sucedido.
export default function AuthCallbackPage() {

  // O hook `useEffect` executa o código assim que a página é carregada no navegador.
  useEffect(() => {
    // 1. LER O TOKEN DA URL
    // O backend redireciona o usuário para uma URL como:
    // /auth/callback?token=SEU_TOKEN_AQUI
    // A API `URLSearchParams` do navegador ajuda a ler facilmente esses parâmetros.
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // 2. SALVAR O TOKEN
      // Se um token for encontrado na URL, nós o guardamos no `localStorage` do navegador.
      // É assim que a sua aplicação "lembra" que o usuário está autenticado para futuras
      // requisições à API.
      localStorage.setItem("access_token", token);
      
      // 3. REDIRECIONAR PARA A PÁGINA PRINCIPAL
      // Com o token salvo, o processo está completo. Agora, enviamos o usuário
      // para a página principal da aplicação.
      // `window.location.replace` é usado para que esta página de callback não
      // fique no histórico do navegador.
      window.location.replace("/consulta_restaurante");

    } else {
      // Se, por algum motivo, o usuário chegar a esta página sem um token,
      // significa que algo deu errado. Nesse caso, o melhor a fazer é enviá-lo
      // de volta para a página de login.
      window.location.replace("/login?error=auth_failed");
    }
  }, []); // O `[]` como segundo argumento garante que este efeito execute apenas uma vez.

  // Enquanto a lógica acima é processada, é uma boa prática mostrar uma
  // mensagem de carregamento para o usuário.
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Autenticando...</h1>
        <p className="text-gray-600 mt-2">
          Estamos a finalizar o seu login. Será redirecionado em breve.
        </p>
        <div className="mt-6 w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </main>
  );
}
