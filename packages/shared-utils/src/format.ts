export function formatCurrency(value: number, locale = 'pt-BR', currency = 'BRL'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
}

export function formatDate(date: Date | string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(date))
}

export function formatDateTime(date: Date | string, locale = 'pt-BR'): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(date),
  )
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function calculateMargin(costPrice: number, salePrice: number): number {
  if (salePrice === 0) return 0
  return Number((((salePrice - costPrice) / salePrice) * 100).toFixed(2))
}

export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return value
}
