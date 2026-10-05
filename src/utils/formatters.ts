export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const calculateMargin = (dropshipPrice: number, retailPrice: number) => {
  const profit = Math.max(0, retailPrice - dropshipPrice);
  const percentage = retailPrice > 0 ? Math.round((profit / retailPrice) * 100) : 0;
  return { profit, percentage };
};

export const calculateDeliveryDate = (estimatedDaysStr?: string | number): string => {
  const match = String(estimatedDaysStr || '').match(/\d+/);
  const daysToAdd = match ? Math.max(1, parseInt(match[0], 10)) : 3;
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(d);
};

