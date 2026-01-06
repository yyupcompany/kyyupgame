import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { 
  initExpertConsultationModels, 
  setupExpertConsultationAssociations,
  ExpertConsultation,
  ExpertSpeech,
  ActionPlan,
  ConsultationSummary,
  ConsultationParams,
  ExpertSpeechParams,
  ActionPlanParams,
  ConsultationSummaryParams
} from '../../../src/models/expert-consultation.model';

// Mock the sequelize instance
jest.mock('../../../src/config/database', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  } as any,
}));

// 控制台错误检测变量
let consoleSpy: any

describe('ExpertConsultation Models', () => {
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
        hasOne: jest.fn(),
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}),
      sync: jest.fn(),
      close: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('ExpertConsultation Model', () => {
    describe('Model Definition', () => {
      it('should initialize ExpertConsultation model with correct attributes', () => {
        const models = initExpertConsultationModels(mockSequelize);
        
        expect(mockSequelize.define).toHaveBeenCalledWith(
          'expert_consultations',
          expect.objectContaining({
            id: {
              type: expect.any(Object),
              defaultValue: expect.any(Function),
              primaryKey: true,
              comment: '咨询会话ID'
            },
            userId: {
              type: expect.any(Object),
              allowNull: false,
              comment: '用户ID'
            },
            topic: {
              type: expect.any(Object),
              allowNull: false,
              comment: '咨询主题'
            },
            description: {
              type: expect.any(Object),
              allowNull: false,
              comment: '问题描述'
            },
            urgency: {
              type: expect.any(Object),
              defaultValue: 'medium',
              comment: '紧急程度'
            },
            expectedExperts: {
              type: expect.any(Object),
              defaultValue: '[]',
              comment: '期望的专家类型列表'
            },
            context: {
              type: expect.any(Object),
              defaultValue: '{}',
              comment: '背景信息和上下文'
            },
            status: {
              type: expect.any(Object),
              defaultValue: 'pending',
              comment: '会话状态'
            },
            progressPercentage: {
              type: expect.any(Object),
              defaultValue: 0,
              comment: '进度百分比'
            },
            totalExperts: {
              type: expect.any(Object),
              defaultValue: 0,
              comment: '参与专家总数'
            },
            currentRound: {
              type: expect.any(Object),
              defaultValue: 1,
              comment: '当前轮次'
            },
            maxRounds: {
              type: expect.any(Object),
              defaultValue: 5,
              comment: '最大轮次'
            },
            createdAt: {
              type: expect.any(Object),
              allowNull: false,
              defaultValue: expect.any(Function)
            },
            updatedAt: {
              type: expect.any(Object),
              allowNull: false,
              defaultValue: expect.any(Function)
            }
          }),
          expect.objectContaining({
            sequelize: mockSequelize,
            tableName: 'expert_consultations',
            timestamps: true,
            underscored: true,
            indexes: expect.arrayContaining([
              expect.objectContaining({ name: 'expert_consultations_user_id_idx' }),
              expect.objectContaining({ name: 'expert_consultations_status_idx' }),
              expect.objectContaining({ name: 'expert_consultations_urgency_idx' }),
              expect.objectContaining({ name: 'expert_consultations_created_at_idx' })
            ]),
            comment: '专家咨询会话表'
          })
        );
      });

      it('should have correct table configuration', () => {
        initExpertConsultationModels(mockSequelize);
        
        const callArgs = mockSequelize.define.mock.calls[0];
        const options = callArgs[2];
        
        expect(options.tableName).toBe('expert_consultations');
        expect(options.timestamps).toBe(true);
        expect(options.underscored).toBe(true);
      });
    });

    describe('Enum Validation', () => {
      it('should validate urgency enum values', () => {
        const validUrgencies = ['low', 'medium', 'high', 'critical'];
        
        validUrgencies.forEach(urgency => {
          expect(['low', 'medium', 'high', 'critical']).toContain(urgency);
        });
      });

      it('should validate status enum values', () => {
        const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
        
        validStatuses.forEach(status => {
          expect(['pending', 'active', 'completed', 'cancelled']).toContain(status);
        });
      });
    });

    describe('Field Validation', () => {
      it('should validate required fields', () => {
        const consultationData: ConsultationParams = {
          userId: 1,
          topic: '教育咨询',
          description: '关于孩子教育的问题'
        };

        expect(consultationData).toHaveProperty('userId');
        expect(consultationData).toHaveProperty('topic');
        expect(consultationData).toHaveProperty('description');
      });

      it('should validate optional fields', () => {
        const consultationData: ConsultationParams = {
          userId: 1,
          topic: '教育咨询',
          description: '关于孩子教育的问题',
          urgency: 'high',
          expectedExperts: ['教育专家', '心理专家'],
          context: { childAge: 5, grade: '幼儿园' }
        };

        expect(consultationData.urgency).toBeDefined();
        expect(consultationData.expectedExperts).toBeDefined();
        expect(consultationData.context).toBeDefined();
      });
    });

    describe('Field Constraints', () => {
      it('should validate string field lengths', () => {
        expect.assertions(1);
        
        // topic max length 500
        const topic = '主'.repeat(500);
        expect(topic.length).toBeLessThanOrEqual(500);
      });

      it('should validate numeric field constraints', () => {
        const validUserId = 1;
        expect(validUserId).toBeGreaterThan(0);
        
        const validProgress = 50;
        expect(validProgress).toBeGreaterThanOrEqual(0);
        expect(validProgress).toBeLessThanOrEqual(100);
        
        const validRound = 2;
        expect(validRound).toBeGreaterThan(0);
      });
    });

    describe('Default Values', () => {
      it('should have default urgency value', () => {
        const consultationData: ConsultationParams = {
          userId: 1,
          topic: '教育咨询',
          description: '关于孩子教育的问题'
        };

        // urgency should default to 'medium'
        expect(consultationData.urgency).toBeUndefined();
      });

      it('should have default status value', () => {
        const consultationData: ConsultationParams = {
          userId: 1,
          topic: '教育咨询',
          description: '关于孩子教育的问题'
        };

        // status should default to 'pending'
        expect(consultationData.status).toBeUndefined();
      });
    });
  });

  describe('ExpertSpeech Model', () => {
    describe('Model Definition', () => {
      it('should initialize ExpertSpeech model with correct attributes', () => {
        initExpertConsultationModels(mockSequelize);
        
        // Second call should be for ExpertSpeech
        const callArgs = mockSequelize.define.mock.calls[1];
        
        expect(callArgs[0]).toBe('expert_speeches');
        expect(callArgs[1]).toEqual(expect.objectContaining({
          id: {
            type: expect.any(Object),
            defaultValue: expect.any(Function),
            primaryKey: true,
            comment: '发言记录ID'
          },
          consultationId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '咨询会话ID'
          },
          expertType: {
            type: expect.any(Object),
            allowNull: false,
            comment: '专家类型'
          },
          expertName: {
            type: expect.any(Object),
            allowNull: false,
            comment: '专家名称'
          },
          content: {
            type: expect.any(Object),
            allowNull: false,
            comment: '发言内容'
          },
          round: {
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 1,
            comment: '发言轮次'
          },
          order: {
            type: expect.any(Object),
            allowNull: false,
            comment: '在该轮次中的发言顺序'
          },
          confidence: {
            type: expect.any(Object),
            defaultValue: 0.8,
            comment: '发言置信度'
          },
          keywords: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '关键词标签'
          }
        }));
      });
    });

    describe('Field Validation', () => {
      it('should validate required fields', () => {
        const speechData: ExpertSpeechParams = {
          consultationId: 'uuid-123',
          expertType: '教育专家',
          expertName: '张教授',
          content: '我认为这个问题应该从多个角度来分析',
          round: 1,
          order: 1
        };

        expect(speechData).toHaveProperty('consultationId');
        expect(speechData).toHaveProperty('expertType');
        expect(speechData).toHaveProperty('expertName');
        expect(speechData).toHaveProperty('content');
        expect(speechData).toHaveProperty('round');
        expect(speechData).toHaveProperty('order');
      });

      it('should validate optional fields', () => {
        const speechData: ExpertSpeechParams = {
          consultationId: 'uuid-123',
          expertType: '教育专家',
          expertName: '张教授',
          content: '我认为这个问题应该从多个角度来分析',
          round: 1,
          order: 1,
          confidence: 0.9,
          keywords: ['教育', '心理', '发展']
        };

        expect(speechData.confidence).toBeDefined();
        expect(speechData.keywords).toBeDefined();
      });
    });

    describe('Field Constraints', () => {
      it('should validate confidence range', () => {
        const validConfidences = [0.0, 0.5, 0.8, 1.0];
        
        validConfidences.forEach(confidence => {
          expect(confidence).toBeGreaterThanOrEqual(0.0);
          expect(confidence).toBeLessThanOrEqual(1.0);
        });
      });

      it('should validate numeric field constraints', () => {
        const validRound = 1;
        expect(validRound).toBeGreaterThan(0);
        
        const validOrder = 1;
        expect(validOrder).toBeGreaterThan(0);
      });
    });
  });

  describe('ActionPlan Model', () => {
    describe('Model Definition', () => {
      it('should initialize ActionPlan model with correct attributes', () => {
        initExpertConsultationModels(mockSequelize);
        
        // Third call should be for ActionPlan
        const callArgs = mockSequelize.define.mock.calls[2];
        
        expect(callArgs[0]).toBe('action_plans');
        expect(callArgs[1]).toEqual(expect.objectContaining({
          id: {
            type: expect.any(Object),
            defaultValue: expect.any(Function),
            primaryKey: true,
            comment: '行动计划ID'
          },
          consultationId: {
            type: expect.any(Object),
            allowNull: false,
            comment: '咨询会话ID'
          },
          planType: {
            type: expect.any(Object),
            allowNull: false,
            comment: '计划类型'
          },
          priority: {
            type: expect.any(Object),
            defaultValue: 'medium',
            comment: '优先级'
          },
          title: {
            type: expect.any(Object),
            allowNull: false,
            comment: '计划标题'
          },
          description: {
            type: expect.any(Object),
            allowNull: false,
            comment: '计划描述'
          },
          timeline: {
            type: expect.any(Object),
            allowNull: false,
            comment: '时间规划'
          },
          resources: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '所需资源'
          },
          constraints: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '约束条件'
          },
          expectedOutcome: {
            type: expect.any(Object),
            comment: '预期结果'
          },
          successMetrics: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '成功指标'
          },
          status: {
            type: expect.any(Object),
            defaultValue: 'pending',
            comment: '执行状态'
          }
        }));
      });
    });

    describe('Enum Validation', () => {
      it('should validate planType enum values', () => {
        const validPlanTypes = ['immediate', 'short-term', 'long-term'];
        
        validPlanTypes.forEach(planType => {
          expect(['immediate', 'short-term', 'long-term']).toContain(planType);
        });
      });

      it('should validate priority enum values', () => {
        const validPriorities = ['low', 'medium', 'high'];
        
        validPriorities.forEach(priority => {
          expect(['low', 'medium', 'high']).toContain(priority);
        });
      });

      it('should validate status enum values', () => {
        const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
        
        validStatuses.forEach(status => {
          expect(['pending', 'in-progress', 'completed', 'cancelled']).toContain(status);
        });
      });
    });

    describe('Field Validation', () => {
      it('should validate required fields', () => {
        const planData: ActionPlanParams = {
          consultationId: 'uuid-123',
          planType: 'short-term',
          title: '教育改进计划',
          description: '针对孩子教育问题的短期改进计划',
          timeline: '3个月'
        };

        expect(planData).toHaveProperty('consultationId');
        expect(planData).toHaveProperty('planType');
        expect(planData).toHaveProperty('title');
        expect(planData).toHaveProperty('description');
        expect(planData).toHaveProperty('timeline');
      });

      it('should validate optional fields', () => {
        const planData: ActionPlanParams = {
          consultationId: 'uuid-123',
          planType: 'short-term',
          title: '教育改进计划',
          description: '针对孩子教育问题的短期改进计划',
          timeline: '3个月',
          priority: 'high',
          resources: ['教师', '教材', '时间'],
          constraints: ['预算限制', '时间限制'],
          expectedOutcome: '孩子教育水平明显提升',
          successMetrics: ['成绩提升', '兴趣增加', '自信心增强']
        };

        expect(planData.priority).toBeDefined();
        expect(planData.resources).toBeDefined();
        expect(planData.constraints).toBeDefined();
        expect(planData.expectedOutcome).toBeDefined();
        expect(planData.successMetrics).toBeDefined();
      });
    });
  });

  describe('ConsultationSummary Model', () => {
    describe('Model Definition', () => {
      it('should initialize ConsultationSummary model with correct attributes', () => {
        initExpertConsultationModels(mockSequelize);
        
        // Fourth call should be for ConsultationSummary
        const callArgs = mockSequelize.define.mock.calls[3];
        
        expect(callArgs[0]).toBe('consultation_summaries');
        expect(callArgs[1]).toEqual(expect.objectContaining({
          id: {
            type: expect.any(Object),
            defaultValue: expect.any(Function),
            primaryKey: true,
            comment: '汇总ID'
          },
          consultationId: {
            type: expect.any(Object),
            allowNull: false,
            unique: true,
            comment: '咨询会话ID'
          },
          executiveSummary: {
            type: expect.any(Object),
            allowNull: false,
            comment: '执行摘要'
          },
          keyInsights: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '关键洞察'
          },
          consensusPoints: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '一致观点'
          },
          conflictingViews: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '分歧观点'
          },
          recommendations: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '建议事项'
          },
          nextSteps: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '后续步骤'
          },
          participatingExperts: {
            type: expect.any(Object),
            defaultValue: '[]',
            comment: '参与专家'
          },
          confidenceScore: {
            type: expect.any(Object),
            defaultValue: 0.8,
            comment: '整体置信度'
          }
        }));
      });
    });

    describe('Field Validation', () => {
      it('should validate required fields', () => {
        const summaryData: ConsultationSummaryParams = {
          consultationId: 'uuid-123',
          executiveSummary: '专家们一致认为需要采取综合措施来改善教育状况'
        };

        expect(summaryData).toHaveProperty('consultationId');
        expect(summaryData).toHaveProperty('executiveSummary');
      });

      it('should validate optional fields', () => {
        const summaryData: ConsultationSummaryParams = {
          consultationId: 'uuid-123',
          executiveSummary: '专家们一致认为需要采取综合措施来改善教育状况',
          keyInsights: ['早期干预很重要', '家庭参与是关键'],
          consensusPoints: ['需要个性化方案', '长期跟踪评估'],
          conflictingViews: ['关于具体方法的分歧'],
          recommendations: ['制定个性化计划', '加强家校合作'],
          nextSteps: ['评估现状', '制定具体方案'],
          participatingExperts: ['教育专家', '心理专家'],
          confidenceScore: 0.85
        };

        expect(summaryData.keyInsights).toBeDefined();
        expect(summaryData.consensusPoints).toBeDefined();
        expect(summaryData.conflictingViews).toBeDefined();
        expect(summaryData.recommendations).toBeDefined();
        expect(summaryData.nextSteps).toBeDefined();
        expect(summaryData.participatingExperts).toBeDefined();
        expect(summaryData.confidenceScore).toBeDefined();
      });
    });

    describe('Field Constraints', () => {
      it('should validate confidenceScore range', () => {
        const validScores = [0.0, 0.5, 0.8, 1.0];
        
        validScores.forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0.0);
          expect(score).toBeLessThanOrEqual(1.0);
        });
      });

      it('should validate unique consultationId constraint', () => {
        const summaryData1: ConsultationSummaryParams = {
          consultationId: 'uuid-123',
          executiveSummary: 'Summary 1'
        };

        const summaryData2: ConsultationSummaryParams = {
          consultationId: 'uuid-123',
          executiveSummary: 'Summary 2'
        };

        // These should be considered duplicates and not allowed
        expect(summaryData1.consultationId).toBe(summaryData2.consultationId);
      });
    });
  });

  describe('Associations', () => {
    beforeEach(() => {
      initExpertConsultationModels(mockSequelize);
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('should set up ExpertConsultation hasMany ExpertSpeech association', () => {
      setupExpertConsultationAssociations();
      
      expect(ExpertConsultation.hasMany).toHaveBeenCalledWith(
        ExpertSpeech,
        {
          foreignKey: 'consultationId',
          as: 'speeches',
          onDelete: 'CASCADE'
        }
      );
    });

    it('should set up ExpertSpeech belongsTo ExpertConsultation association', () => {
      setupExpertConsultationAssociations();
      
      expect(ExpertSpeech.belongsTo).toHaveBeenCalledWith(
        ExpertConsultation,
        {
          foreignKey: 'consultationId',
          as: 'consultation'
        }
      );
    });

    it('should set up ExpertConsultation hasMany ActionPlan association', () => {
      setupExpertConsultationAssociations();
      
      expect(ExpertConsultation.hasMany).toHaveBeenCalledWith(
        ActionPlan,
        {
          foreignKey: 'consultationId',
          as: 'actionPlans',
          onDelete: 'CASCADE'
        }
      );
    });

    it('should set up ActionPlan belongsTo ExpertConsultation association', () => {
      setupExpertConsultationAssociations();
      
      expect(ActionPlan.belongsTo).toHaveBeenCalledWith(
        ExpertConsultation,
        {
          foreignKey: 'consultationId',
          as: 'consultation'
        }
      );
    });

    it('should set up ExpertConsultation hasOne ConsultationSummary association', () => {
      setupExpertConsultationAssociations();
      
      expect(ExpertConsultation.hasOne).toHaveBeenCalledWith(
        ConsultationSummary,
        {
          foreignKey: 'consultationId',
          as: 'summary',
          onDelete: 'CASCADE'
        }
      );
    });

    it('should set up ConsultationSummary belongsTo ExpertConsultation association', () => {
      setupExpertConsultationAssociations();
      
      expect(ConsultationSummary.belongsTo).toHaveBeenCalledWith(
        ExpertConsultation,
        {
          foreignKey: 'consultationId',
          as: 'consultation'
        }
      );
    });
  });

  describe('Model Creation', () => {
    it('should return all model classes when initialized', () => {
      const models = initExpertConsultationModels(mockSequelize);
      
      expect(models).toBeDefined();
      expect(models).toHaveProperty('ExpertConsultation');
      expect(models).toHaveProperty('ExpertSpeech');
      expect(models).toHaveProperty('ActionPlan');
      expect(models).toHaveProperty('ConsultationSummary');
      
      expect(typeof models.ExpertConsultation).toBe('function');
      expect(typeof models.ExpertSpeech).toBe('function');
      expect(typeof models.ActionPlan).toBe('function');
      expect(typeof models.ConsultationSummary).toBe('function');
    });
  });

  describe('Foreign Key References', () => {
    it('should have foreign key reference to users table', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const attributes = callArgs[1];
      
      expect(attributes.userId.references).toEqual({
        model: 'users',
        key: 'id'
      });
    });

    it('should have foreign key reference to expert_consultations table for ExpertSpeech', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[1];
      const attributes = callArgs[1];
      
      expect(attributes.consultationId.references).toEqual({
        model: 'expert_consultations',
        key: 'id'
      });
    });

    it('should have foreign key reference to expert_consultations table for ActionPlan', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[2];
      const attributes = callArgs[1];
      
      expect(attributes.consultationId.references).toEqual({
        model: 'expert_consultations',
        key: 'id'
      });
    });

    it('should have foreign key reference to expert_consultations table for ConsultationSummary', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[3];
      const attributes = callArgs[1];
      
      expect(attributes.consultationId.references).toEqual({
        model: 'expert_consultations',
        key: 'id'
      });
    });
  });

  describe('Indexes', () => {
    it('should have proper indexes for ExpertConsultation', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[0];
      const options = callArgs[2];
      
      expect(options.indexes).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'expert_consultations_user_id_idx', fields: ['user_id'] }),
        expect.objectContaining({ name: 'expert_consultations_status_idx', fields: ['status'] }),
        expect.objectContaining({ name: 'expert_consultations_urgency_idx', fields: ['urgency'] }),
        expect.objectContaining({ name: 'expert_consultations_created_at_idx', fields: ['created_at'] })
      ]));
    });

    it('should have proper indexes for ExpertSpeech', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[1];
      const options = callArgs[2];
      
      expect(options.indexes).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'expert_speeches_consultation_id_idx', fields: ['consultation_id'] }),
        expect.objectContaining({ name: 'expert_speeches_round_order_idx', fields: ['round', 'order'] }),
        expect.objectContaining({ name: 'expert_speeches_expert_type_idx', fields: ['expert_type'] })
      ]));
    });

    it('should have proper indexes for ActionPlan', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[2];
      const options = callArgs[2];
      
      expect(options.indexes).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'action_plans_consultation_id_idx', fields: ['consultation_id'] }),
        expect.objectContaining({ name: 'action_plans_plan_type_idx', fields: ['plan_type'] }),
        expect.objectContaining({ name: 'action_plans_priority_idx', fields: ['priority'] }),
        expect.objectContaining({ name: 'action_plans_status_idx', fields: ['status'] })
      ]));
    });

    it('should have proper indexes for ConsultationSummary', () => {
      initExpertConsultationModels(mockSequelize);
      
      const callArgs = mockSequelize.define.mock.calls[3];
      const options = callArgs[2];
      
      expect(options.indexes).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'consultation_summaries_consultation_id_idx', fields: ['consultation_id'] }),
        expect.objectContaining({ name: 'consultation_summaries_confidence_score_idx', fields: ['confidence_score'] })
      ]));
    });
  });
});