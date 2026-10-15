// src/components/QuickEditPrintModal.jsx
import { useState, useEffect } from 'react';
import { X, Pencil, RotateCcw, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuickEditPrintModal({
  isOpen,
  onClose,
  product,
  originalProduct,
  onSave,
}) {
  const [formData, setFormData] = useState({
    productName: '',
    netWeight: '',
    mrp: '',
    ingredients: '',
    hasNutrition: false,
    energy: '',
    protein: '',
    fat: '',
    carbs: '',
    sugar: '',
  });

  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        netWeight: product.netWeight || '',
        mrp: product.mrp || '',
        ingredients: product.ingredients || '',
        hasNutrition: Boolean(product.hasNutrition),
        energy: product.nutritionalFacts?.energy || '',
        protein: product.nutritionalFacts?.protein || '',
        fat: product.nutritionalFacts?.fat || '',
        carbs: product.nutritionalFacts?.carbs || '',
        sugar: product.nutritionalFacts?.sugar || '',
      });
      setShowNutrition(Boolean(product.hasNutrition));
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleResetToOriginal = () => {
    if (!originalProduct) return;
    setFormData({
      productName: originalProduct.productName || '',
      netWeight: originalProduct.netWeight || '',
      mrp: originalProduct.mrp || '',
      ingredients: originalProduct.ingredients || '',
      hasNutrition: Boolean(originalProduct.hasNutrition),
      energy: originalProduct.nutritionalFacts?.energy || '',
      protein: originalProduct.nutritionalFacts?.protein || '',
      fat: originalProduct.nutritionalFacts?.fat || '',
      carbs: originalProduct.nutritionalFacts?.carbs || '',
      sugar: originalProduct.nutritionalFacts?.sugar || '',
    });
    setShowNutrition(Boolean(originalProduct.hasNutrition));
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!formData.productName.trim()) {
      alert('Product Name cannot be empty');
      return;
    }

    const updatedProduct = {
      ...product,
      productName: formData.productName.trim().toUpperCase(),
      netWeight: formData.netWeight.trim(),
      mrp: formData.mrp.trim(),
      ingredients: formData.ingredients.trim(),
      hasNutrition: formData.hasNutrition,
      nutritionalFacts: formData.hasNutrition
        ? {
            energy: formData.energy?.trim() || '0.0',
            protein: formData.protein?.trim() || '0.0',
            fat: formData.fat?.trim() || '0.0',
            carbs: formData.carbs?.trim() || '0.0',
            sugar: formData.sugar?.trim() || '0.0',
          }
        : (product.nutritionalFacts || {}),
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfaf8] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl shadow-xs">
              <Pencil size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>Customize for Print</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-300">
                  Temporary
                </span>
              </h2>
              <p className="text-[11px] font-semibold text-stone-500">
                Override label details for this print run only (DB remains untouched)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-900 shrink-0">
          <Zap size={15} className="text-amber-600 shrink-0" />
          <span className="font-bold">
            Print-only mode: Changes made here won't modify your product database.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g. SPECIAL ROASTED CHANA"
              required
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white uppercase transition"
            />
          </div>

          {/* Net Weight & MRP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1">
                Net Weight
              </label>
              <input
                type="text"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                placeholder="e.g. 250g or 250"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1">
                M.R.P. (₹)
              </label>
              <input
                type="text"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                placeholder="e.g. 120.00"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-stone-600 mb-1">
              Ingredients
            </label>
            <textarea
              name="ingredients"
              rows={2}
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="List of ingredients..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold text-xs text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white uppercase transition"
            />
          </div>

          {/* Nutrition Section Collapsible */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/50">
            <button
              type="button"
              onClick={() => setShowNutrition(!showNutrition)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-stone-100/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                  Nutritional Facts (Per 100g)
                </span>
                {formData.hasNutrition && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                    Enabled
                  </span>
                )}
              </div>
              {showNutrition ? <ChevronUp size={16} className="text-stone-500" /> : <ChevronDown size={16} className="text-stone-500" />}
            </button>

            {showNutrition && (
              <div className="p-3.5 pt-1 border-t border-stone-200 space-y-3 bg-white">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasNutrition"
                    checked={formData.hasNutrition}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
                  />
                  <span>Include nutritional facts table on label</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Energy (kcal)</label>
                    <input
                      type="text"
                      name="energy"
                      value={formData.energy}
                      onChange={handleChange}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Protein (g)</label>
                    <input
                      type="text"
                      name="protein"
                      value={formData.protein}
                      onChange={handleChange}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Fat (g)</label>
                    <input
                      type="text"
                      name="fat"
                      value={formData.fat}
                      onChange={handleChange}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Carbs (g)</label>
                    <input
                      type="text"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleChange}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 mb-0.5">Sugar (g)</label>
                    <input
                      type="text"
                      name="sugar"
                      value={formData.sugar}
                      onChange={handleChange}
                      placeholder="0.0"
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-stone-100">
            {originalProduct && (
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="w-full sm:w-auto px-3.5 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset to original DB values"
              >
                <RotateCcw size={14} />
                <span>Reset to DB Original</span>
              </button>
            )}

            <div className="w-full sm:w-auto flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
              >
                Apply for Print
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
