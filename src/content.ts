let isProcessing = false;
let systemInstruction = 'You are a helpful AI assistant.'; // Default system instruction
let currentToneName = 'default'; // Track current tone name for history
let settings: any = {
    commandPrefix: 'prompt:',
    responseFormat: 'edit',
    model: 'gemini-2.5-flash',
};
declare const chrome: any;

const MAX_HISTORY_SIZE = 50; // Maximum number of history items to keep

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(['commandPrefix', 'responseFormat', 'model'], (result: any) => {
        if (result.commandPrefix) settings.commandPrefix = result.commandPrefix;
        if (result.responseFormat) settings.responseFormat = result.responseFormat;
        if (result.model) settings.model = result.model;
    });
}

// Load settings on initialization
loadSettings();

// Tone map for command usage
let TONE_MAP: { [key: string]: string } = {
    'default': 'You are a helpful, balanced AI assistant. Respond clearly and accurately.',
    'honest': 'You are an honest AI assistant. Be direct and truthful, even if uncomfortable.',
    'friendly': 'You are a warm and friendly AI assistant. Respond in a conversational, approachable tone.',
    'weird': 'You are a quirky and unconventional AI assistant. Be creative, playful, and unexpected.',
    'nerd': 'You are an enthusiastic nerd. Dive deep into technical details with passion and expertise.',
    'cynic': 'You are a cynical AI assistant. Be skeptical, sarcastic, and critically minded.',
};

// Load custom tones and merge with default tones
function loadTones() {
    chrome.storage.local.get(['customTones'], (result: any) => {
        if (result.customTones) {
            const customTonesMap = result.customTones.reduce((acc: any, tone: any) => {
                acc[tone.id] = tone.systemInstruction;
                return acc;
            }, {});
            TONE_MAP = { ...TONE_MAP, ...customTonesMap };
        }
    });
}

loadTones();

// Listen for custom tones changes
chrome.storage.onChanged.addListener((changes: any, areaName: string) => {
    if (areaName === 'local' && changes.customTones) {
        loadTones();
    }
});

// Save prompt to history
function savePromptToHistory(prompt: string, response?: string) {
    try {
        const historyItem = {
            id: Date.now().toString(),
            prompt: prompt,
            tone: currentToneName,
            timestamp: Date.now(),
            response: response || undefined, // Save full response
            responseFormat: settings.responseFormat || 'edit',
        };

        chrome.storage.local.get(['promptHistory'], (result: any) => {
            const history: any[] = result.promptHistory || [];
            history.unshift(historyItem); // Add to beginning

            // Limit history size
            const limitedHistory = history.slice(0, MAX_HISTORY_SIZE);

            chrome.storage.local.set({ promptHistory: limitedHistory }, () => {
                console.log('✅ Prompt saved to history:', prompt.substring(0, 50) + '...');
            });
        });
    } catch (error) {
        console.error('Failed to save prompt to history:', error);
    }
}



// Helper function to check if extension context is valid
function isExtensionContextValid(): boolean {
    try {
        // Try to access chrome.runtime.id - if context is invalid, this will throw
        return typeof chrome !== 'undefined' &&
            typeof chrome.runtime !== 'undefined' &&
            chrome.runtime.id !== undefined;
    } catch (e) {
        return false;
    }
}

// Helper function to safely send messages
async function safeSendMessage(message: any): Promise<any> {
    if (!isExtensionContextValid()) {
        throw new Error('Extension context invalidated. Please reload the page.');
    }

    try {
        return await chrome.runtime.sendMessage(message);
    } catch (error: any) {
        if (error.message?.includes('Extension context invalidated') ||
            error.message?.includes('message port closed')) {
            throw new Error('Extension was reloaded. Please refresh the page to continue using the extension.');
        }
        throw error;
    }
}

