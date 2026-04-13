import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'No code provided' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discount) {
      return NextResponse.json({ success: false, error: 'Invalid discount code' });
    }

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Discount code has expired' });
    }

    // Check usage limit
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ success: false, error: 'Discount code has reached its usage limit' });
    }

    return NextResponse.json({
      success: true,
      discount: {
        type: discount.type,
        value: discount.value,
        min_order_amount: discount.min_order_amount,
      },
    });
  } catch (error) {
    console.error('Discount check error:', error);
    return NextResponse.json({ success: false, error: 'Failed to validate code' }, { status: 500 });
  }
}
