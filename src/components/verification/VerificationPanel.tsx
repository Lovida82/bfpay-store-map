import { useState } from 'react';
import type { Store } from '@/types/store';
import type { Verification } from '@/types/verification';
import { FeedbackForm } from './FeedbackForm';
import { VerificationHistory } from './VerificationHistory';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/common';
import { Link } from 'react-router-dom';

interface VerificationPanelProps {
  store: Store;
  verifications: Verification[];
  isLoading: boolean;
  onVerificationAdded: (verification: Verification) => void;
}

export function VerificationPanel({ store, verifications, isLoading, onVerificationAdded }: VerificationPanelProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">검증 내역</h2>

        {user ? (
          <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)} variant={showFeedbackForm ? 'secondary' : 'primary'} size="sm">
            {showFeedbackForm ? '취소' : '검증하기'}
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm">
              로그인하여 검증하기
            </Button>
          </Link>
        )}
      </div>

      {showFeedbackForm && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <FeedbackForm
            storeId={store.id}
            onSuccess={(verification) => {
              onVerificationAdded(verification);
              setShowFeedbackForm(false);
            }}
            onCancel={() => setShowFeedbackForm(false)}
          />
        </div>
      )}

      <VerificationHistory verifications={verifications} isLoading={isLoading} />
    </div>
  );
}
