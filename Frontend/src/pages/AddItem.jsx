import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase';
import { ArrowLeft } from 'lucide-react';

export default function AddItem() {
  const navigate = useNavigate();
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
    sugar: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Check for duplicates
      const productsRef = collection(db, 'products');
      const duplicateQuery = query(
        productsRef,
        where("productName", "==", formData.productName.toUpperCase()),
        where("netWeight", "==", formData.netWeight),
        where("mrp", "==", formData.mrp)
      );
      
      const querySnapshot = await getDocs(duplicateQuery);
      
      if (!querySnapshot.empty) {
        setErrorMsg('This product (Same Name, Weight, and MRP) already exists!');
        setIsSubmitting(false);
        return;
      }

      // 2. If no duplicate, proceed to save
      await addDoc(productsRef, {
        productName: formData.productName.toUpperCase(),
        netWeight: formData.netWeight,
        mrp: formData.mrp,
        ingredients: formData.ingredients,
        hasNutrition: formData.hasNutrition || false,
        ...(formData.hasNutrition ? {
          nutritionalFacts: {
            energy: formData.energy?.trim() || '0.0',
            protein: formData.protein?.trim() || '0.0',
            fat: formData.fat?.trim() || '0.0',
            carbs: formData.carbs?.trim() || '0.0',
            sugar: formData.sugar?.trim() || '0.0'
          }
        } : {})
      });
      alert('Product saved successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error adding document: ", error);
      setErrorMsg('Error saving product. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-lg mx-auto bg-white mt-4 sm:mt-8 mb-10 rounded-2xl shadow-sm border border-stone-200 no-print">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 mr-3 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-stone-700 tracking-wide">Add New Product</h2>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
          {errorMsg}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 w-full">
        
        {/* Product Name */}
        <div className="flex flex-col w-full min-w-0">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Product Name</label>
          <input 
            required 
            name="productName" 
            value={formData.productName} 
            onChange={handleChange} 
            placeholder="e.g. ROASTED CHANA" 
            className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg uppercase focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 bg-[#fdfcfb] text-sm transition" 
          />
        </div>

        {/* Details Row (Net Weight & MRP) - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
          <div className="flex flex-col w-full min-w-0">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Net Weight</label>
            <input 
              required 
              name="netWeight" 
              value={formData.netWeight} 
              onChange={handleChange} 
              placeholder="e.g. 300 gram" 
              className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm" 
            />
          </div>
          <div className="flex flex-col w-full min-w-0">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">M.R.P (₹)</label>
            <input 
              required 
              name="mrp" 
              value={formData.mrp} 
              onChange={handleChange} 
              placeholder="e.g. 85.00" 
              className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500 text-sm" 
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="flex flex-col w-full min-w-0">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Ingredients List</label>
          <textarea 
            required 
            name="ingredients" 
            value={formData.ingredients} 
            onChange={handleChange} 
            placeholder="Enter ingredients separated by commas..." 
            className="w-full min-w-0 border border-stone-300 p-3 rounded-lg uppercase focus:outline-none focus:border-stone-500 bg-[#fdfcfb] text-sm" 
            rows="3"
          />
        </div>
        
        {/* Nutrition Checkbox */}
        <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-700 mt-1 select-none text-sm">
          <input 
            type="checkbox" 
            name="hasNutrition" 
            checked={formData.hasNutrition} 
            onChange={handleChange} 
            className="accent-stone-700 w-4 h-4 cursor-pointer" 
          />
          Include Nutritional Facts?
        </label>

        {/* Nutritional Facts Grid */}
        {formData.hasNutrition && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-[#f8f7f4] p-4 sm:p-5 rounded-xl border border-stone-200 w-full min-w-0">
            <div className="col-span-2 text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 pb-2 mb-1">
              Nutritional Values (Per 100g)
            </div>
            
            <div className="flex flex-col min-w-0">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Energy (Kcals)</label>
              <input name="energy" value={formData.energy} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Protein (g)</label>
              <input name="protein" value={formData.protein} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Total Fat (g)</label>
              <input name="fat" value={formData.fat} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col min-w-0">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Carbohydrates (g)</label>
              <input name="carbs" value={formData.carbs} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col min-w-0 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Total Sugar (g)</label>
              <input name="sugar" value={formData.sugar} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="mt-3 bg-stone-800 text-stone-50 font-black tracking-widest uppercase py-3.5 rounded-xl hover:bg-stone-700 transition shadow-sm disabled:opacity-50 active:scale-[0.99] cursor-pointer"
        >
          {isSubmitting ? 'Saving Product...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}