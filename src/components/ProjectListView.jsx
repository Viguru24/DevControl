import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, ExternalLink, Code, Terminal, BarChart2, Trash2 } from 'lucide-react';
import DeleteProjectModal from './DeleteProjectModal';
import '../styles/ProjectListView.css';

const ProjectListView = ({ projects = [], onLaunchConsole, onNewProjectClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [projectToDelete, setProjectToDelete] = useState(null);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleDeleteProject = async (id, mode, confirmName) => {
        try {
            const res = await fetch(`http://localhost:42424/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, confirmName })
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload(); // Simple refresh for now
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Failed to delete project:', err);
            throw err;
        }
    };

    return (
        <div className="project-list-view animate-fade">
            <div className="view-header">
                <div className="header-title">
                    <h1>Infrastructure Repository</h1>
                    <p>Centralized management for all deployment nodes and local services.</p>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="create-node-btn" onClick={onNewProjectClick}>
                        <Plus size={18} />
                        <span>Add New Project</span>
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    {['All', 'Active', 'Stable', 'Development', 'Maintenance'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="project-count">
                    Found {filteredProjects.length} infrastructure nodes
                </div>
            </div>

            <div className="infra-grid">
                {filteredProjects.map(project => (
                    <div key={project.id} className="infra-card glass-panel">
                        <div className="infra-card-header">
                            <div className="infra-icon-bg">
                                <Terminal size={20} color="var(--neon-cyan)" />
                            </div>
                            <div className="infra-title-area">
                                <h3>{project.title}</h3>
                                <span className={`infra-status-pill ${project.status.toLowerCase()}`}>
                                    {project.status}
                                </span>
                            </div>
                            <button className="infra-more-btn">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div className="infra-body">
                            <p className="infra-description">{project.description}</p>

                            <div className="infra-metrics">
                                <div className="infra-metric">
                                    <span className="metric-label">Version</span>
                                    <span className="metric-value">v{project.version || '0.1.0'}</span>
                                </div>
                                <div className="infra-metric">
                                    <span className="metric-label">Environment</span>
                                    <span className="metric-value">{project.monitorUrl ? 'Remote' : 'Local'}</span>
                                </div>
                                <div className="infra-metric">
                                    <span className="metric-label">Uptime</span>
                                    <span className="metric-value">{project.uptime || '99.9%'}</span>
                                </div>
                            </div>

                            <div className="infra-tags">
                                {project.tags?.map(tag => (
                                    <span key={tag} className="infra-tag">#{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="infra-footer">
                            <div className="infra-path-code">
                                <Code size={14} />
                                <code>{project.path}</code>
                            </div>
                            <div className="infra-actions">
                                <button className="infra-btn secondary" onClick={() => setProjectToDelete(project)}>
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                                <button className="infra-btn primary" onClick={() => onLaunchConsole(project.id)}>
                                    <ExternalLink size={16} />
                                    <span>Launch</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {projectToDelete && (
                <DeleteProjectModal
                    project={projectToDelete}
                    onClose={() => setProjectToDelete(null)}
                    onDelete={handleDeleteProject}
                />
            )}
        </div>
    );
};

export default ProjectListView;
