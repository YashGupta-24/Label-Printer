// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getLabelDates } from '../utils/dateLogic';
import Template1 from '../components/Template1';
import Template2 from '../components/Template2';
import Template3 from '../components/Template3';
import Template4 from '../components/Template4';
import { rasterizeElementToCanvas } from '../utils/labelRasterizer';
import { buildTsplBuffer } from '../utils/tsplBuilder';
import { isWebUsbSupported, requestUsbPrinter, printTsplBufferViaUsb, getPairedPrinters } from '../utils/webUsbPrinter';
import { Search, Check, Zap, Usb } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [copies, setCopies] = useState(1);
  const [dates, setDates] = useState({ batchNo: '', packedOn: '' });

  // WebUSB Direct Printing State
  const [usbDevice, setUsbDevice] = useState(null);
  const [isPrintingUsb, setIsPrintingUsb] = useState(false);
  const [usbStatusMessage, setUsbStatusMessage] = useState('');
  const [hasWebUsb, setHasWebUsb] = useState(true);

  useEffect(() => {
    setHasWebUsb(isWebUsbSupported());
    async function checkPairedPrinters() {
      if (isWebUsbSupported()) {
        try {
          const devices = await getPairedPrinters();
          if (devices && devices.length > 0) {
            setUsbDevice(devices[0]);
          }
        } catch (err) {
          console.error("Error checking paired devices:", err);
        }
      }
    }
    checkPairedPrinters();
  }, []);

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

    if (val === '') {
      setCopies('');
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0 && num <= 500) {
      setCopies(num);
    }
  };

  const handleConnectUsb = async () => {
    try {
      setUsbStatusMessage('Selecting USB printer...');
      const device = await requestUsbPrinter();
      setUsbDevice(device);
      setUsbStatusMessage(`Connected: ${device.productName || 'Thermal Printer'}`);
      setTimeout(() => setUsbStatusMessage(''), 4000);
    } catch (err) {
      console.error('Failed to select USB printer:', err);
      setUsbStatusMessage(err.name === 'NotFoundError' ? 'Selection cancelled' : `Connection error: ${err.message || err}`);
    }
  };

  const handleDirectUsbPrint = async () => {
    if (!previewRef.current) {
      alert("No label preview found to print.");
      return;
    }

    setIsPrintingUsb(true);
    setUsbStatusMessage('');

    try {
      let device = usbDevice;
      if (!device) {
        setUsbStatusMessage('Please select your USB printer...');
        device = await requestUsbPrinter();
        setUsbDevice(device);
      }

      setUsbStatusMessage('Rasterizing label at 203 DPI...');
      // Exact native 203 DPI: 75mm x 50mm = 600 x 400 pixels
      const canvas = await rasterizeElementToCanvas(previewRef.current, 600, 400);

      setUsbStatusMessage('Generating TSPL commands...');
      const numCopies = Number(copies) || 1;
      const tsplBuffer = buildTsplBuffer(canvas, numCopies, {
        widthMm: 75,
        heightMm: 50,
        gapMm: 3,
        direction: 1
      });

      setUsbStatusMessage(`Sending to printer (${numCopies} label(s))...`);
      await printTsplBufferViaUsb(device, tsplBuffer);

      setUsbStatusMessage(`Printed ${numCopies} label(s) successfully!`);
      setTimeout(() => setUsbStatusMessage(''), 4000);
    } catch (err) {
      console.error('Direct USB print failed:', err);
      if (err.name === 'NotFoundError') {
        setUsbStatusMessage('Printer selection cancelled');
      } else {
        setUsbStatusMessage(`Print error: ${err.message || err}`);
      }
    } finally {
      setIsPrintingUsb(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 flex flex-col items-center">

      {/* UI Dashboard Container */}
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-stone-200 mb-8 mt-2 sm:mt-4">
        
        {/* Header with Pairing Status */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-stone-800 tracking-wide">Print Dashboard</h2>
          {hasWebUsb && (
            <button
              type="button"
              onClick={handleConnectUsb}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition active:scale-95 ${
                usbDevice 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
              }`}
              title={usbDevice ? `Connected: ${usbDevice.productName || 'USB Printer'}` : 'Pair USB Printer'}
            >
              <Usb size={13} className={usbDevice ? 'text-emerald-600' : 'text-stone-500'} />
              <span>{usbDevice ? 'USB Paired' : 'Pair USB'}</span>
            </button>
          )}
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
        <div className="max-h-56 overflow-y-auto space-y-2 mb-5 pr-1">
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
                  className={`cursor-pointer rounded-xl p-3 sm:p-3.5 flex items-center justify-between transition-all border active:scale-[0.99] ${
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
            {/* Template Selector */}
            <div className="flex flex-col mb-4">
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
                  </>
                )}
                <option value={4}>Template 4: 3-in-1 Name Strips</option>
              </select>
            </div>

            {/* Copies Input */}
            <div className="flex flex-col mb-5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Number of Labels</label>
              <input
                type="text"
                inputMode="numeric"
                value={copies}
                onChange={handleCopiesChange}
                className="border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm font-bold"
              />
            </div>

            {/* Status Feedback Banner */}
            {usbStatusMessage && (
              <div className="mb-4 p-3 text-xs font-bold text-center rounded-xl bg-stone-100 border border-stone-300 text-stone-800 transition-all">
                {usbStatusMessage}
              </div>
            )}

            {/* Primary Print Button */}
            {hasWebUsb ? (
              <button
                type="button"
                disabled={isPrintingUsb}
                onClick={handleDirectUsbPrint}
                className="w-full bg-stone-900 active:bg-black text-stone-50 font-black tracking-widest uppercase py-4 rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                <Zap size={18} className="text-amber-400 fill-amber-400" />
                <span className="text-sm">{isPrintingUsb ? 'PRINTING TO USB...' : `DIRECT PRINT ${copies || 1} LABEL(S)`}</span>
              </button>
            ) : (
              <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl text-center border border-amber-200">
                WebUSB is supported in Google Chrome & Edge on Android and Desktop.
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Label Preview Section */}
      <div className="w-full max-w-md flex flex-col items-center pb-8">
        <h2 className="text-xs sm:text-sm font-black tracking-widest text-stone-400 uppercase mb-4 sm:mb-6">Live Label Preview</h2>
        
        {selectedProduct ? (
          <div className="w-full flex flex-col items-center">
            {/* Scrollable container on small viewports so 75mm label never clips */}
            <div className="max-w-full overflow-x-auto p-2 sm:p-4 bg-stone-200/50 rounded-2xl border border-stone-300 flex justify-center shadow-inner">
              <div ref={previewRef} data-label-preview="true" className="inline-block bg-white shadow-md shrink-0">
                {selectedTemplate === 1 && <Template1 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {selectedTemplate === 2 && <Template2 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {selectedTemplate === 3 && <Template3 product={selectedProduct} batchNo={dates.batchNo} packedOn={dates.packedOn} />}
                {selectedTemplate === 4 && <Template4 product={selectedProduct} />}
              </div>
            </div>

            {/* Quick Edit Button */}
            <button 
              onClick={() => navigate(`/edit-item/${selectedProduct.id}`)}
              className="mt-4 px-5 py-2 bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 transition shadow-sm cursor-pointer"
            >
              Edit {selectedProduct.productName}
            </button>
          </div>
        ) : (
          <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-dashed border-stone-300 text-stone-400 font-bold text-xs sm:text-sm text-center">
            Please select a product above to preview and print.
          </div>
        )}
      </div>

    </div>
  );
}