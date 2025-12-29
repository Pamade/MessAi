import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';
import TemplatesTab from './TemplatesTab';

const GlobalStyles = () => (
    <style>{`
        /* Templates Tab */
        .templates-tab {
            padding: 10px;
        }

        .template-form {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .template-form input,
        .template-form textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #fff;
            color: #333;
        }

        .template-form textarea {
            min-height: 80px;
            resize: vertical;
        }

        .template-form button {
            align-self: flex-start;
        }

        .templates-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .template-item {
            background-color: #f9f9f9;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .template-item h4 {
            margin-top: 0;
            margin-bottom: 5px;
            font-size: 16px;
            color: #333;
        }

        .template-item p {
            margin: 0 0 15px;
            font-size: 14px;
            color: #555;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .template-item .actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .template-item .actions button {
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .template-item .actions .insert-btn {
            background-color: #4285F4;
            color: white;
        }
        .template-item .actions .insert-btn:hover {
            background-color: #357ae8;
        }

        .template-item .actions .edit-btn {
            background-color: #f0ad4e;
            color: white;
        }
        .template-item .actions .edit-btn:hover {
            background-color: #ec9b2e;
        }

        .template-item .actions .delete-btn {
            background-color: #d9534f;
            color: white;
        }
        .template-item .actions .delete-btn:hover {
            background-color: #c9302c;
        }

        .custom-tone-form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
        }

        .custom-tone-form h3 {
            margin-top: 0;
        }

        .custom-tone-form input,
        .custom-tone-form textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .custom-tone-form textarea {
            min-height: 60px;
        }

        .custom-tone-form .form-actions {
            display: flex;
            gap: 10px;
        }
    `}</style>
);


type Tab = 'tones' | 'commands' | 'settings' | 'history' | 'templates';

const TONES = [
    { id: 'default', label: '📝 Default', description: 'Balanced, helpful, clear', systemInstruction: 'You are a helpful, balanced AI assistant. Respond clearly and accurately.' },
    { id: 'honest', label: '✅ Honest', description: 'Direct, truthful, no sugarcoating', systemInstruction: 'You are an honest AI assistant. Be direct and truthful, even if uncomfortable.' },
    { id: 'friendly', label: '😊 Friendly', description: 'Warm, approachable, conversational', systemInstruction: 'You are a warm and friendly AI assistant. Respond in a conversational, approachable tone.' },
    { id: 'weird', label: '🎭 Weird', description: 'Quirky, unconventional, playful', systemInstruction: 'You are a quirky and unconventional AI assistant. Be creative, playful, and unexpected.' },
    { id: 'nerd', label: '🤓 Nerd', description: 'Technical, detailed, enthusiastic', systemInstruction: 'You are an enthusiastic nerd. Dive deep into technical details with passion and expertise.' },
    { id: 'cynic', label: '🤨 Cynic', description: 'Skeptical, sarcastic, critical', systemInstruction: 'You are a cynical AI assistant. Be skeptical, sarcastic, and critically minded.' },
];

const COMMANDS = [
    {
        command: '/help',
        description: 'Show all available commands',
        usage: '/help',
        example: '/help',
    },
    {
        command: '/tone <name>',
        description: 'Change AI response tone',
        usage: '/tone <tone_name>',
        example: '/tone friendly',
        notes: 'Valid tones: default, honest, friendly, weird, nerd, cynic',
    }
];

