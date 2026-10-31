// src/utils/dateLogic.js

export function formatDateForInput(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLabelDates(inputDate) {
  let targetDate;
  if (!inputDate) {
    targetDate = new Date();
  } else if (inputDate instanceof Date) {
    targetDate = inputDate;
  } else if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    const [y, m, d] = inputDate.split('-').map(Number);
    targetDate = new Date(y, m - 1, d);
  } else if (typeof inputDate === 'string' && /^\d{4}-\d{2}$/.test(inputDate)) {
    const [y, m] = inputDate.split('-').map(Number);
    targetDate = new Date(y, m - 1, 1);
  } else {
    targetDate = new Date(inputDate);
  }

  if (isNaN(targetDate.getTime())) {
    targetDate = new Date();
  }
  
  // Get month (0-11, so we add 1) and pad to 2 digits (e.g., '09')
  const monthNumber = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = targetDate.getFullYear();
  
  // Get full month name (e.g., "September") and extract the first letter
  const monthName = targetDate.toLocaleString('en-US', { month: 'long' });
  const firstLetter = monthName.charAt(0).toUpperCase();

  return {
    batchNo: `${firstLetter}${monthNumber}`, // e.g., "S09"
    packedOn: `${monthNumber}/${year}`       // e.g., "09/2026"
  };
}
