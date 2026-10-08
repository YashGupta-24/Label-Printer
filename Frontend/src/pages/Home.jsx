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
import RotatedLabelCell from '../components/RotatedLabelCell';
import { useLabelCounter } from '../context/LabelCounterContext';
import { usePrintSettings } from '../context/PrintSettingsContext';
import { Search, Check, Plus, Minus, Trash2, Printer, Layers } from 'lucide-react';

const TEMPLATE_NAMES = {
  1: 'Template 1: Nutrition & Details',
  2: 'Template 2: Product Details',
  3: 'Template 3: Brand & Details',
  4: 'Template 4: 3-in-1 Name Strips',
  5: 'Template 5: Brand Name & Details',
};

export default function Home({ onOpenSettings }) {
  const navigate = useNavigate();
  const { remainingCount, deductLabels } = useLabelCounter();
  const printSettings = usePrintSettings();
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
  const isMultiColumnRoll = (Number(printSettings.columns) || 1) % 2 === 0;
  const isOddQueue = isMultiColumnRoll && (totalLabelsInQueue % 2 !== 0);
  const isOddDirect = isMultiColumnRoll && ((parseInt(copies, 10) || 1) % 2 !== 0);

  const handlePrint = () => {
    const countToPrint = printQueue.length > 0
      ? totalLabelsInQueue
      : (selectedProduct ? (parseInt(copies, 10) || 1) : 0);

    if (countToPrint === 0) {
      alert("Please add at least one label to the print queue.");
      return;
    }

    if (isMultiColumnRoll && (countToPrint % 2 !== 0)) {
      alert("ODD COUNT:Add/Delete a label to print");
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

  const renderTemplateComponent = (templateId, prod) => {
    if (!prod) return null;
    switch (templateId) {
      case 1:
        return <Template1 product={prod} batchNo={dates.batchNo} packedOn={dates.packedOn} />;
      case 2:
        return <Template2 product={prod} batchNo={dates.batchNo} packedOn={dates.packedOn} />;
      case 3:
        return <Template3 product={prod} batchNo={dates.batchNo} packedOn={dates.packedOn} />;
      case 4:
        return <Template4 product={prod} />;
      case 5:
        return <Template5 product={prod} batchNo={dates.batchNo} packedOn={dates.packedOn} />;
      default:
        return <Template1 product={prod} batchNo={dates.batchNo} packedOn={dates.packedOn} />;
    }
  };

  // Build flattened print slots for spooling
  const flattenedQueue = [];
  if (printQueue.length > 0) {
    printQueue.forEach((item) => {
      const qty = Number(item.copies) || 1;
      for (let i = 0; i < qty; i++) {
        flattenedQueue.push({
          uniqueKey: `${item.id}-${i}`,
          product: item.product,
          template: item.template,
        });
      }
    });
  } else if (selectedProduct) {
    const qty = parseInt(copies, 10) || 1;
    for (let i = 0; i < qty; i++) {
      flattenedQueue.push({
        uniqueKey: `single-${i}`,
        product: selectedProduct,
        template: selectedTemplate,
      });
    }
  }

  // Group flattened slots into physical rows fed by the thermal printer
  const printRows = [];
  const cols = Math.max(1, printSettings.columns || 1);
  for (let i = 0; i < flattenedQueue.length; i += cols) {
    const rowSlice = flattenedQueue.slice(i, i + cols);
    while (rowSlice.length < cols) {
      rowSlice.push(null);
    }
    printRows.push(rowSlice);
  }

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 print:p-0 print:block flex flex-col items-center">

      {/* Dynamic Injected CSS for Thermal Spooler */}
      <style>{`
        @media print {
          @page {
            size: ${printSettings.pageWidth}mm ${printSettings.pageHeight}mm !important;
            margin: 0 !important;
          }
          .label-page {
            width: ${printSettings.pageWidth}mm !important;
            height: ${printSettings.pageHeight}mm !important;
            gap: ${printSettings.columnGap}mm !important;
          }
        }
      `}</style>

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

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 font-bold text-sm focus:outline-none focus:border-stone-500 focus:bg-white transition"
              />
            </div>

            {/* Product List */}
            <div className="border border-stone-200 rounded-xl max-h-52 overflow-y-auto mb-5 divide-y divide-stone-100 bg-white">
              {sortedFilteredProducts.length > 0 ? (
                sortedFilteredProducts.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-stone-800 text-stone-50 font-black'
                          : 'hover:bg-stone-50 text-stone-700 font-bold'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-sm truncate">{product.productName}</div>
                        <div className={`text-[11px] font-semibold ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {product.netWeight} &middot; ₹{product.mrp}
                        </div>
                      </div>
                      {isSelected && <Check size={16} className="text-stone-50 shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs font-bold text-stone-400">
                  {searchQuery ? 'No matching products found' : 'All products are currently queued'}
                </div>
              )}
            </div>

            {/* Selection Options Form */}
            {selectedProduct && (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                {/* Select Layout */}
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

            {/* Current Roll Setup Info & Change Trigger */}
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg mb-3">
              <span>Roll: <strong className="text-stone-800">{printSettings.columns > 1 ? `${printSettings.columns}-Up` : '1-Up'} ({printSettings.rotation}°)</strong> &middot; {printSettings.pageWidth}×{printSettings.pageHeight}mm</span>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-stone-700 hover:text-stone-900 underline font-black cursor-pointer"
              >
                Change
              </button>
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
                disabled={isOddQueue}
                className={`w-full bg-stone-900 hover:bg-stone-800 active:bg-black text-stone-50 font-black tracking-widest uppercase py-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-[0.98] ${
                  isOddQueue ? 'opacity-60 cursor-not-allowed hover:bg-stone-900 active:scale-100' : 'cursor-pointer'
                }`}
              >
                <Printer size={18} className="text-amber-400" />
                <span>
                  {isOddQueue
                    ? "ODD COUNT:Add/Delete a label to print"
                    : `PRINT ALL ${totalLabelsInQueue} LABEL(S)`}
                </span>
              </button>
            ) : selectedProduct ? (
              <button
                type="button"
                onClick={handlePrint}
                disabled={isOddDirect}
                className={`w-full bg-stone-800 hover:bg-stone-700 active:bg-black text-stone-50 font-black tracking-widest uppercase py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] ${
                  isOddDirect ? 'opacity-60 cursor-not-allowed hover:bg-stone-800 active:scale-100' : 'cursor-pointer'
                }`}
              >
                <Printer size={16} />
                <span>
                  {isOddDirect
                    ? "ODD COUNT:Add/Delete a label to print"
                    : `PRINT SELECTED (${copies || 1} LABEL)`}
                </span>
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
                  <div
                    className="inline-flex bg-white shadow-md border border-stone-300 rounded-xs shrink-0 overflow-hidden"
                    style={{
                      width: `${printSettings.pageWidth}mm`,
                      height: `${printSettings.pageHeight}mm`,
                      gap: `${printSettings.columnGap}mm`,
                    }}
                  >
                    {/* Slot 1: Active Product */}
                    <RotatedLabelCell>
                      {renderTemplateComponent(selectedTemplate, selectedProduct)}
                    </RotatedLabelCell>

                    {/* Additional columns: Filled if copies >= 2, or Blank if copies === 1 */}
                    {printSettings.columns > 1 &&
                      Array.from({ length: printSettings.columns - 1 }).map((_, cIdx) => {
                        const hasSecond = (Number(copies) || 1) > cIdx + 1;
                        return hasSecond ? (
                          <RotatedLabelCell key={cIdx}>
                            {renderTemplateComponent(selectedTemplate, selectedProduct)}
                          </RotatedLabelCell>
                        ) : (
                          <div
                            key={`blank-direct-${cIdx}`}
                            className="shrink-0 flex flex-col items-center justify-center bg-stone-50 border-l border-dashed border-stone-300 select-none"
                            style={{
                              width: `${printSettings.cellWidth}mm`,
                              height: `${printSettings.cellHeight}mm`,
                            }}
                          >
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                              Blank Label
                            </span>
                            <span className="text-[9px] font-semibold text-stone-400 mt-0.5">
                              (Unprinted Slot)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <p className="text-xs text-stone-400 font-semibold mt-3 text-center">
                  Tip: Verify preview above, adjust layout or copies on left, then click <strong className="text-stone-700">"+ ADD TO QUEUE"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 2. Batch Previews of Queue Items as physical paper sheets */}
          {printQueue.length > 0 && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs sm:text-sm font-black tracking-widest text-stone-400 uppercase">
                  Print Sheets Preview ({printRows.length} {printRows.length === 1 ? 'Sheet' : 'Sheets'} &middot; {totalLabelsInQueue} Prints)
                </h2>
                {isOddQueue && (
                  <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Odd count ({totalLabelsInQueue})
                  </span>
                )}
              </div>

              {/* List of physical paper sheets matching Chrome's print screen */}
              <div className="w-full space-y-6">
                {printRows.map((row, sheetIdx) => {
                  const hasBlank = row.some((slot) => slot === null);
                  return (
                    <div
                      key={`preview-sheet-${sheetIdx}`}
                      className="w-full bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center"
                    >
                      {/* Sheet Header */}
                      <div className="w-full flex items-center justify-between mb-3 border-b border-stone-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-400">Sheet #{sheetIdx + 1} of {printRows.length}</span>
                          <span className="text-xs font-bold text-stone-600">
                            ({printSettings.pageWidth}×{printSettings.pageHeight}mm)
                          </span>
                        </div>
                        {hasBlank ? (
                          <span className="text-[11px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            1 Label Blank (Odd Count)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            Full Sheet
                          </span>
                        )}
                      </div>

                      {/* Paper Sheet Rendering Box */}
                      <div className="w-full max-w-full overflow-x-auto p-2 sm:p-4 bg-stone-200/50 rounded-xl border border-stone-300 flex justify-center shadow-inner">
                        <div
                          className="inline-flex bg-white shadow-md border border-stone-300 rounded-xs shrink-0 overflow-hidden"
                          style={{
                            width: `${printSettings.pageWidth}mm`,
                            height: `${printSettings.pageHeight}mm`,
                            gap: `${printSettings.columnGap}mm`,
                          }}
                        >
                          {row.map((slot, colIdx) =>
                            slot ? (
                              <RotatedLabelCell key={slot.uniqueKey || colIdx}>
                                {renderTemplateComponent(slot.template, slot.product)}
                              </RotatedLabelCell>
                            ) : (
                              <div
                                key={`blank-${sheetIdx}-${colIdx}`}
                                className="shrink-0 flex flex-col items-center justify-center bg-stone-50 border-l border-dashed border-stone-300 select-none"
                                style={{
                                  width: `${printSettings.cellWidth}mm`,
                                  height: `${printSettings.cellHeight}mm`,
                                }}
                              >
                                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                  Blank Label
                                </span>
                                <span className="text-[9px] font-semibold text-stone-400 mt-0.5">
                                  (Unprinted Slot)
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
      {printRows.length > 0 && (
        <div className="print-wrapper">
          {printRows.map((row, rowIndex) => (
            <div
              key={`print-row-${rowIndex}`}
              className="label-page"
              style={{
                width: `${printSettings.pageWidth}mm`,
                height: `${printSettings.pageHeight}mm`,
                display: 'flex',
                flexDirection: 'row',
                gap: `${printSettings.columnGap}mm`,
                boxSizing: 'border-box',
              }}
            >
              {row.map((slot, colIndex) =>
                slot ? (
                  <RotatedLabelCell key={slot.uniqueKey}>
                    {renderTemplateComponent(slot.template, slot.product)}
                  </RotatedLabelCell>
                ) : (
                  <div
                    key={`blank-${rowIndex}-${colIndex}`}
                    style={{
                      width: `${printSettings.cellWidth}mm`,
                      height: `${printSettings.cellHeight}mm`,
                      minWidth: `${printSettings.cellWidth}mm`,
                      minHeight: `${printSettings.cellHeight}mm`,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  />
                )
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}