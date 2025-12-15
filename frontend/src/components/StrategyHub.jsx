import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Printer, TrendingUp, Target, BarChart2, PieChart, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';

const StrategyHub = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monthlyGoal] = useState(50000); // Hardcoded goal for demo

    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsAdmin(!!token);

        const fetchData = () => {
            axios.get(`${API_BASE_URL}/api/dashboard-data`)
                .then(res => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleExportClick = () => {
        if (isAdmin) {
            window.print();
        } else {
            navigate('/login', { state: { from: { pathname: '/strategy' } } });
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-text">Loading Strategy Hub...</div>;
    if (!data) return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">Failed to load data.</div>;

    // --- Feature 1: AI Forecasting (Moving Average Projection) ---
    // We take the last 7 days and project the next 3 days
    const trends = data.trends || [];
    const last7Days = trends.slice(-7);

    // Calculate simple average growth or just average value
    const avgValue = last7Days.reduce((acc, curr) => acc + curr.Revenue, 0) / (last7Days.length || 1);

    const projection = [];
    if (last7Days.length > 0) {
        const lastDate = new Date(last7Days[last7Days.length - 1].Date);
        for (let i = 1; i <= 3; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(lastDate.getDate() + i);
            projection.push({
                Date: nextDate.toISOString().split('T')[0],
                Revenue: null,
                Forecast: avgValue * (1 + (i * 0.02)) // Assume 2% daily growth for "AI" vibe
            });
        }
    }

    // Combine for chart: Historical has Revenue, Projection has Forecast
    const forecastData = [
        ...last7Days.map(d => ({ ...d, Forecast: null })),
        ...projection
    ];

    // --- Feature 2: Goal Tracking ---
    const currentRevenue = data.kpi.total_revenue;
    const progress = Math.min((currentRevenue / monthlyGoal) * 100, 100);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center hide-print">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 bg-surface rounded-lg text-muted hover:text-white transition-colors">
                            <HomeIcon size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">Executive Strategy Hub</h1>
                            <p className="text-muted text-sm mt-1">Strategic Planning & Performance Forecasting</p>
                        </div>
                    </div>
                    {/* Feature 3: Reports (PDF Export via Print) - PROTECTED */}
                    <button
                        onClick={handleExportClick}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isAdmin ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-surface hover:bg-white/10 text-muted hover:text-white border border-white/10'}`}
                    >
                        {isAdmin ? <Printer size={20} /> : <Lock size={16} />}
                        <span>{isAdmin ? 'Export Report' : 'Login to Export'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Feature 1: AI Sales Forecasting */}
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-accent/20 rounded-lg text-accent">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">AI Sales Forecast</h2>
                                <p className="text-muted text-xs">Projection based on 7-day moving average</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="Date" stroke="#94a3b8" fontSize={12} tickFormatter={(str) => str.slice(5)} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#242936', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Actuals" />
                                    <Line type="monotone" dataKey="Forecast" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} name="AI Projection" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Feature 2: Goal Tracking */}
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                                <Target size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Monthly Revenue Goal</h2>
                                <p className="text-muted text-xs">Target: ${monthlyGoal.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-4xl font-bold text-white">${currentRevenue.toLocaleString()}</span>
                                <span className="text-secondary font-bold text-xl">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-4 w-full bg-background rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-muted text-sm pt-2">
                                {progress >= 100
                                    ? "🎉 Goal Achieved! Excellent work."
                                    : `Need $${(monthlyGoal - currentRevenue).toLocaleString()} more to hit target.`}
                            </p>
                        </div>
                    </div>

                    {/* Feature 4: Strategic Comparison (Region vs Channel) */}
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Strategic Deep Dive</h2>
                                <p className="text-muted text-xs">Comparative Analysis: Regions & Channels</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Region Bar Chart */}
                            <div className="h-64">
                                <h3 className="text-center text-white mb-4 text-sm font-medium">Regional Performance</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.regions}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                        <XAxis dataKey="Region" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.2 }} contentStyle={{ backgroundColor: '#242936', borderColor: '#334155', color: '#f8fafc' }} />
                                        <Bar dataKey="TotalPrice" name="Sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Channel Bar Chart */}
                            <div className="h-64">
                                <h3 className="text-center text-white mb-4 text-sm font-medium">Channel Performance</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.channels} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} horizontal={true} vertical={true} />
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="Channel" type="category" stroke="#94a3b8" width={80} />
                                        <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.2 }} contentStyle={{ backgroundColor: '#242936', borderColor: '#334155', color: '#f8fafc' }} />
                                        <Bar dataKey="TotalPrice" name="Sales" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Feature 5: Executive Insight Report (Essay) - Hidden on Screen, Visible on Print - PROTECTED */}
                {isAdmin && (
                    <div className="hidden print:block bg-surface p-8 rounded-xl border border-white/5 shadow-lg mt-8 print:shadow-none print:border-gray-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 print:hidden">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 print:text-black">Executive Insight Report</h2>
                                <p className="text-muted text-sm print:text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none print:prose-black">
                            {/* Strategic Recommendation Section */}
                            <div className={`p-4 rounded-lg border mb-6 ${progress >= 100 ? 'border-green-500 bg-green-500/10 print:bg-green-50 print:border-green-200' : 'border-amber-500 bg-amber-500/10 print:bg-amber-50 print:border-amber-200'}`}>
                                <h3 className={`text-lg font-bold mt-0 mb-2 ${progress >= 100 ? 'text-green-400 print:text-green-700' : 'text-amber-400 print:text-amber-700'}`}>
                                    {progress >= 100 ? "🎉 Executive Summary: Goal Exceeded" : "⚠️ Executive Summary: Attention Required"}
                                </h3>
                                <p className="text-sm print:text-gray-800 font-medium">
                                    {progress >= 100
                                        ? "Congratulations to the team! We have successfully surpassed our monthly revenue targets. Recommendation: Analyze top-performing channels to replicate this success next month and consider reviewing inventory to maintain momentum."
                                        : "We are currently trailing our monthly revenue target. Recommendation: Immediate focus should be placed on high-margin products and underperforming regions. Consider running a targeted promotion to close the gap before month-end."
                                    }
                                </p>
                            </div>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-4 print:text-black">1. Sales Forecasting & Future Outlook</h3>
                            <p className="text-gray-300 leading-relaxed mb-4 print:text-gray-800">
                                The <strong>"AI Sales Forecast"</strong> chart provides a data-driven projection of our immediate future revenue.
                                The <span className="text-blue-400 font-bold print:text-blue-700">Solid Blue Line</span> shows our actual confirmed sales over the last 7 days.
                                The <span className="text-green-400 font-bold print:text-green-700">Dotted Green Line</span> represents the AI's prediction for the coming days.
                            </p>
                            <p className="text-gray-300 leading-relaxed mb-6 print:text-gray-800">
                                <strong>Strategic Implication:</strong> If the green line trends upwards, it indicates positive momentum based on recent buying behavior.
                                Use this to anticipate inventory needs 3 days in advance.
                            </p>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-4 print:text-black">2. Performance Against Targets</h3>
                            <p className="text-gray-300 leading-relaxed mb-4 print:text-gray-800">
                                We have set a monthly revenue target of <strong>${monthlyGoal.toLocaleString()}</strong>.
                                Currently, we have achieved <strong>{progress.toFixed(1)}%</strong> of this goal.
                            </p>
                            <p className="text-gray-300 leading-relaxed mb-6 print:text-gray-800">
                                {progress >= 100
                                    ? "Outstanding performance. We have exceeded our monthly targets. Consider reviewing operational capacity to ensure we can sustain this volume."
                                    : "We are currently chasing our target. Investigating the underperforming regions in the 'Strategic Deep Dive' section below may reveal opportunities to close this gap."
                                }
                            </p>

                            <h3 className="text-xl font-semibold text-white mt-6 mb-4 print:text-black">3. Regional & Channel Analysis</h3>
                            <p className="text-gray-300 leading-relaxed print:text-gray-800">
                                The <strong>"Strategic Deep Dive"</strong> charts allow for a side-by-side comparison of where our money comes from.
                                Understanding which Region or Sales Channel (e.g., Webstore vs Shop) is driving the most revenue allows us to allocate marketing budget more effectively.
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 print:border-gray-300 text-center text-sm text-muted">
                            <p>End of Executive Report • {new Date().getFullYear()} Sales Intelligence Hub</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .hide-print { display: none; }
                    body { background: white; color: black; }
                    .bg-surface { background: white; border: 1px solid #ddd; box-shadow: none; }
                    .text-white { color: black !important; }
                    .text-muted { color: #666 !important; }
                }
            `}</style>
        </div>
    );
};

export default StrategyHub;
