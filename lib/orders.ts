import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Order, CartItem, CheckoutFormData } from '@/types';
import { generateOrderNumber, getShippingCost } from '@/lib/utils';

export async function createOrder(
  userId: string,
  cartItems: CartItem[],
  formData: CheckoutFormData,
  discountAmount = 0
): Promise<Order> {
  const supabase = await createClient();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = getShippingCost(subtotal);
  const total = subtotal + shippingCost - discountAmount;

  const shippingAddress = {
    full_name: formData.fullName,
    phone: formData.phone,
    address_line1: formData.addressLine1,
    address_line2: formData.addressLine2,
    city: formData.city,
    state: formData.state,
    country: formData.country,
  };

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      user_id: userId,
      status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total,
      shipping_address: shippingAddress,
      notes: formData.notes,
      discount_code: formData.discountCode || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    variant_id: item.variant.id,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  // Decrement stock
  for (const item of cartItems) {
    await supabase.rpc('decrement_stock', {
      variant_id: item.variant.id,
      quantity: item.quantity,
    });
  }

  return order as Order;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(name, slug, images:product_images(url, is_primary)),
        variant:product_variants(size, color)
      ),
      payment:payments(*)
    `
    )
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as Order;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(name, slug, images:product_images(url, is_primary))
      ),
      payment:payments(status, provider)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Order[];
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
}

export async function getAdminOrders(
  page = 1,
  pageSize = 20,
  status?: string
) {
  const supabase = await createAdminClient();

  let query = supabase
    .from('orders')
    .select(
      `
      *,
      user:users(full_name, email),
      payment:payments(status, provider)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, count };
}
