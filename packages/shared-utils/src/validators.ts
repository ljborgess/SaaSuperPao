export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10])
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false
  const calcDigit = (d: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0)
    const rem = sum % 11
    return rem < 2 ? 0 : 11 - rem
  }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  if (calcDigit(digits, w1) !== parseInt(digits[12])) return false
  if (calcDigit(digits, w2) !== parseInt(digits[13])) return false
  return true
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
