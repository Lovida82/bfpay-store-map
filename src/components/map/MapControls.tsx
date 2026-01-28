import { CurrentLocationButton } from './CurrentLocationButton';
import { useStoreStore } from '@/stores';
import { Dropdown } from '@/components/common';
import { STORE_CATEGORIES, type StoreCategory } from '@/types/store';

export function MapControls() {
  const { selectedCategory, setSelectedCategory, searchRadius, setSearchRadius } = useStoreStore();

  const radiusOptions = [
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
  ];

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2">
      <div className="flex gap-2 bg-white rounded-lg shadow-lg p-2">
        <Dropdown
          options={['전체', ...STORE_CATEGORIES]}
          value={selectedCategory || '전체'}
          onChange={(value) => setSelectedCategory(value === '전체' ? null : (value as StoreCategory))}
          placeholder="업종"
          className="w-28"
        />

        <select
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {radiusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto">
        <CurrentLocationButton />
      </div>
    </div>
  );
}
