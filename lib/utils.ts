import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LXE-${timestamp}-${random}`;
}

export function generatePaystackRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ps_${timestamp}_${random}`;
}

export function calculateDiscount(
  subtotal: number,
  discount: { type: 'percentage' | 'fixed'; value: number }
): number {
  if (discount.type === 'percentage') {
    return Math.floor((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal);
}

export function getShippingCost(subtotal: number): number {
  if (subtotal >= 50000) return 0; // Free shipping over ₦50,000
  if (subtotal >= 20000) return 1500;
  return 2500;
}

// Paystack uses kobo (smallest unit), so multiply NGN by 100
export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}

export function fromKobo(kobo: number): number {
  return kobo / 100;
}

export function getImageUrl(path: string | null): string {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}

export function getSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double XL',
    XXXL: 'Triple XL',
  };
  return labels[size] || size;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
