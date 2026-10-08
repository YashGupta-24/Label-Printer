// src/components/PrintSettingsModal.jsx
import { usePrintSettings } from '../context/PrintSettingsContext';
import { X, Sliders, RotateCw, Columns, Check, Info, ArrowRight } from 'lucide-react';

export default function PrintSettingsModal({ isOpen, onClose }) {
  const {
    preset,
    columns,
    rotation,
    columnGap,
    pageWidth,
    pageHeight,
    cellWidth,
    cellHeight,
    applyPreset,
    updateSettings,
  } = usePrintSettings();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#fbfaf8] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 text-white rounded-xl shadow-xs">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Roll & Print Settings
              </h2>
              <p className="text-[11px] font-semibold text-stone-500">
                Configure adjacent labels, rotation, and thermal roll dimensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* 1. Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-stone-500">
                Roll Presets
              </label>
              <span className="text-[11px] font-bold text-stone-400">1-Click Setup</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Preset 2-Up 90 deg */}
              <button
                type="button"
                onClick={() => applyPreset('2up-90')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  preset === '2up-90'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md shrink-0 ${preset === '2up-90' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  <Check size={13} className={preset === '2up-90' ? 'opacity-100' : 'opacity-0'} />
                </div>
                <div>
                  <div className="text-xs font-black">2-Up Roll (90° Right)</div>
                  <div className={`text-[11px] font-medium mt-0.5 leading-snug ${preset === '2up-90' ? 'text-stone-300' : 'text-stone-500'}`}>
                    2 adjacent labels, 90° clockwise, 0mm gap (100×75mm feed)
                  </div>
                </div>
              </button>

              {/* Preset 2-Up 270 deg */}
              <button
                type="button"
                onClick={() => applyPreset('2up-270')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  preset === '2up-270'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md shrink-0 ${preset === '2up-270' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  <Check size={13} className={preset === '2up-270' ? 'opacity-100' : 'opacity-0'} />
                </div>
                <div>
                  <div className="text-xs font-black">2-Up Roll (90° Left)</div>
                  <div className={`text-[11px] font-medium mt-0.5 leading-snug ${preset === '2up-270' ? 'text-stone-300' : 'text-stone-500'}`}>
                    2 adjacent labels, 270° counter-clockwise, 0mm gap
                  </div>
                </div>
              </button>

              {/* Preset 1-Up Default */}
              <button
                type="button"
                onClick={() => applyPreset('1up-default')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  preset === '1up-default'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md shrink-0 ${preset === '1up-default' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  <Check size={13} className={preset === '1up-default' ? 'opacity-100' : 'opacity-0'} />
                </div>
                <div>
                  <div className="text-xs font-black">1-Up Single Roll</div>
                  <div className={`text-[11px] font-medium mt-0.5 leading-snug ${preset === '1up-default' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Standard single roll, 0° upright orientation (75×50mm)
                  </div>
                </div>
              </button>

              {/* Custom */}
              <button
                type="button"
                onClick={() => applyPreset('custom')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  preset === 'custom'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md shrink-0 ${preset === 'custom' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  <Check size={13} className={preset === 'custom' ? 'opacity-100' : 'opacity-0'} />
                </div>
                <div>
                  <div className="text-xs font-black">Custom Configuration</div>
                  <div className={`text-[11px] font-medium mt-0.5 leading-snug ${preset === 'custom' ? 'text-stone-300' : 'text-stone-500'}`}>
                    Adjust adjacent count, angle, and gap manually
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Visual Roll Layout Schematic */}
          <div className="bg-[#f7f5f0] border border-stone-200 rounded-xl p-3.5 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Current Roll Schematic ({pageWidth}mm W × {pageHeight}mm H Feed)
            </span>
            <div className="flex items-center gap-1 bg-stone-300/60 p-2 rounded-lg border border-stone-300 overflow-x-auto max-w-full">
              {Array.from({ length: columns }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-stone-400 rounded p-2 flex flex-col items-center justify-center shadow-xs shrink-0"
                  style={{
                    width: `${Math.min(90, Math.max(60, cellWidth * 1.1))}px`,
                    height: `${Math.min(100, Math.max(50, cellHeight * 1.1))}px`,
                  }}
                >
                  <span className="text-[10px] font-black text-stone-700">Label #{i + 1}</span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-stone-400 mt-1">
                    <RotateCw size={10} />
                    <span>{rotation}°</span>
                  </div>
                  <span className="text-[8px] text-stone-400 mt-0.5">
                    {cellWidth}×{cellHeight}mm
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-stone-500 mt-2 flex items-center gap-2">
              <span>Feed Direction: <strong>{pageHeight}mm</strong></span>
              <span>&bull;</span>
              <span>Total Width: <strong>{pageWidth}mm</strong></span>
            </div>
          </div>

          {/* 3. Detailed Parameter Adjustments */}
          <div className="p-4 bg-[#fcfbf9] rounded-xl border border-stone-200 space-y-4">
            {/* Columns (Adjacent Count) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <Columns size={15} />
                  <span>Adjacent Labels (Columns across roll)</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Number of stickers placed side-by-side on the backing
                </p>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateSettings({ columns: num, preset: 'custom' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      columns === num
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation Direction */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-stone-200/60">
              <div>
                <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <RotateCw size={15} />
                  <span>Label Rotation Direction</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  Rotates text to match roll feed and pre-printed logos
                </p>
              </div>
              <div className="grid grid-cols-4 gap-1.5 self-start sm:self-auto">
                {[
                  { deg: 0, label: '0°' },
                  { deg: 90, label: '90° (Right)' },
                  { deg: 180, label: '180°' },
                  { deg: 270, label: '270° (Left)' },
                ].map(({ deg, label }) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => updateSettings({ rotation: deg, preset: 'custom' })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                      rotation === deg
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap Between Columns */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-stone-200/60">
              <div>
                <label className="text-xs font-black text-stone-800">
                  Gap Between Adjacent Labels (mm)
                </label>
                <p className="text-[11px] text-stone-500">
                  Set to 0mm when stickers touch with zero slit gap
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={columnGap}
                  onChange={(e) => updateSettings({ columnGap: Math.max(0, parseFloat(e.target.value) || 0), preset: 'custom' })}
                  className="w-20 px-2.5 py-1.5 text-xs font-black border border-stone-300 rounded-lg bg-white text-stone-800 text-center focus:outline-none focus:border-stone-800"
                />
                <span className="text-xs font-bold text-stone-500">mm</span>
              </div>
            </div>
          </div>

          {/* 4. Windows Driver Settings Callout */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-amber-950">
                <div className="font-black text-amber-950 flex items-center gap-1.5">
                  <span>Required Windows Thermal Driver Setting</span>
                  <ArrowRight size={13} className="text-amber-700" />
                </div>
                <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 font-mono text-[11px] text-stone-900 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Stock Width:</strong> {pageWidth} mm</span>
                  <span><strong>Stock Height:</strong> {pageHeight} mm</span>
                  <span><strong>Columns:</strong> {columns}</span>
                  <span><strong>Angle:</strong> {rotation}°</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  In Windows <strong>Printers &gt; Printing Preferences &gt; Page Setup / Stock</strong>, select or add a label size of exactly <strong>{pageWidth}mm Width × {pageHeight}mm Height</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 bg-[#fbfaf8] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => applyPreset('1up-default')}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 transition underline cursor-pointer"
          >
            Reset to Standard (1-Up)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-black rounded-xl transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
