"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();
const API_BASE_URL = "http://localhost:8000/api";
const USER_ID_MOCK = 2; 

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurantId, setRestaurantId] = useState(null);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/sacola/${USER_ID_MOCK}`);
            const items = response.data || [];
            setCartItems(items);
            if (items.length > 0) setRestaurantId(items[0].restaurant_id);
            else setRestaurantId(null);
        } catch (err) {
            console.error("Erro ao carregar sacola:", err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const handleUpdateItem = async (itemId, newQuantity) => {
        if (newQuantity <= 0) return handleDeleteItem(itemId);
        setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantidade: newQuantity } : item));
        try { await axios.put(`${API_BASE_URL}/sacola/${USER_ID_MOCK}/${itemId}`, { quantidade: newQuantity }); } 
        catch (err) { fetchCart(); }
    };

    const handleDeleteItem = async (itemId) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        try { await axios.delete(`${API_BASE_URL}/sacola/${USER_ID_MOCK}/${itemId}`); } 
        catch (err) { fetchCart(); }
    };

    const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + (item.preco_unitario || 0) * (item.quantidade || 0), 0), [cartItems]);
    const deliveryFee = 10.00;
    const total = subtotal + deliveryFee;

    // --- CHECKOUT FINAL ---
    const checkout = async (
        addressId, 
        paymentMethodCode, 
        observations, 
        deliveryType, 
        scheduledTime,
        cardToken = null // 🌟 NOVO: ARGUMENTO PARA O TOKEN DO CARTÃO
    ) => {
        if (cartItems.length === 0) {
            await fetchCart();
            if (cartItems.length === 0) throw new Error("A sacola está vazia.");
        }

        const currentRestaurantId = restaurantId || cartItems[0]?.restaurant_id;
        if (!currentRestaurantId) throw new Error("Restaurante não identificado.");

        const orderPayload = {
            restaurante_id: currentRestaurantId,
            endereco_id: addressId,
            
            // 🛑 DADOS DE PAGAMENTO (NOVOS CAMPOS)
            codigo_pagamento: paymentMethodCode,
            card_token: cardToken, // 🌟 INCLUÍDO O TOKEN NO PAYLOAD
            
            // Dados da Entrega
            tipo_entrega: deliveryType, 
            horario_entrega: scheduledTime || null,
            observacoes: observations, 
            
            // Dados do Carrinho
            itens_do_carrinho: cartItems.map(item => ({ 
                item_id: item.item_id, 
                quantidade: item.quantidade 
            })),
        };

        const response = await axios.post(`${API_BASE_URL}/pedidos/`, orderPayload);
        setCartItems([]);
        setRestaurantId(null);
        return response.data;
    };

    const clearCart = () => { setCartItems([]); setRestaurantId(null); };

    return (
        <CartContext.Provider value={{ cart: cartItems, loading, error, subtotal, deliveryFee, total, restaurantId, fetchCart, handleUpdateItem, handleDeleteItem, checkout, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
    return context;
}