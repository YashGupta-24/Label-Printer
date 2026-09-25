// src/components/AutoFitText.jsx
import React, { useRef, useLayoutEffect, useState } from 'react';

export default function AutoFitText({ text, maxFontSize = 35, minFontSize = 28, allowWrap = false, className = "" }) {
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
      let currentSize = maxFontSize;
      textElement.style.fontSize = `${currentSize}px`;

      const checkFit = () => {
        const widthFits = textElement.scrollWidth <= (container.clientWidth * 0.95);
        const heightFits = textElement.scrollHeight <= (container.clientHeight * 0.95);
        return widthFits && heightFits;
      };

      while (!checkFit() && currentSize > minFontSize) {
        currentSize -= 1;
        textElement.style.fontSize = `${currentSize}px`;
      }
      
      return { fits: checkFit(), size: currentSize };
    };

    // Attempt 1: Force it onto a single line
    const singleLineResult = calculateFit(false);

    // If it failed to fit on one line (even at the minimum size) AND wrapping is allowed...
    if (!singleLineResult.fits && allowWrap) {
       // Attempt 2: Switch to two lines
       setIsWrapping(true);
       calculateFit(true);
    }

  }, [text, maxFontSize, minFontSize, allowWrap]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      <div 
        ref={textRef} 
        style={{ 
          whiteSpace: isWrapping ? 'normal' : 'nowrap', 
          lineHeight: isWrapping ? '0.95' : '1', 
          width: '100%', 
          textAlign: 'center' 
        }}
      >
        {text}
      </div>
    </div>
  );
}