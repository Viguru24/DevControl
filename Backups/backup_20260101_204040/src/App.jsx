import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import AddProjectModal from './components/AddProjectModal';
import MonitorView from './components/MonitorView';
import MonitorStatus from './components/MonitorStatus'; // Special status page
import AIAssistantView from './components/AIAssistantView';
import ManagerInterface from './components/ManagerInterface';
import ProtocolEditor from './components/ProtocolEditor';
import { projects as initialProjects } from './data/projects';

function App() {
  // If we are loaded inside the monitor iframe for status check, render ONLY the status page
  const [isStatusMode, setIsStatusMode] = useState(window.location.pathname === '/monitor-status');

  if (isStatusMode) {
    return <MonitorStatus />;
  }

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
    fetch('http://localhost:3001/api/projects')
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
      <div style={{ width: '100%', height: '100%' }}>
        {currentView === 'dashboard' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem',
            width: '100%'
          }}>
            {projects.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <p style={{ fontSize: '1.2rem', color: '#888' }}>No projects found</p>
              </div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  style={{
                    background: 'rgba(10, 10, 15, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '2rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00f0ff';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 240, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h2 style={{ color: '#00f0ff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{project.title}</h2>
                  <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '1rem' }}>{project.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {project.tags?.map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(0, 240, 255, 0.1)',
                        color: '#00f0ff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(0, 240, 255, 0.2)'
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {currentView === 'monitor' && <MonitorView projects={projects} />}

        {currentView === 'ai' && <AIAssistantView />}

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
        <div
          onClick={() => setSelectedProject(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '80%', maxWidth: '1000px', maxHeight: '90vh' }}>
            <div style={{ background: '#0f0f13', padding: '3rem', borderRadius: '12px', border: '1px solid #00f0ff' }}>
              <h2 style={{ color: '#00f0ff', fontSize: '2rem', marginBottom: '1rem' }}>{selectedProject.title}</h2>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <span style={{ color: '#0f0', border: '1px solid #0f0', padding: '4px 12px', borderRadius: '4px' }}>{selectedProject.status}</span>
                <span style={{ color: '#888', border: '1px solid #333', padding: '4px 12px', borderRadius: '4px' }}>v{selectedProject.version}</span>
              </div>
              <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem' }}>{selectedProject.description}</p>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <strong style={{ color: '#00f0ff' }}>Path:</strong> <code style={{ color: '#aaa', marginLeft: '10px' }}>{selectedProject.path}</code>
              </div>
              <button onClick={() => setSelectedProject(null)} style={{ padding: '12px 24px', background: '#00f0ff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default App;
