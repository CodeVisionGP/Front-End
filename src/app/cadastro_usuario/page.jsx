"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Eye, EyeOff, ArrowLeft } from "lucide-react";

// Mock de componentes 'shadcn/ui' (Mantidos do seu código)
const Card = ({ className, children }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
const Button = ({ className, children, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>{children}</button>;
const Input = ({ className, ...props }) => <input className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Checkbox = ({ className, ...props }) => <input type="checkbox" className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Label = ({ className, children, ...props }) => <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>;

export default function SignupIfome() {
  const [form, setForm] = useState({
    name: "",
    phone: "", // Novo campo obrigatório
    email: "", // Agora é opcional (antigo 'contact')
    password: "",
    confirm: "",
    terms: false,
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Funções de Formatação de Telefone ---
  const formatarTelefone = (value) => {
    const digitos = value.replace(/\D/g, "");
    // Limita tamanho
    if (digitos.length > 11) return form.phone; 
    
    let formatado = "";
    if (digitos.length > 0) formatado = `(${digitos.substring(0, 2)}`;
    if (digitos.length >= 3) formatado += `) ${digitos.substring(2, 7)}`;
    if (digitos.length >= 8) formatado += `-${digitos.substring(7, 11)}`;
    
    // Permite apagar corretamente
    if (digitos.length <= 2 && value.length > form.phone.length) return `(${digitos}`;
    
    return formatado;
  };

  const converterParaE164 = (telefoneFormatado) => {
    const digitos = telefoneFormatado.replace(/\D/g, "");
    return `+55${digitos}`;
  };

  const handlePhoneChange = (e) => {
    setForm({ ...form, phone: formatarTelefone(e.target.value) });
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Informe seu nome completo";
    
    // Validação de Telefone (Obrigatório)
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        e.phone = "Informe um celular válido com DDD";
    }

    // Validação de Email (Opcional, mas se tiver, tem que ser válido)
    if (form.email.trim() && !emailRegex.test(form.email)) {
        e.email = "Formato de e-mail inválido";
    }

    if (form.password.length < 6) e.password = "Mínimo de 6 caracteres";
    if (form.confirm !== form.password) e.confirm = "As senhas não coincidem";
    if (!form.terms) e.terms = "Você precisa aceitar os termos";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    if (!validate()) return;

    setIsSubmitting(true);

    // Prepara o payload para o backend FastAPI
    const payload = {
      nome_completo: form.name,
      telefone: converterParaE164(form.phone),
      senha: form.password,
      // Envia email apenas se preenchido, senão null
      email: form.email.trim() !== "" ? form.email : null
    };

    try {
      // Usando a URL do Ngrok ou Localhost (dependendo de onde você está testando)
      // Idealmente use a variável de ambiente, mas aqui está hardcoded como no seu exemplo
      const response = await fetch("http://127.0.0.1:8000/api/usuario/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ message: "Cadastro criado com sucesso! Redirecionando...", type: "success" });
        // Limpa formulário
        setForm({ name: "", phone: "", email: "", password: "", confirm: "", terms: false });
        
        // Redireciona para o login após 2 segundos
        setTimeout(() => {
            window.location.href = "http://localhost:3000/";
        }, 2000);
      } else {
        // Mostra erro do backend (ex: Telefone já cadastrado)
        setStatus({ message: result.detail || "Ocorreu um erro ao criar a conta.", type: "error" });
      }
    } catch (error) {
      console.error("Erro de conexão com a API:", error);
      setStatus({ message: "Não foi possível conectar ao servidor. Tente mais tarde.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const bgGradient = "bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300";

  return (
    <div className={`min-h-screen w-full ${bgGradient} flex items-center justify-center p-4 md:p-8 relative overflow-hidden`}>
      {/* Botão Voltar */}
      <button 
        onClick={() => window.location.href = "http://localhost:3000/"}
        className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors z-10"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Efeitos de fundo */}
      <motion.div aria-hidden initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 0.12, scale: 1 }} transition={{ duration: 1.2 }} className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-2xl" />
      <motion.div aria-hidden initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.12, y: 0 }} transition={{ duration: 1 }} className="pointer-events-none absolute -bottom-16 -left-12 w-96 h-96 rounded-full bg-white/20 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-[420px] w-full">
        <div className="flex items-center justify-center gap-2 mb-6 text-white">
          <Utensils className="w-7 h-7" />
          <h1 className="text-2xl font-extrabold tracking-tight">HungerBy</h1>
        </div>

        <Card className="shadow-xl rounded-2xl bg-white">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Criar conta</h2>
              <p className="text-sm text-gray-500">Preencha seus dados para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input id="name" placeholder="Ex.: Maria da Silva" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Telefone (Obrigatório) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Celular *</Label>
                <Input 
                    id="phone" 
                    placeholder="(XX) 9XXXX-XXXX" 
                    value={form.phone} 
                    onChange={handlePhoneChange} 
                    maxLength={15}
                    aria-invalid={!!errors.phone} 
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* E-mail (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail (Opcional)</Label>
                <Input id="email" type="email" placeholder="seuemail@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Senha */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Senha *</Label>
                <Input id="password" type={showPass ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} />
                <button type="button" className="absolute right-2 top-8 p-1 text-gray-500 hover:text-gray-700" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2 relative">
                <Label htmlFor="confirm">Confirmar senha *</Label>
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repita sua senha" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} aria-invalid={!!errors.confirm} />
                <button type="button" className="absolute right-2 top-8 p-1 text-gray-500 hover:text-gray-700" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirm && <p className="text-sm text-red-600">{errors.confirm}</p>}
              </div>

              {/* Termos */}
              <div className="flex items-start gap-2 mt-4">
                <Checkbox id="terms" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
                <Label htmlFor="terms" className="text-sm leading-snug cursor-pointer">
                  Eu li e aceito os <a className="text-orange-600 hover:underline" href="#">Termos de Uso</a> e a <a className="text-orange-600 hover:underline" href="#">Política de Privacidade</a>.
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

              {/* Botão */}
              <Button type="submit" className="w-full h-12 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-md mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>

              {/* Mensagem de status */}
              {status.message && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 text-sm text-center font-medium mt-4 ${status.type === "success" ? "text-green-700 bg-green-50 border border-green-200" : "text-red-700 bg-red-50 border border-red-200"}`}
                >
                  {status.message}
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}