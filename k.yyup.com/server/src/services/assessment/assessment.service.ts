import { AssessmentConfig } from '../../models/assessment-config.model';
import { AssessmentQuestion } from '../../models/assessment-question.model';
import { AssessmentRecord, AssessmentStatus } from '../../models/assessment-record.model';
import { AssessmentAnswer } from '../../models/assessment-answer.model';
import { AssessmentReport } from '../../models/assessment-report.model';
import { AssessmentGrowthTracking } from '../../models/assessment-growth-tracking.model';
import { sequelize } from '../../init';
import { Transaction, Op } from 'sequelize';
import { ApiError } from '../../utils/apiError';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

/**
 * 生成测评记录编号
 */
function generateRecordNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ASS${year}${month}${day}${random}`;
}

/**
 * 生成报告编号
 */
function generateReportNo(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RPT${year}${month}${day}${random}`;
}

/**
 * 计算发育商（DQ）
 */
function calculateDQ(totalScore: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Number(((totalScore / maxScore) * 100).toFixed(2));
}

/**
 * 测评服务
 */
export class AssessmentService {
  /**
   * 根据年龄获取测评配置
   */
  async getConfigByAge(ageInMonths: number): Promise<AssessmentConfig | null> {
    return await AssessmentConfig.findOne({
      where: {
        status: 'active',
        minAge: { [Op.lte]: ageInMonths },
        maxAge: { [Op.gte]: ageInMonths }
      }
    });
  }

