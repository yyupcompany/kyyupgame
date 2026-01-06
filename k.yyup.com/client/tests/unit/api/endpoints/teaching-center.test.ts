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

describe, it, expect, vi, beforeEach } from 'vitest'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'
import { get } from '@/utils/request'

// Mock request module
vi.mock('@/utils/request', () => ({
  get: vi.fn()
}))

describe('Teaching Center API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCourseProgressStats', () => {
    it('应该成功获取课程进度统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          overall_stats: {
            overall_completion_rate: 75,
            overall_achievement_rate: 80
          },
          course_plans: [
            {
              id: 1,
              class_name: '小班A',
              completion_rate: 80,
              achievement_rate: 85
            }
          ]
        }
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await teachingCenterApi.getCourseProgressStats()

      expect(get).toHaveBeenCalledWith('/teaching/course-progress/stats')
      expect(result).toEqual(mockResponse)
    })

    it('应该处理API错误', async () => {
      const mockError = new Error('Network error')
      vi.mocked(get).mockRejectedValue(mockError)

      await expect(teachingCenterApi.getCourseProgressStats()).rejects.toThrow('Network error')
    })
  })

  describe('getOutdoorTrainingStats', () => {
    it('应该成功获取户外训练统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          overview: {
            outdoor_training: {
              average_rate: 65,
              completed_weeks: 8
            }
          },
          class_statistics: [
            {
              id: 1,
              class_name: '小班A',
              completion_rate: 70,
              completed_weeks: 10
            }
          ]
        }
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await teachingCenterApi.getOutdoorTrainingStats()

      expect(get).toHaveBeenCalledWith('/teaching/outdoor-training/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getExternalDisplayStats', () => {
    it('应该成功获取校外展示统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          overview: {
            average_achievement_rate: 70,
            semester_total_outings: 3,
            all_time_total_outings: 15
          },
          class_statistics: [
            {
              id: 1,
              class_name: '小班A',
              outing_count: 3,
              achievement_rate: 75
            }
          ]
        }
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await teachingCenterApi.getExternalDisplayStats()

      expect(get).toHaveBeenCalledWith('/teaching/external-display/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getChampionshipStats', () => {
    it('应该成功获取锦标赛统计', async () => {
      const mockResponse = {
        success: true,
        data: {
          achievement_rates: {
            brain_science_plan: 85,
            course_content: 75,
            outdoor_training_display: 80,
            external_display: 70
          },
          championship_list: [
            {
              id: 1,
              name: '春季锦标赛',
              brain_science_rate: 85,
              course_content_rate: 75,
              status: 'completed'
            }
          ]
        }
      }

      vi.mocked(get).mockResolvedValue(mockResponse)

      const result = await teachingCenterApi.getChampionshipStats()

      expect(get).toHaveBeenCalledWith('/teaching/championship/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('API错误处理', () => {
    it('应该处理401未授权错误', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Unauthorized'
          }
        }
      }

      vi.mocked(get).mockRejectedValue(mockError)

      try {
        await teachingCenterApi.getCourseProgressStats()
      } catch (error) {
        expect(error.response.status).toBe(401)
      }
    })

    it('应该处理404未找到错误', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            message: 'Not Found'
          }
        }
      }

      vi.mocked(get).mockRejectedValue(mockError)

      try {
        await teachingCenterApi.getOutdoorTrainingStats()
      } catch (error) {
        expect(error.response.status).toBe(404)
      }
    })

    it('应该处理500服务器错误', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            message: 'Internal Server Error'
          }
        }
      }

      vi.mocked(get).mockRejectedValue(mockError)

      try {
        await teachingCenterApi.getExternalDisplayStats()
      } catch (error) {
        expect(error.response.status).toBe(500)
      }
    })
  })

  describe('数据格式验证', () => {
    it('应该验证课程进度数据格式', async () => {
      const invalidResponse = {
        success: true,
        data: {
          // 缺少必要字段
          course_plans: []
        }
      }

      vi.mocked(get).mockResolvedValue(invalidResponse)

      const result = await teachingCenterApi.getCourseProgressStats()
      
      expect(result.data.overall_stats).toBeUndefined()
      expect(result.data.course_plans).toBeDefined()
    })

    it('应该验证户外训练数据格式', async () => {
      const invalidResponse = {
        success: true,
        data: {
          overview: {
            outdoor_training: {
              // 缺少average_rate字段
              completed_weeks: 8
            }
          }
        }
      }

      vi.mocked(get).mockResolvedValue(invalidResponse)

      const result = await teachingCenterApi.getOutdoorTrainingStats()
      
      expect(result.data.overview.outdoor_training.average_rate).toBeUndefined()
    })
  })

  describe('并发请求测试', () => {
    it('应该能够处理并发API请求', async () => {
      const mockResponses = [
        {
          success: true,
          data: { overall_stats: { overall_completion_rate: 75 } }
        },
        {
          success: true,
          data: { overview: { outdoor_training: { average_rate: 65 } } }
        },
        {
          success: true,
          data: { overview: { average_achievement_rate: 70 } }
        },
        {
          success: true,
          data: { achievement_rates: { brain_science_plan: 85 } }
        }
      ]

      vi.mocked(get).mockResolvedValue(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2])
        .mockResolvedValueOnce(mockResponses[3])

      const promises = [
        teachingCenterApi.getCourseProgressStats(),
        teachingCenterApi.getOutdoorTrainingStats(),
        teachingCenterApi.getExternalDisplayStats(),
        teachingCenterApi.getChampionshipStats()
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(4)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(results[2].success).toBe(true)
      expect(results[3].success).toBe(true)
    })
  })
})