import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import '../styles/DeleteProjectModal.css';

const DeleteProjectModal = ({ project, onClose, onDelete }) => {
    const [mode, setMode] = useState('unregister'); // 'unregister' or 'destroy'
    const [confirmName, setConfirmName] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (mode === 'destroy' && confirmName !== project.title) {
            alert('Project name mismatch. Please type the exact name to confirm destruction.');
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(project.id, mode, confirmName);
            onClose();
        } catch (err) {
            alert('Deletion failed: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal animate-pop">
                <div className="modal-header">
                    <div className="title-area">
                        <AlertTriangle color="#ff4b4b" size={24} />
                        <h2>Terminate Infrastructure Node</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    <p className="warning-text">
                        You are about to remove <strong>{project.title}</strong> from the DevControl network.
                    </p>

                    <div className="delete-options">
                        <label className={`delete-option ${mode === 'unregister' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="deleteMode"
                                value="unregister"
                                checked={mode === 'unregister'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            <div className="option-info">
                                <span className="option-title">Unregister Only</span>
                                <span className="option-desc">Removes from DevControl but keeps files at <code>{project.path}</code> intact.</span>
                            </div>
                        </label>

                        <label className={`delete-option dangerous ${mode === 'destroy' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="deleteMode"
                                value="destroy"
                                checked={mode === 'destroy'}
                                onChange={(e) => setMode(e.target.value)}
                            />
                            <div className="option-info">
                                <span className="option-title">Total Destruction</span>
                                <span className="option-desc">Permanently deletes the repository folder and all its contents from disk.</span>
                            </div>
                        </label>
                    </div>

                    {mode === 'destroy' && (
                        <div className="confirmation-input animate-fade">
                            <div className="destruction-alert">
                                <ShieldAlert size={16} />
                                <span>CAUTION: This action is irreversible.</span>
                            </div>
                            <label>To confirm destruction, type <strong>{project.title}</strong> below:</label>
                            <input
                                type="text"
                                placeholder="Project Name"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                className="confirm-field"
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose} disabled={isDeleting}>Cancel</button>
                    <button
                        className={`delete-btn ${mode === 'destroy' ? 'danger' : ''}`}
                        onClick={handleConfirm}
                        disabled={isDeleting || (mode === 'destroy' && confirmName !== project.title)}
                    >
                        {isDeleting ? 'Processing...' : mode === 'destroy' ? 'Destroy Repository' : 'Unregister Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProjectModal;
