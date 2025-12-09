import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KPICard from './KPICard';
import { TrendChart, ChannelChart, ProfitScatter, RegionChart } from './DashboardCharts';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchData = async () => {
        try {
            // Check if we are in dev mode (Vite typically proxies, but for now we might hit absolute URL or proxy)
            // Assuming proxy is set up in vite.config.js OR we use absolute URL
            // Using absolute localhost for now to be safe
            const response = await axios.get('http://127.0.0.1:5000/api/dashboard-data');
            setData(response.data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-text">Loading Dashboard...</div>;
    }

    if (!data) return <div className="text-red-500 text-center p-10">Failed to load data. Is backend running?</div>

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">AbiaTech Solutions: Daily Sales Performance</h1>
                        <p className="text-muted text-sm mt-1">Live data feed • Updated {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-surface border border-white/10 rounded-lg text-muted hover:text-white transition-colors">
                        <RefreshCcw size={20} />
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard
                        title="Total Revenue"
                        value={`$${data.kpi.total_revenue.toLocaleString()}`}
                        trend="up"
                        trendValue="12%"
                        color="primary"
                    />
                    <KPICard
                        title="Gross Profit"
                        value={`$${data.kpi.gross_profit.toLocaleString()}`}
                        trend="up"
                        trendValue="8.5%"
                        color="secondary"
                    />
                    <KPICard
                        title="Profit Margin"
                        value={`${data.kpi.profit_margin.toFixed(1)}%`}
                        trend="down"
                        trendValue="2.1%"
                        color="accent"
                    />
                </div>

                {/* Row 2: Trends and Channels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Revenue & Profit Trends (Daily)</h3>
                        <TrendChart data={data.trends} />
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Revenue by Sales Channel</h3>
                        <ChannelChart data={data.channels} />
                    </div>
                </div>

                {/* Row 3: Scatter, Map, Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg lg:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">Product Profitability Analysis</h3>
                        <ProfitScatter data={data.products} />
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg lg:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">Sales by Region</h3>
                        <RegionChart data={data.regions} />
                    </div>
                    <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg lg:col-span-1 flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Data Quality & Pipelines</h3>

                        <div className={`flex items-center gap-4 p-4 bg-background/50 rounded-lg border ${data.kpi.pipeline_status === 'Active' ? 'border-green-500/20' : 'border-red-500/20'}`}>
                            <div className={`w-3 h-3 rounded-full ${data.kpi.pipeline_status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <div>
                                <h4 className="text-sm font-medium text-white">Pipeline Status</h4>
                                <p className={`text-xs ${data.kpi.pipeline_status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                    {data.kpi.pipeline_status}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-white/5">
                            <AlertCircle size={20} className="text-muted" />
                            <div>
                                <h4 className="text-sm font-medium text-white">Data Quality Alerts ({data.kpi.data_quality_alerts})</h4>
                                <p className="text-xs text-muted">Last Update: Just now</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
