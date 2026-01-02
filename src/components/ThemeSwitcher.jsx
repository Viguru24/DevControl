import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState('neon');
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'neon', name: 'Neon Midnight', color: '#00ffff' },
        { id: 'arctic', name: 'Arctic Dawn', color: '#4dd0e1' },
        { id: 'sunset', name: 'Sunset Command', color: '#ffab40' }
    ];

    useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem('devcontrol-theme') || 'neon';
        setCurrentTheme(saved);
        document.body.setAttribute('data-theme', saved);
    }, []);

    const switchTheme = (themeId) => {
        setCurrentTheme(themeId);
        document.body.setAttribute('data-theme', themeId);
        localStorage.setItem('devcontrol-theme', themeId);
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    width: '100%'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
            >
                <Palette size={16} />
                <span>Theme: {themes.find(t => t.id === currentTheme)?.name}</span>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        right: 0,
                        marginBottom: '8px',
                        background: 'var(--bg-glass-heavy)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px',
                        zIndex: 1000,
                        backdropFilter: 'var(--backdrop-blur)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => switchTheme(theme.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 12px',
                                width: '100%',
                                background: currentTheme === theme.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                color: currentTheme === theme.id ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)',
                                textAlign: 'left',
                                marginBottom: '4px'
                            }}
                            onMouseEnter={(e) => {
                                if (currentTheme !== theme.id) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = 'var(--text-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentTheme !== theme.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }
                            }}
                        >
                            <div
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: theme.color,
                                    boxShadow: `0 0 10px ${theme.color}`,
                                    flexShrink: 0
                                }}
                            />
                            <span style={{ fontSize: '0.9rem', fontWeight: currentTheme === theme.id ? 600 : 400 }}>
                                {theme.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
