import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis, Legend, AreaChart, Area } from 'recharts';

export const TrendChart = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="Date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                        itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Profit" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ChannelChart = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="Channel" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                        cursor={{ fill: '#334155', opacity: 0.2 }}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="TotalPrice" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ProfitScatter = ({ data }) => {
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="TotalSales" name="Sales" unit="$" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="number" dataKey="Margin" name="Margin" unit="%" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <ZAxis type="number" dataKey="Totalprofit" range={[50, 400]} name="Profit" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Scatter name="Products" data={data} fill="#8b5cf6" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

export const RegionChart = ({ data }) => {
    // Using a Bar Chart turned sideways or similar for Regions since we don't have a map library handy
    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} hide />
                    <YAxis dataKey="Region" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                        cursor={{ fill: '#334155', opacity: 0.2 }}
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="TotalPrice" name="Revenue" fill="#2dd4bf" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
