"use client";

/* -------------------------------------------------
 📌 IMPORTAÇÕES
------------------------------------------------- */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import {
  Utensils,
  Search,
  Star,
  Clock,
  UserCircle,
  Frown,
  X,
  ShoppingBag,
  CheckCircle,
  BarChart2,
} from "lucide-react";

/* -------------------------------------------------
 🔗 API CONFIG
------------------------------------------------- */
const API = {
  RESTAURANTS_NEARBY: "http://localhost:8000/api/restaurantes/nearby",
  RESTAURANT_ITEMS: "http://localhost:8000/api/restaurants",
  CART: "http://localhost:8000/api/sacola",
  USER_ID: "2",
};

/* -------------------------------------------------
 🎨 CONSTANTES & UTIL
------------------------------------------------- */
const CATEGORIES = ["Todos", "Italiana", "Japonesa", "Hambúrguer", "Saudável", "Brasileira"];

const formatCurrencyBRL = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

/* -------------------------------------------------
 🧱 COMPONENTES BASE
------------------------------------------------- */
const Card = ({ className, children, onClick }) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow cursor-pointer ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ className, children, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`h-12 w-full rounded-md border px-3 text-sm bg-white shadow-lg focus-visible:ring-2 ${className}`}
    {...props}
  />
);

/* -------------------------------------------------
 🍝 COMPONENTE: ITENS DO RESTAURANTE (POPUP)
------------------------------------------------- */
const RestaurantItems = ({ restaurantId, restaurantName, onAddItem }) => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Carrega Itens */
  useEffect(() => {
    if (!restaurantId) return;

    setLoading(true);
    axios
      .get(`${API.RESTAURANT_ITEMS}/items/${restaurantId}`)
      .then((res) => setItems(res.data))
      .catch(() => setError("Erro ao carregar o menu."))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  /* Adicionar à sacola */
  const handleAddClick = async (item) => {
    setStatus((prev) => ({ ...prev, [item.id]: "loading" }));
    try {
      await onAddItem({
        item_id: item.id,
        restaurant_id: restaurantId,
        quantidade: 1,
        nome: item.nome,
        preco: item.preco,
      });
      setStatus((prev) => ({ ...prev, [item.id]: "success" }));
      setTimeout(() => setStatus((prev) => ({ ...prev, [item.id]: null })), 1000);
    } catch {
      setStatus((prev) => ({ ...prev, [item.id]: "error" }));
      setTimeout(() => setStatus((prev) => ({ ...prev, [item.id]: null })), 2000);
    }
  };

  /* Estado Carregando */
  if (loading)
    return (
      <div className="text-center p-8">
        <Utensils className="w-8 h-8 mx-auto animate-spin text-red-500" />
        <p className="mt-4 text-gray-700">Carregando menu de {restaurantName}...</p>
      </div>
    );

  /* Estado Erro */
  if (error)
    return <div className="text-center p-8 text-red-700 font-semibold bg-red-100 rounded-lg">{error}</div>;

  /* Estado Vazio */
  if (items.length === 0)
    return (
      <div className="text-center p-8">
        <Frown className="w-8 h-8 mx-auto text-gray-500" />
        <p className="mt-4 text-gray-700">Nenhum item disponível neste menu.</p>
      </div>
    );

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{restaurantName}</h2>

      <div className="space-y-4">
        {items.map((item) => {
          const statusIcon = status[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            >
              {/* IMAGEM */}
              {item.imagem_url && (
                <img
                  src={item.imagem_url}
                  alt={item.nome}
                  className="h-24 w-24 rounded-lg object-cover shadow-sm mr-4"
                />
              )}

              {/* TEXTO */}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-lg text-red-600 truncate">{item.nome}</h3>
                {item.descricao && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.descricao}</p>}
                <p className="font-bold text-gray-900 text-lg">{formatCurrencyBRL(item.preco)}</p>
              </div>

              {/* BOTÃO ADD */}
              <Button
                onClick={() => handleAddClick(item)}
                disabled={statusIcon === "loading"}
                className={`p-2 rounded-full ml-4 shadow-lg w-10 h-10 text-white ${
                  statusIcon === "success"
                    ? "bg-green-500"
                    : statusIcon === "error"
                    ? "bg-red-500"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <AnimatePresence mode="wait">
                  {statusIcon === "loading" && <Utensils className="w-5 h-5 animate-spin" />}
                  {statusIcon === "success" && <CheckCircle className="w-5 h-5" />}
                  {statusIcon === "error" && <X className="w-5 h-5" />}
                  {!statusIcon && <ShoppingBag className="w-5 h-5" />}
                </AnimatePresence>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------
 🍔 COMPONENTE PRINCIPAL: RESTAURANTES
------------------------------------------------- */
export default function IFomeRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  /* Buscar Restaurantes */
  useEffect(() => {
    setLoading(true);

    axios
      .get(`${API.RESTAURANTS_NEARBY}/${API.USER_ID}?search=${searchTerm}`)
      .then(({ data }) =>
        setRestaurants(
          data.map((r) => ({
            id: r.place_id,
            name: r.name,
            category: r.types?.[0] || "Geral",
            rating: r.rating || 4.5,
            image: `https://placehold.co/600x400/f43f5e/white?text=${r.name.substring(0, 12)}`,
          }))
        )
      )
      .catch(() => setApiError("Erro ao conectar com a API."))
      .finally(() => setLoading(false));
  }, [searchTerm]);

  /* Adicionar item */
  const addToCart = async (item) => {
    await axios.post(`${API.CART}/${API.USER_ID}`, item);
    setCartCount((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 font-sans">
      {/* 🔻 HEADER */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center px-8 py-6 text-white"
      >
        <h1 className="flex gap-2 items-center text-2xl font-extrabold">
          <Utensils className="w-7 h-7" /> Hunger By
        </h1>

        <div className="flex items-center gap-3">
          <Link href="/relatorios">
            <Button className="p-2 bg-white/10 hover:bg-white/30 rounded-full text-white">
              <BarChart2 className="w-7 h-7" />
            </Button>
          </Link>

          <Link href="/historico">
            <Button className="p-2 bg-white/10 hover:bg-white/30 rounded-full text-white">
              <Clock className="w-7 h-7" />
            </Button>
          </Link>

          <Button
            onClick={() => (window.location.href = "/cadastro_endereco")}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full"
          >
            Cadastrar Endereço
          </Button>

          <Link href="/sacola" className="relative">
            <Button className="p-2 bg-white/10 hover:bg-white/30 rounded-full text-white">
              <ShoppingBag className="w-7 h-7" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 text-xs font-bold bg-red-600 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          <Button className="p-2 rounded-full text-white hover:bg-white/20">
            <UserCircle className="w-7 h-7" />
          </Button>
        </div>
      </motion.header>

      {/* 🔍 BUSCA */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="relative mb-6">
          <Input placeholder="Buscar em restaurantes..." onChange={(e) => setSearchTerm(e.target.value)} />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 🍽️ LISTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 pb-12">
        {loading && (
          <div className="col-span-full text-center text-white">
            <Utensils className="w-12 h-12 mx-auto animate-spin" />
            <p className="mt-4 text-lg">Buscando restaurantes...</p>
          </div>
        )}

        {apiError && <p className="col-span-full text-center text-red-200 font-bold">{apiError}</p>}

        {!loading && !apiError && restaurants.length === 0 && (
          <p className="col-span-full text-center text-white font-semibold">Nenhum restaurante encontrado</p>
        )}

        {restaurants.map((r) => (
          <Card key={r.id} className="overflow-hidden bg-white rounded-2xl shadow-lg">
            <img
              src={r.image}
              alt={r.name}
              className="w-full h-40 object-cover"
              onClick={() => setSelectedRestaurant({ id: r.id, name: r.name })}
            />
            <div className="p-4">
              <h2 className="text-lg font-bold truncate">{r.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4" /> {r.rating.toFixed(1)}
                </span>
                <span>• {r.category}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 🧾 MODAL */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl"
            >
              <header className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-red-600">{selectedRestaurant.name}</h2>
                <Button onClick={() => setSelectedRestaurant(null)} className="p-2 bg-gray-200 hover:bg-gray-300">
                  <X className="w-5 h-5" />
                </Button>
              </header>

              <RestaurantItems
                restaurantId={selectedRestaurant.id}
                restaurantName={selectedRestaurant.name}
                onAddItem={addToCart}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
