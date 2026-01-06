import { AssessmentRecord } from '../../models/assessment-record.model';
import { AssessmentReport } from '../../models/assessment-report.model';
import { AssessmentAnswer } from '../../models/assessment-answer.model';
import { AssessmentQuestion } from '../../models/assessment-question.model';
import { AssessmentGrowthTracking } from '../../models/assessment-growth-tracking.model';
import { sequelize } from '../../init';
import { Transaction, Op } from 'sequelize';
import { ApiError } from '../../utils/apiError';
import { unifiedAIBridge } from '../unified-ai-bridge.service';

const DIMENSION_MAP: Record<string, string> = {
  attention: '专注力',
  memory: '记忆力',
  logic: '逻辑思维',
  language: '语言能力',
  motor: '精细动作',
  social: '社交能力'
};

/**
 * 报告生成服务
 */
export class AssessmentReportService {
  /**
   * 生成AI报告
   */
  async generateReport(recordId: number): Promise<AssessmentReport> {
    const transaction = await sequelize.transaction();
    try {
      const record = await AssessmentRecord.findByPk(recordId, {
        include: [{ association: 'config' }],
        transaction
      });

      if (!record) {
        throw ApiError.notFound('测评记录不存在');
      }

      if (record.status !== 'completed') {
        throw ApiError.badRequest('测评未完成，无法生成报告');
      }

      // 检查是否已有报告
      let report = await AssessmentReport.findOne({
        where: { recordId },
        transaction
      });

      if (report) {
        return report;
      }

      // 获取所有答案和题目
      const answers = await AssessmentAnswer.findAll({
        where: { recordId },
        include: [{ association: 'question' }],
        transaction
      });

      // 使用AI生成报告内容
      const reportContent = await this.generateAIReport(record, answers);

      // 生成分享链接和二维码
      const shareUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/assessment/report/${recordId}`;
      const qrCodeUrl = await this.generateQRCode(shareUrl);

      // 创建报告
      report = await AssessmentReport.create({
        recordId,
        reportNo: `RPT${Date.now()}${Math.floor(Math.random() * 1000)}`,
        content: reportContent,
        aiGenerated: true,
        qrCodeUrl,
        shareUrl,
        viewCount: 0
      }, { transaction });

      // 创建成长追踪记录
      await this.createGrowthTracking(record, transaction);

      await transaction.commit();
      return report;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 使用AI生成报告内容
   */
  private async generateAIReport(record: AssessmentRecord, answers: any[]): Promise<any> {
    try {
      const dimensionScores = record.dimensionScores || {};
      const dq = record.developmentQuotient || 0;

      // 构建维度得分说明
      const dimensionSummary = Object.entries(dimensionScores).map(([dimension, scores]: [string, any]) => {
        const dimensionName = DIMENSION_MAP[dimension] || dimension;
        const score = scores.score || 0;
        const maxScore = scores.maxScore || 0;
        const percentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(1) : '0';
        return `${dimensionName}: ${score}/${maxScore} (${percentage}%)`;
      }).join('\n');

      // 找出优势维度（得分率>80%）
      const strengths: string[] = [];
      Object.entries(dimensionScores).forEach(([dimension, scores]: [string, any]) => {
        const score = scores.score || 0;
        const maxScore = scores.maxScore || 0;
        if (maxScore > 0 && (score / maxScore) >= 0.8) {
          strengths.push(DIMENSION_MAP[dimension] || dimension);
        }
      });

      // 找出需要提升的维度（得分率<60%）
      const improvements: string[] = [];
      Object.entries(dimensionScores).forEach(([dimension, scores]: [string, any]) => {
        const score = scores.score || 0;
        const maxScore = scores.maxScore || 0;
        if (maxScore > 0 && (score / maxScore) < 0.6) {
          improvements.push(DIMENSION_MAP[dimension] || dimension);
        }
      });

      // 构建AI提示词
      const systemPrompt = `你是一位专业的儿童发展评估专家。请根据以下测评数据，生成一份专业、温暖、鼓励性的儿童发育商测评报告。

要求：
1. 报告要专业但易懂，适合家长阅读
2. 突出孩子的优势，给予积极鼓励
3. 针对需要提升的维度，提供具体、可行的成长建议
4. 语言要温暖、积极，避免负面评价
5. 报告结构：总体评价、优势分析、成长建议、日常训练建议

测评信息：
- 儿童姓名：${record.childName}
- 年龄：${record.childAge}个月
- 发育商（DQ）：${dq}
- 总分：${record.totalScore}/${record.maxScore}

各维度得分：
${dimensionSummary}

优势维度：${strengths.join('、') || '无'}
需要提升的维度：${improvements.join('、') || '无'}

请生成一份完整的测评报告。`;

      const userMessage = `请为${record.childName}（${record.childAge}个月）生成一份发育商测评报告。`;

      // 调用AI生成报告
      const aiResponse = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-thinking-250615',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, record.userId ? String(record.userId) : undefined);

      // 解析AI响应
      const aiContent = aiResponse.data?.content || aiResponse.data?.message || '';
      
      // 构建报告内容结构
      return {
        overall: {
          childName: record.childName,
          age: record.childAge,
          dq: dq,
          totalScore: record.totalScore,
          maxScore: record.maxScore,
          assessmentDate: record.endTime || record.createdAt
        },
        dimensions: dimensionScores,
        strengths: strengths,
        improvements: improvements,
        aiReport: aiContent,
        recommendations: this.extractRecommendations(aiContent),
        dailyActivities: this.extractDailyActivities(aiContent)
      };
    } catch (error) {
      console.error('AI生成报告失败:', error);
      // 如果AI生成失败，返回基础报告
      return {
        overall: {
          childName: record.childName,
          age: record.childAge,
          dq: record.developmentQuotient || 0,
          totalScore: record.totalScore,
          maxScore: record.maxScore,
          assessmentDate: record.endTime || record.createdAt
        },
        dimensions: record.dimensionScores || {},
        strengths: [],
        improvements: [],
        aiReport: '报告生成中，请稍后查看。',
        recommendations: [],
        dailyActivities: []
      };
    }
  }

  /**
   * 提取成长建议
   */
  private extractRecommendations(aiContent: string): string[] {
    // 简单的关键词提取，实际可以使用更复杂的NLP技术
    const recommendations: string[] = [];
    const lines = aiContent.split('\n');
    
    lines.forEach(line => {
      if (line.includes('建议') || line.includes('推荐') || line.includes('可以')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.slice(0, 5); // 最多返回5条建议
  }

  /**
   * 提取日常活动建议
   */
  private extractDailyActivities(aiContent: string): string[] {
    const activities: string[] = [];
    const lines = aiContent.split('\n');

    // 寻找包含具体活动建议的段落
    lines.forEach(line => {
      const trimmedLine = line.trim();

      // 跳过标题行和空行
      if (trimmedLine.startsWith('#') || trimmedLine.startsWith('###') ||
          trimmedLine.startsWith('**') || !trimmedLine) {
        return;
      }

      // 寻找包含具体活动建议的句子
      // 通常包含动词和具体活动描述
      if (this.isActivityLine(trimmedLine)) {
        const activity = this.cleanActivityText(trimmedLine);
        if (activity && activity.length > 10 && activity.length < 100) {
          activities.push(activity);
        }
      }
    });

    // 如果没有找到合适的活动，生成默认的活动建议
    if (activities.length === 0) {
      activities.push(
        '进行5-10分钟的专注力训练游戏',
        '开展语言交流活动，如故事分享',
        '参与精细动作训练，如搭积木画画',
        '进行社交互动游戏，增进情感交流',
        '开展逻辑思维训练活动'
      );
    }

    return activities.slice(0, 5); // 最多返回5条活动建议
  }

  /**
   * 判断是否为活动建议行
   */
  private isActivityLine(line: string): boolean {
    // 排除明显不是活动的行
    const excludeKeywords = [
      '测评', '维度', '本次', '围绕', '展开', '旨在', '了解', '当前', '发展',
      '状态', '培养', '科学', '依据', '价值', '标准化', '工具', '对照',
      '同龄', '常模', '识别', '优势', '提升', '领域', '帮助', '家庭', '有的',
      '放矢', '支持', '孩子', '成长', '过程', '结合', '观察', '互动', '任务',
      '完成', '情况', '确保', '客观', '针对性', '说明', '发现', '提升点'
    ];

    const hasExcludeKeyword = excludeKeywords.some(keyword => line.includes(keyword));
    if (hasExcludeKeyword) {
      return false;
    }

    const activityKeywords = [
      '游戏', '活动', '训练', '练习', '互动', '交流', '分享',
      '进行', '开展', '参与', '完成', '体验', '尝试',
      '搭', '画', '读', '写', '说', '唱', '跳', '玩'
    ];

    // 检查是否包含活动关键词
    const hasActivityKeyword = activityKeywords.some(keyword =>
      line.includes(keyword) && !line.includes('建议') && !line.includes('分析')
    );

    // 检查是否为具体动作描述（包含动词）
    const hasActionVerb = /可以|能够|应该|建议|尝试|进行|开展|参与|完成/.test(line);

    // 优先选择包含时间或具体活动类型的行
    const hasTimeIndicator = /每天|分钟|次|周/.test(line);
    const hasSpecificActivity = /跳绳|平衡车|夹豆子|画画|搭积木|讲故事/.test(line);

    return hasActivityKeyword && (hasActionVerb || hasTimeIndicator || hasSpecificActivity);
  }

  /**
   * 清理活动文本，移除多余字符
   */
  private cleanActivityText(text: string): string {
    let cleaned = text
      .replace(/^[\d\.\-\*\s]+/, '') // 移除开头的数字、标点
      .replace(/[【】\(\)\[\]]/g, '') // 移除括号
      .replace(/\*\*/g, '') // 移除markdown加粗
      .trim();

    // 如果包含解释性内容，只保留前面的核心活动
    if (cleaned.includes('（') || cleaned.includes('(')) {
      cleaned = cleaned.split(/[（(]/)[0];
    }
    if (cleaned.includes('：')) {
      cleaned = cleaned.split('：')[0];
    }
    if (cleaned.includes(',')) {
      cleaned = cleaned.split(',')[0];
    }

    // 移除过长的描述性语句
    const sentences = cleaned.split(/[。！？]/);
    cleaned = sentences[0] || cleaned;

    return cleaned.trim().substring(0, 30); // 进一步限制长度
  }

  /**
   * 生成二维码
   */
  private async generateQRCode(url: string): Promise<string> {
    try {
      const QRCode = require('qrcode');
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `qrcode_${Date.now()}.png`;
      const fs = require('fs');
      const path = require('path');
      const qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');
      
      if (!fs.existsSync(qrCodeDir)) {
        fs.mkdirSync(qrCodeDir, { recursive: true });
      }

      const filePath = path.join(qrCodeDir, fileName);
      fs.writeFileSync(filePath, base64Data, 'base64');

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      return `${baseUrl}/qrcodes/${fileName}`;
    } catch (error) {
      console.error('生成二维码失败:', error);
      throw new Error('生成二维码失败');
    }
  }

  /**
   * 创建成长追踪记录
   */
  private async createGrowthTracking(record: AssessmentRecord, transaction: Transaction): Promise<void> {
    try {
      // 查找上次测评记录
      const previousRecord = await AssessmentRecord.findOne({
        where: {
          [Op.or]: [
            { userId: record.userId },
            { phone: record.phone }
          ],
          status: 'completed',
          id: { [Op.ne]: record.id }
        },
        order: [['createdAt', 'DESC']],
        transaction
      });

      // 计算成长数据
      const growthData: any = {};
      if (previousRecord && previousRecord.dimensionScores) {
        const currentScores = record.dimensionScores || {};
        const previousScores = previousRecord.dimensionScores || {};
        
        Object.keys(currentScores).forEach(dimension => {
          const current = currentScores[dimension];
          const previous = previousScores[dimension];
          if (previous) {
            const currentRate = current.maxScore > 0 ? (current.score / current.maxScore) : 0;
            const previousRate = previous.maxScore > 0 ? (previous.score / previous.maxScore) : 0;
            growthData[dimension] = {
              current: currentRate,
              previous: previousRate,
              growth: currentRate - previousRate
            };
          }
        });
      }

      await AssessmentGrowthTracking.create({
        recordId: record.id,
        parentId: record.parentId,
        studentId: record.studentId,
        previousRecordId: previousRecord?.id,
        growthData
      }, { transaction });
    } catch (error) {
      console.error('创建成长追踪记录失败:', error);
      // 不抛出错误，因为这不是关键操作
    }
  }
}

export default new AssessmentReportService();

