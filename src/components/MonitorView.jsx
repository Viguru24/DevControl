import React, { useState, useEffect } from 'react';
import { Activity, Play, ExternalLink, AlertTriangle, RefreshCw, Zap, CheckCircle, XCircle, Code, BarChart3, Clock, Lock } from 'lucide-react';
import '../styles/MonitorView.css';

const MonitorView = ({ projects }) => {
    const [iframeStates, setIframeStates] = useState({});
    const [projectStats, setProjectStats] = useState({});

    // We no longer filter projects. We show ALL projects.
    // If a project has no monitorUrl, we show a placeholder.

    // Fix: Depend on 'projects' array content, not just length
    useEffect(() => {
        // Initialize iframe states
        const initialStates = {};
        projects.forEach(p => {
            initialStates[p.id] = { loaded: false, error: false };
        });
        setIframeStates(initialStates);

        // Simulate stats
        const stats = {};
        projects.forEach(p => {
            stats[p.id] = {
                uptime: Math.floor(Math.random() * 24) + 'h ' + Math.floor(Math.random() * 60) + 'm',
                requests: Math.floor(Math.random() * 10000),
                status: Math.random() > 0.2 ? 'healthy' : 'warning'
            };
        });
        setProjectStats(stats);
    }, [projects]);

    const handleIframeLoad = (projectId) => {
        setIframeStates(prev => ({
            ...prev,
            [projectId]: { loaded: true, error: false }
        }));
    };

    const handleIframeError = (projectId) => {
        setIframeStates(prev => ({
            ...prev,
            [projectId]: { loaded: false, error: true }
        }));
    };

    const handleRefresh = (projectId) => {
        setIframeStates(prev => ({
            ...prev,
            [projectId]: { loaded: false, error: false }
        }));
        const iframe = document.getElementById(`iframe-${projectId}`);
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    const handleLaunch = async (project) => {
        if (!project.path) {
            alert('No project path configured');
            return;
        }
        try {
            await fetch('http://localhost:42424/api/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: project.path })
            });
        } catch (err) {
            console.error('Launch failed:', err);
        }
    };

    return (
        <div className="monitor-container">
            <div className="monitor-header">
                <div className="header-content">
                    <h2><Activity size={24} color="var(--neon-cyan)" /> Command Center</h2>
                    <p>Real-time monitoring of active project protocols</p>
                </div>
                <div className="monitor-stats">
                    <div className="stat-badge">
                        <CheckCircle size={16} />
                        <span>{projects.length} Active Modules</span>
                    </div>
                </div>
            </div>

            <div className="monitor-grid">
                {projects.map(project => {
                    const state = iframeStates[project.id] || { loaded: false, error: false };
                    const stats = projectStats[project.id] || {};

                    // Recursive Check
                    let isBlocked = false;
                    let safeUrl = project.monitorUrl;

                    if (project.monitorUrl) {
                        try {
                            // If URL includes current host BUT is NOT the safe status page
                            if (project.monitorUrl.includes(window.location.host) && !project.monitorUrl.includes('monitor-status')) {
                                isBlocked = true;
                            }
                        } catch (e) { }
                    }

                    return (
                        <div key={project.id} className={`monitor-cell glass-panel ${stats.status || ''}`}>
                            <div className="cell-header">
                                <div className="header-left">
                                    <span className={`live-dot ${state.loaded ? 'active' : state.error ? 'error' : 'loading'}`}></span>
                                    <h3>{project.title}</h3>
                                    <span className="version-tag">v{project.version || '1.0.0'}</span>
                                </div>
                                <div className="header-actions">
                                    <button className="icon-btn" onClick={() => handleRefresh(project.id)} title="Refresh">
                                        <RefreshCw size={14} />
                                    </button>
                                    {safeUrl && (
                                        <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="icon-btn" title="Open in new tab">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="project-metrics">
                                <div className="metric">
                                    <Clock size={14} />
                                    <span className="metric-label">Uptime</span>
                                    <span className="metric-value">{stats.uptime || 'N/A'}</span>
                                </div>
                                <div className="metric">
                                    <BarChart3 size={14} />
                                    <span className="metric-label">Requests</span>
                                    <span className="metric-value">{stats.requests?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="metric">
                                    <Zap size={14} />
                                    <span className="metric-label">Status</span>
                                    <span className={`metric-value status-${stats.status}`}>
                                        {stats.status === 'healthy' ? 'Healthy' : 'Warning'}
                                    </span>
                                </div>
                            </div>

                            <div className="iframe-container">
                                {isBlocked ? (
                                    <div className="iframe-overlay error" style={{ flexDirection: 'column', gap: '1rem', background: '#1a0000' }}>
                                        <Lock size={48} color="#f00" />
                                        <h3 style={{ color: '#f00' }}>RECURSION BLOCKED</h3>
                                        <p>The dashboard cannot monitor itself directly.</p>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>Target: {project.monitorUrl}</p>
                                    </div>
                                ) : project.monitorUrl ? (
                                    <>
                                        <iframe
                                            id={`iframe-${project.id}`}
                                            src={project.monitorUrl}
                                            title={project.title}
                                            style={{ width: '100%', height: '100%', border: 'none' }}
                                            onLoad={() => handleIframeLoad(project.id)}
                                            onError={() => handleIframeError(project.id)}
                                        />
                                        {!state.loaded && !state.error && (
                                            <div className="iframe-overlay">
                                                <p>Establishing connection...</p>
                                                <div className="loader"></div>
                                            </div>
                                        )}
                                        {state.error && (
                                            <div className="iframe-overlay error">
                                                <XCircle size={48} />
                                                <p>Connection Failed</p>
                                                <button className="retry-btn" onClick={() => handleRefresh(project.id)}>
                                                    <RefreshCw size={16} /> Retry
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="iframe-overlay" style={{ flexDirection: 'column', color: '#666' }}>
                                        <AlertTriangle size={48} style={{ opacity: 0.5 }} />
                                        <p>No Monitor URL Configured</p>
                                    </div>
                                )}
                            </div>

                            <div className="cell-footer">
                                <code className="url-badge">{project.monitorUrl || 'Not Configured'}</code>
                                {project.path && (
                                    <button className="action-btn-sm" onClick={() => handleLaunch(project)}>
                                        <Code size={14} /> Launch
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {projects.length === 0 && (
                    <div className="monitor-cell empty full-width">
                        <div className="empty-content">
                            <h3>No Projects Found</h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonitorView;
