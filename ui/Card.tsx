import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // Fix: Add style prop to allow inline styling.
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className, style }) => {
  return (
    <div 
      className={`bg-surface/70 backdrop-blur-sm border border-border-color rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 hover:border-primary/50 ${className}`}
      // Fix: Apply the style prop to the div element.
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
