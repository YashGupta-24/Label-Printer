// src/components/Template4.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template4({ product }) {
  const safeProduct = product || { productName: "SAMPLE PRODUCT" };

  return (
    <div className="w-[75mm] h-[50mm] min-w-[75mm] min-h-[50mm] max-w-[75mm] max-h-[50mm] shrink-0 overflow-hidden bg-white text-black flex flex-col box-border p-0 m-0 break-inside-avoid">
      {/* Strip 1 */}
      <div className="flex-1 w-full flex items-center justify-center border-b-2 border-black border-dashed px-[1mm] overflow-hidden">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={44} 
          minFontSize={14} 
          allowWrap={false} 
          className="flex items-center justify-center font-black uppercase tracking-[0.04em]" 
        />
      </div>
      
      {/* Strip 2 */}
      <div className="flex-1 w-full flex items-center justify-center border-b-2 border-black border-dashed px-[1mm] overflow-hidden">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={44} 
          minFontSize={14} 
          allowWrap={false} 
          className="flex items-center justify-center font-black uppercase tracking-[0.04em]" 
        />
      </div>
      
      {/* Strip 3 */}
      <div className="flex-1 w-full flex items-center justify-center px-[1mm] overflow-hidden">
        <AutoFitText 
          text={safeProduct.productName} 
          maxFontSize={44} 
          minFontSize={14} 
          allowWrap={false} 
          className="flex items-center justify-center font-black uppercase tracking-[0.04em]" 
        />
      </div>
    </div>
  );
}