function CommandsTab() {
    const [expandedCommand, setExpandedCommand] = useState<string | null>(null);

    const toggleExpand = (command: string) => {
        if (expandedCommand === command) {
            setExpandedCommand(null);
        } else {
            setExpandedCommand(command);
        }
    };

    const getHelpContent = () => {
        return `Available Commands:

/help - Show this help message
/tone <name> - Change AI response tone (default, honest, friendly, weird, nerd, cynic)
/settings - Open extension settings (click extension icon)

Example: /tone friendly`;
    };

    return (
        <div className="commands-tab">
            <p className="instructions">Click a command to see details or use it in Messenger chat:</p>
            <div className="commands-list">
                <div
                    className={`command-item clickable ${expandedCommand === '/help' ? 'expanded' : ''}`}
                    onClick={() => toggleExpand('/help')}
                >
                    <div className="command-header">
                        <code className="command-name">/help</code>
                    </div>
                    <div className="command-description">{COMMANDS[0].description}</div>
                    {expandedCommand === '/help' && (
                        <div className="command-help-content">
                            <pre>{getHelpContent()}</pre>
                        </div>
                    )}
                    <div className="command-example">
                        <strong>Example:</strong> <code>{COMMANDS[0].example}</code>
                    </div>
                </div>

                <div
                    className={`command-item clickable ${expandedCommand === '/tone' ? 'expanded' : ''}`}
                    onClick={() => toggleExpand('/tone')}
                >
                    <div className="command-header">
                        <code className="command-name">/tone &lt;name&gt;</code>
                    </div>
                    <div className="command-description">{COMMANDS[1].description}</div>
                    {expandedCommand === '/tone' && (
                        <div className="command-help-content">
                            <div className="command-usage">
                                <strong>Usage:</strong> <code>{COMMANDS[1].usage}</code>
                            </div>
                            <div className="command-example">
                                <strong>Example:</strong> <code>{COMMANDS[1].example}</code>
                            </div>
                            <div className="command-notes">{COMMANDS[1].notes}</div>
                            <div className="available-tones">
                                <strong>Available tones:</strong>
                                <div className="tones-list">
                                    {TONES.map(tone => (
                                        <div key={tone.id} className="tone-option">
                                            <span className="tone-emoji">{tone.label.split(' ')[0]}</span>
                                            <span className="tone-name">{tone.id}</span>
                                            <span className="tone-desc">{tone.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="footer">
                <p className="tip">💡 Click commands to expand details, or use buttons to execute in chat.</p>
            </div>
        </div>
    );
}

interface HistoryItem {
    id: string;
    prompt: string;
    tone: string;
    timestamp: number;
    response?: string;
    responseFormat: string;
}

function HistoryTab({ allTones, selectedChat, openChats }: { allTones: any[], selectedChat: number | null, openChats: any[] }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTone, setFilterTone] = useState<string>('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadHistory();

        // Listen for storage changes to update history in real-time
        const listener = (changes: any, areaName: string) => {
            if (areaName === 'local' && changes.promptHistory) {
                setHistory(changes.promptHistory.newValue || []);
            }
        };

        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const loadHistory = () => {
        // Read directly from storage for better reliability
        chrome.storage.local.get(['promptHistory'], (result: any) => {
            if (result.promptHistory) {
                setHistory(result.promptHistory);
            } else {
                setHistory([]);
            }
        });
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            chrome.storage.local.set({ promptHistory: [] }, () => {
                setHistory([]);
            });
        }
    };

    const copyText = (text: string, type: 'prompt' | 'response') => {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`✓ ${type === 'prompt' ? 'Prompt' : 'Response'} copied!`);
        });
    };

    const useAgain = (text: string) => {
        const tabId = selectedChat || (openChats.length > 0 ? openChats[0].id : null);
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {
                type: 'INSERT_TEXT',
                text: text,
            });
        }
    };

    const showNotification = (message: string) => {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'copy-notification';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    };

    const toggleExpand = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getToneLabel = (toneId: string) => {
        const tone = allTones.find(t => t.id === toneId);
        return tone ? tone.label : toneId;
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = !searchTerm || item.prompt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTone = !filterTone || item.tone === filterTone;
        return matchesSearch && matchesTone;
    });

    return (
        <div className="history-tab">
            <div className="history-controls">
                <input
                    type="text"
                    className="history-search"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="history-filter"
                    value={filterTone}
                    onChange={(e) => setFilterTone(e.target.value)}
                >
                    <option value="">All tones</option>
                    {allTones.map(tone => (
                        <option key={tone.id} value={tone.id}>{tone.label}</option>
                    ))}
                </select>
                {history.length > 0 && (
                    <button className="btn-clear-history" onClick={clearHistory}>
                        Clear All
                    </button>
                )}
            </div>

            {filteredHistory.length === 0 ? (
                <div className="history-empty">
                    {history.length === 0 ? (
                        <p>No history yet. Start chatting to see your prompts here!</p>
                    ) : (
                        <p>No prompts match your search.</p>
                    )}
                </div>
            ) : (
                <div className="history-list">
                    {filteredHistory.map((item) => {
                        const isExpanded = expandedItems.has(item.id);
                        const responsePreview = item.response ? (item.response.length > 150 ? item.response.substring(0, 150) + '...' : item.response) : null;
                        const showFullResponse = isExpanded && item.response;

                        return (
                            <div key={item.id} className="history-item">
                                <div className="history-item-header">
                                    <span className="history-tone-badge">{getToneLabel(item.tone)}</span>
                                    <span className="history-timestamp">{formatTimestamp(item.timestamp)}</span>
                                </div>
                                <div className="history-prompt-section">
                                    <div className="history-prompt">{item.prompt}</div>
                                    <button
                                        className="history-copy-btn small"
                                        onClick={() => copyText(item.prompt, 'prompt')}
                                        title="Copy prompt"
                                    >
                                        📋
                                    </button>
                                    <button
                                        className="history-use-again-btn small"
                                        onClick={() => useAgain(item.prompt)}
                                        title="Use again"
                                    >
                                        🔄
                                    </button>
                                </div>
                                {item.response && (
                                    <div className="history-response-section">
                                        <div
                                            className={`history-response ${isExpanded ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            {showFullResponse ? item.response : responsePreview}
                                            {item.response.length > 150 && (
                                                <span className="expand-indicator">
                                                    {isExpanded ? ' (Click to collapse)' : ' (Click to expand)'}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            className="history-copy-btn small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyText(item.response || '', 'response');
                                            }}
                                            title="Copy response"
                                        >
                                            📋
                                        </button>
                                        <button
                                            className="history-use-again-btn small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                useAgain(item.response || '');
                                            }}
                                            title="Use again"
                                        >
                                            🔄
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface SettingsTabProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
}

function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [showApiKey, setShowApiKey] = useState(false);
    const [model, setModel] = useState(settings.model || 'gemini-2.5-flash');
    const [commandPrefix, setCommandPrefix] = useState(settings.commandPrefix || 'prompt:');
    const [responseFormat, setResponseFormat] = useState(settings.responseFormat || 'separate');
    const [models, setModels] = useState<any[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        // Load models
        chrome.runtime.sendMessage({ type: 'GET_MODELS' }, (response: any) => {
            if (response?.success && response.models) {
                setModels(response.models);
            }
        });
    }, []);

    const handleSave = () => {
        setSaveStatus('saving');
        const newSettings = {
            apiKey: apiKey.trim(),
            model,
            commandPrefix: commandPrefix.trim(),
            responseFormat,
        };

        chrome.runtime.sendMessage(
            { type: 'UPDATE_SETTINGS', settings: newSettings },
            (response: any) => {
                if (response?.success) {
                    setSaveStatus('success');
                    onSettingsChange(newSettings);
                    setTimeout(() => setSaveStatus('idle'), 2000);
                } else {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                }
            }
        );
    };

    const handleReset = () => {
        setApiKey('');
        setModel('gemini-2.5-flash');
        setCommandPrefix('prompt:');
        setResponseFormat('separate');
    };

    return (
        <div className="settings-tab">
            <div className="settings-form">
                <div className="setting-group">
                    <label htmlFor="api-key">API Key</label>
                    <div className="input-with-toggle">
                        <input
                            id="api-key"
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key"
                        />
                        <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowApiKey(!showApiKey)}
                        >
                            {showApiKey ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    <small>Leave empty to use default key</small>
                </div>

                <div className="setting-group">
                    <label htmlFor="model">Model</label>
                    <select
                        id="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    >
                        {models.length > 0 ? (
                            models.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                <option value="gemini-pro">Gemini Pro</option>
                            </>
                        )}
                    </select>
                </div>

                <div className="setting-group">
                    <label htmlFor="prefix">Command Prefix</label>
                    <input
                        id="prefix"
                        type="text"
                        value={commandPrefix}
                        onChange={(e) => setCommandPrefix(e.target.value)}
                        placeholder="prompt:"
                    />
                    <small>The prefix to trigger AI responses (e.g., "prompt:")</small>
                </div>

                <div className="setting-group">
                    <label>Response Format</label>
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="responseFormat"
                                value="separate"
                                checked={responseFormat === 'separate'}
                                onChange={(e) => setResponseFormat(e.target.value)}
                            />
                            <span>Separate message (send original + AI response)</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="responseFormat"
                                value="edit"
                                checked={responseFormat === 'edit'}
                                onChange={(e) => setResponseFormat(e.target.value)}
                            />
                            <span>Edit original (replace command with response)</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="responseFormat"
                                value="both"
                                checked={responseFormat === 'both'}
                                onChange={(e) => setResponseFormat(e.target.value)}
                            />
                            <span>Both (send original, then response)</span>
                        </label>
                    </div>
                </div>

                <div className="settings-actions">
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? '✓ Saved' : 'Save Settings'}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleReset}
                    >
                        Reset to Defaults
                    </button>
                </div>

                {saveStatus === 'error' && (
                    <div className="error-message">Failed to save settings. Please try again.</div>
                )}
            </div>
        </div>
    );
}

function Popup() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('tones');
    const [settings, setSettings] = useState<any>({
        apiKey: '',
        model: 'gemini-2.5-flash',
        commandPrefix: 'gemini:',
        responseFormat: 'separate',
    });
    const [customTones, setCustomTones] = useState<any[]>([]);
    const [showCustomToneForm, setShowCustomToneForm] = useState(false);
    const [newToneName, setNewToneName] = useState('');
    const [newToneInstruction, setNewToneInstruction] = useState('');
    const [openChats, setOpenChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<number | null>(null);

    // Load selected preset and settings from storage on mount
    useEffect(() => {
        chrome.storage.local.get(['selectedPresetId', 'customTones'], (result: any) => {
            if (result.selectedPresetId) {
                setSelectedId(result.selectedPresetId);
            }
            if (result.customTones) {
                setCustomTones(result.customTones);
            }
        });

        // Load settings
        chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response: any) => {
            if (response?.success && response.settings) {
                setSettings(response.settings);
            }
        });

        // Listen for tone updates from content script
        const listener = (request: any) => {
            if (request.type === 'TONE_UPDATED' && request.presetId) {
                setSelectedId(request.presetId);
            }
        };
        chrome.runtime.onMessage.addListener(listener);

        // Fetch open chats
        chrome.runtime.sendMessage({ type: 'GET_OPEN_CHATS' }, (response: any) => {
            if (response?.success && response.chats) {
                setOpenChats(response.chats);
                if (response.chats.length > 0) {
                    setSelectedChat(response.chats[0].id);
                }
            }
        });

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        };
    }, []);

    const handlePresetClick = (id: string) => {
        setSelectedId(id);
        // Save to storage
        chrome.storage.local.set({ selectedPresetId: id });

        // Try to send message to content script if on Messenger tab
        const tabId = selectedChat || (openChats.length > 0 ? openChats[0].id : null);
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {
                type: 'UPDATE_SYSTEM_INSTRUCTION',
                presetId: id,
            }).catch(() => {
                // Silently fail if not on a Messenger tab
                console.log('Popup: Not on a Messenger tab or content script not loaded');
            });
        }
    };

    const handleAddCustomTone = () => {
        if (!newToneName || !newToneInstruction) return;
        const newTone = {
            id: `custom-${Date.now()}`,
            label: newToneName,
            description: newToneInstruction.substring(0, 50) + (newToneInstruction.length > 50 ? '...' : ''),
            systemInstruction: newToneInstruction,
        };
        const updatedCustomTones = [...customTones, newTone];
        setCustomTones(updatedCustomTones);
        chrome.storage.local.set({ customTones: updatedCustomTones });
        setShowCustomToneForm(false);
        setNewToneName('');
        setNewToneInstruction('');
    };

    const allTones = [...TONES, ...customTones];

    // Get current tone label
    const currentTone = selectedId ? allTones.find(t => t.id === selectedId) : null;

    return (
        <div className="popup-container">
            <GlobalStyles />
            <div className="popup-header">
                <div className="header-left">
                    <h1>🤖 Messenger AI</h1>
                    {currentTone && (
                        <div
                            className="tone-indicator"
                            onClick={() => setActiveTab('tones')}
                            title="Click to change tone"
                        >
                            <span className="tone-indicator-label">Current:</span>
                            <span className="tone-indicator-value">{currentTone.label}</span>
                        </div>
                    )}
                </div>
                <div className="chat-selector">
                    <select
                        value={selectedChat || ''}
                        onChange={(e) => setSelectedChat(Number(e.target.value))}
                    >
                        {openChats.map(chat => (
                            <option key={chat.id} value={chat.id}>
                                {chat.title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="popup-tabs">
                <button
                    className={`tab-btn ${activeTab === 'tones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tones')}
                >
                    Tones
                </button>
                <button
                    className={`tab-btn ${activeTab === 'commands' ? 'active' : ''}`}
                    onClick={() => setActiveTab('commands')}
                >
                    Commands
                </button>
                <button
                    className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('templates')}
                >
                    Templates
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <div className="popup-content">
                {activeTab === 'tones' && (
                    <>
                        <p className="instructions">Select a tone for AI responses:</p>
                        <div className="presets-grid">
                            {allTones.map((tone) => (
                                <button
                                    key={tone.id}
                                    className={`preset-btn ${selectedId === tone.id ? 'selected' : ''}`}
                                    onClick={() => handlePresetClick(tone.id)}
                                    title={tone.systemInstruction}
                                >
                                    <div className="tone-label">{tone.label}</div>
                                    <div className="tone-description">{tone.description}</div>
                                </button>
                            ))}
                             <button className="preset-btn add-new" onClick={() => setShowCustomToneForm(true)}>
                                +
                            </button>
                        </div>
                        {showCustomToneForm && (
                            <div className="custom-tone-form">
                                <h3>Add Custom Tone</h3>
                                <input
                                    type="text"
                                    placeholder="Tone Name (e.g., MyBrand Voice)"
                                    value={newToneName}
                                    onChange={(e) => setNewToneName(e.target.value)}
                                />
                                <textarea
                                    placeholder="System Instruction (e.g., You are the social media voice for...)"
                                    value={newToneInstruction}
                                    onChange={(e) => setNewToneInstruction(e.target.value)}
                                />
                                <div className="form-actions">
                                    <button className="btn-primary" onClick={handleAddCustomTone}>Add Tone</button>
                                    <button className="btn-secondary" onClick={() => setShowCustomToneForm(false)}>Cancel</button>
                                </div>
                            </div>
                        )}
                        <div className="footer">
                            <p className="tip">💡 Type <code>{settings.commandPrefix || 'gemini:'} your prompt</code> in chat</p>
                        </div>
                    </>
                )}

                {activeTab === 'commands' && <CommandsTab />}

                {activeTab === 'history' && <HistoryTab allTones={allTones} selectedChat={selectedChat} openChats={openChats} />}

                {activeTab === 'templates' && <TemplatesTab selectedChat={selectedChat} openChats={openChats} />}

                {activeTab === 'settings' && (
                    <SettingsTab settings={settings} onSettingsChange={setSettings} />
                )}
            </div>
        </div>
    );
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Popup />);
}
