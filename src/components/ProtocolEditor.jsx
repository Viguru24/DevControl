import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Code, AlertCircle, Check } from 'lucide-react';
import '../styles/ProtocolEditor.css';

const ProtocolEditor = ({ activeProjectId, projects }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'
    const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview'

    const activeProject = projects.find(p => String(p.id) === String(activeProjectId));

    const loadProtocol = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
            const text = await res.text();
            setContent(text);
        } catch (err) {
            console.error("Failed to load protocol:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProtocol();
    }, [activeProjectId]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const res = await fetch('http://localhost:3001/api/project-status', {
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

    // Construct what Groq actually sees as the system prompt
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
                    </div>

                    <button className="refresh-btn" onClick={loadProtocol} disabled={isLoading}>
                        <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
                    </button>

                    <button
                        className={`save-btn ${saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : ''}`}
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? <RefreshCw size={18} className="spin" /> :
                            saveStatus === 'success' ? <Check size={18} /> :
                                saveStatus === 'error' ? <AlertCircle size={18} /> :
                                    <Save size={18} />}
                        <span>{isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save Protocol'}</span>
                    </button>
                </div>
            </div>

            <div className="protocol-content">
                {activeTab === 'editor' ? (
                    <div className="editor-wrapper fade-in">
                        <div className="editor-toolbar">
                            <span>PROJECT_STATUS.md</span>
                            <span className="file-hint">Markdown supported</span>
                        </div>
                        <textarea
                            className="protocol-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Loading protocol intelligence..."
                            disabled={isLoading}
                        />
                    </div>
                ) : (
                    <div className="preview-wrapper fade-in">
                        <div className="preview-header">
                            <span className="warning-label">AI SYSTEM PROMPT</span>
                            <span className="hint">This is exactly what the Groq Manager sees as its identity and context.</span>
                        </div>
                        <pre className="prompt-content">
                            {systemPromptPreview}
                        </pre>
                    </div>
                )}
            </div>

            <footer className="protocol-footer">
                <AlertCircle size={14} color="#888" />
                <span>Changes to this file immediately alter the AI Manager's strategic reasoning for future messages.</span>
            </footer>
        </div>
    );
};

export default ProtocolEditor;
