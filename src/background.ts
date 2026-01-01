import { GoogleGenerativeAI } from "@google/generative-ai";

// Default settings
const DEFAULT_API_KEY = "";
const DEFAULT_MODEL = "gemini-2.0-flash-exp";

// Available models by provider
const AVAILABLE_MODELS = [
    // Gemini (Free)
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp (Free)', provider: 'gemini', free: true },
    // Gemini Pro (Paid - Future)
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro (Paid)', provider: 'gemini', free: false },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Paid)', provider: 'gemini', free: false },
    { value: 'gemini-2.5-ultra', label: 'Gemini 2.5 Ultra (Paid)', provider: 'gemini', free: false },
    // GPT (Paid)
    { value: 'gpt-5.2', label: 'GPT-5.2 (Paid)', provider: 'openai', free: false },
    { value: 'gpt-5.2-pro', label: 'GPT-5.2 Pro (Paid)', provider: 'openai', free: false },
    { value: 'gpt-5.2-mini', label: 'GPT-5.2 Mini (Paid)', provider: 'openai', free: false },
    { value: 'gpt-5.2-nano', label: 'GPT-5.2 Nano (Paid)', provider: 'openai', free: false },
    { value: 'gpt-5.1', label: 'GPT-5.1 (Paid)', provider: 'openai', free: false },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Paid)', provider: 'openai', free: false },
    { value: 'gpt-4o', label: 'GPT-4o (Paid)', provider: 'openai', free: false },
    // Claude (Paid)
    { value: 'claude-4.5-opus', label: 'Claude 4.5 Opus (Paid)', provider: 'anthropic', free: false },
    { value: 'claude-4.5-sonnet', label: 'Claude 4.5 Sonnet (Paid)', provider: 'anthropic', free: false },
    { value: 'claude-4.5-haiku', label: 'Claude 4.5 Haiku (Paid)', provider: 'anthropic', free: false },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Paid)', provider: 'anthropic', free: false },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Paid)', provider: 'anthropic', free: false },
];

// Get settings from storage
async function getSettings(): Promise<{ geminiApiKey: string; openaiApiKey: string; anthropicApiKey: string; model: string }> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey', 'openaiApiKey', 'anthropicApiKey', 'model'], (result) => {
            resolve({
                geminiApiKey: result.geminiApiKey || DEFAULT_API_KEY,
                openaiApiKey: result.openaiApiKey || '',
                anthropicApiKey: result.anthropicApiKey || '',
                model: result.model || DEFAULT_MODEL,
            });
        });
    });
}

let popupWindowId: number | undefined = undefined;

if (chrome.action) {
    chrome.action.onClicked.addListener(() => {
        if (popupWindowId !== undefined) {
            chrome.windows.get(popupWindowId, {}, () => {
                if (chrome.runtime.lastError) {
                    popupWindowId = undefined;
                    createPopupWindow();
                } else {
                    popupWindowId && chrome.windows.update(popupWindowId, { focused: true });
                }
            });
        } else {
            createPopupWindow();
        }
    });
}

function createPopupWindow() {
    chrome.windows.create(
        {
            url: 'popup.html',
            type: 'popup',
            width: 1000,
            height: 700,
        },
        (window) => {
            if (window) {
                popupWindowId = window.id;
            }
        }
    );
}

chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === popupWindowId) {
        popupWindowId = undefined;
    }
});

chrome.runtime.onInstalled.addListener(() => {
    // Create parent menu
    chrome.contextMenus.create({
        id: 'ai-tools',
        title: 'AI Tools',
        contexts: ['selection'],
    });

    // Create children
    chrome.contextMenus.create({
        id: 'fix-grammar',
        parentId: 'ai-tools',
        title: 'Fix Grammar & Spelling',
        contexts: ['selection'],
    });

    chrome.contextMenus.create({
        id: 'rephrase-professional',
        parentId: 'ai-tools',
        title: 'Rephrase as more professional',
        contexts: ['selection'],
    });

    chrome.contextMenus.create({
        id: 'rephrase-friendly',
        parentId: 'ai-tools',
        title: 'Rephrase as more friendly',
        contexts: ['selection'],
    });

    chrome.contextMenus.create({
        id: 'rephrase-shorter',
        parentId: 'ai-tools',
        title: 'Make it shorter',
        contexts: ['selection'],
    });
});

if (chrome.contextMenus) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (!tab || !tab.id || !info.selectionText) return;

        const selectedText = info.selectionText;
        let instruction = '';

        switch (info.menuItemId) {
            case 'fix-grammar':
                instruction = 'Correct the following text for grammar and spelling errors, without changing the meaning. Only output the corrected text.';
                break;
            case 'rephrase-professional':
                instruction = 'Rephrase the following text to sound more professional. Only output the rephrased text.';
                break;
            case 'rephrase-friendly':
                instruction = 'Rephrase the following text to sound more friendly and conversational. Only output the rephrased text.';
                break;
            case 'rephrase-shorter':
                instruction = 'Rewrite the following text to be more concise. Only output the rewritten text.';
                break;
            default:
                return;
        }

        const fullPrompt = `${instruction}

        Text to process: "${selectedText}"
        Do not use markdowns
        `;

        generateResponse(fullPrompt)
            .then(response => {
                chrome.tabs.sendMessage(tab.id!, {
                    type: 'REPLACE_SELECTED_TEXT',
                    text: response,
                }, () => {
                    if (chrome.runtime.lastError) {
                        // Silently ignore
                    }
                });
            })
            .catch(error => {
                console.error('Context menu AI error:', error);
            });
    });
}


chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.type === 'GENERATE_RESPONSE') {
        generateResponse(request.prompt, request.systemInstruction)
            .then(response => {
                sendResponse({ success: true, text: response });
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Will respond asynchronously
    } else if (request.type === 'GET_SETTINGS') {
        getSettings().then(settings => {
            chrome.storage.local.get(['commandPrefix', 'responseFormat'], (result) => {
                sendResponse({
                    success: true,
                    settings: {
                        ...settings,
                        commandPrefix: result.commandPrefix || 'prompt:',
                        responseFormat: result.responseFormat || 'edit',
                    },
                });
            });
        });
        return true;
    } else if (request.type === 'UPDATE_SETTINGS') {
        const { geminiApiKey, openaiApiKey, anthropicApiKey, model, commandPrefix, responseFormat } = request.settings || {};
        const updates: any = {};

        if (geminiApiKey !== undefined) updates.geminiApiKey = geminiApiKey;
        if (openaiApiKey !== undefined) updates.openaiApiKey = openaiApiKey;
        if (anthropicApiKey !== undefined) updates.anthropicApiKey = anthropicApiKey;
        if (model !== undefined) updates.model = model;
        if (commandPrefix !== undefined) updates.commandPrefix = commandPrefix;
        if (responseFormat !== undefined) updates.responseFormat = responseFormat;

        chrome.storage.local.set(updates, () => {
            sendResponse({ success: true });
        });
        return true;
    } else if (request.type === 'GET_MODELS') {
        sendResponse({ success: true, models: AVAILABLE_MODELS });
        return true;
    } else if (request.type === 'GET_HISTORY') {
        chrome.storage.local.get(['promptHistory'], (result) => {
            sendResponse({ success: true, history: result.promptHistory || [] });
        });
        return true; // Async response
    } else if (request.type === 'CLEAR_HISTORY') {
        chrome.storage.local.set({ promptHistory: [] }, () => {
            sendResponse({ success: true });
        });
        return true; // Async response
    } else if (request.type === 'GET_OPEN_CHATS') {
        chrome.tabs.query({ url: ['https://*.facebook.com/*'] }, (tabs) => {
            const fbTabs = tabs.filter(t => t.url?.includes('facebook.com') && !t.url?.includes('/messages'));

            Promise.all(
                fbTabs.map(tab =>
                    new Promise<any>((resolve) => {
                        chrome.tabs.sendMessage(tab.id!, { type: 'GET_CHAT_NAME' }, (response) => {
                            if (chrome.runtime.lastError) {
                                resolve([]);
                                return;
                            }
                            if (response?.chats) {
                                resolve(response.chats.map((chat: any) => ({
                                    id: tab.id,
                                    title: chat.name,
                                    chatIndex: chat.index
                                })));
                            } else {
                                resolve([]);
                            }
                        });
                    })
                )
            ).then(results => {
                const allChats = results.flat();
                sendResponse({ success: true, chats: allChats });
            });
        });
        return true;
    }
});

async function generateResponse(prompt: string, systemInstruction?: string): Promise<string> {
    const settings = await getSettings();
    const modelName = settings.model || DEFAULT_MODEL;
    const modelInfo = AVAILABLE_MODELS.find(m => m.value === modelName);
    const provider = modelInfo?.provider || 'gemini';

    if (provider === 'gemini') {
        const apiKey = settings.geminiApiKey || DEFAULT_API_KEY;
        if (!apiKey || apiKey.length < 20) {
            throw new Error('Invalid Gemini API key. Please set a valid API key in settings.');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const finalPrompt = systemInstruction ? `${systemInstruction}\n\nUser request: ${prompt}` : prompt;
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();
    } else if (provider === 'openai') {
        const apiKey = settings.openaiApiKey;
        if (!apiKey) {
            throw new Error('OpenAI API key required. Add it in settings.');
        }
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: 'system', content: systemInstruction || 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
        return data.choices[0].message.content;
    } else if (provider === 'anthropic') {
        const apiKey = settings.anthropicApiKey;
        if (!apiKey) {
            throw new Error('Anthropic API key required. Add it in settings.');
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: modelName,
                max_tokens: 1024,
                system: systemInstruction || 'You are a helpful assistant.',
                messages: [{ role: 'user', content: prompt }],
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
        return data.content[0].text;
    }
    throw new Error('Unsupported provider');
}
