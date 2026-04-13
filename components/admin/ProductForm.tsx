'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, X, Upload, Loader } from 'lucide-react';
import { slugify } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Product, Category } from '@/types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || '',
    category_id: product?.category_id || '',
    status: product?.status || 'draft',
    featured: product?.featured || false,
    sku: product?.sku || '',
    tags: product?.tags?.join(', ') || '',
  });

  const [variants, setVariants] = useState(
    product?.variants?.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color || '',
      stock_quantity: v.stock_quantity,
      sku: v.sku || '',
    })) || [{ id: '', size: 'M', color: '', stock_quantity: 0, sku: '' }]
  );

  const [images, setImages] = useState<Array<{ url: string; is_primary: boolean; uploading?: boolean }>>(
    product?.images?.map((img) => ({ url: img.url, is_primary: img.is_primary })) || []
  );

  const [saving, setSaving] = useState(false);

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: product ? f.slug : slugify(name) }));
  };

  const addVariant = () => {
    setVariants((v) => [...v, { id: '', size: 'M', color: '', stock_quantity: 0, sku: '' }]);
  };

  const removeVariant = (i: number) => {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: string, value: string | number) => {
    setVariants((v) => v.map((variant, idx) => idx === i ? { ...variant, [field]: value } : variant));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      const tempUrl = URL.createObjectURL(file);
      const isPrimary = images.length === 0;
      setImages((imgs) => [...imgs, { url: tempUrl, is_primary: isPrimary, uploading: true }]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setImages((imgs) =>
            imgs.map((img) => img.url === tempUrl ? { ...img, url: data.url, uploading: false } : img)
          );
        } else {
          setImages((imgs) => imgs.filter((img) => img.url !== tempUrl));
          toast.error('Image upload failed');
        }
      } catch {
        setImages((imgs) => imgs.filter((img) => img.url !== tempUrl));
        toast.error('Upload error');
      }
    }
  };

  const setPrimaryImage = (idx: number) => {
    setImages((imgs) => imgs.map((img, i) => ({ ...img, is_primary: i === idx })));
  };

  const removeImage = (idx: number) => {
    setImages((imgs) => {
      const newImgs = imgs.filter((_, i) => i !== idx);
      if (imgs[idx]?.is_primary && newImgs.length > 0) {
        newImgs[0].is_primary = true;
      }
      return newImgs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          variants,
          images: images.filter((img) => !img.uploading).map((img, i) => ({
            url: img.url,
            is_primary: img.is_primary,
            sort_order: i,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(product ? 'Product updated' : 'Product created');
      router.push('/admin/products');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic Info */}
      <section className="bg-white border border-sand p-6">
        <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">SKU</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
              className="input-field"
              placeholder="LXE-001"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="input-field h-28 resize-none"
            />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              className="input-field"
              placeholder="casual, oversized, cotton"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="input-field">
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-sand p-6">
        <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink mb-5">Pricing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Price (₦) *</label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Compare At Price (₦)</label>
            <input
              type="number"
              min="0"
              value={form.compare_at_price}
              onChange={(e) => update('compare_at_price', e.target.value)}
              className="input-field"
              placeholder="Original price"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input-field">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="w-4 h-4 accent-ink"
              />
              <span className="text-xs font-body text-stone uppercase tracking-widest">Featured</span>
            </label>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-sand p-6">
        <h2 className="text-sm tracking-widests uppercase font-body font-medium text-ink mb-5">Images</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative group w-24 h-28">
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
              {img.uploading && (
                <div className="absolute inset-0 bg-ivory/70 flex items-center justify-center">
                  <Loader size={16} className="animate-spin text-gold" />
                </div>
              )}
              {!img.uploading && (
                <>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-ink/80 text-ivory p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X size={11} />
                  </button>
                  {img.is_primary ? (
                    <span className="absolute bottom-1 left-1 bg-gold text-ivory text-[9px] px-1 py-0.5 font-body uppercase tracking-wide">
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(i)}
                      className="absolute bottom-1 left-1 bg-ink/80 text-ivory text-[9px] px-1 py-0.5 font-body uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Set Primary
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-28 border-2 border-dashed border-sand flex flex-col items-center justify-center text-stone hover:border-ink hover:text-ink transition-colors duration-200 gap-1"
          >
            <Upload size={16} />
            <span className="text-[10px] font-body uppercase tracking-wide">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <p className="text-[11px] text-stone font-body">JPEG, PNG or WebP. Max 5MB per image. Click an image to set as primary.</p>
      </section>

      {/* Variants */}
      <section className="bg-white border border-sand p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm tracking-widest uppercase font-body font-medium text-ink">Variants (Sizes & Stock)</h2>
          <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs text-gold hover:text-gold-dark font-body transition-colors duration-200">
            <Plus size={13} /> Add Variant
          </button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-end">
              <div>
                <label className="label text-[10px]">Size</label>
                <select value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} className="input-field text-xs py-2">
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-[10px]">Color</label>
                <input type="text" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="input-field text-xs py-2" placeholder="Black" />
              </div>
              <div>
                <label className="label text-[10px]">Stock</label>
                <input type="number" min="0" value={v.stock_quantity} onChange={(e) => updateVariant(i, 'stock_quantity', Number(e.target.value))} className="input-field text-xs py-2" />
              </div>
              <div>
                <label className="label text-[10px]">SKU</label>
                <input type="text" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="input-field text-xs py-2" placeholder="Optional" />
              </div>
              <div className="flex justify-end pb-1">
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-stone hover:text-red-500 transition-colors duration-200">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
