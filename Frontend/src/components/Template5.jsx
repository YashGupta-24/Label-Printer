// src/components/Template5.jsx
import React from 'react';
import AutoFitText from './AutoFitText';
import fssaiLogo from '../assets/fssai_logo_crisp.png';

export default function Template5({ product, batchNo, packedOn }) {
  const safeProduct = {
    productName: product?.productName || "ROASTED CHANA",
    netWeight: product?.netWeight || "150",
    mrp: product?.mrp || "120.00",
    ingredients: product?.ingredients || "ROASTED CHANA"
  };

  // Format net weight to avoid duplicating "gram" if user already typed it
  const formattedWeight = safeProduct.netWeight.toLowerCase().includes('g') 
    ? safeProduct.netWeight 
    : `${safeProduct.netWeight} g`;

  return (
    <div className="w-[75mm] h-[50mm] min-w-[75mm] min-h-[50mm] max-w-[75mm] max-h-[50mm] shrink-0 overflow-hidden bg-white text-black flex flex-col box-border px-[1.5mm] pt-[1mm] pb-[1mm] break-inside-avoid">
      
      {/* 1. TOP TAGLINE WITH STARS */}
      <div className="shrink-0 h-[3.8mm] w-full flex items-center justify-center text-black font-black text-[9.5px] leading-none tracking-[0.03em] whitespace-nowrap">
        <span className="text-[10px] mr-2">★</span>
        <span className="font-bold">सेहत स्वाद साथ-साथ</span>
        <span className="text-[10px] ml-2">★</span>
      </div>

      {/* 2. BLACK RIBBON BANNER - INDIAN FOOD */}
      <div className="shrink-0 h-[5.6mm] w-full bg-black text-white flex items-center justify-center font-black text-[13px] tracking-[0.22em] uppercase leading-none mt-[0.5mm] whitespace-nowrap">
        INDIAN FOOD
      </div>

      {/* 3. MIDDLE SECTION: PRODUCT NAME + DETAILS TABLE */}
      <div className="shrink-0 flex w-full h-[23mm] justify-between items-center mt-[0.6mm]">
        
        {/* --- LEFT SIDE: Product Name & FSSAI --- */}
        <div className="w-[51%] flex flex-col items-center justify-between h-full">
          
          {/* Product Name */}
          <div className="w-full flex-1 flex items-center justify-center text-black px-[0.5mm] overflow-hidden">
            <AutoFitText 
              text={safeProduct.productName} 
              maxFontSize={48} 
              minFontSize={13} 
              allowWrap={true}
              preferWrap={true}
              wrapLineHeight="1.2"
              singleLineHeight="0.95"
              wordSpacing="0.25em"
              className="font-black uppercase tracking-[0.03em] text-center"
            />
          </div>

          {/* FSSAI Logo & License */}
          <div className="h-[3.6mm] w-full flex items-center justify-center whitespace-nowrap mt-[0.2mm]">
            <img src={fssaiLogo} alt="fssai" className="h-[3.0mm] w-auto object-contain inline-block mr-1" />
            <span className="font-black text-[8.5px] tracking-[0.03em] leading-none">: 22724674000012</span>
          </div>

        </div>

        {/* --- RIGHT SIDE: Product Details Table --- */}
        <div className="w-[47%] h-full border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold tracking-[0.02em]">
          
          {/* Header: PRODUCT DETAILS (Full-width) */}
          <div className="h-[4.4mm] flex items-center justify-center text-center border-b-[1.5px] border-black whitespace-nowrap tracking-[0.04em] font-black text-[7.5px] uppercase">
            PRODUCT DETAILS
          </div>

          {/* Row 1: Batch No. */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[46%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">
              Batch No.
            </div>
            <div className="w-[54%] h-full flex items-center px-[2px] font-black text-[8.5px] whitespace-nowrap">
              {batchNo}
            </div>
          </div>

          {/* Row 2: Net Wt. */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[46%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">
              Net Wt.
            </div>
            <div className="w-[54%] h-full flex items-center px-[2px] font-black text-[8.5px] whitespace-nowrap">
              {formattedWeight}
            </div>
          </div>

          {/* Row 3: Packed On */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[46%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">
              Packed On
            </div>
            <div className="w-[54%] h-full flex items-center px-[2px] font-black text-[8.5px] whitespace-nowrap">
              {packedOn}
            </div>
          </div>

          {/* Row 4: M.R.P */}
          <div className="flex flex-1 items-center bg-white">
            <div className="w-[46%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px] leading-tight">
              <span className="text-[7.5px] font-bold whitespace-nowrap">M.R.P</span>
              <span className="text-[6px] font-normal leading-none whitespace-nowrap">(Incl. of All Taxes)</span>
            </div>
            <div className="w-[54%] h-full flex items-center px-[2px] text-[11px] font-black tracking-normal whitespace-nowrap">
              ₹ {safeProduct.mrp}
            </div>
          </div>

        </div>

      </div>

      {/* 4. FOOTER DETAILS */}
      <div className="flex-1 w-full flex flex-col justify-start items-center text-center mt-[0.6mm] gap-[0.4mm]">
        
        {/* Ingredients */}
        <div className="shrink-0 w-[98%] h-[3.8mm] flex items-center justify-center">
          <AutoFitText 
            text={`INGREDIENTS: ${safeProduct.ingredients}`} 
            maxFontSize={7.5} 
            minFontSize={5.5} 
            allowWrap={true}  
            wrapLineHeight="1.15"
            className="font-bold uppercase tracking-[0.03em]"
          />
        </div>

        {/* Best Before */}
        <div className="shrink-0 text-[6.8px] font-black uppercase leading-tight tracking-[0.03em] whitespace-nowrap">
          BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.
        </div>

        {/* Manufactured & Marketed By */}
        <div className="shrink-0 text-[6.8px] font-black uppercase leading-tight tracking-[0.03em] whitespace-nowrap">
          MANUFACTURED AND MARKETED BY: SANCHI FOOD PRODUCT
        </div>

        {/* Address & Helpline */}
        <div className="shrink-0 text-[6.8px] font-black uppercase leading-tight tracking-[0.03em] whitespace-nowrap">
          S.MANDIR, S.K. ROAD, MEERUT. HELP LINE: 9719027727
        </div>

      </div>

    </div>
  );
}
