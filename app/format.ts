export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(price);
}

export function formatOdometer(km: number) {
  return `${new Intl.NumberFormat("en-NZ").format(km)} km`;
}

export const NZ_PHONE_REGEX = /^(\+64\s?\d{1,2}\s?\d{3}\s?\d{3,4}|0\d{1,2}\s?\d{3}\s?\d{3,4})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
