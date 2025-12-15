import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const Home = () => {
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        const fetchBestSellers = () => {
            axios.get(`${API_BASE_URL}/api/best-sellers`)
                .then(res => setBestSellers(res.data))
                .catch(err => console.error(err));
        };

        fetchBestSellers(); // Initial fetch
        const interval = setInterval(fetchBestSellers, 2000); // Poll every 2 seconds for "real-time" feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 text-center max-w-2xl mb-12">
                <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                    Sales <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence</span> Hub
                </h1>
                <p className="text-muted text-lg mb-8">
                    Real-time analytics, inventory tracking, and predictive insights for your business.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link to="/dashboard" className="group flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25">
                        <LayoutDashboard size={20} />
                        Go to Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/inventory" className="flex items-center gap-2 bg-surface hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-medium transition-all">
                        <Package size={20} />
                        Check Inventory
                    </Link>
                    <Link to="/pipeline" className="flex items-center gap-2 bg-surface hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-lg font-medium transition-all">
                        <Zap size={20} />
                        Pipeline
                    </Link>
                </div>

                <div className="mt-6 flex justify-center">
                    <Link to="/strategy" className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm border-b border-transparent hover:border-white pb-0.5">
                        <TrendingUp size={16} />
                        Executive Strategy Hub
                    </Link>
                </div>
            </div>

            {/* Best Sellers Section */}
            <div className="z-10 w-full max-w-4xl">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-accent" size={24} />
                    <h2 className="text-xl font-bold text-white">Top Performing Products</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {bestSellers.map((product, index) => (
                        <div key={index} className="bg-surface/50 backdrop-blur border border-white/5 p-4 rounded-xl hover:border-accent/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-2xl font-bold text-white/10">#{index + 1}</span>
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                            </div>
                            <h3 className="font-medium text-white truncate" title={product.name}>{product.name}</h3>
                            <p className="text-accent font-bold mt-1">${product.revenue.toLocaleString()}</p>
                            <p className="text-xs text-muted">Revenue</p>
                        </div>
                    ))}
                    {bestSellers.length === 0 && (
                        <div className="col-span-full text-center text-muted py-8">Loading best sellers...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
