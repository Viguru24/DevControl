import React, { useState, useEffect } from 'react';
import { Layers, Rocket, LayoutGrid, Sparkles, Zap, Pause } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import '../styles/Layout.css';

const Layout = ({ children, currentView, setCurrentView, projects = [], selectedProjectId, setSelectedProjectId }) => {
    const [time, setTime] = useState(new Date());
    const [autoModeStatus, setAutoModeStatus] = useState({ enabled: false, globalEnabled: false, sessionActive: false });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const checkAutoMode = () => {
            fetch('http://localhost:42424/api/auto-mode')
                .then(res => res.json())
                .then(data => setAutoModeStatus(data))
                .catch(err => console.error("Auto-mode error:", err));
        };

        checkAutoMode();
        const autoTimer = setInterval(checkAutoMode, 2000); // Check every 2 seconds

        return () => {
            clearInterval(timer);
            clearInterval(autoTimer);
        };
    }, []);

    const toggleAutoMode = async () => {
        const newState = !autoModeStatus.globalEnabled;
        try {
            const res = await fetch('http://localhost:42424/api/auto-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: newState })
            });
            const data = await res.json();
            setAutoModeStatus(prev => ({ ...prev, globalEnabled: data.enabled }));
        } catch (err) {
            console.error("Toggle error:", err);
        }
    };

    const formatTime = (date) => date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <Rocket className="logo-icon" size={24} />
                        <span className="logo-text">DevControl</span>
                    </div>
                </div>


                <div className="sidebar-nav">
                    <nav className="nav-section">
                        <div className="section-label">Main Console</div>
                        <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                            <LayoutGrid size={18} /> <span>Dashboard</span>
                        </button>
                    </nav>

                    <nav className="nav-section">
                        <div className="section-label">Intelligence</div>
                        <button className={`nav-item ${currentView === 'manager' ? 'active' : ''}`} onClick={() => setCurrentView('manager')}>
                            <Sparkles size={18} /> <span>Strategy Manager</span>
                        </button>
                        <button className={`nav-item ${currentView === 'protocols' ? 'active' : ''}`} onClick={() => setCurrentView('protocols')}>
                            <Layers size={18} /> <span>Knowledge Base</span>
                        </button>
                        <div className="nav-group">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    className={`nav-item ${selectedProjectId === p.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedProjectId(p.id);
                                        setCurrentView('manager'); // Switch to Strategy Manager when clicking a project
                                    }}
                                >
                                    <div className={`pulse-indicator pulse-sm`} style={{ background: selectedProjectId === p.id ? 'var(--neon-cyan)' : 'var(--text-muted)' }}></div>
                                    <span>{p.title}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>


                <div className="sidebar-footer">
                    <div className="sidebar-footer-row">
                        <span className="sidebar-time">{formatTime(time)}</span>
                        <button
                            className={`auto-mode-btn ${autoModeStatus.globalEnabled ? 'active' : ''} ${autoModeStatus.sessionActive ? 'session-active' : ''}`}
                            onClick={toggleAutoMode}
                            title={autoModeStatus.globalEnabled ? "Deactivate Autopilot" : "Activate Autopilot"}
                        >
                            {autoModeStatus.sessionActive ? <Sparkles size={14} className="rotate-anim" /> :
                                autoModeStatus.globalEnabled ? <Zap size={14} /> : <Pause size={14} />}
                            <span>
                                {autoModeStatus.globalEnabled
                                    ? (autoModeStatus.sessionActive ? 'AUTO: ACTIVE' : 'AUTO: STANDBY')
                                    : 'AUTO: OFF'}
                            </span>
                        </button>
                    </div>
                    <ThemeSwitcher />
                </div>

            </aside>

            <div className="main-wrapper">
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
