// src/app/page.tsx

"use client"; // Marcação para componentes de cliente em alguns frameworks

// O import do Link foi removido, pois não estamos em um ambiente Next.js completo
// e usaremos a tag <a> padrão para links.

export default function HomePage() {
  return (
    // Fundo laranja degradê, centraliza o conteúdo vertical e horizontalmente
    <main className="flex flex-col items-center justify-center min-h-screen p-8"
          style={{ 
              background: 'linear-gradient(to bottom right, #FF7B00, #FF3D00)' 
          }}>
      
      {/* Card branco central, com sombra e bordas arredondadas */}
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 max-w-2xl w-full text-center">

        {/* Logo/Marca (Como na tela de criar conta) */}
        <div className="flex justify-center items-center mb-6">
          {/* Substitua esta div pela sua imagem de logo ou componente de logo se tiver */}
          <span className="text-5xl font-extrabold" style={{ color: '#FF3D00' }}>
            iFome
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Bem-vindo ao iFome
        </h1>

        {/* Descrição */}
        <p className="text-lg text-gray-600 mb-8">
          Sua fome a um clique de distância. Encontre os melhores restaurantes da sua região, faça seu pedido e aproveite.
        </p>

        {/* Botões de Ação (Links para outras páginas) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
          {/* Botão Principal Vermelho - Agora usando <a> */}
          <a href="/consulta_restaurante" 
                className="w-full sm:w-auto bg-red-500 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-300"
                style={{ backgroundColor: '#FF3D00' }}> {/* Cor exata do botão */}
            Buscar Restaurantes ➔
          </a>
          
          {/* Botão Secundário (ou de cadastro) - Agora usando <a> */}
          <a href="/cadastro_usuario" 
                className="w-full sm:w-auto bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300">
            Criar minha conta
          </a>

          {/* NOVO BOTÃO: Cadastro de Endereço - Agora usando <a> */}
          <a href="/cadastro_endereco" 
                className="w-full sm:w-auto bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300">
            Cadastrar Endereço
          </a>
        </div>

      </div>
    </main>
  );
}

