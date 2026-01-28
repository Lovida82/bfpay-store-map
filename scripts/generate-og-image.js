// OG 이미지 생성 스크립트
// 사용법: node scripts/generate-og-image.js

const fs = require('fs');
const path = require('path');

// 1200x630 PNG를 위한 간단한 솔루션
// 실제 프로덕션에서는 @vercel/og 또는 canvas 라이브러리 사용 권장

console.log('OG 이미지 생성 방법:');
console.log('');
console.log('방법 1: 온라인 도구 사용');
console.log('  1. https://www.svgtopng.com/ 접속');
console.log('  2. public/og-image.svg 파일 업로드');
console.log('  3. 1200x630 크기로 PNG 다운로드');
console.log('  4. public/og-image.png로 저장');
console.log('');
console.log('방법 2: Figma/Canva 사용');
console.log('  1. 1200x630 캔버스 생성');
console.log('  2. 브랜드 디자인으로 이미지 제작');
console.log('  3. PNG로 내보내기');
console.log('');
console.log('방법 3: Vercel OG 라이브러리 (권장)');
console.log('  npm install @vercel/og');
console.log('  API route로 동적 OG 이미지 생성');
