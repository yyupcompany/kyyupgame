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
  ACTIVITY_ENDPOINTS,
  ACTIVITY_PLAN_ENDPOINTS,
  ACTIVITY_REGISTRATION_ENDPOINTS,
  ACTIVITY_CHECKIN_ENDPOINTS,
  ACTIVITY_EVALUATION_ENDPOINTS,
  ACTIVITY_TEMPLATE_ENDPOINTS
} from '@/api/endpoints/activity'

describe('Activity Endpoints', () => {
  describe('ACTIVITY_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.BASE).toBe('/api/activities')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activities/1')
      expect(ACTIVITY_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activities/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.UPDATE(1)).toBe('/api/activities/1')
      expect(ACTIVITY_ENDPOINTS.UPDATE('abc')).toBe('/api/activities/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.DELETE(1)).toBe('/api/activities/1')
      expect(ACTIVITY_ENDPOINTS.DELETE('abc')).toBe('/api/activities/abc')
    })

    it('should generate correct update status endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.UPDATE_STATUS(1)).toBe('/api/activities/1/status')
      expect(ACTIVITY_ENDPOINTS.UPDATE_STATUS('abc')).toBe('/api/activities/abc/status')
    })

    it('should generate correct publish endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.PUBLISH(1)).toBe('/api/activities/1/publish')
      expect(ACTIVITY_ENDPOINTS.PUBLISH('abc')).toBe('/api/activities/abc/publish')
    })

    it('should have correct statistics endpoint', () => {
      expect(ACTIVITY_ENDPOINTS.STATISTICS).toBe('/api/activities/statistics')
    })

    it('should be readonly (as const)', () => {
      // This test ensures the endpoints are properly typed as readonly
      const originalBase = ACTIVITY_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('ACTIVITY_PLAN_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.BASE).toBe('/api/activity-plans')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activity-plans/1')
      expect(ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activity-plans/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.UPDATE(1)).toBe('/api/activity-plans/1')
      expect(ACTIVITY_PLAN_ENDPOINTS.UPDATE('abc')).toBe('/api/activity-plans/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.DELETE(1)).toBe('/api/activity-plans/1')
      expect(ACTIVITY_PLAN_ENDPOINTS.DELETE('abc')).toBe('/api/activity-plans/abc')
    })

    it('should generate correct status endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.STATUS(1)).toBe('/api/activity-plans/1/status')
      expect(ACTIVITY_PLAN_ENDPOINTS.STATUS('abc')).toBe('/api/activity-plans/abc/status')
    })

    it('should generate correct cancel endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.CANCEL(1)).toBe('/api/activity-plans/1/cancel')
      expect(ACTIVITY_PLAN_ENDPOINTS.CANCEL('abc')).toBe('/api/activity-plans/abc/cancel')
    })

    it('should generate correct publish endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.PUBLISH(1)).toBe('/api/activity-plans/1/publish')
      expect(ACTIVITY_PLAN_ENDPOINTS.PUBLISH('abc')).toBe('/api/activity-plans/abc/publish')
    })

    it('should generate correct statistics endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.STATISTICS(1)).toBe('/api/activity-plans/1/statistics')
      expect(ACTIVITY_PLAN_ENDPOINTS.STATISTICS('abc')).toBe('/api/activity-plans/abc/statistics')
    })

    it('should generate correct by category endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.BY_CATEGORY('sports')).toBe('/api/activity-plans/by-category/sports')
      expect(ACTIVITY_PLAN_ENDPOINTS.BY_CATEGORY('arts')).toBe('/api/activity-plans/by-category/arts')
    })

    it('should generate correct by date endpoint', () => {
      expect(ACTIVITY_PLAN_ENDPOINTS.BY_DATE('2023-01-01')).toBe('/api/activity-plans/by-date/2023-01-01')
      expect(ACTIVITY_PLAN_ENDPOINTS.BY_DATE('2023-12-31')).toBe('/api/activity-plans/by-date/2023-12-31')
    })

    it('should be readonly (as const)', () => {
      const originalBase = ACTIVITY_PLAN_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_PLAN_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_PLAN_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('ACTIVITY_REGISTRATION_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BASE).toBe('/api/activity-registrations')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activity-registrations/1')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activity-registrations/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.UPDATE(1)).toBe('/api/activity-registrations/1')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.UPDATE('abc')).toBe('/api/activity-registrations/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.DELETE(1)).toBe('/api/activity-registrations/1')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.DELETE('abc')).toBe('/api/activity-registrations/abc')
    })

    it('should generate correct review endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.REVIEW(1)).toBe('/api/activity-registrations/1/review')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.REVIEW('abc')).toBe('/api/activity-registrations/abc/review')
    })

    it('should generate correct cancel endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CANCEL(1)).toBe('/api/activity-registrations/1/cancel')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CANCEL('abc')).toBe('/api/activity-registrations/abc/cancel')
    })

    it('should generate correct payment endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.PAYMENT(1)).toBe('/api/activity-registrations/1/payment')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.PAYMENT('abc')).toBe('/api/activity-registrations/abc/payment')
    })

    it('should generate correct check-in endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CHECK_IN(1)).toBe('/api/activity-registrations/1/check-in')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CHECK_IN('abc')).toBe('/api/activity-registrations/abc/check-in')
    })

    it('should generate correct absent endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.ABSENT(1)).toBe('/api/activity-registrations/1/absent')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.ABSENT('abc')).toBe('/api/activity-registrations/abc/absent')
    })

    it('should generate correct feedback endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.FEEDBACK(1)).toBe('/api/activity-registrations/1/feedback')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.FEEDBACK('abc')).toBe('/api/activity-registrations/abc/feedback')
    })

    it('should generate correct convert endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CONVERT(1)).toBe('/api/activity-registrations/1/convert')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.CONVERT('abc')).toBe('/api/activity-registrations/abc/convert')
    })

    it('should have correct batch confirm endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BATCH_CONFIRM).toBe('/api/activity-registrations/batch-confirm')
    })

    it('should generate correct by activity endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_ACTIVITY(1)).toBe('/api/activity-registrations/by-activity/1')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_ACTIVITY('abc')).toBe('/api/activity-registrations/by-activity/abc')
    })

    it('should generate correct by student endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_STUDENT(1)).toBe('/api/activity-registrations/by-student/1')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_STUDENT('abc')).toBe('/api/activity-registrations/by-student/abc')
    })

    it('should generate correct by status endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_STATUS('pending')).toBe('/api/activity-registrations/by-status/pending')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BY_STATUS('approved')).toBe('/api/activity-registrations/by-status/approved')
    })

    it('should generate correct stats endpoint', () => {
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.STATS(1)).toBe('/api/activity-registrations/activity/1/stats')
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.STATS('abc')).toBe('/api/activity-registrations/activity/abc/stats')
    })

    it('should be readonly (as const)', () => {
      const originalBase = ACTIVITY_REGISTRATION_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_REGISTRATION_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('ACTIVITY_CHECKIN_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.BASE).toBe('/api/activity-checkins')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activity-checkins/1')
      expect(ACTIVITY_CHECKIN_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activity-checkins/abc')
    })

    it('should have correct create batch endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.CREATE_BATCH).toBe('/api/activity-checkins/batch')
    })

    it('should generate correct by activity endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.BY_ACTIVITY(1)).toBe('/api/activity-checkins/by-activity/1')
      expect(ACTIVITY_CHECKIN_ENDPOINTS.BY_ACTIVITY('abc')).toBe('/api/activity-checkins/by-activity/abc')
    })

    it('should generate correct registration checkin endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.REGISTRATION_CHECKIN(1)).toBe('/api/activity-checkins/registration/1')
      expect(ACTIVITY_CHECKIN_ENDPOINTS.REGISTRATION_CHECKIN('abc')).toBe('/api/activity-checkins/registration/abc')
    })

    it('should generate correct phone checkin endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.PHONE_CHECKIN(1)).toBe('/api/activity-checkins/1/phone')
      expect(ACTIVITY_CHECKIN_ENDPOINTS.PHONE_CHECKIN('abc')).toBe('/api/activity-checkins/abc/phone')
    })

    it('should generate correct stats endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.STATS(1)).toBe('/api/activity-checkins/1/stats')
      expect(ACTIVITY_CHECKIN_ENDPOINTS.STATS('abc')).toBe('/api/activity-checkins/abc/stats')
    })

    it('should have correct export endpoint', () => {
      expect(ACTIVITY_CHECKIN_ENDPOINTS.EXPORT).toBe('/api/activity-checkins/export')
    })

    it('should be readonly (as const)', () => {
      const originalBase = ACTIVITY_CHECKIN_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_CHECKIN_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_CHECKIN_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('ACTIVITY_EVALUATION_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BASE).toBe('/api/activity-evaluations')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activity-evaluations/1')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activity-evaluations/abc')
    })

    it('should generate correct update endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.UPDATE(1)).toBe('/api/activity-evaluations/1')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.UPDATE('abc')).toBe('/api/activity-evaluations/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.DELETE(1)).toBe('/api/activity-evaluations/1')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.DELETE('abc')).toBe('/api/activity-evaluations/abc')
    })

    it('should generate correct by activity endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BY_ACTIVITY(1)).toBe('/api/activity-evaluations/by-activity/1')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BY_ACTIVITY('abc')).toBe('/api/activity-evaluations/by-activity/abc')
    })

    it('should generate correct by rating endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BY_RATING(5)).toBe('/api/activity-evaluations/by-rating/5')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BY_RATING('4')).toBe('/api/activity-evaluations/by-rating/4')
    })

    it('should generate correct statistics endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.STATISTICS(1)).toBe('/api/activity-evaluations/statistics/1')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.STATISTICS('abc')).toBe('/api/activity-evaluations/statistics/abc')
    })

    it('should generate correct activity statistics endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.ACTIVITY_STATISTICS(1)).toBe('/api/activity-evaluations/activity/1/statistics')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.ACTIVITY_STATISTICS('abc')).toBe('/api/activity-evaluations/activity/abc/statistics')
    })

    it('should generate correct reply endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.REPLY(1)).toBe('/api/activity-evaluations/1/reply')
      expect(ACTIVITY_EVALUATION_ENDPOINTS.REPLY('abc')).toBe('/api/activity-evaluations/abc/reply')
    })

    it('should have correct satisfaction report endpoint', () => {
      expect(ACTIVITY_EVALUATION_ENDPOINTS.SATISFACTION_REPORT).toBe('/api/activity-evaluations/satisfaction-report')
    })

    it('should be readonly (as const)', () => {
      const originalBase = ACTIVITY_EVALUATION_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_EVALUATION_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('ACTIVITY_TEMPLATE_ENDPOINTS', () => {
    it('should have correct base endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.BASE).toBe('/api/activity-templates')
    })

    it('should generate correct get by ID endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.GET_BY_ID(1)).toBe('/api/activity-templates/1')
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.GET_BY_ID('abc')).toBe('/api/activity-templates/abc')
    })

    it('should have correct create endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.CREATE).toBe('/api/activity-templates')
    })

    it('should generate correct update endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.UPDATE(1)).toBe('/api/activity-templates/1')
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.UPDATE('abc')).toBe('/api/activity-templates/abc')
    })

    it('should generate correct delete endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.DELETE(1)).toBe('/api/activity-templates/1')
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.DELETE('abc')).toBe('/api/activity-templates/abc')
    })

    it('should generate correct use endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.USE(1)).toBe('/api/activity-templates/1/use')
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.USE('abc')).toBe('/api/activity-templates/abc/use')
    })

    it('should generate correct by category endpoint', () => {
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.BY_CATEGORY('sports')).toBe('/api/activity-templates?category=sports')
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.BY_CATEGORY('arts')).toBe('/api/activity-templates?category=arts')
    })

    it('should be readonly (as const)', () => {
      const originalBase = ACTIVITY_TEMPLATE_ENDPOINTS.BASE
      // @ts-expect-error - Should not be assignable
      ACTIVITY_TEMPLATE_ENDPOINTS.BASE = '/modified'
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.BASE).toBe(originalBase)
    })
  })

  describe('Endpoint Consistency', () => {
    it('should use consistent API prefix', () => {
      expect(ACTIVITY_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(ACTIVITY_PLAN_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(ACTIVITY_REGISTRATION_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(ACTIVITY_CHECKIN_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(ACTIVITY_EVALUATION_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
      expect(ACTIVITY_TEMPLATE_ENDPOINTS.BASE.startsWith('/api/')).toBe(true)
    })

    it('should handle both number and string IDs consistently', () => {
      const testEndpoints = [
        ACTIVITY_ENDPOINTS.GET_BY_ID,
        ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID,
        ACTIVITY_REGISTRATION_ENDPOINTS.GET_BY_ID,
        ACTIVITY_CHECKIN_ENDPOINTS.GET_BY_ID,
        ACTIVITY_EVALUATION_ENDPOINTS.GET_BY_ID,
        ACTIVITY_TEMPLATE_ENDPOINTS.GET_BY_ID
      ]

      testEndpoints.forEach(endpointFn => {
        expect(endpointFn(1)).toContain('/1')
        expect(endpointFn('abc')).toContain('/abc')
      })
    })

    it('should generate valid URLs for all endpoints', () => {
      // Test that all generated URLs are valid and don't contain double slashes
      const testCases = [
        () => ACTIVITY_ENDPOINTS.GET_BY_ID(1),
        () => ACTIVITY_PLAN_ENDPOINTS.BY_CATEGORY('test'),
        () => ACTIVITY_REGISTRATION_ENDPOINTS.BY_ACTIVITY(1),
        () => ACTIVITY_CHECKIN_ENDPOINTS.PHONE_CHECKIN(1),
        () => ACTIVITY_EVALUATION_ENDPOINTS.BY_RATING(5),
        () => ACTIVITY_TEMPLATE_ENDPOINTS.BY_CATEGORY('test')
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
      // These should not cause TypeScript errors
      const numId = 1
      const strId = 'abc'

      expect(ACTIVITY_ENDPOINTS.GET_BY_ID(numId)).toBe('/api/activities/1')
      expect(ACTIVITY_ENDPOINTS.GET_BY_ID(strId)).toBe('/api/activities/abc')
    })

    it('should maintain correct return types', () => {
      const endpoint1 = ACTIVITY_ENDPOINTS.GET_BY_ID(1)
      const endpoint2 = ACTIVITY_PLAN_ENDPOINTS.BY_CATEGORY('test')
      const endpoint3 = ACTIVITY_REGISTRATION_ENDPOINTS.BATCH_CONFIRM

      expect(typeof endpoint1).toBe('string')
      expect(typeof endpoint2).toBe('string')
      expect(typeof endpoint3).toBe('string')
    })
  })
})