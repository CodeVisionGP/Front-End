"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Utensils, Search, Star, Clock, UserCircle } from "lucide-react";

// Mock de componentes 'shadcn/ui'
const Card = ({ className, children }) => <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>;
const Button = ({ className, children, ...props }) => <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props}>{children}</button>;
const Input = ({ className, ...props }) => <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;

const categories = ["Todos", "Italiana", "Japonesa", "Hambúrguer", "Saudável", "Brasileira"];

export default function IfomeRestaurants() {
  // Restaurantes mockados
  const [restaurants] = useState([
    { id: 1, name: "Cantina da Nona", category: "Italiana", rating: 4.8, deliveryTime: "25-35 min", deliveryFee: 5.99, image: "https://placehold.co/600x400/f43f5e/white?text=Pizza" },
    { id: 2, name: "Sushi House", category: "Japonesa", rating: 4.9, deliveryTime: "30-40 min", deliveryFee: 7.50, image: "https://placehold.co/600x400/ec4899/white?text=Sushi" },
    { id: 3, name: "Burger Kong", category: "Hambúrguer", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: 0, image: "https://placehold.co/600x400/8b5cf6/white?text=Burger" },
    { id: 4, name: "Salad Point", category: "Saudável", rating: 4.7, deliveryTime: "15-25 min", deliveryFee: 4.00, image: "https://placehold.co/600x400/22c55e/white?text=Salada" },
    { id: 5, name: "Padaria Pão Quente", category: "Brasileira", rating: 4.5, deliveryTime: "10-20 min", deliveryFee: 3.50, image: "https://placehold.co/600x400/3b82f6/white?text=Padaria" },
    { id: 6, name: "La Brasa Churrascaria", category: "Brasileira", rating: 4.8, deliveryTime: "40-50 min", deliveryFee: 10.00, image: "https://placehold.co/600x400/f97316/white?text=Churrasco" },
    { id: 7, name: "Açaí Power", category: "Saudável", rating: 4.9, deliveryTime: "10-15 min", deliveryFee: 0, image: "https://placehold.co/600x400/6366f1/white?text=Açaí" },
    { id: 8, name: "Temaki Express", category: "Japonesa", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: 6.00, image: "https://placehold.co/600x400/d946ef/white?text=Temaki" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === "Todos" || restaurant.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [restaurants, searchTerm, activeFilter]);

  const bgGradient = "bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300";

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className={`min-h-screen w-full ${bgGradient} relative overflow-x-hidden`}>
      {/* Elementos decorativos */}
      <motion.div aria-hidden initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 0.12, scale: 1 }} transition={{ duration: 1.2 }} className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-2xl" />
      <motion.div aria-hidden initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.12, y: 0 }} transition={{ duration: 1 }} className="pointer-events-none absolute -bottom-16 -left-12 w-96 h-96 rounded-full bg-white/20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-white">
            <Utensils className="w-7 h-7" />
            <h1 className="text-2xl font-extrabold tracking-tight">Ifome</h1>
          </div>
          <Button variant="ghost" className="p-2 rounded-full text-white hover:bg-white/20">
            <UserCircle className="w-7 h-7" />
          </Button>
        </motion.header>

        {/* Busca e filtros */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 space-y-6">
          <div className="relative">
            <Input id="search" placeholder="Buscar em restaurantes..." className="pl-10 h-12 text-base bg-white shadow-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map(category => (
              <Button key={category} onClick={() => setActiveFilter(category)} className={`whitespace-nowrap rounded-full px-4 py-2 transition-all duration-200 ${activeFilter === category ? 'bg-red-600 text-white font-semibold shadow-md' : 'bg-white/80 text-gray-700 hover:bg-white'}`}>
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Grid de Restaurantes */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map(restaurant => (
            <motion.div key={restaurant.id} variants={itemVariants}>
              <Card className="w-full overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-bold truncate">{restaurant.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{restaurant.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{restaurant.category}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                     <div className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
                       <span>{restaurant.deliveryTime}</span>
                     </div>
                     <span className={restaurant.deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                       {restaurant.deliveryFee === 0 ? "Grátis" : `R$ ${restaurant.deliveryFee.toFixed(2).replace('.', ',')}`}
                     </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredRestaurants.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 text-white">
            <p className="text-lg font-semibold">Nenhum restaurante encontrado.</p>
            <p className="text-white/80">Tente ajustar sua busca ou filtros.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
