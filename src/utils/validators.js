export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isStrongEnoughPassword(password) {
  return typeof password === 'string' && password.length >= 6
}

export function isPositiveAmount(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0
}

export function isValidPhone(phone) {
  return /^[0-9+\s-]{7,15}$/.test(phone || '')
}
