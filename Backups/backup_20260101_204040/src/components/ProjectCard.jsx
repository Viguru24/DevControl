import React from 'react';
import { Github, ExternalLink, Activity } from 'lucide-react';
import '../styles/ProjectCard.css';

const ProjectCard = ({ project, onClick }) => {
    const { title, description, status, tags } = project;

    return (
        <div className="project-card" onClick={() => onClick(project)} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                <span className={`status-badge ${status.toLowerCase()}`}>
                    <Activity size={14} />
                    {status}
                </span>
            </div>

            <p className="card-description">{description}</p>

            <div className="tags">
                {tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                ))}
            </div>

            <div className="card-actions">
                <button className="action-btn" title="View Code">
                    <Github size={18} />
                </button>
                <button className="action-btn" title="Live Demo">
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
