// src/utils/labelRasterizer.js
import html2canvas from 'html2canvas-pro';

/**
 * Captures an HTML element and renders it to a high-resolution 203 DPI canvas.
 * 75mm x 50mm = 600 x 400 pixels at 8 dots/mm (203.2 DPI).
 */
export async function rasterizeElementToCanvas(element, targetWidth = 600, targetHeight = 400) {
  if (!element) {
    throw new Error("No DOM element provided for rasterization.");
  }

  // Ensure fonts and images are fully loaded
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
    onclone: (clonedDoc) => {
      // Clean up any potential Tailwind v4 oklch styles in cloned DOM
      const allElements = clonedDoc.querySelectorAll('*');
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        if (computed.backgroundColor && computed.backgroundColor.includes('oklch')) {
          el.style.backgroundColor = '#ffffff';
        }
        if (computed.color && computed.color.includes('oklch')) {
          el.style.color = '#000000';
        }
        if (computed.borderColor && computed.borderColor.includes('oklch')) {
          el.style.borderColor = '#000000';
        }
      });
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
