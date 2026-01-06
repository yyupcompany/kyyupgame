const axios = require('axios');

async function testStreamFix() {
  console.log('测试流式响应修复...\n');
  
  try {
    // 先登录获取token
    console.log('🔐 登录获取token...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');
    
    // 创建会话
    const convResponse = await axios.post('http://localhost:3000/api/ai/conversations', {
      title: '测试流式响应'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const conversationId = convResponse.data.id || convResponse.data;
    console.log('✅ 会话创建成功:', conversationId);
    
    // 发送测试消息
    console.log('\n📤 发送测试消息...');
    const response = await axios.post(
      `http://localhost:3000/api/ai/conversations/${conversationId}/messages`,
      {
        content: '请简单介绍一下你自己',
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );
    
    let fullContent = '';
    let hasReasoning = false;
    let chunkCount = 0;
    
    response.data.on('data', (chunk) => {
      chunkCount++;
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            console.log('\n✅ 流式响应完成');
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content') {
              if (parsed.reasoning_content) {
                hasReasoning = true;
                console.log('\n🤔 发现思考内容:', parsed.reasoning_content.substring(0, 100) + '...');
              }
              if (parsed.content) {
                fullContent += parsed.content;
                process.stdout.write('.');
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    });
    
    response.data.on('end', () => {
      console.log('\n\n📊 测试结果:');
      console.log('- 数据块数量:', chunkCount);
      console.log('- 是否收到reasoning_content:', hasReasoning ? '✅ 是' : '❌ 否');
      console.log('- 最终内容长度:', fullContent.length);
      console.log('- 内容预览:', fullContent.substring(0, 200) + '...');
      
      if (fullContent.length > 0) {
        console.log('\n✅ 修复成功！内容正常返回');
      } else {
        console.log('\n❌ 问题仍在：内容为空');
      }
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testStreamFix();