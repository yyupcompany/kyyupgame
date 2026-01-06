// AI助手测试脚本
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjMwNjQwNTIsImV4cCI6MTc2MzE1MDQ1Mn0._FYYiHcMBEq0thGgKb0TeWfKj2rX9gV2VJW7dZfpWbg";

// 测试AI助手API
async function testAIAPI() {
    console.log('🔍 开始测试AI助手API...');

    try {
        // 1. 测试AI查询接口
        console.log('\n📝 测试AI查询接口...');
        const response = await fetch('http://localhost:3000/api/ai-query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                query: '请帮我查询所有学生信息',
                context: {
                    useTools: true,
                    maxTokens: 2000
                }
            })
        });

        console.log('响应状态:', response.status);
        const result = await response.json();
        console.log('响应结果:', JSON.stringify(result, null, 2));

        // 2. 测试AI聊天接口
        console.log('\n💬 测试AI聊天接口...');
        const chatResponse = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                message: '你好，我是管理员',
                sessionId: 'test-session-' + Date.now()
            })
        });

        console.log('聊天响应状态:', chatResponse.status);
        const chatResult = await chatResponse.json();
        console.log('聊天响应结果:', JSON.stringify(chatResult, null, 2));

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
testAIAPI();