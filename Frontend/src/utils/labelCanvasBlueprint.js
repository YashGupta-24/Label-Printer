// src/utils/labelCanvasBlueprint.js
import fssaiLogo from '../assets/fssai_logo_crisp.png';

let cachedFssaiImage = null;

function loadFssaiImage() {
  if (cachedFssaiImage) return Promise.resolve(cachedFssaiImage);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      cachedFssaiImage = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = fssaiLogo;
  });
}

async function ensureFontsReady() {
  if (document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('700 16px "Noto Sans"'),
        document.fonts.load('900 16px "Noto Sans"'),
        document.fonts.load('700 16px "Noto Sans Devanagari"'),
        document.fonts.load('900 16px "Noto Sans Devanagari"'),
        document.fonts.ready
      ]);
    } catch (_) {}
  }
}

function fitText(ctx, text, maxWidth, maxFontSize, minFontSize, fontWeight = '900', fontFamily = "'Noto Sans', 'Noto Sans Devanagari', sans-serif") {
  let size = maxFontSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 1;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  return size;
}

function wrapTextLines(ctx, text, maxWidth, maxLines = 3) {
  const words = String(text || '').trim().split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function formatWeight(val) {
  const s = String(val || '150').trim();
  return s.toLowerCase().includes('g') ? s : `${s} g`;
}

function getNutritionValue(val) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return '0.0';
  }
  return String(val);
}

/**
 * Draws Template 1: Nutritional Facts & Product Details
 */
