import React, { useState, useEffect } from 'react';
import { Activity, Zap, Play, Pause, AlertTriangle } from 'lucide-react';
import '../styles/ZeroTouchHUD.css';

const ZeroTouchHUD = () => {
    const [status, setStatus] = useState({ globalEnabled: true, sessionActive: true });
    const [lastAction, setLastAction] = useState('Standby');
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        // Poll for Zero-Touch status
        const interval = setInterval(() => {
            if (window.electronAPI) {
                window.electronAPI.getAutoMode().then(s => {
                    setStatus(s);
                    if (s.sessionActive) {
                        setPulse(prev => !prev);
                        // In a real implementation, we'd get the actual last action from the server
                        setLastAction(prev => prev === 'Pulsing...' ? 'Scanning...' : 'Pulsing...');
                    } else {
                        setLastAction('Standby');
                    }
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!status.globalEnabled) return null;

    return (
        <div className={`zero-touch-hud ${status.sessionActive ? 'active' : 'idle'}`}>
            <div className="hud-header">
                <Activity size={14} className={status.sessionActive ? "pulse-anim" : ""} />
                <span className="hud-title">ZERO-TOUCH // AUDIT</span>
            </div>

            <div className="hud-content">
                <div className="hud-stat-row">
                    <span className="stat-label">STATUS</span>
                    <span className={`stat-value ${status.sessionActive ? 'cyan' : 'orange'}`}>
                        {status.sessionActive ? 'ENGAGED' : 'PAUSED'}
                    </span>
                </div>
                <div className="hud-stat-row">
                    <span className="stat-label">ACTION</span>
                    <span className="stat-value monitor-text">{lastAction}</span>
                </div>
            </div>

            <div className={`hud-footer ${pulse ? 'glow' : ''}`}>
                <div className="safety-indicator">
                    <div className={`safety-dot ${status.sessionActive ? 'green' : 'red'}`}></div>
                    <span>SAFETY LOCK</span>
                </div>
            </div>
        </div>
    );
};

export default ZeroTouchHUD;