  /**
   * 获取题目列表
   */
  async getQuestions(configId: number, ageGroup: string, dimension?: string): Promise<AssessmentQuestion[]> {
    const where: any = {
      configId,
      ageGroup,
      status: 'active'
    };
    if (dimension) {
      where.dimension = dimension;
    }
    return await AssessmentQuestion.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });
  }

  /**
   * 创建测评记录
   */
  async createRecord(data: {
    childName: string;
    childAge: number;
    childGender?: 'male' | 'female';
    parentId?: number;
    studentId?: number;
    userId?: number;
    phone?: string;
  }): Promise<AssessmentRecord> {
    const transaction = await sequelize.transaction();
    try {
      // 获取测评配置
      const config = await this.getConfigByAge(data.childAge);
      if (!config) {
        throw ApiError.badRequest('该年龄段暂无测评配置');
      }

      // 检查是否已有未完成的测评
      const whereConditions: any[] = [];
      if (data.userId) whereConditions.push({ userId: data.userId });
      if (data.phone) whereConditions.push({ phone: data.phone });
      
      let existingRecord = null;
      if (whereConditions.length > 0) {
        existingRecord = await AssessmentRecord.findOne({
          where: {
            [Op.or]: whereConditions,
            status: 'in_progress'
          },
          attributes: { exclude: ['teacherId'] }, // 排除不存在的字段
          transaction
        });
      }

      if (existingRecord) {
        throw ApiError.badRequest('您有未完成的测评，请先完成或取消');
      }

      // 检查月度限制（一个月只能测评一次）
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      let recentRecord = null;
      if (whereConditions.length > 0) {
        recentRecord = await AssessmentRecord.findOne({
          where: {
            [Op.or]: whereConditions,
            status: 'completed',
            createdAt: { [Op.gte]: oneMonthAgo }
          },
          attributes: { exclude: ['teacherId'] }, // 排除不存在的字段
          transaction
        });
      }

      if (recentRecord) {
        throw ApiError.badRequest('一个月内只能进行一次测评，请稍后再试');
      }

      const record = await AssessmentRecord.create({
        recordNo: generateRecordNo(),
        configId: config.id,
        childName: data.childName,
        childAge: data.childAge,
        childGender: data.childGender,
        parentId: data.parentId,
        studentId: data.studentId,
        userId: data.userId,
        phone: data.phone,
        status: 'in_progress',
        startTime: new Date()
      }, { transaction });

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 提交答案
   */
  async submitAnswer(recordId: number, questionId: number, answer: any, timeSpent?: number): Promise<AssessmentAnswer> {
    const transaction = await sequelize.transaction();
    try {
      const record = await AssessmentRecord.findByPk(recordId, { transaction });
      if (!record) {
        throw ApiError.notFound('测评记录不存在');
      }
      if (record.status !== 'in_progress') {
        throw ApiError.badRequest('测评已完成，无法提交答案');
      }

      const question = await AssessmentQuestion.findByPk(questionId, { transaction });
      if (!question) {
        throw ApiError.notFound('题目不存在');
      }

      // 计算得分
      let score = 0;
      
      // 解析题目内容
      let questionContent: any = {};
      if (question.content) {
        if (typeof question.content === 'string') {
          try {
            questionContent = JSON.parse(question.content);
          } catch (e) {
            questionContent = {};
          }
        } else {
          questionContent = question.content;
        }
      }

      // 根据题目类型计算得分
      if (question.questionType === 'qa') {
        // 问答类型：对比正确答案
        const correctAnswer = questionContent.correctAnswer;
        if (correctAnswer && answer === correctAnswer) {
          score = question.score;
        }
      } else if (question.questionType === 'game' || question.questionType === 'interactive') {
        // 游戏类型：根据accuracy或具体指标计算得分
        if (answer && typeof answer === 'object') {
          // 对于找不同游戏
          if (answer.foundCount !== undefined && answer.totalCount !== undefined) {
            const foundRatio = answer.foundCount / answer.totalCount;
            score = Math.round(question.score * foundRatio);
          }
          // 对于记忆游戏
          else if (answer.matchedPairs !== undefined && answer.totalPairs !== undefined) {
            const matchRatio = answer.matchedPairs / answer.totalPairs;
            score = Math.round(question.score * matchRatio);
          }
          // 对于分类游戏
          else if (answer.correctCount !== undefined && answer.totalCount !== undefined) {
            const correctRatio = answer.correctCount / answer.totalCount;
            score = Math.round(question.score * correctRatio);
          }
          // 通用accuracy字段
          else if (answer.accuracy !== undefined) {
            score = Math.round(question.score * answer.accuracy);
          }
        }
      }

      const answerRecord = await AssessmentAnswer.create({
        recordId,
        questionId,
        answer: JSON.stringify(answer),
        score,
        timeSpent
      }, { transaction });

      await transaction.commit();
      return answerRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 完成测评并计算得分
   */
  async completeAssessment(recordId: number): Promise<AssessmentRecord> {
    const transaction = await sequelize.transaction();
    try {
      const record = await AssessmentRecord.findByPk(recordId, {
        include: [{ association: 'config' }],
        transaction
      });
      if (!record) {
        throw ApiError.notFound('测评记录不存在');
      }
      if (record.status !== 'in_progress') {
        throw ApiError.badRequest('测评已完成或已取消');
      }

      // 获取所有答案
      const answers = await AssessmentAnswer.findAll({
        where: { recordId },
        include: [{ association: 'question' }],
        transaction
      });

      // 计算总分和各维度得分
      let totalScore = 0;
      let maxScore = 0;
      const dimensionScores: Record<string, { score: number; maxScore: number }> = {};

      answers.forEach(answer => {
        const question = answer.question;
        if (question) {
          totalScore += answer.score;
          maxScore += question.score;
          
          if (!dimensionScores[question.dimension]) {
            dimensionScores[question.dimension] = { score: 0, maxScore: 0 };
          }
          dimensionScores[question.dimension].score += answer.score;
          dimensionScores[question.dimension].maxScore += question.score;
        }
      });

      // 计算发育商
      const dq = calculateDQ(totalScore, maxScore);

      // 更新记录
      record.totalScore = totalScore;
      record.maxScore = maxScore;
      record.dimensionScores = dimensionScores;
      record.developmentQuotient = dq;
      record.status = 'completed';
      record.endTime = new Date();
      await record.save({ transaction });

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 生成二维码
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // 保存二维码图片
      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const fileName = `qrcode_${Date.now()}.png`;
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
}

export default new AssessmentService();

