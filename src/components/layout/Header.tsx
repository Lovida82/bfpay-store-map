import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/common';

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">비플페이 검증 가맹점 지도</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/map"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>지도</span>
              </span>
            </Link>
            {user ? (
              <>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">등록</span>
                  </Button>
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.nickname}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/mypage"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        마이페이지
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
