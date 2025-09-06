import React, { useState } from "react";
import { motion } from "framer-motion";
import { Utensils, Mail, Lock, Eye, EyeOff, Phone, Facebook, Chrome } from "lucide-react";

// Nota: Este componente usa 'shadcn/ui'. As classes de utilidade do Tailwind CSS e os componentes importados
// como Card, Button, Input, Checkbox e Label precisam que o 'shadcn/ui' esteja configurado
// em seu projeto.

// Mock de componentes 'shadcn/ui' para demonstração se não estiverem instalados
const Card = ({ className, children }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
const Button = ({ className, children, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>{children}</button>;
const Input = ({ className, ...props }) => <input className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;
const Checkbox = ({ className, ...props }) => <input type="checkbox" className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`} {...props} />;
const Label = ({ className, children, ...props }) => <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>;

// Tela de cadastro para o app de comida (estilo iFood)
// Observações:
// - Usa Tailwind + shadcn/ui
// - Validação mínima em cliente
// - Botões sociais (placeholders) e link para Login
// - Totalmente responsivo e acessível

export default function SignupIfome() {
  const [form, setForm] = useState({
    name: "",
    contact: "", // e-mail ou celular
    password: "",
    confirm: "",
    terms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  // Expressões regulares corrigidas e mais robustas
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(?:\+?\d{1,3})?[\s.-]?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}$/;

  const handleContactChange = (value) => {
    setForm({ ...form, contact: value });
  };
  
  function validate() {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "Informe seu nome";

    if (!form.contact.trim()) e.contact = "Informe e-mail ou celular";
    else if (!emailRegex.test(form.contact) && !phoneRegex.test(form.contact)) {
      e.contact = "Digite um e-mail ou celular válido";
    }

    if (form.password.length < 6) e.password = "Mínimo de 6 caracteres";
    if (form.confirm !== form.password) e.confirm = "As senhas não coincidem";
    if (!form.terms) e.terms = "Você precisa aceitar os termos";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!validate()) return;

    // Simula chamada ao backend
    await new Promise((r) => setTimeout(r, 700));
    setStatus("Cadastro criado com sucesso! Você já pode fazer login.");
  }

  const bgGradient = "bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300";

  return (
    <div className={`min-h-screen w-full ${bgGradient} flex items-center justify-center p-4 md:p-8 relative overflow-hidden`}>
      {/* Elementos decorativos de comida (sutis) */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.12, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-2xl"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.12, y: 0 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute -bottom-16 -left-12 w-96 h-96 rounded-full bg-white/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[420px] w-full"
      >
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
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Ex.: Maria da Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Contato: e-mail ou celular */}
              <div className="space-y-2">
                <Label htmlFor="contact">E-mail ou celular</Label>
                <div className="relative">
                  <Input
                    id="contact"
                    placeholder="seuemail@exemplo.com ou (XX) 9XXXX-XXXX"
                    value={form.contact}
                    onChange={(e) => handleContactChange(e.target.value)}
                    aria-invalid={!!errors.contact}
                    aria-describedby={errors.contact ? "contact-error" : undefined}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground">
                    {emailRegex.test(form.contact) ? <Mail /> : <Phone />}
                  </span>
                </div>
                {errors.contact && (
                  <p id="contact-error" className="text-sm text-red-600">{errors.contact}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <Lock className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita sua senha"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? "confirm-error" : undefined}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Ocultar confirmacao" : "Mostrar confirmacao"}
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p id="confirm-error" className="text-sm text-red-600">{errors.confirm}</p>
                )}
              </div>

              {/* Termos */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={form.terms}
                  onCheckedChange={(v) => setForm({ ...form, terms: Boolean(v) })}
                />
                <Label htmlFor="terms" className="text-sm leading-snug">
                  Eu li e aceito os <a className="text-primary underline underline-offset-4" href="#">Termos de Uso</a> e a
                  <a className="text-primary underline underline-offset-4" href="#"> Política de Privacidade</a>.
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              {/* Botão principal */}
              <Button type="submit" className="w-full h-11 text-base font-semibold bg-red-600 hover:bg-red-700">
                Criar conta
              </Button>

              {/* Divisor */}
              <div className="relative text-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative inline-block bg-background px-3 text-xs text-muted-foreground">
                  ou continue com
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" className="h-11">
                  <Facebook className="w-5 h-5 mr-2" /> Facebook
                </Button>
                <Button type="button" variant="outline" className="h-11">
                  <Chrome className="w-5 h-5 mr-2" /> Google
                </Button>
              </div>

              {/* Voltar para login */}
              <p className="text-center text-sm text-muted-foreground">
                Já tem conta? <a className="font-semibold text-primary hover:underline" href="#">Entrar</a>
              </p>

              {status && (
                <p role="status" className="text-green-700 bg-green-50 border border-green-200 rounded-md p-2 text-sm">
                  {status}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
