import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import * as adminApi from '@/services/api/admin';
import type { User } from '@/types/user';
import type { Store } from '@/types/store';

type TabType = 'dashboard' | 'users' | 'stores' | 'verifications' | 'comments';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<adminApi.AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [verifications, setVerifications] = useState<adminApi.VerificationWithStore[]>([]);
  const [comments, setComments] = useState<adminApi.CommentWithStore[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'stores') loadStores();
    if (activeTab === 'verifications') loadVerifications();
    if (activeTab === 'comments') loadComments();
  }, [activeTab]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAdminStats();
      setStats(data);
    } catch {
      toast.error('통계를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch {
      toast.error('사용자 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllStoresAdmin();
      setStores(data);
    } catch {
      toast.error('가맹점 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVerifications = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllVerifications();
      setVerifications(data);
    } catch {
      toast.error('검증 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllComments();
      setComments(data);
    } catch {
      toast.error('후기 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'users', label: '사용자 관리', icon: '👥' },
    { id: 'stores', label: '가맹점 관리', icon: '🏪' },
    { id: 'verifications', label: '검증 관리', icon: '✅' },
    { id: 'comments', label: '후기 관리', icon: '💬' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">관리자 페이지</h1>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'dashboard' && <DashboardTab stats={stats} isLoading={isLoading} />}
        {activeTab === 'users' && <UsersTab users={users} onRefresh={loadUsers} isLoading={isLoading} />}
        {activeTab === 'stores' && <StoresTab stores={stores} onRefresh={loadStores} isLoading={isLoading} />}
        {activeTab === 'verifications' && (
          <VerificationsTab verifications={verifications} onRefresh={loadVerifications} isLoading={isLoading} />
        )}
        {activeTab === 'comments' && (
          <CommentsTab comments={comments} onRefresh={loadComments} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}

// 로딩 스피너
function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}

// 대시보드 탭
function DashboardTab({ stats, isLoading }: { stats: adminApi.AdminStats | null; isLoading: boolean }) {
  if (isLoading) return <LoadingSpinner />;
  if (!stats) return null;

  const statCards = [
    { label: '총 사용자', value: stats.totalUsers, color: 'bg-blue-50 text-blue-700' },
    { label: '총 가맹점', value: stats.totalStores, color: 'bg-green-50 text-green-700' },
    { label: '검증 건수', value: stats.totalVerifications, color: 'bg-purple-50 text-purple-700' },
    { label: '후기 건수', value: stats.totalComments, color: 'bg-orange-50 text-orange-700' },
    { label: '대기중 가맹점', value: stats.pendingStores, color: 'bg-yellow-50 text-yellow-700' },
    { label: '승인 가맹점', value: stats.verifiedStores, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {statCards.map(card => (
        <div key={card.label} className={clsx('p-4 rounded-lg', card.color)}>
          <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
          <div className="text-sm opacity-80">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

// 사용자 관리 탭
function UsersTab({
  users,
  onRefresh,
  isLoading,
}: {
  users: User[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const handleUpdateTrustLevel = async (userId: string, level: number) => {
    try {
      await adminApi.updateUserTrustLevel(userId, level);
      toast.success('신뢰 레벨이 변경되었습니다');
      onRefresh();
    } catch {
      toast.error('변경에 실패했습니다');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">닉네임</th>
            <th className="text-left p-3 font-medium">이메일</th>
            <th className="text-center p-3 font-medium">신뢰 레벨</th>
            <th className="text-center p-3 font-medium">등록</th>
            <th className="text-center p-3 font-medium">검증</th>
            <th className="text-center p-3 font-medium">관리자</th>
            <th className="text-center p-3 font-medium">가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{u.nickname}</td>
              <td className="p-3 text-gray-600">{u.email}</td>
              <td className="p-3 text-center">
                <select
                  value={u.trustLevel}
                  onChange={e => handleUpdateTrustLevel(u.id, parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      Lv.{n}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3 text-center">{u.totalRegistrations}</td>
              <td className="p-3 text-center">{u.totalVerifications}</td>
              <td className="p-3 text-center">{u.isAdmin ? '✅' : '-'}</td>
              <td className="p-3 text-center text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <div className="text-center py-8 text-gray-500">등록된 사용자가 없습니다</div>}
    </div>
  );
}

// 가맹점 관리 탭
function StoresTab({
  stores,
  onRefresh,
  isLoading,
}: {
  stores: Store[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const handleStatusChange = async (storeId: string, status: string) => {
    try {
      await adminApi.updateStoreStatus(storeId, status);
      toast.success('상태가 변경되었습니다');
      onRefresh();
    } catch {
      toast.error('변경에 실패했습니다');
    }
  };

  const handleDelete = async (store: Store) => {
    if (!confirm(`"${store.name}" 가맹점을 삭제하시겠습니까?\n관련 검증 및 후기도 함께 삭제됩니다.`)) return;
    try {
      await adminApi.deleteStoreAdmin(store.id);
      toast.success('가맹점이 삭제되었습니다');
      onRefresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">가맹점명</th>
            <th className="text-left p-3 font-medium">주소</th>
            <th className="text-center p-3 font-medium">카테고리</th>
            <th className="text-center p-3 font-medium">상태</th>
            <th className="text-center p-3 font-medium">신뢰도</th>
            <th className="text-center p-3 font-medium">검증</th>
            <th className="text-center p-3 font-medium">등록일</th>
            <th className="text-center p-3 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {stores.map(s => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{s.name}</td>
              <td className="p-3 text-gray-600 max-w-xs truncate">{s.address}</td>
              <td className="p-3 text-center">{s.category}</td>
              <td className="p-3 text-center">
                <select
                  value={s.status}
                  onChange={e => handleStatusChange(s.id, e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="pending">대기</option>
                  <option value="verified">승인</option>
                  <option value="rejected">거절</option>
                  <option value="closed">폐업</option>
                </select>
              </td>
              <td className="p-3 text-center">
                <span
                  className={clsx('font-medium', {
                    'text-green-600': s.trustScore >= 70,
                    'text-yellow-600': s.trustScore >= 40 && s.trustScore < 70,
                    'text-red-600': s.trustScore < 40,
                  })}
                >
                  {s.trustScore}%
                </span>
              </td>
              <td className="p-3 text-center">{s.verificationCount}</td>
              <td className="p-3 text-center text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDelete(s)} className="text-red-600 hover:text-red-800 text-sm">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {stores.length === 0 && <div className="text-center py-8 text-gray-500">등록된 가맹점이 없습니다</div>}
    </div>
  );
}

// 검증 관리 탭
function VerificationsTab({
  verifications,
  onRefresh,
  isLoading,
}: {
  verifications: adminApi.VerificationWithStore[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const handleDelete = async (v: adminApi.VerificationWithStore) => {
    if (!confirm('이 검증 기록을 삭제하시겠습니까?')) return;
    try {
      await adminApi.deleteVerification(v.id, v.storeId);
      toast.success('검증이 삭제되었습니다');
      onRefresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">가맹점</th>
            <th className="text-left p-3 font-medium">작성자</th>
            <th className="text-center p-3 font-medium">결과</th>
            <th className="text-left p-3 font-medium">코멘트</th>
            <th className="text-center p-3 font-medium">작성일</th>
            <th className="text-center p-3 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map(v => (
            <tr key={v.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{v.store?.name || '-'}</td>
              <td className="p-3 text-gray-600">{v.user?.nickname || '-'}</td>
              <td className="p-3 text-center">
                <span
                  className={clsx('px-2 py-1 rounded-full text-xs font-medium', {
                    'bg-green-100 text-green-800': v.isVerified,
                    'bg-red-100 text-red-800': !v.isVerified,
                  })}
                >
                  {v.isVerified ? '성공' : '실패'}
                </span>
              </td>
              <td className="p-3 text-gray-600 max-w-xs truncate">{v.comment || '-'}</td>
              <td className="p-3 text-center text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDelete(v)} className="text-red-600 hover:text-red-800 text-sm">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {verifications.length === 0 && <div className="text-center py-8 text-gray-500">등록된 검증이 없습니다</div>}
    </div>
  );
}

// 후기 관리 탭
function CommentsTab({
  comments,
  onRefresh,
  isLoading,
}: {
  comments: adminApi.CommentWithStore[];
  onRefresh: () => void;
  isLoading: boolean;
}) {
  const handleDelete = async (c: adminApi.CommentWithStore) => {
    if (!confirm('이 후기를 삭제하시겠습니까?')) return;
    try {
      await adminApi.deleteCommentAdmin(c.id, c.storeId);
      toast.success('후기가 삭제되었습니다');
      onRefresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 font-medium">가맹점</th>
            <th className="text-left p-3 font-medium">작성자</th>
            <th className="text-center p-3 font-medium">평점</th>
            <th className="text-center p-3 font-medium">결제</th>
            <th className="text-left p-3 font-medium">내용</th>
            <th className="text-center p-3 font-medium">작성일</th>
            <th className="text-center p-3 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {comments.map(c => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{c.store?.name || '-'}</td>
              <td className="p-3 text-gray-600">{c.user?.nickname || '-'}</td>
              <td className="p-3 text-center">
                {c.rating ? (
                  <span className="text-yellow-500">{'★'.repeat(c.rating)}</span>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-3 text-center">
                {c.paymentSuccess !== null && c.paymentSuccess !== undefined ? (
                  <span
                    className={clsx('px-2 py-1 rounded-full text-xs font-medium', {
                      'bg-green-100 text-green-800': c.paymentSuccess,
                      'bg-red-100 text-red-800': !c.paymentSuccess,
                    })}
                  >
                    {c.paymentSuccess ? '성공' : '실패'}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-3 text-gray-600 max-w-xs truncate">{c.content}</td>
              <td className="p-3 text-center text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDelete(c)} className="text-red-600 hover:text-red-800 text-sm">
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {comments.length === 0 && <div className="text-center py-8 text-gray-500">등록된 후기가 없습니다</div>}
    </div>
  );
}
