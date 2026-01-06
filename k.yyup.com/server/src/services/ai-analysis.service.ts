import AIModelConfig from '../models/ai-model-config.model';
import axios from 'axios';
import { unifiedAIBridge } from './unified-ai-bridge.service';
import { AiBridgeMessage, AiBridgeMessageRole } from './ai/bridge/ai-bridge.types';

/**
 * AI分析服务
 * 基于豆包1.6模型进行智能分析
 */
export class AIAnalysisService {
  
  /**
   * 使用豆包模型进行分析
   */
  async analyzeWithDoubao(prompt: string, options: {
    type: string;
    context: string;
    requireStructured?: boolean;
  }, userId?: number): Promise<any> {
    try {
      // 1. 获取豆包1.6模型配置
      // AIBridge 会自动从数据库读取配置，无需在这里查询
      const modelName = 'doubao-seed-1-6-thinking-250615';

      // 2. 构建请求消息
      const messages = [
        {
          role: 'system',
          content: `你是一个专业的幼儿园数据分析专家，具有丰富的教育行业经验和数据分析能力。
你需要基于提供的真实数据进行深度分析，并提供专业、实用的洞察和建议。

分析类型：${options.type}
业务上下文：${options.context}

${options.requireStructured ? `
请严格按照以下JSON格式返回分析结果：
{
  "summary": "分析摘要",
  "insights": [
    {
      "title": "洞察标题",
      "description": "详细描述",
      "importance": "high|medium|low",
      "category": "trend|risk|opportunity|recommendation"
    }
  ],
  "trends": {
    "direction": "上升|下降|稳定",
    "confidence": "高|中|低",
    "factors": ["影响因素1", "影响因素2"]
  },
  "recommendations": [
    {
      "action": "建议行动",
      "priority": "high|medium|low",
      "timeline": "短期|中期|长期",
      "expectedImpact": "预期影响"
    }
  ],
  "risks": [
    {
      "risk": "风险描述",
      "probability": "高|中|低",
      "impact": "高|中|低",
      "mitigation": "缓解措施"
    }
  ],
  "metrics": {
    "key_indicators": {},
    "benchmarks": {},
    "targets": {}
  }
}
` : '请提供详细的分析报告，包含数据洞察、趋势分析、风险评估和改进建议。'}`
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      // 3. 调用豆包API
      const requestBody = {
        model: modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true  // 不使用Function Call时使用流式输出
      };

      console.log('🤖 调用豆包1.6模型进行AI分析...');
      console.log('📤 请求参数:', JSON.stringify(requestBody, null, 2));

      // 🚀 使用UnifiedAIBridge替代直接axios调用
      const aiBridgeMessages: AiBridgeMessage[] = requestBody.messages.map((msg: any) => ({
        role: msg.role as AiBridgeMessageRole,
        content: msg.content
      }));

      const response = await unifiedAIBridge.chat({
        model: modelName,
        messages: aiBridgeMessages,
        temperature: requestBody.temperature,
        max_tokens: requestBody.max_tokens
      }); // 🚀 UnifiedAIBridge 会自动从数据库读取配置

      console.log('📥 豆包模型响应成功');

      if (response && response.data) {
        const content = response.data.content || response.data.message || '';
        console.log('✅ 豆包分析完成，内容长度:', content.length);
        
        // 4. 解析结构化响应
        if (options.requireStructured) {
          try {
            const parsedContent = this.parseStructuredResponse(content);
            return parsedContent;
          } catch (parseError) {
            console.warn('⚠️ 结构化解析失败，返回原始内容:', parseError);
            return {
              summary: '分析完成',
              content: content,
              raw: true
            };
          }
        }

        return {
          summary: '分析完成',
          content: content,
          usage: response.data?.usage
        };
      } else {
        throw new Error('豆包模型响应格式异常');
      }

    } catch (error) {
      console.error('❌ 豆包AI分析失败:', error);
      console.warn('🔄 AI服务不可用，生成fallback响应...');
      
      // 直接在服务层生成fallback响应，避免向上抛出错误
      return this.generateServiceFallbackResponse(options);
    }
  }

  /**
   * 生成服务级fallback响应
   * @param options 分析选项
   * @returns fallback分析结果
   */
  private generateServiceFallbackResponse(options: any): any {
    const analysisType = options.type || 'general';
    
    console.log('✅ 生成fallback响应，类型:', analysisType);
    
    switch (analysisType) {
      case 'enrollment_trends':
        return {
          summary: '基于现有数据进行基础招生趋势分析。由于AI分析服务暂时不可用，提供基础分析结果。',
          insights: [
            {
              title: '招生数据概览',
              description: '当前数据显示一定的招生活动，建议持续跟踪和分析',
              importance: 'high',
              category: 'trend'
            },
            {
              title: '数据收集建议',
              description: '建议完善数据收集机制，以便进行更准确的趋势分析',
              importance: 'medium',
              category: 'recommendation'
            }
          ],
          trends: {
            direction: '稳定',
            confidence: '中',
            factors: ['数据量有限', '需要更多历史数据']
          },
          recommendations: [
            {
              action: '建立完善的招生数据跟踪体系',
              priority: 'high',
              timeline: '短期',
              expectedImpact: '提高数据分析准确性'
            }
          ],
          risks: [
            {
              risk: '数据不足导致分析偏差',
              probability: '中',
              impact: '中',
              mitigation: '扩充数据来源，定期数据质量检查'
            }
          ],
          metrics: {
            key_indicators: { '数据覆盖度': '基础' },
            benchmarks: { '行业标准': '待对比' },
            targets: { '数据完整度目标': '90%+' }
          },
          fallback: true
        };
        
      case 'activity_effectiveness':
        return {
          summary: '基于现有活动数据进行效果评估。由于AI分析服务暂时不可用，提供基础分析结果。',
          insights: [
            {
              title: '活动开展情况',
              description: '活动管理体系正在运行，建议建立效果评估机制',
              importance: 'high',
              category: 'recommendation'
            }
          ],
          trends: {
            direction: '稳定',
            confidence: '中',
            factors: ['活动数据待完善', '评估体系待建立']
          },
          recommendations: [
            {
              action: '建立活动效果评估体系',
              priority: 'high',
              timeline: '短期',
              expectedImpact: '提升活动质量和参与度'
            }
          ],
          risks: [
            {
              risk: '活动效果难以量化',
              probability: '中',
              impact: '中',
              mitigation: '建立标准化的活动评估指标'
            }
          ],
          metrics: {
            key_indicators: { '活动评估': '待建立' },
            benchmarks: { '参与度标准': '待制定' },
            targets: { '活动满意度': '85%+' }
          },
          fallback: true
        };
        
      case 'performance_prediction':
        return {
          summary: '基于基础数据进行绩效分析。由于AI分析服务暂时不可用，提供基础分析框架。',
          insights: [
            {
              title: '绩效管理体系',
              description: '建议建立完整的绩效评估和预测体系',
              importance: 'high',
              category: 'recommendation'
            }
          ],
          trends: {
            direction: '稳定',
            confidence: '低',
            factors: ['缺少历史绩效数据', '评估标准待完善']
          },
          recommendations: [
            {
              action: '建立绩效评估标准和流程',
              priority: 'high',
              timeline: '中期',
              expectedImpact: '改善整体绩效管理'
            }
          ],
          risks: [
            {
              risk: '绩效评估标准不统一',
              probability: '高',
              impact: '中',
              mitigation: '制定标准化绩效评估体系'
            }
          ],
          metrics: {
            key_indicators: { '绩效覆盖率': '待统计' },
            benchmarks: { '行业标准': '待建立' },
            targets: { '评估完成度': '100%' }
          },
          fallback: true
        };
        
      case 'risk_assessment':
        return {
          summary: '基于风险管理最佳实践进行评估。由于AI分析服务暂时不可用，提供基础风险分析框架。',
          insights: [
            {
              title: '风险管理重要性',
              description: '建议建立全面的风险识别和管理体系',
              importance: 'high',
              category: 'recommendation'
            }
          ],
          trends: {
            direction: '稳定',
            confidence: '中',
            factors: ['基础风险控制措施', '定期评估机制']
          },
          recommendations: [
            {
              action: '完善风险识别和预警机制',
              priority: 'high',
              timeline: '短期',
              expectedImpact: '降低运营风险'
            }
          ],
          risks: [
            {
              risk: '运营风险',
              probability: '中',
              impact: '中',
              mitigation: '建立风险监控和应急预案'
            },
            {
              risk: '数据安全风险',
              probability: '低',
              impact: '高',
              mitigation: '加强数据安全防护措施'
            }
          ],
          metrics: {
            key_indicators: { '风险控制率': '85%' },
            benchmarks: { '行业风险标准': '<5%' },
            targets: { '风险控制目标': '>90%' }
          },
          fallback: true
        };
        
      default:
        return {
          summary: '由于AI分析服务暂时不可用，提供基础分析结果。',
          insights: [
            {
              title: '服务状态',
              description: 'AI分析服务正在恢复中，请稍后重试或查看基础分析结果',
              importance: 'medium',
              category: 'info'
            }
          ],
          trends: {
            direction: '稳定',
            confidence: '低',
            factors: ['服务不可用', '数据有限']
          },
          recommendations: [
            {
              action: '稍后重试AI分析功能',
              priority: 'low',
              timeline: '短期',
              expectedImpact: '获得更详细的分析结果'
            }
          ],
          risks: [],
          metrics: {
            key_indicators: {},
            benchmarks: {},
            targets: {}
          },
          fallback: true
        };
    }
  }

  /**
   * 解析结构化响应
   */
  private parseStructuredResponse(content: string): any {
    try {
      // 尝试提取JSON内容
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // 如果没有找到JSON，尝试解析markdown格式的结构化内容
      return this.parseMarkdownStructure(content);
    } catch (error) {
      console.warn('JSON解析失败，尝试文本解析:', error);
      return this.parseTextStructure(content);
    }
  }

  /**
   * 解析Markdown格式的结构化内容
   */
  private parseMarkdownStructure(content: string): any {
    const result: any = {
      summary: '',
      insights: [],
      trends: {},
      recommendations: [],
      risks: [],
      metrics: {}
    };

    const lines = content.split('\n');
    let currentSection = '';
    let currentItem: any = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
        currentSection = trimmedLine.replace(/^#+\s*/, '').toLowerCase();
        continue;
      }

      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const itemText = trimmedLine.replace(/^[-*]\s*/, '');
        
        switch (currentSection) {
          case '洞察':
          case 'insights':
            result.insights.push({
              title: itemText,
              description: itemText,
              importance: 'medium',
              category: 'insight'
            });
            break;
          case '建议':
          case 'recommendations':
            result.recommendations.push({
              action: itemText,
              priority: 'medium',
              timeline: '中期',
              expectedImpact: '待评估'
            });
            break;
          case '风险':
          case 'risks':
            result.risks.push({
              risk: itemText,
              probability: '中',
              impact: '中',
              mitigation: '待制定'
            });
            break;
        }
      } else if (trimmedLine && !trimmedLine.startsWith('#')) {
        if (!result.summary && currentSection === '') {
          result.summary = trimmedLine;
        }
      }
    }

    return result;
  }

