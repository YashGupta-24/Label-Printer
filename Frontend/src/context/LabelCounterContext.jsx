// src/context/LabelCounterContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const LabelCounterContext = createContext(null);

const STORAGE_KEY_REMAINING = 'label_roll_remaining';
const STORAGE_KEY_INITIAL = 'label_roll_initial';

export function LabelCounterProvider({ children }) {
  const [initialCount, setInitialCount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INITIAL);
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed > 0 ? parsed : 1000;
    } catch {
      return 1000;
    }
  });

  const [remainingCount, setRemainingCount] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMAINING);
      const parsed = parseInt(saved, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 1000;
    } catch {
      return 1000;
    }
  });

  const [lastDeduction, setLastDeduction] = useState(0);

  // Sync remainingCount to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REMAINING, remainingCount.toString());
    } catch (e) {
      console.error('Error saving remainingCount to localStorage:', e);
    }
  }, [remainingCount]);

  // Sync initialCount to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INITIAL, initialCount.toString());
    } catch (e) {
      console.error('Error saving initialCount to localStorage:', e);
    }
  }, [initialCount]);

  const deductLabels = (count) => {
    const qty = parseInt(count, 10);
    if (isNaN(qty) || qty <= 0) return;

    setRemainingCount((prev) => {
      const nextVal = Math.max(0, prev - qty);
      return nextVal;
    });
    setLastDeduction(qty);
  };

  const undoLastDeduction = () => {
    if (lastDeduction <= 0) return;
    setRemainingCount((prev) => prev + lastDeduction);
    setLastDeduction(0);
  };

  const resetCounter = (newInitial = 1000) => {
    const qty = parseInt(newInitial, 10) || 1000;
    setInitialCount(qty);
    setRemainingCount(qty);
    setLastDeduction(0);
  };

  const setManualRemaining = (value) => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty >= 0) {
      setRemainingCount(qty);
    }
  };

  return (
    <LabelCounterContext.Provider
      value={{
        initialCount,
        remainingCount,
        lastDeduction,
        deductLabels,
        undoLastDeduction,
        resetCounter,
        setManualRemaining,
      }}
    >
      {children}
    </LabelCounterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLabelCounter() {
  const context = useContext(LabelCounterContext);
  if (!context) {
    throw new Error('useLabelCounter must be used within a LabelCounterProvider');
  }
  return context;
}
