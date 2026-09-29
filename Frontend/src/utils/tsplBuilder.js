// src/utils/tsplBuilder.js

/**
 * Converts an HTML Canvas or ImageData into a TSPL BITMAP command buffer.
 * 
 * Target Printer: TSC TTP-244 Pro (203 DPI = 8 dots/mm)
 * Label Size: 75mm x 50mm -> 600 dots wide x 400 dots high
 * Width in Bytes = 600 dots / 8 = 75 bytes per row
 */
export function buildTsplBuffer(canvas, copies = 1, options = {}) {
  const {
    widthMm = 75,
    heightMm = 50,
    gapMm = 3,
    direction = 1,
    threshold = 140
  } = options;

  const targetWidth = Math.round(widthMm * 8); // 600 dots
  const targetHeight = Math.round(heightMm * 8); // 400 dots
  const widthBytes = Math.ceil(targetWidth / 8); // 75 bytes

  // Create or resize canvas to target dimensions
  let srcCanvas = canvas;
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    const ctx = resizedCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    srcCanvas = resizedCanvas;
  }

  const ctx = srcCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Build binary 1-bit bitmap
  // In TSPL mode 0: 0 bit = Black (Print), 1 bit = White (Don't print)
  const bitmapSize = widthBytes * targetHeight;
  const bitmapData = new Uint8Array(bitmapSize);

  let byteIdx = 0;
  for (let y = 0; y < targetHeight; y++) {
    for (let byteX = 0; byteX < widthBytes; byteX++) {
      let byteVal = 0xFF; // All white by default
      for (let bit = 0; bit < 8; bit++) {
        const x = byteX * 8 + bit;
        if (x < targetWidth) {
          const pixelIdx = (y * targetWidth + x) * 4;
          const r = data[pixelIdx];
          const g = data[pixelIdx + 1];
          const b = data[pixelIdx + 2];
          const a = data[pixelIdx + 3];

          // Calculate luminance (grayscale)
          const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
          
          // If transparent or white -> White (1). If dark -> Black (0)
          if (a > 50 && luminance < threshold) {
            byteVal &= ~(1 << (7 - bit)); // Clear bit to 0 for Black dot
          }
        }
      }
      bitmapData[byteIdx++] = byteVal;
    }
  }

  // Build TSPL Command text
  const headerText = [
    `SIZE ${widthMm} mm, ${heightMm} mm`,
    `GAP ${gapMm} mm, 0 mm`,
    `DIRECTION ${direction}, 0`,
    `DENSITY 12`,
    `SPEED 2`,
    `CLS`,
    `BITMAP 0,0,${widthBytes},${targetHeight},0,`
  ].join('\r\n');

  const footerText = `\r\nPRINT ${copies}, 1\r\n`;

  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(headerText);
  const footerBytes = encoder.encode(footerText);

  // Combine header + raw binary bitmap + footer
  const totalLength = headerBytes.length + bitmapData.length + footerBytes.length;
  const fullBuffer = new Uint8Array(totalLength);

  fullBuffer.set(headerBytes, 0);
  fullBuffer.set(bitmapData, headerBytes.length);
  fullBuffer.set(footerBytes, headerBytes.length + bitmapData.length);

  return fullBuffer;
}
