import { Link } from 'react-router-dom';
import { Button } from '@/components/common';

export function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4 mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link to="/">
          <Button variant="primary" size="lg">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
