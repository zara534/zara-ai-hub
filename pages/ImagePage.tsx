import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import { generateImageUrl } from '../services/pollinationsService';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import Card from '../ui/Card';
import ImageModal from '../ui/ImageModal';
import Toast from '../ui/Toast';

const MAX_HISTORY = 4;

interface GeneratedImage {
  url: string;
  prompt: string; // The full prompt sent to the API
  userPrompt: string; // Just the user's input
  style: string;
  aspectRatio: string;
}

const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

const styles = [
  { id: 'none', name: 'No Specific Style' },
  { id: 'photorealistic', name: 'Photorealistic' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'anime', name: 'Anime' },
  { id: 'fantasy', name: 'Fantasy Art' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'pixelart', name: 'Pixel Art' },
];


const ImagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPersonaById } = useAI();
  const persona = id ? getPersonaById(id) : undefined;
  
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState(styles[0].id);

  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [isActionMenuOpen, setActionMenuOpen] = useState(false);
  const [activeHistoryMenu, setActiveHistoryMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target as Node)) {
        setActiveHistoryMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  if (!persona) {
    return <Navigate to="/" />;
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setIsImageLoaded(false);

    const stylePrompt = style !== 'none' ? `${style}, ` : '';
    
    const fullPrompt = `${prompt}, ${stylePrompt}${persona.systemPrompt}`;
    const url = generateImageUrl(fullPrompt, persona.model || 'flux', aspectRatio);
    
    const newImage: GeneratedImage = {
      url,
      prompt: fullPrompt,
      userPrompt: prompt,
      style: style,
      aspectRatio: aspectRatio,
    };

    setActiveImage(newImage);
    setImageHistory(prev => [newImage, ...prev].slice(0, MAX_HISTORY));
    setPrompt(''); // Clear prompt for a fresh start
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setIsImageLoaded(true);
  };
  
  const handleDeleteImage = (urlToDelete: string) => {
    setImageHistory(prev => prev.filter(img => img.url !== urlToDelete));
    if (activeImage?.url === urlToDelete) {
        setActiveImage(null);
    }
  };
  
  const handleReusePrompt = (imageToReuse: GeneratedImage) => {
    setPrompt(imageToReuse.userPrompt);
    setStyle(imageToReuse.style);
    setAspectRatio(imageToReuse.aspectRatio);
    document.getElementById('image-generation-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCopyPrompt = async (promptToCopy: string) => {
    if (!navigator.clipboard) {
      showToast('Clipboard API not available.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(promptToCopy);
      showToast('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      showToast('Failed to copy prompt.', 'error');
    }
  };


  const handleDownload = async () => {
    if (!activeImage) return;
    try {
      const response = await fetch(activeImage.url);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${activeImage.prompt.slice(0, 30).replace(/ /g, '_') || 'generated-image'}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Direct download failed, likely due to CORS. Falling back to opening in new tab.", error);
      window.open(activeImage.url, '_blank');
    }
  };

  const baseInputStyles = "w-full px-4 py-3 bg-background border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary";
  const labelStyles = "block text-sm font-medium text-text-secondary mb-2";

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {fullscreenImage && (
        <ImageModal
          imageUrl={fullscreenImage.url}
          prompt={fullscreenImage.prompt}
          onClose={() => setFullscreenImage(null)}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary">{persona.name}</h2>
            <p className="text-text-secondary mt-2 max-w-2xl mx-auto">{persona.description}</p>
          </div>
          
          <form id="image-generation-form" onSubmit={handleGenerateImage} className="space-y-6 mb-8">
            <div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  className={`flex-1 ${baseInputStyles}`}
                />
                <Button type="submit" isLoading={isLoading} disabled={!prompt.trim() || isLoading} className="w-full sm:w-auto">
                  Generate
                </Button>
              </div>
              {persona.examplePrompt && (
                <div className="text-sm text-text-secondary mt-2 px-1">
                  <strong>Example:</strong> {persona.examplePrompt}
                  <button 
                    type="button" 
                    onClick={() => setPrompt(persona.examplePrompt!)}
                    className="ml-2 font-semibold text-primary hover:underline focus:outline-none"
                  >
                    Try it
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border-color">
               <div className="space-y-4">
                   <div>
                      <label htmlFor="style-select" className={labelStyles}>Artistic Style</label>
                      <select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} className={baseInputStyles}>
                          {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                   </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className={labelStyles}>Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                      {aspectRatios.map(ar => (
                          <button
                              key={ar}
                              type="button"
                              onClick={() => setAspectRatio(ar)}
                              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${aspectRatio === ar ? 'bg-primary text-background' : 'bg-surface hover:bg-border-color/50 text-text-secondary'}`}
                          >
                              {ar}
                          </button>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-3">
                <div className="w-full aspect-square bg-surface rounded-lg flex items-center justify-center border-2 border-dashed border-border-color relative overflow-hidden">
                    {/* Image or Placeholder */}
                    {activeImage ? (
                      <img
                        src={activeImage.url}
                        alt={activeImage.prompt}
                        onLoad={handleImageLoad}
                        onClick={() => setFullscreenImage(activeImage)}
                        className={`w-full h-full object-contain rounded-lg transition-opacity duration-500 cursor-pointer ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      />
                    ) : (
                      !isLoading && (
                        <div className="text-center text-text-secondary p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-border-color" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="mt-2">Your generated image will appear here.</p>
                        </div>
                      )
                    )}

                    {/* Loading Overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                        <Loader text="Generating your masterpiece..." />
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                {isImageLoaded && activeImage && (
                  <div className="flex justify-end relative" ref={actionMenuRef}>
                    <button onClick={() => setActionMenuOpen(p => !p)} className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-color/20 transition-colors" title="Image actions">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                     {isActionMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border-color rounded-md shadow-lg z-10 p-1">
                            <ul className="space-y-1">
                                <li><button onClick={() => { handleCopyPrompt(activeImage.prompt); setActionMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 hover:bg-border-color/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Prompt</button></li>
                                <li><button onClick={() => { handleReusePrompt(activeImage); setActionMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 hover:bg-border-color/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm10.293 9.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L15 16.414V18a1 1 0 11-2 0v-1.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" /></svg> Reuse Settings</button></li>
                                <li><button onClick={() => { setFullscreenImage(activeImage); setActionMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 hover:bg-border-color/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M3.75 20.25h4.5m-4.5 0v-4.5m0 4.5L9 15" /></svg> View Fullscreen</button></li>
                                <li><button onClick={() => { handleDownload(); setActionMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-3 hover:bg-border-color/50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg> Download Image</button></li>
                            </ul>
                        </div>
                    )}
                  </div>
                )}
            </div>
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-3 text-text-secondary">History</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {imageHistory.map((img) => (
                  <div key={img.url} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      onClick={() => setActiveImage(img)}
                      className={`w-full h-full object-cover rounded-md cursor-pointer border-2 transition-all ${activeImage?.url === img.url ? 'border-primary' : 'border-transparent hover:border-text-secondary/50'}`}
                    />
                    <div className="absolute top-1 right-1">
                        <button onClick={(e) => { e.stopPropagation(); setActiveHistoryMenu(activeHistoryMenu === img.url ? null : img.url); }} className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100" title="Image Actions">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                    </div>
                    {activeHistoryMenu === img.url && (
                        <div ref={historyMenuRef} className="absolute top-10 right-1 w-48 bg-surface border border-border-color rounded-md shadow-lg z-20 p-1">
                            <ul className="space-y-1 text-sm text-text-primary">
                                <li><button onClick={(e) => { e.stopPropagation(); handleCopyPrompt(img.prompt); setActiveHistoryMenu(null); }} className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-border-color/50">Copy Prompt</button></li>
                                <li><button onClick={(e) => { e.stopPropagation(); handleReusePrompt(img); setActiveHistoryMenu(null); }} className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-border-color/50">Reuse Settings</button></li>
                                <li><button onClick={(e) => { e.stopPropagation(); setFullscreenImage(img); setActiveHistoryMenu(null); }} className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-border-color/50">View Fullscreen</button></li>
                                <li><button onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.url); setActiveHistoryMenu(null); }} className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-border-color/50 text-red-500">Delete</button></li>
                            </ul>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ImagePage;
