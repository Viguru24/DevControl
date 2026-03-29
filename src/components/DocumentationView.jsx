import React, { useState, useEffect } from 'react';
import { Book, FileText, Bookmark, Search, Edit3, ChevronRight, Hash, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/DocumentationView.css';

const DocumentationView = () => {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:42424/api/documentation')
            .then(res => res.json())
            .then(data => {
                setDocs(data);
                if (data.length > 0) setSelectedDoc(data[0]);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch docs:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading-state">Syncing Documentation Library...</div>;

    return (
        <div className="documentation-view animate-fade">
            <div className="doc-sidebar">
                <div className="doc-sidebar-header">
                    <Book size={20} color="var(--neon-cyan)" />
                    <h2>Knowledge Base</h2>
                </div>

                <div className="doc-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search knowledge..." />
                </div>

                <div className="doc-categories">
                    {/* Unique projects from docs */}
                    {[...new Set(docs.map(d => d.project))].map(projectName => (
                        <div className="category-group" key={projectName}>
                            <div className="category-label">{projectName}</div>
                            {docs.filter(d => d.project === projectName).map(doc => (
                                <button
                                    key={doc.path}
                                    className={`doc-nav-item ${selectedDoc?.path === doc.path ? 'active' : ''}`}
                                    onClick={() => setSelectedDoc(doc)}
                                >
                                    <FileText size={16} />
                                    <span>{doc.name.replace('.md', '').replace(/_/g, ' ')}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="doc-content-area">
                {selectedDoc ? (
                    <div className="doc-content-wrapper glass-panel">
                        <div className="doc-header">
                            <div className="doc-breadrumbs">
                                <span>Docs</span> <ChevronRight size={12} /> <span>{selectedDoc.path}</span>
                            </div>
                            <div className="doc-title-actions">
                                <h1>{selectedDoc.name.replace('.md', '').replace(/_/g, ' ')}</h1>
                                <button className="edit-doc-btn">
                                    <Edit3 size={16} />
                                    <span>Edit Content</span>
                                </button>
                            </div>
                        </div>
                        <div className="doc-body markdown-content">
                            <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="no-doc-selected">
                        <div className="empty-icon-bg">
                            <Book size={48} />
                        </div>
                        <h3>Select a document from the Knowledge Base</h3>
                        <p>Detailed technical documentation and system protocols will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentationView;
