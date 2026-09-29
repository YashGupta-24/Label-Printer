// src/components/Template1.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template1({ product, batchNo, packedOn }) {
  const getNutritionValue = (val) => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return '0.0';
    }
    return String(val);
  };

  const rawNutrition = product?.nutritionalFacts || {};
  const safeProduct = {
    productName: product?.productName || "SAMPLE PRODUCT",
    netWeight: product?.netWeight || "150",
    mrp: product?.mrp || "100.00",
    ingredients: product?.ingredients || "INGREDIENTS PENDING",
    nutritionalFacts: {
      energy: getNutritionValue(rawNutrition.energy),
      protein: getNutritionValue(rawNutrition.protein),
      fat: getNutritionValue(rawNutrition.fat),
      carbs: getNutritionValue(rawNutrition.carbs),
      sugar: getNutritionValue(rawNutrition.sugar)
    }
  };

  const formattedWeight = safeProduct.netWeight.toLowerCase().includes('g') 
    ? safeProduct.netWeight 
    : `${safeProduct.netWeight} g`;

  return (
    <div className="w-[75mm] h-[50mm] min-w-[75mm] min-h-[50mm] max-w-[75mm] max-h-[50mm] shrink-0 overflow-hidden bg-white text-black flex flex-col box-border px-[1.5mm] pt-[1mm] pb-[1mm] break-inside-avoid">
      
      {/* 1. PRODUCT NAME */}
      <div className="shrink-0 h-[11.5mm] w-full flex items-center justify-center font-black uppercase tracking-[0.04em] text-center p-0 m-0">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={48} 
          minFontSize={16} 
          allowWrap={false} 
          className="flex items-center justify-center font-black tracking-[0.04em]"
        />
      </div>
      
      {/* THICK SEPARATOR LINE */}
      <div className="shrink-0 w-full border-b-[2px] border-black my-[0.5mm]"></div>
      
      {/* 2. THE TABLES */}
      <div className="shrink-0 flex w-full h-[23.5mm] justify-between">
        
        {/* --- LEFT TABLE (Nutrition) --- */}
        <div className="w-[58%] border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold tracking-[0.02em]">
          {/* Header */}
          <div className="h-[5mm] flex items-center justify-center text-center border-b-[1.5px] border-black text-[6.8px] font-black tracking-tight whitespace-nowrap px-0.5">
            NUTRITIONAL FACTS (Approx.) Per 100g
          </div>
          {/* Rows */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Energy Kcals</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black whitespace-nowrap">{safeProduct.nutritionalFacts.energy}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Protein</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black whitespace-nowrap">{safeProduct.nutritionalFacts.protein}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Total Fat</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black whitespace-nowrap">{safeProduct.nutritionalFacts.fat}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Carbohydrate</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black whitespace-nowrap">{safeProduct.nutritionalFacts.carbs}</div>
          </div>
          <div className="flex flex-1 items-center">
            <div className="w-[55%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Total Sugar</div>
            <div className="w-[45%] h-full flex items-center px-[2px] font-black whitespace-nowrap">{safeProduct.nutritionalFacts.sugar}</div>
          </div>
        </div>

        {/* --- RIGHT TABLE (Details) --- */}
        <div className="w-[40%] border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold tracking-[0.03em]">
          {/* Header */}
          <div className="h-[5mm] flex items-center justify-center text-center border-b-[1.5px] border-black whitespace-nowrap tracking-[0.03em] font-black text-[7.5px]">
            PRODUCT DETAILS
          </div>
          {/* Rows */}
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Batch No.</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black text-[8px] whitespace-nowrap">{batchNo}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Net Wt.</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black text-[8px] whitespace-nowrap">{formattedWeight}</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px] text-[7.5px] whitespace-nowrap">Packed On</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black text-[8px] whitespace-nowrap">{packedOn}</div>
          </div>
          <div className="flex flex-1 items-center bg-white">
            <div className="w-[45%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px]">
              <span className="leading-tight text-[8px] whitespace-nowrap">M.R.P</span>
              <span className="text-[6px] font-normal leading-none whitespace-nowrap tracking-tight">(Incl. all Taxes)</span>
            </div>
            <div className="w-[55%] h-full flex items-center px-[2px] text-[11px] font-black tracking-normal whitespace-nowrap">
              ₹ {safeProduct.mrp}
            </div>
          </div>
        </div>

      </div>

      {/* 3. INGREDIENTS & BEST BEFORE */}
      <div className="flex-1 w-full flex flex-col justify-center items-center text-center mt-[0.5mm] gap-[0.5mm]">
        
        {/* Title */}
        <div className="shrink-0 font-black text-[7px] leading-none tracking-[0.04em] whitespace-nowrap">INGREDIENTS:</div>
        
        {/* List */}
        <div className="shrink-0 w-[98%] h-[4.2mm] flex items-center justify-center">
          <AutoFitText 
            text={safeProduct.ingredients} 
            maxFontSize={7.5} 
            minFontSize={5.5} 
            allowWrap={true}  
            wrapLineHeight="1.25"
            className="font-bold uppercase tracking-[0.04em]"
          />
        </div>
        
        {/* Best Before */}
        <div className="shrink-0 text-[7px] font-black uppercase leading-none tracking-[0.03em] whitespace-nowrap">
          BEST BEFORE THREE MONTHS FROM THE MONTH OF PACKAGING.
        </div>
        
      </div>

    </div>
  );
}