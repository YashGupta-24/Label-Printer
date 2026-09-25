// src/components/Template4.jsx
import React from 'react';
import AutoFitText from './AutoFitText';

export default function Template4({ product }) {
  const safeProduct = product || { productName: "SAMPLE PRODUCT" };

  return (
    <div className="w-[73mm] h-[46mm] overflow-hidden bg-white text-black flex flex-col box-border p-[1.5mm] break-inside-avoid">
      {/* Strip 1 */}
      <div className="flex-1 flex items-center justify-center border-b-2 border-black border-dashed pb-[1mm]">
         <AutoFitText text={safeProduct.productName} maxFontSize={30} minFontSize={12} singleLine={true} className="flex items-center justify-center font-black uppercase tracking-widest" />
      </div>
      {/* Strip 2 */}
      <div className="flex-1 flex items-center justify-center border-b-2 border-black border-dashed py-[1mm]">
         <AutoFitText text={safeProduct.productName} maxFontSize={30} minFontSize={12} singleLine={true} className="flex items-center justify-center font-black uppercase tracking-widest" />
      </div>
      {/* Strip 3 */}
      <div className="flex-1 flex items-center justify-center pt-[1mm]">
         <AutoFitText text={safeProduct.productName} maxFontSize={30} minFontSize={12} singleLine={true} className="flex items-center justify-center font-black uppercase tracking-widest" />
      </div>
    </div>
  );
}