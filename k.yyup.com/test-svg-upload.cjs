const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjMwNDM5MDgsImV4cCI6MTc2MzEzMDMwOH0.i2eXFNnqCGHvg8Zqfijkyh5t6Ep3BCRD4oVi3aXnlxA';

async function testSvgUpload() {
  try {
    console.log('🔍 测试SVG文件上传功能...\n');

    // 创建临时SVG文件
    const svgContent = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="#E3F2FD"/>
      <text x="100" y="50" text-anchor="middle" font-family="Arial" font-size="14" fill="#1976D2">幼儿园教室</text>
      <rect x="20" y="70" width="40" height="30" fill="#FFF59D"/>
      <rect x="80" y="70" width="40" height="30" fill="#FFF59D"/>
      <rect x="140" y="70" width="40" height="30" fill="#FFF59D"/>
      <circle cx="50" cy="120" r="8" fill="#FF5722"/>
      <circle cx="100" cy="120" r="8" fill="#4CAF50"/>
      <circle cx="150" cy="120" r="8" fill="#2196F3"/>
    </svg>`;

    const tempFilePath = '/tmp/test-upload.svg';
    fs.writeFileSync(tempFilePath, svgContent);

    console.log('📁 创建临时SVG文件:', tempFilePath);
    console.log('📄 文件大小:', fs.statSync(tempFilePath).size, 'bytes');

    // 使用form-data库
    const FormData = require('form-data');
    const form = new FormData();

    form.append('file', fs.createReadStream(tempFilePath), {
      filename: 'test-classroom.svg',
      contentType: 'image/svg+xml'
    });
    form.append('isPublic', 'false');
    form.append('module', 'ai-test');

    const response = await axios.post(`${API_BASE_URL}/files/upload`, form, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        ...form.getHeaders()
      },
      timeout: 60000
    });

    console.log('✅ SVG文件上传成功');
    console.log('📊 响应状态:', response.status);
    console.log('📄 响应数据:', JSON.stringify(response.data, null, 2));

    // 清理临时文件
    fs.unlinkSync(tempFilePath);
    console.log('🗑️ 临时文件已清理');

  } catch (error) {
    console.error('❌ SVG上传测试失败:', error.message);
    if (error.response) {
      console.error('📊 HTTP状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
    if (error.code === 'ENOENT') {
      console.error('📦 请安装form-data库: npm install form-data');
    }
  }
}

// 运行测试
testSvgUpload().catch(console.error);