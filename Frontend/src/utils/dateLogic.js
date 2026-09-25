// src/utils/dateLogic.js
export function getLabelDates() {
  const today = new Date();
  
  // Get month (0-11, so we add 1) and pad to 2 digits (e.g., '09')
  const monthNumber = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  
  // Get full month name (e.g., "September") and extract the first letter
  const monthName = today.toLocaleString('en-US', { month: 'long' });
  const firstLetter = monthName.charAt(0).toUpperCase();

  return {
    batchNo: `${firstLetter}${monthNumber}`, // e.g., "S09"
    packedOn: `${monthNumber}/${year}`       // e.g., "09/2026"
  };
}