import { GoogleGenerativeAI } from "@google/generative-ai";

// Default API key (fallback)
const DEFAULT_API_KEY = "AIzaSyBxJm7ob4U3giMEvsKYmnHrHWd2rpArUrM";
const DEFAULT_MODEL = "gemini-2.5-flash";

// Available Gemini models
const AVAILABLE_MODELS = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
];

// Get settings from storage
async function getSettings(): Promise<{ apiKey: string; model: string }> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiKey', 'model'], (result) => {
            resolve({
                apiKey: result.apiKey || DEFAULT_API_KEY,
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

Text to process: "${selectedText}"`;

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
                        commandPrefix: result.commandPrefix || 'gemini:',
                        responseFormat: result.responseFormat || 'separate',
                    },
                });
            });
        });
        return true;
    } else if (request.type === 'UPDATE_SETTINGS') {
        const { apiKey, model, commandPrefix, responseFormat } = request.settings || {};
        const updates: any = {};

        if (apiKey !== undefined) updates.apiKey = apiKey;
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
    const apiKey = settings.apiKey || DEFAULT_API_KEY;
    const modelName = settings.model || DEFAULT_MODEL;

    // Basic API key validation
    if (!apiKey || apiKey.length < 20) {
        throw new Error('Invalid API key. Please set a valid API key in settings.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const finalPrompt = systemInstruction
        ? `${systemInstruction}\n\nUser request: ${prompt}`
        : prompt;

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();
    return text;
}
