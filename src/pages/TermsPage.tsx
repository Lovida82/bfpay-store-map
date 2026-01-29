import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
          <p className="text-sm text-gray-500 mb-8">최종 수정일: 2026년 1월 29일</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관은 비플페이 검증 가맹점 지도 서비스(이하 "서비스")를 이용함에 있어
                서비스 운영자(이하 "운영자")와 이용자(이하 "회원") 간의 권리, 의무 및
                책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (서비스의 정의)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 서비스는 비플페이/제로페이 사용 가능 가맹점 정보를 회원들이 직접 등록하고
                검증하여 공유하는 크라우드소싱 기반의 지도 서비스입니다. 서비스에서 제공하는
                주요 기능은 다음과 같습니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>가맹점 정보 등록 (수동 입력, OCR 이미지 인식, Excel 일괄 등록)</li>
                <li>가맹점 결제 가능 여부 검증</li>
                <li>가맹점 후기 및 별점 작성</li>
                <li>지도 기반 가맹점 검색 및 조회</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (회원가입 및 계정)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 회원가입은 이메일 주소와 비밀번호를 통해 이루어지며, 가입 시 본 약관에
                동의한 것으로 간주합니다.<br /><br />
                2. 회원은 정확하고 최신의 정보를 제공해야 하며, 타인의 정보를 도용하여
                가입할 수 없습니다.<br /><br />
                3. 계정 정보의 관리 책임은 회원에게 있으며, 계정의 무단 사용으로 인한
                손해에 대해 운영자는 책임지지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (회원의 의무)</h2>
              <p className="text-gray-700 leading-relaxed">회원은 다음 행위를 해서는 안 됩니다:</p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>허위 가맹점 정보 등록</li>
                <li>악의적인 허위 검증 기록 작성</li>
                <li>타인의 명예를 훼손하거나 불쾌감을 주는 내용 게시</li>
                <li>서비스 운영을 방해하는 행위</li>
                <li>개인정보 수집 목적의 악용 행위</li>
                <li>기타 법령 및 공서양속에 반하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (콘텐츠의 권리 및 책임)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 회원이 등록한 가맹점 정보, 검증 기록, 후기 등의 콘텐츠에 대한 책임은
                해당 콘텐츠를 작성한 회원에게 있습니다.<br /><br />
                2. 회원이 등록한 콘텐츠는 서비스 운영 및 개선을 위해 활용될 수 있습니다.<br /><br />
                3. 운영자는 본 약관에 위배되거나 부적절한 콘텐츠를 사전 통지 없이
                삭제할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (서비스의 제공 및 변경)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 서비스는 연중무휴, 24시간 제공을 원칙으로 하나, 시스템 점검 등의
                사유로 일시 중단될 수 있습니다.<br /><br />
                2. 운영자는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우
                사전에 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (면책조항)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 본 서비스에서 제공하는 가맹점 정보는 회원들의 자발적 등록 및 검증에
                기반하며, 운영자는 정보의 정확성을 보장하지 않습니다.<br /><br />
                2. 회원이 등록한 정보로 인해 발생하는 분쟁이나 손해에 대해 운영자는
                책임지지 않습니다.<br /><br />
                3. 실제 가맹점 방문 및 결제 시 발생하는 문제에 대해 운영자는
                책임지지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제8조 (서비스 이용 제한)</h2>
              <p className="text-gray-700 leading-relaxed">
                운영자는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우,
                사전 통지 없이 서비스 이용을 제한하거나 회원 자격을 박탈할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제9조 (약관의 변경)</h2>
              <p className="text-gray-700 leading-relaxed">
                1. 운영자는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은
                서비스 내 공지를 통해 효력이 발생합니다.<br /><br />
                2. 회원이 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고
                탈퇴할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제10조 (준거법 및 관할)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관의 해석 및 분쟁에 관하여는 대한민국 법률을 적용하며,
                분쟁 발생 시 운영자의 소재지를 관할하는 법원을 전속관할로 합니다.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                본 약관은 2026년 1월 29일부터 시행됩니다.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
