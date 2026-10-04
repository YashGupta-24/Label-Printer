// src/pages/StockCounter.jsx
import { useState } from 'react';
import { useLabelCounter } from '../context/LabelCounterContext';
import { RotateCcw, Edit3, Check, X, AlertTriangle, Layers, Undo2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StockCounter() {
  const {
    initialCount,
    remainingCount,
    lastDeduction,
    resetCounter,
    undoLastDeduction,
    setManualRemaining,
  } = useLabelCounter();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(remainingCount.toString());
  const [customRollSize, setCustomRollSize] = useState('1000');
  const [showRollDialog, setShowRollDialog] = useState(false);

  const handleStartEdit = () => {
    setEditValue(remainingCount.toString());
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setManualRemaining(parsed);
    }
    setIsEditing(false);
  };

  const handleSetCustomRoll = (e) => {
    e.preventDefault();
    const parsed = parseInt(customRollSize, 10);
    if (!isNaN(parsed) && parsed > 0) {
      resetCounter(parsed);
      setShowRollDialog(false);
    }
  };

  const handleAdjustBy = (amount) => {
    const nextVal = Math.max(0, remainingCount + amount);
    setManualRemaining(nextVal);
  };

  const printedCount = Math.max(0, initialCount - remainingCount);
  const percentRemaining = initialCount > 0
    ? Math.min(100, Math.max(0, Math.round((remainingCount / initialCount) * 100)))
    : 0;

  let statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let progressColor = 'bg-emerald-500';
  if (remainingCount === 0) {
    statusBadge = 'bg-rose-50 text-rose-800 border-rose-300';
    progressColor = 'bg-rose-500';
  } else if (remainingCount <= 100) {
    statusBadge = 'bg-amber-50 text-amber-800 border-amber-300';
    progressColor = 'bg-amber-500';
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto mt-4 sm:mt-6 mb-12">
      {/* Back to Dashboard link */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Stock Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-stone-100 rounded-xl text-stone-800">
              <Layers size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Label Roll Stock
              </h1>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">
                Automatically decrements as labels are printed
              </p>
            </div>
          </div>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${statusBadge}`}>
            {remainingCount === 0
              ? 'Roll Empty'
              : remainingCount <= 100
              ? 'Low Stock'
              : `${percentRemaining}% Remaining`}
          </span>
        </div>

        {/* Big Counter Display */}
        <div className="my-6 bg-[#fbfaf8] border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
            Current Labels Remaining
          </span>

          {isEditing ? (
            <div className="flex items-center gap-2 my-2">
              <input
                type="number"
                min="0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-36 px-3 py-1.5 text-4xl font-black border border-stone-400 rounded-xl text-center bg-white text-stone-900 focus:outline-none focus:border-stone-800"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                className="p-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl transition cursor-pointer"
                title="Save count"
              >
                <Check size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition cursor-pointer"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight">
                {remainingCount.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base font-bold text-stone-400">
                / {initialCount.toLocaleString()}
              </span>
            </div>
          )}

          <p className="text-xs font-semibold text-stone-500 mt-2">
            Initial capacity: <strong className="text-stone-800">{initialCount.toLocaleString()}</strong> labels
          </p>

          {/* Quick manual adjust buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleAdjustBy(-10)}
              disabled={remainingCount === 0}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Minus size={12} /> 10
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBy(-1)}
              disabled={remainingCount === 0}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Minus size={12} /> 1
            </button>
            <button
              type="button"
              onClick={handleStartEdit}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBy(1)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} /> 1
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBy(10)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} /> 10
            </button>
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-1.5">
            <span>Roll Capacity Used</span>
            <span>{percentRemaining}% Available</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${progressColor}`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Printed From Roll
              </span>
              <span className="text-lg font-black text-stone-800">
                {printedCount.toLocaleString()} labels
              </span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Labels Left
              </span>
              <span className="text-lg font-black text-stone-800">
                {remainingCount.toLocaleString()} labels
              </span>
            </div>
          </div>
        </div>

        {/* Warnings if empty / low */}
        {remainingCount <= 100 && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800 text-xs font-bold">
            <AlertTriangle size={17} className="shrink-0 text-amber-600" />
            <span>
              {remainingCount === 0
                ? 'Your label roll is empty! Insert a new roll and click "Reset to 1,000" below.'
                : `Low label stock: Only ${remainingCount} labels left on this roll. Consider refilling soon.`}
            </span>
          </div>
        )}

        {/* Last Deduction & Undo */}
        {lastDeduction > 0 && (
          <div className="mb-6 p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-stone-600 font-semibold">
              Last print deducted: <strong className="text-stone-800">-{lastDeduction}</strong> labels
            </span>
            <button
              type="button"
              onClick={undoLastDeduction}
              className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-black rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Undo2 size={13} />
              <span>Undo (-{lastDeduction})</span>
            </button>
          </div>
        )}

        {/* Quick Reset & Roll Load Actions */}
        <div className="pt-5 border-t border-stone-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => resetCounter(1000)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-stone-800 hover:bg-stone-900 active:bg-black text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Reset counter to initial 1,000 labels"
            >
              <RotateCcw size={14} />
              <span>Reset to 1,000</span>
            </button>
            <button
              type="button"
              onClick={() => resetCounter(500)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black rounded-xl transition flex items-center justify-center gap-1 cursor-pointer border border-stone-200"
              title="Reset counter to 500 labels"
            >
              <RotateCcw size={13} />
              <span>Reset to 500</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowRollDialog(!showRollDialog)}
            className="w-full sm:w-auto text-xs font-bold text-stone-500 hover:text-stone-800 hover:underline transition cursor-pointer text-center"
          >
            {showRollDialog ? 'Hide custom roll' : 'Set custom roll size...'}
          </button>
        </div>

        {/* Custom Roll Dialog */}
        {showRollDialog && (
          <form onSubmit={handleSetCustomRoll} className="mt-4 pt-4 border-t border-dashed border-stone-200 flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={customRollSize}
              onChange={(e) => setCustomRollSize(e.target.value)}
              placeholder="e.g. 1000 or 2000"
              className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold bg-[#fdfcfb] focus:outline-none focus:border-stone-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-black rounded-xl transition cursor-pointer"
            >
              Set New Roll
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
