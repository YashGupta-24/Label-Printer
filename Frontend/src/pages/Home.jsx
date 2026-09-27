// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getLabelDates } from '../utils/dateLogic';
import Template1 from '../components/Template1';
import Template2 from '../components/Template2';
import Template4 from '../components/Template4';
import { Search, Check } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [copies, setCopies] = useState(1);
  const [dates, setDates] = useState({ batchNo: '', packedOn: '' });

  useEffect(() => {
    setDates(getLabelDates());
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    if (product?.hasNutrition) {
      setSelectedTemplate(1);
    } else {
      setSelectedTemplate(2);
    }
  };

  const handleCopiesChange = (e) => {
    const val = e.target.value;

    // Allow the user to clear the box without it turning into a "0"
    if (val === '') {
      setCopies('');
      return;
    }

    // Parse strictly as an integer, dropping leading zeros
    const num = parseInt(val, 10);

    // Prevent freezing by capping the maximum copies at 500
    if (!isNaN(num) && num > 0 && num <= 500) {
      setCopies(num);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6 print:p-0 print:block flex flex-col items-center">

      {/* UI Dashboard */}
      <div className="no-print w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-stone-200 mb-8 mt-4">
        <h2 className="text-2xl font-black mb-6 text-stone-700 tracking-wide">Print Dashboard</h2>

        {/* Product Search Bar */}
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Search Product</label>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-stone-300 rounded-xl bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm"
          />
        </div>

        {/* Product List */}
        <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-stone-400 font-bold text-sm">
              {products.length === 0 ? 'Loading products...' : 'No matching products.'}
            </div>
          ) : (
            filteredProducts.map(product => {
              const isSelected = selectedProduct?.id === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`cursor-pointer rounded-xl p-3.5 flex items-center justify-between transition-all border ${
                    isSelected
                      ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                      : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <div>
                    <h3 className={`font-black text-sm ${isSelected ? 'text-white' : 'text-stone-800'}`}>
                      {product.productName}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                      {product.netWeight} &middot; ₹{product.mrp}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {selectedProduct && (
          <>
            <div className="flex flex-col mb-4">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Select Layout</label>
              <select
                className="w-full border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(Number(e.target.value))}
              >
                {selectedProduct.hasNutrition ? (
                  <option value={1}>Template 1: Nutrition & Details</option>
                ) : (
                  <option value={2}>Template 2: Product Details</option>
                )}
                <option value={4}>Template 4: 3-in-1 Name Strips</option>
              </select>
            </div>

            <div className="flex flex-col mb-6">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Number of Labels</label>
              <input
                type="text"
                inputMode="numeric"
                value={copies}
                onChange={handleCopiesChange}
                className="border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-stone-800 text-stone-50 font-black tracking-widest uppercase py-3.5 rounded-xl hover:bg-stone-700 transition shadow-sm cursor-pointer"
            >
              PRINT {copies} LABEL(S)
            </button>
          </>
        )}
      </div>

      {/* Live Preview Section */}
      <div className="no-print flex-1 w-full flex flex-col items-center">
        <h2 className="text-sm font-black tracking-widest text-stone-400 uppercase mb-6">Live Label Preview</h2>
        
        {selectedProduct ? (
          <div className="bg-white p-4 shadow-xl border border-stone-200">
            {selectedTemplate === 1 && <Template1 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
            {selectedTemplate === 2 && <Template2 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
            {selectedTemplate === 4 && <Template4 product={selectedProduct} />}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-stone-300 text-stone-400 font-bold text-sm">
            Please select a product above to preview and print.
          </div>
        )}
        
        {/* Edit Button */}
        {selectedProduct && (
          <button 
            onClick={() => navigate(`/edit-item/${selectedProduct.id}`)}
            className="mt-6 px-6 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg border border-stone-300 transition-colors cursor-pointer"
          >
            Edit {selectedProduct.productName}
          </button>
        )}
      </div>

      {/* Hidden Print Container */}
      {selectedProduct && (
        <div className="print-wrapper">
          {Array.from({ length: copies || 1 }).map((_, index) => (
            <div key={index} className="label-page">
              {selectedTemplate === 1 && <Template1 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              {selectedTemplate === 2 && <Template2 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              {selectedTemplate === 4 && <Template4 product={selectedProduct} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}