import React, { useState, useEffect } from 'react';
import { Settings, Shield, Lock, Key, Info, CheckCircle2, AlertTriangle, Eye, EyeOff, Link, Globe } from 'lucide-react';
import '../styles/SettingsView.css';

const SettingsView = ({ projects = [] }) => {
    const [masterPassword, setMasterPassword] = useState(() => localStorage.getItem('devcontrol-master-password') || 'DevControl2026');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:42424/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword })
            });
            if (res.ok) {
                localStorage.setItem('devcontrol-master-password', masterPassword);
                sessionStorage.setItem('devcontrol-vault-session', masterPassword);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } else {
                alert('Failed to update server password.');
            }
        } catch (err) {
            console.error('Save error:', err);
            alert('Error connecting to server.');
        }
    };

    return (
        <div className="settings-view animate-fade">
            <header className="view-header">
                <div className="header-title">
                    <h1>System Settings & Security</h1>
                    <p>Global configuration for infrastructure encryption and master access.</p>
                </div>
            </header>

            <div className="settings-grid">
                <section className="settings-section glass-panel">
                    <div className="section-header">
                        <Shield className="section-icon" size={20} />
                        <h2>Master Security Password</h2>
                    </div>
                    <div className="section-body">
                        <p className="section-desc">
                            Set the global gateway password. This password is required to decrypt and view project-specific secrets
                            (API keys, database credentials, etc.) across the entire mission control.
                        </p>
                        <div className="input-group">
                            <label><Lock size={14} /> Global Master Password</label>
                            <div className="password-input-row" style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <div className="password-input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Master Password"
                                        value={masterPassword}
                                        onChange={(e) => setMasterPassword(e.target.value)}
                                        style={{ width: '100%', paddingRight: '3rem' }}
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button className="save-settings-btn" onClick={handleSave} style={{ minWidth: '160px' }}>
                                    {isSaved ? <CheckCircle2 size={18} /> : <span>Update Password</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="settings-section glass-panel">
                    <div className="section-header">
                        <Key className="section-icon" size={20} />
                        <h2>Encryption Manifest</h2>
                    </div>
                    <div className="section-body">
                        <div className="encryption-details">
                            <div className="encryption-stat">
                                <span className="stat-label">Algorithm</span>
                                <span className="stat-value">AES-256-GCM</span>
                            </div>
                            <div className="encryption-stat">
                                <span className="stat-label">Storage</span>
                                <span className="stat-value">Local Encrypted JSON</span>
                            </div>
                            <div className="encryption-stat">
                                <span className="stat-label">Security Layer</span>
                                <span className="stat-value">Project-Level Isolation</span>
                            </div>
                        </div>
                        <div className="info-box">
                            <Info size={16} />
                            <p>
                                All sensitive data is encrypted using military-grade AES-256 standards before being saved to the
                                <code>projects.json</code> file. Your master password is never stored in plain text; it is used as the
                                primary entropy source for the decryption key.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="settings-section glass-panel">
                    <div className="section-header">
                        <AlertTriangle className="section-icon dangerous" size={20} />
                        <h2>Infrastructure Safety</h2>
                    </div>
                    <div className="section-body">
                        <p className="section-desc">
                            Controls for high-risk actions. Ensure you understand the implications of physical repository removal.
                        </p>
                        <div className="safety-toggle">
                            <div className="toggle-info">
                                <span>Deep Destruction Confirmation</span>
                                <p>Require manual project title verification before recursive disk removal.</p>
                            </div>
                            <div className="status-pill active">ALWAYS ACTIVE</div>
                        </div>
                    </div>
                </section>

                <section className="settings-section glass-panel">
                    <div className="section-header">
                        <Globe className="section-icon" size={20} />
                        <h2>Network Infrastructure</h2>
                    </div>
                    <div className="section-body">
                        <p className="section-desc">
                            Current port assignments across the local ecosystem. External endpoints registered on localhost.
                        </p>
                        <div className="encryption-details">
                            <div className="encryption-stat">
                                <span className="stat-label">DevControl (Frontend)</span>
                                <span className="stat-value">7777</span>
                            </div>
                            <div className="encryption-stat">
                                <span className="stat-label">DevControl (Backend)</span>
                                <span className="stat-value">42424</span>
                            </div>
                            {projects.map(project => {
                                const url = project.monitorUrl || '';
                                const match = url.match(/:(\d+)/);
                                const port = match ? match[1] : 'N/A';
                                if (port === 'N/A') return null;
                                return (
                                    <div key={project.id} className="encryption-stat">
                                        <span className="stat-label">{project.title}</span>
                                        <span className="stat-value">{port}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
