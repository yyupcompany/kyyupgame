import { Parent } from '../../models/parent.model';
import { Student } from '../../models/student.model';
import { AssessmentRecord } from '../../models/assessment-record.model';
import { ActivityRegistration } from '../../models/activity-registration.model';
import { Notification } from '../../models/notification.model';
import { ParentStudentRelation } from '../../models/parent-student-relation.model';
import { Op } from 'sequelize';
import { unifiedAIBridge } from '../unified-ai-bridge.service';

/**
 * 家长AI助手服务
 */
export class ParentAssistantService {
  /**
   * 获取家长上下文信息
   */
  async getParentContext(parentId: number): Promise<any> {
    try {
      const parent = await Parent.findByPk(parentId, {
        include: [
          {
            association: 'user'
          }
        ]
      });

      if (!parent) {
        return null;
      }

      // 获取关联的学生
      const relations = await ParentStudentRelation.findAll({
        where: { userId: parent.userId },
        include: [{ association: 'student', include: [{ association: 'class' }] }]
      });

      const students = relations.map(r => r.student).filter(Boolean);

      // 获取最近的测评记录
      const recentAssessments = await AssessmentRecord.findAll({
        where: {
          parentId,
          status: 'completed'
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      // 获取最近的活动参与
      const recentActivities = await ActivityRegistration.findAll({
        where: {
          parentId
        },
        order: [['registrationTime', 'DESC']],
        limit: 5
      });

      // 获取最近的通知
      const recentNotifications = await Notification.findAll({
        where: {
          userId: parent.userId
        },
        order: [['createdAt', 'DESC']],
        limit: 5
      });

      return {
        parent: {
          id: parent.id,
          name: parent.user?.realName || parent.user?.username || '家长',
          phone: parent.user?.phone || ''
        },
        students: students.map(s => ({
          id: s.id,
          name: s.name,
          age: this.calculateAge(s.birthDate),
          gender: s.gender === 1 ? '男' : '女',
          class: s.class?.name || '未分班'
        })),
        recentAssessments: recentAssessments.map(a => ({
          date: a.createdAt,
          childName: a.childName,
          dq: a.developmentQuotient,
          dimensionScores: a.dimensionScores
        })),
        recentActivities: recentActivities.map(a => ({
          activityName: a.activity?.title || '未知活动',
          registrationTime: a.registrationTime
        })),
        recentNotifications: recentNotifications.map(n => ({
          title: n.title,
          content: n.content,
          createdAt: n.createdAt
        }))
      };
    } catch (error) {
      console.error('获取家长上下文失败:', error);
      return null;
    }
  }

  /**
   * 计算年龄（月）
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    return years * 12 + months;
  }

  /**
   * 回答家长问题
   */
  async answerQuestion(parentId: number, question: string): Promise<{
    answer: string;
    suggestions?: string[];
    relatedResources?: Array<{ title: string; url: string }>;
  }> {
    try {
      // 获取家长上下文
      const context = await this.getParentContext(parentId);

      if (!context) {
        throw new Error('无法获取家长信息');
      }

      // 构建系统提示词
      const systemPrompt = `你是一位专业的儿童教育专家，专门为家长提供育儿建议和解答疑问。

家长信息：
- 姓名：${context.parent.name}
- 联系电话：${context.parent.phone}

孩子信息：
${context.students.map((s: any, i: number) => `
孩子${i + 1}：
- 姓名：${s.name}
- 年龄：${s.age}个月（${Math.floor(s.age / 12)}岁${s.age % 12}个月）
- 性别：${s.gender}
- 班级：${s.class}
`).join('\n')}

最近的测评记录：
${context.recentAssessments.length > 0 ? context.recentAssessments.map((a: any, i: number) => `
测评${i + 1}：
- 日期：${new Date(a.date).toLocaleDateString('zh-CN')}
- 孩子：${a.childName}
- 发育商（DQ）：${a.dq}
- 各维度得分：${JSON.stringify(a.dimensionScores)}
`).join('\n') : '暂无测评记录'}

最近的活动参与：
${context.recentActivities.length > 0 ? context.recentActivities.map((a: any, i: number) => `
活动${i + 1}：${a.activityName}（${new Date(a.registrationTime).toLocaleDateString('zh-CN')}）
`).join('\n') : '暂无活动参与'}

最近的通知：
${context.recentNotifications.length > 0 ? context.recentNotifications.map((n: any, i: number) => `
通知${i + 1}：${n.title} - ${n.content}
`).join('\n') : '暂无通知'}

请根据以上信息，专业、温暖地回答家长的问题。回答要：
1. 结合孩子的实际情况
2. 提供具体、可行的建议
3. 语言要温暖、鼓励
4. 如果涉及测评数据，要给出专业解读
5. 如果涉及活动或通知，要提供相关信息

请用中文回答。`;

      const userMessage = question;

      // 使用统一AI Bridge服务调用AI
      const chatResponse = await unifiedAIBridge.chat({
        model: 'doubao-seed-1-6-thinking-250615', // 使用深度思考模型
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
      });

      const answer = chatResponse.data?.content || '抱歉，AI服务暂时无法回答，请稍后再试。';

      // 提取建议和资源（简化版本）
      const suggestions = this.extractSuggestions(answer);
      const relatedResources = this.extractRelatedResources(answer, context, parentId);

      return {
        answer,
        suggestions,
        relatedResources
      };
    } catch (error) {
      console.error('AI回答失败:', error);
      throw error;
    }
  }

  /**
   * 提取建议
   */
  private extractSuggestions(answer: string): string[] {
    const suggestions: string[] = [];
    const lines = answer.split('\n');
    
    lines.forEach(line => {
      if (line.includes('建议') || line.includes('推荐') || line.match(/^\d+[\.、]/)) {
        const cleanLine = line.replace(/^\d+[\.、]\s*/, '').trim();
        if (cleanLine.length > 10 && cleanLine.length < 100) {
          suggestions.push(cleanLine);
        }
      }
    });

    return suggestions.slice(0, 3);
  }

  /**
   * 提取相关资源
   */
  private extractRelatedResources(answer: string, context: any, parentId: number): Array<{ title: string; url: string }> {
    const resources: Array<{ title: string; url: string }> = [];

    // 如果提到了测评，推荐查看测评报告
    if (answer.includes('测评') || answer.includes('发育商')) {
      context.recentAssessments.forEach((assessment: any) => {
        resources.push({
          title: `查看${assessment.childName}的测评报告`,
          url: `/parent-center/assessment/report/${assessment.id}`
        });
      });
    }

    // 如果提到了活动，推荐查看活动
    if (answer.includes('活动')) {
      resources.push({
        title: '查看活动列表',
        url: '/parent-center/activities'
      });
    }

    return resources.slice(0, 3);
  }

  /**
   * 获取快捷问题
   */
  getQuickQuestions(): {
    questions: Array<{
      id: string;
      question: string;
      category: string;
      frequency: number;
      tags: string[];
    }>;
    categories: Array<{
      code: string;
      name: string;
      count: number;
    }>;
    total: number;
  } {
    const questions = [
      {
        id: 'quick_001',
        question: '如何提高孩子的专注力？',
        category: 'education',
        frequency: 15,
        tags: ['专注力', '学习能力', '注意力']
      },
      {
        id: 'quick_002',
        question: '孩子最近不爱吃饭怎么办？',
        category: 'nutrition',
        frequency: 12,
        tags: ['饮食', '营养', '健康']
      },
      {
        id: 'quick_003',
        question: '如何培养孩子的社交能力？',
        category: 'behavior',
        frequency: 10,
        tags: ['社交', '沟通', '人际关系']
      },
      {
        id: 'quick_004',
        question: '孩子测评报告怎么看？',
        category: 'development',
        frequency: 8,
        tags: ['测评', '发育', '报告解读']
      },
      {
        id: 'quick_005',
        question: '如何在家进行体能训练？',
        category: 'health',
        frequency: 7,
        tags: ['体能', '运动', '健康']
      },
      {
        id: 'quick_006',
        question: '孩子最近情绪不好怎么办？',
        category: 'behavior',
        frequency: 9,
        tags: ['情绪', '心理', '行为']
      },
      {
        id: 'quick_007',
        question: '如何培养孩子的语言能力？',
        category: 'development',
        frequency: 11,
        tags: ['语言', '表达', '沟通']
      },
      {
        id: 'quick_008',
        question: '测评结果显示需要提升的维度怎么办？',
        category: 'development',
        frequency: 6,
        tags: ['测评', '提升', '发展']
      }
    ];

    const categories = [
      { code: 'health', name: '健康保健', count: 1 },
      { code: 'education', name: '教育培养', count: 1 },
      { code: 'nutrition', name: '营养饮食', count: 1 },
      { code: 'behavior', name: '行为习惯', count: 2 },
      { code: 'development', name: '发育成长', count: 3 },
      { code: 'daily', name: '日常生活', count: 0 }
    ];

    return {
      questions,
      categories,
      total: questions.length
    };
  }
}

export default new ParentAssistantService();

