// 为AI相关页面创建页面说明文档
const axios = require('axios');

// 后端服务器地址
const baseURL = 'http://localhost:3000/api';

console.log('🚀 开始为AI页面创建页面说明文档...');

// AI页面说明文档数据
const aiPageGuides = [
  {
    pagePath: '/ai',
    pageName: 'AI对话界面',
    pageDescription: '欢迎使用YY-AI智能对话系统！这是您与AI助手进行交互的主要界面。在这里您可以：与AI助手进行自然语言对话、获得智能问答和建议、使用快速提问功能、查看对话历史记录。AI助手能够理解您的问题并提供专业的回答，帮助您更好地使用系统各项功能。',
    category: 'AI功能页面',
    importance: 9,
    relatedTables: ['ai_conversations', 'ai_messages', 'ai_chat_sessions'],
    contextPrompt: '这是AI对话界面页面，用户可以与AI助手进行自然语言交互。请重点介绍对话功能、快速提问、历史记录查看等核心功能。',
    isActive: true
  },
  {
    pagePath: '/ai/query',
    pageName: 'AI智能查询',
    pageDescription: '这是AI智能查询页面，为您提供强大的智能搜索和查询功能。在这里您可以：进行自然语言查询、智能搜索系统数据、获得精准的查询结果、使用高级查询功能。AI查询系统能够理解您的查询意图，自动优化查询条件，为您提供最相关的结果。',
    category: 'AI功能页面',
    importance: 8,
    relatedTables: ['ai_queries', 'ai_query_logs', 'ai_search_results'],
    contextPrompt: '这是AI智能查询页面，提供自然语言查询和智能搜索功能。请重点介绍查询功能、搜索能力、结果展示等特性。',
    isActive: true
  },
  {
    pagePath: '/ai/models',
    pageName: 'AI模型管理',
    pageDescription: '这是AI模型管理页面，用于管理和监控系统中的各种AI模型。在这里您可以：查看AI模型统计信息、管理不同类型的AI模型、监控模型运行状态、查看模型性能指标。页面展示了预测模型、机器学习模型、深度学习模型、自然语言处理模型等各类AI模型的详细信息。',
    category: 'AI管理页面',
    importance: 7,
    relatedTables: ['ai_models', 'ai_model_stats', 'ai_model_categories'],
    contextPrompt: '这是AI模型管理页面，用于管理和监控AI模型。请重点介绍模型统计、分类管理、状态监控、性能指标等功能。',
    isActive: true
  },
  {
    pagePath: '/ai/analytics',
    pageName: 'AI数据分析',
    pageDescription: '这是AI数据分析页面，为您提供全面的AI使用统计和数据分析功能。在这里您可以：查看AI系统使用统计、分析AI任务执行情况、监控AI服务性能、查看分析任务历史。页面提供实时分析、预测分析、高级分析等多种分析工具，帮助您深入了解AI系统的使用情况和效果。',
    category: 'AI分析页面',
    importance: 8,
    relatedTables: ['ai_stats', 'ai_analysis_tasks', 'ai_performance_metrics'],
    contextPrompt: '这是AI数据分析页面，提供AI使用统计和数据分析功能。请重点介绍统计数据、分析任务、性能监控、历史记录等功能。',
    isActive: true
  }
];

async function createAIPageGuides() {
  console.log('🚀 开始为AI页面创建页面说明文档...');

  for (const guide of aiPageGuides) {
    try {
      console.log(`📝 创建 ${guide.pageName} 的页面说明文档...`);
      console.log('数据:', JSON.stringify(guide, null, 2));

      const response = await axios.post(`${baseURL}/page-guides`, guide, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('响应状态:', response.status);
      console.log('响应数据:', response.data);

      if (response.data.success) {
        console.log(`✅ ${guide.pageName} 页面说明文档创建成功`);
      } else {
        console.log(`❌ ${guide.pageName} 页面说明文档创建失败:`, response.data.message);
      }
    } catch (error) {
      console.error(`❌ ${guide.pageName} 页面说明文档创建出错:`);
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      } else {
        console.error('错误信息:', error.message);
      }
    }

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 AI页面说明文档创建完成！');
}

// 执行创建
createAIPageGuides().catch(console.error);
