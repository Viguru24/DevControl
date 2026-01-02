import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import '../styles/ZeroTouchWidget.css';

const ZeroTouchWidget = () => {
    const [status, setStatus] = useState({ enabled: false, sessionActive: false });

    const checkStatus = async () => {
        try {
            const res = await fetch('http://localhost:42424/api/auto-mode');
            const data = await res.json();
            setStatus({ enabled: data.globalEnabled, sessionActive: data.sessionActive });
        } catch (err) { }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 1500);
        return () => clearInterval(interval);
    }, []);

    const toggleMode = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const newState = !status.enabled;
        console.log(`[ZeroTouch] Toggle Triggered! Attempting to set to: ${newState}`);

        // Optimistic UI update
        setStatus(prev => ({ ...prev, enabled: newState }));

        try {
            console.log(`[ZeroTouch] Fetching: http://localhost:42424/api/auto-mode with body:`, { enabled: newState });
            const res = await fetch('http://localhost:42424/api/auto-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newState })
            });
            const data = await res.json();
            console.log(`[ZeroTouch] Server Response Success:`, data);

            if (data.enabled !== undefined) {
                setStatus(prev => ({ ...prev, enabled: data.enabled }));
            }
        } catch (err) {
            console.error("[ZeroTouch] Toggle Fetch FAILED! Check if server is running on 42424.", err);
        }
    };

    return (
        <div className="zt-widget-container">
            {/* The drag handle area (around the orb) */}
            <div className="zt-widget-drag-surface"></div>

            <button
                className={`zt-widget-orb ${status.enabled ? 'on' : 'off'} ${status.sessionActive ? 'active' : ''}`}
                onMouseDown={(e) => {
                    console.log("[ZeroTouch] Orb MouseDown");
                    toggleMode(e);
                }}
                onDoubleClick={async (e) => {
                    console.log("[ZeroTouch] Orb Double-Clicked! Triggering Global Sync...");
                    try {
                        // We fetch the latest history from the server and sync it
                        // This assumes the server can find the 'latest' instruction
                        await fetch('http://localhost:42424/api/sync-instructions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ instructions: "LATEST_FROM_HISTORY" }) // Server will handle this keyword
                        });
                    } catch (err) { }
                }}
                onClick={(e) => {
                    console.log("[ZeroTouch] Orb Clicked");
                }}
                title={status.enabled ? "Zero-Touch: Active" : "Zero-Touch: Off"}
            >
                <div className="zt-orb-content">
                    <Zap size={20} className={status.sessionActive ? 'pulse-zap' : ''} />
                    <span className="zt-status-text">{status.enabled ? 'READY' : 'OFF'}</span>
                </div>
                <div className="zt-orb-ring"></div>
            </button>
        </div>
    );
};

export default ZeroTouchWidget;
