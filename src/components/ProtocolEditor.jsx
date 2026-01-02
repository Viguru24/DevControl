import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Code, AlertCircle, Check, History, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import '../styles/ProtocolEditor.css';

const ProtocolEditor = ({ activeProjectId, projects }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'
    const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview', 'history', 'automation', 'zerotouch'
    const [backups, setBackups] = useState([]);
    const [automationCode, setAutomationCode] = useState('');
    const [protocolDoc, setProtocolDoc] = useState('');
    const [statusMsg, setStatusMsg] = useState(null);

    const activeProject = projects.find(p => String(p.id) === String(activeProjectId));

    const loadProtocol = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:42424/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
            const text = await res.text();
            setContent(text);

            // Also load automation files for visibility
            const autoRes = await fetch(`http://localhost:42424/api/automation-code`);
            if (autoRes.ok) {
                const data = await autoRes.json();
                setAutomationCode(data.vbs);
                setProtocolDoc(data.doc);
            }
        } catch (err) {
            console.error("Failed to load protocol:", err);
        } finally {
            setIsLoading(false);
        }
    };

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
        loadProtocol();
        fetchBackups();
    }, [activeProjectId]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch('http://localhost:42424/api/project-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: activeProjectId,
                    content: content
                })
            });
            const data = await res.json();
            if (data.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error("Save failed:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateBackup = async () => {
        setStatusMsg({ type: 'info', text: 'Creating snapshot...' });
        try {
            const res = await fetch('http://localhost:42424/api/backup-now', { method: 'POST' });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: 'Strategic Snapshot Created' });
                fetchBackups();
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Backup failed' });
        } finally {
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    const handleRestore = async (backupName) => {
        if (!confirm(`Restore system to ${backupName}? Current unsaved protocol changes will be overwritten.`)) return;

        setStatusMsg({ type: 'info', text: 'Restoring state...' });
        try {
            const res = await fetch('http://localhost:42424/api/restore-backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupName })
            });
            if (res.ok) {
                setStatusMsg({ type: 'success', text: 'Restored! Reloading...' });
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Restore failed' });
        }
    };

    const systemPromptPreview = `You are the Strategic Manager for an autonomous coding agent (Antigravity). 
Your role is to analyze the project status and guide the user/agent on the best next steps.
Be concise, strategic, and directive.

[CURRENT PROJECT STATUS]
${content || 'No context available'}`;

    return (
        <div className="protocol-container">
            <div className="protocol-header">
                <div className="header-info">
                    <h2><FileText size={24} color="#ffdf8e" /> Knowledge Protocol</h2>
                    <p>Current Strategic Intelligence for {activeProject?.title || 'Unknown Project'}</p>
                </div>

                <div className="header-actions">
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('editor')}
                        >
                            <FileText size={16} /> Editor
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('preview')}
                        >
                            <Code size={16} /> Raw Prompt
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <History size={16} /> Snapshots
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'zerotouch' ? 'active' : ''}`}
                            onClick={() => setActiveTab('zerotouch')}
                        >
                            <Zap size={16} /> Global Protocol
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'automation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('automation')}
                        >
                            <Code size={16} /> Logic
                        </button>
                    </div>

                    <button className="refresh-btn" onClick={loadProtocol} disabled={isLoading} title="Discard unsaved changes and reload from system">
                        <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
                    </button>

                    <button
                        className={`save-btn ${saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        title="Save Protocol: Updates the AI's strategic context immediately."
                    >
                        {isSaving ? <RefreshCw size={18} className="spin" /> :
                            saveStatus === 'success' ? <Check size={18} /> :
                                saveStatus === 'error' ? <AlertCircle size={18} /> :
                                    <Save size={18} />}
                        <span>{isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save Protocol'}</span>
                    </button>
                </div>
            </div>

            {statusMsg && (
                <div className={`protocol-status-toast ${statusMsg.type}`}>
                    {statusMsg.type === 'success' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                    <span>{statusMsg.text}</span>
                </div>
            )}

            <div className="protocol-content">
                {activeTab === 'editor' && (
                    <div className="editor-wrapper fade-in">
                        <textarea
                            className="protocol-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Loading protocol intelligence..."
                            disabled={isLoading}
                        />
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="preview-wrapper fade-in">
                        <pre className="prompt-content">{systemPromptPreview}</pre>
                    </div>
                )}

                {activeTab === 'zerotouch' && (
                    <div className="preview-wrapper fade-in">
                        <div className="protocol-mode-info">
                            <ShieldCheck size={16} color="var(--neon-cyan)" />
                            <span><strong>Mode: Session-Locked.</strong> Autopilot only authorizes keystrokes while a task is processing.</span>
                        </div>
                        <pre className="prompt-content doc-content">{protocolDoc}</pre>
                    </div>
                )}

                {activeTab === 'automation' && (
                    <div className="preview-wrapper fade-in">
                        <div className="code-header-toolbar">
                            <div className="code-header">trigger_continue.vbs</div>
                            <div className="code-actions">
                                <button className="code-action-btn" onClick={() => {
                                    navigator.clipboard.writeText(automationCode);
                                    setStatusMsg({ type: 'success', text: 'Code Copied to Clipboard' });
                                    setTimeout(() => setStatusMsg(null), 2000);
                                }}>
                                    <Copy size={14} /> Copy Code
                                </button>
                                <button className="code-action-btn pulse" onClick={async () => {
                                    setStatusMsg({ type: 'info', text: 'Pulsing Zero-Touch...' });
                                    const res = await fetch('http://localhost:42424/api/trigger-autopilot', { method: 'POST' });
                                    if (res.ok) setStatusMsg({ type: 'success', text: 'Ghost Finger Pulsed!' });
                                    setTimeout(() => setStatusMsg(null), 2000);
                                }}>
                                    <Zap size={14} /> Pulse Now
                                </button>
                            </div>
                        </div>
                        <pre className="prompt-content code-content">{automationCode}</pre>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-wrapper fade-in">
                        <div className="history-toolbar">
                            <button className="create-snapshot-btn" onClick={handleCreateBackup}>
                                <Zap size={16} /> Create Snapshot
                            </button>
                            <span className="rotation-hint">System keeps last 10 versions.</span>
                        </div>
                        <div className="snapshot-list">
                            {backups.map(b => (
                                <div key={b.name} className="snapshot-item">
                                    <div className="snapshot-info">
                                        <span className="snap-name">{b.name}</span>
                                        <span className="snap-date">{new Date(b.createdAt).toLocaleString()}</span>
                                    </div>
                                    <button className="restore-snap-btn" onClick={() => handleRestore(b.name)}>
                                        <RefreshCw size={14} /> Restore
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .protocol-status-toast {
                    position: absolute;
                    top: 80px;
                    right: 40px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 16px;
                    border-radius: 4px;
                    z-index: 100;
                    font-size: 13px;
                }
                .protocol-status-toast.success { background: rgba(0, 255, 0, 0.1); color: #00ff00; border: 1px solid rgba(0,255,0,0.2); }
                .protocol-status-toast.info { background: rgba(0, 240, 255, 0.1); color: #00f0ff; border: 1px solid rgba(0,240,255,0.2); }

                .protocol-mode-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(0, 243, 255, 0.05);
                    border: 1px solid rgba(0, 243, 255, 0.2);
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .protocol-mode-info strong { color: var(--neon-cyan); }
                
                .history-wrapper { padding: 20px; }
                .history-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .create-snapshot-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #00f0ff;
                    border: none;
                    color: black;
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .rotation-hint { font-size: 12px; color: #666; }
                
                .snapshot-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }
                .snapshot-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.03);
                    padding: 12px 16px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .snapshot-info { display: flex; flex-direction: column; gap: 2px; }
                .snap-name { font-family: monospace; font-size: 13px; color: #ccc; }
                .snap-date { font-size: 11px; color: #666; }
                
                .code-header-toolbar { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10px; }
                .code-header { background: #333; padding: 5px 15px; font-size: 12px; color: #aaa; border-radius: 4px 4px 0 0; border: 1px solid #444; border-bottom: none; display: inline-block; }
                .code-actions { display: flex; gap: 8px; margin-bottom: 4px; }
                .code-action-btn { background: rgba(255,255,255,0.05); border: 1px solid #444; color: #888; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
                .code-action-btn:hover { border-color: #00f0ff; color: #00f0ff; background: rgba(0,240,255,0.05); }
                .code-action-btn.pulse:hover { border-color: #ffdf8e; color: #ffdf8e; background: rgba(255,223,142,0.05); }
                .code-content { border-top: 1px solid #444; color: #00ffca !important; }
                .doc-content { color: #f0f0f0 !important; white-space: pre-wrap !important; font-family: 'Segoe UI', sans-serif !important; font-size: 15px !important; }

                .restore-snap-btn {
                    background: transparent;
                    border: 1px solid #444;
                    color: #888;
                    padding: 4px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }
                .restore-snap-btn:hover { border-color: #00f0ff; color: #00f0ff; }
            `}} />

            <footer className="protocol-footer">
                <AlertCircle size={14} color="#888" />
                <span>Changes to this file immediately alter the AI Manager's strategic reasoning for future messages.</span>
            </footer>
        </div>
    );
};

export default ProtocolEditor;
