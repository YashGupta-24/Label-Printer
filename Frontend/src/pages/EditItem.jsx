import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import { ArrowLeft, Search, Pencil } from 'lucide-react';

// --- Product Search/List View (shown at /edit-item with no ID) ---
function EditItemSearch() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const items = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(items);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 font-sans">
      <div className="max-w-2xl mx-auto mt-2 sm:mt-6">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="p-2 mr-3 hover:bg-stone-100 rounded-full transition-colors text-stone-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-wide text-stone-700">Edit Product</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-500 text-sm"
          />
        </div>

        {/* Product List */}
        <div className="space-y-2.5">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-stone-400 font-bold text-sm">
              {products.length === 0 ? 'No products found.' : 'No matching products.'}
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-stone-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-black text-stone-800 text-sm">{product.productName}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {product.netWeight} &middot; ₹{product.mrp}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/edit-item/${product.id}`)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0"
                  title="Edit product"
                >
                  <Pencil size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- Edit Form View (shown at /edit-item/:id) ---
function EditItemForm({ id }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            hasNutrition: data.hasNutrition || false,
            energy: data.nutritionalFacts?.energy || '',
            protein: data.nutritionalFacts?.protein || '',
            fat: data.nutritionalFacts?.fat || '',
            carbs: data.nutritionalFacts?.carbs || '',
            sugar: data.nutritionalFacts?.sugar || ''
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
        hasNutrition: formData.hasNutrition || false,
        nutritionalFacts: formData.hasNutrition ? {
          energy: formData.energy?.trim() || '0.0',
          protein: formData.protein?.trim() || '0.0',
          fat: formData.fat?.trim() || '0.0',
          carbs: formData.carbs?.trim() || '0.0',
          sugar: formData.sugar?.trim() || '0.0'
        } : {}
      });
      alert('Product updated successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error updating document: ", error);
      alert('Error updating product. Please try again.');
    }
    setIsSubmitting(false);
  };

  if (!formData) return <div className="min-h-screen flex items-center justify-center font-bold text-stone-500">Loading Product Data...</div>;

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 font-sans">
      <div className="max-w-xl mx-auto mt-2 sm:mt-6 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-stone-200 mb-10">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/edit-item')} className="p-2 mr-3 hover:bg-stone-100 rounded-full transition-colors text-stone-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-800">Edit Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full">
          {/* Basic Details */}
          <div className="space-y-4 w-full min-w-0">
            <div className="w-full min-w-0">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Product Name</label>
              <input type="text" name="productName" value={formData.productName} onChange={handleChange} required className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500 uppercase text-sm bg-[#fdfcfb]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Net Weight</label>
                <input type="text" name="netWeight" value={formData.netWeight} onChange={handleChange} required className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-[#fdfcfb]" />
              </div>
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">M.R.P (₹)</label>
                <input type="text" name="mrp" value={formData.mrp} onChange={handleChange} required className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-[#fdfcfb]" />
              </div>
            </div>

            <div className="w-full min-w-0">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Ingredients</label>
              <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} required rows="3" className="w-full min-w-0 border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500 text-sm uppercase bg-[#fdfcfb]"></textarea>
            </div>
          </div>

          {/* Nutrition Checkbox */}
          <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-700 text-sm select-none">
            <input type="checkbox" name="hasNutrition" checked={formData.hasNutrition} onChange={handleChange} className="accent-stone-700 w-4 h-4 cursor-pointer" />
            Include Nutritional Facts?
          </label>

          {/* Nutritional Facts */}
          {formData.hasNutrition && (
            <div className="space-y-3 pt-2 bg-[#f8f7f4] p-4 rounded-xl border border-stone-200 w-full min-w-0">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 pb-2">Nutritional Facts (Per 100g)</h2>
              <div className="grid grid-cols-2 gap-3 w-full min-w-0">
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Energy (Kcals)</label>
                  <input type="text" name="energy" value={formData.energy} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-white" />
                </div>
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Protein (g)</label>
                  <input type="text" name="protein" value={formData.protein} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-white" />
                </div>
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Total Fat (g)</label>
                  <input type="text" name="fat" value={formData.fat} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-white" />
                </div>
                <div className="min-w-0">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Carbohydrate (g)</label>
                  <input type="text" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-white" />
                </div>
                <div className="min-w-0 col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1 truncate">Total Sugar (g)</label>
                  <input type="text" name="sugar" value={formData.sugar} onChange={handleChange} className="w-full min-w-0 border border-stone-300 p-2 rounded-lg focus:outline-none focus:border-stone-500 text-sm bg-white" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-stone-800 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 active:scale-[0.99] cursor-pointer">
            {isSubmitting ? 'Saving Updates...' : 'Save Updates'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main Export: Decides which view to show ---
export default function EditItem() {
  const { id } = useParams();
  
  if (!id) {
    return <EditItemSearch />;
  }
  
  return <EditItemForm id={id} />;
}