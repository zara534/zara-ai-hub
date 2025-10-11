import React from 'react';

interface ImageModalProps {
  imageUrl: string;
  prompt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, prompt, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" 
      onClick={onClose}
      aria-modal="true" 
      role="dialog"
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white text-4xl z-[52] hover:text-primary transition-colors"
        aria-label="Close image view"
      >
        &times;
      </button>
      <div 
        className="relative flex flex-col items-center justify-center gap-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on the content
      >
        <img 
          src={imageUrl} 
          alt={prompt || 'Fullscreen view'}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
        {prompt && <p className="text-center text-text-secondary text-sm bg-black/50 p-2 rounded-md max-w-[90vw]">{prompt}</p>}
      </div>
    </div>
  );
};

export default ImageModal;
