import { useState } from 'react';
import { Button, Input } from '@/components/common';
import { createVerification } from '@/services/api/verification';
import type { Verification } from '@/types/verification';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface FeedbackFormProps {
  storeId: string;
  onSuccess: (verification: Verification) => void;
  onCancel: () => void;
}

export function FeedbackForm({ storeId, onSuccess, onCancel }: FeedbackFormProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isVerified === null) {
      toast.error('결제 성공 여부를 선택해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const verification = await createVerification({
        storeId,
        isVerified,
        comment: comment.trim() || undefined,
      });

      toast.success('검증이 등록되었습니다');
      onSuccess(verification);
    } catch (error: any) {
      console.error('Failed to create verification:', error);
      toast.error(error.message || '검증 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">결제 성공 여부</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setIsVerified(true)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-colors',
              isVerified === true
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">결제 성공</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVerified(false)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border-2 transition-colors',
              isVerified === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">결제 실패</span>
          </button>
        </div>
      </div>

      <div>
        <Input
          label="코멘트 (선택)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="추가 정보를 입력해주세요 (예: 점심시간에 방문)"
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          취소
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isVerified === null} className="flex-1">
          등록
        </Button>
      </div>
    </form>
  );
}
