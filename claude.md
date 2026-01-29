# 비플페이 검증 가맹점 지도 - 개발 문서

## 프로젝트 개요
- **프로젝트명**: 비플페이 검증 가맹점 지도
- **목적**: 비플페이/제로페이 사용 가능한 가맹점을 직원들이 등록하고 검증하는 크라우드소싱 지도 서비스
- **배포 URL**: https://bppay-store-map.vercel.app/
- **GitHub**: https://github.com/Lovida82/bfpay-store-map

---

## 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Zustand** - 상태 관리
- **React Router DOM** - 라우팅
- **React Hot Toast** - 알림 메시지
- **clsx** - 조건부 클래스명

### Backend / Database
- **Supabase** - PostgreSQL 데이터베이스 + 인증
- **PostGIS** - 위치 기반 검색 (반경 검색)

### 외부 API
- **Kakao Maps API** - 지도 표시, 마커, 주소 검색
- **OpenAI GPT-4o** - OCR 이미지 분석 (가맹점 정보 추출)

### 배포
- **Vercel** - 프론트엔드 호스팅 (GitHub 연동 자동 배포)

---

## 주요 기능

### 1. 가맹점 등록
- **수동 등록**: 가맹점명, 주소 입력 → 카카오맵 API로 좌표 변환
- **OCR 등록**: 이미지 업로드 → GPT-4o로 가맹점 정보 추출 (여러 개 동시 인식)
- **Excel 일괄 등록**: Excel 파일 업로드로 여러 가맹점 한번에 등록
  - 샘플 템플릿 다운로드 기능 제공
  - 필수 컬럼: 가게명, 주소 / 선택 컬럼: 전화번호, 업종
  - 주소 유효성 검증 후 순차 등록
- **중복 체크**: 같은 이름의 가맹점이 있으면 경고 표시

### 2. 지도 기능
- **카카오맵 연동**: 마커 표시, 클러스터링
- **현재 위치**: GPS 기반 현재 위치로 이동
- **마커 색상**: 검증 상태에 따라 색상 구분
  - 🟢 녹색: 신뢰도 70% 이상 + 검증 3건 이상
  - 🟡 노란색: 신뢰도 40% 이상
  - 🔴 빨간색: 신뢰도 40% 미만
  - ⚫ 회색: 미검증
- **InfoWindow**: 마커 클릭 시 가맹점 정보 팝업 → 클릭하여 상세페이지 이동
- **지도 범위 필터링**: "조회" 버튼 클릭 시 현재 지도에 보이는 가맹점만 리스트 표시
  - 처음 접속 시에는 전체 목록 표시
  - "전체 목록 보기" 링크로 다시 전체 목록으로 복귀 가능

### 3. 검색 및 필터
- **텍스트 검색**: 가맹점명, 주소로 검색 (검색 시 지도 범위 필터 자동 해제)
- **카테고리 필터**: 음식점 🍽️, 카페 ☕ (식사 관련 카테고리만 유지)
- **반경 검색**: PostGIS 활용
- **지도 범위 조회**: 현재 화면에 보이는 가맹점만 필터링

### 4. 검증 시스템
- **결제 검증**: 결제 성공/실패 기록
- **후기 작성**: 별점 + 코멘트
- **신뢰도 계산**: (성공 건수 / 전체 건수) × 100

### 5. 사용자 기능
- **회원가입/로그인**: Supabase Auth (이메일)
- **마이페이지**:
  - 프로필 수정 (닉네임 변경)
  - 내가 등록한 가맹점 관리 (삭제 가능)
  - 내 검증 내역 조회
- **통계**: 등록 수, 검증 수, 신뢰 레벨

### 6. 반응형 레이아웃
- **데스크탑**: 좌측 사이드 패널 + 지도
- **모바일**: 하단 시트 (터치로 펼침/접힘)

### 7. 랜딩 페이지
- **서비스 소개**: 왜 이 서비스를 만들었는지 설명
- **문제점 제시**: 제로페이맵의 부정확한 정보 문제
- **해결책 안내**: 크라우드소싱 기반 검증 시스템
- **등록 방법 안내**: 3가지 쉬운 등록 방법 (수동, OCR, Excel)
- **비회원 안내**: 회원가입 없이도 지도 열람 가능, 회원가입 시 등록/검증 참여 가능
- **로그인 사용자 자동 리다이렉트**: 로그인된 회원은 바로 지도 페이지로 이동

### 8. 법적 페이지
- **이용약관** (`/terms`): 서비스 이용 규정, 회원 의무, 면책조항
- **개인정보처리방침** (`/privacy`): 수집 정보, 이용 목적, 보유 기간, 이용자 권리

---

## 프로젝트 구조

