export function formatCurrencyVND(amount: number, compact: boolean = false): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tỷ ₫`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `${(amount / 1_000_000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tr ₫`;
    }
  }

  return `${Math.round(amount).toLocaleString('vi-VN')} ₫`;
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Math.round(num).toLocaleString('vi-VN');
}

export function formatPercent(value: number, includeSign: boolean = false): string {
  if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatTon(quantity: number): string {
  if (quantity === undefined || quantity === null || isNaN(quantity)) return '0 Tấn';
  return `${Math.round(quantity).toLocaleString('vi-VN')} Tấn`;
}
