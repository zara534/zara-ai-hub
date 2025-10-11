
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import { AIPersona, PersonaType, AIEngine, Announcement } from '../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Toast from '../ui/Toast';
import { fonts } from '../contexts/ThemeContext';

const AdminPage: React.FC = () => {
    const { 
        isAdmin, 
        personas, 
        addPersona, 
        updatePersona, 
        deletePersona, 
        importPersonas,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        defaultTextEngine,
        setDefaultTextEngine,
    } = useAI();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('personas');
    
    // Persona state
    const [isPersonaFormVisible, setPersonaFormVisible] = useState(false);
    const [currentPersona, setCurrentPersona] = useState<Partial<AIPersona> | null>(null);

    // Announcement state
    const [isAnnouncementFormVisible, setAnnouncementFormVisible] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);

    // General state
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'persona' | 'announcement' } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [importError, setImportError] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin-login');
        }
    }, [isAdmin, navigate]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Persona Handlers
    const handleEditPersona = (persona: AIPersona) => {
        setCurrentPersona(persona);
        setPersonaFormVisible(true);
        window.scrollTo(0, 0);
    };

    const handleNewPersona = () => {
        setCurrentPersona({ type: PersonaType.TEXT, engine: AIEngine.GEMINI, supportsImageUpload: true });
        setPersonaFormVisible(true);
    };

    const handlePersonaFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | boolean = value;
        if (type === 'checkbox') {
            finalValue = (e.target as HTMLInputElement).checked;
        }
        setCurrentPersona(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const handlePersonaFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!currentPersona) return;

        try {
            if (currentPersona.id) {
                await updatePersona(currentPersona as AIPersona);
                showToast('Persona updated successfully!');
            } else {
                await addPersona(currentPersona as Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>);
                showToast('Persona added successfully!');
            }
            setPersonaFormVisible(false);
            setCurrentPersona(null);
        } catch (error) {
            showToast('An error occurred.', 'error');
            console.error(error);
        }
    };
    
    // Announcement Handlers
    const handleEditAnnouncement = (announcement: Announcement) => {
        setCurrentAnnouncement(announcement);
        setAnnouncementFormVisible(true);
        window.scrollTo(0, 0);
    };

    const handleNewAnnouncement = () => {
        setCurrentAnnouncement({ enabled: true, fontFamily: 'inter' });
        setAnnouncementFormVisible(true);
    };

    const handleAnnouncementFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setCurrentAnnouncement(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const handleAnnouncementFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentAnnouncement) return;

        try {
            if (currentAnnouncement.id) {
                updateAnnouncement(currentAnnouncement as Announcement);
                showToast('Announcement updated successfully!');
            } else {
                addAnnouncement(currentAnnouncement as Omit<Announcement, 'id' | 'date'>);
                showToast('Announcement added successfully!');
            }
            setAnnouncementFormVisible(false);
            setCurrentAnnouncement(null);
        } catch (error) {
            showToast('An error occurred.', 'error');
            console.error(error);
        }
    };

    // Delete Handlers
    const handleDeleteClick = (id: string, type: 'persona' | 'announcement') => {
        setItemToDelete({ id, type });
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            if (itemToDelete.type === 'persona') {
                await deletePersona(itemToDelete.id);
                showToast('Persona deleted.');
            } else if (itemToDelete.type === 'announcement') {
                deleteAnnouncement(itemToDelete.id);
                showToast('Announcement deleted.');
            }
        } catch (error) {
            showToast('Failed to delete.', 'error');
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // Import/Export Handlers
    const handleExportPersonas = () => {
        const customPersonas = personas.filter(p => !p.isDefault);
        const dataStr = JSON.stringify(customPersonas, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'zara-ai-personas.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    const handleImportPersonas = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Invalid file content");
                const imported = JSON.parse(text);
                // Basic validation
                if (!Array.isArray(imported) || imported.some(p => !p.name || !p.systemPrompt || !p.type)) {
                    throw new Error("Invalid persona format in JSON file.");
                }
                await importPersonas(imported);
                showToast(`${imported.length} personas imported successfully!`);
            } catch (err: any) {
                setImportError(err.message || 'Failed to parse or import JSON file.');
            }
        };
        reader.readAsText(file);
    };

    if (!isAdmin) {
        return <div className="text-center p-8">Checking admin privileges...</div>;
    }

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-primary text-text-primary";
    const labelStyles = "block text-sm font-medium text-text-secondary mb-1";

    const renderPersonaForm = () => (
        <Card className="mb-8 p-6">
            <h3 className="text-2xl font-bold mb-4">{currentPersona?.id ? 'Edit Persona' : 'Create New Persona'}</h3>
            <form onSubmit={handlePersonaFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className={labelStyles}>Name</label>
                        <input type="text" name="name" value={currentPersona?.name || ''} onChange={handlePersonaFormChange} className={inputStyles} required />
                    </div>
                    <div>
                        <label htmlFor="icon" className={labelStyles}>Icon (Emoji)</label>
                        <input type="text" name="icon" value={currentPersona?.icon || ''} onChange={handlePersonaFormChange} className={inputStyles} />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className={labelStyles}>Description</label>
                    <textarea name="description" value={currentPersona?.description || ''} onChange={handlePersonaFormChange} className={inputStyles} rows={3} required />
                </div>
                <div>
                    <label htmlFor="systemPrompt" className={labelStyles}>System Prompt / Instructions</label>
                    <textarea name="systemPrompt" value={currentPersona?.systemPrompt || ''} onChange={handlePersonaFormChange} className={inputStyles} rows={6} />
                </div>
                <div>
                    <label htmlFor="type" className={labelStyles}>Persona Type</label>
                    <select name="type" value={currentPersona?.type} onChange={handlePersonaFormChange} className={inputStyles}>
                        <option value={PersonaType.TEXT}>Text Agent</option>
                        <option value={PersonaType.IMAGE}>Image Generator</option>
                    </select>
                </div>
                {currentPersona?.type === PersonaType.TEXT && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="engine" className={labelStyles}>AI Engine</label>
                            <select name="engine" value={currentPersona?.engine} onChange={handlePersonaFormChange} className={inputStyles}>
                                <option value={AIEngine.GEMINI}>Gemini</option>
                                <option value={AIEngine.POLLINATIONS}>Pollinations (Text)</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                             <input type="checkbox" id="supportsImageUpload" name="supportsImageUpload" checked={currentPersona?.supportsImageUpload || false} onChange={handlePersonaFormChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" disabled={currentPersona.engine !== AIEngine.GEMINI} />
                             <label htmlFor="supportsImageUpload" className="ml-2 block text-sm text-text-secondary">Supports Image Upload (Gemini only)</label>
                        </div>
                    </div>
                )}
                {currentPersona?.type === PersonaType.IMAGE && (
                    <div>
                        <label htmlFor="model" className={labelStyles}>Image Model (e.g., 'flux', 'dpo')</label>
                        <input type="text" name="model" value={currentPersona?.model || ''} onChange={handlePersonaFormChange} className={inputStyles} placeholder="Default: flux" />
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" onClick={() => { setPersonaFormVisible(false); setCurrentPersona(null); }} className="!bg-surface hover:!bg-border-color/50 !text-text-primary">Cancel</Button>
                    <Button type="submit">Save Persona</Button>
                </div>
            </form>
        </Card>
    );
    
    const renderAnnouncementForm = () => (
        <Card className="mb-8 p-6">
            <h3 className="text-2xl font-bold mb-4">{currentAnnouncement?.id ? 'Edit Announcement' : 'Create New Announcement'}</h3>
            <form onSubmit={handleAnnouncementFormSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="title" className={labelStyles}>Title</label>
                    <input type="text" name="title" value={currentAnnouncement?.title || ''} onChange={handleAnnouncementFormChange} className={inputStyles} required />
                </div>
                <div>
                    <label htmlFor="message" className={labelStyles}>Message</label>
                    <textarea name="message" value={currentAnnouncement?.message || ''} onChange={handleAnnouncementFormChange} className={inputStyles} rows={5} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fontFamily" className={labelStyles}>Font Family</label>
                        <select name="fontFamily" value={currentAnnouncement?.fontFamily || 'inter'} onChange={handleAnnouncementFormChange} className={inputStyles}>
                            {Object.entries(fonts).map(([key, font]) => (
                                <option key={key} value={key}>{font.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center pt-6">
                         <input type="checkbox" id="enabled" name="enabled" checked={currentAnnouncement?.enabled || false} onChange={handleAnnouncementFormChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                         <label htmlFor="enabled" className="ml-2 block text-sm text-text-secondary">Enabled (Show to users)</label>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="actionText" className={labelStyles}>Action Button Text (Optional)</label>
                        <input type="text" name="actionText" value={currentAnnouncement?.actionText || ''} onChange={handleAnnouncementFormChange} className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="actionLink" className={labelStyles}>Action Button Link (Optional)</label>
                        <input type="text" name="actionLink" value={currentAnnouncement?.actionLink || ''} onChange={handleAnnouncementFormChange} className={inputStyles} placeholder="/chat/default-chat" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" onClick={() => { setAnnouncementFormVisible(false); setCurrentAnnouncement(null); }} className="!bg-surface hover:!bg-border-color/50 !text-text-primary">Cancel</Button>
                    <Button type="submit">Save Announcement</Button>
                </div>
            </form>
        </Card>
    );
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
            >
                <p>Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.</p>
            </Modal>
            
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-primary">Admin Panel</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage application content and settings.</p>
            </div>
            
            <div className="border-b border-border-color flex justify-center">
                <button onClick={() => setActiveTab('personas')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'personas' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Personas</button>
                <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'announcements' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Announcements</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>Settings</button>
            </div>
            
            {activeTab === 'personas' && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">Manage Personas</h2>
                        <div className="flex gap-2">
                             <Button onClick={handleExportPersonas} className="!bg-surface hover:!bg-border-color/50 !text-text-primary">Export JSON</Button>
                             <Button as="label" className="!bg-surface hover:!bg-border-color/50 !text-text-primary cursor-pointer">
                                Import JSON
                                <input type="file" accept=".json" onChange={handleImportPersonas} className="hidden" />
                             </Button>
                            <Button onClick={handleNewPersona}>+ Add New</Button>
                        </div>
                    </div>
                    {importError && <p className="text-red-500 mb-4">{importError}</p>}
                    
                    {isPersonaFormVisible && renderPersonaForm()}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personas.filter(p => !p.isDefault).map(p => (
                                    <tr key={p.id} className="border-b border-border-color">
                                        <td className="p-3 font-semibold">{p.name} {p.icon}</td>
                                        <td className="p-3">{p.type}</td>
                                        <td className="p-3 text-sm text-text-secondary max-w-sm truncate">{p.description}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleEditPersona(p)} className="!p-2 text-sm">Edit</Button>
                                                <Button onClick={() => handleDeleteClick(p.id, 'persona')} className="!p-2 text-sm !bg-red-600 hover:!bg-red-700">Delete</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'announcements' && (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-3xl font-bold">Manage Announcements</h2>
                        <Button onClick={handleNewAnnouncement}>+ Add New</Button>
                    </div>

                    {isAnnouncementFormVisible && renderAnnouncementForm()}

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                             <thead className="bg-surface">
                                <tr>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map(a => (
                                    <tr key={a.id} className="border-b border-border-color">
                                        <td className="p-3 font-semibold">{a.title}</td>
                                        <td className="p-3">{a.enabled ? <span className="text-green-400">Enabled</span> : <span className="text-gray-500">Disabled</span>}</td>
                                        <td className="p-3 text-sm">{new Date(a.date).toLocaleDateString()}</td>
                                        <td className="p-3">
                                             <div className="flex gap-2">
                                                <Button onClick={() => handleEditAnnouncement(a)} className="!p-2 text-sm">Edit</Button>
                                                <Button onClick={() => handleDeleteClick(a.id, 'announcement')} className="!p-2 text-sm !bg-red-600 hover:!bg-red-700">Delete</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
            
             {activeTab === 'settings' && (
                <Card className="p-6">
                    <h2 className="text-3xl font-bold mb-4">App Settings</h2>
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label htmlFor="defaultTextEngine" className={labelStyles}>Default Text Engine</label>
                            <select id="defaultTextEngine" value={defaultTextEngine} onChange={e => setDefaultTextEngine(e.target.value as AIEngine)} className={inputStyles}>
                                <option value={AIEngine.GEMINI}>Gemini</option>
                                <option value={AIEngine.POLLINATIONS}>Pollinations</option>
                            </select>
                            <p className="text-xs text-text-secondary mt-1">This sets the default engine for the "Quick Chat" agent on the home page.</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminPage;
