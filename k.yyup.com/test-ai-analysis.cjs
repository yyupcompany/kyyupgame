const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjMwNDM5MDgsImV4cCI6MTc2MzEzMDMwOH0.i2eXFNnqCGHvg8Zqfijkyh5t6Ep3BCRD4oVi3aXnlxA';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

async function testDocumentAnalysis() {
  try {
    console.log('🔍 开始测试文档分析功能...\n');

    // 测试1: 创建对话
    console.log('📝 步骤1: 创建AI对话...');
    console.log('📤 发送请求数据:', JSON.stringify({
      title: '文档分析测试',
      description: '测试AI文档分析功能'
    }, null, 2));

    const conversationResponse = await api.post('/ai/conversations', {
      title: '文档分析测试',
      description: '测试AI文档分析功能'
    });

    console.log('📥 对话创建响应:', JSON.stringify(conversationResponse.data, null, 2));

    if (!conversationResponse.data || !conversationResponse.data.id) {
      throw new Error('对话创建失败：响应数据格式不正确');
    }

    const conversationId = conversationResponse.data.id;
    console.log('✅ 对话创建成功，ID:', conversationId);

    // 测试2: 发送文档分析请求
    console.log('\n📄 步骤2: 发送文档分析请求...');
    const analysisRequest = {
      conversationId: conversationId,
      message: '请帮我分析这个文档：这是一个关于幼儿园招生的重要文档，包含了招生政策、收费标准、报名流程等信息。文档主要内容有：1. 招生年龄：3-6岁健康儿童；2. 收费标准：保教费2000元/月，餐费300元/月；3. 报名时间：2024年3月1日至3月31日；4. 报名材料：户口本、出生证明、体检报告。',
      messageType: 'document_analysis',
      tools: ['document_analyzer', 'text_processor']
    };

    const analysisResponse = await api.post('/ai/unified/stream-chat', analysisRequest);
    console.log('✅ 文档分析请求发送成功');
    console.log('📊 响应状态:', analysisResponse.status);
    console.log('📄 响应数据类型:', typeof analysisResponse.data);
    console.log('📝 响应内容:', JSON.stringify(analysisResponse.data, null, 2));

  } catch (error) {
    console.error('❌ 文档分析测试失败:', error.message);
    if (error.response) {
      console.error('📊 HTTP状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

async function testImageAnalysis() {
  try {
    console.log('\n🖼️ 开始测试图片分析功能...\n');

    // 测试1: 创建对话
    console.log('📝 步骤1: 创建AI对话...');
    console.log('📤 发送请求数据:', JSON.stringify({
      title: '图片分析测试',
      description: '测试AI图片分析功能'
    }, null, 2));

    const conversationResponse = await api.post('/ai/conversations', {
      title: '图片分析测试',
      description: '测试AI图片分析功能'
    });

    console.log('📥 对话创建响应:', JSON.stringify(conversationResponse.data, null, 2));

    if (!conversationResponse.data || !conversationResponse.data.id) {
      throw new Error('对话创建失败：响应数据格式不正确');
    }

    const conversationId = conversationResponse.data.id;
    console.log('✅ 对话创建成功，ID:', conversationId);

    // 测试2: 发送图片分析请求
    console.log('\n🖼️ 步骤2: 发送图片分析请求...');
    const analysisRequest = {
      conversationId: conversationId,
      message: '请帮我分析这张图片：这是一张幼儿园教室的照片，可以看到明亮的教室环境，彩色的墙壁装饰，儿童桌椅整齐排列，黑板上写着"欢迎小朋友"，墙上贴有孩子们的画作。',
      messageType: 'image_analysis',
      context: {
        imageUrl: 'test://classroom_photo.jpg',
        imageType: 'classroom_environment'
      },
      tools: ['image_analyzer', 'vision_processor']
    };

    const analysisResponse = await api.post('/ai/unified/stream-chat', analysisRequest);
    console.log('✅ 图片分析请求发送成功');
    console.log('📊 响应状态:', analysisResponse.status);
    console.log('📄 响应数据类型:', typeof analysisResponse.data);
    console.log('📝 响应内容:', JSON.stringify(analysisResponse.data, null, 2));

  } catch (error) {
    console.error('❌ 图片分析测试失败:', error.message);
    if (error.response) {
      console.error('📊 HTTP状态:', error.response.status);
      console.error('📄 响应数据:', error.response.data);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 AI文档和图片分析功能测试开始\n');

  await testDocumentAnalysis();
  await testImageAnalysis();

  console.log('\n✨ 测试完成');
}

// 运行测试
main().catch(console.error);