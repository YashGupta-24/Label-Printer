// src/components/Template1.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template1({ product, batchNo, packedOn }) {
  const safeProduct = product || {
    productName: "SAMPLE PRODUCT",
    nutritionalFacts: { energy: "0.0", protein: "0.0", fat: "0.0", carbs: "0.0", sugar: "0.0" },
    netWeight: "150 gram",
    mrp: "100.00",
    ingredients: "INGREDIENT 1, INGREDIENT 2, SPICES, SALT, EDIBLE OIL, ETC."
  };

  return (
    <div className="w-[75mm] h-[50mm] overflow-hidden bg-white text-black flex flex-col box-border p-[1.5mm] break-inside-avoid">
      
      {/* 1. PRODUCT NAME */}
      <div className="shrink-0 h-[9mm] w-full flex items-center justify-center font-black uppercase tracking-wider text-center px-[1mm]">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={35} 
          minFontSize={22} 
          allowWrap={true} 
          className="flex items-center justify-center"
        />
      </div>
      
      {/* THICK SEPARATOR LINE */}
      <div className="shrink-0 w-full border-b-[2.5px] border-black my-[0.5mm]"></div>
      
      {/* 2. THE TABLES (Height increased to 26mm, content scaled up) */}
      <div className="shrink-0 flex w-full h-[26mm] mt-[0.5mm] justify-between">
        
        {/* --- LEFT TABLE (Nutrition) --- */}
        <div className="w-[58%] border-[2px] border-black flex flex-col text-[8px] leading-tight font-bold">
          {/* Header */}
          <div className="h-[5mm] flex items-center justify-center text-center border-b-[1.5px] border-black text-[8px] tracking-tight whitespace-nowrap">
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
            <div className="w-[55%] h-full flex items-center px-[2px] font-black">{safeProduct.netWeight} grams</div>
          </div>
          <div className="flex border-b-[1.5px] border-black flex-1 items-center">
            <div className="w-[45%] h-full flex items-center border-r-[1.5px] border-black px-[2px]">Packed On</div>
            <div className="w-[55%] h-full flex items-center px-[2px] font-black">{packedOn}</div>
          </div>
          <div className="flex flex-1 items-center bg-white">
            <div className="w-[45%] h-full flex flex-col justify-center border-r-[1.5px] border-black px-[2px]">
              <span>M.R.P</span>
              <span className="text-[6.5px] font-normal leading-none">(Incl. Taxes)</span>
            </div>
            <div className="w-[55%] h-full flex items-center px-[2px] text-[11px] font-black tracking-tight">
              ₹ {safeProduct.mrp}
            </div>
          </div>
        </div>

      </div>

      {/* 3. INGREDIENTS & BEST BEFORE */}
      <div className="flex-1 w-full flex flex-col mt-[1mm] justify-start items-center text-center">
        
        {/* Title */}
        <div className="shrink-0 font-black text-[7px] mb-[0.25mm]">INGREDIENTS:</div>
        
        {/* List */}
        <div className="shrink-0 w-[98%] h-[3.5mm] mb-[1mm]">
          <AutoFitText 
            text={safeProduct.ingredients} 
            maxFontSize={7} 
            minFontSize={6} 
            allowWrap={true}  
            className="font-bold uppercase leading-[1]"
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