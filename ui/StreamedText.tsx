import React, { useState, useEffect, useMemo } from 'react';

interface StreamedTextProps {
  text: string;
}

const StreamedText: React.FC<StreamedTextProps> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  const typingSpeed = useMemo(() => {
    // Faster for shorter text, slower for longer text to feel more natural
    if (text.length < 100) return 20;
    if (text.length < 500) return 15;
    return 10;
  }, [text]);

  useEffect(() => {
    setDisplayedText('');
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(prev => text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
        }
      }, typingSpeed);
      return () => clearInterval(intervalId);
    }
  }, [text, typingSpeed]);

  return <p style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</p>;
};

export default StreamedText;
