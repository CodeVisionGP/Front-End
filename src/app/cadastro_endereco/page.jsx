"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function CadastroEndereco() {
  const [userId, setUserId] = useState(""); // agora o usuário precisa informar o ID
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: ""
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [enderecoCadastrado, setEnderecoCadastrado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEndereco({ ...endereco, [name]: value });
  };

  const handleCepBlur = async () => {
    const cepLimpo = endereco.cep.replace("-", "").trim();
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEndereco((prev) => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("Informe o ID do usuário antes de salvar.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/endereco/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endereco),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Erro ao cadastrar endereço.");
        return;
      }

      setEnderecoCadastrado(data.endereco);
      setEndereco({
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: ""
      });
      alert("Endereço cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar endereço:", error);
    }
  };

  const handleBuscarEndereco = async () => {
    if (!userId) {
      alert("Informe o ID do usuário para consultar.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/endereco/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Endereço não encontrado.");
        return;
      }

      setEnderecoCadastrado(data.endereco);
    } catch (error) {
      console.error("Erro ao consultar endereço:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-center mb-2">Cadastro de Endereço</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                name="userId"
                placeholder="ID do Usuário"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
              <Input
                name="cep"
                placeholder="CEP"
                value={endereco.cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
                required
              />
              {loadingCep && <p className="text-sm text-gray-500">Buscando CEP...</p>}
              <Input name="rua" placeholder="Rua" value={endereco.rua} onChange={handleChange} required />
              <div className="grid grid-cols-2 gap-2">
                <Input name="numero" placeholder="Número" value={endereco.numero} onChange={handleChange} required />
                <Input name="complemento" placeholder="Complemento" value={endereco.complemento} onChange={handleChange} />
              </div>
              <Input name="bairro" placeholder="Bairro" value={endereco.bairro} onChange={handleChange} required />
              <Input name="cidade" placeholder="Cidade" value={endereco.cidade} onChange={handleChange} required />
              <Input name="estado" placeholder="Estado" value={endereco.estado} onChange={handleChange} required />

              <Button type="submit" className="w-full rounded-xl">Salvar Endereço</Button>
            </form>

            {/* Consulta de endereço */}
            <Button
              onClick={handleBuscarEndereco}
              variant="secondary"
              className="w-full mt-2 rounded-xl"
            >
              Consultar Endereço
            </Button>

            {/* Exibição do endereço cadastrado */}
            {enderecoCadastrado && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Endereço do usuário {userId}:</h3>
                <div className="text-sm border p-2 rounded mt-2 bg-gray-100">
                  {enderecoCadastrado.rua}, {enderecoCadastrado.numero}{" "}
                  {enderecoCadastrado.complemento && `- ${enderecoCadastrado.complemento}`},<br />
                  {enderecoCadastrado.bairro}, {enderecoCadastrado.cidade}/{enderecoCadastrado.estado}, CEP: {enderecoCadastrado.cep}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
