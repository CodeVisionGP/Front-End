"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Mail, Lock, Eye, EyeOff, Phone, Facebook, Chrome } from "lucide-react";

// Mock de componentes 'shadcn/ui'
const Card = ({ className, children }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
const Button = ({ className, children, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>{children}</button>;
const Input = ({ className, ...props }) => <input className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Checkbox = ({ className, ...props }) => <input type="checkbox" className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Label = ({ className, children, ...props }) => <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>;

export default function SignupIfome() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
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
  const phoneRegex = /^(?:\+?\d{1,3})?[\s.-]?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}$/;

  const handleContactChange = (value) => {
    setForm({ ...form, contact: value });
  };

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Informe seu nome";
    if (!form.contact.trim()) e.contact = "Informe e-mail ou celular";
    else if (!emailRegex.test(form.contact)) e.contact = "Digite um e-mail válido para o cadastro";
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

    const payload = {
      nome_completo: form.name,
      email: form.contact,
      senha: form.password,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ message: "Cadastro criado com sucesso!", type: "success" });
        setForm({ name: "", contact: "", password: "", confirm: "", terms: false });
      } else {
        setStatus({ message: result.detail || "Ocorreu um erro.", type: "error" });
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
      {/* Efeitos de fundo */}
      <motion.div aria-hidden initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 0.12, scale: 1 }} transition={{ duration: 1.2 }} className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-2xl" />
      <motion.div aria-hidden initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.12, y: 0 }} transition={{ duration: 1 }} className="pointer-events-none absolute -bottom-16 -left-12 w-96 h-96 rounded-full bg-white/20 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-[420px] w-full">
        <div className="flex items-center justify-center gap-2 mb-6 text-white">
          <Utensils className="w-7 h-7" />
          <h1 className="text-2xl font-extrabold tracking-tight">Ifome</h1>
        </div>

        <Card className="shadow-xl rounded-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">Criar conta</h2>
              <p className="text-sm text-muted-foreground">Peça seus favoritos em poucos cliques</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Ex.: Maria da Silva" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="contact">E-mail</Label>
                <Input id="contact" placeholder="seuemail@exemplo.com" value={form.contact} onChange={(e) => handleContactChange(e.target.value)} aria-invalid={!!errors.contact} />
                {errors.contact && <p className="text-sm text-red-600">{errors.contact}</p>}
              </div>

              {/* Senha */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type={showPass ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2 relative">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repita sua senha" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} aria-invalid={!!errors.confirm} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
                {errors.confirm && <p className="text-sm text-red-600">{errors.confirm}</p>}
              </div>

              {/* Termos */}
              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
                <Label htmlFor="terms" className="text-sm leading-snug">
                  Eu li e aceito os <a className="text-primary underline" href="#">Termos de Uso</a> e a <a className="text-primary underline" href="#">Política de Privacidade</a>.
                </Label>
              </div>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

              {/* Botão */}
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>

              {/* Mensagem de status */}
              {status.message && (
                <p className={`rounded-md p-3 text-sm text-center font-medium ${status.type === "success" ? "text-green-700 bg-green-50 border-green-200" : ""} ${status.type === "error" ? "text-red-700 bg-red-50 border-red-200" : ""}`}>
                  {status.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
