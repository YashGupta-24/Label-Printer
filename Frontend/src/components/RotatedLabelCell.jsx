// src/components/RotatedLabelCell.jsx
import { usePrintSettings } from '../context/PrintSettingsContext';

export default function RotatedLabelCell({
  children,
  overrideRotation,
  overrideCellWidth,
  overrideCellHeight,
  className = '',
  style = {},
}) {
  const settings = usePrintSettings();

  const rotation = overrideRotation !== undefined ? overrideRotation : settings.rotation;
  const labelWidth = settings.labelWidth || 75;
  const labelHeight = settings.labelHeight || 50;

  const isRotated90 = rotation === 90 || rotation === 270;
  const cellWidth = overrideCellWidth || (isRotated90 ? labelHeight : labelWidth);
  const cellHeight = overrideCellHeight || (isRotated90 ? labelWidth : labelHeight);

  return (
    <div
      className={`label-cell shrink-0 overflow-hidden flex items-center justify-center bg-white ${className}`}
      style={{
        width: `${cellWidth}mm`,
        height: `${cellHeight}mm`,
        minWidth: `${cellWidth}mm`,
        minHeight: `${cellHeight}mm`,
        maxWidth: `${cellWidth}mm`,
        maxHeight: `${cellHeight}mm`,
        boxSizing: 'border-box',
        position: 'relative',
        ...style,
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: `${labelWidth}mm`,
          height: `${labelHeight}mm`,
          minWidth: `${labelWidth}mm`,
          minHeight: `${labelHeight}mm`,
          maxWidth: `${labelWidth}mm`,
          maxHeight: `${labelHeight}mm`,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}
