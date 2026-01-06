const fs = require('fs');
const path = require('path');

// 创建一个简单的SVG文件作为测试图片
const svgContent = `
<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="lightblue"/>
  <text x="150" y="80" font-size="20" text-anchor="middle" fill="black">测试图片</text>
  <text x="150" y="110" font-size="16" text-anchor="middle" fill="black">AI Upload Test</text>
  <text x="150" y="140" font-size="14" text-anchor="middle" fill="black">2025-11-14</text>
  <circle cx="50" cy="50" r="20" fill="red" opacity="0.7"/>
  <rect x="230" y="150" width="50" height="30" fill="green" opacity="0.7"/>
</svg>
`;

const svgPath = path.join(__dirname, 'test-image.svg');
fs.writeFileSync(svgPath, svgContent.trim());

console.log('测试SVG图片已创建:', svgPath);

// 也创建一个PNG格式的图片描述
const pngDescription = `
这是一个测试图片的描述文件。

图片内容包括：
1. 淡蓝色背景
2. 中央显示"测试图片"和"AI Upload Test"文字
3. 显示日期"2025-11-14"
4. 左上角有红色半透明圆形
5. 右下角有绿色半透明矩形

这个图片用于测试AI助手的图片上传和分析功能。
图片尺寸：300x200像素
创建时间：2025-11-14
测试目的：验证图片上传和AI视觉分析功能
`;

const descPath = path.join(__dirname, 'test-image-description.txt');
fs.writeFileSync(descPath, pngDescription.trim());

console.log('图片描述文件已创建:', descPath);