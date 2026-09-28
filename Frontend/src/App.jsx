// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import DeleteItem from './pages/DeleteItem';

function App() {
  const getNavLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
      isActive
        ? 'bg-stone-800 text-stone-50 shadow-sm'
        : 'text-stone-700 hover:bg-stone-300/50 hover:text-stone-900'
    }`;

  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#f7f5f0] text-stone-800">
        
        {/* Responsive Navigation Bar */}
        <nav className="bg-[#e8e4db] text-stone-800 px-4 py-3 sm:px-6 sm:py-4 no-print shadow-sm border-b border-[#d8d3c8] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            
            {/* Logo / Title */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link to="/" className="font-black text-lg sm:text-xl tracking-wider text-stone-800 flex items-center gap-2">
                <span>INDIAN FOOD</span>
              </Link>
            </div>

            {/* Nav Links - Touch Scrollable on Mobile */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-start sm:justify-end no-scrollbar">
              <NavLink to="/" end className={getNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/add-item" className={getNavLinkClass}>
                + Add Item
              </NavLink>
              <NavLink to="/edit-item" className={getNavLinkClass}>
                Edit Item
              </NavLink>
              <NavLink to="/delete-item" className={getNavLinkClass}>
                Delete Item
              </NavLink>
            </div>

          </div>
        </nav>

        {/* Page Content */}
        <main className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/edit-item" element={<EditItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/delete-item" element={<DeleteItem />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;