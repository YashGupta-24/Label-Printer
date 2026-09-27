// src/components/Template1.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template1({ product, batchNo, packedOn }) {
  const safeProduct = {
    productName: product?.productName || "SAMPLE PRODUCT",
    netWeight: product?.netWeight || "150 g",
    mrp: product?.mrp || "100.00",
    ingredients: product?.ingredients || "INGREDIENTS PENDING",
    nutritionalFacts: {
      energy: product?.nutritionalFacts?.energy || "0.0",
      protein: product?.nutritionalFacts?.protein || "0.0",
      fat: product?.nutritionalFacts?.fat || "0.0",
      carbs: product?.nutritionalFacts?.carbs || "0.0",
      sugar: product?.nutritionalFacts?.sugar || "0.0",
      ...(product?.nutritionalFacts || {})
    }
  };

  return (
    <div className="w-[75mm] h-[50mm] overflow-hidden bg-white text-black flex flex-col box-border px-[1.5mm] pt-[1mm] pb-[1mm] break-inside-avoid [word-spacing:0.1em]">
      
      {/* 1. PRODUCT NAME (Increased height for big bold Canva style) */}
      <div className="shrink-0 h-[11.5mm] w-full flex items-center justify-center font-black uppercase tracking-normal text-center p-0 m-0">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={48} 
          minFontSize={16} 
          allowWrap={false} 
          className="flex items-center justify-center font-black"
        />
      </div>
      
      {/* THICK SEPARATOR LINE */}
      <div className="shrink-0 w-full border-b-[2px] border-black my-[0.5mm]"></div>
      
      {/* 2. THE TABLES */}
      <div className="shrink-0 flex w-full h-[23.5mm] justify-between">
        
        {/* --- LEFT TABLE (Nutrition) --- */}
        <div className="w-[58%] border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold">
          {/* Header */}
          <div className="h-[5mm] flex items-center justify-center text-center border-b-[1.5px] border-black text-[7.5px] tracking-normal whitespace-nowrap">
            NUTRITIONAL FACTS (Approx.) Per 100g
          </div>
          {/* Rows */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Energy Kcals</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black">{safeProduct.nutritionalFacts.energy}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Protein</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black">{safeProduct.nutritionalFacts.protein}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Total Fat</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black">{safeProduct.nutritionalFacts.fat}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Carbohydrate</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black">{safeProduct.nutritionalFacts.carbs}</div>
          </div>
          <div className="flex flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Total Sugar</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black">{safeProduct.nutritionalFacts.sugar}</div>
          </div>
        </div>

        {/* --- RIGHT TABLE (Details) --- */}
        <div className="w-[40%] border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold">
          {/* Header */}
          <div className="h-[5mm] flex items-center justify-center text-center border-b-[1.5px] border-black whitespace-nowrap">
            PRODUCT DETAILS
          </div>
          {/* Rows */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Batch No.</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black">{batchNo}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Net Wt.</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black">{safeProduct.netWeight} g</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Packed On</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black">{packedOn}</div>
          </div>
          <div className="flex flex-1 items-center bg-white">
            <div className="w-[45%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px]">
              <span>M.R.P</span>
              <span className="text-[6px] font-normal leading-none">(Incl. all Taxes)</span>
            </div>
            <div className="w-[55%] h-full flex items-center px-[2px] text-[11px] font-black tracking-normal">
              ₹ {safeProduct.mrp}
            </div>
          </div>
        </div>

      </div>

      {/* 3. INGREDIENTS & BEST BEFORE */}
      <div className="flex-1 w-full flex flex-col justify-center items-center text-center mt-[0.5mm] gap-[0.5mm]">
        
        {/* Title */}
        <div className="shrink-0 font-black text-[7px] leading-none">INGREDIENTS:</div>
        
        {/* List */}
        <div className="shrink-0 w-[98%] h-[3.8mm] flex items-center justify-center">
          <AutoFitText 
            text={safeProduct.ingredients} 
            maxFontSize={7.5} 
            minFontSize={6} 
            allowWrap={true}  
            className="font-bold uppercase leading-tight"
          />
        </div>
        
        {/* Best Before */}
        <div className="shrink-0 text-[7px] font-black uppercase leading-none">
          BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.
        </div>
        
      </div>

    </div>
  );
}