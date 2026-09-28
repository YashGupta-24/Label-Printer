// src/components/AutoFitText.jsx
import React, { useRef, useLayoutEffect, useState } from 'react';

export default function AutoFitText({ text, maxFontSize = 42, minFontSize = 16, allowWrap = false, wrapLineHeight = "1.2", singleLineHeight = "0.9", className = "" }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isWrapping, setIsWrapping] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    // Reset wrapping state when text changes
    setIsWrapping(false);
    
    const calculateFit = (testWrapping) => {
      textElement.style.whiteSpace = testWrapping ? 'normal' : 'nowrap';
      textElement.style.lineHeight = testWrapping ? String(wrapLineHeight) : String(singleLineHeight);
      let currentSize = maxFontSize;
      textElement.style.fontSize = `${currentSize}px`;

      const checkFit = () => {
        // Tolerances for font rendering metrics
        const widthFits = textElement.scrollWidth <= (container.clientWidth + 1);
        const heightFits = textElement.scrollHeight <= (container.clientHeight + 2);
        return widthFits && heightFits;
      };

      while (!checkFit() && currentSize > minFontSize) {
        currentSize -= 0.5;
        textElement.style.fontSize = `${currentSize}px`;
      }
      
      return { fits: checkFit(), size: currentSize };
    };

    // Attempt 1: Force it onto a single line
    const singleLineResult = calculateFit(false);

    // If it failed to fit on one line (even at the minimum size) AND wrapping is allowed...
    if (!singleLineResult.fits && allowWrap) {
       // Attempt 2: Switch to two lines with comfortable line spacing
       setIsWrapping(true);
       calculateFit(true);
    }

  }, [text, maxFontSize, minFontSize, allowWrap, wrapLineHeight, singleLineHeight]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      <span 
        ref={textRef} 
        style={{ 
          whiteSpace: isWrapping ? 'normal' : 'nowrap', 
          lineHeight: isWrapping ? wrapLineHeight : singleLineHeight, 
          display: 'inline-block',
          textAlign: 'center',
          maxWidth: '100%'
        }}
      >
        {text}
      </span>
    </div>
  );
}