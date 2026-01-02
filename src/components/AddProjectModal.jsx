import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/AddProjectModal.css';

const AddProjectModal = ({ isOpen, onClose, onAdd, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Active',
        tags: '',
        path: '',
        version: ''
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                status: initialData.status || 'Active',
                tags: initialData.tags ? initialData.tags.join(', ') : '',
                path: initialData.path || '',
                version: initialData.version || ''
            });
        } else {
            setFormData({ title: '', description: '', status: 'Active', tags: '', path: '', version: '' });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newProject = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        onAdd(newProject);
        setFormData({ title: '', description: '', status: 'Active', tags: '' });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Update Project Protocol" : "Initialize New Project"}>
            <form onSubmit={handleSubmit} className="project-form">
                <div className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Hyperspace Drive"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief briefing of the mission..."
                        rows={3}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Development">Development</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Concept">Concept</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="subfolder">Project Folder Name (Subfolder)</label>
                    <input
                        type="text"
                        id="subfolder"
                        name="subfolder"
                        value={formData.subfolder || ''}
                        onChange={handleChange}
                        placeholder="my-new-app"
                        required
                    />
                    <small>Will be created in C:\Users\elois\OneDrive\Documents\GitHub\</small>
                </div>

                <div className="form-group">
                    <label htmlFor="version">Version (optional)</label>
                    <input
                        type="text"
                        id="version"
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                        placeholder="1.0.0"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tags">Tags (comma separated)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Physics, AI, Top Secret"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">{initialData ? "Update Project" : "Create & Launch Project"}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddProjectModal;
