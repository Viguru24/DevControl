import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import AddProjectModal from './components/AddProjectModal';
import DashboardView from './components/DashboardView';
import ManagerInterface from './components/ManagerInterface';
import ProjectListView from './components/ProjectListView';
import DocumentationView from './components/DocumentationView';
import SettingsView from './components/SettingsView';
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

  // Global Lock State
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);
  const [globalPassword, setGlobalPassword] = useState('');
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    fetch('http://localhost:42424/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.masterPasswordSet && !sessionStorage.getItem('devcontrol-vault-session')) {
          setIsGlobalLocked(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleGlobalUnlock = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:42424/api/verify-master-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: globalPassword })
      });
      if (res.ok) {
        sessionStorage.setItem('devcontrol-vault-session', globalPassword);
        setIsGlobalLocked(false);
        setGlobalError('');
      } else {
        setGlobalError('Access Denied');
        // Shake effect logic could go here
      }
    } catch (err) {
      setGlobalError('System Error');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(null);
  };

  if (isGlobalLocked) {
    return (
      <div className="global-lock-screen" style={{
        position: 'fixed', inset: 0, background: '#0a0a0fa0', backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, color: 'white'
      }}>
        <div className="lock-card" style={{
          background: 'rgba(20, 20, 30, 0.8)', padding: '2rem 3rem', borderRadius: '16px',
          border: '1px solid rgba(0, 255, 255, 0.2)', boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          textAlign: 'center', width: '400px'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 255, 255, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              border: '1px solid rgba(0, 255, 255, 0.3)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#fff' }}>System Locked</h2>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Authentication required for access</p>
          </div>

          <form onSubmit={handleGlobalUnlock}>
            <input
              type="password"
              value={globalPassword}
              onChange={(e) => setGlobalPassword(e.target.value)}
              placeholder="Master Password"
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.3)', color: 'white', marginBottom: '1rem',
                outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem'
              }}
              autoFocus
            />
            {globalError && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{globalError}</div>}
            <button type="submit" style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-blue))',
              color: '#000', fontWeight: '600', cursor: 'pointer', fontSize: '1rem'
            }}>
              Unlock System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout
      onNewProjectClick={() => setIsModalOpen(true)}
      currentView={currentView}
      setCurrentView={setCurrentView}
      projects={projects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={setSelectedProjectId}
    >
      <div className="view-container">
        {currentView === 'dashboard' && (
          <DashboardView
            projects={projects}
            onProjectClick={(id) => {
              setSelectedProjectId(id);
              setCurrentView('manager');
            }}
          />
        )}


        {currentView === 'manager' && (
          <ManagerInterface
            activeProjectId={selectedProjectId}
            availableProjects={projects}
            onLaunchConsole={(id) => {
              fetch('http://localhost:42424/api/launch-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id })
              });
            }}
          />
        )}

        {currentView === 'projects' && (
          <ProjectListView
            projects={projects}
            onNewProjectClick={() => setIsModalOpen(true)}
            onLaunchConsole={(id) => {
              fetch('http://localhost:42424/api/launch-console', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id })
              });
            }}
          />
        )}

        {currentView === 'documentation' && (
          <DocumentationView />
        )}

        {currentView === 'settings' && (
          <SettingsView projects={projects} />
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
