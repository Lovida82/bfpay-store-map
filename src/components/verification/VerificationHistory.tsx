import type { Verification } from '@/types/verification';
import { formatRelativeTime } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common';
import { clsx } from 'clsx';

interface VerificationHistoryProps {
  verifications: Verification[];
  isLoading: boolean;
}

export function VerificationHistory({ verifications, isLoading }: VerificationHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>아직 검증 내역이 없습니다</p>
        <p className="text-sm mt-1">첫 번째로 검증해주세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <div key={verification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div
            className={clsx(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
              verification.isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            )}
          >
            {verification.isVerified ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {verification.user?.nickname || '익명'}
              </span>
              <span className={clsx('text-sm', verification.isVerified ? 'text-green-600' : 'text-red-600')}>
                {verification.isVerified ? '결제 성공' : '결제 실패'}
              </span>
            </div>

            {verification.comment && <p className="text-sm text-gray-600 mb-1">{verification.comment}</p>}

            <p className="text-xs text-gray-400">{formatRelativeTime(verification.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
