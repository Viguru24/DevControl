import React, { useState, useEffect } from 'react';
import { Layers, Rocket, Play, Pause, Zap, LayoutGrid, Activity, Brain, Sparkles, Clock, Calendar } from 'lucide-react';
// Deploy Buster: 1767276800 - Definitive fix for BookOpen reference error.
import '../styles/Layout.css';

const Layout = ({ children, onNewProjectClick, currentView, setCurrentView, projects = [], selectedProjectId, setSelectedProjectId }) => {
    const [autoMode, setAutoMode] = useState(false);
    const [time, setTime] = useState(new Date());

    // Tick the clock every second
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load auto-mode state from server on mount
    useEffect(() => {
        fetch('http://localhost:3001/api/auto-mode')
            .then(res => res.json())
            .then(data => {
                const isEnabled = data.enabled || false;
                setAutoMode(isEnabled);
                localStorage.setItem('devcontrol-auto-mode', isEnabled);
            })
            .catch(err => {
                console.error('Failed to load auto-mode state:', err);
                const saved = localStorage.getItem('devcontrol-auto-mode');
                setAutoMode(saved === 'true');
            });
    }, []);

    // Sync to server and localStorage when changed
    useEffect(() => {
        if (autoMode !== undefined) {
            localStorage.setItem('devcontrol-auto-mode', autoMode);
            fetch('http://localhost:3001/api/auto-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: autoMode })
            }).catch(err => console.error('Failed to sync auto-mode:', err));
        }
    }, [autoMode]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setAutoMode(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const toggleAutoMode = () => {
        setAutoMode(prev => !prev);
    };

    // --- Autopilot Loop (The Signal Bridge) ---
    useEffect(() => {
        let interval;
        if (autoMode) {
            console.log("[Autopilot] Monitoring for continuation signals...");
            interval = setInterval(() => {
                // If autoMode is ON, we pulse the server to trigger a "Continue" (Ctrl+Enter) 
                // in the Antigravity window. This bypasses manual approval prompts.
                fetch('http://localhost:3001/api/trigger-continue', { method: 'POST' })
                    .catch(err => console.warn("[Autopilot] Heartbeat failed:", err));
            }, 5000); // Pulse every 5 seconds
        }
        return () => clearInterval(interval);
    }, [autoMode]);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="logo">
                        <Rocket className="logo-icon" size={28} />
                        <span className="logo-text">DevControl</span>
                    </div>

                    <nav className="sidebar-nav">
                        <button
                            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setCurrentView('dashboard')}
                        >
                            <LayoutGrid size={20} />
                            <span>Dashboard</span>
                        </button>
                        <button
                            className={`nav-item ${currentView === 'monitor' ? 'active' : ''}`}
                            onClick={() => setCurrentView('monitor')}
                        >
                            <Activity size={20} />
                            <span>Command Center</span>
                        </button>
                        <button
                            className={`nav-item ${currentView === 'ai' ? 'active' : ''}`}
                            onClick={() => setCurrentView('ai')}
                        >
                            <Brain size={20} />
                            <span>AI Assistant</span>
                        </button>
                        <button
                            className={`nav-item ${currentView === 'manager' ? 'active' : ''}`}
                            onClick={() => setCurrentView('manager')}
                            style={{ color: currentView === 'manager' ? '#a48eff' : '' }}
                        >
                            <Sparkles size={20} />
                            <span>Manager</span>
                        </button>
                        <button
                            className={`nav-item ${currentView === 'protocols' ? 'active' : ''}`}
                            onClick={() => setCurrentView('protocols')}
                            style={{ color: currentView === 'protocols' ? '#ffdf8e' : '' }}
                        >
                            <Layers size={20} />
                            <span>Knowledge</span>
                        </button>
                    </nav>

                    <div className="sidebar-section">
                        <div className="section-header">
                            <span>ACTIVE CONTEXT</span>
                        </div>
                        <div className="project-list">
                            {projects.map(project => (
                                <button
                                    key={project.id}
                                    className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`}
                                    onClick={() => setSelectedProjectId(project.id)}
                                >
                                    <div className="project-dot" />
                                    <span>{project.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="sidebar-bottom">
                    {/* Auto-Continue Toggle */}
                    <div className="auto-mode-section">
                        <button
                            className={`auto-mode-toggle ${autoMode ? 'active' : ''}`}
                            onClick={toggleAutoMode}
                            title={`Auto-Continue: ${autoMode ? 'ON' : 'OFF'} (Ctrl+Shift+P)`}
                        >
                            {autoMode ? <Zap size={16} className="pulse-icon" /> : <Pause size={16} />}
                            <span>{autoMode ? 'AUTO: ON' : 'AUTO: OFF'}</span>
                        </button>
                    </div>

                    {/* Live Clock & Date */}
                    <div className="status-clock">
                        <div className="clock-row">
                            <Clock size={16} color="#00f0ff" />
                            <span className="time-text">{formatTime(time)}</span>
                        </div>
                        <div className="clock-row date">
                            <Calendar size={14} color="#888" />
                            <span className="date-text">{formatDate(time)}</span>
                        </div>
                    </div>

                    <button className="new-project-btn" onClick={onNewProjectClick}>
                        <Layers size={18} />
                        <span>New Project</span>
                    </button>
                </div>
            </aside>

            <div className="content-wrapper">
                <main className="main-content">
                    {children}
                </main>

                <footer className="compact-footer">
                    <p>© 2026 DevControl Core. System stable. {autoMode && <span className="auto-active">| Auto-Mode Live</span>}</p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
