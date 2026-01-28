export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^0\d{1,2}-?\d{3,4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function isValidBusinessNumber(number: string): boolean {
  const cleaned = number.replace(/\D/g, '');
  return cleaned.length === 10;
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidNickname(nickname: string): boolean {
  return nickname.length >= 2 && nickname.length <= 20;
}
