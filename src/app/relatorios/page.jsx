"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, FileText, BarChart2, TrendingUp, DollarSign, Clock, Truck, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
// 🌟 Importações do Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


// --- CONFIGURAÇÃO ---
const API_BASE_URL = "http://localhost:8000/api";

// --- FUNÇÕES DE AJUDA ---

// Função para formatar números para a moeda Brasileira
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

// Função para formatar a data para o padrão 'YYYY-MM-DD' (usado pelo backend)
const formatDate = (date) => date.toISOString().split('T')[0];

const today = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(today.getDate() - 7);

const initialDataFim = formatDate(today);
const initialDataInicio = formatDate(sevenDaysAgo);

// -----------------------------------------------------
// 📊 COMPONENTE DE GRÁFICO (RECHARTS)
// -----------------------------------------------------

const HorizontalBarChart = ({ data, dataKey, nameKey, title }) => (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-inner">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    type="number" 
                    tickFormatter={formatCurrency} // Formata o eixo X (Faturamento) como moeda
                />
                <YAxis 
                    dataKey={nameKey} // Nome do Restaurante ou Produto
                    type="category" 
                    width={100} // Garante espaço para o nome
                    className="text-xs"
                />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Faturamento']} />
                <Legend />
                <Bar 
                    dataKey={dataKey} 
                    name={dataKey === 'faturamento' ? "Faturamento (R$)" : "Valor Faturado (R$)"} 
                    fill="#ff6600" 
                    radius={[10, 10, 0, 0]}
                    // Adiciona um rótulo básico para melhor visualização
                    label={{ position: 'right', formatter: (value) => value > 0 ? formatCurrency(value) : '' }} 
                />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

// Componente para o Gráfico de Linha (Relatório 1)
const LineTimeChart = ({ data }) => (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-inner">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Faturamento Diário</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Faturamento']} />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="faturamento" 
                    name="Faturamento Diário" 
                    stroke="#1e90ff" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);


export default function RelatoriosPage() {
    // Relatório 1 (Dados dinâmicos)
    const [pedidosPorPeriodo, setPedidosPorPeriodo] = useState(null);
    const [pedidosPorDia, setPedidosPorDia] = useState([]); // 🌟 NOVO ESTADO
    
    // Relatório 2 & 3 (Dados dinâmicos)
    const [restaurantesMaisVendas, setRestaurantesMaisVendas] = useState([]);
    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
    
    // Filtros
    const [dataInicio, setDataInicio] = useState(initialDataInicio);
    const [dataFim, setDataFim] = useState(initialDataFim);
    
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [error, setError] = useState(null);

    // --- FUNÇÕES DE BUSCA ---

    // Busca o Relatório 1 (Séries temporais diárias) 🌟 ROTA NECESSÁRIA NO BACKEND
    const fetchPedidosPorDia = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/pedidos_por_dia`, {
                params: { data_inicio: dataInicio, data_fim: dataFim }
            });
            // Mapeia os dados para o formato que o gráfico precisa (ex: data: '2025-11-20', faturamento: 150.50)
            setPedidosPorDia(response.data.map(item => ({
                ...item,
                data: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            })));
        } catch (err) {
            console.error("Erro ao buscar dados diários:", err);
            // Se esta rota falhar, não é fatal, o relatório agregado continua
        }
    };
    
    // Busca o Relatório 1 (Agregado) - Dispara a busca diária também
    const fetchRelatorioPedidos = async (e) => {
        if (e) e.preventDefault();
        setLoading1(true);
        setError(null);
        setPedidosPorPeriodo(null); 

        // Dispara a busca da série temporal
        fetchPedidosPorDia();

        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/pedidos_por_periodo`, {
                params: { data_inicio: dataInicio, data_fim: dataFim }
            });
            setPedidosPorPeriodo(response.data);
        } catch (err) {
            console.error("Erro ao buscar relatório agregado:", err);
            setError("Não foi possível carregar o Relatório 1. Verifique o console.");
        } finally {
            setLoading1(false);
        }
    };
    
    // Busca o Relatório 2 (Restaurantes)
    const fetchRelatorioRestaurantes = async () => {
        setLoading2(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/restaurantes_mais_vendas`);
            setRestaurantesMaisVendas(response.data);
        } catch (err) {
            console.error("Erro ao buscar ranking de restaurantes:", err);
        } finally {
            setLoading2(false);
        }
    };

    // Busca o Relatório 3 (Produtos)
    const fetchRelatorioProdutos = async () => {
        setLoading3(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/relatorios/produtos_mais_vendidos`);
            setProdutosMaisVendidos(response.data);
        } catch (err) {
            console.error("Erro ao buscar ranking de produtos:", err);
        } finally {
            setLoading3(false);
        }
    };


    // Executa as buscas na montagem e no clique
    useEffect(() => {
        fetchRelatorioRestaurantes();
        fetchRelatorioProdutos();
        // A busca de pedidos por período é acionada pelo [dataInicio, dataFim] no useEffect abaixo
    }, []); 

    // Executa o Relatório 1 sempre que o filtro de data mudar
    useEffect(() => {
        if (dataInicio && dataFim) {
            fetchRelatorioPedidos();
        }
    }, [dataInicio, dataFim]); 

    
    // --- COMPONENTES DE LAYOUT (Mantidos) ---

    const ReportHeader = ({ title, icon: Icon, description }) => (
        <div className="flex items-center border-b pb-3 mb-4 text-orange-600">
            <Icon className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && <p className="text-sm text-gray-500 ml-4">{description}</p>}
        </div>
    );
    
    const MetricCard = ({ title, value, icon: Icon, colorClass = "bg-orange-50" }) => (
        <div className={`p-5 rounded-xl shadow-md ${colorClass} flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-600 uppercase">{title}</p>
                <Icon className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                    <FileText className="w-7 h-7 mr-3 text-orange-500" />
                    Painel de Relatórios Gerenciais
                </h1>

                {/* --- FILTROS DE DATA --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
                    <form onSubmit={fetchRelatorioPedidos} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                            <input
                                type="date"
                                id="dataInicio"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                            <input
                                type="date"
                                id="dataFim"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading1}
                            className="bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition flex items-center shadow-md disabled:opacity-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {loading1 ? "Buscando..." : "Aplicar Filtro"}
                        </button>
                    </form>
                </div>
                
                {/* 1. Relatório de Pedidos por Período */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-lg mb-10"
                >
                    <ReportHeader 
                        title="1. Relatório de Pedidos por Período" 
                        icon={FileText} 
                        description={`Período: ${dataInicio} a ${dataFim}`}
                    />
                    
                    {error && <p className="text-red-500 font-medium my-4">{error}</p>}
                    
                    {pedidosPorPeriodo && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <MetricCard 
                                title="Total de Pedidos" 
                                value={pedidosPorPeriodo.total_pedidos}
                                icon={Truck}
                                colorClass="bg-blue-50"
                            />
                            <MetricCard 
                                title="Faturamento Total" 
                                value={formatCurrency(pedidosPorPeriodo.faturamento_total)}
                                icon={DollarSign}
                                colorClass="bg-green-50"
                            />
                            <MetricCard 
                                title="Ticket Médio" 
                                value={formatCurrency(pedidosPorPeriodo.ticket_medio)}
                                icon={Clock}
                                colorClass="bg-yellow-50"
                            />
                            <MetricCard 
                                title="Restaurante c/ Mais Pedidos" 
                                value={pedidosPorPeriodo.restaurante_mais_pedidos}
                                icon={Users}
                                colorClass="bg-purple-50"
                            />
                        </div>
                    )}
                    
                    {/* 🌟 GRÁFICO DE LINHA (Relatório 1) */}
                    {pedidosPorDia.length > 0 ? (
                        <LineTimeChart data={pedidosPorDia} />
                    ) : (
                        <div className="mt-8">
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 h-48 flex items-center justify-center text-gray-500">
                                <BarChart2 className="w-5 h-5 mr-2" />
                                Visual Extra: Gráfico de Linha (Disponível após implementar a rota `/pedidos_por_dia`)
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* 2. Relatório de Restaurantes com Mais Vendas */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg mb-10"
                >
                    <ReportHeader title="2. Relatório de Restaurantes com Mais Vendas" icon={TrendingUp} />
                    
                    {loading2 ? (
                        <p className="text-center text-orange-500 font-medium my-4">Carregando ranking...</p>
                    ) : restaurantesMaisVendas.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurante</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº de Pedidos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento (R$)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                                                <Star className="w-3 h-3 mr-1" /> Avaliação Média
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {restaurantesMaisVendas.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">{item.rank}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.restaurante}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.n_pedidos}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatCurrency(item.faturamento)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.avaliacao_media}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* 🌟 GRÁFICO 2 */}
                            <HorizontalBarChart
                                data={restaurantesMaisVendas}
                                dataKey="faturamento" 
                                nameKey="restaurante"
                                title="Faturamento por Restaurante (Top 5)"
                            />
                        </>
                    ) : (
                        <p className="text-center text-gray-500 my-4">Nenhum restaurante encontrado no ranking.</p>
                    )}
                </motion.div>

                {/* 3. Relatório de Produtos Mais Vendidos */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-lg"
                >
                    <ReportHeader title="3. Relatório de produtos mais vendidos" icon={DollarSign} />
                    
                    {loading3 ? (
                        <p className="text-center text-orange-500 font-medium my-4">Carregando ranking de produtos...</p>
                    ) : produtosMaisVendidos.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Faturado (R$)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {produtosMaisVendidos.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">{item.rank}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produto}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{formatCurrency(item.valor_faturado)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* 🌟 GRÁFICO 3 */}
                            <HorizontalBarChart
                                data={produtosMaisVendidos}
                                dataKey="valor_faturado" 
                                nameKey="produto"
                                title="Faturamento por Produto (Top 5)"
                            />
                        </>
                    ) : (
                        <p className="text-center text-gray-500 my-4">Nenhum produto encontrado no ranking.</p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

// O componente ChartPlaceholder foi removido/substituído.