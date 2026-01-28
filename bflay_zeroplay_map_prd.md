# 비플페이 제로페이 가맹점 지도 서비스 PRD

## 1. 프로젝트 개요

### 1.1 프로젝트명
**비플페이 실사용 가능 가맹점 지도 (BFlay Zero-Pay Verified Store Map)**

### 1.2 배경 및 목적
- **문제점**: 비플페이는 제로페이 가맹점에서 사용 가능하나, 실제로는 최근 결제 이력이 없는 가게에서 결제가 거부되는 경우가 빈번함
- **목적**: 직원들이 실제 사용 가능한 가게를 등록/공유하여 점심식대를 효율적으로 활용할 수 있는 사내 서비스 구축
- **핵심 가치**: 크라우드소싱 기반의 실시간 가맹점 검증 시스템

### 1.3 타겟 사용자
- 1차: 아주홀딩스 임직원
- 2차: 비플페이 사용자 전체 (향후 확장 가능)

---

## 2. 핵심 기능 요구사항

### 2.1 가맹점 등록 (Multi-Channel)

#### A. 수동 등록
```python
# 등록 데이터 모델
{
    "store_name": "string",          # 가게명
    "address": "string",             # 주소
    "lat": float,                    # 위도
    "lng": float,                    # 경도
    "category": "string",            # 업종
    "verified_by": "user_id",        # 등록자
    "verified_date": "datetime",     # 검증 날짜
    "payment_success": boolean,      # 결제 성공 여부
    "memo": "string"                 # 특이사항
}
```

#### B. 이미지 기반 자동 등록 (OCR)
```python
# OCR 처리 플로우
1. 사용자가 영수증/가게 사진 업로드
2. GPT-4 Vision API로 텍스트 추출
   - 가게명, 주소, 전화번호 파싱
3. 카카오맵 API로 좌표 자동 검색
4. 사용자 확인 후 등록
```

#### C. 일괄 등록 (관리자)
- Excel/CSV 파일 업로드
- 카카오맵 API로 좌표 일괄 변환
- 중복 체크 및 병합

### 2.2 지도 기능

#### 지도 표시
```javascript
// 마커 분류 시스템
const markerTypes = {
    verified: {
        color: 'green',
        icon: '✓',
        tooltip: '최근 7일 내 결제 성공'
    },
    caution: {
        color: 'yellow',
        icon: '!',
        tooltip: '7-30일 사이 결제 성공'
    },
    unverified: {
        color: 'gray',
        icon: '?',
        tooltip: '30일 이상 미확인'
    }
}
```

#### 검색 기능
- 가게명 검색
- 주소 검색
- 현재 위치 기반 반경 검색
- 업종별 필터링

### 2.3 사용자 피드백 시스템

#### 검증 업데이트
```python
# 사용자 피드백 데이터
{
    "store_id": "string",
    "user_id": "string",
    "feedback_type": "success|fail|closed",
    "payment_date": "datetime",
    "comment": "string",
    "photo": "url"  # 선택사항
}
```

#### 신뢰도 점수
```python
def calculate_trust_score(store):
    """
    최근 30일 내 피드백 기반 신뢰도 계산
    - 성공: +10점
    - 실패: -5점
    - 폐업: -100점
    """
    recent_feedbacks = get_feedbacks(store.id, days=30)
    score = sum([
        10 if f.type == 'success' else
        -5 if f.type == 'fail' else
        -100 for f in recent_feedbacks
    ])
    return max(0, min(100, 50 + score))
```

---

## 3. 기술 스택 비교 및 선정

### 3.1 지도 API 비교

| 항목 | 카카오맵 API | 구글맵 API |
|------|-------------|-----------|
| **무료 할당량** | 월 300,000회 | $200 크레딧 (약 28,000회) |
| **국내 장소 데이터** | ⭐⭐⭐⭐⭐ 우수 | ⭐⭐⭐ 보통 |
| **주소 → 좌표 변환** | 도로명/지번 모두 정확 | 도로명 우선 |
| **검색 정확도** | 한글 검색 최적화 | 영문 위주 |
| **문서화** | 한글, 충분함 | 영문, 매우 상세 |
| **안정성** | 높음 | 매우 높음 |
| **가격 (유료 전환 시)** | 저렴 | 비쌈 |

**결론: 카카오맵 API 선택**
- 국내 서비스, 한글 검색 최적화 필요
- 무료 할당량 충분 (월 예상 사용량: 1만회 미만)
- 도로명/지번 주소 변환 정확도 높음

### 3.2 기술 스택 권장안

