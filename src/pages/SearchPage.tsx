import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StoreList, StoreFilter } from '@/components/store';
import { searchStores } from '@/services/api/stores';
import type { Store, StoreCategory } from '@/types/store';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') as StoreCategory | null;

  useEffect(() => {
    async function search() {
      setIsLoading(true);
      try {
        const result = await searchStores({
          query: query || undefined,
          category: category || undefined,
        });
        setStores(result.stores);
        setTotal(result.total);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [query, category]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">가맹점 검색</h1>
        <p className="text-gray-600">비플페이 사용 가능한 가맹점을 검색하세요.</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="text"
            defaultValue={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="가게명 또는 주소로 검색"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <StoreFilter />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          검색 결과 <span className="font-medium text-gray-900">{total}</span>개
        </p>
      </div>

      <StoreList stores={stores} isLoading={isLoading} emptyMessage="검색 결과가 없습니다" />
    </div>
  );
}