function drawTemplate1(ctx, product, { batchNo, packedOn }) {
  const rawNutrition = product?.nutritionalFacts || {};
  const name = String(product?.productName || "SAMPLE PRODUCT").toUpperCase();
  const weight = formatWeight(product?.netWeight || "150");
  const mrp = String(product?.mrp || "100.00");
  const batch = String(batchNo || "");
  const packed = String(packedOn || "");
  const ingredients = String(product?.ingredients || "INGREDIENTS PENDING").toUpperCase();

  const nutrition = {
    energy: getNutritionValue(rawNutrition.energy),
    protein: getNutritionValue(rawNutrition.protein),
    fat: getNutritionValue(rawNutrition.fat),
    carbs: getNutritionValue(rawNutrition.carbs),
    sugar: getNutritionValue(rawNutrition.sugar)
  };

  // 1. PRODUCT NAME (Y: 8 to 96)
  const nameFontSize = fitText(ctx, name, 570, 46, 16, '900');
  ctx.font = `900 ${nameFontSize}px 'Noto Sans', 'Noto Sans Devanagari', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 300, 52);

  // Separator Line (Y: 96)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(12, 96);
  ctx.lineTo(588, 96);
  ctx.stroke();

  // 2. TABLES (Y: 102 to 290, Height: 188px)
  const tableY = 102;
  const tableH = 188;

  // --- LEFT TABLE: Nutrition (X: 12 to 348, Width: 336px) ---
  const leftX = 12;
  const leftW = 336;
  ctx.lineWidth = 2;
  ctx.strokeRect(leftX, tableY, leftW, tableH);

  // Header (Height: 40px)
  const headerH = 40;
  ctx.strokeRect(leftX, tableY, leftW, headerH);
  ctx.font = "900 13px 'Noto Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("NUTRITIONAL FACTS (Approx.) Per 100g", leftX + leftW / 2, tableY + headerH / 2);

  // 5 Rows (Height: 148px / 5 = 29.6px)
  const rowsY = tableY + headerH;
  const rowH = (tableH - headerH) / 5;
  const leftColSplit = leftX + (leftW * 0.55); // 55% label, 45% value

  // Vertical divider between label and value
  ctx.beginPath();
  ctx.moveTo(leftColSplit, rowsY);
  ctx.lineTo(leftColSplit, tableY + tableH);
  ctx.stroke();

  const nutritionRows = [
    ["Energy Kcals", nutrition.energy],
    ["Protein", nutrition.protein],
    ["Total Fat", nutrition.fat],
    ["Carbohydrate", nutrition.carbs],
    ["Total Sugar", nutrition.sugar]
  ];

  nutritionRows.forEach(([lbl, val], idx) => {
    const curY = rowsY + idx * rowH;
    if (idx > 0) {
      ctx.beginPath();
      ctx.moveTo(leftX, curY);
      ctx.lineTo(leftX + leftW, curY);
      ctx.stroke();
    }
    const centerY = curY + rowH / 2;

    // Label
    ctx.textAlign = 'left';
    ctx.font = "700 13px 'Noto Sans', sans-serif";
    ctx.fillText(lbl, leftX + 8, centerY);

    // Value
    ctx.textAlign = 'left';
    ctx.font = "900 14px 'Noto Sans', sans-serif";
    ctx.fillText(val, leftColSplit + 8, centerY);
  });

  // --- RIGHT TABLE: Product Details (X: 356 to 588, Width: 232px) ---
  const rightX = 356;
  const rightW = 232;
  ctx.strokeRect(rightX, tableY, rightW, tableH);

  // Header
  ctx.strokeRect(rightX, tableY, rightW, headerH);
  ctx.textAlign = 'center';
  ctx.font = "900 14px 'Noto Sans', sans-serif";
  ctx.fillText("PRODUCT DETAILS", rightX + rightW / 2, tableY + headerH / 2);

  // 4 Rows (Height: 148px / 4 = 37px)
  const rightRowH = (tableH - headerH) / 4;
  const rightColSplit = rightX + (rightW * 0.45); // 45% label, 55% value

  // Vertical divider
  ctx.beginPath();
  ctx.moveTo(rightColSplit, rowsY);
  ctx.lineTo(rightColSplit, tableY + tableH);
  ctx.stroke();

  const detailRows = [
    ["Batch No.", batch],
    ["Net Wt.", weight],
    ["Packed On", packed],
    ["M.R.P", `₹ ${mrp}`]
  ];

  detailRows.forEach(([lbl, val], idx) => {
    const curY = rowsY + idx * rightRowH;
    if (idx > 0) {
      ctx.beginPath();
      ctx.moveTo(rightX, curY);
      ctx.lineTo(rightX + rightW, curY);
      ctx.stroke();
    }
    const centerY = curY + rightRowH / 2;

    if (lbl === "M.R.P") {
      // Label with "(Incl. all Taxes)" subtitle
      ctx.textAlign = 'left';
      ctx.font = "700 13px 'Noto Sans', sans-serif";
      ctx.fillText("M.R.P", rightX + 6, centerY - 6);
      ctx.font = "400 9px 'Noto Sans', sans-serif";
      ctx.fillText("(Incl. all Taxes)", rightX + 6, centerY + 8);

      // Value: large bold
      ctx.font = "900 20px 'Noto Sans', sans-serif";
      ctx.fillText(val, rightColSplit + 6, centerY);
    } else {
      ctx.textAlign = 'left';
      ctx.font = "700 13px 'Noto Sans', sans-serif";
      ctx.fillText(lbl, rightX + 6, centerY);

      ctx.font = "900 14px 'Noto Sans', sans-serif";
      ctx.fillText(val, rightColSplit + 6, centerY);
    }
  });

  // 3. INGREDIENTS & BEST BEFORE (Y: 294 to 395)
  ctx.textAlign = 'center';
  ctx.font = "900 12px 'Noto Sans', sans-serif";
  ctx.fillText("INGREDIENTS:", 300, 310);

  // Auto-wrap ingredients text
  ctx.font = "700 12px 'Noto Sans', sans-serif";
  const ingLines = wrapTextLines(ctx, ingredients, 560, 3);
  const ingStartY = ingLines.length === 1 ? 332 : ingLines.length === 2 ? 326 : 322;
  ingLines.forEach((line, i) => {
    ctx.fillText(line, 300, ingStartY + i * 15);
  });

  ctx.font = "900 12px 'Noto Sans', sans-serif";
  ctx.fillText("BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.", 300, 388);
}

/**
 * Draws Template 2: Product Details Only
 */
function drawTemplate2(ctx, product, { batchNo, packedOn }) {
  const name = String(product?.productName || "SAMPLE PRODUCT").toUpperCase();
  const weight = formatWeight(product?.netWeight || "250");
  const mrp = String(product?.mrp || "100.00");
  const batch = String(batchNo || "");
  const packed = String(packedOn || "");
  const ingredients = String(product?.ingredients || "").toUpperCase();

  // 1. PRODUCT NAME (Y: 10 to 98)
  const nameFontSize = fitText(ctx, name, 560, 48, 16, '900');
  ctx.font = `900 ${nameFontSize}px 'Noto Sans', 'Noto Sans Devanagari', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 300, 54);

  // Separator Line (Y: 102)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(16, 102);
  ctx.lineTo(584, 102);
  ctx.stroke();

  // 2. PRODUCT DETAILS TABLE (Y: 112 to 264, Height: 152px)
  const tableX = 16;
  const tableY = 112;
  const tableW = 568;
  const tableH = 152;

  ctx.lineWidth = 2;
  ctx.strokeRect(tableX, tableY, tableW, tableH);

  // Header (Height: 38px)
  const headerH = 38;
  ctx.strokeRect(tableX, tableY, tableW, headerH);
  ctx.font = "900 15px 'Noto Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("PRODUCT DETAILS", tableX + tableW / 2, tableY + headerH / 2);

  // 2 Rows of 4 Columns (Height: 114px / 2 = 57px each)
  const rowH = (tableH - headerH) / 2;
  const r1Y = tableY + headerH;
  const r2Y = r1Y + rowH;

  // Horizontal divider
  ctx.beginPath();
  ctx.moveTo(tableX, r2Y);
  ctx.lineTo(tableX + tableW, r2Y);
  ctx.stroke();

  // Column widths: 23%, 27%, 23%, 27%
  const col1W = tableW * 0.23; // 130.6
  const col2W = tableW * 0.27; // 153.4
  const col3W = tableW * 0.23; // 130.6
  const col4W = tableW * 0.27; // 153.4

  const x1 = tableX + col1W;
  const x2 = x1 + col2W;
  const x3 = x2 + col3W;

  // Vertical dividers
  [x1, x2, x3].forEach(vx => {
    ctx.beginPath();
    ctx.moveTo(vx, r1Y);
    ctx.lineTo(vx, tableY + tableH);
    ctx.stroke();
  });

  // Row 1: Batch No. & Packed On
  const r1Center = r1Y + rowH / 2;
  ctx.textAlign = 'left';
  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Batch No.", tableX + 8, r1Center);

  ctx.font = "900 16px 'Noto Sans', sans-serif";
  ctx.fillText(batch, x1 + 8, r1Center);

  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Packed On", x2 + 8, r1Center);

  ctx.font = "900 16px 'Noto Sans', sans-serif";
  ctx.fillText(packed, x3 + 8, r1Center);

  // Row 2: Net Wt. & M.R.P
  const r2Center = r2Y + rowH / 2;
  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Net Wt.", tableX + 8, r2Center);

  ctx.font = "900 16px 'Noto Sans', sans-serif";
  ctx.fillText(weight, x1 + 8, r2Center);

  // M.R.P with subtitle
  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("M.R.P", x2 + 8, r2Center - 7);
  ctx.font = "400 10px 'Noto Sans', sans-serif";
  ctx.fillText("(Incl. all Taxes)", x2 + 8, r2Center + 9);

  ctx.font = "900 22px 'Noto Sans', sans-serif";
  ctx.fillText(`₹ ${mrp}`, x3 + 8, r2Center);

  // 3. INGREDIENTS & BEST BEFORE (Y: 272 to 395)
  ctx.textAlign = 'center';
  ctx.font = "900 14px 'Noto Sans', sans-serif";
  ctx.fillText("INGREDIENTS:", 300, 290);

  ctx.font = "700 13px 'Noto Sans', sans-serif";
  const ingLines = wrapTextLines(ctx, ingredients, 560, 3);
  const ingStartY = ingLines.length === 1 ? 320 : ingLines.length === 2 ? 314 : 308;
  ingLines.forEach((line, i) => {
    ctx.fillText(line, 300, ingStartY + i * 17);
  });

  ctx.font = "900 13px 'Noto Sans', sans-serif";
  ctx.fillText("BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.", 300, 386);
}

