import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { ArrowLeft, Package, AlertTriangle, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchInventory = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory`, {
                params: { _t: new Date().getTime() }
            });
            setInventory(response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        const interval = setInterval(fetchInventory, 5000);
        return () => clearInterval(interval);
    }, []);

    const openRestockModal = (product) => {
        setSelectedProduct(product);
        setRestockQuantity('');
        setIsModalOpen(true);
    };

    const handleRestockSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !restockQuantity) return;

        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/api/inventory/restock`, {
                product_id: selectedProduct.id,
                quantity: parseInt(restockQuantity)
            });
            setIsModalOpen(false);
            fetchInventory(); // Immediate refresh
        } catch (error) {
            console.error("Restock failed:", error);
            alert("Failed to restock. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20">Loading Inventory...</div>;

    const availableItems = inventory.filter(i => i.status !== 'Out of Stock');
    const outOfStockItems = inventory.filter(i => i.status === 'Out of Stock');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 bg-surface rounded-lg text-muted hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-surface p-6 rounded-xl border border-white/5">
                        <h3 className="text-muted text-sm uppercase">Total Products</h3>
                        <p className="text-3xl font-bold text-white mt-2">{inventory.length}</p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-white/5">
                        <h3 className="text-muted text-sm uppercase">Low Stock Alerts</h3>
                        <p className="text-3xl font-bold text-yellow-400 mt-2">
                            {inventory.filter(i => i.status === 'Low Stock').length}
                        </p>
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-white/5">
                        <h3 className="text-muted text-sm uppercase">Restock Needed</h3>
                        <p className="text-3xl font-bold text-red-500 mt-2">
                            {outOfStockItems.length}
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Available Inventory Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="text-primary" size={24} />
                            <h2 className="text-xl font-bold text-white">Available Inventory</h2>
                        </div>
                        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-muted uppercase text-xs">
                                        <tr>
                                            <th className="p-4">Product Name</th>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Sold</th>
                                            <th className="p-4">Remaining</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                        {availableItems.length > 0 ? availableItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-medium text-white">{item.name}</td>
                                                <td className="p-4 font-mono text-xs text-muted">{item.id}</td>
                                                <td className="p-4">{item.sold}</td>
                                                <td className="p-4 font-bold">{item.remaining} / {item.initial_stock}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold bg-opacity-20 ${item.status === 'In Stock' ? 'bg-green-500 text-green-400' : 'bg-yellow-500 text-yellow-400'
                                                        }`}>
                                                        {item.status === 'In Stock' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {item.status === 'Low Stock' && (
                                                        <button
                                                            onClick={() => openRestockModal(item)}
                                                            className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md text-xs font-bold transition-all"
                                                        >
                                                            <PlusCircle size={14} /> Back Order
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-muted">No items in inventory.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Restock Queue Section */}
                    {outOfStockItems.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <XCircle className="text-red-500" size={24} />
                                <h2 className="text-xl font-bold text-red-500">Restock Queue (Out of Stock)</h2>
                            </div>
                            <div className="bg-surface rounded-xl border border-red-500/30 overflow-hidden shadow-lg shadow-red-500/5">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-red-500/10 text-red-400 uppercase text-xs">
                                            <tr>
                                                <th className="p-4">Product Name</th>
                                                <th className="p-4">ID</th>
                                                <th className="p-4">Sold</th>
                                                <th className="p-4">Total Stock</th>
                                                <th className="p-4">Action Needed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-500/10 text-sm text-gray-300">
                                            {outOfStockItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-red-500/5 transition-colors">
                                                    <td className="p-4 font-medium text-white">{item.name}</td>
                                                    <td className="p-4 font-mono text-xs text-muted">{item.id}</td>
                                                    <td className="p-4">{item.sold}</td>
                                                    <td className="p-4 font-bold text-red-400">0 / {item.initial_stock}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => openRestockModal(item)}
                                                            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg hover:shadow-red-500/20"
                                                        >
                                                            <Package size={14} /> RESTOCK NOW
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Restock Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
                            >
                                <XCircle size={24} />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-2">Restock Product</h2>
                            <p className="text-sm text-muted mb-6">Updating inventory for <span className="text-primary font-semibold">{selectedProduct?.name}</span></p>

                            <form onSubmit={handleRestockSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-2">Quantity to Add</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-3 text-muted" size={18} />
                                        <input
                                            type="number"
                                            min="1"
                                            value={restockQuantity}
                                            onChange={(e) => setRestockQuantity(e.target.value)}
                                            className="w-full bg-background border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
                                            placeholder="Enter amount..."
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                    >
                                        {submitting ? 'Updating...' : 'Confirm Restock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
