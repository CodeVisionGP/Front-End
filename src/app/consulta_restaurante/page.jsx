// src/app/consulta_restaurante/page.jsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";
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
} from "lucide-react";

// -----------------------------------------------------
// 🧩 CONFIGURAÇÃO DA API
// -----------------------------------------------------
const API_BASE_PREFIX = "http://localhost:8000/api/restaurantes/nearby";
const API_ITEMS_PREFIX = "http://localhost:8000/api/restaurants";
const API_SACOLA_PREFIX = "http://localhost:8000/api/sacola";
const USER_ID_TO_FETCH = "4";

// -----------------------------------------------------
// ⚙️ FUNÇÕES E CONSTANTES AUXILIARES
// -----------------------------------------------------
const categories = [
  "Todos",
  "Italiana",
  "Japonesa",
  "Hambúrguer",
  "Saudável",
  "Brasileira",
];

const formatCurrencyBRL = (n) => {
  if (Number.isNaN(n) || n === undefined || n === null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(n);
};

// -----------------------------------------------------
// 💠 COMPONENTES REUTILIZÁVEIS
// -----------------------------------------------------
const Card = ({ className, children, onClick }) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ className, children, ...props }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// -----------------------------------------------------
// 🍽️ COMPONENTE DE ITENS DO RESTAURANTE
// -----------------------------------------------------
const RestaurantItems = ({ restaurantId, restaurantName, onAddItem }) => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar itens do restaurante
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_ITEMS_PREFIX}/${restaurantId}/items`
        );
        setItems(response.data);
      } catch (err) {
        console.error("Erro ao buscar itens:", err);
        const msg = err.response?.data?.detail || "Erro ao carregar o menu.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchItems();
  }, [restaurantId]);

  // Adicionar item à sacola
  const handleAddClick = async (item) => {
    setStatus((prev) => ({ ...prev, [item.id]: "loading" }));
    try {
      await onAddItem({
        item_id: item.id,
        restaurant_id: restaurantId,
        quantidade: 1,
      });
      setStatus((prev) => ({ ...prev, [item.id]: "success" }));
      setTimeout(
        () => setStatus((prev) => ({ ...prev, [item.id]: null })),
        1000
      );
    } catch {
      setStatus((prev) => ({ ...prev, [item.id]: "error" }));
      setTimeout(
        () => setStatus((prev) => ({ ...prev, [item.id]: null })),
        2000
      );
    }
  };

  // Estados de carregamento / erro / vazio
  if (loading)
    return (
      <div className="text-center p-8">
        <Utensils className="w-8 h-8 mx-auto animate-spin text-red-500" />
        <p className="mt-4 text-gray-700">
          Carregando menu de {restaurantName}...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-8 bg-red-100 rounded-lg">
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="text-center p-8">
        <Frown className="w-8 h-8 mx-auto text-gray-500" />
        <p className="mt-4 text-gray-700">
          Nenhum item disponível neste menu.
        </p>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        {restaurantName}
      </h2>

      <div className="space-y-4">
        {items.map((item) => {
          const currentStatus = status[item.id];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-between items-center bg-white p-4 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex-grow">
                <h3 className="font-extrabold text-lg text-red-600">
                  {item.nome}
                </h3>
                {item.descricao && (
                  <p className="text-sm text-gray-600 truncate">
                    {item.descricao}
                  </p>
                )}
                <p className="font-bold text-gray-900 mt-1">
                  {formatCurrencyBRL(item.preco)}
                </p>
              </div>

              {/* Botão de adicionar */}
              <Button
                onClick={() => handleAddClick(item)}
                disabled={currentStatus === "loading"}
                className={`p-2 rounded-full ml-4 shadow-lg w-10 h-10 ${
                  currentStatus === "success"
                    ? "bg-green-500"
                    : currentStatus === "error"
                    ? "bg-red-500"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <AnimatePresence mode="wait">
                  {currentStatus === "loading" && (
                    <Utensils className="w-5 h-5 animate-spin" />
                  )}
                  {currentStatus === "success" && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {currentStatus === "error" && <X className="w-5 h-5" />}
                  {!currentStatus && (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// -----------------------------------------------------
// 🏠 COMPONENTE PRINCIPAL: IFomeRestaurants
// -----------------------------------------------------
export default function IfomeRestaurants() {
  const [cartCount, setCartCount] = useState(0);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Adicionar item ao carrinho
  const handleAddItemToCart = async (itemData) => {
    try {
      const response = await axios.post(
        `${API_SACOLA_PREFIX}/${USER_ID_TO_FETCH}`,
        itemData
      );
      setCartCount((prev) => prev + 1);
      return response.data;
    } catch (err) {
      console.error("Erro ao adicionar item à sacola:", err);
      throw err;
    }
  };

  // Buscar restaurantes
  const fetchRestaurants = async (search) => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const url = `${API_BASE_PREFIX}/${USER_ID_TO_FETCH}?${params}`;
      const response = await axios.get(url);

      const processedData = response.data.map((r) => ({
        id: r.place_id,
        name: r.name,
        category: r.types?.[0] || "Geral",
        rating: r.rating || 4.5,
        deliveryTime: "30-40 min",
        deliveryFee: 5.0,
        image: `https://placehold.co/600x400/f43f5e/white?text=${r.name.substring(
          0,
          10
        )}`,
      }));

      setRestaurants(processedData);
    } catch (err) {
      setApiError(err.message || "Erro ao carregar restaurantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(searchTerm);
  }, [searchTerm, activeFilter]);

  // -----------------------------------------------------
  // 🎨 RENDERIZAÇÃO
  // -----------------------------------------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 font-sans">
      {/* Cabeçalho */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center px-8 py-6 text-white"
      >
        <div className="flex items-center gap-2">
          <Utensils className="w-7 h-7" />
          <h1 className="text-2xl font-extrabold">Ifome</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => (window.location.href = "/cadastro_endereco")}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full"
          >
            Cadastrar Endereço
          </Button>

          <Link href="/sacola" passHref>
            <Button className="relative p-2 bg-white/10 hover:bg-white/30 rounded-full text-white">
              <ShoppingBag className="w-7 h-7" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 text-xs font-bold text-white bg-red-600 rounded-full ring-2 ring-orange-400 flex items-center justify-center">
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

      {/* Campo de busca */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="relative mb-6">
          <Input
            placeholder="Buscar em restaurantes..."
            className="pl-10 h-12 bg-white shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Filtros */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              disabled={loading}
              className={`px-4 py-2 rounded-full ${
                activeFilter === cat
                  ? "bg-red-600 text-white font-semibold shadow-md"
                  : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Restaurantes */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-6 pb-12"
      >
        {loading ? (
          <div className="col-span-full text-center text-white">
            <Utensils className="w-12 h-12 mx-auto animate-spin" />
            <p className="mt-4 text-lg">Buscando restaurantes...</p>
          </div>
        ) : apiError ? (
          <div className="col-span-full text-center text-red-100 bg-red-600/50 p-6 rounded-xl">
            <p className="font-bold text-xl">Erro ao conectar</p>
            <p>{apiError}</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="col-span-full text-center text-white">
            <p className="font-semibold text-lg">Nenhum restaurante encontrado</p>
          </div>
        ) : (
          restaurants.map((r) => (
            <motion.div key={r.id}>
              <Card
                className="overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer"
                onClick={() => setSelectedRestaurant({ id: r.id, name: r.name })}
              >
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-40 object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/600x400/f43f5e/white?text=Ifome")
                  }
                />
                <div className="p-4">
                  <h2 className="text-lg font-bold truncate">{r.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4" />
                      <span>{r.rating.toFixed(1)}</span>
                    </div>
                    <span>• {r.category}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modal de Itens */}
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
                <h2 className="text-xl font-extrabold text-red-600">
                  {selectedRestaurant.name}
                </h2>
                <Button
                  onClick={() => setSelectedRestaurant(null)}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </header>

              <RestaurantItems
                restaurantId={selectedRestaurant.id}
                restaurantName={selectedRestaurant.name}
                onAddItem={handleAddItemToCart}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
