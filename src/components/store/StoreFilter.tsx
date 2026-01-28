import { useStoreStore } from '@/stores';
import { STORE_CATEGORIES, type StoreCategory } from '@/types/store';
import { CATEGORY_ICONS } from '@/utils/constants';
import { clsx } from 'clsx';

export function StoreFilter() {
  const { selectedCategory, setSelectedCategory } = useStoreStore();

  const categories: (StoreCategory | null)[] = [null, ...STORE_CATEGORIES];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {categories.map((category) => (
        <button
          key={category || 'all'}
          onClick={() => setSelectedCategory(category)}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === category
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {category ? (
            <>
              <span>{CATEGORY_ICONS[category]}</span>
              <span>{category}</span>
            </>
          ) : (
            '전체'
          )}
        </button>
      ))}
    </div>
  );
}
