// src/utils/labelRasterizer.js
import html2canvas from 'html2canvas-pro';

const CRITICAL_CSS_PROPERTIES = [
  'display',
  'flexDirection',
  'flexWrap',
  'alignItems',
  'justifyContent',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'boxSizing',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderTopStyle',
  'borderTopColor',
  'borderRightWidth',
  'borderRightStyle',
  'borderRightColor',
  'borderBottomWidth',
  'borderBottomStyle',
  'borderBottomColor',
  'borderLeftWidth',
  'borderLeftStyle',
  'borderLeftColor',
  'borderRadius',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textTransform',
  'whiteSpace',
  'wordBreak',
  'gap',
  'rowGap',
  'columnGap',
  'objectFit',
  'verticalAlign',
  'textDecoration',
  'backgroundColor',
  'color',
  'overflow',
  'position',
  'webkitTextSizeAdjust',
  'textSizeAdjust'
];

/**
 * Copies computed styles from the live preview DOM tree onto the target DOM tree.
 * This bakes all styles directly into inline style attributes so no external CSS is needed.
 */
function inlineAllComputedStyles(sourceElement, destElement) {
  if (!sourceElement || !destElement) return;

  const sourceNodes = [sourceElement, ...Array.from(sourceElement.querySelectorAll('*'))];
  const destNodes = [destElement, ...Array.from(destElement.querySelectorAll('*'))];

  const count = Math.min(sourceNodes.length, destNodes.length);
  for (let i = 0; i < count; i++) {
    const src = sourceNodes[i];
    const dest = destNodes[i];

    if (src.nodeType === 1 && dest.nodeType === 1) {
      const computed = window.getComputedStyle(src);
      
      for (const prop of CRITICAL_CSS_PROPERTIES) {
        let value = computed[prop];
        if (value) {
          // Normalize modern color spaces (oklch/lab) that can break canvas rendering
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('lab') || value.includes('lch'))) {
            if (prop === 'backgroundColor') {
              const isDark = src.classList.contains('bg-black') || src.classList.contains('bg-stone-900') || src.classList.contains('bg-stone-800');
              value = isDark ? '#000000' : '#ffffff';
            } else if (prop === 'color') {
              const isWhiteText = src.classList.contains('text-white') || src.classList.contains('text-stone-50');
              value = isWhiteText ? '#ffffff' : '#000000';
            } else if (prop.includes('Color')) {
              value = '#000000';
            }
          }
          dest.style[prop] = value;
        }
      }
    }
  }
}

/**
 * Captures an HTML element and renders it to a high-resolution 203 DPI canvas.
 * 75mm x 50mm = 600 x 400 pixels at 8 dots/mm (203.2 DPI).
 */
export async function rasterizeElementToCanvas(element, targetWidth = 600, targetHeight = 400) {
  if (!element) {
    throw new Error("No DOM element provided for rasterization.");
  }

  // Ensure fonts are explicitly loaded before capture
  if (document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('700 16px "Noto Sans"'),
        document.fonts.load('900 16px "Noto Sans"'),
        document.fonts.load('700 16px "Noto Sans Devanagari"'),
        document.fonts.load('900 16px "Noto Sans Devanagari"'),
        document.fonts.ready
      ]);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    } catch (e) {
      console.warn("Font loading wait skipped:", e);
    }
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Double resolution capture for crisp downsampling
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: async (clonedDoc) => {
        try {
          if (clonedDoc.documentElement) {
            clonedDoc.documentElement.style.webkitTextSizeAdjust = '100%';
            clonedDoc.documentElement.style.textSizeAdjust = '100%';
          }
          if (clonedDoc.body) {
            clonedDoc.body.style.webkitTextSizeAdjust = '100%';
            clonedDoc.body.style.textSizeAdjust = '100%';
          }
        } catch (_) {}

        // Transfer loaded FontFace instances directly into cloned iframe document
        if (document.fonts && clonedDoc.fonts) {
          try {
            for (const font of document.fonts) {
              clonedDoc.fonts.add(font);
            }
            await clonedDoc.fonts.ready;
          } catch (fontErr) {
            console.warn("Could not transfer fonts to clone:", fontErr);
          }
        }

        // 1. Copy all head styles and stylesheets into the cloned document
        try {
          const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
          styleTags.forEach(tag => {
            clonedDoc.head.appendChild(tag.cloneNode(true));
          });
        } catch (err) {
          console.warn("Could not copy stylesheet links:", err);
        }

        // 2. Locate the cloned preview root in the cloned document
        const clonedRoot = clonedDoc.querySelector('[data-label-preview="true"]') || clonedDoc.body.querySelector('div');
        if (clonedRoot) {
          clonedRoot.style.webkitTextSizeAdjust = '100%';
          clonedRoot.style.textSizeAdjust = '100%';
          inlineAllComputedStyles(element, clonedRoot);
        }
      }
    });

    // Scale down to exact target dimensions (600x400) with high quality
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    return finalCanvas;
  } catch (html2canvasError) {
    console.warn("html2canvas failed, falling back to direct native SVG foreignObject rasterizer:", html2canvasError);
    
    // Native Fallback: Zero-dependency SVG ForeignObject rendering
    return new Promise((resolve, reject) => {
      try {
        const clone = element.cloneNode(true);
        inlineAllComputedStyles(element, clone);

        const html = new XMLSerializer().serializeToString(clone);
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="width:${targetWidth}px;height:${targetHeight}px;background:#ffffff;margin:0;padding:0;box-sizing:border-box;">
                ${html}
              </div>
            </foreignObject>
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = targetWidth;
          fallbackCanvas.height = targetHeight;
          const ctx = fallbackCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          URL.revokeObjectURL(url);
          resolve(fallbackCanvas);
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(err);
        };

        img.src = url;
      } catch (fallbackError) {
        reject(fallbackError);
      }
    });
  }
}
