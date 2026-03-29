import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, ShieldAlert, MousePointer2, Move, X } from 'lucide-react';
import '../styles/ZeroTouchController.css';

const ZeroTouchController = ({ isWidget }) => {
    const [status, setStatus] = useState({ enabled: true, sessionActive: true });
    const [isHovered, setIsHovered] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const checkStatus = async () => {
        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.getAutoMode();
                setStatus({ enabled: data.globalEnabled, sessionActive: data.sessionActive });
            } else {
                // Fallback for web-based development
                const res = await fetch('http://localhost:42424/api/auto-mode');
                const data = await res.json();
                setStatus({ enabled: data.globalEnabled, sessionActive: data.sessionActive });
            }
        } catch (err) {
            console.error("Failed to check zero-touch status:", err);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const toggleMode = async () => {
        const newState = !status.enabled;
        // Optimistic update
        setStatus(prev => ({ ...prev, enabled: newState, sessionActive: newState }));

        try {
            if (window.electronAPI) {
                await window.electronAPI.toggleAutoMode(newState);
            } else {
                const res = await fetch('http://localhost:42424/api/auto-mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: newState })
                });
                if (!res.ok) {
                    // Revert on failure
                    setStatus(prev => ({ ...prev, enabled: !newState, sessionActive: !newState }));
                }
            }
        } catch (err) {
            console.error("Toggle error:", err);
            // Revert on error
            setStatus(prev => ({ ...prev, enabled: !newState, sessionActive: !newState }));
        }
    };

    if (isMinimized) {
        return (
            <div className={`zt-mini-fab ${status.sessionActive ? 'active' : ''} ${isWidget ? 'widget-mode' : ''}`} onClick={() => setIsMinimized(false)}>
                <Bot size={20} />
            </div>
        );
    }

    return (
        <div
            className={`zt-controller-floating ${status.enabled ? 'enabled' : 'disabled'} ${status.sessionActive ? 'session-active' : ''} ${isWidget ? 'widget-mode' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="zt-glass-header">
                <div className="zt-drag-area">
                    <Move size={12} className="zt-move-icon" />
                    <span>ZERO-TOUCH</span>
                </div>
                <button className="zt-min-btn" onClick={() => setIsMinimized(true)}>
                    <X size={14} />
                </button>
            </div>

            <div className="zt-main-control">
                <button
                    className={`zt-toggle-orb ${status.enabled ? 'on' : 'off'}`}
                    onClick={toggleMode}
                >
                    <div className="zt-orb-inner">
                        <Globe size={24} className={status.sessionActive ? 'pulse-zap' : ''} />
                    </div>
                    <div className="zt-glow-ring"></div>
                </button>

                <div className="zt-status-info">
                    <div className="zt-status-badge">
                        {status.sessionActive ? (
                            <><ShieldCheck size={14} /> <span>ACTIVE</span></>
                        ) : status.enabled ? (
                            <><Globe size={14} /> <span>STANDBY</span></>
                        ) : (
                            <><ShieldAlert size={14} /> <span>OFF</span></>
                        )}
                    </div>
                    <p className="zt-hint-text">
                        {status.sessionActive ? "Automation Engaged" : "Ready for Mission"}
                    </p>
                </div>
            </div>

            {status.sessionActive && (
                <div className="zt-activity-indicator">
                    <div className="zt-bar"></div>
                    <div className="zt-bar"></div>
                    <div className="zt-bar"></div>
                </div>
            )}
        </div>
    );
};

export default ZeroTouchController;
