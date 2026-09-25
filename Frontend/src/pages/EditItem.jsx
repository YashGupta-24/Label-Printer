import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import { ArrowLeft } from 'lucide-react';

export default function EditItem() {
  const navigate = useNavigate();
  const { id } = useParams(); // Gets the product ID from the URL
  const [formData, setFormData] = useState(null); // null while loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the product data when the page loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            productName: data.productName,
            netWeight: data.netWeight,
            mrp: data.mrp,
            ingredients: data.ingredients,
            energy: data.nutritionalFacts.energy,
            protein: data.nutritionalFacts.protein,
            fat: data.nutritionalFacts.fat,
            carbs: data.nutritionalFacts.carbs,
            sugar: data.nutritionalFacts.sugar
          });
        } else {
          alert("Product not found!");
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        productName: formData.productName.toUpperCase(),
        netWeight: formData.netWeight,
        mrp: formData.mrp,
        ingredients: formData.ingredients,
        nutritionalFacts: {
          energy: formData.energy,
          protein: formData.protein,
          fat: formData.fat,
          carbs: formData.carbs,
          sugar: formData.sugar
        }
      });
      alert('Product updated successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error updating document: ", error);
      alert('Error updating product. Please try again.');
    }
    setIsSubmitting(false);
  };

  // Show a loading screen until the data is fetched
  if (!formData) return <div className="min-h-screen flex items-center justify-center font-bold text-stone-500">Loading Product Data...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-6 text-[#2d2d2d] font-sans">
      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 mr-4 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black tracking-tight">Edit Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">Basic Details</h2>
            <div>
              <label className="block text-sm font-bold mb-1">Product Name</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500 uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Net Weight</label>
                <input type="text" name="netWeight" value={formData.netWeight} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">M.R.P (₹)</label>
                <input type="text" name="mrp" value={formData.mrp} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Ingredients</label>
              <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} required rows="3" className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500"></textarea>
            </div>
          </div>

          {/* Nutritional Facts */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold border-b pb-2">Nutritional Facts (Per 100g)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Energy Kcals</label>
                <input type="text" name="energy" value={formData.energy} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Protein</label>
                <input type="text" name="protein" value={formData.protein} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Total Fat</label>
                <input type="text" name="fat" value={formData.fat} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Carbohydrate</label>
                <input type="text" name="carbs" value={formData.carbs} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Total Sugar</label>
                <input type="text" name="sugar" value={formData.sugar} onChange={handleChange} required className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#2d2d2d] hover:bg-black text-white font-bold py-4 rounded-xl transition-colors mt-8">
            {isSubmitting ? 'Saving Updates...' : 'Save Updates'}
          </button>
        </form>
      </div>
    </div>
  );
}