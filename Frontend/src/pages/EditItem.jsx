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
    <div className="min-h-screen bg-transparent p-6 font-sans">
      <div className="max-w-2xl mx-auto mt-6">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 mr-4 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black tracking-wide text-stone-700">Edit Product</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-stone-500 text-sm"
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-stone-400 font-bold">
              {products.length === 0 ? 'No products found.' : 'No matching products.'}
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-black text-stone-800">{product.productName}</h3>
                  <p className="text-xs text-stone-500 mt-1">
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
          energy: formData.energy,
          protein: formData.protein,
          fat: formData.fat,
          carbs: formData.carbs,
          sugar: formData.sugar
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

  // Show a loading screen until the data is fetched
  if (!formData) return <div className="min-h-screen flex items-center justify-center font-bold text-stone-500">Loading Product Data...</div>;

  return (
    <div className="min-h-screen bg-[#fdfcfb] p-6 text-[#2d2d2d] font-sans">
      <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-stone-200">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/edit-item')} className="p-2 mr-4 hover:bg-stone-100 rounded-full transition-colors">
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

          {/* Nutrition Checkbox */}
          <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-700 mt-2">
            <input type="checkbox" name="hasNutrition" checked={formData.hasNutrition} onChange={handleChange} className="accent-stone-700 w-4 h-4 cursor-pointer" />
            Include Nutritional Facts?
          </label>

          {/* Nutritional Facts */}
          {formData.hasNutrition && (
            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold border-b pb-2">Nutritional Facts (Per 100g)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Energy Kcals</label>
                  <input type="text" name="energy" value={formData.energy} onChange={handleChange} className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Protein</label>
                  <input type="text" name="protein" value={formData.protein} onChange={handleChange} className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Total Fat</label>
                  <input type="text" name="fat" value={formData.fat} onChange={handleChange} className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Carbohydrate</label>
                  <input type="text" name="carbs" value={formData.carbs} onChange={handleChange} className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Total Sugar</label>
                  <input type="text" name="sugar" value={formData.sugar} onChange={handleChange} className="w-full border border-stone-300 p-2.5 rounded-lg focus:outline-none focus:border-stone-500" />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#2d2d2d] hover:bg-black text-white font-bold py-4 rounded-xl transition-colors mt-8">
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