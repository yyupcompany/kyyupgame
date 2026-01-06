const axios = require('axios');
const FormData = require('form-data');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjMwNDM5MDgsImV4cCI6MTc2MzEzMDMwOH0.i2eXFNnqCGHvg8Zqfijkyh5t6Ep3BCRD4oVi3aXnlxA';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
});

async function testImageUploadOnly() {
  try {
    console.log('🔍 专门测试图片上传功能...\n');

    // 创建测试SVG图片
    const testImage = {
      name: 'test-classroom.svg',
      content: `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#E3F2FD"/>
        <text x="100" y="50" text-anchor="middle" font-family="Arial" font-size="14" fill="#1976D2">幼儿园教室</text>
        <rect x="20" y="70" width="40" height="30" fill="#FFF59D"/>
        <rect x="80" y="70" width="40" height="30" fill="#FFF59D"/>
        <rect x="140" y="70" width="40" height="30" fill="#FFF59D"/>
        <circle cx="50" cy="120" r="8" fill="#FF5722"/>
        <circle cx="100" cy="120" r="8" fill="#4CAF50"/>
        <circle cx="150" cy="120" r="8" fill="#2196F3"/>
      </svg>`
    };

    console.log('🖼️ 步骤1: 上传SVG图片文件...');

    const formData = new FormData();
    const blob = new Blob([testImage.content], { type: 'image/svg+xml' });
    formData.append('file', blob, testImage.name);
    formData.append('isPublic', 'false');
    formData.append('module', 'ai-test');

    console.log('📤 发送请求到: /api/files/upload');
    console.log('📄 文件信息:', {
      name: testImage.name,
      type: 'image/svg+xml',
      size: blob.size
    });

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ 图片上传成功');
    console.log('📊 响应状态:', response.status);
    console.log('📄 文件信息:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ 图片上传测试失败:', error.message);
    if (error.response) {
      console.error('📊 HTTP状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
    if (error.request) {
      console.error('🌐 请求信息:', error.request.path || error.request.url);
    }
  }
}

// 运行测试
testImageUploadOnly().catch(console.error);