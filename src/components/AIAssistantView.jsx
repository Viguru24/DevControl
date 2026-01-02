import React, { useState, useEffect } from 'react';
import { Brain, FileText, CheckSquare, RefreshCw, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import '../styles/AIAssistant.css';

const AIAssistantView = () => {
    const [artifacts, setArtifacts] = useState({
        task: null,
        walkthrough: null
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('task');

    const fetchArtifacts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:42424/api/artifacts');
            const data = await response.json();
            setArtifacts(data);
        } catch (err) {
            console.error('Failed to fetch artifacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtifacts();
        // Auto-refresh every 5 seconds to show live updates
        const interval = setInterval(fetchArtifacts, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="ai-assistant-container">
            <div className="ai-header">
                <div className="header-content">
                    <h2><Brain size={24} color="var(--color-primary)" /> Antigravity Assistant</h2>
                    <p>Live view of AI session artifacts and task progress</p>
                </div>
                <button className="refresh-btn" onClick={fetchArtifacts} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="artifact-tabs">
                <button
                    className={`tab-btn ${activeTab === 'task' ? 'active' : ''}`}
                    onClick={() => setActiveTab('task')}
                >
                    <CheckSquare size={18} /> Current Task
                </button>
                <button
                    className={`tab-btn ${activeTab === 'walkthrough' ? 'active' : ''}`}
                    onClick={() => setActiveTab('walkthrough')}
                >
                    <FileText size={18} /> Walkthrough
                </button>
            </div>

            <div className="artifact-content">
                {loading && !artifacts.task && !artifacts.walkthrough ? (
                    <div className="loading-state">
                        <RefreshCw className="spin" size={48} />
                        <p>Loading Antigravity data...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'task' && (
                            <div className="artifact-panel fade-in">
                                {artifacts.task ? (
                                    <>
                                        <div className="panel-header">
                                            <h3>Active Task Checklist</h3>
                                            <span className="live-badge">
                                                <Zap size={14} />
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="markdown-content">
                                            <Markdown>{artifacts.task}</Markdown>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <CheckSquare size={64} opacity={0.3} />
                                        <p>No active task</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'walkthrough' && (
                            <div className="artifact-panel fade-in">
                                {artifacts.walkthrough ? (
                                    <>
                                        <div className="panel-header">
                                            <h3>Implementation Walkthrough</h3>
                                            <span className="live-badge">
                                                <Zap size={14} />
                                                LIVE
                                            </span>
                                        </div>
                                        <div className="markdown-content">
                                            <Markdown>{artifacts.walkthrough}</Markdown>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <FileText size={64} opacity={0.3} />
                                        <p>No walkthrough available</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AIAssistantView;
