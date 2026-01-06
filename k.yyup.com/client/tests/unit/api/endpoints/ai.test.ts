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

describe, it, expect } from 'vitest'
import {
  AI_ENDPOINTS,
  AI_MEMORY_ENDPOINTS,
  AI_MODEL_ENDPOINTS,
  AI_ANALYSIS_ENDPOINTS,
  AI_RECOMMENDATION_ENDPOINTS,
  AI_QUOTA_ENDPOINTS
} from '@/api/endpoints/ai'

describe('AI Endpoints', () => {
  describe('AI_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_ENDPOINTS.BASE).toBe('/api/ai')
    })

    it('should have correct conversation endpoints', () => {
      expect(AI_ENDPOINTS.CONVERSATION).toBe('ai/conversation')
      expect(AI_ENDPOINTS.CONVERSATIONS).toBe('ai/conversations')
    })

    it('should have correct expert consultation endpoint', () => {
      expect(AI_ENDPOINTS.EXPERT_CONSULTATION).toBe('ai/expert-consultation')
    })

    it('should have correct models endpoint', () => {
      expect(AI_ENDPOINTS.MODELS).toBe('ai/models')
    })

    it('should have correct memory endpoint', () => {
      expect(AI_ENDPOINTS.MEMORY).toBe('ai/memory')
    })

    it('should have correct feedback endpoint', () => {
      expect(AI_ENDPOINTS.FEEDBACK).toBe('ai/feedback')
    })

    it('should have correct usage endpoint', () => {
      expect(AI_ENDPOINTS.USAGE).toBe('ai/usage')
    })

    it('should have correct settings endpoint', () => {
      expect(AI_ENDPOINTS.SETTINGS).toBe('ai/settings')
    })

    it('should have correct health endpoint', () => {
      expect(AI_ENDPOINTS.HEALTH).toBe('ai/health')
    })

    it('should have correct capabilities endpoint', () => {
      expect(AI_ENDPOINTS.CAPABILITIES).toBe('ai/capabilities')
    })

    it('should have correct additional endpoints', () => {
      expect(AI_ENDPOINTS.USER_QUOTA).toBe('ai/quota/user')
      expect(AI_ENDPOINTS.UPLOAD_IMAGE).toBe('ai/upload/image')
      expect(AI_ENDPOINTS.TRANSCRIBE_AUDIO).toBe('ai/transcribe/audio')
    })

    it('should generate correct conversation by ID endpoint', () => {
      expect(AI_ENDPOINTS.CONVERSATION_BY_ID(1)).toBe('ai/conversations/1')
      expect(AI_ENDPOINTS.CONVERSATION_BY_ID('abc')).toBe('ai/conversations/abc')
    })

    it('should generate correct conversation messages endpoint', () => {
      expect(AI_ENDPOINTS.CONVERSATION_MESSAGES(1)).toBe('ai/conversations/1/messages')
      expect(AI_ENDPOINTS.CONVERSATION_MESSAGES('abc')).toBe('ai/conversations/abc/messages')
    })

    it('should generate correct conversation message metadata endpoint', () => {
      expect(AI_ENDPOINTS.CONVERSATION_MESSAGE_METADATA(1, 1)).toBe('ai/conversations/1/messages/1/metadata')
      expect(AI_ENDPOINTS.CONVERSATION_MESSAGE_METADATA('abc', 'def')).toBe('ai/conversations/abc/messages/def/metadata')
    })

    it('should have correct send message endpoint', () => {
      expect(AI_ENDPOINTS.SEND_MESSAGE).toBe('ai/conversations/send-message')
    })

    it('should generate correct delete conversation endpoint', () => {
      expect(AI_ENDPOINTS.DELETE_CONVERSATION(1)).toBe('ai/conversations/1')
      expect(AI_ENDPOINTS.DELETE_CONVERSATION('abc')).toBe('ai/conversations/abc')
    })

    it('should generate correct update conversation endpoint', () => {
      expect(AI_ENDPOINTS.UPDATE_CONVERSATION(1)).toBe('ai/conversations/1')
      expect(AI_ENDPOINTS.UPDATE_CONVERSATION('abc')).toBe('ai/conversations/abc')
    })

    it('should generate correct conversation history endpoint', () => {
      expect(AI_ENDPOINTS.CONVERSATION_HISTORY(1)).toBe('ai/conversations/1/history')
      expect(AI_ENDPOINTS.CONVERSATION_HISTORY('abc')).toBe('ai/conversations/abc/history')
    })

    it('should have correct consultation endpoints', () => {
      expect(AI_ENDPOINTS.CONSULTATION).toBe('ai/consultation')
      expect(AI_ENDPOINTS.CONSULTATION_START).toBe('ai/consultation/start')
    })

    it('should have correct model management endpoints', () => {
      expect(AI_ENDPOINTS.INITIALIZE).toBe('ai/initialize')
      expect(AI_ENDPOINTS.MODEL_DEFAULT).toBe('ai/models/default')
      expect(AI_ENDPOINTS.MODEL_COMPARE).toBe('ai/models/compare')
      expect(AI_ENDPOINTS.WORKLOAD_BALANCE).toBe('ai/workload/balance')
    })

    it('should generate correct model by ID endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_BY_ID(1)).toBe('ai/models/1')
      expect(AI_ENDPOINTS.MODEL_BY_ID('abc')).toBe('ai/models/abc')
    })

    it('should generate correct model billing endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_BILLING(1)).toBe('ai/models/1/billing')
      expect(AI_ENDPOINTS.MODEL_BILLING('abc')).toBe('ai/models/abc/billing')
    })

    it('should generate correct model capabilities endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_CAPABILITIES(1, 'chat')).toBe('ai/models/1/capabilities/chat')
      expect(AI_ENDPOINTS.MODEL_CAPABILITIES('abc', 'vision')).toBe('ai/models/abc/capabilities/vision')
    })

    it('should generate correct model usage endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_USAGE(1)).toBe('ai/models/1/usage')
      expect(AI_ENDPOINTS.MODEL_USAGE('abc')).toBe('ai/models/abc/usage')
    })

    it('should generate correct model config endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_CONFIG(1)).toBe('ai/models/1/config')
      expect(AI_ENDPOINTS.MODEL_CONFIG('abc')).toBe('ai/models/abc/config')
    })

    it('should generate correct model status endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_STATUS(1)).toBe('ai/models/1/status')
      expect(AI_ENDPOINTS.MODEL_STATUS('abc')).toBe('ai/models/abc/status')
    })

    it('should generate correct model metrics endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_METRICS(1)).toBe('ai/models/1/metrics')
      expect(AI_ENDPOINTS.MODEL_METRICS('abc')).toBe('ai/models/abc/metrics')
    })

    it('should generate correct model logs endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_LOGS(1)).toBe('ai/models/1/logs')
      expect(AI_ENDPOINTS.MODEL_LOGS('abc')).toBe('ai/models/abc/logs')
    })

    it('should generate correct model reset endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_RESET(1)).toBe('ai/models/1/reset')
      expect(AI_ENDPOINTS.MODEL_RESET('abc')).toBe('ai/models/abc/reset')
    })

    it('should generate correct model train endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_TRAIN(1)).toBe('ai/models/1/train')
      expect(AI_ENDPOINTS.MODEL_TRAIN('abc')).toBe('ai/models/abc/train')
    })

    it('should generate correct model deploy endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_DEPLOY(1)).toBe('ai/models/1/deploy')
      expect(AI_ENDPOINTS.MODEL_DEPLOY('abc')).toBe('ai/models/abc/deploy')
    })

    it('should generate correct model undeploy endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_UNDEPLOY(1)).toBe('ai/models/1/undeploy')
      expect(AI_ENDPOINTS.MODEL_UNDEPLOY('abc')).toBe('ai/models/abc/undeploy')
    })

    it('should generate correct model version endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_VERSION(1, 'v1')).toBe('ai/models/1/versions/v1')
      expect(AI_ENDPOINTS.MODEL_VERSION('abc', 'v2')).toBe('ai/models/abc/versions/v2')
    })

    it('should generate correct model versions endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_VERSIONS(1)).toBe('ai/models/1/versions')
      expect(AI_ENDPOINTS.MODEL_VERSIONS('abc')).toBe('ai/models/abc/versions')
    })

    it('should generate correct model benchmark endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_BENCHMARK(1)).toBe('ai/models/1/benchmark')
      expect(AI_ENDPOINTS.MODEL_BENCHMARK('abc')).toBe('ai/models/abc/benchmark')
    })

    it('should generate correct model optimize endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_OPTIMIZE(1)).toBe('ai/models/1/optimize')
      expect(AI_ENDPOINTS.MODEL_OPTIMIZE('abc')).toBe('ai/models/abc/optimize')
    })

    it('should generate correct model backup endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_BACKUP(1)).toBe('ai/models/1/backup')
      expect(AI_ENDPOINTS.MODEL_BACKUP('abc')).toBe('ai/models/abc/backup')
    })

    it('should generate correct model restore endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_RESTORE(1)).toBe('ai/models/1/restore')
      expect(AI_ENDPOINTS.MODEL_RESTORE('abc')).toBe('ai/models/abc/restore')
    })

    it('should generate correct model clone endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_CLONE(1)).toBe('ai/models/1/clone')
      expect(AI_ENDPOINTS.MODEL_CLONE('abc')).toBe('ai/models/abc/clone')
    })

    it('should generate correct model transfer endpoint', () => {
      expect(AI_ENDPOINTS.MODEL_TRANSFER(1)).toBe('ai/models/1/transfer')
      expect(AI_ENDPOINTS.MODEL_TRANSFER('abc')).toBe('ai/models/abc/transfer')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_ENDPOINTS.BASE = '/modified'
      expect(AI_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('AI_MEMORY_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.BASE).toBe('ai/memory')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.GET_BY_ID(1)).toBe('ai/memory/1')
      expect(AI_MEMORY_ENDPOINTS.GET_BY_ID('abc')).toBe('ai/memory/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.UPDATE(1)).toBe('ai/memory/1')
      expect(AI_MEMORY_ENDPOINTS.UPDATE('abc')).toBe('ai/memory/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.DELETE(1)).toBe('ai/memory/1')
      expect(AI_MEMORY_ENDPOINTS.DELETE('abc')).toBe('ai/memory/abc')
    })

    it('should generate correct delete by ID endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.DELETE_BY_ID(1)).toBe('ai/memory/1')
      expect(AI_MEMORY_ENDPOINTS.DELETE_BY_ID('abc')).toBe('ai/memory/abc')
    })

    it('should have correct search endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.SEARCH).toBe('ai/memory/search')
    })

    it('should have correct categories endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.CATEGORIES).toBe('ai/memory/categories')
    })

    it('should have correct tags endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.TAGS).toBe('ai/memory/tags')
    })

    it('should have correct export endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.EXPORT).toBe('ai/memory/export')
    })

    it('should have correct import endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.IMPORT).toBe('ai/memory/import')
    })

    it('should have correct backup endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.BACKUP).toBe('ai/memory/backup')
    })

    it('should have correct restore endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.RESTORE).toBe('ai/memory/restore')
    })

    it('should have correct analytics endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.ANALYTICS).toBe('ai/memory/analytics')
    })

    it('should have correct visualization endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.VISUALIZATION).toBe('ai/memory/visualization')
    })

    it('should have correct additional endpoints', () => {
      expect(AI_MEMORY_ENDPOINTS.CREATE).toBe('ai/memory')
      expect(AI_MEMORY_ENDPOINTS.SUMMARIZE).toBe('ai/memory/summarize')
      expect(AI_MEMORY_ENDPOINTS.CREATE_WITH_EMBEDDING).toBe('ai/memory/with-embedding')
      expect(AI_MEMORY_ENDPOINTS.SEARCH_SIMILAR).toBe('ai/memory/search-similar')
    })

    it('should generate correct get conversation endpoint', () => {
      expect(AI_MEMORY_ENDPOINTS.GET_CONVERSATION(1)).toBe('ai/memory/conversation/1')
      expect(AI_MEMORY_ENDPOINTS.GET_CONVERSATION('abc')).toBe('ai/memory/conversation/abc')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_MEMORY_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_MEMORY_ENDPOINTS.BASE = '/modified'
      expect(AI_MEMORY_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('AI_MODEL_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.BASE).toBe('ai/models')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.GET_BY_ID(1)).toBe('ai/models/1')
      expect(AI_MODEL_ENDPOINTS.GET_BY_ID('abc')).toBe('ai/models/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.UPDATE(1)).toBe('ai/models/1')
      expect(AI_MODEL_ENDPOINTS.UPDATE('abc')).toBe('ai/models/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.DELETE(1)).toBe('ai/models/1')
      expect(AI_MODEL_ENDPOINTS.DELETE('abc')).toBe('ai/models/abc')
    })

    it('should generate correct activate endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.ACTIVATE(1)).toBe('ai/models/1/activate')
      expect(AI_MODEL_ENDPOINTS.ACTIVATE('abc')).toBe('ai/models/abc/activate')
    })

    it('should generate correct deactivate endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.DEACTIVATE(1)).toBe('ai/models/1/deactivate')
      expect(AI_MODEL_ENDPOINTS.DEACTIVATE('abc')).toBe('ai/models/abc/deactivate')
    })

    it('should generate correct test endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.TEST(1)).toBe('ai/models/1/test')
      expect(AI_MODEL_ENDPOINTS.TEST('abc')).toBe('ai/models/abc/test')
    })

    it('should generate correct performance endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.PERFORMANCE(1)).toBe('ai/models/1/performance')
      expect(AI_MODEL_ENDPOINTS.PERFORMANCE('abc')).toBe('ai/models/abc/performance')
    })

    it('should generate correct usage stats endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.USAGE_STATS(1)).toBe('ai/models/1/usage-stats')
      expect(AI_MODEL_ENDPOINTS.USAGE_STATS('abc')).toBe('ai/models/abc/usage-stats')
    })

    it('should generate correct fine tune endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.FINE_TUNE(1)).toBe('ai/models/1/fine-tune')
      expect(AI_MODEL_ENDPOINTS.FINE_TUNE('abc')).toBe('ai/models/abc/fine-tune')
    })

    it('should generate correct export endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.EXPORT(1)).toBe('ai/models/1/export')
      expect(AI_MODEL_ENDPOINTS.EXPORT('abc')).toBe('ai/models/abc/export')
    })

    it('should have correct import endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.IMPORT).toBe('ai/models/import')
    })

    it('should have correct available endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.AVAILABLE).toBe('ai/models/available')
    })

    it('should have correct recommended endpoint', () => {
      expect(AI_MODEL_ENDPOINTS.RECOMMENDED).toBe('ai/models/recommended')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_MODEL_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_MODEL_ENDPOINTS.BASE = '/modified'
      expect(AI_MODEL_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('AI_ANALYSIS_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.BASE).toBe('ai/analysis')
    })

    it('should have correct student performance endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.STUDENT_PERFORMANCE).toBe('ai/analysis/student-performance')
    })

    it('should have correct teacher efficiency endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.TEACHER_EFFICIENCY).toBe('ai/analysis/teacher-efficiency')
    })

    it('should have correct class optimization endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.CLASS_OPTIMIZATION).toBe('ai/analysis/class-optimization')
    })

    it('should have correct enrollment prediction endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.ENROLLMENT_PREDICTION).toBe('ai/analysis/enrollment-prediction')
    })

    it('should have correct resource allocation endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.RESOURCE_ALLOCATION).toBe('ai/analysis/resource-allocation')
    })

    it('should have correct risk assessment endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.RISK_ASSESSMENT).toBe('ai/analysis/risk-assessment')
    })

    it('should have correct trend analysis endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.TREND_ANALYSIS).toBe('ai/analysis/trend-analysis')
    })

    it('should have correct recommendation endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.RECOMMENDATION).toBe('ai/analysis/recommendation')
    })

    it('should have correct insights endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.INSIGHTS).toBe('ai/analysis/insights')
    })

    it('should have correct reports endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.REPORTS).toBe('ai/analysis/reports')
    })

    it('should have correct export endpoint', () => {
      expect(AI_ANALYSIS_ENDPOINTS.EXPORT).toBe('ai/analysis/export')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_ANALYSIS_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_ANALYSIS_ENDPOINTS.BASE = '/modified'
      expect(AI_ANALYSIS_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('AI_RECOMMENDATION_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.BASE).toBe('ai/recommendations')
    })

    it('should have correct student placement endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.STUDENT_PLACEMENT).toBe('ai/recommendations/student-placement')
    })

    it('should have correct teacher assignment endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.TEACHER_ASSIGNMENT).toBe('ai/recommendations/teacher-assignment')
    })

    it('should have correct class scheduling endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.CLASS_SCHEDULING).toBe('ai/recommendations/class-scheduling')
    })

    it('should have correct activity planning endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.ACTIVITY_PLANNING).toBe('ai/recommendations/activity-planning')
    })

    it('should have correct resource optimization endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.RESOURCE_OPTIMIZATION).toBe('ai/recommendations/resource-optimization')
    })

    it('should have correct curriculum design endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.CURRICULUM_DESIGN).toBe('ai/recommendations/curriculum-design')
    })

    it('should have correct parent engagement endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.PARENT_ENGAGEMENT).toBe('ai/recommendations/parent-engagement')
    })

    it('should have correct marketing strategy endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.MARKETING_STRATEGY).toBe('ai/recommendations/marketing-strategy')
    })

    it('should have correct enrollment strategy endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.ENROLLMENT_STRATEGY).toBe('ai/recommendations/enrollment-strategy')
    })

    it('should have correct personalized endpoint', () => {
      expect(AI_RECOMMENDATION_ENDPOINTS.PERSONALIZED).toBe('ai/recommendations/personalized')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_RECOMMENDATION_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_RECOMMENDATION_ENDPOINTS.BASE = '/modified'
      expect(AI_RECOMMENDATION_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('AI_QUOTA_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.BASE).toBe('ai/quota')
    })

    it('should have correct current endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.CURRENT).toBe('ai/quota/current')
    })

    it('should have correct usage endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.USAGE).toBe('ai/quota/usage')
    })

    it('should have correct limits endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.LIMITS).toBe('ai/quota/limits')
    })

    it('should have correct history endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.HISTORY).toBe('ai/quota/history')
    })

    it('should have correct upgrade endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.UPGRADE).toBe('ai/quota/upgrade')
    })

    it('should have correct purchase endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.PURCHASE).toBe('ai/quota/purchase')
    })

    it('should have correct billing endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.BILLING).toBe('ai/quota/billing')
    })

    it('should have correct alerts endpoint', () => {
      expect(AI_QUOTA_ENDPOINTS.ALERTS).toBe('ai/quota/alerts')
    })

    it('should be readonly (as const)', () => {
      const originalBase = AI_QUOTA_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      AI_QUOTA_ENDPOINTS.BASE = '/modified'
      expect(AI_QUOTA_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('Endpoint Consistency', () => {
    it('should use consistent API prefix', () => {
      expect(AI_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(AI_MEMORY_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(AI_MODEL_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(AI_ANALYSIS_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(AI_RECOMMENDATION_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(AI_QUOTA_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
    })

    it('should handle both number and string IDs consistently', () => {
      const testEndpoints = [
        AI_ENDPOINTS.CONVERSATION_BY_ID,
        AI_MEMORY_ENDPOINTS.GET_BY_ID,
        AI_MODEL_ENDPOINTS.GET_BY_ID
      ]

      testEndpoints.forEach(endpointFn => {
        expect(endpointFn(1)).toContain('/1')
        expect(endpointFn('abc')).toContain('/abc')
      })
    })

    it('should generate valid URLs for all endpoints', () => {
      const testCases = [
        () => AI_ENDPOINTS.CONVERSATION_BY_ID(1),
        () => AI_MEMORY_ENDPOINTS.SEARCH,
        () => AI_MODEL_ENDPOINTS.AVAILABLE,
        () => AI_ANALYSIS_ENDPOINTS.STUDENT_PERFORMANCE,
        () => AI_RECOMMENDATION_ENDPOINTS.STUDENT_PLACEMENT,
        () => AI_QUOTA_ENDPOINTS.CURRENT
      ]

      testCases.forEach(testCase => {
        const url = testCase()
        expect(url).not.toContain('//')
        expect(url.startsWith('/')).toBe(true)
      })
    })
  })

  describe('Type Safety', () => {
    it('should accept both number and string parameters', () => {
      const numId = 1
      const strId = 'abc'

      expect(AI_ENDPOINTS.CONVERSATION_BY_ID(numId)).toBe('ai/conversations/1')
      expect(AI_ENDPOINTS.CONVERSATION_BY_ID(strId)).toBe('ai/conversations/abc')
    })

    it('should maintain correct return types', () => {
      const endpoint1 = AI_ENDPOINTS.CONVERSATION_BY_ID(1)
      const endpoint2 = AI_MEMORY_ENDPOINTS.SEARCH
      const endpoint3 = AI_MODEL_ENDPOINTS.AVAILABLE

      expect(typeof endpoint1).toBe('string')
      expect(typeof endpoint2).toBe('string')
      expect(typeof endpoint3).toBe('string')
    })
  })
})