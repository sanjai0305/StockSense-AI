/**
 * Format number into Indian Rupee Currency string (e.g. ₹2,48,560)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  return '₹' + num.toLocaleString('en-IN');
};

/**
 * Format numbers with comma separation (e.g. 1,248)
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-IN');
};

/**
 * Format Date strings nicely
 */
export const formatDate = (dateString, formatType = 'short') => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  if (formatType === 'header') {
    // Oct 8, 2026 format matching screenshot
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
