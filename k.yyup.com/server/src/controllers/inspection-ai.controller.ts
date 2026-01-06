import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import DocumentInstance from '../models/document-instance.model';
import DocumentTemplate from '../models/document-template.model';
import InspectionPlan from '../models/inspection-plan.model';
import InspectionType from '../models/inspection-type.model';
import { ModelType } from '../models/ai-model-config.model';
import { Op } from 'sequelize';
import aiCacheService from '../services/ai/ai-cache.service';
import modelSelectorService from '../services/ai/model-selector.service';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';

/**
 * 督查中心AI功能控制器
 * 提供文档智能分析和检查计划AI建议
 */
export class InspectionAIController {

  /**
   * 文档AI分析
   * POST /api/inspection-ai/document-analysis
   */
  public analyzeDocument = asyncHandler(async (req: Request, res: Response) => {
    const { documentId, documentTitle, templateType, currentContent } = req.body;
    const userId = (req as any).user?.id;

    try {
      console.log('🔍 开始文档AI分析，参数:', { documentId, documentTitle, templateType });

      // 1. 获取文档实例详情
      let documentInstance = null;
      if (documentId) {
        documentInstance = await DocumentInstance.findByPk(documentId, {
          include: [
            {
              model: DocumentTemplate,
              as: 'template',
              attributes: ['id', 'name', 'category', 'templateContent', 'variables']
            }
          ]
        });
      }

      // 2. 检查缓存
      if (documentInstance) {
        const cacheKey = aiCacheService.generateDocumentAnalysisKey(
          documentInstance.id,
          documentInstance.updatedAt
        );
        const cached = await aiCacheService.getWithMetadata(cacheKey);

        if (cached) {
          console.log(`✅ 使用缓存结果 (缓存年龄: ${cached.age}秒)`);
          return res.json({
            success: true,
            data: {
              ...cached.value,
              cached: true,
              cacheAge: cached.age
            },
            message: 'AI分析完成（来自缓存）'
          });
        }
      }

      // 2. 使用ModelSelector选择合适的AI模型
      // 使用文件顶部静态导入的服务

      const selection = await modelSelectorService.selectModel({
        taskType: 'text',
        complexity: 'medium'
      });
      const modelConfig = typeof selection === 'string' ? { displayName: selection, name: selection } : selection;

      console.log('✅ 选择AI模型:', modelConfig.displayName);

      // 3. 构建AI提示词
      const systemPrompt = `你是一个专业的幼儿园督查文档分析助手。你的任务是分析督查文档的完整性和质量，并提供专业的填写建议。

请从以下几个维度进行分析：
1. 文档完整性 - 检查必填字段是否完整
2. 内容质量 - 评估内容的专业性和规范性
3. 缺失内容 - 指出需要补充的内容
4. 填写建议 - 提供具体的改进建议
5. 注意事项 - 提醒需要注意的关键点

请以JSON格式返回分析结果，包含以下字段：
{
  "completeness": { "score": 0-100, "description": "完整性评分说明" },
  "quality": { "score": 0-100, "description": "质量评分说明" },
  "missingContent": ["缺失内容1", "缺失内容2"],
  "suggestions": ["建议1", "建议2"],
  "warnings": ["注意事项1", "注意事项2"],
  "summary": "总体分析摘要"
}`;

      const userPrompt = `请分析以下督查文档：

文档标题: ${documentTitle || '未命名文档'}
模板类型: ${templateType || '通用文档'}
当前内容: ${currentContent || '暂无内容'}

${documentInstance ? `
文档详情:
- 文档ID: ${documentInstance.id}
- 模板名称: ${(documentInstance as any).template?.name || '未知'}
- 模板分类: ${(documentInstance as any).template?.category || '未知'}
- 文档状态: ${documentInstance.status}
- 填写进度: ${documentInstance.completionRate || 0}%
` : ''}

请提供详细的分析和建议。`;

      // 4. 调用AIBridge统一接口
      // 使用文件顶部静态导入的服务
      
      const aiResponse = await aiBridgeService.generateChatCompletion({
        model: modelConfig.name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      console.log('✅ AI分析完成');

      // 5. 解析AI响应
      let analysisResult;
      try {
        const content = aiResponse.choices[0]?.message?.content || '{}';
        // 尝试提取JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          // 如果没有JSON格式，使用文本内容
          analysisResult = {
            completeness: { score: 70, description: '文档基本完整' },
            quality: { score: 75, description: '内容质量良好' },
            missingContent: [],
            suggestions: [content],
            warnings: [],
            summary: content
          };
        }
      } catch (parseError) {
        console.warn('⚠️ AI响应解析失败，使用原始内容');
        const rawContent = aiResponse.choices[0]?.message?.content || '分析失败';
        analysisResult = {
          completeness: { score: 70, description: '文档基本完整' },
          quality: { score: 75, description: '内容质量良好' },
          missingContent: [],
          suggestions: [rawContent],
          warnings: [],
          summary: rawContent
        };
      }

      // 6. 准备响应数据
      const responseData = {
        analysis: analysisResult,
        modelUsed: modelConfig.displayName,
        documentInfo: documentInstance ? {
          id: documentInstance.id,
          title: documentInstance.title,
          status: documentInstance.status,
          completionRate: documentInstance.completionRate
        } : null,
        cached: false,
        cacheAge: 0
      };

      // 7. 保存到缓存
      if (documentInstance) {
        const cacheKey = aiCacheService.generateDocumentAnalysisKey(
          documentInstance.id,
          documentInstance.updatedAt
        );
        aiCacheService.set(cacheKey, responseData);
        console.log('✅ 分析结果已缓存');
      }

      res.json({
        success: true,
        data: responseData,
        message: 'AI分析完成'
      });

    } catch (error: any) {
      console.error('❌ 文档AI分析失败:', error);
      res.status(500).json({
        success: false,
        message: `文档AI分析失败: ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * 检查计划AI建议
   * POST /api/inspection-ai/plan-analysis
   */
  public analyzePlan = asyncHandler(async (req: Request, res: Response) => {
    const { year, plans } = req.body;
    const userId = (req as any).user?.id;

    try {
      console.log('🔍 开始检查计划AI分析，参数:', { year, plansCount: plans?.length });

      // 1. 获取检查计划数据
      const inspectionPlans = await InspectionPlan.findAll({
        where: {
          planYear: year || new Date().getFullYear()
        },
        include: [
          {
            model: InspectionType,
            as: 'inspectionType',
            attributes: ['id', 'name', 'category', 'frequency']
          }
        ],
        order: [['planDate', 'ASC']]
      });

      console.log('📊 获取到检查计划:', inspectionPlans.length, '条');

      // 2. 检查缓存
      const cacheKey = aiCacheService.generatePlanAnalysisKey(
        String(year || new Date().getFullYear()),
        String(inspectionPlans.length)
      );
      const cached = await aiCacheService.getWithMetadata(cacheKey);

      if (cached) {
        console.log(`✅ 使用缓存结果 (缓存年龄: ${cached.age}秒)`);
        return res.json({
          success: true,
          data: {
            ...cached.value,
            cached: true,
            cacheAge: cached.age
          },
          message: 'AI分析完成（来自缓存）'
        });
      }

      // 3. 统计分析
      const stats = {
        total: inspectionPlans.length,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byMonth: {} as Record<string, number>
      };

      inspectionPlans.forEach(plan => {
        // 按状态统计
        stats.byStatus[plan.status] = (stats.byStatus[plan.status] || 0) + 1;
        
        // 按分类统计
        const category = (plan as any).type?.category || '未分类';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        
        // 按月份统计
        const month = new Date(plan.planDate).getMonth() + 1;
        const monthKey = `${month}月`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
      });

      // 3. 使用ModelSelector选择AI模型
      // 使用文件顶部静态导入的服务

      const selection = await modelSelectorService.selectModel({
        taskType: 'text',
        complexity: 'medium'
      });
      const modelConfig = typeof selection === 'string' ? { displayName: selection, name: selection } : selection;

      console.log('✅ 选择AI模型:', modelConfig.displayName);

      // 4. 构建AI提示词
      const systemPrompt = `你是一个专业的幼儿园督查计划分析专家。你的任务是分析年度检查计划的合理性，并提供优化建议。

请从以下几个维度进行分析：
1. 时间分布合理性 - 检查计划在全年的分布是否均衡
2. 检查频率适当性 - 评估各类检查的频率是否合理
3. 资源配置优化 - 分析人力和时间资源的配置
4. 风险识别 - 识别可能的时间冲突和资源瓶颈
5. 改进建议 - 提供具体的优化建议

请以JSON格式返回分析结果，包含以下字段：
{
  "timeDistribution": { "score": 0-100, "description": "时间分布评分说明" },
  "frequency": { "score": 0-100, "description": "频率适当性评分说明" },
  "resourceAllocation": { "score": 0-100, "description": "资源配置评分说明" },
  "risks": ["风险1", "风险2"],
  "recommendations": ["建议1", "建议2"],
  "summary": "总体分析摘要"
}`;

      const userPrompt = `请分析以下年度检查计划：

年度: ${year || new Date().getFullYear()}
总计划数: ${stats.total}

状态分布:
${Object.entries(stats.byStatus).map(([status, count]) => `- ${status}: ${count}条`).join('\n')}

分类分布:
${Object.entries(stats.byCategory).map(([category, count]) => `- ${category}: ${count}条`).join('\n')}

月度分布:
${Object.entries(stats.byMonth).map(([month, count]) => `- ${month}: ${count}条`).join('\n')}

请提供详细的分析和优化建议。`;

      // 5. 调用AIBridge统一接口
      // 使用文件顶部静态导入的服务
      
      const aiResponse = await aiBridgeService.generateChatCompletion({
        model: modelConfig.name,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      console.log('✅ AI分析完成');

      // 6. 解析AI响应
      let analysisResult;
      try {
        const content = aiResponse.choices[0]?.message?.content || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = {
            timeDistribution: { score: 75, description: '时间分布基本合理' },
            frequency: { score: 80, description: '检查频率适当' },
            resourceAllocation: { score: 70, description: '资源配置良好' },
            risks: [],
            recommendations: [content],
            summary: content
          };
        }
      } catch (parseError) {
        console.warn('⚠️ AI响应解析失败，使用原始内容');
        const rawContent = aiResponse.choices[0]?.message?.content || '分析失败';
        analysisResult = {
          timeDistribution: { score: 75, description: '时间分布基本合理' },
          frequency: { score: 80, description: '检查频率适当' },
          resourceAllocation: { score: 70, description: '资源配置良好' },
          risks: [],
          recommendations: [rawContent],
          summary: rawContent
        };
      }

      // 7. 准备响应数据
      const responseData = {
        analysis: analysisResult,
        statistics: stats,
        modelUsed: modelConfig.displayName,
        planCount: inspectionPlans.length,
        year: year || new Date().getFullYear(),
        cached: false,
        cacheAge: 0
      };

      // 8. 保存到缓存
      aiCacheService.set(cacheKey, responseData);
      console.log('✅ 分析结果已缓存');

      res.json({
        success: true,
        data: responseData,
        message: 'AI分析完成'
      });

    } catch (error: any) {
      console.error('❌ 检查计划AI分析失败:', error);
      res.status(500).json({
        success: false,
        message: `检查计划AI分析失败: ${error.message}`,
        error: error.message
      });
    }
  });
}

export default new InspectionAIController();

