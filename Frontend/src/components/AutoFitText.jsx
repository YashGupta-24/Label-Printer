// src/components/AutoFitText.jsx
import { useRef, useLayoutEffect, useState } from 'react';

export default function AutoFitText({
  text,
  maxFontSize = 42,
  minFontSize = 16,
  allowWrap = false,
  wrapLineHeight = "1.2",
  singleLineHeight = "0.9",
  className = "",
  preferWrap = false,
  wordSpacing = "",
  align = "center",
}) {
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
        if (wordSpacing) {
          t.style.wordSpacing = wordSpacing;
        }
        let currentSize = maxFontSize;
        t.style.fontSize = `${currentSize}px`;

        const checkFit = () => {
          const widthFits = t.scrollWidth <= c.clientWidth;
          const heightFits = t.scrollHeight <= c.clientHeight;
          return widthFits && heightFits;
        };

        while (!checkFit() && currentSize > minFontSize) {
          currentSize -= 0.5;
          t.style.fontSize = `${currentSize}px`;
        }

        return { fits: checkFit(), size: currentSize };
      };

      if (preferWrap && allowWrap && text && String(text).trim().includes(' ')) {
        const wrapResult = calculateFit(true);
        if (wrapResult.fits) {
          setIsWrapping(true);
          return;
        }
      }

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

    window.addEventListener('beforeprint', runFit);

    return () => {
      isMounted = false;
      ro.disconnect();
      window.removeEventListener('beforeprint', runFit);
    };
  }, [text, maxFontSize, minFontSize, allowWrap, wrapLineHeight, singleLineHeight, preferWrap, wordSpacing]);

  const justifyClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden flex items-center ${justifyClass} ${className}`}>
      <span 
        ref={textRef} 
        style={{ 
          whiteSpace: isWrapping ? 'normal' : 'nowrap', 
          lineHeight: isWrapping ? wrapLineHeight : singleLineHeight, 
          display: 'inline-block',
          textAlign: align,
          maxWidth: '100%',
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
          ...(wordSpacing ? { wordSpacing } : {})
        }}
      >
        {text}
      </span>
    </div>
  );
}