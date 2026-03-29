import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, ExternalLink, TrendingUp, Database, Plus } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import PulseFeed from './PulseFeed';
import '../styles/Dashboard.css';

const DashboardView = ({ projects = [], onProjectClick }) => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        healthyProjects: 0,
        warningProjects: 0,
        totalUptime: '0h 0m'
    });
    const [backupStatus, setBackupStatus] = useState(null);
    const [masterBackups, setMasterBackups] = useState([]);
    const [restoreStatus, setRestoreStatus] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (!projects) return;

        // Calculate stats
        const healthy = projects.filter(p => p.status === 'Healthy').length;
        const warning = projects.filter(p => p.status === 'Warning' || p.status === 'Error').length;

        setStats({
            totalProjects: projects.length,
            healthyProjects: healthy,
            warningProjects: warning,
            totalUptime: calculateTotalUptime(projects)
        });

        // Fetch master backups
        fetchMasterBackups();
    }, [projects]);

    const fetchMasterBackups = async () => {
        try {
            const res = await fetch('http://localhost:42424/api/master-backups');
            const data = await res.json();
            setMasterBackups(data);
        } catch (err) {
            console.error('Failed to fetch master backups:', err);
        }
    };

    const handleMasterBackup = async () => {
        setBackupStatus('creating');
        try {
            const res = await fetch('http://localhost:42424/api/master-backup', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setBackupStatus('success');
                fetchMasterBackups(); // Refresh list
                setTimeout(() => setBackupStatus(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Backup failed:', err);
            setBackupStatus('error');
        }
    };

    const handleLaunchConsole = async (projectId) => {
        try {
            await fetch('http://localhost:42424/api/launch-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId })
            });
        } catch (err) {
            console.error('Failed to launch console:', err);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const res = await fetch('http://localhost:42424/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload(); // Refresh to show new project
            }
        } catch (err) {
            console.error('Failed to create project:', err);
            alert('Failed to create project. Check server logs.');
        }
    };


    const handleRestoreMasterBackup = async (backupName) => {
        if (!window.confirm(`Are you sure you want to restore "${backupName}"? This will overwrite your current settings and chat history.`)) return;

        setRestoreStatus({ name: backupName, state: 'restoring' });
        try {
            const res = await fetch('http://localhost:42424/api/restore-master-backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupName })
            });
            const data = await res.json();
            if (data.success) {
                setRestoreStatus({ name: backupName, state: 'success' });
                setTimeout(() => {
                    setRestoreStatus(null);
                    window.location.reload(); // Reload to apply restored data
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Restore failed:', err);
            setRestoreStatus({ name: backupName, state: 'error' });
            setTimeout(() => setRestoreStatus(null), 3000);
        }
    };

    const calculateTotalUptime = (projects) => {
        const totalHours = projects.reduce((acc, p) => {
            const uptime = p.uptime || "0h";
            return acc + parseInt(uptime);
        }, 0);
        return `${totalHours}h 0m`;
    };

    const getHealthColor = (status) => {
        switch (status) {
            case 'Healthy': return 'var(--neon-cyan)';
            case 'Warning': return '#ffdf8e';
            case 'Error': return '#ff4b4b';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="dashboard-grid animate-fade">
            <AddProjectModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleCreateProject}
            />

            {/* Header with Master Actions */}
            <div className="dashboard-header-actions">
                <div className="header-text">
                    <h1>Command Dashboard</h1>
                    <p>Real-time system oversight and strategic management</p>
                </div>
                <div className="header-buttons">
                    <button className="new-project-btn" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} />
                        <span>Start Project</span>
                    </button>
                    <button
                        className={`master-backup-btn ${backupStatus}`}
                        onClick={handleMasterBackup}
                        disabled={backupStatus === 'creating'}
                    >
                        <Database size={18} />
                        <span>
                            {backupStatus === 'creating' ? 'Creating Backup...' :
                                backupStatus === 'success' ? 'Backup Complete!' :
                                    backupStatus === 'error' ? 'Backup Failed' : 'Master Data Backup'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Activity size={24} color="var(--neon-cyan)" /></div>
                    <div className="stat-content">
                        <span className="stat-label">Active Projects</span>
                        <span className="stat-value">{stats.totalProjects}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><CheckCircle size={24} color="#00ff88" /></div>
                    <div className="stat-content">
                        <span className="stat-label">Healthy</span>
                        <span className="stat-value">{stats.healthyProjects}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><AlertCircle size={24} color="#ffdf8e" /></div>
                    <div className="stat-content">
                        <span className="stat-label">Alerts</span>
                        <span className="stat-value">{stats.warningProjects}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Clock size={24} color="var(--neon-cyan)" /></div>
                    <div className="stat-content">
                        <span className="stat-label">Total Uptime</span>
                        <span className="stat-value">{stats.totalUptime}</span>
                    </div>
                </div>
            </div>

            <PulseFeed />

            <div className="dashboard-main">
                <div className="project-status-list">
                    <div className="list-header">
                        <h2>Infrastructure Overview</h2>
                        <div className="list-filters">
                            <span className="filter-chip active">All Projects</span>
                            <span className="filter-chip">Critical</span>
                        </div>
                    </div>

                    <div className="project-grid-dashboard">
                        {projects.map(project => (
                            <div key={project.id} className="project-dashboard-card" onClick={() => onProjectClick(project.id)}>
                                <div className="card-top">
                                    <div className="health-ring" style={{ borderLeftColor: getHealthColor(project.status) }}></div>
                                    <div className="project-info">
                                        <h3>{project.title}</h3>
                                        <div className="project-header-meta">
                                            <span className="project-version">v{project.version || '1.0.0'}</span>
                                            <span className="project-port">:{project.port || '3000'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-stats">
                                    <div className="mini-stat">
                                        <TrendingUp size={12} />
                                        <span>{project.uptime || '99.9%'}</span>
                                    </div>
                                    <div className="mini-stat">
                                        <Activity size={12} />
                                        <span>{project.requests || '0'} req/h</span>
                                    </div>
                                </div>
                                <p className="project-desc-mini">{project.description}</p>

                                <div className="card-footer">
                                    <div className="project-tags-mini">
                                        {project.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="tag-pill">{tag}</span>
                                        ))}
                                    </div>
                                    <button className="launch-btn-main" onClick={(e) => {
                                        e.stopPropagation();
                                        handleLaunchConsole(project.id);
                                    }}>
                                        <ExternalLink size={14} />
                                        <span>Launch Console</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="system-backups-section">
                    <div className="list-header">
                        <h2>System Data Backups</h2>
                        <span className="docs-count">{masterBackups.length} archived snapshots</span>
                    </div>
                    <div className="backups-list-container">
                        {masterBackups.length === 0 ? (
                            <div className="empty-backups">No master backups found. Use the button above to create one.</div>
                        ) : (
                            <div className="backups-table">
                                <div className="table-header">
                                    <span>Backup Name</span>
                                    <span>Created At</span>
                                    <span>Files</span>
                                    <span>Actions</span>
                                </div>
                                {masterBackups.map(backup => (
                                    <div key={backup.name} className="backup-row">
                                        <div className="backup-name-cell">
                                            <Database size={14} className="backup-icon" />
                                            <span>{backup.name}</span>
                                        </div>
                                        <div className="backup-date-cell">
                                            {new Date(backup.created).toLocaleString()}
                                        </div>
                                        <div className="backup-files-cell">
                                            {backup.manifest?.files?.length || 0} files
                                        </div>
                                        <div className="backup-actions-cell">
                                            <button
                                                className={`restore-action-btn ${restoreStatus?.name === backup.name ? restoreStatus.state : ''}`}
                                                onClick={() => handleRestoreMasterBackup(backup.name)}
                                                disabled={!!restoreStatus}
                                            >
                                                {restoreStatus?.name === backup.name ? (
                                                    restoreStatus.state === 'restoring' ? 'Restoring...' :
                                                        restoreStatus.state === 'success' ? 'Restored!' : 'Error'
                                                ) : 'Restore'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
