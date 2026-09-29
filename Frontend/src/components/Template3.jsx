// src/components/Template3.jsx
import React from 'react';
import AutoFitText from './AutoFitText';
import fssaiLogo from '../assets/fssai_logo_crisp.png';

export default function Template3({ product, batchNo, packedOn }) {
  const safeProduct = {
    productName: product?.productName || "ROASTED CHANA",
    netWeight: product?.netWeight || "300 gram",
    mrp: product?.mrp || "85.00",
    ingredients: product?.ingredients || "ROASTED CHANA"
  };

  // Format net weight to avoid duplicating "gram" if user already typed it
  const formattedWeight = safeProduct.netWeight.toLowerCase().includes('g') 
    ? safeProduct.netWeight 
    : `${safeProduct.netWeight} gram`;

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

      {/* 3. MAIN BORDERED BOX */}
      <div className="shrink-0 flex flex-col w-full border-[2px] border-black mt-[0.8mm]">
        
        {/* Product Name Header */}
        <div className="h-[7.2mm] w-full flex items-center justify-center font-black uppercase tracking-[0.04em] text-center p-0 m-0 border-b-[1.8px] border-black">
          <AutoFitText 
            text={safeProduct.productName} 
            maxFontSize={36} 
            minFontSize={14} 
            allowWrap={false} 
            className="flex items-center justify-center font-black tracking-[0.04em]"
          />
        </div>

        {/* 2x2 Details Grid */}
        <div className="flex flex-col w-full h-[12.2mm] text-[8.5px] leading-tight font-bold tracking-[0.03em]">
          
          {/* Row 1: Batch No. & Packed On */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[24%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
              Batch No.
            </div>
            <div className="w-[26%] h-full flex items-center border-r-[2px] border-black px-[3px] font-black text-[9.5px] whitespace-nowrap">
              {batchNo}
            </div>
            <div className="w-[24%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
              Packed On
            </div>
            <div className="w-[26%] h-full flex items-center px-[3px] font-black text-[9.5px] whitespace-nowrap">
              {packedOn}
            </div>
          </div>

          {/* Row 2: Net Wt. & M.R.P */}
          <div className="flex flex-1 items-center">
            <div className="w-[24%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
              Net Wt.
            </div>
            <div className="w-[26%] h-full flex items-center border-r-[2px] border-black px-[3px] font-black text-[9.5px] whitespace-nowrap">
              {formattedWeight}
            </div>
            <div className="w-[24%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px] leading-tight">
              <span className="text-[7.5px] font-bold whitespace-nowrap">M.R.P</span>
              <span className="text-[5.5px] font-normal leading-none whitespace-nowrap tracking-tight">(Incl. of All Taxes)</span>
            </div>
            <div className="w-[26%] h-full flex items-center px-[3px] text-[11px] font-black tracking-normal whitespace-nowrap">
              ₹ {safeProduct.mrp}
            </div>
          </div>

        </div>

        {/* FSSAI Row */}
        <div className="h-[4.2mm] w-full flex items-center justify-center border-t-[1.5px] border-black px-2 whitespace-nowrap">
          <img src={fssaiLogo} alt="fssai" className="h-[3.2mm] w-auto object-contain inline-block mr-1" />
          <span className="font-black text-[9px] tracking-[0.04em] leading-none">: 22724674000012</span>
        </div>

      </div>

      {/* 4. FOOTER DETAILS */}
      <div className="flex-1 w-full flex flex-col justify-center items-center text-center mt-[0.8mm] gap-[0.3mm]">
        
        {/* Ingredients */}
        <div className="shrink-0 w-full flex items-center justify-center font-black text-[7px] uppercase leading-tight tracking-[0.04em] text-center">
          <span className="font-black shrink-0">INGREDIENTS:&nbsp;</span>
          <span className="font-bold">{safeProduct.ingredients}</span>
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
