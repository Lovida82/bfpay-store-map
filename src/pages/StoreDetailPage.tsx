import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreDetail, StoreComments } from '@/components/store';
import { getStoreById } from '@/services/api/stores';
import type { Store } from '@/types/store';
import { LoadingSpinner, Button } from '@/components/common';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStore() {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getStoreById(id);
        setStore(data);
      } catch (err) {
        console.error('Failed to fetch store:', err);
        setError('가맹점 정보를 불러올 수 없습니다');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStore();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600 mb-4">{error || '가맹점을 찾을 수 없습니다'}</p>
        <Link to="/">
          <Button variant="primary">홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          지도로 돌아가기
        </Link>
      </div>

      <StoreDetail store={store} />

      {/* 직원 후기 섹션 */}
      <div className="mt-8 pt-8 border-t">
        <StoreComments storeId={store.id} />
      </div>
    </div>
  );
}
