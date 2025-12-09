import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const KPICard = ({ title, value, trend, trendValue, color = "primary" }) => {
    const colorMap = {
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-secondary/10 text-secondary border-secondary/20",
        accent: "bg-accent/10 text-accent border-accent/20",
    };

    return (
        <div className="bg-surface p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-muted text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                </div>
                <div className={cn("p-2 rounded-lg", colorMap[color])}>
                    {trend === 'up' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
            </div>
            {trendValue && (
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                        trend === 'up' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                        {trendValue}
                    </span>
                    <span className="text-muted text-xs">vs last month</span>
                </div>
            )}
        </div>
    );
};

export default KPICard;
