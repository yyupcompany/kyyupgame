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

describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue('confirm')
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot /></div>'
    },
    ElTable: {
      name: 'ElTable',
      template: '<div class="el-table"><slot /></div>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      template: '<div class="el-table-column"><slot /></div>'
    },
    ElButton: {
      name: 'ElButton',
      template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
      emits: ['click']
    },
    ElForm: {
      name: 'ElForm',
      template: '<form class="el-form"><slot /></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      template: '<div class="el-form-item"><slot /></div>'
    },
    ElInput: {
      name: 'ElInput',
      template: '<input class="el-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      emits: ['update:modelValue']
    },
    ElSelect: {
      name: 'ElSelect',
      template: '<div class="el-select"><slot /></div>'
    },
    ElOption: {
      name: 'ElOption',
      template: '<div class="el-option" />'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      template: '<div class="el-date-picker" />'
    },
    ElProgress: {
      name: 'ElProgress',
      template: '<div class="el-progress" />'
    }
  }
})

// Mock ECharts
vi.mock('echarts', () => ({
  default: vi.fn().mockImplementation(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  }))
}))

// Mock API calls
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import EnrollmentPlanPrediction from '@/components/enrollment/EnrollmentPlanPrediction.vue'

describe('EnrollmentPlanPrediction Component', () => {
  let router: any
  let pinia: any
  let wrapper: any

  beforeEach(async () => {
    vi.clearAllMocks()
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/enrollment', component: { template: '<div>Enrollment</div>' } }
      ]
    })
    pinia = createPinia()
    
    await router.push('/')
    await router.isReady()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.enrollment-plan-prediction').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await nextTick()
      expect(wrapper.vm.predictionData).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.selectedYear).toBe(new Date().getFullYear().toString())
    })
  })

  describe('Historical Data Based Prediction', () => {
    it('should load historical enrollment data', async () => {
      const mockHistoricalData = [
        { year: '2021', enrolled: 85, target: 100 },
        { year: '2022', enrolled: 92, target: 100 },
        { year: '2023', enrolled: 88, target: 100 }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockHistoricalData,
        message: 'success'
      })

      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadHistoricalData()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/historical-data')
      expect(wrapper.vm.historicalData).toEqual(mockHistoricalData)
    })

    it('should generate predictions based on historical data', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.historicalData = [
        { year: '2021', enrolled: 85, target: 100 },
        { year: '2022', enrolled: 92, target: 100 },
        { year: '2023', enrolled: 88, target: 100 }
      ]

      await wrapper.vm.generatePrediction()
      await nextTick()

      expect(wrapper.vm.predictionData.length).toBeGreaterThan(0)
      expect(wrapper.vm.predictionData[0]).toHaveProperty('year')
      expect(wrapper.vm.predictionData[0]).toHaveProperty('predicted')
      expect(wrapper.vm.predictionData[0]).toHaveProperty('confidence')
    })

    it('should handle empty historical data gracefully', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.historicalData = []
      await wrapper.vm.generatePrediction()
      await nextTick()

      expect(wrapper.vm.predictionData).toEqual([])
      expect(wrapper.vm.error).toContain('历史数据不足')
    })
  })

  describe('Class Capacity Optimization', () => {
    it('should optimize class capacity allocation', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const mockClasses = [
        { grade: '小班', capacity: 25, current: 20 },
        { grade: '中班', capacity: 30, current: 28 },
        { grade: '大班', capacity: 35, current: 30 }
      ]

      wrapper.vm.classes = mockClasses
      wrapper.vm.predictedEnrollment = 95

      await wrapper.vm.optimizeClassCapacity()
      await nextTick()

      expect(wrapper.vm.optimizedAllocation).toBeDefined()
      expect(wrapper.vm.optimizedAllocation.length).toBe(3)
      expect(wrapper.vm.optimizedAllocation[0]).toHaveProperty('grade')
      expect(wrapper.vm.optimizedAllocation[0]).toHaveProperty('recommendedCapacity')
    })

    it('should validate capacity constraints', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.classes = [
        { grade: '小班', capacity: 25, current: 20 },
        { grade: '中班', capacity: 30, current: 28 },
        { grade: '大班', capacity: 35, current: 30 }
      ]
      wrapper.vm.predictedEnrollment = 200 // Unrealistic number

      await wrapper.vm.optimizeClassCapacity()
      await nextTick()

      expect(wrapper.vm.error).toContain('容量超出限制')
    })
  })

  describe('Seasonal Enrollment Trend Prediction', () => {
    it('should predict seasonal enrollment trends', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const mockSeasonalData = [
        { month: '1', applications: 5, enrollments: 3 },
        { month: '2', applications: 8, enrollments: 6 },
        { month: '3', applications: 45, enrollments: 38 }
      ]

      wrapper.vm.seasonalData = mockSeasonalData
      await wrapper.vm.predictSeasonalTrends()
      await nextTick()

      expect(wrapper.vm.seasonalPrediction).toBeDefined()
      expect(wrapper.vm.seasonalPrediction.length).toBe(12)
      expect(wrapper.vm.seasonalPrediction[2]).toHaveProperty('peakMonth')
    })

    it('should identify peak enrollment months', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.seasonalData = [
        { month: '1', applications: 5, enrollments: 3 },
        { month: '2', applications: 8, enrollments: 6 },
        { month: '3', applications: 45, enrollments: 38 },
        { month: '4', applications: 25, enrollments: 20 },
        { month: '5', applications: 15, enrollments: 12 }
      ]

      await wrapper.vm.predictSeasonalTrends()
      await nextTick()

      const peakMonth = wrapper.vm.seasonalPrediction.find((p: any) => p.peakMonth)
      expect(peakMonth.month).toBe('3')
    })
  })

  describe('Prediction Accuracy Validation', () => {
    it('should calculate prediction accuracy', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const predictions = [
        { year: '2023', predicted: 90, actual: 88 },
        { year: '2022', predicted: 85, actual: 92 }
      ]

      wrapper.vm.previousPredictions = predictions
      await wrapper.vm.calculateAccuracy()
      await nextTick()

      expect(wrapper.vm.accuracy).toBeDefined()
      expect(wrapper.vm.accuracy).toHaveProperty('mape')
      expect(wrapper.vm.accuracy).toHaveProperty('rmse')
      expect(wrapper.vm.accuracy).toHaveProperty('r2')
    })

    it('should validate prediction confidence intervals', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.predictionData = [
        { year: '2024', predicted: 95, confidence: 0.85, lowerBound: 85, upperBound: 105 }
      ]

      await wrapper.vm.validateConfidenceIntervals()
      await nextTick()

      expect(wrapper.vm.validationResults).toBeDefined()
      expect(wrapper.vm.validationResults.confidenceValid).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { get } = await import('@/utils/request')
      get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadHistoricalData()
      await nextTick()

      expect(wrapper.vm.error).toBe('Network error')
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should handle invalid data format', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: 'invalid data',
        message: 'success'
      })

      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadHistoricalData()
      await nextTick()

      expect(wrapper.vm.error).toContain('数据格式错误')
    })
  })

  describe('User Interactions', () => {
    it('should handle year selection change', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true,
            'el-select': {
              template: '<select @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
              emits: ['update:modelValue']
            }
          }
        }
      })

      await wrapper.setData({ selectedYear: '2025' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedYear).toBe('2025')
    })

    it('should trigger prediction generation on button click', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': {
              template: '<button class="el-button" @click="$emit(\'click\')"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      const generateSpy = vi.spyOn(wrapper.vm, 'generatePrediction')
      await wrapper.find('.generate-prediction-btn').trigger('click')

      expect(generateSpy).toHaveBeenCalled()
    })
  })

  describe('Chart Rendering', () => {
    it('should render prediction chart', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      wrapper.vm.predictionData = [
        { year: '2024', predicted: 95, confidence: 0.85 }
      ]

      await wrapper.vm.renderPredictionChart()
      await nextTick()

      expect(wrapper.vm.predictionChart).toBeDefined()
    })

    it('should update chart on data change', async () => {
      wrapper = mount(EnrollmentPlanPrediction, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const setOptionSpy = vi.fn()
      wrapper.vm.predictionChart = { setOption: setOptionSpy }

      await wrapper.vm.updateChart()
      await nextTick()

      expect(setOptionSpy).toHaveBeenCalled()
    })
  })
})