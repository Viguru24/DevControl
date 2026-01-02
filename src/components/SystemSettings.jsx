import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, HardDrive, History, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

const SystemSettings = () => {
    const [backups, setBackups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const fetchBackups = async () => {
        try {
            const res = await fetch('http://localhost:42424/api/backups');
            const data = await res.json();
            setBackups(data);
        } catch (err) {
            console.error("Failed to fetch backups:", err);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleBackupNow = async () => {
        setIsLoading(true);
        setStatus({ type: 'info', message: 'Creating snapshot...' });
        try {
            const res = await fetch('http://localhost:42424/api/backup-now', { method: 'POST' });
            if (res.ok) {
                setStatus({ type: 'success', message: 'Strategic Backup Successful' });
                fetchBackups();
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Backup failed' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatus(null), 3000);
        }
    };

    const handleRestore = async (backupName) => {
        if (!confirm(`Restore system to ${backupName}? Current unsaved protocol changes will be overwritten.`)) return;

        setIsLoading(true);
        setStatus({ type: 'info', message: 'Restoring state...' });
        try {
            const res = await fetch('http://localhost:42424/api/restore-backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupName })
            });
            if (res.ok) {
                setStatus({ type: 'success', message: 'System Restored. Refreshing...' });
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Restore failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <div className="header-info">
                    <h1>System Data Management</h1>
                    <p>Strategic backups, protocol snapshots, and system recovery.</p>
                </div>
                <button
                    className={`backup-btn ${isLoading ? 'loading' : ''}`}
                    onClick={handleBackupNow}
                    disabled={isLoading}
                >
                    <Save size={18} />
                    <span>Create Snapshot Now</span>
                </button>
            </header>

            {status && (
                <div className={`status-banner ${status.type}`}>
                    {status.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
                    <span>{status.message}</span>
                </div>
            )}

            <section className="backup-list-section">
                <div className="section-title">
                    <History size={20} />
                    <h2>Available Backups (Last 10)</h2>
                </div>

                <div className="backup-grid">
                    {backups.length === 0 ? (
                        <div className="empty-state">No backups found. Create one to secure your protocol.</div>
                    ) : (
                        backups.map(backup => (
                            <div key={backup.name} className="backup-card">
                                <div className="backup-info">
                                    <span className="backup-name">{backup.name}</span>
                                    <span className="backup-date">
                                        {new Date(backup.createdAt).toLocaleString()}
                                    </span>
                                    <span className="backup-meta">{backup.size}</span>
                                </div>
                                <button
                                    className="restore-btn"
                                    onClick={() => handleRestore(backup.name)}
                                    title="Restore this version"
                                >
                                    <RefreshCcw size={16} />
                                    <span>Restore</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
                .settings-container {
                    padding: 20px;
                    color: white;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(0, 240, 255, 0.2);
                }
                .header-info h1 { margin: 0; font-size: 24px; color: #00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.3); }
                .header-info p { margin: 5px 0 0; color: #888; font-size: 14px; }
                
                .backup-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #00f0ff, #0072ff);
                    border: none;
                    color: black;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .backup-btn:hover { transform: translateY(-2px); box-shadow: 0 0 15px rgba(0, 240, 255, 0.4); }
                
                .status-banner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }
                .status-banner.success { background: rgba(0, 255, 128, 0.15); color: #00ff80; border: 1px solid rgba(0, 255, 128, 0.3); }
                .status-banner.error { background: rgba(255, 60, 60, 0.15); color: #ff3c3c; border: 1px solid rgba(255, 60, 60, 0.3); }
                .status-banner.info { background: rgba(0, 114, 255, 0.15); color: #0072ff; border: 1px solid rgba(0, 114, 255, 0.3); }

                .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #888; }
                .section-title h2 { font-size: 18px; margin: 0; font-weight: 500; }

                .backup-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                .backup-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 15px 20px;
                    border-radius: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background 0.2s;
                }
                .backup-card:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(0, 240, 255, 0.3); }
                
                .backup-info { display: flex; flex-direction: column; gap: 4px; }
                .backup-name { font-weight: 600; color: #e0e0e0; font-family: monospace; }
                .backup-date { font-size: 12px; color: #666; }
                .backup-meta { font-size: 12px; color: #00f0ff; opacity: 0.7; }

                .restore-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: 1px solid #444;
                    color: #aaa;
                    padding: 6px 14px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                }
                .restore-btn:hover { background: #333; color: white; border-color: #00f0ff; }
                
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: #555;
                    border: 2px dashed rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};

export default SystemSettings;
