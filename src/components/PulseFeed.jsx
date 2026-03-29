import React, { useState, useEffect } from 'react';
import { Activity, Zap, Server, AlertTriangle, Play, Shield } from 'lucide-react';
import '../styles/ManagerInterface.css'; // Reuse existing styles for now

const PulseFeed = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchPulse = async () => {
            try {
                const res = await fetch('http://localhost:42424/api/activity-pulse');
                const data = await res.json();
                setActivities(data);
            } catch (err) {
                console.error("Pulse error:", err);
            }
        };

        fetchPulse();
        const interval = setInterval(fetchPulse, 2000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'danger': return <AlertTriangle size={14} color="#ff3333" />;
            case 'action': return <Play size={14} color="#00f3ff" />;
            case 'system': return <Shield size={14} color="#ffcc33" />;
            default: return <Activity size={14} color="#888" />;
        }
    };

    return (
        <div className="pulse-feed glass-panel" style={{ padding: '1rem', marginTop: '1rem' }}>
            <div className="pulse-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Activity size={16} className="text-neon" />
                <h3 style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>System Pulse</h3>
                <div className="pulse-dot" style={{ width: '6px', height: '6px', background: '#00f3ff', borderRadius: '50%', boxShadow: '0 0 8px #00f3ff' }}></div>
            </div>

            <div className="pulse-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                {activities.length === 0 && (
                    <div style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>System quiet. Waiting for events...</div>
                )}

                {activities.map(item => (
                    <div key={item.id} className="pulse-item animate-fade" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="pulse-icon" style={{
                            width: '24px', height: '24px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {getIcon(item.type)}
                        </div>
                        <div className="pulse-content" style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: '#ddd' }}>{item.message}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{item.project}</span>
                                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PulseFeed;
