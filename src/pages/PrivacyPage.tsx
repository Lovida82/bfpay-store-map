import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
          <p className="text-sm text-gray-500 mb-8">최종 수정일: 2026년 1월 29일</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                비플페이 검증 가맹점 지도 서비스(이하 "서비스")는 이용자의 개인정보를
                중요시하며, 「개인정보 보호법」을 준수하고 있습니다. 본 개인정보처리방침을
                통해 이용자의 개인정보가 어떻게 수집, 이용, 보호되는지 안내드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. 수집하는 개인정보 항목</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                서비스는 회원가입 및 서비스 이용을 위해 아래와 같은 개인정보를 수집합니다:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">필수 수집 항목</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>닉네임</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <h4 className="font-medium text-gray-900 mb-2">자동 수집 항목</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm">
                  <li>서비스 이용 기록 (등록한 가맹점, 검증 내역, 후기)</li>
                  <li>접속 시간 및 IP 주소</li>
                  <li>위치 정보 (현재 위치 검색 기능 이용 시, 선택적)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-gray-700 leading-relaxed">수집된 개인정보는 다음 목적으로 이용됩니다:</p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li><strong>회원 관리:</strong> 회원 식별, 가입 의사 확인, 본인 확인</li>
                <li><strong>서비스 제공:</strong> 가맹점 등록, 검증, 후기 작성 등 서비스 기능 제공</li>
                <li><strong>서비스 개선:</strong> 이용 통계 분석, 서비스 품질 향상</li>
                <li><strong>고객 지원:</strong> 문의 응대, 불만 처리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-gray-700 leading-relaxed">
                회원의 개인정보는 서비스 이용 기간 동안 보유하며, 회원 탈퇴 시 지체 없이
                파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안
                보관합니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>전자상거래법에 따른 계약 또는 청약철회 기록: 5년</li>
                <li>전자상거래법에 따른 소비자 불만 또는 분쟁처리 기록: 3년</li>
                <li>통신비밀보호법에 따른 로그인 기록: 3개월</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라
                    수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. 개인정보 처리 위탁</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를
                위탁하고 있습니다:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">수탁업체</th>
                      <th className="text-left py-2 font-medium text-gray-900">위탁 업무</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-gray-100">
                      <td className="py-2">Supabase</td>
                      <td className="py-2">데이터베이스 호스팅 및 인증 서비스</td>
                    </tr>
                    <tr>
                      <td className="py-2">Vercel</td>
                      <td className="py-2">웹 서비스 호스팅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. 개인정보의 파기</h2>
              <p className="text-gray-700 leading-relaxed">
                개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 개인정보는
                지체 없이 파기합니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li><strong>전자적 파일:</strong> 복구 불가능한 방법으로 영구 삭제</li>
                <li><strong>종이 문서:</strong> 분쇄 또는 소각</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. 이용자의 권리와 행사 방법</h2>
              <p className="text-gray-700 leading-relaxed">
                이용자는 언제든지 다음의 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>개인정보 열람 요청</li>
                <li>개인정보 정정 요청</li>
                <li>개인정보 삭제 요청</li>
                <li>개인정보 처리 정지 요청</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                위 권리 행사는 마이페이지에서 직접 처리하거나, 운영자에게 서면, 이메일 등으로
                요청하실 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. 개인정보 보호를 위한 기술적 대책</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 개인정보 보호를 위해 다음과 같은 기술적 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                <li>비밀번호 암호화 저장</li>
                <li>SSL/TLS를 통한 데이터 전송 암호화</li>
                <li>접근 권한 관리 및 접근 통제</li>
                <li>개인정보 취급 직원의 최소화</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. 쿠키(Cookie)의 사용</h2>
              <p className="text-gray-700 leading-relaxed">
                서비스는 이용자의 로그인 상태 유지를 위해 쿠키를 사용합니다. 이용자는
                웹 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인이
                필요한 일부 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  개인정보 보호 관련 문의사항이 있으시면 아래로 연락해 주시기 바랍니다.
                </p>
                <ul className="mt-3 text-gray-700 space-y-1">
                  <li><strong>담당:</strong> 서비스 운영팀</li>
                  <li><strong>이메일:</strong> privacy@bppay-map.com</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">11. 개인정보처리방침 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                본 개인정보처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될 수 있으며,
                변경 시 서비스 내 공지를 통해 안내드립니다.
              </p>
            </section>

            <section className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                본 개인정보처리방침은 2026년 1월 29일부터 시행됩니다.
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
