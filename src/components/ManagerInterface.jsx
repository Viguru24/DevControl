import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, PlusSquare, Sparkles, AlertCircle, Rocket, RefreshCw, Copy, Check, Brain, Mic, MicOff, Volume2, VolumeX, Settings2 } from 'lucide-react';
import Markdown from 'react-markdown';
import '../styles/ManagerInterface.css';

const ManagerInterface = ({ activeProjectId, availableProjects }) => {
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
    const audioRef = useRef(new Audio());
    const isRecordingRef = useRef(false);

    // Sync ref with state for use in global event listeners
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    const loadHistory = async (projectId) => {
        const id = projectId || activeProjectId;
        try {
            const res = await fetch(`http://localhost:3001/api/manager-history?projectId=${id}&t=${Date.now()}`);
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
            const res = await fetch(`http://localhost:3001/api/project-status?projectId=${targetId}&t=${Date.now()}`);
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
        };
        sync();
    }, [activeProjectId]);

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
                const response = await fetch('http://localhost:3001/api/tts', {
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
            const res = await fetch('http://localhost:3001/api/stt', {
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
            const res = await fetch('http://localhost:3001/api/send-instruction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instruction: content, projectId: activeProjectId })
            });
            const data = await res.json();
            if (data.success) {
                // Paste the instruction directly into the chat input
                setInput(`📋 **Instruction from Manager:**\n\n${content}`);
                alert("Instruction pasted into chat! Review and send when ready.");
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
            let currentContext = systemContext;
            try {
                const res = await fetch(`http://localhost:3001/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
                const text = await res.text();
                currentContext = text;
                setSystemContext(text);
            } catch (e) {
                console.warn("Context refresh failed, using cached:", e);
            }

            const historyToSend = [...currentMessages, userMsg];

            const response = await fetch('http://localhost:3001/api/manager-chat', {
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
            const statusRes = await fetch(`http://localhost:3001/api/project-status?projectId=${activeProjectId}&t=${Date.now()}`);
            const statusText = await statusRes.text();

            // 2. Call the appraisal injection endpoint
            const res = await fetch('http://localhost:3001/api/manager-appraisal', {
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

    const handleNewSession = async () => {
        if (!window.confirm("Start a new session for this project? history will be archived.")) return;
        try {
            await fetch(`http://localhost:3001/api/manager-history?projectId=${activeProjectId}`, { method: 'DELETE' });
            setMessages([]);
            await loadContext(false, activeProjectId);
        } catch (e) {
            console.error("Failed to clear session", e);
            setMessages([]);
        }
    };

    return (
        <div className="manager-container">
            {/* Unified Main Area */}
            <div className="manager-main">
                <div className="chat-header">
                    <div className="header-left">
                        <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>STRATEGIC CORE: ONLINE</span>
                        </div>
                        <div className="active-context-pill">
                            <Rocket size={12} />
                            <span>{availableProjects.find(p => p.id === activeProjectId)?.title || 'UNKNOWN'}</span>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className={`header-btn ${isAppraising ? 'refreshing' : ''}`} onClick={handleAppraise} disabled={isAppraising}>
                            <Brain size={14} className={isAppraising ? 'rotate-anim' : ''} />
                            <span>{isAppraising ? 'APPRAISING...' : 'REQUEST APPRAISAL'}</span>
                        </button>
                        <button className="header-btn" onClick={() => loadContext(true)} disabled={isRefreshing}>
                            <RefreshCw size={14} className={isRefreshing ? 'rotate-anim' : ''} />
                            <span>{isRefreshing ? 'SYNCING...' : 'SYNC'}</span>
                        </button>
                        <button className="header-btn danger" onClick={handleNewSession}>
                            <Trash2 size={14} />
                            <span>NEW SESSION</span>
                        </button>
                    </div>
                </div>

                <div className="messages-area">
                    {messages.map((msg, idx) => {
                        const messageId = msg.id || `msg-${idx}`;
                        return (
                            <div key={messageId} className={`message ${msg.role}`}>
                                <div className={`role-icon ${msg.role}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-bubble">
                                        <Markdown>{msg.content}</Markdown>
                                    </div>

                                    <div className="message-actions">
                                        <button
                                            className="action-btn"
                                            onClick={() => handleCopy(msg.content, messageId)}
                                        >
                                            {copyingId === messageId ? <Check size={14} /> : <Copy size={14} />}
                                            <span>{copyingId === messageId ? 'Copied!' : 'Copy'}</span>
                                        </button>

                                        {msg.role === 'assistant' && (
                                            <button
                                                className="action-btn dispatch-btn"
                                                onClick={() => handleDispatch(msg.content, idx)}
                                                disabled={dispatchingId === idx}
                                            >
                                                <Rocket size={14} />
                                                <span>{dispatchingId === idx ? 'Sending...' : 'Send to Agent'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="role-icon assistant">
                                <Bot size={18} />
                            </div>
                            <div className="message-bubble loading">
                                Analyzing strategy vectors...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                    <div className="input-container">
                        <button
                            className={`voice-btn ${isRecording ? 'active' : ''}`}
                            onClick={() => isRecording ? stopRecording() : startRecording()}
                            title={isRecording ? "Click to stop" : "Click to speak (STT)"}
                        >
                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <textarea
                            className="chat-input"
                            placeholder={isRecording ? "Listening..." : `Message the Manager for ${availableProjects.find(p => p.id === activeProjectId)?.title}...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <div className="input-actions">
                            <div className="voice-settings-wrapper">
                                {showVoiceSettings && (
                                    <div className="voice-settings-popover">
                                        <div className="setting-group">
                                            <label>Voice Engine</label>
                                            <div className="voice-type-toggle">
                                                <button
                                                    className={voiceType === 'system' ? 'active' : ''}
                                                    onClick={() => setVoiceType('system')}
                                                >
                                                    Standard
                                                </button>
                                                <button
                                                    className={voiceType === 'ai' ? 'active' : ''}
                                                    onClick={() => setVoiceType('ai')}
                                                >
                                                    Premium AI
                                                </button>
                                            </div>
                                        </div>

                                        <div className="setting-group">
                                            <label>{voiceType === 'system' ? 'System Identity' : 'AI Persona'}</label>
                                            {voiceType === 'system' ? (
                                                <select
                                                    value={selectedVoiceURI}
                                                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                                >
                                                    {availableVoices.map(v => (
                                                        <option key={v.voiceURI} value={v.voiceURI}>
                                                            {v.name} ({v.lang})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <select
                                                    value={aiVoiceId}
                                                    onChange={(e) => setAiVoiceId(e.target.value)}
                                                >
                                                    <option value="alloy">Alloy (Neutral)</option>
                                                    <option value="echo">Echo (Warm)</option>
                                                    <option value="fable">Fable (British)</option>
                                                    <option value="onyx">Onyx (Deep)</option>
                                                    <option value="nova">Nova (Bright)</option>
                                                    <option value="shimmer">Shimmer (Clear)</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="setting-group">
                                            <div className="label-row">
                                                <label>Speed</label>
                                                <span>{voiceSpeed}x</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2.5"
                                                step="0.1"
                                                value={voiceSpeed}
                                                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <button className="preview-btn" onClick={() => speak("Voice identity verification in progress.")}>
                                            <RefreshCw size={12} /> Test Accent
                                        </button>
                                    </div>
                                )}
                                <button
                                    className={`audio-toggle ${isAutoSpeak ? 'active' : ''}`}
                                    onClick={toggleAudio}
                                    title={isAutoSpeak ? "Auto-Read: ON" : "Auto-Read: OFF"}
                                >
                                    {isAutoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                <button
                                    className={`voice-settings-btn ${showVoiceSettings ? 'active' : ''}`}
                                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                                    title="Voice & Accent Settings"
                                >
                                    <Settings2 size={18} />
                                </button>
                            </div>
                            <button className="send-btn" onClick={handleSend} disabled={isLoading || isRecording}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerInterface;
