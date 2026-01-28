import { useState, useEffect } from 'react';
import type { Store } from '@/types/store';
import type { Verification } from '@/types/verification';
import { getTrustLevel, TRUST_LEVEL_COLORS, TRUST_LEVEL_LABELS } from '@/types/map';
import { formatTrustScore, formatDate, formatPhoneNumber } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/utils/constants';
import { getVerificationsByStoreId } from '@/services/api/verification';
import { VerificationPanel } from '@/components/verification/VerificationPanel';
import { clsx } from 'clsx';

interface StoreDetailProps {
  store: Store;
}

export function StoreDetail({ store }: StoreDetailProps) {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(true);

  const trustLevel = getTrustLevel(store.trustScore, store.verificationCount);

  useEffect(() => {
    async function fetchVerifications() {
      try {
        const data = await getVerificationsByStoreId(store.id);
        setVerifications(data);
      } catch (error) {
        console.error('Failed to fetch verifications:', error);
      } finally {
        setIsLoadingVerifications(false);
      }
    }

    fetchVerifications();
  }, [store.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{CATEGORY_ICONS[store.category] || '📍'}</div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <span
                className={clsx('px-3 py-1 text-sm font-medium rounded-full', {
                  'bg-green-100 text-green-800': trustLevel === 'high',
                  'bg-yellow-100 text-yellow-800': trustLevel === 'medium',
                  'bg-red-100 text-red-800': trustLevel === 'low',
                  'bg-gray-100 text-gray-600': trustLevel === 'unverified',
                })}
              >
                {TRUST_LEVEL_LABELS[trustLevel]}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{store.address}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">업종:</span>
                <span className="ml-2 text-gray-900">{store.category}</span>
              </div>

              {store.phone && (
                <div>
                  <span className="text-gray-500">전화:</span>
                  <a href={`tel:${store.phone}`} className="ml-2 text-primary-600 hover:underline">
                    {formatPhoneNumber(store.phone)}
                  </a>
                </div>
              )}

              <div>
                <span className="text-gray-500">등록일:</span>
                <span className="ml-2 text-gray-900">{formatDate(store.createdAt)}</span>
              </div>

              {store.lastVerifiedAt && (
                <div>
                  <span className="text-gray-500">마지막 검증:</span>
                  <span className="ml-2 text-gray-900">{formatDate(store.lastVerifiedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: TRUST_LEVEL_COLORS[trustLevel] }}>
                  {formatTrustScore(store.trustScore)}
                </div>
                <div className="text-xs text-gray-500">신뢰도</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{store.verificationCount}</div>
                <div className="text-xs text-gray-500">총 검증</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{store.positiveCount}</div>
                <div className="text-xs text-gray-500">성공</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{store.negativeCount}</div>
                <div className="text-xs text-gray-500">실패</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {store.zeropaySupported && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">제로페이</span>
              )}
              {store.bipaySupported && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">비플페이</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <VerificationPanel
        store={store}
        verifications={verifications}
        isLoading={isLoadingVerifications}
        onVerificationAdded={(verification) => setVerifications([verification, ...verifications])}
      />
    </div>
  );
}
