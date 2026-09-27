import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// IMPORTANT: Add 'query', 'where', and 'getDocs' to your imports
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
  const [errorMsg, setErrorMsg] = useState(''); // State to hold error messages

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
        // If the snapshot is not empty, a duplicate exists!
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
            energy: formData.energy,
            protein: formData.protein,
            fat: formData.fat,
            carbs: formData.carbs,
            sugar: formData.sugar
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
    <div className="p-8 max-w-lg mx-auto bg-white mt-10 rounded-2xl shadow-sm border border-stone-200 no-print">
      <h2 className="text-2xl font-black mb-6 text-stone-700 tracking-wide">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Product Name */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Product Name</label>
          <input required name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g. SOYA STICK" className="border border-stone-300 p-2.5 rounded-lg uppercase focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 bg-[#fdfcfb] transition" />
        </div>
        
        {/* Nutrition Checkbox */}
        <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-700 mt-2">
          <input type="checkbox" name="hasNutrition" checked={formData.hasNutrition} onChange={handleChange} className="accent-stone-700 w-4 h-4 cursor-pointer" />
          Include Nutritional Facts?
        </label>

        {/* Nutritional Facts Grid - Now with explicit labels */}
        {formData.hasNutrition && (
          <div className="grid grid-cols-2 gap-4 bg-[#f8f7f4] p-5 rounded-xl border border-stone-200">
            <div className="col-span-2 text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 pb-2 mb-1">
              Nutritional Values (Per 100g)
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1">Energy (Kcals)</label>
              <input name="energy" value={formData.energy} onChange={handleChange} className="border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1">Protein (g)</label>
              <input name="protein" value={formData.protein} onChange={handleChange} className="border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1">Total Fat (g)</label>
              <input name="fat" value={formData.fat} onChange={handleChange} className="border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1">Carbohydrates (g)</label>
              <input name="carbs" value={formData.carbs} onChange={handleChange} className="border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-stone-500 uppercase mb-1">Total Sugar (g)</label>
              <input name="sugar" value={formData.sugar} onChange={handleChange} className="border border-stone-300 p-2 rounded-lg bg-white text-sm focus:outline-none focus:border-stone-500" />
            </div>
          </div>
        )}

        {/* Details Row */}
        <div className="flex gap-4">
          <div className="flex flex-col flex-1">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Net Weight</label>
            <input required name="netWeight" value={formData.netWeight} onChange={handleChange} placeholder="150 gram" className="border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500" />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">M.R.P (₹)</label>
            <input required name="mrp" value={formData.mrp} onChange={handleChange} placeholder="120.00" className="border border-stone-300 p-2.5 rounded-lg bg-[#fdfcfb] focus:outline-none focus:border-stone-500" />
          </div>
        </div>
        
        {/* Ingredients */}
        <div className="flex flex-col">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Ingredients List</label>
          <textarea required name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Enter ingredients separated by commas..." className="border border-stone-300 p-3 rounded-lg uppercase focus:outline-none focus:border-stone-500 bg-[#fdfcfb]" rows="3"></textarea>
        </div>

        {/* Submit Button */}
        <button type="submit" className="mt-4 bg-stone-800 text-stone-50 font-black tracking-widest uppercase py-3.5 rounded-xl hover:bg-stone-700 transition shadow-sm">
          Save Product
        </button>
      </form>
    </div>
  );
}