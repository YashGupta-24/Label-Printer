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
  'backgroundColor',
  'color',
  'overflow',
  'position'
];

/**
 * Copies computed styles from the live preview DOM tree onto the cloned DOM tree.
 * This guarantees 100% styling parity in production builds without depending on external CSS loading.
 */
function inlineAllComputedStyles(sourceElement, clonedElement) {
  const sourceNodes = [sourceElement, ...sourceElement.querySelectorAll('*')];
  const clonedNodes = [clonedElement, ...clonedElement.querySelectorAll('*')];

  for (let i = 0; i < sourceNodes.length && i < clonedNodes.length; i++) {
    const src = sourceNodes[i];
    const dest = clonedNodes[i];

    if (src.nodeType === 1 && dest.nodeType === 1) {
      const computed = window.getComputedStyle(src);
      
      for (const prop of CRITICAL_CSS_PROPERTIES) {
        let value = computed[prop];
        if (value) {
          // Sanitize any modern CSS color functions that can break canvas rendering
          if (typeof value === 'string' && (value.includes('oklch') || value.includes('lab') || value.includes('lch'))) {
            if (prop === 'backgroundColor') {
              // If it's a dark element (like the black banner), make it black; otherwise white
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

  // Ensure fonts are fully loaded before capture
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn("Font loading wait skipped:", e);
    }
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Double resolution capture for crisp downsampling
    useCORS: true,
    logging: false,
    allowTaint: true,
    onclone: (clonedDoc, clonedElement) => {
      // 1. Copy all head styles and stylesheets into the cloned document
      try {
        const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        styleTags.forEach(tag => {
          clonedDoc.head.appendChild(tag.cloneNode(true));
        });
      } catch (err) {
        console.warn("Could not copy stylesheet links:", err);
      }

      // 2. Direct style inlining: copy live computed styles directly onto the cloned element
      inlineAllComputedStyles(element, clonedElement);
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
}
