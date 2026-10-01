// src/components/Template2.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template2({ product, batchNo, packedOn }) {
  const safeProduct = {
    productName: product?.productName || "SAMPLE PRODUCT",
    netWeight: product?.netWeight || "250",
    mrp: product?.mrp || "100.00",
    ingredients: product?.ingredients || "CHANA, KABULI CHANA, PEANUT, MATAR, HEENG JEERA, SPICES, PEANUT OIL, IODISED SALT."
  };

  // Format net weight to avoid duplicating "gram" if user already typed it
  const formattedWeight = safeProduct.netWeight.toLowerCase().includes('g') 
    ? safeProduct.netWeight 
    : `${safeProduct.netWeight} g`;

  return (
    <div className="w-[75mm] h-[50mm] min-w-[75mm] min-h-[50mm] max-w-[75mm] max-h-[50mm] shrink-0 overflow-hidden bg-white text-black flex flex-col box-border px-[2mm] pt-[1.5mm] pb-[1.5mm] break-inside-avoid">
      
      {/* 1. PRODUCT NAME */}
      <div className="shrink-0 h-[12mm] w-full flex items-center justify-center font-black uppercase tracking-[0.04em] text-center p-0 m-0">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={48} 
          minFontSize={16} 
          allowWrap={false} 
          className="flex items-center justify-center font-black tracking-[0.04em]"
        />
      </div>
      
      {/* THICK SEPARATOR LINE */}
      <div className="shrink-0 w-full border-b-[2px] border-black my-[1mm]"></div>
      
      {/* 2. PRODUCT DETAILS TABLE */}
      <div className="shrink-0 flex flex-col w-full h-[19mm] border-[2px] border-black text-[9px] leading-tight font-bold tracking-[0.03em]">
        
        {/* Table Header */}
        <div className="h-[4.8mm] flex items-center justify-center text-center border-b-[1.5px] border-black uppercase tracking-[0.05em] font-black whitespace-nowrap text-[8.5px]">
          PRODUCT DETAILS
        </div>
        
        {/* Row 1: Batch No & Packed On */}
        <div className="flex border-b-[1.5px] border-black flex-1 items-center">
          <div className="w-[23%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
            Batch No.
          </div>
          <div className="w-[27%] h-full flex items-center border-r-[1.5px] border-black px-[3px] font-black text-[9.5px] whitespace-nowrap">
            {batchNo}
          </div>
          <div className="w-[23%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
            Packed On
          </div>
          <div className="w-[27%] h-full flex items-center px-[3px] font-black text-[9.5px] whitespace-nowrap">
            {packedOn}
          </div>
        </div>

        {/* Row 2: Net Wt & M.R.P */}
        <div className="flex flex-1 items-center">
          <div className="w-[23%] h-full flex items-center border-r-[1.5px] border-black px-[3px] text-[8.5px] whitespace-nowrap">
            Net Wt.
          </div>
          <div className="w-[27%] h-full flex items-center border-r-[1.5px] border-black px-[3px] font-black text-[9.5px] whitespace-nowrap">
            {formattedWeight}
          </div>
          <div className="w-[23%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px] leading-tight">
            <span className="text-[8px] whitespace-nowrap">M.R.P</span>
            <span className="text-[6.5px] font-normal leading-none whitespace-nowrap">(Incl. of all Taxes)</span>
          </div>
          <div className="w-[27%] h-full flex items-center px-[3px] text-[11.5px] font-black tracking-normal whitespace-nowrap">
            ₹ {safeProduct.mrp}
          </div>
        </div>

      </div>

      {/* 3. INGREDIENTS & BEST BEFORE */}
      <div className="flex-1 w-full flex flex-col justify-center items-center text-center gap-[1mm] mt-[1mm]">
        
        {/* Title */}
        <div className="shrink-0 font-black text-[8px] tracking-[0.04em] leading-none whitespace-nowrap">INGREDIENTS:</div>
        
        {/* List */}
        <div className="shrink-0 w-[96%] min-h-[4mm] max-h-[5.8mm] flex items-center justify-center">
          <AutoFitText 
            text={safeProduct.ingredients} 
            maxFontSize={8.5} 
            minFontSize={6.5} 
            allowWrap={true}  
            wrapLineHeight="1.25"
            className="font-bold uppercase tracking-[0.04em]"
          />
        </div>
        
        {/* Best Before */}
        <div className="shrink-0 text-[7.5px] font-black uppercase leading-none tracking-[0.03em] whitespace-nowrap">
          BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.
        </div>
        
      </div>

    </div>
  );
}
