import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Box, Code, ExternalLink, Trash2, Edit, Rocket, Play, Layers, Zap, Search, GitBranch, CheckSquare, Activity, RefreshCw, Sparkles, BrainCircuit } from 'lucide-react';
import Markdown from 'react-markdown';
import '../styles/ProjectDetail.css';

const ProjectDetail = ({ project, onClose, onDelete, onEdit }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [viewingDoc, setViewingDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // AI State
    // We don't need to ask for key anymore, key is on server.
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiStrategy, setAiStrategy] = useState(null);
    const [customContext, setCustomContext] = useState('');

    useEffect(() => {
        // Reset AI state when project changes
        setAiStrategy(null);
        setCustomContext('');
    }, [project]);

    if (!project) return null;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
            onDelete(project.id);
            onClose();
        }
    };

    const handleEdit = () => {
        onEdit(project);
    };

    const handleLoadProject = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:42424/api/launch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: project.path })
            });
            const data = await response.json();

            if (data.success) {
                // Success feedback
                setTimeout(() => setIsLoading(false), 1000);
            } else {
                alert("Launch failed: " + data.error);
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to connect to Controller Backend.");
            setIsLoading(false);
        }
    };

    const handleRunOptimization = async () => {
        setIsAnalyzing(true);

        try {
            const response = await fetch('http://localhost:42424/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // No apiKey sent, server uses .env
                    project,
                    contextLines: customContext
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setAiStrategy(data.result);
        } catch (err) {
            console.error(err);
            alert("Optimization Failed: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (viewingDoc) {
        return (
            <div className="project-detail-overlay">
                <div className="doc-viewer-container">
                    <div className="doc-viewer-header">
                        <h3>{viewingDoc.name}</h3>
                        <button className="close-btn" onClick={() => setViewingDoc(null)}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className="doc-viewer-content">
                        <Markdown>{viewingDoc.content || "*No content available.*"}</Markdown>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="project-detail-overlay">
            <div className="project-detail-container">

                {/* Header */}
                <div className="detail-header">
                    <div>
                        <h2 className="detail-title">{project.title}</h2>
                        <div className="detail-meta">
                            <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status}</span>
                            {project.version && <span className="version-badge">v{project.version}</span>}
                            <code className="path-badge">{project.path}</code>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`action-btn-header load ${isLoading ? 'loading' : ''}`}
                            onClick={handleLoadProject}
                            title="Load into Antigravity"
                        >
                            {isLoading ? <Activity className="spin" size={20} /> : <Play size={20} fill="currentColor" />}
                            <span>{isLoading ? 'INIT' : 'LOAD'}</span>
                        </button>
                        <button className="action-btn-header edit" onClick={handleEdit} title="Edit Project">
                            <Edit size={20} />
                        </button>
                        <button className="action-btn-header delete" onClick={handleDelete} title="Delete Project">
                            <Trash2 size={20} />
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="detail-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Box size={18} /> Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'strategy' ? 'active' : ''}`}
                        onClick={() => setActiveTab('strategy')}
                        style={{ color: activeTab === 'strategy' ? '#a48eff' : '' }}
                    >
                        <BrainCircuit size={18} /> AI Strategy
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('departments')}
                    >
                        <Layers size={18} /> Code Divisions
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('docs')}
                    >
                        <FileText size={18} /> Documentation
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
                        onClick={() => setActiveTab('issues')}
                    >
                        <AlertCircle size={18} /> Issues & Solutions
                    </button>
                </div>

                {/* Content */}
                <div className="detail-content">

                    {activeTab === 'overview' && (
                        <div className="tab-panel fade-in">
                            <p className="description-large">{project.description}</p>

                            <div className="improvements-section">
                                <h3><Rocket size={20} /> Controller Capabilities</h3>
                                <div className="improvements-grid">
                                    <div className="imp-card">
                                        <Play size={24} className="imp-icon" />
                                        <h4>Project Launcher</h4>
                                        <p>One-click environment initialization and IDE startup.</p>
                                    </div>
                                    <div className="imp-card">
                                        <Layers size={24} className="imp-icon" />
                                        <h4>Department Map</h4>
                                        <p>Logical breakdown of codebase into specific divisions.</p>
                                    </div>
                                    <div className="imp-card">
                                        <RefreshCw size={24} className="imp-icon" />
                                        <h4>Live Doc Sync</h4>
                                        <p>Real-time synchronization with local .md files.</p>
                                    </div>
                                    <div className="imp-card">
                                        <BrainCircuit size={24} className="imp-icon" style={{ color: '#a48eff' }} />
                                        <h4>AI Strategist</h4>
                                        <p>Gen-AI optimization of project workflows.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'strategy' && (
                        <div className="tab-panel fade-in ai-panel">
                            {/* Empty State for New Projects */}
                            {!aiStrategy && !isAnalyzing && (
                                <div className="strategy-empty-state">
                                    <Sparkles size={48} className="empty-icon-neon" />
                                    <h3>Initialize Strategy Protocol</h3>
                                    <p>No active strategy found for this mission. Define your objectives below to generate a tactical plan.</p>
                                </div>
                            )}

                            <div className="ai-controls">
                                <div className="api-input-group">
                                    <label>Strategic Objective</label>
                                    <textarea
                                        placeholder="e.g., 'Analyze current architecture for scalability bottlenecks' or 'Draft a roadmap for the Alpha release'"
                                        rows={3}
                                        value={customContext}
                                        onChange={(e) => setCustomContext(e.target.value)}
                                    />
                                </div>
                                <button
                                    className="ai-run-btn"
                                    onClick={handleRunOptimization}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <> <RefreshCw className="spin" size={18} /> Computing Strategic Vectors... </>
                                    ) : (
                                        <> <Zap size={18} /> Execute Strategy Generation </>
                                    )}
                                </button>
                            </div>

                            {aiStrategy && (
                                <div className="ai-result slide-up">
                                    <div className="result-header">
                                        <h3><BrainCircuit size={20} /> Tactical Analysis</h3>
                                        <span className="timestamp">Generated Just Now</span>
                                    </div>
                                    <div className="markdown-body">
                                        <Markdown>{aiStrategy}</Markdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'departments' && (
                        <div className="tab-panel fade-in">
                            {project.departments?.map((dept, idx) => (
                                <div key={idx} className="department-block">
                                    <div className="dept-header">
                                        <h4>{dept.name}</h4>
                                        <p>{dept.description}</p>
                                    </div>
                                    <div className="modules-grid">
                                        {dept.modules.map((mod, mIdx) => (
                                            <div key={mIdx} className="module-card">
                                                <h5>{mod.name}</h5>
                                                <code className="path">{mod.path}</code>
                                                <p>{mod.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) || (
                                    <div className="empty-state">
                                        <p>No code divisions defined for this project.</p>
                                        <p className="sub-text">This project relies on the standard monolithic structure.</p>
                                    </div>
                                )}
                        </div>
                    )}

                    {activeTab === 'docs' && (
                        <div className="tab-panel fade-in">
                            <div className="docs-list">
                                {project.docs?.map((doc, idx) => (
                                    <div key={idx} className="doc-item">
                                        <div className="doc-icon">
                                            <FileText size={24} />
                                        </div>
                                        <div className="doc-info">
                                            <h4>{doc.name}</h4>
                                            <code className="path">{doc.path}</code>
                                        </div>
                                        <button
                                            className="action-btn-sm"
                                            title="Open Document"
                                            onClick={() => setViewingDoc(doc)}
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                )) || <p className="empty-state">No documentation available.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <div className="tab-panel fade-in">
                            <div className="issues-list">
                                {project.issues?.map((issue, idx) => (
                                    <div key={idx} className="issue-card">
                                        <div className="issue-header">
                                            <span className="issue-id">#{issue.id}</span>
                                            <h4>{issue.problem}</h4>
                                        </div>
                                        <p className="issue-desc">{issue.description}</p>
                                        <div className="issue-solution">
                                            <strong>Solution:</strong>
                                            <p>{issue.solution}</p>
                                        </div>
                                    </div>
                                )) || <p className="empty-state">No known issues recorded.</p>}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
export default ProjectDetail;
