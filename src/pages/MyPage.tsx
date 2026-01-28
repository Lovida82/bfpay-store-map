import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, useStoreStore } from '@/stores';
import { Button } from '@/components/common';
import { getMyStores, deleteStore } from '@/services/api/stores';
import { formatDate } from '@/utils/formatters';
import type { Store } from '@/types/store';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export function MyPage() {
  const { user, signOut } = useAuthStore();
  const { removeStore } = useStoreStore();
  const [myStores, setMyStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStores, setShowStores] = useState(false);

  useEffect(() => {
    if (showStores && user) {
      loadMyStores();
    }
  }, [showStores, user]);

  const loadMyStores = async () => {
    setIsLoading(true);
    try {
      const stores = await getMyStores();
      setMyStores(stores);
    } catch (error) {
      console.error('Failed to load my stores:', error);
      toast.error('내 매장 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStore = async (store: Store) => {
    if (!confirm(`"${store.name}" 매장을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deleteStore(store.id);
      setMyStores((prev) => prev.filter((s) => s.id !== store.id));
      removeStore(store.id);
      toast.success('매장이 삭제되었습니다');
    } catch (error: any) {
      console.error('Failed to delete store:', error);
      toast.error(error.message || '매장 삭제에 실패했습니다');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">{user.nickname.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.nickname}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.totalRegistrations}</div>
            <div className="text-sm text-gray-500">등록한 가맹점</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.totalVerifications}</div>
            <div className="text-sm text-gray-500">검증 횟수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">Lv.{user.trustLevel}</div>
            <div className="text-sm text-gray-500">신뢰 레벨</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">가입일: {formatDate(user.createdAt)}</div>
      </div>

      {/* 내가 등록한 가맹점 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <button
          onClick={() => setShowStores(!showStores)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-gray-900">내가 등록한 가맹점</h3>
          <svg
            className={clsx('w-5 h-5 text-gray-400 transition-transform', showStores && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showStores && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : myStores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>등록한 가맹점이 없습니다</p>
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                  가맹점 등록하기
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myStores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <Link to={`/store/${store.id}`} className="flex-1">
                      <div className="font-medium text-gray-900">{store.name}</div>
                      <div className="text-sm text-gray-500">{store.address}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {store.category} · {formatDate(store.createdAt)}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={clsx(
                          'text-xs px-2 py-1 rounded-full',
                          store.status === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : store.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {store.status === 'verified' ? '검증됨' : store.status === 'pending' ? '대기중' : store.status}
                      </span>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">계정 관리</h3>

        <div className="space-y-4">
          <button className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-gray-700">프로필 수정</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-gray-700">내 검증 내역</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Button variant="danger" onClick={signOut} className="w-full">
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
