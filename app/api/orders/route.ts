import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrder } from '@/lib/orders';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Please sign in to checkout' }, { status: 401 });
    }

    const { items, formData, discountAmount = 0 } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // Validate required fields
    const required = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state'];
    for (const field of required) {
      if (!formData[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
      }
    }

    // Fetch full product + variant data from DB for security (never trust client prices)
    const productIds = Array.from(new Set(items.map((i: { productId: string }) => i.productId)));
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*, variants:product_variants(*), images:product_images(*)')
      .in('id', productIds)
      .eq('status', 'active');

    if (productsError || !products) {
      return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
    }

    // Build cart items with verified prices
    const cartItems = items.map((item: { productId: string; variantId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const variant = product.variants.find((v: { id: string }) => v.id === item.variantId);
      if (!variant) throw new Error(`Variant ${item.variantId} not found`);

      if (variant.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (${variant.size})`);
      }

      return { product, variant, quantity: item.quantity };
    });

    // Save address if requested
    if (formData.saveAddress) {
      await supabase.from('addresses').upsert({
        user_id: user.id,
        label: 'Home',
        full_name: formData.fullName,
        phone: formData.phone,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2 || null,
        city: formData.city,
        state: formData.state,
        country: formData.country || 'Nigeria',
        is_default: true,
      });
    }

    const order = await createOrder(user.id, cartItems, formData, discountAmount);

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/orders — get user orders
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, slug, images:product_images(url, is_primary)),
          variant:product_variants(size, color)
        ),
        payment:payments(status, provider, paid_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}
