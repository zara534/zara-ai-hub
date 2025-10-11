import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import { ChatMessage, AIEngine } from '../types';
import { generateText as generateTextPollinations } from '../services/pollinationsService';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { v4 as uuidv4 } from 'uuid';
import StreamedText from '../ui/StreamedText';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPersonaById } = useAI();
  const persona = id ? getPersonaById(id) : undefined;
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearModalOpen, setClearModalOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (persona && persona.engine === AIEngine.GEMINI) {
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: persona.systemPrompt,
        },
      });
      setChatSession(chat);
    } else {
      setChatSession(null);
    }
    // We only want this to re-run when the persona changes, not when chat history updates.
    // The chat session maintains its own history internally.
  }, [persona]);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage]);


  if (!persona) {
    return <Navigate to="/" />;
  }
  
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
      setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopiedMessageId(id);
        setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!userInput.trim() && !selectedImage) || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      text: userInput,
      imageUrl: selectedImage?.previewUrl,
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    const currentUserInput = userInput;
    const currentImageFile = selectedImage?.file;
    setUserInput('');
    setSelectedImage(null);
    setIsLoading(true);
    
    try {
      let aiResponseText: string;
      
      if (persona.engine === AIEngine.GEMINI && chatSession) {
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

        // Image part should come first for multimodal prompts
        if (currentImageFile) {
          const base64Data = await fileToBase64(currentImageFile);
          parts.push({
            inlineData: {
              mimeType: currentImageFile.type,
              data: base64Data,
            },
          });
        }
        
        // Text part must be an object
        if (currentUserInput.trim()) {
          parts.push({ text: currentUserInput });
        }
        
        const response: GenerateContentResponse = await chatSession.sendMessage({ message: parts });
        aiResponseText = response.text;
      } else {
        const fullPrompt = `${persona.systemPrompt}\n\nUser: ${currentUserInput}\nAI:`;
        aiResponseText = await generateTextPollinations(fullPrompt);
      }

      const newAiMessage: ChatMessage = { id: uuidv4(), sender: 'ai', text: aiResponseText };
      
      setChatHistory(prev => [...prev, newAiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = { id: uuidv4(), sender: 'ai', text: "I'm having trouble connecting to the network. Please check your connection and try again." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfirm = async () => {
    setClearModalOpen(false);
    setChatHistory([]);
    // Reset the chat session to clear its history
    if (persona && persona.engine === AIEngine.GEMINI) {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: persona.systemPrompt,
            },
        });
        setChatSession(chat);
    }
  };

  const handleDownloadConversation = () => {
    if (chatHistory.length === 0) return;

    const header = `Conversation with ${persona.name}\n`;
    const timestamp = `Exported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    
    const formattedHistory = chatHistory.map(message => {
        let content = `${message.sender === 'user' ? 'You' : persona.name}:\n${message.text}`;
        if (message.imageUrl) {
            content += `\n[Image was attached by user]`;
        }
        return content;
    }).join('\n\n---\n\n');

    const fullContent = header + timestamp + formattedHistory;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFilename = persona.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `zara-ai-chat-${safeFilename}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearConfirm}
        title="Clear Conversation"
      >
        <p>Are you sure you want to delete this entire chat history? This action cannot be undone.</p>
      </Modal>
      <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-surface/80 backdrop-blur-sm border border-border-color rounded-xl shadow-lg">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="text-4xl">{persona.icon || '💬'}</div>
             <div>
                <h2 className="text-2xl font-bold text-primary">{persona.name}</h2>
                <p className="text-text-secondary">{persona.description}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadConversation} className="p-2 text-text-secondary hover:text-primary rounded-md transition-colors" title="Download Conversation">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button onClick={() => setClearModalOpen(true)} className="p-2 text-text-secondary hover:text-red-500 rounded-md transition-colors" title="Clear Chat History">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
          {chatHistory.map((message, index) => (
            <div key={message.id || index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-2xl shadow-md flex flex-col relative group ${message.sender === 'user' ? 'rounded-br-none bg-secondary text-background' : 'rounded-bl-none bg-background text-text-primary'}`}>
                 {message.imageUrl && (
                    <img src={message.imageUrl} alt="User upload" className="mb-2 rounded-lg max-w-xs" />
                )}
                {message.text && (
                   (message.sender === 'ai' && index === chatHistory.length - 1 && !isLoading)
                   ? <StreamedText text={message.text} />
                   : <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                )}
                {message.sender === 'ai' && message.text && !isLoading && (
                    <button 
                        onClick={() => handleCopy(message.text, message.id!)}
                        className="absolute -bottom-3 -right-3 p-1.5 bg-surface border border-border-color rounded-full text-text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title={copiedMessageId === message.id ? 'Copied!' : 'Copy text'}
                    >
                        {copiedMessageId === message.id ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                    </button>
                )}
              </div>
            </div>
          ))}
           {isLoading && (
              <div className="flex justify-start">
                  <div className={`max-w-lg px-4 py-3 rounded-2xl rounded-bl-none shadow-md bg-background`}>
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                  </div>
              </div>
          )}
        </div>
        <div className="p-4 border-t border-border-color">
            {persona.engine === AIEngine.POLLINATIONS && (
              <div className="mb-4 p-3 rounded-md bg-yellow-500/10 text-yellow-200 border border-yellow-500/20 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">
                      <span className="font-semibold">Memory Notice:</span> This AI agent does not remember past conversations. Each message is treated as a new, independent prompt.
                  </p>
              </div>
            )}
            {selectedImage && (
                <div className="relative mb-2 w-20 h-20">
                    <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                        aria-label="Remove image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
             {persona.supportsImageUpload && (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-text-secondary hover:text-primary rounded-full transition-colors" title="Upload Image">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                </>
            )}
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 w-full px-4 py-2 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              disabled={isLoading}
            />
            <Button type="submit" isLoading={isLoading} disabled={(!userInput.trim() && !selectedImage) || isLoading}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatPage;