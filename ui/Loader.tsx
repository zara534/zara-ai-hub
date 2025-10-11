
import React from 'react';

const Loader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent"></div>
      <p className="mt-4 text-lg font-semibold text-text-secondary">{text}</p>
    </div>
  );
};

export default Loader;
   