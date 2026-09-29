// src/components/AutoFitText.jsx
import React, { useRef, useLayoutEffect, useState } from 'react';

export default function AutoFitText({ text, maxFontSize = 42, minFontSize = 16, allowWrap = false, wrapLineHeight = "1.2", singleLineHeight = "0.9", className = "" }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isWrapping, setIsWrapping] = useState(false);

  useLayoutEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    const runFit = () => {
      if (!isMounted || !containerRef.current || !textRef.current) return;
      const c = containerRef.current;
      const t = textRef.current;

      setIsWrapping(false);

      const calculateFit = (testWrapping) => {
        t.style.whiteSpace = testWrapping ? 'normal' : 'nowrap';
        t.style.lineHeight = testWrapping ? String(wrapLineHeight) : String(singleLineHeight);
        let currentSize = maxFontSize;
        t.style.fontSize = `${currentSize}px`;

        const checkFit = () => {
          const widthFits = t.scrollWidth <= (c.clientWidth + 1);
          const heightFits = t.scrollHeight <= (c.clientHeight + 2);
          return widthFits && heightFits;
        };

        while (!checkFit() && currentSize > minFontSize) {
          currentSize -= 0.5;
          t.style.fontSize = `${currentSize}px`;
        }

        return { fits: checkFit(), size: currentSize };
      };

      const singleLineResult = calculateFit(false);

      if (!singleLineResult.fits && allowWrap) {
        setIsWrapping(true);
        calculateFit(true);
      }
    };

    runFit();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (isMounted) runFit();
      });
    }

    const ro = new ResizeObserver(() => {
      if (isMounted) runFit();
    });
    ro.observe(container);

    return () => {
      isMounted = false;
      ro.disconnect();
    };
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
          maxWidth: '100%',
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%'
        }}
      >
        {text}
      </span>
    </div>
  );
}