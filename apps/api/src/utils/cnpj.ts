export function sanitizeCnpj(cnpj: string): string {
  return (cnpj ?? '').replace(/\D/g, '')
}

function calcCheckDigit(base: string, weights: number[]): number {
  const sum = base
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(rawCnpj: string): boolean {
  const cnpj = sanitizeCnpj(rawCnpj)

  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const firstCheck = calcCheckDigit(cnpj.slice(0, 12), firstWeights)
  if (firstCheck !== Number(cnpj[12])) return false

  const secondCheck = calcCheckDigit(cnpj.slice(0, 13), secondWeights)
  if (secondCheck !== Number(cnpj[13])) return false

  return true
}
