import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/common';
import { getCommentsByStoreId, createComment, deleteComment } from '@/services/api/comments';
import { useAuthStore } from '@/stores';
import type { Comment } from '@/types/verification';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface StoreCommentsProps {
  storeId: string;
}

export function StoreComments({ storeId }: StoreCommentsProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    loadComments();
  }, [storeId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getCommentsByStoreId(storeId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = await createComment({
        storeId,
        content: content.trim(),
        rating: rating > 0 ? rating : undefined,
        paymentSuccess: paymentSuccess ?? undefined,
      });

      setComments((prev) => [newComment, ...prev]);
      setContent('');
      setRating(0);
      setPaymentSuccess(null);
      setShowForm(false);
      toast.success('댓글이 등록되었습니다');
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      toast.error(error.message || '댓글 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('댓글이 삭제되었습니다');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('댓글 삭제에 실패했습니다');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          직원 후기 ({comments.length})
        </h3>
        {user && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            후기 작성
          </Button>
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 결과
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentSuccess(true)}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                  paymentSuccess === true
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                )}
              >
                결제 성공
              </button>
              <button
                type="button"
                onClick={() => setPaymentSuccess(false)}
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                  paymentSuccess === false
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                )}
              >
                결제 실패
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점 (선택)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="text-2xl"
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              후기 내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="이 가맹점에서의 경험을 공유해주세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                setContent('');
                setRating(0);
                setPaymentSuccess(null);
              }}
            >
              취소
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              등록
            </Button>
          </div>
        </form>
      )}

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>아직 등록된 후기가 없습니다</p>
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              첫 번째 후기를 작성해보세요!
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {comment.user?.nickname?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {comment.user?.nickname || '익명'}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {comment.paymentSuccess !== null && (
                    <span
                      className={clsx(
                        'text-xs px-2 py-1 rounded-full font-medium',
                        comment.paymentSuccess
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      )}
                    >
                      {comment.paymentSuccess ? '결제성공' : '결제실패'}
                    </span>
                  )}
                  {comment.userId === user?.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {comment.rating && (
                <div className="mt-2 text-yellow-500">
                  {'★'.repeat(comment.rating)}
                  {'☆'.repeat(5 - comment.rating)}
                </div>
              )}

              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <p className="text-center text-sm text-gray-500">
          후기를 작성하려면 로그인이 필요합니다
        </p>
      )}
    </div>
  );
}