```yaml
Frontend:
  Framework: React 18 + TypeScript
  지도: Kakao Maps API v3
  상태관리: Zustand (경량)
  스타일링: Tailwind CSS
  이미지 업로드: react-dropzone
  
Backend:
  Runtime: Python 3.11 + FastAPI
  Database: PostgreSQL 15 + PostGIS (지리 정보)
  Cache: Redis
  OCR: OpenAI GPT-4 Vision API
  인증: JWT
  
DevOps:
  Hosting: AWS (EC2 + RDS) or Vercel + Supabase
  Storage: AWS S3 (이미지)
  CI/CD: GitHub Actions
```

---

## 4. 시스템 아키텍처

### 4.1 데이터베이스 스키마

```sql
-- 가맹점 테이블
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS
    category VARCHAR(100),
    phone VARCHAR(20),
    trust_score INTEGER DEFAULT 50,
    last_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 검증 피드백 테이블
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id),
    user_id VARCHAR(100) NOT NULL,  -- 사번 또는 이메일
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('success', 'fail', 'closed')),
    payment_date TIMESTAMP NOT NULL,
    comment TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 공간 인덱스
CREATE INDEX idx_stores_location ON stores USING GIST(location);
CREATE INDEX idx_verifications_store ON verifications(store_id);
CREATE INDEX idx_verifications_date ON verifications(payment_date DESC);
```

### 4.2 API 설계

```python
# FastAPI 엔드포인트 설계

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# 1. 가맹점 등록
@app.post("/api/stores")
async def create_store(store: StoreCreate):
    """
    수동 가맹점 등록
    - 주소 → 카카오맵 API로 좌표 변환
    - 중복 체크 (100m 반경 내 동명 가게)
    """
    pass

# 2. OCR 기반 등록
@app.post("/api/stores/ocr")
async def create_store_from_image(file: UploadFile = File(...)):
    """
    이미지 업로드 → GPT-4V 분석 → 가게 정보 추출
    1. 이미지 → OpenAI API
    2. 파싱된 데이터 반환 (가게명, 주소, 전화번호)
    3. 카카오맵 API로 좌표 검색
    4. 사용자 확인용 데이터 반환
    """
    pass

# 3. 일괄 등록
@app.post("/api/stores/batch")
async def batch_create_stores(file: UploadFile = File(...)):
    """
    Excel/CSV 파일 업로드
    - pandas로 파싱
    - 카카오맵 API 일괄 호출 (Rate Limit 고려)
    - 결과 리포트 반환
    """
    pass

# 4. 지도 데이터 조회
@app.get("/api/stores")
async def get_stores(
    lat: float,
    lng: float,
    radius: int = 1000,  # 미터
    category: Optional[str] = None,
    min_trust_score: int = 0
):
    """
    PostGIS ST_DWithin으로 반경 검색
    SELECT * FROM stores
    WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        radius
    )
    AND trust_score >= min_trust_score
    """
    pass

# 5. 검증 피드백 등록
@app.post("/api/verifications")
async def create_verification(verification: VerificationCreate):
    """
    사용자 피드백 등록 → trust_score 재계산
    """
    pass

# 6. 가게 상세 정보
@app.get("/api/stores/{store_id}")
async def get_store_detail(store_id: str):
    """
    가게 정보 + 최근 피드백 목록
    """
    pass
```

---

## 5. 핵심 기능 구현 가이드

### 5.1 카카오맵 API 연동

```javascript
// React 컴포넌트 예시
import { useEffect, useState } from 'react';

const KakaoMapComponent = () => {
    const [map, setMap] = useState(null);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        // 카카오맵 초기화
        const container = document.getElementById('map');
        const options = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567),
            level: 3
        };
        const kakaoMap = new kakao.maps.Map(container, options);
        setMap(kakaoMap);

        // 현재 위치 가져오기
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                kakaoMap.setCenter(new kakao.maps.LatLng(lat, lng));
                loadStores(lat, lng);
            });
        }
    }, []);

    const loadStores = async (lat, lng) => {
        const response = await fetch(
            `/api/stores?lat=${lat}&lng=${lng}&radius=1000`
        );
        const data = await response.json();
        setStores(data);
        displayMarkers(data);
    };

    const displayMarkers = (stores) => {
        stores.forEach(store => {
            const markerColor = getMarkerColor(store.trust_score);
            const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(store.lat, store.lng),
                map: map,
                image: createMarkerImage(markerColor)
            });

            // 클릭 이벤트
            kakao.maps.event.addListener(marker, 'click', () => {
                showStoreDetail(store.id);
            });
        });
    };

    const getMarkerColor = (trustScore) => {
        if (trustScore >= 70) return 'green';
        if (trustScore >= 40) return 'yellow';
        return 'gray';
    };

    return <div id="map" style={{ width: '100%', height: '600px' }} />;
};
```

