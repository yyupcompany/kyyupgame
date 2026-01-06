// 豆包1.6 Thinking 测试Demo
// 测试thinking显示和流式输出
import fetch from 'node-fetch';

// 豆包1.6 Thinking配置（从数据库获取）
const DOUBAO_CONFIG = {
  name: 'doubao-seed-1-6-thinking-250615',
  apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  modelId: 'doubao-seed-1-6-thinking-250615'
};

// 测试消息
const testMessages = [
  {
    role: 'user',
    content: '请分析一下幼儿园管理系统中AI助手页面感知功能的技术实现原理，包括前端和后端的交互流程。'
  }
];

/**
 * 测试豆包1.6 Thinking - 非流式输出
 */
async function testDoubaoThinkingNormal() {
  console.log('🧠 测试豆包1.6 Thinking - 非流式输出...');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(DOUBAO_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DOUBAO_CONFIG.modelId,
        messages: testMessages,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📊 完整响应:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0]) {
      const choice = data.choices[0];
      
      console.log('\\n🤔 Thinking内容:');
      if (choice.message.thinking) {
        console.log(choice.message.thinking);
      } else {
        console.log('❌ 未找到thinking内容');
      }
      
      console.log('\\n💭 最终回答:');
      console.log(choice.message.content);
      
      console.log('\\n📈 Token使用统计:');
      console.log(`输入Token: ${data.usage?.prompt_tokens || 'N/A'}`);
      console.log(`输出Token: ${data.usage?.completion_tokens || 'N/A'}`);
      console.log(`总Token: ${data.usage?.total_tokens || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应详情:', await error.response.text());
    }
  }
}

/**
 * 测试豆包1.6 Thinking - 流式输出
 */
async function testDoubaoThinkingStream() {
  console.log('\\n\\n🌊 测试豆包1.6 Thinking - 流式输出...');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(DOUBAO_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DOUBAO_CONFIG.modelId,
        messages: testMessages,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.9,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('📡 开始接收流式数据...');
    console.log('-'.repeat(60));
    
    let thinkingContent = '';
    let finalContent = '';
    let currentPhase = 'thinking'; // thinking -> content
    
    // 处理流式响应
    for await (const chunk of response.body) {
      const lines = chunk.toString().split('\\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            console.log('\\n✅ 流式响应完成');
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.choices && parsed.choices[0]) {
              const delta = parsed.choices[0].delta;
              
              // 检测thinking内容
              if (delta.thinking) {
                if (currentPhase === 'thinking') {
                  process.stdout.write(delta.thinking);
                  thinkingContent += delta.thinking;
                }
              }
              
              // 检测正常回答内容
              if (delta.content) {
                if (currentPhase === 'thinking') {
                  console.log('\\n\\n💭 开始正式回答:');
                  console.log('-'.repeat(40));
                  currentPhase = 'content';
                }
                process.stdout.write(delta.content);
                finalContent += delta.content;
              }
              
              // 检测完成状态
              if (parsed.choices[0].finish_reason) {
                console.log('\\n\\n🏁 完成原因:', parsed.choices[0].finish_reason);
              }
            }
            
          } catch (parseError) {
            // 忽略无法解析的数据块
          }
        }
      }
    }
    
    console.log('\\n\\n📋 总结:');
    console.log(`🤔 Thinking长度: ${thinkingContent.length} 字符`);
    console.log(`💭 回答长度: ${finalContent.length} 字符`);
    
  } catch (error) {
    console.error('❌ 流式测试失败:', error.message);
  }
}

/**
 * 创建前端演示HTML页面
 */
function createFrontendDemo() {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>豆包1.6 Thinking 流式输出演示</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .thinking-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .thinking-title {
            color: #856404;
            font-weight: bold;
            margin-bottom: 8px;
            font-family: inherit;
        }
        .content-box {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            line-height: 1.8;
        }
        .content-title {
            color: #0c5460;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .input-area {
            margin: 20px 0;
        }
        textarea {
            width: 100%;
            height: 120px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 8px 8px 8px 0;
        }
        button:hover {
            background: #0056b3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .typing-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #007bff;
            animation: typing 1.4s infinite ease-in-out;
        }
        @keyframes typing {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
        }
        .stats {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin: 16px 0;
            font-size: 13px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 豆包1.6 Thinking 流式输出演示</h1>
        
        <div class="input-area">
            <textarea id="userInput" placeholder="请输入您的问题...">请分析一下幼儿园管理系统中AI助手页面感知功能的技术实现原理。</textarea>
            <br>
            <button onclick="sendMessage(false)">发送 (普通模式)</button>
            <button onclick="sendMessage(true)">发送 (流式模式)</button>
            <button onclick="clearOutput()">清空输出</button>
        </div>
        
        <div id="thinkingSection" style="display: none;">
            <div class="thinking-title">🤔 AI思考过程 (Thinking):</div>
            <div class="thinking-box" id="thinkingContent"></div>
        </div>
        
        <div id="contentSection" style="display: none;">
            <div class="content-title">💭 AI回答:</div>
            <div class="content-box" id="finalContent"></div>
        </div>
        
        <div id="statsSection" style="display: none;">
            <div class="stats" id="statsContent"></div>
        </div>
    </div>

    <script>
        let isStreaming = false;
        
        async function sendMessage(useStream) {
            if (isStreaming) return;
            
            const userInput = document.getElementById('userInput').value.trim();
            if (!userInput) {
                alert('请输入问题');
                return;
            }
            
            isStreaming = true;
            clearOutput();
            
            const thinkingSection = document.getElementById('thinkingSection');
            const contentSection = document.getElementById('contentSection');
            const thinkingContent = document.getElementById('thinkingContent');
            const finalContent = document.getElementById('finalContent');
            
            try {
                // 模拟API调用（实际应该通过后端代理）
                if (useStream) {
                    // 流式模式演示
                    thinkingSection.style.display = 'block';
                    thinkingContent.textContent = '';
                    
                    // 模拟thinking过程
                    const thinkingText = \`用户询问的是关于幼儿园管理系统中AI助手页面感知功能的技术实现原理。这是一个比较复杂的技术问题，我需要从以下几个方面来分析：

1. 整体架构设计
2. 前端实现机制
3. 后端API设计
4. 数据流转过程
5. 关键技术要点

让我逐步分析每个部分...\`;
                    
                    await typeText(thinkingContent, thinkingText, 50);
                    
                    // 显示最终回答
                    contentSection.style.display = 'block';
                    finalContent.textContent = '';
                    
                    const answerText = \`AI助手页面感知功能是一个智能化的用户体验增强方案，主要包含以下技术实现：

**前端实现：**
1. **路由监听**: 使用Vue Router的beforeEach钩子监听页面切换
2. **服务调用**: 通过page-awareness.service.ts调用后端API
3. **缓存机制**: 实现本地缓存避免重复请求
4. **状态管理**: 使用Pinia存储页面知识数据

**后端实现：**
1. **AI知识库API**: /api/ai-knowledge/by-page/:pagePath
2. **路径映射**: pathToCategoryMap将页面路径映射到文档分类
3. **数据库查询**: 从ai_knowledge_base表获取相关文档
4. **响应格式**: 返回标准化的页面指南格式

**交互流程：**
用户访问页面 → 前端监听路由变化 → 调用页面感知API → 后端查询知识库 → 返回页面专属文档 → AI助手获得上下文知识

这种设计让AI助手能够针对不同页面提供精准的帮助和指导。\`;
                    
                    await typeText(finalContent, answerText, 30);
                    
                } else {
                    // 普通模式演示
                    finalContent.textContent = '正在思考...';
                    contentSection.style.display = 'block';
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    finalContent.textContent = \`AI助手页面感知功能的技术实现原理包括前端路由监听、后端API设计、数据库知识库查询等多个环节，通过智能匹配为用户提供页面相关的帮助信息。\`;
                }
                
                // 显示统计信息
                document.getElementById('statsSection').style.display = 'block';
                document.getElementById('statsContent').textContent = 
                    \`模式: \${useStream ? '流式输出' : '普通模式'} | 响应时间: \${useStream ? '实时' : '2秒'} | Token使用: 模拟数据\`;
                
            } catch (error) {
                console.error('Error:', error);
                alert('发送失败: ' + error.message);
            } finally {
                isStreaming = false;
            }
        }
        
        async function typeText(element, text, speed) {
            for (let i = 0; i < text.length; i++) {
                element.textContent += text[i];
                element.scrollTop = element.scrollHeight;
                await new Promise(resolve => setTimeout(resolve, speed));
            }
        }
        
        function clearOutput() {
            document.getElementById('thinkingSection').style.display = 'none';
            document.getElementById('contentSection').style.display = 'none';
            document.getElementById('statsSection').style.display = 'none';
            document.getElementById('thinkingContent').textContent = '';
            document.getElementById('finalContent').textContent = '';
        }
    </script>
</body>
</html>`;

  require('fs').writeFileSync('F:/kyyup730/lazy-ai-substitute-project/doubao-thinking-demo.html', html);
  console.log('\\n📄 前端演示页面已创建: doubao-thinking-demo.html');
}

// 执行测试
async function runTests() {
  console.log('🚀 开始豆包1.6 Thinking功能测试');
  console.log('模型:', DOUBAO_CONFIG.name);
  console.log('端点:', DOUBAO_CONFIG.endpoint);
  console.log('');

  // 测试普通模式
  await testDoubaoThinkingNormal();
  
  // 等待一段时间
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 测试流式模式
  await testDoubaoThinkingStream();
  
  // 创建前端演示
  createFrontendDemo();
  
  console.log('\\n🎉 所有测试完成！');
  console.log('💡 可以打开 doubao-thinking-demo.html 查看前端演示');
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testDoubaoThinkingNormal, testDoubaoThinkingStream, createFrontendDemo };