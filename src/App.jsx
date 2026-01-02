import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import AddProjectModal from './components/AddProjectModal';
import DashboardView from './components/DashboardView';
import ManagerInterface from './components/ManagerInterface';
import ProtocolEditor from './components/ProtocolEditor';
import { projects as initialProjects } from './data/projects';

function App() {

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // For the modal/detail view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Lifted selectedProjectId for global sync
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return parseInt(localStorage.getItem('selectedProjectId')) || 2;
  });

  // Persist selected project ID
  useEffect(() => {
    localStorage.setItem('selectedProjectId', selectedProjectId);
  }, [selectedProjectId]);

  // Restore view state from localStorage or default to 'dashboard'
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('devcontrol-current-view') || 'dashboard';
  });

  // Persist view state
  useEffect(() => {
    localStorage.setItem('devcontrol-current-view', currentView);
  }, [currentView]);

  useEffect(() => {
    fetch('http://localhost:42424/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => {
        console.error('Failed to fetch projects:', err);
        setProjects(initialProjects);
      });
  }, [isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(null);
  };

  return (
    <Layout
      onNewProjectClick={() => setIsModalOpen(true)}
      currentView={currentView}
      setCurrentView={setCurrentView}
      projects={projects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
    >
      <div className="dashboard-grid animate-fade">
        {currentView === 'dashboard' && (
          <DashboardView
            projects={projects}
            onProjectClick={setSelectedProject}
          />
        )}

        {currentView === 'manager' && (
          <ManagerInterface
            activeProjectId={selectedProjectId}
            availableProjects={projects}
          />
        )}

        {currentView === 'protocols' && (
          <ProtocolEditor
            activeProjectId={selectedProjectId}
            projects={projects}
          />
        )}
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        projectToEdit={projectToEdit}
      />

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content glass-modal animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ color: 'var(--neon-cyan)', fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedProject.title}</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className="tag neon">{selectedProject.status}</span>
                  <span className="tag" style={{ border: '1px solid var(--text-muted)' }}>v{selectedProject.version}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ padding: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              {selectedProject.description}
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'var(--neon-cyan)' }}>Path:</strong>
              <code style={{ color: '#aaa', marginLeft: '10px', fontFamily: 'monospace' }}>{selectedProject.path}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setSelectedProject(null)} style={{ padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>Close</button>
              <button style={{ padding: '10px 24px', background: 'var(--neon-cyan)', color: '#000', fontWeight: 'bold', borderRadius: '6px' }}>Launch Environment</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default App;