```
zeropay-map/
├── public/
│   ├── logo.svg              # 로고
│   ├── og-image.png          # OG 이미지 (링크 미리보기)
│   └── og-image.svg          # OG 이미지 원본
├── scripts/
│   ├── generate-og-image.cjs # OG 이미지 생성 스크립트
│   ├── convert-og-image.cjs  # SVG→PNG 변환
│   └── convert-to-docx.cjs   # 매뉴얼 Word 변환
├── 사용자_매뉴얼.md            # 사용자 매뉴얼 (마크다운)
├── 사용자_매뉴얼.docx          # 사용자 매뉴얼 (Word)
├── src/
│   ├── components/
│   │   ├── auth/             # 로그인, 회원가입 폼
│   │   ├── common/           # Button, Input, Modal 등
│   │   ├── layout/           # Header, Footer, Layout
│   │   ├── map/              # KakaoMap, MapControls
│   │   ├── registration/     # 수동/OCR/Excel 등록
│   │   ├── store/            # StoreCard, StoreDetail, StoreComments
│   │   └── verification/     # 검증 패널, 피드백 폼
│   ├── pages/
│   │   ├── LandingPage.tsx   # 랜딩 페이지 (서비스 소개)
│   │   ├── HomePage.tsx      # 지도 + 목록 (/map)
│   │   ├── RegisterPage.tsx  # 가맹점 등록
│   │   ├── StoreDetailPage.tsx # 가맹점 상세
│   │   ├── MyPage.tsx        # 마이페이지
│   │   ├── LoginPage.tsx     # 로그인
│   │   ├── SignupPage.tsx    # 회원가입
│   │   ├── TermsPage.tsx     # 이용약관
│   │   └── PrivacyPage.tsx   # 개인정보처리방침
│   ├── services/
│   │   ├── api/              # Supabase API 함수
│   │   │   ├── auth.ts       # 인증
│   │   │   ├── stores.ts     # 가맹점 CRUD
│   │   │   ├── verification.ts # 검증
│   │   │   └── comments.ts   # 후기
│   │   ├── supabase.ts       # Supabase 클라이언트
│   │   └── kakaoMap.ts       # 카카오맵 유틸
│   ├── stores/               # Zustand 스토어
│   │   ├── authStore.ts      # 인증 상태
│   │   ├── mapStore.ts       # 지도 상태
│   │   └── storeStore.ts     # 가맹점 상태
│   ├── types/                # TypeScript 타입 정의
│   └── utils/                # 유틸리티 함수
├── supabase/
│   └── migrations/           # DB 스키마 SQL
├── index.html                # HTML 템플릿 + OG 메타태그
├── vercel.json               # Vercel 설정
└── package.json
```

---

## 환경변수

```env
# Kakao Map API Key (JavaScript Key)
VITE_KAKAO_MAP_API_KEY=your_kakao_javascript_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API Key (OCR 기능용)
VITE_OPENAI_API_KEY=sk-your_openai_api_key
```

**Vercel 환경변수 설정**: Settings → Environment Variables에서 위 변수들 추가 필요

---

## 데이터베이스 스키마 (Supabase)

### users 테이블
```sql
- id: UUID (PK, auth.users 참조)
- email: TEXT
- nickname: TEXT
- avatar_url: TEXT
- trust_level: INTEGER (기본값 1)
- total_registrations: INTEGER
- total_verifications: INTEGER
- created_at, updated_at: TIMESTAMP
```

### stores 테이블
```sql
- id: UUID (PK)
- name: TEXT
- address: TEXT
- coordinates: GEOGRAPHY(POINT)
- category: TEXT
- phone: TEXT
- user_id: UUID (등록자)
- trust_score: INTEGER (0-100)
- verification_count: INTEGER
- positive_count: INTEGER
- negative_count: INTEGER
- last_verified_at: TIMESTAMP
- zeropay_supported, bipay_supported: BOOLEAN
- created_at, updated_at: TIMESTAMP
```

### verifications 테이블
```sql
- id: UUID (PK)
- store_id: UUID (FK)
- user_id: UUID (FK)
- is_verified: BOOLEAN (결제 성공/실패)
- comment: TEXT
- evidence_image_url: TEXT
- created_at: TIMESTAMP
```

### comments 테이블
```sql
- id: UUID (PK)
- store_id: UUID (FK)
- user_id: UUID (FK)
- content: TEXT
- rating: INTEGER (1-5)
- payment_success: BOOLEAN
- visit_date: DATE
- created_at, updated_at: TIMESTAMP
```

---

## 주요 해결된 이슈

### 1. 카카오맵 401 에러
- **원인**: 카카오 개발자 콘솔에서 도메인 미등록
- **해결**: 플랫폼 → Web → 도메인 등록 (localhost:5173, vercel.app 도메인)

### 2. Supabase 회원가입 실패
- **원인**: RLS 정책으로 users 테이블 INSERT 차단
- **해결**: 트리거로 auth.users 생성 시 자동으로 users 테이블에 추가

### 3. 지도 무한 루프
- **원인**: center_changed 이벤트에서 setCenter 호출
- **해결**: center_changed 리스너 제거