// Listen for messages from popup
try {
    chrome.runtime.onMessage.addListener((request: any, _sender: any, sendResponse: any) => {
        if (request.type === 'GET_CHAT_NAME') {
            const url = window.location.href;

            // Only work on facebook.com main page (not /messages)
            if (url.includes('facebook.com') && !url.includes('/messages') && !url.includes('/t/')) {
                const chats: { name: string, index: number }[] = [];
                const headers = document.querySelectorAll('h2.html-h2');
                const excludeWords = ['Menu', 'Facebook', 'Messenger', 'Active', 'Aktywny', 'Wiadomości'];
                const seenNames = new Set<string>();

                headers.forEach((header, index) => {
                    const text = header.textContent?.trim();
                    const shouldExclude = excludeWords.some(word => text?.includes(word));
                    if (text && text.length > 2 && text.length < 50 && !shouldExclude && !seenNames.has(text)) {
                        // Check if the header itself is visible (chat window is open)
                        const headerElement = header as HTMLElement;
                        if (headerElement.offsetParent !== null) {
                            chats.push({ name: text, index });
                            seenNames.add(text);
                        }
                    }
                });

                sendResponse({ chats });
                return true;
            }

            sendResponse({ chats: [] });
            return true;
        } else if (request.type === 'UPDATE_SYSTEM_INSTRUCTION') {
            // Reload tones first to ensure we have latest custom tones
            chrome.storage.local.get(['customTones'], (result: any) => {
                if (result.customTones) {
                    const customTonesMap = result.customTones.reduce((acc: any, tone: any) => {
                        acc[tone.id] = tone.systemInstruction;
                        return acc;
                    }, {});
                    TONE_MAP = { ...TONE_MAP, ...customTonesMap };
                }

                systemInstruction = TONE_MAP[request.presetId] || 'You are a helpful AI assistant.';
                currentToneName = request.presetId || 'default';
                console.log(`✅ Tone updated: ${request.presetId}`);

                // Notify popup about tone change
                chrome.runtime.sendMessage({
                    type: 'TONE_UPDATED',
                    presetId: request.presetId,
                }).catch(() => {
                    // Silently fail if popup not open
                });

                sendResponse({ success: true });
            });
            return true;
        } else if (request.type === 'REPLACE_SELECTED_TEXT') {
            const activeElement = document.activeElement as HTMLElement;
            if (activeElement && activeElement.isContentEditable) {
                replaceTextInEditor(activeElement, request.text);
            }
            sendResponse({ success: true });
        } else if (request.type === 'INSERT_TEXT') {
            // For /messages page, just find any contenteditable
            if (window.location.href.includes('/messages') || window.location.href.includes('/t/')) {
                const input = document.querySelector('[contenteditable="true"]') as HTMLElement;
                if (input) {
                    input.focus();
                    document.execCommand('selectAll', false, undefined);
                    document.execCommand('insertText', false, request.text);
                }
                sendResponse({ success: true });
                return;
            }

            // For facebook.com main page with chat windows
            if (request.chatIndex === undefined) {
                sendResponse({ success: false });
                return;
            }

            const headers = document.querySelectorAll('h2.html-h2');
            if (headers[request.chatIndex]) {
                let container = headers[request.chatIndex].parentElement;
                let targetInput: HTMLElement | null = null;

                for (let i = 0; i < 15 && container; i++) {
                    targetInput = container.querySelector('[contenteditable="true"]') as HTMLElement;
                    if (targetInput) break;
                    container = container.parentElement;
                }

                if (targetInput) {
                    targetInput.focus();
                    document.execCommand('selectAll', false, undefined);
                    document.execCommand('insertText', false, request.text);
                }
            }
            sendResponse({ success: true });
        } else if (request.type === 'UPDATE_SETTINGS') {
            // Update settings when changed from popup
            if (request.settings) {
                settings = { ...settings, ...request.settings };
            }
            sendResponse({ success: true });
        } else if (request.type === 'GET_SETTINGS') {
            sendResponse({ success: true, settings });
        } else if (request.type === 'GET_HISTORY') {
            chrome.storage.local.get(['promptHistory'], (result: any) => {
                sendResponse({ success: true, history: result.promptHistory || [] });
            });
            return true; // Async response
        } else if (request.type === 'CLEAR_HISTORY') {
            chrome.storage.local.set({ promptHistory: [] }, () => {
                sendResponse({ success: true });
            });
            return true; // Async response
        }
    });
} catch (error) {
    console.warn('Failed to set up message listener:', error);
}

// Watch for settings changes
chrome.storage.onChanged.addListener((changes: any, areaName: string) => {
    if (areaName === 'local') {
        if (changes.commandPrefix) {
            settings.commandPrefix = changes.commandPrefix.newValue || 'prompt:';
        }
        if (changes.responseFormat) {
            settings.responseFormat = changes.responseFormat.newValue || 'edit';
        }
        if (changes.model) {
            settings.model = changes.model.newValue || 'gemini-2.5-flash';
        }
        console.log('✅ Settings updated:', settings);
    }
});

document.addEventListener('keydown', async (event: KeyboardEvent) => {
    // 1. Sprawdzamy Enter
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.metaKey) return;

    const target = event.target as HTMLElement;
    if (!target.isContentEditable) return;

    // 2. Pobieramy tekst (zachowujemy go w zmiennej, żeby potem dokleić)
    const messageText = target.innerText.trim();

    // 3. Check for AI prefix
    const prefix = settings.commandPrefix || 'prompt:';
    if (!messageText.toLowerCase().startsWith(prefix.toLowerCase()) && !messageText.startsWith('gpt:')) return;

    // 4. Blokujemy Enter
    event.preventDefault();
    event.stopImmediatePropagation();

    if (isProcessing) return;
    isProcessing = true;

    const prompt = messageText.replace(new RegExp(`^(${prefix}|gpt:)\\s*`, 'i'), '').trim() + "; Do not use markdowns.";

    console.log(`🤖 Przetwarzam prompt: ${prompt}`);

    try {
        const responseFormat = settings.responseFormat || 'edit';

        // Show loading overlay
        showLoadingOverlay();

        // Generate response
        const response = await safeSendMessage({
            type: 'GENERATE_RESPONSE',
            prompt: prompt,
            systemInstruction: systemInstruction,
        });

        hideLoadingOverlay();

        if (response && response.success) {
            savePromptToHistory(prompt, response.text);

            if (responseFormat === 'edit') {
                await replaceTextInEditor(target, response.text);
            } else if (responseFormat === 'both') {
                await replaceTextInEditor(target, `[${messageText}] : \n\n${response.text}`);
            }
        }
    } catch (error: any) {
        hideLoadingOverlay();
        console.error('Content Script Error:', error);
    } finally {
        isProcessing = false;
    }
}, true);


/**
 * Funkcja podmieniania tekstu
 */
async function replaceTextInEditor(target: HTMLElement, newText: string) {
    target.focus();
    await sleep(10);

    // Próba 1: Standardowe zaznacz wszystko
    document.execCommand('selectAll', false, undefined);

    // Fallback Range API
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
        const range = document.createRange();
        range.selectNodeContents(target);
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    await sleep(10);

    // Wklej nowy tekst
    document.execCommand('insertText', false, newText);
}

// Loading overlay functions
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ai-loading-overlay';
    overlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
            <div style="
                background: white;
                padding: 40px 60px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                text-align: center;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="
                    font-size: 20px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                ">Response generating...</div>
                <div style="
                    font-size: 14px;
                    color: #6b7280;
                ">Please wait</div>
            </div>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}