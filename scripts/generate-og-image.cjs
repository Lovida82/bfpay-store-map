const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Dark Blue
ctx.fillStyle = '#1E3A5F';
ctx.fillRect(0, 0, width, height);

// Decorative circles
ctx.fillStyle = 'rgba(42, 74, 111, 0.5)';
ctx.beginPath();
ctx.arc(1100, 100, 300, 0, Math.PI * 2);
ctx.fill();

ctx.beginPath();
ctx.arc(100, 530, 250, 0, Math.PI * 2);
ctx.fill();

// Logo Box
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.roundRect(100, 180, 120, 120, 24);
ctx.fill();

// BP Text in logo
ctx.fillStyle = '#1E3A5F';
ctx.font = 'bold 56px Arial';
ctx.textAlign = 'center';
ctx.fillText('BP', 160, 260);

// Main Title - Line 1
ctx.fillStyle = 'white';
ctx.font = 'bold 72px Arial';
ctx.textAlign = 'left';
ctx.fillText('비플페이', 260, 230);

// Main Title - Line 2
ctx.fillText('검증 가맹점 지도', 260, 320);

// Subtitle
ctx.font = '32px Arial';
ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
ctx.fillText('제로페이 결제 가능한 가맹점을 검색하고 검증하세요', 260, 400);

// Divider Line
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
ctx.fillRect(260, 440, 680, 3);

// Features
ctx.font = '28px Arial';
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

// Green dot + text
ctx.fillStyle = '#4ADE80';
ctx.beginPath();
ctx.arc(280, 505, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fillText('가맹점 등록', 300, 515);

// Yellow dot + text
ctx.fillStyle = '#FBBF24';
ctx.beginPath();
ctx.arc(500, 505, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fillText('결제 검증', 520, 515);

// Blue dot + text
ctx.fillStyle = '#60A5FA';
ctx.beginPath();
ctx.arc(700, 505, 8, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fillText('위치 검색', 720, 515);

// URL
ctx.font = '24px Arial';
ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctx.textAlign = 'right';
ctx.fillText('bppay-store-map.vercel.app', 1100, 590);

// Save to file
const buffer = canvas.toBuffer('image/png');
const outputPath = path.join(__dirname, '../public/og-image.png');
fs.writeFileSync(outputPath, buffer);

console.log('OG image generated successfully!');
console.log('Output:', outputPath);
console.log('Size:', buffer.length, 'bytes');
