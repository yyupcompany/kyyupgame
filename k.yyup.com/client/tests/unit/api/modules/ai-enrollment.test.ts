
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { 
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

describe, it, expect, vi, beforeEach } from 'vitest';
import * as aiEnrollmentApi from '@/api/modules/ai-enrollment';
import { get, post, put, del } from '@/utils/request';
import { createValidator } from '../../../utils/data-validation';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// Mock the request module
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}));

vi.mock('@/api/endpoints', () => ({
  API_PREFIX: '/api/v1'
}));

const mockedGet = vi.mocked(get);
const mockedPost = vi.mocked(post);
const mockedPut = vi.mocked(put);
const mockedDel = vi.mocked(del);

// 创建AI招生数据验证器
const aiForecastValidator = createValidator<any>({
  requiredFields: ['planId', 'timeHorizon', 'predictions', 'generatedAt'],
  fieldTypes: {
    planId: 'string',
    timeHorizon: 'string',
    generatedAt: 'string'
  }
});

describe('AI Enrollment API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AI Enrollment Forecast API', () => {
    describe('generateForecast', () => {
      it('should generate enrollment forecast with all parameters', async () => {
        const mockParams = {
          planId: 'plan-123',
          timeHorizon: '6months',
          includeExternalFactors: true,
          includeSeasonality: true,
          includeCompetitorAnalysis: true,
          modelVersion: 'v2.0'
        };
        const mockResponse = {
          success: true,
          data: {
            planId: 'plan-123',
            timeHorizon: '6months',
            predictions: {
              totalApplications: { value: 150, confidence: 85 },
              expectedEnrollments: { value: 120, confidence: 80 }
            },
            factors: [],
            scenarios: [],
            recommendations: [],
            generatedAt: '2024-01-01T10:00:00Z',
            modelVersion: 'v2.0'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiEnrollmentApi.generateForecast(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/enrollment-forecast', mockParams);
        expect(result).toEqual(mockResponse);

        // ✅ 数据结构验证
        if (result.data) {
          const validation = aiForecastValidator.validateSingle({ data: result.data });
          expect(validation.valid).toBe(true);
        }

        // ✅ 控制台错误检查
        expectNoConsoleErrors();
      });

      it('should generate enrollment forecast with minimal parameters', async () => {
        const mockParams = {
          planId: 'plan-123',
          timeHorizon: '3months'
        };
        const mockResponse = { success: true, data: {} };
        mockedPost.mockResolvedValue(mockResponse);

        await aiEnrollmentApi.aiEnrollmentApi.generateForecast(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/enrollment-forecast', mockParams);
      });
    });

    describe('getForecastAccuracy', () => {
      it('should get forecast accuracy with time range', async () => {
        const mockParams = {
          timeRange: '6months',
          planIds: ['plan-123', 'plan-456']
        };
        const mockResponse = {
          success: true,
          data: [
            {
              date: '2024-01-01',
              accuracy: 85.5,
              planName: 'Spring 2024',
              actualVsPredicted: {
                predicted: 150,
                actual: 145,
                variance: 5
              }
            }
          ]
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiEnrollmentApi.getForecastAccuracy(mockParams);

        expect(mockedGet).toHaveBeenCalledWith('/api/v1/ai/forecast-accuracy', { params: mockParams });
        expect(result).toEqual(mockResponse);

        // ✅ 控制台错误检查
        expectNoConsoleErrors();
      });

      it('should get forecast accuracy without parameters', async () => {
        const mockResponse = { success: true, data: [] };
        mockedGet.mockResolvedValue(mockResponse);

        await aiEnrollmentApi.aiEnrollmentApi.getForecastAccuracy();

        expect(mockedGet).toHaveBeenCalledWith('/api/v1/ai/forecast-accuracy', { params: undefined });
      });
    });

    describe('analyzeCompetitors', () => {
      it('should analyze competitors with all parameters', async () => {
        const mockParams = {
          radius: '5km',
          includeOnlineCompetitors: true,
          analyzePricing: true,
          analyzeServices: true,
          includeReviews: true
        };
        const mockResponse = {
          success: true,
          data: {
            competitors: [
              {
                name: 'Competitor A',
                distance: '2km',
                pricing: 3000,
                strengths: ['Good facilities'],
                weaknesses: ['High price'],
                marketShare: 25
              }
            ],
            marketPosition: {
              rank: 2,
              score: 8.5,
              advantages: ['Better pricing'],
              threats: ['Strong competition']
            },
            pricingBenchmark: {
              average: 2800,
              range: { min: 2000, max: 3500 },
              recommendation: 'Competitive pricing'
            }
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiEnrollmentApi.analyzeCompetitors(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/competitor-analysis', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('generatePricingRecommendations', () => {
      it('should generate pricing recommendations', async () => {
        const mockParams = {
          currentPricing: {
            tuition: 2500,
            fees: {
              registration: 500,
              materials: 300,
              meals: 400
            },
            discounts: {
              earlyBird: 200,
              sibling: 300
            }
          },
          marketConditions: {
            economicIndicators: {
              gdpGrowth: 3.5,
              inflation: 2.1,
              unemployment: 4.2
            },
            localFactors: {
              populationGrowth: 2.0,
              competitorCount: 5,
              averageIncome: 8000
            },
            seasonality: {
              peakMonths: ['March', 'April'],
              lowMonths: ['December', 'January']
            }
          },
          demandForecast: {
            projectedDemand: 120,
            confidence: 85,
            factors: {
              demographic: 0.6,
              economic: 0.3,
              competitive: 0.1
            }
          },
          competitorPricing: {
            competitors: [],
            averagePrice: 2800,
            priceRange: { min: 2000, max: 3500 },
            positioningStrategy: 'competitive'
          }
        };
        const mockResponse = {
          success: true,
          data: {
            currentPricing: 2500,
            recommendedPricing: 2700,
            adjustmentReason: 'Market analysis suggests price increase',
            expectedImpact: {
              demandChange: -5,
              revenueChange: 8,
              competitivenessChange: -2
            },
            strategies: [
              {
                name: 'Gradual increase',
                description: 'Increase price by 8% over 6 months',
                implementation: 'Phase 1: +4% in March, Phase 2: +4% in September'
              }
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiEnrollmentApi.generatePricingRecommendations(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/dynamic-pricing', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Funnel Analytics API', () => {
    describe('analyzeFunnel', () => {
      it('should analyze funnel with all parameters', async () => {
        const mockParams = {
          timeRange: '6months',
          includeAttributionAnalysis: true,
          includeSeasonalFactors: true,
          includeChannelBreakdown: true
        };
        const mockResponse = {
          success: true,
          data: {
            insights: [
              {
                id: 'insight-1',
                title: 'High drop-off at application stage',
                description: '60% of users drop off at application stage',
                type: 'warning',
                impact: 85,
                potential: 95,
                actionable: true
              }
            ],
            optimizations: [
              {
                stage: 'application',
                currentRate: 40,
                targetRate: 70,
                bottlenecks: [
                  {
                    id: 'bottleneck-1',
                    name: 'Complex form',
                    severity: 'high',
                    impact: 25
                  }
                ],
                recommendations: [
                  {
                    id: 'rec-1',
                    text: 'Simplify application form',
                    priority: 'high',
                    expectedImpact: 20,
                    implementationCost: 'low'
                  }
                ]
              }
            ],
            testRecommendations: [
              {
                id: 'test-1',
                title: 'Form layout A/B test',
                description: 'Test simplified vs detailed form',
                priority: 'high',
                estimatedDuration: '2 weeks',
                requiredSampleSize: 1000,
                expectedImprovement: 15,
                variants: [
                  { name: 'Simple Form', description: 'Minimal required fields' },
                  { name: 'Detailed Form', description: 'Complete information' }
                ]
              }
            ],
            funnelData: [
              { stage: 'awareness', value: 1000, rate: 100 },
              { stage: 'interest', value: 600, rate: 60 },
              { stage: 'application', value: 240, rate: 40 },
              { stage: 'enrollment', value: 120, rate: 50 }
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.funnelAnalyticsApi.analyzeFunnel(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/funnel-analysis', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('createABTest', () => {
      it('should create A/B test', async () => {
        const mockData = {
          name: 'Application Form Test',
          description: 'Test simplified vs detailed application form',
          variants: {
            A: { name: 'Simple Form', description: 'Minimal fields' },
            B: { name: 'Detailed Form', description: 'Complete information' }
          },
          trafficSplit: 50,
          successMetric: 'completion_rate',
          minimumDetectableEffect: 10,
          confidence: 95
        };
        const mockResponse = {
          success: true,
          data: {
            id: 'test-123',
            name: 'Application Form Test',
            status: 'draft',
            variants: mockData.variants,
            trafficSplit: 50,
            successMetric: 'completion_rate',
            minimumDetectableEffect: 10,
            confidence: 95
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.funnelAnalyticsApi.createABTest(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/enrollment/ab-test/create', mockData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getActiveTests', () => {
      it('should get active A/B tests', async () => {
        const mockResponse = {
          success: true,
          data: [
            {
              id: 'test-123',
              name: 'Form Test',
              status: 'running',
              variants: {
                A: { name: 'Simple', conversionRate: 65 },
                B: { name: 'Detailed', conversionRate: 58 }
              }
            }
          ]
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.funnelAnalyticsApi.getActiveTests();

        expect(mockedGet).toHaveBeenCalledWith('/api/v1/enrollment/ab-test/active');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('concludeTest', () => {
      it('should conclude A/B test', async () => {
        const mockResponse = {
          success: true,
          data: {
            id: 'test-123',
            results: {
              winner: 'A',
              significance: 95,
              improvement: 12
            }
          }
        };

        mockedPut.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.funnelAnalyticsApi.concludeTest('test-123');

        expect(mockedPut).toHaveBeenCalledWith('/api/v1/enrollment/ab-test/test-123/conclude');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('implementOptimization', () => {
      it('should implement optimization', async () => {
        const mockData = {
          recommendationId: 'rec-123',
          implementationType: 'gradual',
          rolloutPercentage: 20
        };
        const mockResponse = { success: true, data: { implemented: true } };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.funnelAnalyticsApi.implementOptimization(mockData);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/enrollment/implement-optimization', mockData);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Personalized Strategy API', () => {
    describe('performSegmentation', () => {
      it('should perform customer segmentation with all parameters', async () => {
        const mockParams = {
          dataSource: 'comprehensive',
          segmentationMethod: 'advanced_clustering',
          includeExternalData: true,
          validateSegments: true
        };
        const mockResponse = {
          success: true,
          data: {
            segments: [
              {
                id: 'segment-1',
                name: 'High-Income Families',
                characteristics: {
                  demographics: {
                    ageRange: '30-45',
                    incomeLevel: 'high',
                    education: 'bachelor+',
                    location: 'urban'
                  },
                  psychographics: {
                    values: 'education-focused',
                    concerns: 'quality',
                    lifestyle: 'busy',
                    motivation: 'career advancement'
                  }
                },
                size: 150,
                conversionPotential: 85,
                lifetimeValue: 50000
              }
            ],
            segmentationQuality: {
              score: 0.85,
              silhouetteScore: 0.72,
              withinClusterSum: 1250
            }
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.personalizedStrategyApi.performSegmentation(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/customer-segmentation', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('generateStrategies', () => {
      it('should generate personalized strategies', async () => {
        const mockParams = {
          segments: [
            {
              id: 'segment-1',
              name: 'High-Income Families',
              characteristics: { demographics: {}, psychographics: {} },
              size: 150,
              conversionPotential: 85
            }
          ],
          businessGoals: { targetEnrollment: 200, revenueTarget: 1000000 },
          resourceConstraints: { budget: 50000, staffCount: 10 },
          competitorActivity: { newCompetitors: 2, priceChanges: [] }
        };
        const mockResponse = {
          success: true,
          data: {
            strategies: [
              {
                id: 'strategy-1',
                targetSegment: mockParams.segments[0],
                recommendedChannels: [
                  { id: 'channel-1', name: 'Premium Schools Magazine', effectiveness: 85 }
                ],
                messagingStrategy: {
                  coreValue: 'Excellence in Education',
                  tone: 'professional',
                  keywords: ['premium', 'excellence', 'future'],
                  emotionalTriggers: ['aspiration', 'security']
                },
                pricingStrategy: {
                  recommendedPrice: 3500,
                  strategy: 'premium',
                  priceSensitivity: 0.3,
                  bundlingOptions: ['premium+care']
                },
                expectedOutcomes: {
                  leads: 80,
                  conversions: 60,
                  revenue: 210000,
                  roi: 4.2
                },
                matchScore: 92
              }
            ],
            overallRecommendations: [
              'Focus on premium positioning for high-income segment',
              'Leverage educational excellence messaging'
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.personalizedStrategyApi.generateStrategies(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/personalized-strategies', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('generateContent', () => {
      it('should generate personalized content', async () => {
        const mockParams = {
          segmentId: 'segment-1',
          contentType: 'email',
          tone: 'professional',
          includeEmotionalTriggers: true,
          optimizeForAction: true
        };
        const mockResponse = {
          success: true,
          data: {
            content: 'Dear Parent, Discover excellence in education at our kindergarten...',
            contentType: 'email',
            personalizationScore: 92,
            expectedEngagement: 85,
            keyMessages: [
              'Excellence in early childhood education',
              'Premium learning environment',
              'Future-ready curriculum'
            ],
            callToAction: 'Schedule a tour today'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.personalizedStrategyApi.generateContent(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/personalized-content', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('implementStrategy', () => {
      it('should implement personalized strategy', async () => {
        const mockParams = {
          strategyId: 'strategy-123',
          implementationPlan: { phases: ['launch', 'monitor', 'optimize'] },
          trackingParameters: { metrics: ['clicks', 'conversions', 'revenue'] }
        };
        const mockResponse = { success: true, data: { implemented: true } };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.personalizedStrategyApi.implementStrategy(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/enrollment/implement-strategy', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Automated Follow-up API', () => {
    describe('scheduleFollowUp', () => {
      it('should schedule intelligent follow-up with all parameters', async () => {
        const mockParams = {
          leadId: 'lead-123',
          includePersonalityProfile: true,
          includeCommunicationHistory: true,
          includeEngagementPattern: true,
          optimizeForConversion: true
        };
        const mockResponse = {
          success: true,
          data: {
            leadId: 'lead-123',
            leadName: 'John Doe',
            leadPhone: '1234567890',
            stage: {
              name: 'Application Submitted',
              progress: 60,
              timeInStage: 2,
              typicalDuration: 5,
              nextStages: ['Review', 'Decision'],
              exitRisk: 15
            },
            nextAction: {
              type: 'call',
              title: 'Follow-up Call',
              description: 'Discuss application details and answer questions',
              priority: 'high'
            },
            scheduledTime: '2024-01-02T14:00:00Z',
            personalizedMessage: 'Hi John, following up on your application...',
            channel: {
              name: 'Phone Call',
              type: 'call',
              effectiveness: 85,
              responseRate: 70
            },
            priority: 'high',
            expectedOutcome: 'Schedule campus visit',
            personalizationScore: 88,
            expectedResponseRate: 75
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.scheduleFollowUp(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/intelligent-follow-up', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('generatePersonalizedMessage', () => {
      it('should generate personalized message', async () => {
        const mockParams = {
          leadId: 'lead-123',
          context: { stage: 'application', interests: ['STEM', 'Arts'] },
          messageType: 'email',
          tone: 'friendly',
          includeValueProposition: true,
          includePersonalDetails: true,
          callToAction: 'Schedule a tour'
        };
        const mockResponse = {
          success: true,
          data: {
            personalizedMessage: 'Hi John, Based on your interest in STEM and Arts...',
            personalizationScore: 92,
            keyPersonalizationElements: [
              'Mentioned STEM interest',
              'Personalized with child\'s name',
              'Referenced previous campus visit'
            ],
            alternatives: [
              'Alternative message focusing on STEM programs',
              'Alternative message highlighting Arts curriculum'
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.generatePersonalizedMessage(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/personalized-message', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('predictOptimalContactTime', () => {
      it('should predict optimal contact time with all parameters', async () => {
        const mockParams = {
          leadId: 'lead-123',
          analyzePreviousEngagement: true,
          considerTimeZone: true,
          includeExternalFactors: true
        };
        const mockResponse = {
          success: true,
          data: {
            optimalTimes: [
              {
                datetime: '2024-01-02T14:00:00Z',
                probability: 85,
                channel: 'phone',
                confidence: 90
              },
              {
                datetime: '2024-01-02T19:00:00Z',
                probability: 75,
                channel: 'email',
                confidence: 80
              }
            ],
            timeZoneRecommendations: [
              'Best contact times: 2-4 PM weekdays',
              'Avoid early mornings and late evenings'
            ],
            channelPreferences: [
              { channel: 'phone', effectiveness: 85 },
              { channel: 'email', effectiveness: 70 },
              { channel: 'sms', effectiveness: 60 }
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.predictOptimalContactTime(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/optimal-contact-time', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('assessChurnRisk', () => {
      it('should assess churn risk with all parameters', async () => {
        const mockParams = {
          leadId: 'lead-123',
          includeEngagementMetrics: true,
          includeCompetitorActivity: true,
          includeBehaviorAnalysis: true
        };
        const mockResponse = {
          success: true,
          data: {
            leadId: 'lead-123',
            riskScore: 75,
            riskLevel: 'high',
            riskFactors: [
              {
                factor: 'No response for 14 days',
                weight: 30,
                contribution: 40
              },
              {
                factor: 'Competitor inquiry detected',
                weight: 25,
                contribution: 35
              }
            ],
            recommendations: [
              {
                action: 'Immediate follow-up call',
                urgency: 'immediate',
                expectedImpact: 60
              },
              {
                action: 'Special offer incentive',
                urgency: 'soon',
                expectedImpact: 45
              }
            ],
            nextReviewDate: '2024-01-03T10:00:00Z'
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.assessChurnRisk(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/churn-risk-assessment', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getFollowUpQueue', () => {
      it('should get follow-up queue with filters', async () => {
        const mockParams = {
          priority: 'high',
          status: 'pending',
          timeRange: '7days',
          limit: 20
        };
        const mockResponse = {
          success: true,
          data: [
            {
              leadId: 'lead-123',
              leadName: 'John Doe',
              priority: 'high',
              scheduledTime: '2024-01-02T14:00:00Z',
              status: 'pending'
            }
          ]
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.getFollowUpQueue(mockParams);

        expect(mockedGet).toHaveBeenCalledWith('/api/v1/enrollment/follow-up-queue', { params: mockParams });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('executeFollowUp', () => {
      it('should execute follow-up', async () => {
        const mockParams = {
          followUpId: 'followup-123',
          actualMessage: 'Hi John, following up on your application...',
          actualChannel: 'phone',
          executionNotes: 'Parent interested in STEM programs'
        };
        const mockResponse = {
          success: true,
          data: {
            success: true,
            responseReceived: true,
            nextFollowUpScheduled: {
              leadId: 'lead-123',
              scheduledTime: '2024-01-03T10:00:00Z'
            }
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.automatedFollowUpApi.executeFollowUp(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/enrollment/execute-follow-up', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('Automation Rules Management', () => {
      describe('getAutomationRules', () => {
        it('should get automation rules', async () => {
          const mockResponse = {
            success: true,
            data: [
              {
                id: 'rule-123',
                name: 'New Lead Follow-up',
                description: 'Automated follow-up for new leads',
                enabled: true,
                trigger: {
                  type: 'new_lead',
                  conditions: { source: 'website' }
                },
                actions: [
                  {
                    type: 'send_email',
                    parameters: { template: 'welcome' },
                    delay: 3600
                  }
                ],
                priority: 1,
                statistics: {
                  triggerCount: 150,
                  successCount: 145,
                  avgResponseTime: 2.5
                }
              }
            ]
          };

          mockedGet.mockResolvedValue(mockResponse);

          const result = await aiEnrollmentApi.automatedFollowUpApi.getAutomationRules();

          expect(mockedGet).toHaveBeenCalledWith('/api/v1/enrollment/automation-rules');
          expect(result).toEqual(mockResponse);
        });
      });

      describe('createAutomationRule', () => {
        it('should create automation rule', async () => {
          const mockData = {
            name: 'Test Rule',
            description: 'Test automation rule',
            trigger: { type: 'test_trigger', conditions: {} },
            actions: [{ type: 'test_action', parameters: {} }],
            priority: 1
          };
          const mockResponse = {
            success: true,
            data: { id: 'rule-123', ...mockData }
          };

          mockedPost.mockResolvedValue(mockResponse);

          const result = await aiEnrollmentApi.automatedFollowUpApi.createAutomationRule(mockData);

          expect(mockedPost).toHaveBeenCalledWith('/api/v1/enrollment/automation-rules', mockData);
          expect(result).toEqual(mockResponse);
        });
      });

      describe('updateAutomationRule', () => {
        it('should update automation rule', async () => {
          const mockData = { name: 'Updated Rule Name' };
          const mockResponse = {
            success: true,
            data: { id: 'rule-123', ...mockData }
          };

          mockedPut.mockResolvedValue(mockResponse);

          const result = await aiEnrollmentApi.automatedFollowUpApi.updateAutomationRule('rule-123', mockData);

          expect(mockedPut).toHaveBeenCalledWith('/api/v1/enrollment/automation-rules/rule-123', mockData);
          expect(result).toEqual(mockResponse);
        });
      });

      describe('deleteAutomationRule', () => {
        it('should delete automation rule', async () => {
          const mockResponse = { success: true, data: { deleted: true } };

          mockedDel.mockResolvedValue(mockResponse);

          const result = await aiEnrollmentApi.automatedFollowUpApi.deleteAutomationRule('rule-123');

          expect(mockedDel).toHaveBeenCalledWith('/api/v1/enrollment/automation-rules/rule-123');
          expect(result).toEqual(mockResponse);
        });
      });

      describe('toggleAutomationRule', () => {
        it('should toggle automation rule', async () => {
          const mockResponse = {
            success: true,
            data: { id: 'rule-123', enabled: false }
          };

          mockedPut.mockResolvedValue(mockResponse);

          const result = await aiEnrollmentApi.automatedFollowUpApi.toggleAutomationRule('rule-123', false);

          expect(mockedPut).toHaveBeenCalledWith('/api/v1/enrollment/automation-rules/rule-123/toggle', { enabled: false });
          expect(result).toEqual(mockResponse);
        });
      });
    });
  });

  describe('AI Analytics API', () => {
    describe('getComprehensiveReport', () => {
      it('should get comprehensive AI analysis report', async () => {
        const mockParams = {
          timeRange: '6months',
          includeForecasting: true,
          includeFunnelAnalysis: true,
          includePersonalization: true,
          includeAutomation: true
        };
        const mockResponse = {
          success: true,
          data: {
            summary: {
              totalLeads: 1500,
              conversionRate: 25.5,
              automationCoverage: 85,
              aiAccuracy: 88
            },
            insights: [
              {
                category: 'Forecasting',
                insight: 'AI predictions are 88% accurate',
                impact: 'High',
                recommendation: 'Continue using AI for enrollment planning'
              }
            ],
            trends: [
              {
                metric: 'conversion_rate',
                trend: 'up',
                change: 5.2,
                period: '6months'
              }
            ],
            recommendations: [
              {
                priority: 'high',
                category: 'Automation',
                title: 'Expand automated follow-up',
                description: 'Increase automation coverage to 95%',
                expectedImpact: '15% increase in efficiency'
              }
            ]
          }
        };

        mockedPost.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiAnalyticsApi.getComprehensiveReport(mockParams);

        expect(mockedPost).toHaveBeenCalledWith('/api/v1/ai/comprehensive-report', mockParams);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getAIPerformanceMetrics', () => {
      it('should get AI performance metrics', async () => {
        const mockResponse = {
          success: true,
          data: {
            forecastingAccuracy: 88,
            personalizationEffectiveness: 92,
            automationCoverage: 85,
            responseRateImprovement: 25,
            revenueImpact: 150000,
            modelPerformance: [
              {
                model: 'enrollment_forecast_v2',
                accuracy: 88,
                lastTrainingDate: '2024-01-01T00:00:00Z',
                version: '2.0.1'
              }
            ]
          }
        };

        mockedGet.mockResolvedValue(mockResponse);

        const result = await aiEnrollmentApi.aiAnalyticsApi.getAIPerformanceMetrics();

        expect(mockedGet).toHaveBeenCalledWith('/api/v1/ai/performance-metrics');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedPost.mockRejectedValue(mockError);

      await expect(aiEnrollmentApi.aiEnrollmentApi.generateForecast({ planId: 'test', timeHorizon: '3months' }))
        .rejects.toThrow('Network error');
    });

    it('should handle API response errors', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid parameters',
        data: null
      };
      mockedPost.mockResolvedValue(mockErrorResponse);

      const result = await aiEnrollmentApi.aiEnrollmentApi.generateForecast({ planId: 'test', timeHorizon: '3months' });
      expect(result).toEqual(mockErrorResponse);
    });
  });
});