export function formatPrice(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getDiscountPercent(mrp: number, selling: number) {
  if (!mrp || mrp <= selling) return 0;
  return Math.round(((mrp - selling) / mrp) * 100);
}
