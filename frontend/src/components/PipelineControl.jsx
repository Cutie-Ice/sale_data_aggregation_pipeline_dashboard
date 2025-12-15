import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const PipelineControl = () => {
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = () => {
        axios.get(`${API_BASE_URL}/api/pipeline/status`)
            .then(res => {
                setIsActive(res.data.active);
            })
            .catch(err => console.error("Error fetching status:", err));
    };

    const togglePipeline = () => {
        setLoading(true);
        const newStatus = !isActive;

        axios.post(`${API_BASE_URL}/api/pipeline/status`, { active: newStatus })
            .then(res => {
                setIsActive(res.data.active);
                setStatusMessage(`Pipeline ${newStatus ? 'Activated' : 'Paused'}`);
                setTimeout(() => setStatusMessage(''), 3000);
            })
            .catch(err => {
                console.error("Error updating status:", err);
                setStatusMessage('Failed to update status');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen bg-background text-text p-6 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[150px] transition-all duration-1000 ${isActive ? 'bg-primary/20' : 'bg-red-500/10'}`} />
            </div>

            <div className="z-10 w-full max-w-md">
                <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="bg-surface/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        <div className={`p-4 rounded-full mb-6 transition-all duration-500 ${isActive ? 'bg-green-500/20 text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)]' : 'bg-red-500/20 text-red-400'}`}>
                            {isActive ? <Activity size={48} className="animate-pulse" /> : <Pause size={48} />}
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">Data Pipeline</h1>
                        <p className="text-muted mb-8">
                            {isActive
                                ? "System is actively generating real-time transaction data."
                                : "Data generation is currently paused."}
                        </p>

                        <button
                            onClick={togglePipeline}
                            disabled={loading}
                            className={`
                                group relative w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95
                                ${isActive
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25'
                                    : 'bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25'}
                                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? (
                                    "Processing..."
                                ) : isActive ? (
                                    <>
                                        <Pause size={24} /> Stop Generation
                                    </>
                                ) : (
                                    <>
                                        <Play size={24} /> Start Generation
                                    </>
                                )}
                            </span>
                        </button>

                        {statusMessage && (
                            <div className="mt-4 text-sm font-medium animate-fade-in text-white/80">
                                {statusMessage}
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics Preview */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-surface/30 backdrop-blur border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-muted mb-1">
                            <Zap size={16} /> Status
                        </div>
                        <div className={`font-mono font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isActive ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div className="bg-surface/30 backdrop-blur border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-muted mb-1">
                            <Activity size={16} /> Mode
                        </div>
                        <div className="font-mono font-bold text-white">
                            AUTO-GEN
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PipelineControl;