### 5.2 주소 → 좌표 변환

```python
# Python Backend 예시
import requests
from typing import Tuple, Optional

KAKAO_API_KEY = "YOUR_KAKAO_REST_API_KEY"

def address_to_coords(address: str) -> Optional[Tuple[float, float]]:
    """
    카카오맵 API로 주소 → 좌표 변환
    """
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": address}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        result = response.json()
        if result['documents']:
            doc = result['documents'][0]
            return float(doc['y']), float(doc['x'])  # lat, lng
    
    return None

# 사용 예시
coords = address_to_coords("서울 강남구 테헤란로 152")
if coords:
    print(f"위도: {coords[0]}, 경도: {coords[1]}")
```

### 5.3 OCR 가게 정보 추출

```python
# GPT-4 Vision API 활용
import base64
from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

def extract_store_info_from_image(image_path: str) -> dict:
    """
    영수증/간판 사진에서 가게 정보 추출
    """
    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode('utf-8')
    
    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """이 이미지에서 다음 정보를 추출해주세요:
                        1. 가게명
                        2. 주소 (도로명 또는 지번)
                        3. 전화번호
                        
                        JSON 형식으로 반환:
                        {
                            "store_name": "...",
                            "address": "...",
                            "phone": "..."
                        }
                        
                        정보가 없으면 null로 표시하세요.
                        """
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=500
    )
    
    import json
    result = response.choices[0].message.content
    # JSON 파싱 (GPT 응답에서 추출)
    return json.loads(result)

# 사용 예시
info = extract_store_info_from_image("receipt.jpg")
print(info)
# {'store_name': '신선한 고깃집', 'address': '서울 강남구 ...', 'phone': '02-1234-5678'}
```

---

## 6. UI/UX 플로우

### 6.1 메인 화면
```
┌─────────────────────────────────────┐
│  [검색창] [내 위치] [필터] [등록+]    │
├─────────────────────────────────────┤
│                                     │
│         [지도 영역]                  │
│     🟢 최근 검증 (7일)               │
│     🟡 검증됨 (30일)                 │
│     ⚫ 미검증 (30일+)                │
│                                     │
│                                     │
└─────────────────────────────────────┘
│  [하단 슬라이드 패널]                 │
│  최근 등록 가게 리스트                │
└─────────────────────────────────────┘
```

### 6.2 가게 등록 플로우

```mermaid
graph TD
    A[등록 버튼 클릭] --> B{등록 방식 선택}
    B -->|수동| C[가게명/주소 입력]
    B -->|사진| D[이미지 업로드]
    B -->|일괄| E[Excel 업로드]
    
    C --> F[카카오맵 검색]
    D --> G[GPT-4V 분석]
    E --> H[파일 파싱]
    
    F --> I[지도에서 위치 확인]
    G --> I
    H --> I
    
    I --> J[결제 성공 여부 선택]
    J --> K[메모 작성]
    K --> L[등록 완료]
```

### 6.3 모바일 최적화
- 반응형 디자인 (Tailwind breakpoints)
- 터치 제스처: 지도 핀치 줌, 스와이프
- PWA 지원: 홈 화면 추가, 오프라인 캐싱

---

## 7. 개발 단계 및 우선순위

### Phase 1: MVP (2-3주)
```python
# 필수 기능
- [x] 카카오맵 기본 지도 표시
- [x] 수동 가게 등록 (이름, 주소)
- [x] 주소 → 좌표 자동 변환
- [x] 지도 마커 표시 (기본)
- [x] 간단한 검색 (가게명)
- [x] 사용자 인증 (JWT)
```

### Phase 2: 핵심 기능 (3-4주)
```python
- [x] OCR 이미지 등록
- [x] 검증 피드백 시스템
- [x] 신뢰도 점수 계산
- [x] 반경 검색
- [x] 업종별 필터
- [x] 가게 상세 페이지
```

### Phase 3: 고도화 (2-3주)
```python
- [x] 일괄 등록 (Excel)
- [x] 관리자 대시보드
- [x] 통계 분석 (인기 가게, 지역별 분포)
- [x] 모바일 PWA
- [x] 알림 기능 (신규 등록, 내 근처 가게)
```

---

## 8. 성능 및 보안 고려사항

### 8.1 성능 최적화
```python
# 1. 지도 마커 클러스터링 (많은 마커 처리)
# 라이브러리: @googlemaps/markerclusterer (카카오맵 호환)

# 2. Redis 캐싱
def get_stores_cached(lat, lng, radius):
    cache_key = f"stores:{lat}:{lng}:{radius}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    stores = db.query_stores(lat, lng, radius)
    redis.setex(cache_key, 300, json.dumps(stores))  # 5분 캐싱
    return stores

# 3. 페이지네이션
@app.get("/api/stores")
async def get_stores(skip: int = 0, limit: int = 50):
    # 최대 50개씩 로드
    pass
```

