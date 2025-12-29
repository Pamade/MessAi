
import { useState, useEffect } from 'react';

interface Template {
    id: string;
    title: string;
    content: string;
}

const getTemplates = (): Promise<Template[]> => {
    return new Promise(resolve => {
        chrome.storage.local.get(['templates'], result => {
            resolve(result.templates || []);
        });
    });
};

const saveTemplates = (templates: Template[]): Promise<void> => {
    return new Promise(resolve => {
        chrome.storage.local.set({ templates }, () => {
            resolve();
        });
    });
};

function TemplatesTab({ selectedChat }: { selectedChat: string | null }) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [editing, setEditing] = useState<Template | null>(null);

    useEffect(() => {
        getTemplates().then(setTemplates);
    }, []);

    const handleAddOrUpdate = async () => {
        if (!newTitle || !newContent) return;

        if (editing) {
            const updatedTemplates = templates.map(t =>
                t.id === editing.id ? { ...t, title: newTitle, content: newContent } : t
            );
            await saveTemplates(updatedTemplates);
            setTemplates(updatedTemplates);
            setEditing(null);
        } else {
            const newTemplate: Template = {
                id: Date.now().toString(),
                title: newTitle,
                content: newContent,
            };
            const updatedTemplates = [...templates, newTemplate];
            await saveTemplates(updatedTemplates);
            setTemplates(updatedTemplates);
        }
        setNewTitle('');
        setNewContent('');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            const updatedTemplates = templates.filter(t => t.id !== id);
            await saveTemplates(updatedTemplates);
            setTemplates(updatedTemplates);
        }
    };

    const handleEdit = (template: Template) => {
        setEditing(template);
        setNewTitle(template.title);
        setNewContent(template.content);
    };

    const handleInsert = (content: string) => {
        if (!selectedChat) return;

        const [tabIdStr, chatIndexStr] = selectedChat.split('-');
        const tabId = parseInt(tabIdStr);
        const chatIndex = parseInt(chatIndexStr);

        chrome.tabs.sendMessage(tabId, {
            type: 'INSERT_TEXT',
            text: content,
            chatIndex: chatIndex,
        }, () => {
            if (chrome.runtime.lastError) {
                console.log('Insert failed:', chrome.runtime.lastError.message);
            }
        });
    };

    return (
        <div className="templates-tab">
            <h4>{editing ? 'Edit Template' : 'Add New Template'}</h4>
            <div className="template-form">
                <input
                    type="text"
                    placeholder="Template Title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
                <textarea
                    placeholder="Template Content (e.g., 'Thanks for your message! We will get back to you within 24 hours.')"
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                />
                <div className="form-actions">
                    <button className="btn-primary" onClick={handleAddOrUpdate}>
                        {editing ? 'Update Template' : 'Save Template'}
                    </button>
                    {editing && <button className="btn-secondary" onClick={() => { setEditing(null); setNewTitle(''); setNewContent(''); }}>Cancel</button>}
                </div>
            </div>

            <h4>Saved Templates</h4>
            <div className="templates-list">
                {templates.length > 0 ? templates.map(template => (
                    <div key={template.id} className="template-item">
                        <h4>{template.title}</h4>
                        <p>{template.content}</p>
                        <div className="actions">
                            <button className="insert-btn" onClick={() => handleInsert(template.content)}>Insert</button>
                            <button className="edit-btn" onClick={() => handleEdit(template)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(template.id)}>Delete</button>
                        </div>
                    </div>
                )) : <p>No templates saved yet. Add one above to get started!</p>}
            </div>
        </div>
    );
}

export default TemplatesTab;
