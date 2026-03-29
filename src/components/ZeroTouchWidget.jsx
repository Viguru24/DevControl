import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import '../styles/ZeroTouchWidget.css';

const ZeroTouchWidget = () => {
    const [status, setStatus] = useState({ enabled: true, sessionActive: true });
    const [isToggling, setToggling] = useState(false);

    const checkStatus = async () => {
        if (isToggling) return; // Don't let the poller overwrite a toggle in progress
        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.getAutoMode();
                setStatus({ enabled: data.globalEnabled, sessionActive: data.sessionActive });
            } else {
                const res = await fetch('http://localhost:42424/api/auto-mode');
                const data = await res.json();
                setStatus({ enabled: data.globalEnabled, sessionActive: data.sessionActive });
            }
        } catch (err) { }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 1500);
        return () => clearInterval(interval);
    }, [isToggling]); // Re-run effect when toggling state changes

    const toggleMode = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (isToggling) return;

        const newState = !status.enabled;
        console.log(`[ZeroTouch] Toggle Triggered! Attempting to set to: ${newState} (IPC: ${!!window.electronAPI})`);

        setToggling(true);
        // Optimistic UI
        setStatus(prev => ({ ...prev, enabled: newState }));

        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.toggleAutoMode(newState);
                if (data.enabled !== undefined) {
                    setStatus(prev => ({ ...prev, enabled: data.enabled }));
                }
            } else {
                const res = await fetch('http://localhost:42424/api/auto-mode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: newState })
                });
                const data = await res.json();
                if (data.enabled !== undefined) {
                    setStatus(prev => ({ ...prev, enabled: data.enabled }));
                }
            }
        } catch (err) {
            console.error("[ZeroTouch] Toggle failed!", err);
        } finally {
            // Give IPC time to settle
            setTimeout(() => setToggling(false), 500);
        }
    };

    const isStandalone = window.location.search.includes('mode=zero-touch');

    return (
        <div className={`zt-widget-container ${isStandalone ? 'standalone' : ''}`}>
            <button
                className={`zt-widget-orb ${status.enabled ? 'on' : 'off'} ${status.sessionActive ? 'active' : ''}`}
                onClick={(e) => {
                    console.log("[ZeroTouch] Orb Clicked");
                    toggleMode(e);
                }}
                onDoubleClick={async (e) => {
                    console.log("[ZeroTouch] Orb Double-Clicked! Triggering Global Sync...");
                    try {
                        if (window.electronAPI) {
                            await window.electronAPI.syncInstructions("LATEST_FROM_HISTORY");
                        } else {
                            await fetch('http://localhost:42424/api/sync-instructions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ instructions: "LATEST_FROM_HISTORY" })
                            });
                        }
                    } catch (err) { }
                }}
                title={status.enabled ? "Zero-Touch: Active" : "Zero-Touch: Off"}
            >
                <div className="zt-orb-content">
                    <Globe size={20} className={status.sessionActive ? 'pulse-zap' : ''} />
                    <span className="zt-status-text">{status.enabled ? 'READY' : 'OFF'}</span>
                </div>
                <div className="zt-orb-ring"></div>
            </button>
        </div>
    );
};

export default ZeroTouchWidget;
