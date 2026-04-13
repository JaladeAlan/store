import crypto from 'crypto';
import type { MonnifyInitResponse } from '@/types';

const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE!;
const MONNIFY_BASE_URL =
  process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

let monnifyToken: { token: string; expiresAt: number } | null = null;

async function getMonnifyAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (monnifyToken && Date.now() < monnifyToken.expiresAt) {
    return monnifyToken.token;
  }

  const credentials = Buffer.from(
    `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
  ).toString('base64');

  const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Monnify access token');
  }

  const data = await response.json();
  const token = data.responseBody.accessToken;

  // Cache token (expires in 1 hour, refresh at 55 minutes)
  monnifyToken = {
    token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return token;
}

export async function initializeMonnifyTransaction(params: {
  amount: number;
  customerEmail: string;
  customerName: string;
  paymentReference: string;
  paymentDescription: string;
  orderId: string;
  redirectUrl: string;
}): Promise<MonnifyInitResponse> {
  const token = await getMonnifyAccessToken();

  const response = await fetch(
    `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        paymentReference: params.paymentReference,
        paymentDescription: params.paymentDescription,
        currencyCode: 'NGN',
        contractCode: MONNIFY_CONTRACT_CODE,
        redirectUrl: params.redirectUrl,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD', 'PHONE_NUMBER'],
        metadata: {
          order_id: params.orderId,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.responseMessage || 'Monnify API error');
  }

  return response.json();
}

export async function verifyMonnifyTransaction(
  transactionReference: string
): Promise<{
  status: 'PAID' | 'FAILED' | 'PENDING';
  amount: number;
  reference: string;
}> {
  const token = await getMonnifyAccessToken();

  const encodedRef = encodeURIComponent(transactionReference);
  const response = await fetch(
    `${MONNIFY_BASE_URL}/api/v2/transactions/${encodedRef}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify Monnify transaction');
  }

  const data = await response.json();
  const body = data.responseBody;

  return {
    status: body.paymentStatus,
    amount: body.amountPaid,
    reference: body.paymentReference,
  };
}

export function verifyMonnifyWebhook(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.MONNIFY_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return hash === signature;
}
