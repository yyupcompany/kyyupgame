const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjMwNDM5MDgsImV4cCI6MTc2MzEzMDMwOH0.i2eXFNnqCGHvg8Zqfijkyh5t6Ep3BCRD4oVi3aXnlxA';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'multipart/form-data'
  },
  timeout: 60000
});

async function testFileUpload() {
  try {
    console.log('🔍 开始测试文件上传功能...\n');

    // 创建测试文件内容
    const testDocument = {
      name: 'test-document.txt',
      content: '这是一个测试文档，用于验证AI文档分析功能。\n\n文档内容包括：\n1. 幼儿园招生政策说明\n2. 收费标准详情\n3. 报名流程指导\n4. 联系方式信息\n\n请AI助手分析这个文档的关键信息。'
    };

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

    // 测试1: 上传文档文件
    console.log('📄 步骤1: 上传文档文件...');

    const documentFormData = new FormData();
    const documentBlob = new Blob([testDocument.content], { type: 'text/plain' });
    documentFormData.append('file', documentBlob, testDocument.name);
    documentFormData.append('type', 'document');
    documentFormData.append('description', 'AI文档分析测试');

    const documentUploadResponse = await api.post('/files/upload', documentFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ 文档上传成功');
    console.log('📊 响应状态:', documentUploadResponse.status);
    console.log('📄 文件信息:', JSON.stringify(documentUploadResponse.data, null, 2));

    // 测试2: 上传图片文件
    console.log('\n🖼️ 步骤2: 上传图片文件...');

    const imageFormData = new FormData();
    const imageBlob = new Blob([testImage.content], { type: 'image/svg+xml' });
    imageFormData.append('file', imageBlob, testImage.name);
    imageFormData.append('type', 'image');
    imageFormData.append('description', 'AI图片分析测试');

    const imageUploadResponse = await api.post('/files/upload', imageFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ 图片上传成功');
    console.log('📊 响应状态:', imageUploadResponse.status);
    console.log('🖼️ 文件信息:', JSON.stringify(imageUploadResponse.data, null, 2));

    // 测试3: 使用上传的文件进行AI分析
    if (documentUploadResponse.data && documentUploadResponse.data.id) {
      console.log('\n🤖 步骤3: 使用上传的文档进行AI分析...');

      const conversationResponse = await api.post('/ai/conversations', {
        title: '文档上传分析测试',
        description: '使用上传文档进行AI分析'
      });

      const conversationId = conversationResponse.data.id;

      const analysisRequest = {
        conversationId: conversationId,
        message: '请分析我上传的文档内容，提取其中的关键信息',
        attachments: [
          {
            type: 'document',
            id: documentUploadResponse.data.id,
            name: testDocument.name
          }
        ]
      };

      const analysisResponse = await api.post('/ai/unified/stream-chat', analysisRequest, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ AI文档分析请求发送成功');
      console.log('📊 分析响应状态:', analysisResponse.status);
      console.log('📝 分析结果类型:', typeof analysisResponse.data);
    }

    // 测试4: 使用上传的图片进行AI分析
    if (imageUploadResponse.data && imageUploadResponse.data.id) {
      console.log('\n🤖 步骤4: 使用上传的图片进行AI分析...');

      const conversationResponse = await api.post('/ai/conversations', {
        title: '图片上传分析测试',
        description: '使用上传图片进行AI分析'
      });

      const conversationId = conversationResponse.data.id;

      const analysisRequest = {
        conversationId: conversationId,
        message: '请分析我上传的图片内容，描述图片中的信息',
        attachments: [
          {
            type: 'image',
            id: imageUploadResponse.data.id,
            name: testImage.name
          }
        ]
      };

      const analysisResponse = await api.post('/ai/unified/stream-chat', analysisRequest, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ AI图片分析请求发送成功');
      console.log('📊 分析响应状态:', analysisResponse.status);
      console.log('📝 分析结果类型:', typeof analysisResponse.data);
    }

  } catch (error) {
    console.error('❌ 文件上传测试失败:', error.message);
    if (error.response) {
      console.error('📊 HTTP状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 AI文件上传和分析功能测试开始\n');

  await testFileUpload();

  console.log('\n✨ 测试完成');
}

// 运行测试
main().catch(console.error);