### 8.2 보안
```python
# 1. 사용자 인증 (JWT)
from fastapi import Depends, HTTPException
from jose import jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        return user_id
    except:
        raise HTTPException(status_code=401)

# 2. Rate Limiting (일괄 등록 남용 방지)
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/stores/batch")
@limiter.limit("5/hour")  # 시간당 5회
async def batch_create_stores():
    pass

# 3. 이미지 업로드 검증
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
```

---

## 9. 예상 비용 산정

### 9.1 API 사용료 (월간)
```
카카오맵 API:
- 지도 로드: 무료 (300,000회)
- 주소 검색: 무료 (300,000회)
- 예상 사용: 10,000회/월 → 무료 범위

OpenAI API (GPT-4V):
- OCR 처리: $0.01/image
- 예상: 100건/월 = $1

AWS 인프라:
- EC2 t3.small: $15/월
- RDS PostgreSQL (db.t3.micro): $15/월
- S3 스토리지: $1/월
─────────────────────
총 예상 비용: 약 $32/월 (약 42,000원)
```

### 9.2 대안: 무료 호스팅
```
Vercel (Frontend) + Supabase (Backend):
- Vercel: 무료 (취미 프로젝트)
- Supabase: 무료 (500MB DB, PostGIS 지원)
- Cloudflare R2: 무료 (10GB 스토리지)
─────────────────────
총 비용: OpenAI API만 약 $1/월
```

---

## 10. 확장 가능성

### 향후 추가 기능
1. **실시간 알림**: 내 근처 새 가게 등록 시 푸시
2. **커뮤니티**: 가게 리뷰, 추천 메뉴
3. **포인트 시스템**: 등록/검증 기여도에 따른 리워드
4. **타사 연동**: 네이버페이, 카카오페이 가맹점 정보 통합
5. **AI 추천**: 사용자 취향 기반 가게 추천
6. **오픈 API**: 다른 부서/계열사에서도 활용 가능

---

## 11. 성공 지표 (KPI)

```python
# 추적할 메트릭
metrics = {
    "등록 가게 수": 200,          # 3개월 내 목표
    "월간 활성 사용자": 50,        # 전체 직원의 30%
    "검증 피드백 수": 500,         # 가게당 평균 2.5건
    "결제 성공률": 0.85,          # 피드백 기준 85% 이상
    "평균 검색 시간": 30           # 초 단위
}
```

---

## 12. 리스크 및 대응 방안

| 리스크 | 영향도 | 대응 방안 |
|-------|-------|---------|
| 카카오맵 API 장애 | 높음 | 구글맵 API 백업, 에러 핸들링 |
| 저조한 참여율 | 중간 | 관리자 선등록, 인센티브 제공 |
| 스팸 등록 | 중간 | 사번 인증, 신고 기능 |
| 개인정보 이슈 | 높음 | 익명화, 최소 정보만 수집 |
| 제로페이 정책 변경 | 낮음 | 공식 API 연동 검토 |

---

## 13. 즉시 시작 가능한 코드 템플릿

### 13.1 프로젝트 초기 세팅

```bash
# Frontend
npx create-react-app bflay-map --template typescript
cd bflay-map
npm install react-kakao-maps-sdk zustand axios react-dropzone

# Backend
mkdir bflay-backend && cd bflay-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary redis openai python-jose
```

### 13.2 환경변수 설정

```env
# .env
KAKAO_API_KEY=your_kakao_javascript_key
KAKAO_REST_API_KEY=your_kakao_rest_api_key
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://user:pass@localhost/bflay
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your-secret-key-here
```

---

## 부록: 참고 자료

### API 문서
- 카카오맵 API: https://apis.map.kakao.com/web/
- 카카오 로컬 API: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- OpenAI Vision API: https://platform.openai.com/docs/guides/vision

### 기술 스택 공식 문서
- React: https://react.dev
- FastAPI: https://fastapi.tiangolo.com
- PostGIS: https://postgis.net/documentation/

### 유사 서비스 참고
- 제로페이 공식 앱 (가맹점 조회)
- 망고플레이트 (가게 등록 UX)
- 카카오맵 (장소 검색)

---

**문서 버전**: v1.0  
**작성일**: 2026-01-28  
**작성자**: AI Specialist, Digital Innovation Team  
**검토 필요 사항**: 법무팀(개인정보), IT팀(인프라), 재무팀(API 비용)
