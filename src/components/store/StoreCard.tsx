import { Link } from 'react-router-dom';
import type { Store } from '@/types/store';
import { getTrustLevel, TRUST_LEVEL_COLORS, TRUST_LEVEL_LABELS } from '@/types/map';
import { formatTrustScore, formatDistance } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/utils/constants';
import { clsx } from 'clsx';

interface StoreCardProps {
  store: Store;
  distance?: number;
  onClick?: () => void;
}

export function StoreCard({ store, distance, onClick }: StoreCardProps) {
  const trustLevel = getTrustLevel(store.trustScore, store.verificationCount);

  return (
    <Link
      to={`/store/${store.id}`}
      onClick={onClick}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{CATEGORY_ICONS[store.category] || '📍'}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
            <span
              className={clsx('px-2 py-0.5 text-xs font-medium rounded-full', {
                'bg-green-100 text-green-800': trustLevel === 'high',
                'bg-yellow-100 text-yellow-800': trustLevel === 'medium',
                'bg-red-100 text-red-800': trustLevel === 'low',
                'bg-gray-100 text-gray-600': trustLevel === 'unverified',
              })}
            >
              {TRUST_LEVEL_LABELS[trustLevel]}
            </span>
          </div>

          <p className="text-sm text-gray-500 truncate">{store.address}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TRUST_LEVEL_COLORS[trustLevel] }}
              />
              신뢰도 {formatTrustScore(store.trustScore)}
            </span>

            <span>검증 {store.verificationCount}회</span>

            {distance !== undefined && <span>{formatDistance(distance)}</span>}
          </div>
        </div>

        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
