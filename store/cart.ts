import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id && item.variant.id === variant.id
          );

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            const currentQty = updatedItems[existingIndex].quantity;
            const maxQty = variant.stock_quantity;
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: Math.min(currentQty + quantity, maxQty),
            };
            return { items: updatedItems, isOpen: true };
          }

          return {
            items: [...state.items, { product, variant, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product.id === productId && item.variant.id === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variant.id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'luxe-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);