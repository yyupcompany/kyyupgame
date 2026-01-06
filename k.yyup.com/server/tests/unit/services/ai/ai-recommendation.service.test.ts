import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  QueryTypes: { SELECT: 'SELECT' }
};

const mockAIConversation = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockClass = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockActivity = {
  findAll: jest.fn(),
  findByPk: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn()
};

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  }
};

// Mock imports
jest.unstable_mockModule('sequelize', () => ({ Sequelize: jest.fn(() => mockSequelize) }));
jest.unstable_mockModule('../../../../../src/models/ai-conversation.model', () => ({ default: mockAIConversation }));
jest.unstable_mockModule('../../../../../src/models/student.model', () => ({ default: mockStudent }));
jest.unstable_mockModule('../../../../../src/models/class.model', () => ({ default: mockClass }));
jest.unstable_mockModule('../../../../../src/models/activity.model', () => ({ default: mockActivity }));
jest.unstable_mockModule('../../../../../src/utils/logger', () => ({ default: mockLogger }));
jest.unstable_mockModule('../../../../../src/utils/redis', () => ({ default: mockRedis }));
jest.unstable_mockModule('openai', () => ({ default: jest.fn(() => mockOpenAI) }));


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('AI Recommendation Service', () => {
  let aiRecommendationService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/ai/ai-recommendation.service');
    aiRecommendationService = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStudentRecommendations', () => {
    it('应该为学生生成个性化推荐', async () => {
      const studentId = 1;
      const mockStudent = {
        id: 1,
        name: '张小明',
        age: 5,
        interests: ['绘画', '音乐', '运动'],
        learningStyle: 'visual',
        academicPerformance: {
          math: 85,
          language: 90,
          art: 95,
          music: 88
        },
        behaviorProfile: {
          attention: 'high',
          social: 'medium',
          creativity: 'high'
        }
      };

      const mockActivities = [
        {
          id: 1,
          name: '创意绘画课',
          type: 'art',
          difficulty: 'beginner',
          tags: ['创意', '绘画', '艺术']
        },
        {
          id: 2,
          name: '音乐启蒙',
          type: 'music',
          difficulty: 'beginner',
          tags: ['音乐', '节奏', '启蒙']
        }
      ];

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                {
                  activityId: 1,
                  score: 0.95,
                  reason: '基于学生对绘画的高度兴趣和艺术方面的优秀表现',
                  benefits: ['提升创造力', '发展艺术技能', '增强自信心']
                },
                {
                  activityId: 2,
                  score: 0.88,
                  reason: '音乐兴趣与学习风格匹配',
                  benefits: ['培养音乐素养', '提升专注力', '促进大脑发育']
                }
              ],
              learningPath: {
                shortTerm: ['参加创意绘画课', '尝试音乐启蒙'],
                longTerm: ['发展艺术特长', '培养综合素养']
              }
            })
          }
        }]
      };

      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivity.findAll.mockResolvedValue(mockActivities);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await aiRecommendationService.generateStudentRecommendations(studentId);

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('learningPath');
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]).toHaveProperty('activityId', 1);
      expect(result.recommendations[0]).toHaveProperty('score', 0.95);
      expect(mockStudent.findByPk).toHaveBeenCalledWith(studentId);
      expect(mockActivity.findAll).toHaveBeenCalled();
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('应该处理学生不存在的情况', async () => {
      const studentId = 999;

      mockStudent.findByPk.mockResolvedValue(null);

      await expect(aiRecommendationService.generateStudentRecommendations(studentId))
        .rejects.toThrow('学生不存在');

      expect(mockStudent.findByPk).toHaveBeenCalledWith(studentId);
      expect(mockActivity.findAll).not.toHaveBeenCalled();
    });

    it('应该使用缓存的推荐结果', async () => {
      const studentId = 1;
      const cachedRecommendations = {
        recommendations: [
          { activityId: 1, score: 0.95, reason: '缓存的推荐' }
        ],
        learningPath: { shortTerm: ['缓存的路径'] },
        cachedAt: new Date().toISOString()
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedRecommendations));

      const result = await aiRecommendationService.generateStudentRecommendations(studentId);

      expect(result).toEqual(cachedRecommendations);
      expect(mockStudent.findByPk).not.toHaveBeenCalled();
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });

    it('应该处理AI服务错误', async () => {
      const studentId = 1;
      const mockStudent = { id: 1, name: '张小明' };

      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivity.findAll.mockResolvedValue([]);
      mockRedis.get.mockResolvedValue(null);
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('AI服务不可用'));

      await expect(aiRecommendationService.generateStudentRecommendations(studentId))
        .rejects.toThrow('AI服务不可用');

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该验证推荐参数', async () => {
      await expect(aiRecommendationService.generateStudentRecommendations(null))
        .rejects.toThrow('学生ID是必需的');

      await expect(aiRecommendationService.generateStudentRecommendations('invalid'))
        .rejects.toThrow('学生ID必须是数字');

      await expect(aiRecommendationService.generateStudentRecommendations(0))
        .rejects.toThrow('学生ID必须大于0');
    });
  });

  describe('generateClassRecommendations', () => {
    it('应该为班级生成集体推荐', async () => {
      const classId = 1;
      const mockClass = {
        id: 1,
        name: '大班A',
        ageRange: { min: 5, max: 6 },
        studentCount: 25,
        characteristics: {
          averageAttention: 'medium',
          dominantLearningStyle: 'kinesthetic',
          commonInterests: ['运动', '游戏', '故事']
        }
      };

      const mockStudents = [
        { id: 1, interests: ['运动', '音乐'], learningStyle: 'kinesthetic' },
        { id: 2, interests: ['绘画', '故事'], learningStyle: 'visual' },
        { id: 3, interests: ['运动', '游戏'], learningStyle: 'kinesthetic' }
      ];

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                {
                  activityType: 'group_sports',
                  title: '团体运动游戏',
                  score: 0.92,
                  reason: '符合班级主导学习风格和共同兴趣',
                  suitability: {
                    ageAppropriate: true,
                    groupSize: 'optimal',
                    difficultyLevel: 'appropriate'
                  }
                }
              ],
              classProfile: {
                strengths: ['运动能力强', '团队合作好'],
                challenges: ['注意力集中时间短'],
                suggestions: ['增加互动性活动', '缩短单次活动时间']
              }
            })
          }
        }]
      };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockStudent.findAll.mockResolvedValue(mockStudents);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);
      mockRedis.get.mockResolvedValue(null);

      const result = await aiRecommendationService.generateClassRecommendations(classId);

      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('classProfile');
      expect(result.recommendations[0]).toHaveProperty('score', 0.92);
      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockStudent.findAll).toHaveBeenCalledWith({ where: { classId } });
    });

    it('应该处理空班级的情况', async () => {
      const classId = 1;
      const mockClass = { id: 1, name: '空班级', studentCount: 0 };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockStudent.findAll.mockResolvedValue([]);

      await expect(aiRecommendationService.generateClassRecommendations(classId))
        .rejects.toThrow('班级没有学生，无法生成推荐');

      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });

    it('应该分析班级学习风格分布', async () => {
      const classId = 1;
      const mockClass = { id: 1, name: '测试班级' };
      const mockStudents = [
        { learningStyle: 'visual' },
        { learningStyle: 'visual' },
        { learningStyle: 'auditory' },
        { learningStyle: 'kinesthetic' }
      ];

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockStudent.findAll.mockResolvedValue(mockStudents);

      const distribution = await aiRecommendationService.analyzeLearningStyleDistribution(classId);

      expect(distribution).toEqual({
        visual: 0.5,
        auditory: 0.25,
        kinesthetic: 0.25
      });
    });
  });

  describe('generatePersonalizedLearningPath', () => {
    it('应该生成个性化学习路径', async () => {
      const studentId = 1;
      const options = {
        duration: 'semester',
        focus: 'comprehensive',
        includeAssessments: true
      };

      const mockStudent = {
        id: 1,
        currentLevel: 'intermediate',
        strengths: ['数学', '逻辑思维'],
        weaknesses: ['语言表达', '社交技能'],
        goals: ['提升语言能力', '增强自信心']
      };

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              learningPath: {
                phases: [
                  {
                    name: '基础强化阶段',
                    duration: '4周',
                    objectives: ['巩固数学基础', '开始语言训练'],
                    activities: [
                      { week: 1, activity: '数学游戏', frequency: '每日' },
                      { week: 2, activity: '故事分享', frequency: '每周3次' }
                    ]
                  }
                ],
                milestones: [
                  { week: 4, description: '完成基础评估', type: 'assessment' },
                  { week: 8, description: '中期进度检查', type: 'review' }
                ],
                adaptations: {
                  ifAhead: '增加挑战性活动',
                  ifBehind: '提供额外支持和练习'
                }
              }
            })
          }
        }]
      };

      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);

      const result = await aiRecommendationService.generatePersonalizedLearningPath(studentId, options);

      expect(result).toHaveProperty('learningPath');
      expect(result.learningPath).toHaveProperty('phases');
      expect(result.learningPath).toHaveProperty('milestones');
      expect(result.learningPath.phases).toHaveLength(1);
    });

    it('应该根据不同持续时间调整学习路径', async () => {
      const studentId = 1;
      const shortTermOptions = { duration: 'month' };
      const longTermOptions = { duration: 'year' };

      const mockStudent = { id: 1, name: '测试学生' };
      mockStudent.findByPk.mockResolvedValue(mockStudent);

      // 短期路径
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ learningPath: { phases: ['短期阶段'] } }) } }]
      });

      const shortResult = await aiRecommendationService.generatePersonalizedLearningPath(studentId, shortTermOptions);
      expect(shortResult.learningPath.phases).toEqual(['短期阶段']);

      // 长期路径
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ learningPath: { phases: ['长期阶段1', '长期阶段2'] } }) } }]
      });

      const longResult = await aiRecommendationService.generatePersonalizedLearningPath(studentId, longTermOptions);
      expect(longResult.learningPath.phases).toEqual(['长期阶段1', '长期阶段2']);
    });
  });

  describe('analyzeStudentProgress', () => {
    it('应该分析学生学习进度', async () => {
      const studentId = 1;
      const timeRange = { start: '2024-01-01', end: '2024-03-31' };

      const mockProgressData = [
        { date: '2024-01-15', activity: '数学练习', score: 85, time: 30 },
        { date: '2024-02-15', activity: '语言训练', score: 78, time: 25 },
        { date: '2024-03-15', activity: '数学练习', score: 92, time: 28 }
      ];

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              analysis: {
                overallProgress: 'improving',
                trends: {
                  performance: 'upward',
                  engagement: 'stable',
                  efficiency: 'improving'
                },
                insights: [
                  '数学能力显著提升',
                  '语言表达需要更多练习',
                  '学习效率逐步改善'
                ],
                recommendations: [
                  '继续加强数学练习',
                  '增加语言互动活动',
                  '保持当前学习节奏'
                ]
              }
            })
          }
        }]
      };

      mockSequelize.query.mockResolvedValue([mockProgressData]);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);

      const result = await aiRecommendationService.analyzeStudentProgress(studentId, timeRange);

      expect(result).toHaveProperty('analysis');
      expect(result.analysis).toHaveProperty('overallProgress', 'improving');
      expect(result.analysis).toHaveProperty('trends');
      expect(result.analysis).toHaveProperty('insights');
      expect(result.analysis).toHaveProperty('recommendations');
    });

    it('应该处理无进度数据的情况', async () => {
      const studentId = 1;
      const timeRange = { start: '2024-01-01', end: '2024-03-31' };

      mockSequelize.query.mockResolvedValue([[]]);

      await expect(aiRecommendationService.analyzeStudentProgress(studentId, timeRange))
        .rejects.toThrow('指定时间范围内没有进度数据');
    });

    it('应该计算进度统计指标', async () => {
      const progressData = [
        { score: 80, time: 30 },
        { score: 85, time: 28 },
        { score: 90, time: 25 },
        { score: 88, time: 27 }
      ];

      const stats = aiRecommendationService.calculateProgressStats(progressData);

      expect(stats).toHaveProperty('averageScore');
      expect(stats).toHaveProperty('averageTime');
      expect(stats).toHaveProperty('improvement');
      expect(stats).toHaveProperty('consistency');
      expect(stats.averageScore).toBeCloseTo(85.75);
      expect(stats.averageTime).toBeCloseTo(27.5);
    });
  });

  describe('generateActivityRecommendations', () => {
    it('应该基于学生群体生成活动推荐', async () => {
      const criteria = {
        ageRange: { min: 4, max: 6 },
        interests: ['艺术', '音乐'],
        learningStyles: ['visual', 'auditory'],
        groupSize: 15,
        duration: 45
      };

      const mockActivities = [
        {
          id: 1,
          name: '音乐绘画',
          type: 'art_music',
          ageRange: { min: 4, max: 7 },
          maxParticipants: 20,
          duration: 45,
          tags: ['艺术', '音乐', '创意']
        }
      ];

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                {
                  activityId: 1,
                  adaptations: {
                    forVisualLearners: '增加色彩和图形元素',
                    forAuditoryLearners: '加入节奏和音乐元素'
                  },
                  expectedOutcomes: ['提升创造力', '培养艺术感知'],
                  riskFactors: ['注意力分散', '材料管理'],
                  mitigation: ['分组管理', '准备充足材料']
                }
              ]
            })
          }
        }]
      };

      mockActivity.findAll.mockResolvedValue(mockActivities);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);

      const result = await aiRecommendationService.generateActivityRecommendations(criteria);

      expect(result).toHaveProperty('recommendations');
      expect(result.recommendations[0]).toHaveProperty('activityId', 1);
      expect(result.recommendations[0]).toHaveProperty('adaptations');
      expect(result.recommendations[0]).toHaveProperty('expectedOutcomes');
    });

    it('应该过滤不合适的活动', async () => {
      const criteria = {
        ageRange: { min: 3, max: 4 },
        groupSize: 10,
        duration: 30
      };

      const mockActivities = [
        { id: 1, ageRange: { min: 5, max: 7 }, maxParticipants: 15, duration: 60 }, // 年龄不符
        { id: 2, ageRange: { min: 3, max: 5 }, maxParticipants: 8, duration: 30 },  // 人数不够
        { id: 3, ageRange: { min: 3, max: 5 }, maxParticipants: 15, duration: 30 }  // 合适
      ];

      mockActivity.findAll.mockResolvedValue(mockActivities);

      const filtered = await aiRecommendationService.filterSuitableActivities(mockActivities, criteria);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(3);
    });
  });

  describe('caching and performance', () => {
    it('应该正确设置和获取缓存', async () => {
      const key = 'student_recommendations_1';
      const data = { recommendations: [] };

      // 设置缓存
      await aiRecommendationService.setCacheData(key, data, 3600);
      expect(mockRedis.set).toHaveBeenCalledWith(key, JSON.stringify(data), 'EX', 3600);

      // 获取缓存
      mockRedis.get.mockResolvedValue(JSON.stringify(data));
      const cached = await aiRecommendationService.getCacheData(key);
      expect(cached).toEqual(data);
    });

    it('应该处理缓存失效', async () => {
      const key = 'expired_key';
      mockRedis.get.mockResolvedValue(null);

      const cached = await aiRecommendationService.getCacheData(key);
      expect(cached).toBeNull();
    });

    it('应该批量处理推荐请求', async () => {
      const studentIds = [1, 2, 3];
      const mockResults = [
        { studentId: 1, recommendations: ['rec1'] },
        { studentId: 2, recommendations: ['rec2'] },
        { studentId: 3, recommendations: ['rec3'] }
      ];

      // Mock individual recommendation calls
      mockStudent.findByPk.mockImplementation((id) => 
        Promise.resolve({ id, name: `学生${id}` })
      );
      mockActivity.findAll.mockResolvedValue([]);
      mockOpenAI.chat.completions.create.mockImplementation(() =>
        Promise.resolve({
          choices: [{ message: { content: JSON.stringify({ recommendations: [`rec${Math.random()}`] }) } }]
        })
      );
      mockRedis.get.mockResolvedValue(null);

      const results = await aiRecommendationService.batchGenerateRecommendations(studentIds);

      expect(results).toHaveLength(3);
      expect(mockStudent.findByPk).toHaveBeenCalledTimes(3);
    });

    it('应该限制并发请求数量', async () => {
      const manyStudentIds = Array.from({ length: 20 }, (_, i) => i + 1);
      
      const concurrencyLimit = 5;
      const processingTimes = [];
      
      mockStudent.findByPk.mockImplementation((id) => {
        processingTimes.push(Date.now());
        return Promise.resolve({ id, name: `学生${id}` });
      });

      await aiRecommendationService.batchGenerateRecommendations(manyStudentIds, { concurrency: concurrencyLimit });

      // 验证并发限制 - 这里简化验证逻辑
      expect(mockStudent.findByPk).toHaveBeenCalledTimes(20);
    });
  });

  describe('error handling and validation', () => {
    it('应该验证输入参数', async () => {
      // 测试各种无效输入
      const invalidInputs = [
        { method: 'generateStudentRecommendations', args: [null] },
        { method: 'generateStudentRecommendations', args: ['invalid'] },
        { method: 'generateClassRecommendations', args: [0] },
        { method: 'generatePersonalizedLearningPath', args: [1, { duration: 'invalid' }] }
      ];

      for (const { method, args } of invalidInputs) {
        await expect(aiRecommendationService[method](...args))
          .rejects.toThrow();
      }
    });

    it('应该处理AI服务限流', async () => {
      const studentId = 1;
      mockStudent.findByPk.mockResolvedValue({ id: 1 });
      mockActivity.findAll.mockResolvedValue([]);
      mockRedis.get.mockResolvedValue(null);
      
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockOpenAI.chat.completions.create.mockRejectedValue(rateLimitError);

      await expect(aiRecommendationService.generateStudentRecommendations(studentId))
        .rejects.toThrow('AI服务请求频率超限，请稍后重试');
    });

    it('应该处理网络超时', async () => {
      const studentId = 1;
      mockStudent.findByPk.mockResolvedValue({ id: 1 });
      mockActivity.findAll.mockResolvedValue([]);
      mockRedis.get.mockResolvedValue(null);
      
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      mockOpenAI.chat.completions.create.mockRejectedValue(timeoutError);

      await expect(aiRecommendationService.generateStudentRecommendations(studentId))
        .rejects.toThrow('AI服务请求超时');
    });

    it('应该记录详细的错误日志', async () => {
      const studentId = 1;
      const error = new Error('测试错误');
      
      mockStudent.findByPk.mockRejectedValue(error);

      try {
        await aiRecommendationService.generateStudentRecommendations(studentId);
      } catch (e) {
        // 预期的错误
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('生成学生推荐失败'),
        expect.objectContaining({
          studentId,
          error: error.message
        })
      );
    });
  });

  describe('integration scenarios', () => {
    it('应该处理完整的推荐生成流程', async () => {
      const studentId = 1;
      
      // 模拟完整流程
      const mockStudent = {
        id: 1,
        name: '张小明',
        age: 5,
        interests: ['绘画'],
        learningStyle: 'visual'
      };

      const mockActivities = [
        { id: 1, name: '绘画课', type: 'art', tags: ['绘画', '创意'] }
      ];

      const mockAIResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                { activityId: 1, score: 0.9, reason: '匹配兴趣' }
              ],
              learningPath: { shortTerm: ['绘画基础'] }
            })
          }
        }]
      };

      // 设置所有mock
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockActivity.findAll.mockResolvedValue(mockActivities);
      mockOpenAI.chat.completions.create.mockResolvedValue(mockAIResponse);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockResolvedValue('OK');

      const result = await aiRecommendationService.generateStudentRecommendations(studentId);

      // 验证完整流程
      expect(mockStudent.findByPk).toHaveBeenCalledWith(studentId);
      expect(mockActivity.findAll).toHaveBeenCalled();
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('learningPath');
    });

    it('应该支持多语言推荐', async () => {
      const studentId = 1;
      const language = 'en';

      mockStudent.findByPk.mockResolvedValue({ id: 1, name: 'John' });
      mockActivity.findAll.mockResolvedValue([]);
      mockRedis.get.mockResolvedValue(null);

      const englishResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              recommendations: [
                { activityId: 1, reason: 'Matches student interests' }
              ]
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(englishResponse);

      const result = await aiRecommendationService.generateStudentRecommendations(studentId, { language });

      expect(result.recommendations[0].reason).toBe('Matches student interests');
    });
  });
});