/**
 * Draws Template 3: Sanchi Brand & Indian Food
 */
async function drawTemplate3(ctx, product, { batchNo, packedOn }) {
  const name = String(product?.productName || "ROASTED CHANA").toUpperCase();
  const weight = formatWeight(product?.netWeight || "300");
  const mrp = String(product?.mrp || "85.00");
  const batch = String(batchNo || "");
  const packed = String(packedOn || "");
  const ingredients = String(product?.ingredients || "ROASTED CHANA").toUpperCase();

  // 1. TOP TAGLINE WITH STARS (Y: 6 to 34)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = "900 16px 'Noto Sans Devanagari', 'Noto Sans', sans-serif";
  ctx.fillText("★  सेहत स्वाद साथ-साथ  ★", 300, 20);

  // 2. BLACK RIBBON BANNER - INDIAN FOOD (Y: 34 to 78, Height: 44px)
  ctx.fillStyle = '#000000';
  ctx.fillRect(12, 34, 576, 44);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = "900 24px 'Noto Sans', sans-serif";
  ctx.fillText("I N D I A N   F O O D", 300, 56);

  ctx.fillStyle = '#000000'; // Reset fill to black

  // 3. MAIN BORDERED BOX (Y: 86 to 280, Width: 576px, Height: 194px)
  const boxX = 12;
  const boxY = 86;
  const boxW = 576;
  const boxH = 194;

  ctx.lineWidth = 2;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Product Name Header (Height: 56px, Y: 86 to 142)
  const nameH = 56;
  ctx.strokeRect(boxX, boxY, boxW, nameH);
  const nameFontSize = fitText(ctx, name, 560, 36, 16, '900');
  ctx.font = `900 ${nameFontSize}px 'Noto Sans', 'Noto Sans Devanagari', sans-serif`;
  ctx.fillText(name, 300, boxY + nameH / 2);

  // 2x2 Details Grid (Y: 142 to 240, Height: 98px -> 49px each row)
  const gridY = boxY + nameH;
  const rowH = 49;
  const r2Y = gridY + rowH;

  ctx.beginPath();
  ctx.moveTo(boxX, r2Y);
  ctx.lineTo(boxX + boxW, r2Y);
  ctx.stroke();

  // Columns: 24%, 26%, 24%, 26%
  const col1W = boxW * 0.24;
  const col2W = boxW * 0.26;
  const col3W = boxW * 0.24;
  const col4W = boxW * 0.26;

  const x1 = boxX + col1W;
  const x2 = x1 + col2W;
  const x3 = x2 + col3W;

  [x1, x2, x3].forEach(vx => {
    ctx.beginPath();
    ctx.moveTo(vx, gridY);
    ctx.lineTo(vx, gridY + 98);
    ctx.stroke();
  });

  // Row 1: Batch No. & Packed On
  const r1Center = gridY + rowH / 2;
  ctx.textAlign = 'left';
  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Batch No.", boxX + 8, r1Center);

  ctx.font = "900 15px 'Noto Sans', sans-serif";
  ctx.fillText(batch, x1 + 8, r1Center);

  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Packed On", x2 + 8, r1Center);

  ctx.font = "900 15px 'Noto Sans', sans-serif";
  ctx.fillText(packed, x3 + 8, r1Center);

  // Row 2: Net Wt. & M.R.P
  const r2Center = r2Y + rowH / 2;
  ctx.font = "700 14px 'Noto Sans', sans-serif";
  ctx.fillText("Net Wt.", boxX + 8, r2Center);

  ctx.font = "900 15px 'Noto Sans', sans-serif";
  ctx.fillText(weight, x1 + 8, r2Center);

  ctx.font = "700 13px 'Noto Sans', sans-serif";
  ctx.fillText("M.R.P", x2 + 8, r2Center - 6);
  ctx.font = "400 9px 'Noto Sans', sans-serif";
  ctx.fillText("(Incl. of All Taxes)", x2 + 8, r2Center + 8);

  ctx.font = "900 20px 'Noto Sans', sans-serif";
  ctx.fillText(`₹ ${mrp}`, x3 + 8, r2Center);

  // FSSAI Row (Y: 240 to 280, Height: 40px)
  const fssaiY = gridY + 98;
  ctx.beginPath();
  ctx.moveTo(boxX, fssaiY);
  ctx.lineTo(boxX + boxW, fssaiY);
  ctx.stroke();

  const fssaiImg = await loadFssaiImage();
  const fssaiText = ": 22724674000012";
  ctx.font = "900 15px 'Noto Sans', sans-serif";
  const fssaiTextW = ctx.measureText(fssaiText).width;
  const fssaiImgW = 60;
  const fssaiImgH = 26;
  const totalFssaiW = fssaiImgW + 8 + fssaiTextW;
  const fssaiStartX = 300 - totalFssaiW / 2;

  if (fssaiImg) {
    ctx.drawImage(fssaiImg, fssaiStartX, fssaiY + 7, fssaiImgW, fssaiImgH);
  }
  ctx.textAlign = 'left';
  ctx.fillText(fssaiText, fssaiStartX + fssaiImgW + 8, fssaiY + 20);

  // 4. FOOTER DETAILS (Y: 284 to 395)
  ctx.textAlign = 'center';
  ctx.font = "900 12px 'Noto Sans', sans-serif";
  const ingFull = `INGREDIENTS: ${ingredients}`;
  ctx.fillText(ingFull, 300, 304);

  ctx.font = "900 11.5px 'Noto Sans', sans-serif";
  ctx.fillText("BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.", 300, 332);

  ctx.font = "900 11.5px 'Noto Sans', sans-serif";
  ctx.fillText("MANUFACTURED AND MARKETED BY: SANCHI FOOD PRODUCT", 300, 358);

  ctx.font = "900 11.5px 'Noto Sans', sans-serif";
  ctx.fillText("S.MANDIR, S.K. ROAD, MEERUT. HELP LINE: 9719027727", 300, 384);
}

