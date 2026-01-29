import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">비플페이 제로페이 가맹점 지도 서비스</p>
            <p className="text-xs text-gray-500 mt-1">
              실제 사용 가능한 가맹점 정보를 공유하는 크라우드소싱 서비스입니다.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-gray-700">
              이용약관
            </Link>
            <Link to="/privacy" className="hover:text-gray-700">
              개인정보처리방침
            </Link>
            <a href="mailto:support@bppay-map.com" className="hover:text-gray-700">
              문의하기
            </a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 비플페이 가맹점 지도. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
