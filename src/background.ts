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