  /**
   * 解析纯文本结构
   */
  private parseTextStructure(content: string): any {
    return {
      summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      content: content,
      insights: [
        {
          title: '分析完成',
          description: '已完成数据分析，请查看详细内容',
          importance: 'medium',
          category: 'insight'
        }
      ],
      trends: {
        direction: '待分析',
        confidence: '中',
        factors: ['数据分析中']
      },
      recommendations: [
        {
          action: '查看详细分析报告',
          priority: 'high',
          timeline: '即时',
          expectedImpact: '获得数据洞察'
        }
      ],
      risks: [],
      metrics: {}
    };
  }

  /**
   * 获取分析历史
   */
  async getAnalysisHistory(userId: number, type?: string): Promise<any[]> {
    // 这里可以从数据库获取历史分析记录
    // 暂时返回模拟数据
    return [
      {
        id: 1,
        title: '招生趋势分析',
        type: 'enrollment',
        summary: '基于过去6个月数据的招生趋势分析',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 2,
        title: '活动效果评估',
        type: 'activity',
        summary: '幼儿园活动参与度和效果分析',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];
  }

  /**
   * 导出分析报告
   */
  async exportAnalysisReport(analysisId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<string> {
    // 这里实现报告导出逻辑
    // 返回下载链接
    return `/api/ai/analysis/export/${analysisId}.${format}`;
  }

  /**
   * 验证豆包模型可用性
   */
  async validateDoubaoModel(): Promise<boolean> {
    try {
      const model = await AIModelConfig.findOne({
        where: {
          name: 'doubao-seed-1.6-250615',
          status: 'active'
        }
      });

      if (!model) {
        return false;
      }

      // 🚀 使用UnifiedAIBridge发送测试请求
      const testResponse = await unifiedAIBridge.chat({
        model: model.name,
        messages: [
          {
            role: 'user' as AiBridgeMessageRole,
            content: '测试连接'
          }
        ],
        temperature: 0.7,
        maxTokens: (model as any).modelParameters?.maxTokens ?? (model as any).maxTokens ?? 10
      }); // 🚀 使用UnifiedAIBridge统一配置

      return !!testResponse; // UnifiedAIBridge成功返回响应即表示连接正常
    } catch (error) {
      console.error('豆包模型验证失败:', error);
      return false;
    }
  }
}
