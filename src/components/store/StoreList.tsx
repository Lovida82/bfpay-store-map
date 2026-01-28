import { StoreCard } from './StoreCard';
import type { Store } from '@/types/store';
import { LoadingSpinner } from '@/components/common';

interface StoreListProps {
  stores: Store[];
  isLoading?: boolean;
  emptyMessage?: string;
  onStoreClick?: (store: Store) => void;
}

export function StoreList({ stores, isLoading, emptyMessage = '등록된 가맹점이 없습니다', onStoreClick }: StoreListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} onClick={() => onStoreClick?.(store)} />
      ))}
    </div>
  );
}
