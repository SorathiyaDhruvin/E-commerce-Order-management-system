/**
 * Format a number to Indian currency format (e.g., 1,24,999)
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return '₹0';
  const num = parseFloat(price);
  if (isNaN(num)) return '₹0';
  
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `₹${formatted}`;
};

/**
 * Format price with decimals
 */
export const formatPriceDecimal = (price) => {
  if (price === null || price === undefined) return '₹0.00';
  const num = parseFloat(price);
  if (isNaN(num)) return '₹0.00';
  
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `₹${formatted}`;
};

/**
 * Get user initials from name
 */
export const getInitials = (firstName, lastName) => {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || 'U';
};

/**
 * Format date to Indian format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get delivery location from localStorage
 */
export const getDeliveryLocation = () => {
  try {
    const loc = localStorage.getItem('deliveryLocation');
    return loc ? JSON.parse(loc) : null;
  } catch {
    return null;
  }
};

export const setDeliveryLocation = (location) => {
  localStorage.setItem('deliveryLocation', JSON.stringify(location));
};
