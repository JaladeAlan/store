import crypto from 'crypto';
import type { PaystackInitResponse, PaystackVerifyResponse } from '@/types';
import { toKobo } from '@/lib/utils';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

async function paystackFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Paystack API error');
  }

  return response.json();
}

export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in NGN
  reference: string;
  orderId: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  return paystackFetch<PaystackInitResponse>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      amount: toKobo(params.amount), // Paystack expects kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: {
        order_id: params.orderId,
        ...params.metadata,
      },
    }),
  });
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  return paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${reference}`
  );
}

export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

export async function listPaystackTransactions(params?: {
  perPage?: number;
  page?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.status) searchParams.set('status', params.status);

  return paystackFetch(`/transaction?${searchParams.toString()}`);
}
