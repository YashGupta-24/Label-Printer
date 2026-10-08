// src/context/PrintSettingsContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const PrintSettingsContext = createContext(null);

const STORAGE_KEY_SETTINGS = 'pos_print_settings';

// eslint-disable-next-line react-refresh/only-export-components
export const PRESETS = {
  '2up-90': {
    id: '2up-90',
    name: '2-Up Roll (90° Right / Clockwise, 0mm gap)',
    columns: 2,
    rotation: 90,
    columnGap: 0,
    labelWidth: 75,
    labelHeight: 50,
  },
  '2up-270': {
    id: '2up-270',
    name: '2-Up Roll (90° Left / Counter-Clockwise, 0mm gap)',
    columns: 2,
    rotation: 270,
    columnGap: 0,
    labelWidth: 75,
    labelHeight: 50,
  },
  '1up-default': {
    id: '1up-default',
    name: '1-Up Single Roll (Standard 75×50mm, 0°)',
    columns: 1,
    rotation: 0,
    columnGap: 0,
    labelWidth: 75,
    labelHeight: 50,
  },
  'custom': {
    id: 'custom',
    name: 'Custom Configuration',
  }
};

const DEFAULT_SETTINGS = PRESETS['2up-90'];

export function PrintSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const parsedRot = parsed.rotation !== undefined ? Number(parsed.rotation) : 90;
        const parsedGap = parsed.columnGap !== undefined ? Number(parsed.columnGap) : 0;
        return {
          preset: parsed.preset || '2up-90',
          columns: Number(parsed.columns) || 2,
          rotation: isNaN(parsedRot) ? 90 : parsedRot,
          columnGap: isNaN(parsedGap) ? 0 : parsedGap,
          labelWidth: Number(parsed.labelWidth) || 75,
          labelHeight: Number(parsed.labelHeight) || 50,
        };
      }
    } catch (e) {
      console.error('Error loading print settings:', e);
    }
    return {
      preset: DEFAULT_SETTINGS.id,
      columns: DEFAULT_SETTINGS.columns,
      rotation: DEFAULT_SETTINGS.rotation,
      columnGap: DEFAULT_SETTINGS.columnGap,
      labelWidth: DEFAULT_SETTINGS.labelWidth,
      labelHeight: DEFAULT_SETTINGS.labelHeight,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving print settings:', e);
    }
  }, [settings]);

  const updateSettings = (updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      // Check if it matches a preset
      let matchedPreset = 'custom';
      for (const [key, preset] of Object.entries(PRESETS)) {
        if (
          key !== 'custom' &&
          preset.columns === next.columns &&
          preset.rotation === next.rotation &&
          preset.columnGap === next.columnGap &&
          preset.labelWidth === next.labelWidth &&
          preset.labelHeight === next.labelHeight
        ) {
          matchedPreset = key;
          break;
        }
      }
      next.preset = updates.preset || matchedPreset;
      return next;
    });
  };

  const applyPreset = (presetId) => {
    if (PRESETS[presetId] && presetId !== 'custom') {
      const p = PRESETS[presetId];
      setSettings({
        preset: p.id,
        columns: p.columns,
        rotation: p.rotation,
        columnGap: p.columnGap,
        labelWidth: p.labelWidth,
        labelHeight: p.labelHeight,
      });
    } else {
      updateSettings({ preset: 'custom' });
    }
  };

  // Dimensions computation
  const isRotated90 = settings.rotation === 90 || settings.rotation === 270;
  // Cell footprint per single label on the web
  const cellWidth = isRotated90 ? settings.labelHeight : settings.labelWidth;
  const cellHeight = isRotated90 ? settings.labelWidth : settings.labelHeight;
  
  // Total row page footprint fed by the thermal printer
  const pageWidth = (settings.columns * cellWidth) + ((settings.columns - 1) * settings.columnGap);
  const pageHeight = cellHeight;

  return (
    <PrintSettingsContext.Provider
      value={{
        ...settings,
        isRotated90,
        cellWidth,
        cellHeight,
        pageWidth,
        pageHeight,
        applyPreset,
        updateSettings,
      }}
    >
      {children}
    </PrintSettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrintSettings() {
  const context = useContext(PrintSettingsContext);
  if (!context) {
    throw new Error('usePrintSettings must be used within a PrintSettingsProvider');
  }
  return context;
}
