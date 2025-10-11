import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center" 
      aria-modal="true" 
      role="dialog"
    >
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md m-4 border border-border-color" role="document">
        <div className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
          <div className="text-text-secondary">{children}</div>
        </div>
        <div className="bg-background/50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg border-t border-border-color">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-primary bg-surface hover:bg-border-color rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;