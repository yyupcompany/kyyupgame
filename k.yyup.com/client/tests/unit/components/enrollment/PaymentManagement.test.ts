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
    },
    ElDialog: {
      name: 'ElDialog',
      template: '<div class="el-dialog"><slot /></div>'
    },
    ElSteps: {
      name: 'ElSteps',
      template: '<div class="el-steps"><slot /></div>'
    },
    ElStep: {
      name: 'ElStep',
      template: '<div class="el-step" />'
    }
  }
})

// Mock API calls
vi.mock('@/utils/request', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

import PaymentManagement from '@/components/enrollment/PaymentManagement.vue'

describe('PaymentManagement Component', () => {
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
      wrapper = mount(PaymentManagement, {
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
      expect(wrapper.find('.payment-management').exists()).toBe(true)
    })

    it('should initialize with default data', async () => {
      wrapper = mount(PaymentManagement, {
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
      expect(wrapper.vm.payments).toEqual([])
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.paymentStatus).toBe('all')
    })
  })

  describe('Payment Processing', () => {
    it('should load payment records', async () => {
      const mockPayments = [
        {
          id: 1,
          studentName: '张三',
          enrollmentPlan: '2024年春季招生',
          amount: 2500,
          paidAmount: 2500,
          status: 'paid',
          paymentDate: '2024-01-15T10:30:00Z',
          paymentMethod: 'bank_transfer'
        },
        {
          id: 2,
          studentName: '李四',
          enrollmentPlan: '2024年春季招生',
          amount: 2500,
          paidAmount: 1250,
          status: 'partial',
          paymentDate: '2024-01-16T14:20:00Z',
          paymentMethod: 'wechat'
        }
      ]

      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: mockPayments,
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.loadPayments()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/payments')
      expect(wrapper.vm.payments).toEqual(mockPayments)
    })

    it('should process new payment', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 201,
        data: {
          paymentId: 'PAY202401150001',
          status: 'success',
          transactionId: 'TXN123456789'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentData = {
        enrollmentId: 1,
        amount: 2500,
        paymentMethod: 'bank_transfer',
        payerName: '张三',
        payerPhone: '13900139001'
      }

      await wrapper.vm.processPayment(paymentData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/process', paymentData)
      expect(wrapper.vm.paymentResult).toBeDefined()
      expect(wrapper.vm.paymentResult.status).toBe('success')
    })

    it('should handle partial payments', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const partialPayment = {
        enrollmentId: 2,
        amount: 1250,
        totalAmount: 2500,
        paymentMethod: 'wechat'
      }

      await wrapper.vm.processPartialPayment(partialPayment)
      await nextTick()

      expect(wrapper.vm.partialPaymentResult).toBeDefined()
      expect(wrapper.vm.partialPaymentResult.remainingAmount).toBe(1250)
    })

    it('should validate payment amount', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const invalidPayment = {
        amount: 0, // Invalid amount
        paymentMethod: 'bank_transfer'
      }

      const isValid = await wrapper.vm.validatePaymentAmount(invalidPayment.amount)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('支付金额必须大于0')
    })
  })

  describe('Multiple Payment Methods', () => {
    it('should support various payment methods', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentMethods = [
        'bank_transfer',
        'wechat',
        'alipay',
        'cash',
        'check'
      ]

      const supportedMethods = await wrapper.vm.getSupportedPaymentMethods()
      await nextTick()

      expect(supportedMethods).toEqual(paymentMethods)
    })

    it('should handle WeChat payment integration', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          qrCodeUrl: 'https://api.weixin.qq.com/pay/qrcode/123',
          prepayId: 'wx123456789',
          expiresAt: '2024-01-15T11:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const wechatData = {
        enrollmentId: 1,
        amount: 2500,
        paymentMethod: 'wechat'
      }

      await wrapper.vm.initiateWeChatPayment(wechatData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/wechat/initiate', wechatData)
      expect(wrapper.vm.wechatPaymentData).toBeDefined()
      expect(wrapper.vm.wechatPaymentData.qrCodeUrl).toBeDefined()
    })

    it('should handle Alipay payment integration', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          qrCodeUrl: 'https://api.alipay.com/pay/qrcode/123',
          tradeNo: 'ALI123456789',
          expiresAt: '2024-01-15T11:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const alipayData = {
        enrollmentId: 1,
        amount: 2500,
        paymentMethod: 'alipay'
      }

      await wrapper.vm.initiateAlipayPayment(alipayData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/alipay/initiate', alipayData)
      expect(wrapper.vm.alipayPaymentData).toBeDefined()
      expect(wrapper.vm.alipayPaymentData.qrCodeUrl).toBeDefined()
    })

    it('should handle bank transfer verification', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          verified: true,
          verificationTime: '2024-01-15T15:30:00Z',
          verifiedBy: 'admin'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const verificationData = {
        paymentId: 1,
        transferProof: 'transfer_proof.jpg',
        transferAmount: 2500,
        transferDate: '2024-01-15'
      }

      await wrapper.vm.verifyBankTransfer(verificationData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/bank-transfer/verify', verificationData)
      expect(wrapper.vm.verificationResult).toBeDefined()
      expect(wrapper.vm.verificationResult.verified).toBe(true)
    })
  })

  describe('Payment Status Tracking', () => {
    it('should track payment status changes', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          paymentId: 1,
          status: 'paid',
          previousStatus: 'pending',
          statusChangeTime: '2024-01-15T10:30:00Z',
          statusChangeReason: '支付完成'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.trackPaymentStatus(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/payments/1/status')
      expect(wrapper.vm.paymentStatusHistory).toBeDefined()
      expect(wrapper.vm.paymentStatusHistory.status).toBe('paid')
    })

    it('should handle payment callbacks', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          success: true,
          paymentId: 'PAY123456',
          transactionId: 'TXN789012'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const callbackData = {
        paymentId: 'PAY123456',
        transactionId: 'TXN789012',
        status: 'success',
        signature: 'verified_signature'
      }

      await wrapper.vm.handlePaymentCallback(callbackData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/callback', callbackData)
      expect(wrapper.vm.callbackResult).toBeDefined()
      expect(wrapper.vm.callbackResult.success).toBe(true)
    })

    it('should generate payment receipts', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          receiptUrl: '/api/enrollment/payments/1/receipt',
          receiptNumber: 'REC202401150001',
          issueDate: '2024-01-15T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generateReceipt(1)
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/payments/1/receipt')
      expect(wrapper.vm.receiptData).toBeDefined()
      expect(wrapper.vm.receiptData.receiptNumber).toBeDefined()
    })
  })

  describe('Refund Management', () => {
    it('should process refund requests', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 200,
        data: {
          refundId: 'REF202401150001',
          refundAmount: 2500,
          refundStatus: 'processing',
          estimatedRefundTime: '2024-01-20T10:30:00Z'
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const refundData = {
        paymentId: 1,
        refundAmount: 2500,
        refundReason: '学生退学',
        refundMethod: 'original_payment_method'
      }

      await wrapper.vm.processRefund(refundData)
      await nextTick()

      expect(post).toHaveBeenCalledWith('/api/enrollment/payments/refund', refundData)
      expect(wrapper.vm.refundResult).toBeDefined()
      expect(wrapper.vm.refundResult.refundStatus).toBe('processing')
    })

    it('should validate refund eligibility', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentInfo = {
        paymentId: 1,
        paymentDate: '2024-01-01T10:30:00Z',
        amount: 2500,
        status: 'paid'
      }

      const isEligible = await wrapper.vm.validateRefundEligibility(paymentInfo)
      await nextTick()

      expect(isEligible).toBe(true)
    })

    it('should track refund status', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          refundId: 'REF202401150001',
          status: 'completed',
          completedAt: '2024-01-18T15:30:00Z',
          refundAmount: 2500
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.trackRefundStatus('REF202401150001')
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/payments/refund/REF202401150001/status')
      expect(wrapper.vm.refundStatus).toBeDefined()
      expect(wrapper.vm.refundStatus.status).toBe('completed')
    })
  })

  describe('Payment Analytics', () => {
    it('should generate payment statistics', async () => {
      const { get } = await import('@/utils/request')
      get.mockResolvedValue({
        code: 200,
        data: {
          totalPayments: 100,
          totalAmount: 250000,
          paidAmount: 225000,
          pendingAmount: 25000,
          paymentMethods: {
            bank_transfer: { count: 40, amount: 100000 },
            wechat: { count: 35, amount: 87500 },
            alipay: { count: 25, amount: 62500 }
          },
          monthlyTrends: [
            { month: '2024-01', amount: 50000, count: 20 },
            { month: '2024-02', amount: 75000, count: 30 }
          ]
        },
        message: 'success'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      await wrapper.vm.generatePaymentStatistics()
      await nextTick()

      expect(get).toHaveBeenCalledWith('/api/enrollment/payments/statistics')
      expect(wrapper.vm.paymentStats).toBeDefined()
      expect(wrapper.vm.paymentStats.totalPayments).toBe(100)
    })

    it('should analyze payment method distribution', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentData = [
        { method: 'bank_transfer', amount: 100000 },
        { method: 'wechat', amount: 87500 },
        { method: 'alipay', amount: 62500 }
      ]

      const distribution = await wrapper.vm.analyzePaymentMethodDistribution(paymentData)
      await nextTick()

      expect(distribution).toBeDefined()
      expect(distribution.length).toBe(3)
      expect(distribution[0]).toHaveProperty('method')
      expect(distribution[0]).toHaveProperty('percentage')
    })

    it('should generate payment trend analysis', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const monthlyData = [
        { month: '2024-01', amount: 50000, count: 20 },
        { month: '2024-02', amount: 75000, count: 30 },
        { month: '2024-03', amount: 60000, count: 24 }
      ]

      const trend = await wrapper.vm.generatePaymentTrend(monthlyData)
      await nextTick()

      expect(trend).toBeDefined()
      expect(trend).toHaveProperty('growthRate')
      expect(trend).toHaveProperty('averageAmount')
    })
  })

  describe('Error Handling', () => {
    it('should handle payment processing errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Payment processing failed'))

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentData = {
        enrollmentId: 1,
        amount: 2500
      }

      await wrapper.vm.processPayment(paymentData)
      await nextTick()

      expect(wrapper.vm.error).toBe('Payment processing failed')
    })

    it('should handle insufficient balance errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockResolvedValue({
        code: 400,
        message: 'Insufficient balance'
      })

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentData = {
        enrollmentId: 1,
        amount: 999999 // Excessive amount
      }

      await wrapper.vm.processPayment(paymentData)
      await nextTick()

      expect(wrapper.vm.error).toContain('Insufficient balance')
    })

    it('should handle network timeout errors', async () => {
      const { post } = await import('@/utils/request')
      post.mockRejectedValue(new Error('Network timeout'))

      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const paymentData = {
        enrollmentId: 1,
        amount: 2500
      }

      await wrapper.vm.processPayment(paymentData)
      await nextTick()

      expect(wrapper.vm.error).toBe('Network timeout')
    })
  })

  describe('User Interactions', () => {
    it('should handle payment method selection', async () => {
      wrapper = mount(PaymentManagement, {
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

      await wrapper.setData({ selectedPaymentMethod: 'wechat' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.selectedPaymentMethod).toBe('wechat')
    })

    it('should trigger payment processing on button click', async () => {
      wrapper = mount(PaymentManagement, {
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

      const processSpy = vi.spyOn(wrapper.vm, 'processPayment')
      await wrapper.find('.process-payment-btn').trigger('click')

      expect(processSpy).toHaveBeenCalled()
    })

    it('should handle receipt download', async () => {
      wrapper = mount(PaymentManagement, {
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

      const downloadSpy = vi.spyOn(wrapper.vm, 'downloadReceipt')
      await wrapper.find('.download-receipt-btn').trigger('click')

      expect(downloadSpy).toHaveBeenCalled()
    })
  })

  describe('Security and Validation', () => {
    it('should validate payment signatures', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const callbackData = {
        paymentId: 'PAY123456',
        transactionId: 'TXN789012',
        signature: 'valid_signature'
      }

      const isValid = await wrapper.vm.validatePaymentSignature(callbackData)
      await nextTick()

      expect(isValid).toBe(true)
    })

    it('should prevent duplicate payments', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const existingPayment = {
        enrollmentId: 1,
        status: 'paid',
        paymentId: 'PAY123456'
      }

      const isDuplicate = await wrapper.vm.checkDuplicatePayment(existingPayment)
      await nextTick()

      expect(isDuplicate).toBe(true)
      expect(wrapper.vm.error).toContain('重复支付')
    })

    it('should validate payment amount limits', async () => {
      wrapper = mount(PaymentManagement, {
        global: {
          plugins: [router, pinia],
          stubs: {
            'el-card': true,
            'el-table': true,
            'el-button': true
          }
        }
      })

      const excessiveAmount = 1000000 // 1 million
      const isValid = await wrapper.vm.validateAmountLimit(excessiveAmount)
      await nextTick()

      expect(isValid).toBe(false)
      expect(wrapper.vm.error).toContain('超出支付限额')
    })
  })
})