/**
 * Draws Template 4: 3-in-1 Name Strips
 */
function drawTemplate4(ctx, product) {
  const name = String(product?.productName || "SAMPLE PRODUCT").toUpperCase();

  const stripH = 400 / 3; // 133.33px each

  for (let i = 0; i < 3; i++) {
    const centerY = (i + 0.5) * stripH;
    const fontSize = fitText(ctx, name, 560, 44, 16, '900');
    ctx.font = `900 ${fontSize}px 'Noto Sans', 'Noto Sans Devanagari', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 300, centerY);

    // Dashed divider line after strip 0 and 1
    if (i < 2) {
      const lineY = Math.round((i + 1) * stripH);
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(10, lineY);
      ctx.lineTo(590, lineY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }
  }
}

/**
 * Master Blueprint Renderer
 * Generates an exact 600x400 canvas directly without DOM screenshotting.
 */
export async function renderTemplateToCanvas(templateId, product, dates = {}) {
  await ensureFontsReady();

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Fill pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 400);

  // Defaults
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  switch (Number(templateId)) {
    case 1:
      drawTemplate1(ctx, product, dates);
      break;
    case 2:
      drawTemplate2(ctx, product, dates);
      break;
    case 3:
      await drawTemplate3(ctx, product, dates);
      break;
    case 4:
      drawTemplate4(ctx, product);
      break;
    default:
      drawTemplate1(ctx, product, dates);
      break;
  }

  return canvas;
}