### 4. 신뢰도 점수 미반영
- **원인**: 검증/후기 추가 후 stores 테이블 업데이트 안됨
- **해결**: `updateStoreStats()` 함수 추가하여 검증/후기 후 자동 계산

### 5. Vercel 환경변수 오류
- **원인**: 환경변수에 공백/줄바꿈 포함
- **해결**: 환경변수 삭제 후 재입력

### 6. OG 이미지 한글 깨짐
- **원인**: sharp 라이브러리 SVG 변환 시 폰트 미지원
- **해결**: node-canvas 사용하여 PNG 직접 생성

---

## 카카오맵 도메인 등록

https://developers.kakao.com/ → 내 애플리케이션 → 플랫폼 → Web

등록할 도메인:
- `http://localhost:5173` (개발용)
- `https://bppay-store-map.vercel.app` (프로덕션)

---

## 배포 프로세스

1. 코드 수정
2. `npm run build` - 빌드 확인
3. `git add . && git commit -m "메시지" && git push`
4. Vercel 자동 배포 (1-2분 소요)

---

## 캐시 초기화

### 카카오톡
https://developers.kakao.com/tool/clear/og → URL 입력 → 초기화

### 팀즈
URL에 쿼리 파라미터 추가: `?v=버전숫자`
또는 `%appdata%\Microsoft\Teams` 폴더의 Cache 관련 폴더 삭제

---

## 추후 개선 사항

- [x] ~~Excel 일괄 등록 기능 완성~~ (2026-01-28 완료)
- [x] ~~지도 범위 필터링 기능~~ (2026-01-28 완료)
- [x] ~~랜딩 페이지~~ (2026-01-29 완료)
- [x] ~~이용약관/개인정보처리방침~~ (2026-01-29 완료)
- [ ] 반경 검색 UI 추가
- [ ] 사용자 신뢰 레벨 자동 상승 로직
- [ ] 관리자 페이지 (신고 관리, 사용자 관리)
- [ ] PWA 지원 (오프라인, 푸시 알림)
- [ ] 가맹점 수정 기능

---

## 개발 히스토리

### 2026-01-28 (1차 개발)

**주요 작업 내역**
1. 프로젝트 초기 설정 (Vite + React + TypeScript)
2. Supabase 연동 및 DB 스키마 구성
3. 카카오맵 연동 및 마커 표시
4. 회원가입/로그인 구현
5. 가맹점 등록 (수동/OCR)
6. 검증 및 후기 시스템
7. 마이페이지 (프로필 수정, 내 가맹점, 내 검증)
8. 모바일 반응형 레이아웃 (하단 시트)
9. Vercel 배포 및 GitHub 연동
10. OG 이미지 생성 (링크 미리보기)
11. InfoWindow 클릭으로 상세페이지 이동

**추가 기능**
- Excel 일괄 등록 기능 (샘플 템플릿 다운로드 포함)
- 지도 범위 필터링 ("조회" 버튼으로 현재 화면의 가맹점만 표시)
- 검색 시 자동으로 지도 범위 필터 해제 (다른 지역 검색 편의성)
- Header에서 검색 버튼 제거 (좌측 패널 검색창 사용)
- 업종 필터 간소화: 음식점/카페만 유지 (식사 용도에 집중)
- 사용자 매뉴얼 작성 (사용자_매뉴얼.md, 사용자_매뉴얼.docx)

---

### 2026-01-29 (2차 개발)

**주요 작업 내역**
1. 랜딩 페이지 추가
   - 서비스 소개 및 문제점/해결책 설명
   - 3가지 등록 방법 안내 (수동, OCR, Excel)
   - 마커 색상별 신뢰도 안내
   - 주요 기능 소개
2. 이용약관 페이지 (`/terms`)
3. 개인정보처리방침 페이지 (`/privacy`)
4. 라우팅 구조 변경
   - `/` → 랜딩 페이지 (비회원)
   - `/map` → 지도 페이지 (기존 HomePage)
5. 로그인 사용자 자동 리다이렉트
   - 로그인된 회원이 `/` 접속 시 자동으로 `/map`으로 이동
6. Header에 "지도" 링크 추가
7. Footer 링크를 React Router Link로 변경
8. 회원가입 시 약관 동의 체크박스 추가
   - 이용약관 동의 (필수)
   - 개인정보처리방침 동의 (필수)
   - 링크 클릭 시 새 탭에서 약관 페이지 열림
9. 개인정보 보호책임자 정보 업데이트
   - 담당: 디지털혁신팀
   - 이메일: jsw0504@ajupharm.co.kr
10. Footer에서 문의하기 링크 제거
11. 랜딩 페이지 비회원 안내 문구 추가
   - 회원가입 없이도 지도 열람 가능 안내
   - 회원가입 시 가맹점 등록/검증 참여 가능 안내

---

### 추후 예정 작업

- [ ] 기능 테스트 및 버그 수정
- [ ] 사용자 매뉴얼 최종 검토 및 보완
- [ ] 팀장/실장 검토 후 사내 배포
