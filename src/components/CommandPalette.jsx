import React, { useState, useEffect, useRef } from 'react';
import { Search, Zap, LayoutGrid, Settings, Book, ArrowRight } from 'lucide-react';
import '../styles/Layout.css'; // We'll add specific styles here or create a new CSS

const CommandPalette = ({ isOpen, onClose, projects, onNavigate, onToggleAuto, autoStatus }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

    const staticCommands = [
        { id: 'cmd-dashboard', title: 'Go to Dashboard', icon: <LayoutGrid size={16} />, action: () => onNavigate('dashboard') },
        { id: 'cmd-settings', title: 'Security Settings', icon: <Settings size={16} />, action: () => onNavigate('settings') },
        { id: 'cmd-docs', title: 'Documentation', icon: <Book size={16} />, action: () => onNavigate('documentation') },
        {
            id: 'cmd-auto',
            title: autoStatus.globalEnabled ? 'Disable Autopilot' : 'Enable Autopilot',
            icon: <Zap size={16} color={autoStatus.globalEnabled ? '#ffcc33' : '#666'} />,
            action: onToggleAuto
        }
    ].filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

    const allOptions = [...staticCommands, ...filteredProjects.map(p => ({
        id: `proj-${p.id}`,
        title: `Open Project: ${p.title}`,
        icon: <div className="pulse-indicator pulse-sm" style={{ background: 'var(--neon-cyan)' }}></div>,
        action: () => onNavigate('project', p.id)
    }))];

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % allOptions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + allOptions.length) % allOptions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (allOptions[selectedIndex]) {
                    allOptions[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, allOptions, onClose]);

    if (!isOpen) return null;

    return (
        <div className="cmd-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            paddingTop: '15vh'
        }}>
            <div className="cmd-palette glass-panel" onClick={e => e.stopPropagation()} style={{
                width: '600px', maxWidth: '90%', maxHeight: '400px',
                display: 'flex', flexDirection: 'column',
                background: '#121214', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', borderRadius: '12px'
            }}>
                <div className="cmd-header" style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={20} color="#666" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        style={{
                            background: 'transparent', border: 'none', color: '#fff',
                            fontSize: '1.1rem', flex: 1, outline: 'none'
                        }}
                    />
                    <div style={{ fontSize: '0.7rem', background: '#333', padding: '2px 6px', borderRadius: '4px', color: '#888' }}>ESC</div>
                </div>

                <div className="cmd-results" style={{ overflowY: 'auto', padding: '8px' }}>
                    {allOptions.length === 0 ? (
                        <div style={{ padding: '12px', color: '#666', textAlign: 'center' }}>No results found</div>
                    ) : (
                        allOptions.map((opt, i) => (
                            <div
                                key={opt.id}
                                className={`cmd-item ${i === selectedIndex ? 'selected' : ''}`}
                                onMouseEnter={() => setSelectedIndex(i)}
                                onClick={() => { opt.action(); onClose(); }}
                                style={{
                                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                                    borderRadius: '8px', cursor: 'pointer',
                                    background: i === selectedIndex ? 'rgba(0, 243, 255, 0.1)' : 'transparent',
                                    border: i === selectedIndex ? '1px solid rgba(0, 243, 255, 0.2)' : '1px solid transparent'
                                }}
                            >
                                <div style={{ color: i === selectedIndex ? 'var(--neon-cyan)' : '#888' }}>{opt.icon}</div>
                                <span style={{ color: i === selectedIndex ? '#fff' : '#aaa', fontSize: '0.95rem' }}>{opt.title}</span>
                                {i === selectedIndex && <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--neon-cyan)' }} />}
                            </div>
                        ))
                    )}
                </div>

                <div className="cmd-footer" style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '12px', fontSize: '0.75rem', color: '#555' }}>
                    <span>Use <b>↑↓</b> to navigate</span>
                    <span><b>↵</b> to select</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
