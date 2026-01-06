const axios = require('axios');
const fs = require('fs');

async function runAIAPITestWithAuth() {
    console.log('🚀 开始带认证的AI API测试');

    const testResults = {
        startTime: new Date().toISOString(),
        loginResult: null,
        aiAPITests: [],
        fileUploadTests: [],
        errors: [],
        summary: {}
    };

    const API_BASE = 'http://localhost:3000/api';

    try {
        // 步骤1: 登录获取认证token
        console.log('🔐 步骤1: 登录获取认证token');

        const loginData = {
            username: 'admin',
            password: '123456'
        };

        try {
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ 登录成功');
            console.log('登录响应状态:', loginResponse.status);
            console.log('登录响应数据:', JSON.stringify(loginResponse.data, null, 2));

            testResults.loginResult = {
                success: true,
                status: loginResponse.status,
                data: loginResponse.data
            };

            // 提取token
            const token = loginResponse.data.data?.token || loginResponse.data.token;
            const authHeaders = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            console.log('✅ 获取到认证token');

            // 步骤2: 测试AI助手API
            console.log('\n🤖 步骤2: 测试AI助手API');

            const aiTestMessages = [
                '你好，请介绍一下你的功能',
                '请分析一下幼儿园管理系统的主要特点',
                '我有一个关于幼儿教育的问题，你能帮助我吗？'
            ];

            for (let i = 0; i < aiTestMessages.length; i++) {
                const message = aiTestMessages[i];
                console.log(`测试消息 ${i + 1}: ${message}`);

                try {
                    const aiResponse = await axios.post(`${API_BASE}/ai`, {
                        message: message,
                        conversationId: `test-conversation-${Date.now()}-${i}`
                    }, {
                        headers: authHeaders,
                        timeout: 30000
                    });

                    console.log(`✅ AI API测试 ${i + 1} 成功`);
                    console.log(`响应状态: ${aiResponse.status}`);
                    console.log(`响应数据:`, JSON.stringify(aiResponse.data, null, 2));

                    testResults.aiAPITests.push({
                        testNumber: i + 1,
                        message: message,
                        success: true,
                        status: aiResponse.status,
                        response: aiResponse.data,
                        timestamp: new Date().toISOString()
                    });

                } catch (error) {
                    console.log(`❌ AI API测试 ${i + 1} 失败:`, error.message);
                    if (error.response) {
                        console.log(`错误状态: ${error.response.status}`);
                        console.log(`错误数据:`, JSON.stringify(error.response.data, null, 2));
                    }

                    testResults.aiAPITests.push({
                        testNumber: i + 1,
                        message: message,
                        success: false,
                        error: error.message,
                        status: error.response?.status,
                        response: error.response?.data,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // 步骤3: 测试文件上传功能
            console.log('\n📤 步骤3: 测试文件上传功能');

            // 确保测试文件目录存在
            if (!fs.existsSync('test-files')) {
                fs.mkdirSync('test-files');
            }

            // 创建测试文件
            const testFiles = [
                {
                    name: 'ai-test-document.txt',
                    content: `AI助手测试文档

这是用于测试AI助手文件上传和分析功能的示例文档。

测试时间: ${new Date().toISOString()}

文档内容:
1. 这是一个中文测试文档
2. 包含了时间戳信息
3. 用于验证AI助手的内容理解能力
4. AI应该能够分析文档的主要内容

期望结果:
- 文件上传成功
- AI能够理解文档内容
- 生成相关的分析结果

文档结束`
                },
                {
                    name: 'ai-test-md.md',
                    content: `# AI助手测试Markdown文档

## 测试目的
验证AI助手对Markdown格式文件的理解和分析能力。

## 测试内容
- **文件上传功能**: 确保Markdown文件能够正确上传
- **内容理解**: AI应该能够理解Markdown的结构和内容
- **智能分析**: 生成基于文档内容的分析结果

## 技术特性测试
- **代码块支持**
- **列表处理**
- **链接识别**: [测试链接](http://example.com)

### 子标题测试
这是一个三级标题，用于测试AI的层次结构理解能力。

> 引用文本：这是一个引用块，用于测试AI对特殊格式的识别。

**测试完成时间**: ${new Date().toISOString()}

---

*注意：这是AI助手的测试文档*`
                }
            ];

            // 创建测试文件
            for (const file of testFiles) {
                fs.writeFileSync(`test-files/${file.name}`, file.content);
            }

            // 上传每个测试文件
            for (let i = 0; i < testFiles.length; i++) {
                const file = testFiles[i];
                console.log(`上传文件 ${i + 1}: ${file.name}`);

                try {
                    // 读取文件并转换为base64
                    const fileContent = fs.readFileSync(`test-files/${file.name}`);
                    const fileBase64 = Buffer.from(fileContent).toString('base64');

                    const uploadResponse = await axios.post(`${API_BASE}/ai/upload`, {
                        file: fileBase64,
                        filename: file.name,
                        conversationId: `test-upload-${Date.now()}-${i}`
                    }, {
                        headers: authHeaders,
                        timeout: 30000
                    });

                    console.log(`✅ 文件上传 ${i + 1} 成功`);
                    console.log(`响应状态: ${uploadResponse.status}`);
                    console.log(`响应数据:`, JSON.stringify(uploadResponse.data, null, 2));

                    testResults.fileUploadTests.push({
                        testNumber: i + 1,
                        filename: file.name,
                        success: true,
                        status: uploadResponse.status,
                        response: uploadResponse.data,
                        timestamp: new Date().toISOString()
                    });

                } catch (error) {
                    console.log(`❌ 文件上传 ${i + 1} 失败:`, error.message);
                    if (error.response) {
                        console.log(`错误状态: ${error.response.status}`);
                        console.log(`错误数据:`, JSON.stringify(error.response.data, null, 2));
                    }

                    testResults.fileUploadTests.push({
                        testNumber: i + 1,
                        filename: file.name,
                        success: false,
                        error: error.message,
                        status: error.response?.status,
                        response: error.response?.data,
                        timestamp: new Date().toISOString()
                    });
                }
            }

            // 步骤4: 测试AI查询API (备选API路径)
            console.log('\n🔍 步骤4: 测试AI查询API');

            try {
                const aiQueryResponse = await axios.post(`${API_BASE}/ai-query`, {
                    query: '请分析我刚才上传的文件内容',
                    conversationId: `test-ai-query-${Date.now()}`
                }, {
                    headers: authHeaders,
                    timeout: 30000
                });

                console.log('✅ AI查询API测试成功');
                console.log('响应状态:', aiQueryResponse.status);
                console.log('响应数据:', JSON.stringify(aiQueryResponse.data, null, 2));

                testResults.aiAPITests.push({
                    testNumber: 99,
                    message: 'AI查询API测试',
                    success: true,
                    status: aiQueryResponse.status,
                    response: aiQueryResponse.data,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.log('❌ AI查询API测试失败:', error.message);
                if (error.response) {
                    console.log('错误状态:', error.response.status);
                    console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
                }

                testResults.aiAPITests.push({
                    testNumber: 99,
                    message: 'AI查询API测试',
                    success: false,
                    error: error.message,
                    status: error.response?.status,
                    response: error.response?.data,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (loginError) {
            console.log('❌ 登录失败:', loginError.message);
            if (loginError.response) {
                console.log('登录错误状态:', loginError.response.status);
                console.log('登录错误数据:', JSON.stringify(loginError.response.data, null, 2));
            }

            testResults.loginResult = {
                success: false,
                error: loginError.message,
                status: loginError.response?.status,
                response: loginError.response?.data
            };

            testResults.errors.push({
                type: 'login_error',
                message: loginError.message,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('❌ 测试过程中发生严重错误:', error);
        testResults.errors.push({
            type: 'system_error',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    // 计算测试统计
    testResults.endTime = new Date().toISOString();

    const totalAPITests = testResults.aiAPITests.length;
    const successfulAPITests = testResults.aiAPITests.filter(test => test.success).length;
    const failedAPITests = totalAPITests - successfulAPITests;

    const totalUploadTests = testResults.fileUploadTests.length;
    const successfulUploadTests = testResults.fileUploadTests.filter(test => test.success).length;
    const failedUploadTests = totalUploadTests - successfulUploadTests;

    testResults.summary = {
        loginSuccess: testResults.loginResult?.success || false,
        totalAPITests,
        successfulAPITests,
        failedAPITests,
        apiSuccessRate: totalAPITests > 0 ? ((successfulAPITests / totalAPITests) * 100).toFixed(2) + '%' : '0%',
        totalUploadTests,
        successfulUploadTests,
        failedUploadTests,
        uploadSuccessRate: totalUploadTests > 0 ? ((successfulUploadTests / totalUploadTests) * 100).toFixed(2) + '%' : '0%',
        totalErrors: testResults.errors.length
    };

    // 保存测试报告
    fs.writeFileSync('ai-api-auth-test-report.json', JSON.stringify(testResults, null, 2));

    // 打印最终报告
    console.log('\n📊 AI API认证测试完整报告');
    console.log('========================');
    console.log(`开始时间: ${testResults.startTime}`);
    console.log(`结束时间: ${testResults.endTime}`);
    console.log(`登录状态: ${testResults.summary.loginSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log('');
    console.log('🤖 AI对话API测试:');
    console.log(`  总测试数: ${totalAPITests}`);
    console.log(`  成功: ${successfulAPITests}`);
    console.log(`  失败: ${failedAPITests}`);
    console.log(`  成功率: ${testResults.summary.apiSuccessRate}`);
    console.log('');
    console.log('📤 文件上传API测试:');
    console.log(`  总测试数: ${totalUploadTests}`);
    console.log(`  成功: ${successfulUploadTests}`);
    console.log(`  失败: ${failedUploadTests}`);
    console.log(`  成功率: ${testResults.summary.uploadSuccessRate}`);
    console.log('');
    console.log(`📄 详细报告已保存到: ai-api-auth-test-report.json`);
    console.log(`📁 测试文件保存在: test-files/ 目录`);

    if (testResults.errors.length > 0) {
        console.log('\n❌ 发现的错误:');
        testResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.type}: ${error.message}`);
        });
    }

    return testResults;
}

// 运行测试
if (require.main === module) {
    runAIAPITestWithAuth()
        .then(result => {
            console.log('\n✅ AI API认证测试完成');
            process.exit(result.summary.totalErrors > 0 || result.summary.failedAPITests > 0 || result.summary.failedUploadTests > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('\n💥 测试执行失败:', error);
            process.exit(1);
        });
}

module.exports = { runAIAPITestWithAuth };