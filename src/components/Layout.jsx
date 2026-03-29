import React, { useState, useEffect } from 'react';
import { Layers, Rocket, LayoutGrid, Sparkles, Zap, Pause, Terminal, Book, Shield, Settings } from 'lucide-react';
import ZeroTouchController from './ZeroTouchController';
import ZeroTouchWidget from './ZeroTouchWidget';
import ZeroTouchHUD from './ZeroTouchHUD';
import ThemeSwitcher from './ThemeSwitcher';
import '../styles/Layout.css';
import CommandPalette from './CommandPalette';

const Layout = ({ children, currentView, setCurrentView, projects = [], selectedProjectId, setSelectedProjectId }) => {
    const [time, setTime] = useState(new Date());
    const [autoModeStatus, setAutoModeStatus] = useState({ enabled: false, globalEnabled: false, sessionActive: false });
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);

        const checkAutoMode = () => {
            fetch('http://localhost:42424/api/auto-mode')
                .then(res => res.json())
                .then(data => setAutoModeStatus(data))
                .catch(err => console.error("Auto-mode error:", err));
        };

        checkAutoMode();
        const autoTimer = setInterval(checkAutoMode, 2000);

        const handleGlobalParams = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleGlobalParams);

        return () => {
            clearInterval(timer);
            clearInterval(autoTimer);
            window.removeEventListener('keydown', handleGlobalParams);
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

    const handlePaletteNavigate = (view, projectId) => {
        if (projectId) {
            setSelectedProjectId(projectId);
            setCurrentView('manager');
        } else {
            setCurrentView(view);
        }
    };

    return (
        <div className="layout-container">
            <CommandPalette
                isOpen={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                projects={projects}
                onNavigate={handlePaletteNavigate}
                onToggleAuto={toggleAutoMode}
                autoStatus={autoModeStatus}
            />
            <aside className="sidebar">

                <div className="sidebar-nav">
                    <nav className="nav-section">
                        <div className="section-label">Main Console</div>
                        <button className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                            <LayoutGrid size={18} /> <span>Dashboard</span>
                        </button>
                    </nav>

                    <nav className="nav-section">
                        <div className="nav-group-label" style={{ marginTop: '1rem' }}>Projects</div>
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

                    <nav className="nav-section" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button className={`nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
                            <Settings size={18} /> <span>Security Settings</span>
                        </button>
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
            <ZeroTouchController />
            <ZeroTouchHUD />
            <ZeroTouchWidget />
        </div>
    );
};

export default Layout;
