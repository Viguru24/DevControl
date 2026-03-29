import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, Key, User, Plus, Trash2, Copy, ShieldCheck } from 'lucide-react';
import '../styles/ProjectVault.css';

const ProjectVault = ({ projectId }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [password, setPassword] = useState('');
    const [secrets, setSecrets] = useState([]);
    const [newSecret, setNewSecret] = useState({ label: '', username: '', password: '', value: '' });
    const [showValues, setShowValues] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const sessionPass = sessionStorage.getItem('devcontrol-vault-session');
        if (sessionPass) {
            setPassword(sessionPass);
            autoUnlock(sessionPass);
        }
    }, [projectId]);

    const autoUnlock = async (pass) => {
        try {
            const res = await fetch(`http://localhost:42424/api/projects/${projectId}/secrets?password=${encodeURIComponent(pass)}`);
            if (res.ok) {
                const data = await res.json();
                setSecrets(data);
                sessionStorage.setItem('devcontrol-vault-session', pass);
                setIsLocked(false);
            }
        } catch (err) {
            console.error('Auto-unlock failed', err);
        }
    };

    const handleUnlock = async () => {
        try {
            const res = await fetch(`http://localhost:42424/api/projects/${projectId}/secrets?password=${encodeURIComponent(password)}`);
            const data = await res.json();
            if (res.ok) {
                setSecrets(data);
                setIsLocked(false);
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Unlock failed: ' + err.message);
        }
    };

    const handleSaveSecrets = async (updatedSecrets) => {
        try {
            const res = await fetch(`http://localhost:42424/api/projects/${projectId}/secrets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, secrets: updatedSecrets })
            });
            if (res.ok) {
                setSecrets(updatedSecrets);
            } else {
                const data = await res.json();
                alert(data.error);
            }
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    const addSecret = () => {
        const updated = [...secrets, { ...newSecret, id: Date.now() }];
        handleSaveSecrets(updated);
        setNewSecret({ label: '', username: '', password: '', value: '' });
    };

    const deleteSecret = (id) => {
        const updated = secrets.filter(s => s.id !== id);
        handleSaveSecrets(updated);
    };

    const toggleVisibility = (id) => {
        setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    if (isLocked) {
        return (
            <div className="project-vault locked animate-fade">
                <div className="vault-lock-screen">
                    <div className="lock-icon-container">
                        <Lock size={48} className="lock-pulsing" />
                    </div>
                    <h2>Secure Project Sentinel</h2>
                    <p>Enter the Global Master Password to access project credentials.</p>
                    <div className="lock-form">
                        <div className="password-field-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Master Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                            />
                            <button className="toggle-pass-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <button className="unlock-btn" onClick={handleUnlock}>
                            <Unlock size={18} />
                            <span>Unlock Vault</span>
                        </button>
                    </div>
                    <div className="vault-security-notice">
                        <ShieldCheck size={14} />
                        <span>AES-256 Local Encryption (Simulated)</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="project-vault unlocked animate-fade">
            <div className="vault-header">
                <h3><ShieldCheck size={20} /> Project Secrets</h3>
                <button className="lock-btn-small" onClick={() => {
                    setIsLocked(true);
                    setPassword('');
                    sessionStorage.removeItem('devcontrol-vault-session');
                }}>
                    <Lock size={14} />
                    <span>Lock Vault</span>
                </button>
            </div>

            <div className="secrets-grid">
                {secrets.map(secret => (
                    <div key={secret.id} className="secret-card glass-panel">
                        <div className="secret-card-header">
                            <span className="secret-label">{secret.label}</span>
                            <button className="delete-secret-btn" onClick={() => deleteSecret(secret.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div className="secret-fields">
                            {secret.username && (
                                <div className="secret-field">
                                    <User size={14} />
                                    <span className="field-value">{secret.username}</span>
                                    <button onClick={() => copyToClipboard(secret.username)}><Copy size={12} /></button>
                                </div>
                            )}
                            {(secret.password || secret.value) && (
                                <div className="secret-field">
                                    <Key size={14} />
                                    <span className="field-value">
                                        {showValues[secret.id] ? (secret.password || secret.value) : '••••••••••••'}
                                    </span>
                                    <div className="field-actions">
                                        <button onClick={() => toggleVisibility(secret.id)}>
                                            {showValues[secret.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                        </button>
                                        <button onClick={() => copyToClipboard(secret.password || secret.value)}>
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="secret-card add-secret glass-panel">
                    <h4>Add New Credential</h4>
                    <div className="add-fields">
                        <input
                            placeholder="Label (e.g. AWS Key)"
                            value={newSecret.label}
                            onChange={(e) => setNewSecret({ ...newSecret, label: e.target.value })}
                        />
                        <input
                            placeholder="Username / key_id"
                            value={newSecret.username}
                            onChange={(e) => setNewSecret({ ...newSecret, username: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Password / Secret"
                            value={newSecret.password || newSecret.value}
                            onChange={(e) => setNewSecret({ ...newSecret, password: e.target.value })}
                        />
                        <button className="add-btn" onClick={addSecret} disabled={!newSecret.label}>
                            <Plus size={16} />
                            <span>Secure in Vault</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectVault;
