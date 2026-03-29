import React, { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, Trash2, PlusSquare, Sparkles, AlertCircle, Rocket,
    RefreshCw, Copy, Check, Brain, Mic, MicOff, Volume2, VolumeX, Settings2,
    Shield, FileText, ChevronRight, Book, ExternalLink, Code, BarChart2, MoreVertical, Lock
} from 'lucide-react';
import ProjectVault from './ProjectVault';
import DeleteProjectModal from './DeleteProjectModal';
import Markdown from 'react-markdown';
import '../styles/ManagerInterface.css';

const ManagerInterface = ({ activeProjectId, availableProjects, onLaunchConsole }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [systemContext, setSystemContext] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dispatchingId, setDispatchingId] = useState(null);
    const [copyingId, setCopyingId] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isAutoSpeak, setIsAutoSpeak] = useState(() => {
        return localStorage.getItem('devcontrol-auto-speak') === 'true';
    });
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState(() => {
        return localStorage.getItem('devcontrol-selected-voice') || '';
    });
    const [voiceSpeed, setVoiceSpeed] = useState(() => {
        const saved = localStorage.getItem('devcontrol-voice-speed');
        return saved ? parseFloat(saved) : 1.0;
    });
    const [voiceType, setVoiceType] = useState(() => {
        return localStorage.getItem('devcontrol-voice-type') || 'system';
    });
    const [aiVoiceId, setAiVoiceId] = useState(() => {
        return localStorage.getItem('devcontrol-ai-voice-id') || 'alloy';
    });
    const [azureVoiceId, setAzureVoiceId] = useState(() => {
        return localStorage.getItem('devcontrol-azure-voice-id') || 'en-US-JennyNeural';
    });
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);
    const lastSpokenIdRef = useRef(null);
    const [activeSubView, setActiveSubView] = useState('overview'); // Changed default to 'overview'
    const [projectDocs, setProjectDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const audioRef = useRef(new Audio());
    const isRecordingRef = useRef(false);

    // Sync ref with state for use in global event listeners
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    const loadHistory = async (projectId) => {
        const id = projectId || activeProjectId;
        try {
            const res = await fetch(`http://localhost:42424/api/manager-history?projectId=${id}&t=${Date.now()}`);
            const history = await res.json();
            setMessages(history || []);
        } catch (e) {
            console.error("Failed to load manager history", e);
            setMessages([]);
        }
    };

    const loadContext = async (isManual = false, projectId) => {
        if (isManual) setIsRefreshing(true);
        const targetId = projectId || activeProjectId;
        try {
            const res = await fetch(`http://localhost:42424/api/project-status?projectId=${targetId}&t=${Date.now()}`);
            const text = await res.text();
            setSystemContext(text);
        } catch (e) {
            console.error("Failed to load project status", e);
        } finally {
            if (isManual) setIsRefreshing(false);
        }
    };

    // React to global project switch
    useEffect(() => {
        const sync = async () => {
            setMessages([]); // Visual clear
            await loadHistory(activeProjectId);
            await loadContext(false, activeProjectId);
            await loadProjectDocs(activeProjectId);
        };
        sync();
    }, [activeProjectId]);

    const loadProjectDocs = async (projectId) => {
        const id = projectId || activeProjectId;
        const project = availableProjects.find(p => String(p.id) === String(id));
        if (!project) return;

        try {
            const res = await fetch('http://localhost:42424/api/documentation');
            const allDocs = await res.json();

            // Filter docs belonging to this project (or System docs)
            const filtered = allDocs.filter(d =>
                d.project === project.title || d.project === 'DevControl'
            );

            setProjectDocs(filtered);
            if (filtered.length > 0) setSelectedDoc(filtered[0]);
        } catch (e) {
            console.error("Failed to load project docs", e);
        }
    };

    // Voice Discovery
    useEffect(() => {
        const synth = window.speechSynthesis;
        let retryCount = 0;

        const updateVoices = () => {
            const voices = synth.getVoices();
            if (voices.length > 0) {
                console.log(`[Voice] Discovered ${voices.length} identities:`);
                voices.forEach((v, idx) => console.log(`  ${idx + 1}. ${v.name} (${v.lang})`));
                setAvailableVoices(voices);

                // If no voice is selected yet, or our selected voice is gone, pick a default
                if (!selectedVoiceURI || !voices.find(v => v.voiceURI === selectedVoiceURI)) {
                    const def = voices.find(v => v.lang.startsWith('en-US')) ||
                        voices.find(v => v.lang.startsWith('en')) ||
                        voices[0];
                    if (def) {
                        console.log(`[Voice] Auto-selecting identity: ${def.name}`);
                        setSelectedVoiceURI(def.voiceURI);
                    }
                }
                return true;
            }
            return false;
        };

        // Try immediately
        updateVoices();

        // Some browsers load voices asynchronously
        const interval = setInterval(() => {
            if (updateVoices() || retryCount > 10) {
                clearInterval(interval);
            }
            retryCount++;
        }, 500);

        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = updateVoices;
        }

        return () => clearInterval(interval);
    }, [selectedVoiceURI]);

    // Pre-warm speech engine on mount
    useEffect(() => {
        const synth = window.speechSynthesis;
        const warmup = new SpeechSynthesisUtterance("");
        synth.speak(warmup);
        synth.cancel();
        console.log("[Voice] Synthesis engine pre-warmed.");
    }, []);

    useEffect(() => {
        localStorage.setItem('devcontrol-selected-voice', selectedVoiceURI);
    }, [selectedVoiceURI]);

    useEffect(() => {
        localStorage.setItem('devcontrol-voice-speed', voiceSpeed);
    }, [voiceSpeed]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        // Auto-speak last message if it's from assistant and auto-speak is on
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && isAutoSpeak && !isLoading && lastSpokenIdRef.current !== lastMsg.id) {
            lastSpokenIdRef.current = lastMsg.id;
            speak(lastMsg.content);
        }
    }, [messages, isAutoSpeak, isLoading]);

    useEffect(() => {
        localStorage.setItem('devcontrol-auto-speak', isAutoSpeak);
    }, [isAutoSpeak]);

    useEffect(() => {
        localStorage.setItem('devcontrol-voice-type', voiceType);
    }, [voiceType]);

    useEffect(() => {
        localStorage.setItem('devcontrol-ai-voice-id', aiVoiceId);
    }, [aiVoiceId]);

    useEffect(() => {
        localStorage.setItem('devcontrol-azure-voice-id', azureVoiceId);
    }, [azureVoiceId]);

    // Keyboard Shortcut: Alt + V to toggle recording
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Check for Alt + V
            if (e.altKey && e.code === 'KeyV') {
                e.preventDefault();
                console.log("[Keyboard] Toggle Recording triggered");
                if (isRecordingRef.current) {
                    stopRecording();
                } else {
                    startRecording();
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    const speak = async (text) => {
        if (!text) return;

        console.log(`[Voice] Attempting to speak (${voiceType}): "${text.substring(0, 50)}..."`);

        // Cancel any ongoing speech (both systems)
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }

        // Basic cleanup of markdown for cleaner speech
        const cleanText = text.replace(/[#*`_]/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

        if (voiceType === 'system') {
            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Use the selected voice
            const voices = window.speechSynthesis.getVoices();
            let voice = voices.find(v => v.voiceURI === selectedVoiceURI);

            if (!voice && voices.length > 0) {
                console.warn(`[Voice] Selected voice ${selectedVoiceURI} not found. Falling back.`);
                voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
            }

            if (voice) {
                console.log(`[Voice] Using identity: ${voice.name} (${voice.lang})`);
                utterance.voice = voice;
                utterance.lang = voice.lang;
            }

            utterance.rate = voiceSpeed;
            utterance.onstart = () => console.log("[Voice] System Speech started.");
            utterance.onerror = (e) => console.error("[Voice] System Speech error:", e);
            window.speechSynthesis.speak(utterance);
        } else {
            try {
                const response = await fetch('http://localhost:42424/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: cleanText, voice: aiVoiceId })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "TTS API Error");
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                audioRef.current.src = url;
                audioRef.current.playbackRate = voiceSpeed;
                audioRef.current.play();
                console.log(`[Voice] AI Speech started (${aiVoiceId})`);

            } catch (e) {
                console.error("[Voice] AI Speech critical error:", e);
                console.warn("[Voice] Falling back to system voice for this message.");

                // Fallback to system voice WITHOUT recursion
                const utterance = new SpeechSynthesisUtterance(cleanText);
                const voices = window.speechSynthesis.getVoices();
                const fallbackVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];

                if (fallbackVoice) {
                    utterance.voice = fallbackVoice;
                    utterance.lang = fallbackVoice.lang;
                }

                utterance.rate = voiceSpeed;
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    const toggleAudio = () => {
        const newState = !isAutoSpeak;
        setIsAutoSpeak(newState);
        if (!newState) {
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size > 100) { // Only send if there's actual audio data
                    await handleSpeechToText(audioBlob);
                } else {
                    console.warn("Recording too short/empty, skipping STT.");
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Please allow microphone access to use voice-to-text.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks in the stream
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSpeechToText = async (audioBlob) => {
        const startTime = Date.now();
        console.log(`[STT] Starting transcription. Audio size: ${audioBlob.size} bytes`);

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const fetchStart = Date.now();
            const res = await fetch('http://localhost:42424/api/stt', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            const totalTime = Date.now() - startTime;
            const apiTime = Date.now() - fetchStart;

            console.log(`[STT] Transcription complete in ${totalTime}ms (API: ${apiTime}ms)`);

            if (data.text) {
                console.log(`[STT] Result: "${data.text}"`);
                setInput(data.text);
            } else {
                console.warn("[STT] No text returned from API");
            }
        } catch (e) {
            console.error("STT Failed:", e);
            alert("Voice transcription failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDispatch = async (content, idx) => {
        setDispatchingId(idx);
        try {
            const res = await fetch('http://localhost:42424/api/send-instruction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instruction: content, projectId: activeProjectId })
            });
            const data = await res.json();
            if (data.success) {
                // Paste the instruction directly into the chat input
                setInput(`📋 **Instruction from Manager:**\n\n${content}`);
                console.log("Instruction pasted into chat.");
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            alert("Failed to dispatch: " + e.message);
        } finally {
            setDispatchingId(null);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = { id: `user-${Date.now()}`, role: 'user', content: input };
        const currentMessages = messages;
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Signal server to START autopilot session (Ghost Finger Active)
            await fetch('http://localhost:42424/api/autopilot-session/start', { method: 'POST' }).catch(() => { });

            let currentContext = systemContext;
            try {
                const res = await fetch(`http://localhost:42424/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
                const text = await res.text();
                currentContext = text;
                setSystemContext(text);
            } catch (e) {
                console.warn("Context refresh failed, using cached:", e);
            }

            const historyToSend = [...currentMessages, userMsg];

            const response = await fetch('http://localhost:42424/api/manager-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: historyToSend,
                    context: currentContext,
                    projectId: activeProjectId
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Server rejected request');
            }

            const data = await response.json();
            const botMsgId = data.id || `bot-${Date.now()}`;
            const botMsg = { id: botMsgId, role: 'assistant', content: data.reply };

            // Optimization: Trigger speech BEFORE render finishes for lower perceived latency
            if (isAutoSpeak) {
                lastSpokenIdRef.current = botMsgId;
                speak(data.reply);
            }

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error('Error during send:', error);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `**Error**: ${error.message}`
            }]);
        } finally {
            setIsLoading(false);
            // We NO LONGER stop the session here, because it might kill a background agent task.
            // The 10-minute server-side timeout manages the safety lock.
        }
    };

    const handleCopy = async (content, id) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyingId(id);
            setTimeout(() => setCopyingId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const [isAppraising, setIsAppraising] = useState(false);

    const handleAppraise = async () => {
        setIsAppraising(true);
        try {
            // 1. Get current status as the basis for appraisal
            const statusRes = await fetch(`http://localhost:42424/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
            const statusText = await statusRes.text();

            // 2. Call the appraisal injection endpoint
            const res = await fetch('http://localhost:42424/api/manager-appraisal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: activeProjectId,
                    appraisal: `Hello Manager. I am initiating a Strategic Self-Audit based on the current project vectors.\n\n**Agent Appraisal Basis:**\n${statusText}`
                })
            });

            const data = await res.json();
            if (data.success) {
                // Reload history to show the injection and the response
                await loadHistory(activeProjectId);
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            alert("Appraisal Bridge failed: " + e.message);
        } finally {
            setIsAppraising(false);
        }
    };

    const handleGlobalSync = async () => {
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
        if (!lastAssistantMsg) {
            alert("No instructions found to sync. Chat with the manager first.");
            return;
        }

        setIsRefreshing(true);
        try {
            const res = await fetch('http://localhost:42424/api/sync-instructions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instructions: lastAssistantMsg.content })
            });
            const data = await res.json();
            if (data.success) {
                console.log(`🚀 Synchronization Complete! Instructions pushed to ${data.synced} projects.`);
            }
        } catch (e) {
            alert("Sync Bridge failed: " + e.message);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNewSession = async () => {
        if (!window.confirm("Start a new session for this project? history will be archived.")) return;
        try {
            await fetch(`http://localhost:42424/api/manager-history?projectId=${activeProjectId}`, { method: 'DELETE' });
            setMessages([]);
            await loadContext(false, activeProjectId);
        } catch (e) {
            console.error("Failed to clear session", e);
            setMessages([]);
        }
    };

    const handleDeleteProject = async (id, mode, confirmName) => {
        try {
            const res = await fetch(`http://localhost:42424/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, confirmName })
            });
            const data = await res.json();
            if (data.success) {
                window.location.reload();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            console.error('Failed to delete project:', err);
            throw err;
        }
    };

    const handleKillPort = async (port) => {
        if (!process.env.NODE_ENV && !window.confirm(`Force kill process on port ${port}? This may lose unsaved data.`)) return;

        try {
            const res = await fetch('http://localhost:42424/api/kill-port', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ port, projectId: activeProjectId })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Port ${port} cleared successfully.`);
            } else {
                alert(`Failed: ${data.error}`);
            }
        } catch (e) {
            console.error("Kill port failed", e);
        }
    };


    const handleOpenExplorer = async (path) => {
        try {
            await fetch('http://localhost:42424/api/open-explorer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
        } catch (e) {
            console.error("Open explorer failed", e);
        }
    };

    const activeProject = availableProjects.find(p => p.id === activeProjectId) || {};

    return (
        <div className="manager-page animate-fade">
            <header className="page-header">
                <div className="header-meta">
                    <div className="status-badge">
                        <div className="status-dot"></div>
                        MODE: BEYOND-RESCUE (v5.0)
                    </div>
                    <h1>Strategic Command</h1>
                </div>

                <div className="header-actions">
                    <button className="nav-item" onClick={handleGlobalSync} disabled={isRefreshing}>
                        <RefreshCw size={16} className={isRefreshing ? 'rotate-anim' : ''} />
                        <span>Push to All Projects</span>
                    </button>
                    <button className="nav-item" onClick={handleAppraise} disabled={isAppraising}>
                        <Brain size={16} />
                        <span>{isAppraising ? 'Appraising...' : 'Request Appraisal'}</span>
                    </button>
                    <button className="nav-item" onClick={handleNewSession}>
                        <Trash2 size={16} />
                        <span>Reset Session</span>
                    </button>
                </div>
            </header>

            <div className="inner-layout">
                <aside className="inner-sidebar">
                    <button
                        className={`inner-nav-item ${activeSubView === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveSubView('overview')}
                    >
                        <BarChart2 className="nav-icon" size={18} />
                        <span>Overview</span>
                    </button>
                    <button
                        className={`inner-nav-item ${activeSubView === 'knowledge' ? 'active' : ''}`}
                        onClick={() => setActiveSubView('knowledge')}
                    >
                        <Brain className="nav-icon" size={18} />
                        <span>Knowledge Base</span>
                    </button>
                    <button
                        className={`inner-nav-item ${activeSubView === 'technical' ? 'active' : ''}`}
                        onClick={() => setActiveSubView('technical')}
                    >
                        <Shield className="nav-icon" size={18} />
                        <span>Technical Info</span>
                    </button>
                    <button
                        className={`inner-nav-item ${activeSubView === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveSubView('security')}
                    >
                        <Lock className="nav-icon" size={18} />
                        <span>Secure Area</span>
                    </button>
                </aside>

                <main className="inner-view-content">
                    {activeSubView === 'overview' && (
                        <div className="project-overview-panel glass-panel animate-fade">
                            <div className="overview-header">
                                <div className="overview-title">
                                    <div className="overview-icon-bg">
                                        <Rocket size={24} color="var(--neon-cyan)" />
                                    </div>
                                    <div className="title-stack">
                                        <h2>{activeProject.title}</h2>
                                        <p>{activeProject.description}</p>
                                    </div>
                                </div>
                                <span className={`infra-status-pill ${activeProject.status?.toLowerCase()}`}>
                                    {activeProject.status}
                                </span>
                            </div>

                            <div className="overview-grid">
                                <div className="metric-card">
                                    <span className="metric-label">Version control</span>
                                    <span className="metric-value">v{activeProject.version || '1.0.0'}</span>
                                </div>
                                <div className="metric-card" style={{ gridRow: activeProject.ports ? 'span 2' : 'auto' }}>
                                    <span className="metric-label">Port Assignment</span>
                                    <div className="ports-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                                        {activeProject.ports ? (
                                            activeProject.ports.map((p, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '4px' }}>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>{p.label}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className="metric-value font-mono" style={{ fontSize: '0.9rem' }}>{p.value}</span>
                                                        <button
                                                            className="dock-btn danger"
                                                            style={{ padding: '4px', height: '24px', width: '24px', minWidth: 'unset' }}
                                                            onClick={() => handleKillPort(p.value)}
                                                            title={`Kill Port ${p.value}`}
                                                        >
                                                            <VolumeX size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <span className="metric-value">
                                                    {activeProject.monitorUrl ? (activeProject.monitorUrl.match(/:(\d+)/)?.[1] || 'N/A') : 'Local'}
                                                </span>
                                                {activeProject.monitorUrl && activeProject.monitorUrl.match(/:(\d+)/)?.[1] && (
                                                    <button
                                                        className="dock-btn danger"
                                                        style={{ padding: '2px 8px', fontSize: '0.7rem', height: '24px' }}
                                                        onClick={() => handleKillPort(activeProject.monitorUrl.match(/:(\d+)/)[1])}
                                                        title="Kill Process"
                                                    >
                                                        <VolumeX size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">Operational uptime</span>
                                    <span className="metric-value">{activeProject.uptime || '99.9%'}</span>
                                </div>
                                <div
                                    className="metric-card path-card interactive-card"
                                    onClick={() => handleOpenExplorer(activeProject.path)}
                                    title="Click to open in Explorer"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        Deployment path <ExternalLink size={10} opacity={0.6} />
                                    </span>
                                    <div className="path-stack" style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                        <Code size={14} style={{ flexShrink: 0 }} />
                                        <code>{activeProject.path}</code>
                                    </div>
                                </div>
                            </div>

                            <div className="tags-section">
                                <h4 className="section-title">ASSOCIATED VECTORS</h4>
                                <div className="tags-list">
                                    {activeProject.tags?.map(tag => (
                                        <span key={tag} className="infra-tag">#{tag}</span>
                                    )) || <span className="text-muted">No tags assigned</span>}
                                </div>
                            </div>

                            <div className="overview-actions">
                                <button className="dock-btn danger" onClick={() => setProjectToDelete(activeProject)}>
                                    <Trash2 size={18} />
                                    <span>Initiate Deletion</span>
                                </button>
                                <button className="dock-btn primary" onClick={() => {
                                    onLaunchConsole(activeProject.id);
                                    setActiveSubView('knowledge');
                                }}>
                                    <ExternalLink size={18} />
                                    <span>Launch Environment</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSubView === 'knowledge' && (
                        <div className="knowledge-grid">
                            <div className="chat-panel">
                                <div className="chat-history">
                                    {messages.map((msg, idx) => {
                                        const messageId = msg.id || `msg-${idx}`;
                                        return (
                                            <div key={messageId} className={`msg-wrapper ${msg.role}`}>
                                                <div className="msg-avatar">
                                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                                </div>
                                                <div className="msg-bubble">
                                                    <Markdown>{msg.content}</Markdown>

                                                    <div className="message-actions">
                                                        <button
                                                            className="dock-btn"
                                                            onClick={() => handleCopy(msg.content, messageId)}
                                                        >
                                                            <Copy size={12} />
                                                            <span>{copyingId === messageId ? 'Copied' : 'Copy'}</span>
                                                        </button>
                                                        {msg.role === 'assistant' && (
                                                            <button
                                                                className="dock-btn"
                                                                onClick={() => handleDispatch(msg.content, idx)}
                                                            >
                                                                <Rocket size={12} />
                                                                <span>Send to Agent</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isLoading && (
                                        <div className="msg-wrapper assistant">
                                            <div className="msg-avatar"><RefreshCw size={20} className="rotate-anim" /></div>
                                            <div className="msg-bubble" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                Processing strategic vectors...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="input-dock">
                                    <div className="input-container">
                                        <button
                                            className={`dock-btn ${isRecording ? 'active' : ''}`}
                                            onClick={() => isRecording ? stopRecording() : startRecording()}
                                        >
                                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                                        </button>

                                        <textarea
                                            className="msg-input"
                                            placeholder="Initiate directive..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            rows={1}
                                        />

                                        <div className="dock-actions">
                                            <button className="dock-btn" onClick={() => setShowVoiceSettings(!showVoiceSettings)}>
                                                <Settings2 size={18} />
                                            </button>
                                            <button className="dock-btn btn-send" onClick={handleSend} disabled={isLoading}>
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {showVoiceSettings && (
                                        <div className="voice-settings-popover">
                                            <div className="setting-group">
                                                <label>Voice Identity</label>
                                                <select value={selectedVoiceURI} onChange={(e) => setSelectedVoiceURI(e.target.value)}>
                                                    {availableVoices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="doc-management-panel">
                                <div className="doc-panel-header">
                                    <FileText size={18} color="var(--neon-cyan)" />
                                    <h3>Document Management System</h3>
                                </div>
                                <div className="doc-list">
                                    {projectDocs.map(doc => (
                                        <div
                                            key={doc.path}
                                            className={`doc-item ${selectedDoc?.path === doc.path ? 'active' : ''}`}
                                            onClick={() => setSelectedDoc(doc)}
                                        >
                                            <Book size={16} />
                                            <div className="doc-item-info">
                                                <span className="doc-item-name">{doc.name.replace('.md', '')}</span>
                                                <span className="doc-item-meta">{doc.path}</span>
                                            </div>
                                            <ChevronRight size={14} opacity={0.5} />
                                        </div>
                                    ))}
                                </div>
                                {selectedDoc && (
                                    <div className="doc-viewer markdown-content">
                                        <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                            <h2 style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)' }}>{selectedDoc.name}</h2>
                                        </div>
                                        <Markdown>{selectedDoc.content}</Markdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSubView === 'technical' && (
                        <div className="glass-panel animate-fade" style={{ padding: '2rem' }}>
                            <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '1rem' }}>Technical Specifications</h2>
                            <div className="tech-specs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="metric-card">
                                    <span className="metric-label">Node Environment</span>
                                    <span className="metric-value">v20.10.0</span>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">React Version</span>
                                    <span className="metric-value">v18.2.0</span>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">Heap Allocation</span>
                                    <span className="metric-value">1024 MB</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubView === 'security' && (
                        <ProjectVault projectId={activeProjectId} />
                    )}
                </main>
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

export default ManagerInterface;
