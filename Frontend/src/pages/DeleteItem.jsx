import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Trash2, ArrowLeft } from 'lucide-react';

export default function DeleteItem() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
      setConfirmId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Error deleting product. Please try again.');
    }
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-transparent p-6 font-sans">
      <div className="max-w-2xl mx-auto mt-6">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 mr-4 hover:bg-stone-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black tracking-wide text-stone-700">Delete Product</h1>
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

                {confirmId === product.id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-red-600 hidden sm:inline">Are you sure?</span>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(product.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete product"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
