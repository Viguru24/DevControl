import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Server, Shield, Database } from 'lucide-react';

const MonitorStatus = () => {
    const [stats, setStats] = useState({
        uptime: 0,
        memory: 45,
        cpu: 12
    });

    const [logs, setLogs] = useState([
        { time: new Date().toLocaleTimeString(), msg: 'System initialized. Waiting for input...' }
    ]);

    const logEndRef = useRef(null);

    // Auto-scroll to bottom whenever logs change
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Stats simulation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                uptime: prev.uptime + 1,
                memory: 40 + Math.random() * 20,
                cpu: 10 + Math.random() * 30
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // SSE Stream effect
    useEffect(() => {
        let eventSource;
        try {
            eventSource = new EventSource('http://localhost:3001/api/activity-stream');

            eventSource.onopen = () => {
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Connected to Neural Core Stream.' }]);
            };

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLogs(prev => {
                    const newLogs = [...prev, { time: data.time, msg: data.msg }];
                    if (newLogs.length > 50) newLogs.shift(); // Keep last 50 logs
                    return newLogs;
                });
            };

            eventSource.onerror = (err) => {
                console.error("SSE Error:", err);
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: 'Connection lost. Auto-reconnecting...' }]);
            };
        } catch (e) {
            console.error("Stream connection failed:", e);
        }

        return () => {
            if (eventSource) eventSource.close();
        };
    }, []);

    const formatUptime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return `${h}h ${m}m ${sec % 60}s`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: '#050508',
            color: '#00f0ff',
            fontFamily: 'monospace',
            padding: '2rem',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ borderBottom: '1px solid #00f0ff', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Activity className="pulse-icon" />
                <h1 style={{ margin: 0, fontSize: '2rem' }}>DEVCONTROL SYSTEM STATUS</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Zap size={16} /> ENGINE STATUS</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f0' }}>ONLINE</p>
                    <p style={{ color: '#666' }}>Antigravity Protocols Active</p>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Server size={16} /> UPTIME</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatUptime(stats.uptime)}</p>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Database size={16} /> MEMORY USAGE</h3>
                    <div style={{ width: '100%', height: '10px', background: '#333', borderRadius: '5px', overflow: 'hidden', marginTop: '10px' }}>
                        <div style={{ width: `${stats.memory}%`, height: '100%', background: '#00f0ff', transition: 'width 0.5s' }}></div>
                    </div>
                    <p style={{ textAlign: 'right', marginTop: '5px' }}>{Math.round(stats.memory)}%</p>
                </div>

                <div style={{ background: 'rgba(0, 240, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <h3 style={{ marginTop: 0, color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={16} /> SYSTEM INTEGRITY</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f0' }}>100%</p>
                    <p style={{ color: '#666' }}>Secure Environment</p>
                </div>
            </div>

            {/* LIVE CONSOLE */}
            <div style={{
                background: '#000',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'Consolas, monospace',
                height: '300px',
                minHeight: '200px',
                position: 'relative',
                boxShadow: '0 0 20px rgba(0, 255, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    background: '#111', padding: '5px 10px',
                    borderBottom: '1px solid #333', color: '#888', fontSize: '0.8rem',
                    zIndex: 10
                }}>
                    AGENT_TERMINAL_OUTPUT.log
                </div>
                <div style={{
                    marginTop: '20px',
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    paddingBottom: '10px'
                }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#555', minWidth: '70px' }}>[{log.time}]</span>
                            <span style={{ color: '#0f0' }}>&gt;</span>
                            <span style={{ color: '#ccc', wordBreak: 'break-word' }}>{log.msg}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', animation: 'blink 1s infinite' }}>
                        <span style={{ color: '#555', minWidth: '70px' }}>[{new Date().toLocaleTimeString()}]</span>
                        <span style={{ color: '#0f0' }}>&gt;</span>
                        <span style={{ color: '#0f0' }}>_</span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes blink { 50% { opacity: 0; } }
                /* Custom scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #000; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>
        </div>
    );
};

export default MonitorStatus;
