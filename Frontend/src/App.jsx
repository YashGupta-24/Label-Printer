// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import DeleteItem from './pages/DeleteItem';

function App() {
  return (
    <Router>
      {/* Applied a soft beige background to the entire app */}
      <div className="min-h-screen font-sans bg-[#f7f5f0] text-stone-800">
        
        {/* Navigation Bar - Low Tone Aesthetic */}
        <nav className="bg-[#e8e4db] text-stone-800 p-5 flex justify-between items-center no-print shadow-sm border-b border-[#d8d3c8]">
          <h1 className="font-black text-xl tracking-wider text-stone-700">INDIAN FOOD</h1>
          <div className="space-x-6 font-bold text-sm">
            <Link to="/" className="hover:text-stone-500 transition">Print Dashboard</Link>
            <Link to="/add-item" className="hover:text-stone-500 transition">+ Add Item</Link>
            <Link to="/edit-item" className="hover:text-stone-500 transition">Edit Item</Link>
            <Link to="/delete-item" className="hover:text-stone-500 transition">Delete Item</Link>
          </div>
        </nav>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item" element={<EditItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/delete-item" element={<DeleteItem />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;