import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SettingsTabProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
}

export default function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
    const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
    const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey || '');
    const [anthropicApiKey, setAnthropicApiKey] = useState(settings.anthropicApiKey || '');
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenaiKey, setShowOpenaiKey] = useState(false);
    const [showAnthropicKey, setShowAnthropicKey] = useState(false);
    const [model, setModel] = useState(settings.model || 'gemini-2.0-flash-exp');
    const [commandPrefix, setCommandPrefix] = useState(settings.commandPrefix || 'prompt:');
    const [responseFormat, setResponseFormat] = useState(settings.responseFormat || 'edit');
    const [models, setModels] = useState<any[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'GET_MODELS' }, (response: any) => {
            if (chrome.runtime.lastError) return;
            if (response?.success && response.models) {
                setModels(response.models);
            }
        });
    }, []);

    const handleSave = () => {
        setSaveStatus('saving');
        const newSettings = {
            geminiApiKey: geminiApiKey.trim(),
            openaiApiKey: openaiApiKey.trim(),
            anthropicApiKey: anthropicApiKey.trim(),
            model,
            commandPrefix: commandPrefix.trim(),
            responseFormat,
        };

        chrome.runtime.sendMessage(
            { type: 'UPDATE_SETTINGS', settings: newSettings },
            (response: any) => {
                if (chrome.runtime.lastError) {
                    setSaveStatus('error');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                    return;
                }
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
        const defaults = {
            geminiApiKey: '',
            openaiApiKey: '',
            anthropicApiKey: '',
            model: 'gemini-2.0-flash-exp',
            commandPrefix: 'prompt:',
            responseFormat: 'edit'
        };

        setGeminiApiKey(defaults.geminiApiKey);
        setOpenaiApiKey(defaults.openaiApiKey);
        setAnthropicApiKey(defaults.anthropicApiKey);
        setModel(defaults.model);
        setCommandPrefix(defaults.commandPrefix);
        setResponseFormat(defaults.responseFormat);

        chrome.runtime.sendMessage(
            { type: 'UPDATE_SETTINGS', settings: defaults },
            (response: any) => {
                if (response?.success) {
                    onSettingsChange(defaults);
                }
            }
        );
    };

    return (
        <div className="settings-tab">
            <div className="settings-form">
                <div className="setting-group">
                    <label htmlFor="gemini-key">Gemini API Key (Free)</label>
                    <div className="input-with-toggle">
                        <input
                            id="gemini-key"
                            type={showGeminiKey ? 'text' : 'password'}
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key"
                        />
                        <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                        >
                            {showGeminiKey ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                    <small>Get free at <a href="https://aistudio.google.com/apikey" target="_blank" style={{ color: '#2563eb' }}>Google AI Studio</a></small>
                </div>

                <div className="setting-group">
                    <label htmlFor="openai-key">OpenAI API Key (Paid)</label>
                    <div className="input-with-toggle">
                        <input
                            id="openai-key"
                            type={showOpenaiKey ? 'text' : 'password'}
                            value={openaiApiKey}
                            onChange={(e) => setOpenaiApiKey(e.target.value)}
                            placeholder="Enter your OpenAI API key"
                        />
                        <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                        >
                            {showOpenaiKey ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                    <small>Get at <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: '#2563eb' }}>OpenAI Platform</a></small>
                </div>

                <div className="setting-group">
                    <label htmlFor="anthropic-key">Anthropic API Key (Paid)</label>
                    <div className="input-with-toggle">
                        <input
                            id="anthropic-key"
                            type={showAnthropicKey ? 'text' : 'password'}
                            value={anthropicApiKey}
                            onChange={(e) => setAnthropicApiKey(e.target.value)}
                            placeholder="Enter your Anthropic API key"
                        />
                        <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                        >
                            {showAnthropicKey ? <EyeOff /> : <Eye />}
                        </button>
                    </div>
                    <small>Get at <a href="https://console.anthropic.com/" target="_blank" style={{ color: '#2563eb' }}>Anthropic Console</a></small>
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
                                <optgroup label="Gemini (Free)">
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                    <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                </optgroup>
                                <optgroup label="Gemini Pro (Paid)">
                                    <option value="gemini-3-pro">Gemini 3 Pro</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                    <option value="gemini-2.5-ultra">Gemini 2.5 Ultra</option>
                                </optgroup>
                                <optgroup label="OpenAI (Paid)">
                                    <option value="gpt-5.2">GPT-5.2</option>
                                    <option value="gpt-5.2-pro">GPT-5.2 Pro</option>
                                    <option value="gpt-5.2-mini">GPT-5.2 Mini</option>
                                    <option value="gpt-5.2-nano">GPT-5.2 Nano</option>
                                    <option value="gpt-5.1">GPT-5.1</option>
                                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                                    <option value="gpt-4o">GPT-4o</option>
                                </optgroup>
                                <optgroup label="Anthropic (Paid)">
                                    <option value="claude-4.5-opus">Claude 4.5 Opus</option>
                                    <option value="claude-4.5-sonnet">Claude 4.5 Sonnet</option>
                                    <option value="claude-4.5-haiku">Claude 4.5 Haiku</option>
                                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                                </optgroup>
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
                                value="edit"
                                checked={responseFormat === 'edit'}
                                onChange={(e) => setResponseFormat(e.target.value)}
                            />
                            <span>Edit (generate response only, no prompt sent)</span>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                name="responseFormat"
                                value="both"
                                checked={responseFormat === 'both'}
                                onChange={(e) => setResponseFormat(e.target.value)}
                            />
                            <span>Both (generate prompt + response in one message)</span>
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
