import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import DeleteItem from './pages/DeleteItem';
import StockCounter from './pages/StockCounter';
import { LabelCounterProvider, useLabelCounter } from './context/LabelCounterContext';
import { PrintSettingsProvider, usePrintSettings } from './context/PrintSettingsContext';
import PrintSettingsModal from './components/PrintSettingsModal';
import { Sliders } from 'lucide-react';

function NavbarRollBadge() {
  const { remainingCount, initialCount } = useLabelCounter();
  const isLow = remainingCount <= 100;
  const isEmpty = remainingCount === 0;

  return (
    <Link
      to="/stock-counter"
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition select-none hover:shadow-xs active:scale-[0.98] ${
        isEmpty
          ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
          : isLow
          ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
          : 'bg-stone-200/80 text-stone-800 border-stone-300 hover:bg-stone-300'
      }`}
      title={`Remaining label stock: ${remainingCount.toLocaleString()} of ${initialCount.toLocaleString()} (Click to manage roll)`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isEmpty ? 'bg-rose-500' : isLow ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
        }`}
      />
      <span>Roll: {remainingCount.toLocaleString()} left</span>
    </Link>
  );
}

function NavbarSettingsBadge({ onOpenSettings }) {
  const { columns, rotation } = usePrintSettings();
  return (
    <button
      type="button"
      onClick={onOpenSettings}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black border transition select-none hover:shadow-xs active:scale-[0.98] bg-stone-200/80 text-stone-800 border-stone-300 hover:bg-stone-300 cursor-pointer"
      title="Click to configure roll orientation, rotation, and adjacent label count"
    >
      <Sliders size={13} className="text-stone-700" />
      <span>{columns > 1 ? `${columns}-Up` : '1-Up'} ({rotation}°)</span>
    </button>
  );
}

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getNavLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap ${
      isActive
        ? 'bg-stone-800 text-stone-50 shadow-sm'
        : 'text-stone-700 hover:bg-stone-300/50 hover:text-stone-900'
    }`;

  return (
    <div className="min-h-screen font-sans bg-[#f7f5f0] text-stone-800">
      {/* Responsive Navigation Bar */}
      <nav className="bg-[#e8e4db] text-stone-800 px-4 py-3 sm:px-6 sm:py-4 no-print shadow-sm border-b border-[#d8d3c8] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo / Title & Roll Badges */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <Link to="/" className="font-black text-lg sm:text-xl tracking-wider text-stone-800 flex items-center gap-2">
              <span>INDIAN FOOD</span>
            </Link>
            <div className="flex items-center gap-2">
              <NavbarSettingsBadge onOpenSettings={() => setIsSettingsOpen(true)} />
              <NavbarRollBadge />
            </div>
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
            <NavLink to="/stock-counter" className={getNavLinkClass}>
              Stock Counter
            </NavLink>
          </div>

        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home onOpenSettings={() => setIsSettingsOpen(true)} />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item" element={<EditItem />} />
          <Route path="/edit-item/:id" element={<EditItem />} />
          <Route path="/delete-item" element={<DeleteItem />} />
          <Route path="/stock-counter" element={<StockCounter />} />
          <Route path="/roll-counter" element={<StockCounter />} />
        </Routes>
      </main>

      {/* Global Roll & Print Settings Modal */}
      <PrintSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LabelCounterProvider>
        <PrintSettingsProvider>
          <AppContent />
        </PrintSettingsProvider>
      </LabelCounterProvider>
    </Router>
  );
}