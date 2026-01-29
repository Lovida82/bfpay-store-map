import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export function LandingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 로그인된 사용자는 지도 페이지로 리다이렉트
  useEffect(() => {
    if (user) {
      navigate('/map', { replace: true });
    }
  }, [user, navigate]);

  // 로그인된 사용자는 리다이렉트 중이므로 아무것도 렌더링하지 않음
  if (user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero 섹션 */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              진짜 되는 곳만 모았다!
              <br />
              <span className="text-primary-200">비플페이 검증 가맹점 지도</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              제로페이맵에 등록된 수많은 가맹점,
              <br className="hidden md:block" />
              정작 결제가 안 되는 곳이 너무 많지 않으셨나요?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/map"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                지도 보러가기
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 transition-colors border-2 border-primary-400"
                >
                  회원가입하고 참여하기
                </Link>
              )}
            </div>
            <p className="text-primary-200 text-sm mt-6">
              회원가입 없이도 지도를 구경할 수 있어요!
              <br />
              회원가입하시면 가맹점 등록, 결제 검증 참여는 물론
              <br className="hidden sm:block" />
              별점과 후기로 맛집 정보도 공유할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 문제점 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              이런 경험 있으시죠?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">결제 실패</h3>
              <p className="text-gray-600 text-sm">
                "제로페이 가맹점이라더니 결제가 안 되네요..."
                <br />
                폐업했거나 더 이상 지원하지 않는 가게들
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">정보 부정확</h3>
              <p className="text-gray-600 text-sm">
                "가맹점 위치가 다르거나 영업시간이 안 맞아요"
                <br />
                업데이트되지 않는 부정확한 정보들
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">시간 낭비</h3>
              <p className="text-gray-600 text-sm">
                "한 곳 결제하려고 여러 가게 돌아다녔어요"
                <br />
                어디가 진짜 되는지 알 수 없는 답답함
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 해결책 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              그래서 우리가 직접 만들었습니다
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              동료들이 직접 결제해보고 인증한 가맹점만 모아놓은
              <strong className="text-primary-600"> 우리만의 비플페이 지도</strong>입니다.
            </p>
            <p className="text-gray-500 mt-3">
              더 이상 헛걸음 하지 마세요!
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">실제 결제 인증</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    동료가 직접 결제 성공/실패를 기록하여 신뢰도를 보여드립니다
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">크라우드소싱</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    우리 모두가 함께 만들어가는 살아있는 지도입니다
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">신뢰도 점수</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    마커 색상으로 한눈에 신뢰할 수 있는 가맹점을 구분하세요
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">마커 색상 안내</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-700">신뢰도 70%+ & 검증 3회 이상 - 믿고 가세요!</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-yellow-500 rounded-full"></span>
                  <span className="text-sm text-gray-700">신뢰도 40%+ - 대체로 괜찮아요</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-gray-700">신뢰도 40% 미만 - 주의가 필요해요</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
                  <span className="text-sm text-gray-700">아직 검증 전 - 첫 검증을 해주세요!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 등록 방법 섹션 */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              가맹점 등록, 정말 쉬워요!
            </h2>
            <p className="text-gray-600">
              3가지 방법으로 간편하게 가맹점을 등록할 수 있습니다
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                방법 1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">직접 입력</h3>
              <p className="text-gray-600 text-sm">
                가게 이름과 주소만 입력하면
                <br />
                위치가 자동으로 지도에 표시됩니다
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                추천
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                방법 2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">사진으로 등록 (OCR)</h3>
              <p className="text-gray-600 text-sm">
                가게 간판이나 영수증 사진만 찍으면
                <br />
                AI가 자동으로 정보를 추출합니다
              </p>
              <p className="text-primary-600 text-xs mt-2 font-medium">
                제로페이맵 즐겨찾기 캡쳐로도 등록 가능!
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                방법 3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Excel 일괄 등록</h3>
              <p className="text-gray-600 text-sm">
                여러 가맹점을 한 번에!
                <br />
                샘플 양식 다운로드 후 작성하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              주요 기능
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">빠른 검색</h3>
              <p className="text-sm text-gray-600">
                가게 이름, 주소로
                <br />
                빠르게 찾기
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">결제 검증</h3>
              <p className="text-sm text-gray-600">
                결제 성공/실패
                <br />
                직접 인증하기
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">별점 후기</h3>
              <p className="text-sm text-gray-600">
                맛집 후기도
                <br />
                함께 공유하기
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">내 주변 검색</h3>
              <p className="text-sm text-gray-600">
                현재 위치 기반
                <br />
                가까운 곳 찾기
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-primary-100 mb-4">
            우리 모두가 함께 만드는 신뢰할 수 있는 비플페이 가맹점 지도.
            <br />
            가맹점을 등록하고, 검증하고, 공유해보세요.
          </p>
          <p className="text-primary-200 text-sm mb-8">
            지도는 누구나 볼 수 있어요! 회원가입하시면 가맹점 등록, 결제 검증,
            <br className="hidden sm:block" />
            별점 후기로 맛집 정보 공유까지 모두 참여할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              지도 보러가기
            </Link>
            {user ? (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 transition-colors border-2 border-primary-400"
              >
                가맹점 등록하기
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-400 transition-colors border-2 border-primary-400"
              >
                회원가입하기
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
