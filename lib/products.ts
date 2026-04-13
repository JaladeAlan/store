import { createClient } from '@/lib/supabase/server';
import type { Product, ProductFilters, PaginatedResponse } from '@/types';

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient();
  const {
    category,
    minPrice,
    maxPrice,
    sizes,
    search,
    featured,
    sort = 'newest',
    page = 1,
    pageSize = 12,
  } = filters;

  // Resolve category slug → id
  let categoryId: string | null = null;
  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .single();
    categoryId = cat?.id ?? null;
  }

  // If filtering by sizes, get matching product IDs first (nested filter workaround)
  let sizeFilteredProductIds: string[] | null = null;
  if (sizes && sizes.length > 0) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('product_id')
      .in('size', sizes)
      .gt('stock_quantity', 0);

    sizeFilteredProductIds = variants
      ? [...new Set(variants.map((v) => v.product_id))]
      : [];
  }

  // If size filter produced no results, return early
  if (sizeFilteredProductIds !== null && sizeFilteredProductIds.length === 0) {
    return { data: [], count: 0, page, pageSize, totalPages: 0 };
  }

  let query = supabase
    .from('products')
    .select(
      `
      *,
      categories:categories!product_categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `,
      { count: 'exact' }
    )
    .eq('status', 'active');

  if (categoryId) query = query.eq('category_id', categoryId);
  if (minPrice !== undefined) query = query.gte('price', minPrice);
  if (maxPrice !== undefined) query = query.lte('price', maxPrice);
  if (featured !== undefined) query = query.eq('featured', featured);
  if (search) query = query.ilike('name', `%${search}%`);
  if (sizeFilteredProductIds) query = query.in('id', sizeFilteredProductIds);

  switch (sort) {
    case 'price-asc':  query = query.order('price', { ascending: true });  break;
    case 'price-desc': query = query.order('price', { ascending: false }); break;
    case 'name-asc':   query = query.order('name',  { ascending: true });  break;
    default:           query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data as Product[],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:categories!product_categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error) return null;
  return data as Product;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:categories!product_categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as Product[];
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      categories:categories!product_categories(*),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .eq('status', 'active')
    .neq('id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) return [];
  return data as Product[];
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(url, is_primary), variants:product_variants(*)')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  if (error) return [];
  return data as Product[];
}

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data;
}