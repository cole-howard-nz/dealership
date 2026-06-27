export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(price);
}

export function formatOdometer(km: number) {
  return `${new Intl.NumberFormat("en-NZ").format(km)} km`;
}

// Accepts NZ mobile/landline in common formats, e.g.:
//   0210 834 3645 · 021834364 · +64 21 834 3645 · +6421834364
// Strips all spaces before testing so spacing between digit groups doesn't matter.
export const NZ_PHONE_REGEX = /^(\+64|0)\d{7,11}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;