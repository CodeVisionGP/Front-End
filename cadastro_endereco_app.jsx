import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function CadastroEndereco() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEndereco({ ...endereco, [name]: value });
  };

  const handleCepBlur = async () => {
    if (endereco.cep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${endereco.cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setEndereco({
            ...endereco,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Endereço cadastrado:", endereco);
    // Aqui você pode integrar com o backend ou API
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
