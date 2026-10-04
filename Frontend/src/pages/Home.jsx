// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getLabelDates } from '../utils/dateLogic';
import Template1 from '../components/Template1';
import Template2 from '../components/Template2';
import Template3 from '../components/Template3';
import Template4 from '../components/Template4';
import Template5 from '../components/Template5';
import { useLabelCounter } from '../context/LabelCounterContext';
import { Search, Check, Plus, Minus, Trash2, Printer, Layers } from 'lucide-react';

const TEMPLATE_NAMES = {
  1: 'Template 1: Nutrition & Details',
  2: 'Template 2: Product Details',
  3: 'Template 3: Brand & Details',
  4: 'Template 4: 3-in-1 Name Strips',
  5: 'Template 5: Brand Name & Details',
};

export default function Home() {
  const navigate = useNavigate();
  const { remainingCount, deductLabels } = useLabelCounter();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [copies, setCopies] = useState(1);
  const [dates] = useState(() => getLabelDates());
  const [printQueue, setPrintQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_print_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error reading print queue from localStorage:", e);
      return [];
    }
  });

  const pendingPrintCountRef = useRef(0);
  const printQueueRef = useRef(printQueue);
  const selectedProductRef = useRef(selectedProduct);
  const copiesRef = useRef(copies);

  useEffect(() => {
    printQueueRef.current = printQueue;
  }, [printQueue]);

  useEffect(() => {
    selectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  useEffect(() => {
    copiesRef.current = copies;
  }, [copies]);

  useEffect(() => {
    try {
      localStorage.setItem('pos_print_queue', JSON.stringify(printQueue));
    } catch (e) {
      console.error("Error saving print queue to localStorage:", e);
    }
  }, [printQueue]);

  useEffect(() => {
    const handleBeforePrint = () => {
      // Capture count if print was initiated via browser shortcut (e.g. Ctrl+P)
      if (pendingPrintCountRef.current === 0) {
        if (printQueueRef.current.length > 0) {
          pendingPrintCountRef.current = printQueueRef.current.reduce(
            (sum, item) => sum + (Number(item.copies) || 0),
            0
          );
        } else if (selectedProductRef.current) {
          pendingPrintCountRef.current = parseInt(copiesRef.current, 10) || 1;
        }
      }
    };

    const handleAfterPrint = () => {
      const printedCount = pendingPrintCountRef.current;
      if (printedCount > 0) {
        deductLabels(printedCount);
        pendingPrintCountRef.current = 0;
      }

      setPrintQueue([]);
      setSelectedProduct(null);
      try {
        localStorage.removeItem('pos_print_queue');
      } catch (e) {
        console.error("Error clearing print queue after print:", e);
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [deductLabels]);

  useEffect(() => {
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

  const queuedProductIds = new Set(printQueue.map(item => item.product.id));

  const availableProducts = products.filter(p => !queuedProductIds.has(p.id));

  const filteredProducts = availableProducts.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFilteredProducts = [...filteredProducts].sort((a, b) => {
    const nameA = a.productName || '';
    const nameB = b.productName || '';
    const aIsHindi = /[\u0900-\u097F]/.test(nameA);
    const bIsHindi = /[\u0900-\u097F]/.test(nameB);

    // English names come before Hindi names
    if (!aIsHindi && bIsHindi) return -1;
    if (aIsHindi && !bIsHindi) return 1;

    // Both Hindi: sort by Hindi locale
    if (aIsHindi && bIsHindi) {
      return nameA.localeCompare(nameB, 'hi');
    }

    // Both English: sort alphabetically A-Z
    return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
  });

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

    if (val === '') {
      setCopies('');
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 500) {
      setCopies(num);
    }
  };

  const handleAddToQueue = () => {
    if (!selectedProduct) return;
    const numCopies = parseInt(copies, 10) || 1;

    const newItem = {
      id: `${selectedProduct.id}-${selectedTemplate}-${Date.now()}`,
      product: selectedProduct,
      template: selectedTemplate,
      copies: numCopies,
    };

    setPrintQueue(prev => [...prev, newItem]);
    setSelectedProduct(null);
    setCopies(1);
    setSearchQuery('');
  };

  const handleUpdateQueueCopies = (id, delta) => {
    setPrintQueue(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newCopies = item.copies + delta;
          return newCopies > 0 && newCopies <= 500 ? { ...item, copies: newCopies } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveFromQueue = (id) => {
    setPrintQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearQueue = () => {
    setPrintQueue([]);
  };

  const totalLabelsInQueue = printQueue.reduce((sum, item) => sum + (Number(item.copies) || 0), 0);

  const handlePrint = () => {
    const countToPrint = printQueue.length > 0
      ? totalLabelsInQueue
      : (selectedProduct ? (parseInt(copies, 10) || 1) : 0);

    if (countToPrint === 0) {
      alert("Please add at least one label to the print queue.");
      return;
    }

    if (remainingCount === 0) {
      const proceed = window.confirm(
        "Notice: The label stock counter is currently at 0. Do you want to proceed with printing anyway?"
      );
      if (!proceed) return;
    } else if (remainingCount < countToPrint) {
      const proceed = window.confirm(
        `Notice: You are printing ${countToPrint} label(s), but only ${remainingCount} are left on the roll counter. Do you want to proceed?`
      );
      if (!proceed) return;
    }

    pendingPrintCountRef.current = countToPrint;
    window.print();
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 print:p-0 print:block flex flex-col items-center">

      {/* Main Responsive Grid Container */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-start justify-center">

        {/* Left Column: Product Selection & Queue Management */}
        <div className="no-print w-full lg:w-[460px] flex flex-col gap-6 shrink-0">

          {/* Card 1: Add Labels to Queue */}
          <div className="w-full bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-stone-800 tracking-wide flex items-center gap-2">
                <Layers size={20} className="text-stone-700" />
                <span>Select & Add Labels</span>
              </h2>
            </div>

            {/* Product Search Bar */}
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Search Product</label>
            <div className="relative mb-4">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm"
              />
            </div>

            {/* Product List */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-5 pr-1">
              {sortedFilteredProducts.length === 0 ? (
                <div className="text-center py-6 text-stone-400 font-bold text-sm">
                  {products.length === 0
                    ? 'Loading products...'
                    : availableProducts.length === 0
                    ? 'All products are currently in the queue.'
                    : 'No matching products.'}
                </div>
              ) : (
                sortedFilteredProducts.map(product => {
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`cursor-pointer rounded-xl p-3 flex items-center justify-between transition-all border active:scale-[0.99] ${
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
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check size={13} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {selectedProduct && (
              <div className="space-y-4 pt-3 border-t border-stone-200">
                {/* Template Selector */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Select Layout</label>
                  <select
                    className="w-full border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm font-semibold"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                  >
                    {selectedProduct.hasNutrition ? (
                      <option value={1}>Template 1: Nutrition & Details</option>
                    ) : (
                      <>
                        <option value={2}>Template 2: Product Details</option>
                        <option value={3}>Template 3: Brand & Details</option>
                        <option value={5}>Template 5: Brand Name & Details</option>
                      </>
                    )}
                    <option value={4}>Template 4: 3-in-1 Name Strips</option>
                  </select>
                </div>

                {/* Copies Input */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Number of Labels</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={copies}
                    onChange={handleCopiesChange}
                    className="border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm font-bold"
                  />
                </div>

                {/* Add to Batch Button */}
                <button
                  type="button"
                  onClick={handleAddToQueue}
                  className="w-full bg-stone-800 hover:bg-stone-900 active:bg-black text-stone-50 font-black tracking-wider uppercase py-3.5 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Plus size={18} />
                  <span>+ ADD {copies || 1} LABEL(S) TO QUEUE</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Print Queue & Bulk Print Action */}
          <div className="w-full bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-stone-800 tracking-wide">
                  Print Queue ({printQueue.length})
                </h2>
                <p className="text-xs font-semibold text-stone-500 mt-0.5">
                  {totalLabelsInQueue} label{totalLabelsInQueue === 1 ? '' : 's'} ready for print
                </p>
              </div>
              {printQueue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearQueue}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold transition hover:underline cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {printQueue.length === 0 ? (
              <div className="p-6 border border-dashed border-stone-300 rounded-xl text-center text-xs font-bold text-stone-400">
                Queue is empty. Select a product and click "+ Add to Queue" to build your bulk print batch.
              </div>
            ) : (
              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
                {printQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-2 transition hover:bg-stone-100/70"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-stone-400">#{idx + 1}</span>
                        <h4 className="font-black text-sm text-stone-800 truncate">{item.product.productName}</h4>
                      </div>
                      <p className="text-[11px] font-semibold text-stone-500 truncate mt-0.5">
                        {TEMPLATE_NAMES[item.template]} &middot; {item.product.netWeight}
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQueueCopies(item.id, -1)}
                          disabled={item.copies <= 1}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                          title="Decrease copies"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2 text-xs font-black text-stone-800 min-w-[28px] text-center">
                          {item.copies}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQueueCopies(item.id, 1)}
                          disabled={item.copies >= 500}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                          title="Increase copies"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromQueue(item.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Primary Print Button */}
            {printQueue.length > 0 ? (
              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-stone-900 hover:bg-stone-800 active:bg-black text-stone-50 font-black tracking-widest uppercase py-4 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Printer size={18} className="text-amber-400" />
                <span>PRINT ALL {totalLabelsInQueue} LABEL(S)</span>
              </button>
            ) : selectedProduct ? (
              <button
                type="button"
                onClick={handlePrint}
                className="w-full bg-stone-800 hover:bg-stone-700 active:bg-black text-stone-50 font-black tracking-widest uppercase py-3.5 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Printer size={16} />
                <span>PRINT SELECTED ({copies || 1} LABEL)</span>
              </button>
            ) : null}
          </div>

        </div>

        {/* Right Column: Live Previews */}
        <div className="no-print w-full flex-1 flex flex-col items-center gap-6">

          {/* 1. Live Selection Preview: ALWAYS visible when a product is selected */}
          {selectedProduct && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs sm:text-sm font-black tracking-widest text-stone-500 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Selection Preview</span>
                </h2>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Step 2: Preview & Add
                </span>
              </div>

              <div className="w-full bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
                  <div>
                    <h3 className="font-black text-sm text-stone-800">{selectedProduct.productName}</h3>
                    <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
                      {TEMPLATE_NAMES[selectedTemplate]} &middot; {selectedProduct.netWeight} &middot; ₹{selectedProduct.mrp}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/edit-item/${selectedProduct.id}`)}
                    className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition"
                  >
                    Edit Item
                  </button>
                </div>

                <div className="w-full max-w-full overflow-x-auto p-2 sm:p-4 bg-stone-200/50 rounded-xl border border-stone-300 flex justify-center shadow-inner">
                  <div className="inline-block bg-white shadow-md shrink-0">
                    {selectedTemplate === 1 && <Template1 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                    {selectedTemplate === 2 && <Template2 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                    {selectedTemplate === 3 && <Template3 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                    {selectedTemplate === 4 && <Template4 product={selectedProduct} />}
                    {selectedTemplate === 5 && <Template5 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                  </div>
                </div>

                <p className="text-xs text-stone-400 font-semibold mt-3 text-center">
                  Tip: Verify preview above, adjust layout or copies on left, then click <strong className="text-stone-700">"+ ADD TO QUEUE"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 2. Batch Previews of Queue Items */}
          {printQueue.length > 0 && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs sm:text-sm font-black tracking-widest text-stone-400 uppercase">
                  Batch Previews ({printQueue.length} Unique {printQueue.length === 1 ? 'Design' : 'Designs'} &middot; {totalLabelsInQueue} Prints)
                </h2>
              </div>

              {/* List of distinct label previews */}
              <div className="w-full space-y-6">
                {printQueue.map((item, index) => (
                  <div
                    key={item.id}
                    className="w-full bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center"
                  >
                    {/* Item Header */}
                    <div className="w-full flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-400">#{index + 1}</span>
                          <h3 className="font-black text-sm text-stone-800">{item.product.productName}</h3>
                        </div>
                        <p className="text-[11px] font-semibold text-stone-500 mt-0.5">
                          {TEMPLATE_NAMES[item.template]} &middot; {item.product.netWeight} &middot; ₹{item.product.mrp}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-stone-800 text-stone-50 text-xs font-black rounded-lg shadow-xs">
                          {item.copies} {item.copies === 1 ? 'label' : 'labels'}
                        </span>
                        <button
                          onClick={() => navigate(`/edit-item/${item.product.id}`)}
                          className="px-2 py-1 text-xs font-bold text-stone-500 hover:text-stone-800 bg-stone-100 rounded-lg hover:bg-stone-200 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Preview Rendering Box */}
                    <div className="w-full max-w-full overflow-x-auto p-2 sm:p-4 bg-stone-200/50 rounded-xl border border-stone-300 flex justify-center shadow-inner">
                      <div className="inline-block bg-white shadow-md shrink-0">
                        {item.template === 1 && <Template1 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                        {item.template === 2 && <Template2 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                        {item.template === 3 && <Template3 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                        {item.template === 4 && <Template4 product={item.product} />}
                        {item.template === 5 && <Template5 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Empty placeholder when neither a product is selected nor queue has items */}
          {!selectedProduct && printQueue.length === 0 && (
            <div className="w-full bg-white p-8 sm:p-12 rounded-2xl border border-dashed border-stone-300 text-stone-400 font-bold text-xs sm:text-sm text-center">
              Please select a product on the left to preview the label design, then add it to your queue to print.
            </div>
          )}

        </div>

      </div>

      {/* Hidden Print Container for Browser Print Spooler */}
      {printQueue.length > 0 ? (
        <div className="print-wrapper">
          {printQueue.map((item) =>
            Array.from({ length: item.copies || 1 }).map((_, index) => (
              <div key={`${item.id}-${index}`} className="label-page">
                {item.template === 1 && <Template1 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {item.template === 2 && <Template2 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {item.template === 3 && <Template3 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {item.template === 4 && <Template4 product={item.product} />}
                {item.template === 5 && <Template5 product={item.product} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              </div>
            ))
          )}
        </div>
      ) : selectedProduct ? (
        <div className="print-wrapper">
          {Array.from({ length: copies || 1 }).map((_, index) => (
            <div key={index} className="label-page">
              {selectedTemplate === 1 && <Template1 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              {selectedTemplate === 2 && <Template2 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              {selectedTemplate === 3 && <Template3 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
              {selectedTemplate === 4 && <Template4 product={selectedProduct} />}
              {selectedTemplate === 5 && <Template5 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
            </div>
          ))}
        </div>
      ) : null}

    </div>
  );
}