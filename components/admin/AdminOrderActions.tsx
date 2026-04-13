'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};

interface AdminOrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function AdminOrderActions({ orderId, currentStatus }: AdminOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  if (nextStatuses.length === 0) return (
    <a href={`/admin/orders/${orderId}`} className="text-xs text-gold hover:text-gold-dark transition-colors duration-200">
      View
    </a>
  );

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Order marked as ${newStatus}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <a href={`/admin/orders/${orderId}`} className="text-xs text-stone hover:text-ink transition-colors duration-200">
        View
      </a>
      {nextStatuses.slice(0, 1).map((status) => (
        <button
          key={status}
          onClick={() => handleStatusUpdate(status)}
          disabled={loading}
          className="text-xs text-gold hover:text-gold-dark font-body capitalize transition-colors duration-200 disabled:opacity-50"
        >
          → {status}
        </button>
      ))}
    </div>
  );
}
