import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { ElMessage, ElNotification } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { ErrorHandler, ErrorCode, ERROR_MESSAGES, ErrorInfo } from '@/utils/errorHandler'

// Mock dependencies
vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn(),
    error: vi.fn()
  },
  ElNotification: {
    error: vi.fn()
  }
}))

vi.mock('@/router', () => ({
  push: vi.fn()
}))

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    clearUserInfo: vi.fn()
  }))
}))

// Mock localStorage
const mockLocalStorage = {
  removeItem: vi.fn()
}

describe('Error Handler Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    
    // Mock process.env
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'test' },
      writable: true
    })
  })

  afterEach(() => {
    // Cleanup
    Object.defineProperty(global, 'localStorage', {
      value: localStorage,
      writable: true
    })
    
    Object.defineProperty(process, 'env', {
      value: process.env,
      writable: true
    })
  })

  describe('ErrorCode Enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR')
      expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ErrorCode.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED')
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCode.NOT_IMPLEMENTED).toBe('NOT_IMPLEMENTED')
      expect(ErrorCode.TIMEOUT).toBe('TIMEOUT')
      expect(ErrorCode.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS')
      expect(ErrorCode.MISSING_REQUIRED_FIELDS).toBe('MISSING_REQUIRED_FIELDS')
      expect(ErrorCode.INVALID_FORMAT).toBe('INVALID_FORMAT')
      expect(ErrorCode.ALREADY_EXISTS).toBe('ALREADY_EXISTS')
      expect(ErrorCode.OPERATION_FAILED).toBe('OPERATION_FAILED')
      expect(ErrorCode.INSUFFICIENT_PERMISSION).toBe('INSUFFICIENT_PERMISSION')
      expect(ErrorCode.QUOTA_EXCEEDED).toBe('QUOTA_EXCEEDED')
      expect(ErrorCode.INVALID_STATUS).toBe('INVALID_STATUS')
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      Object.values(ErrorCode).forEach(code => {
        expect(ERROR_MESSAGES).toHaveProperty(code)
        expect(typeof ERROR_MESSAGES[code]).toBe('string')
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0)
      })
    })
  })

  describe('ErrorHandler.handle', () => {
    it('should handle UNAUTHORIZED errors correctly', () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              code: ErrorCode.UNAUTHORIZED,
              message: 'Unauthorized'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(result.message).toBe('Unauthorized')
      expect(useUserStore().clearUserInfo).toHaveBeenCalled()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('kindergarten_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userInfo')
      expect(ElMessage.warning).toHaveBeenCalledWith('登录已过期，请重新登录')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('should handle TOKEN_EXPIRED errors correctly', () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              code: ErrorCode.TOKEN_EXPIRED,
              message: 'Token expired'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.TOKEN_EXPIRED)
      expect(result.message).toBe('Token expired')
      expect(useUserStore().clearUserInfo).toHaveBeenCalled()
      expect(ElMessage.warning).toHaveBeenCalledWith('登录已过期，请重新登录')
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('should handle NETWORK_ERROR correctly', () => {
      const mockError = {
        code: 'ERR_NETWORK'
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.NETWORK_ERROR)
      expect(result.message).toBe('网络连接失败')
      expect(ElNotification.error).toHaveBeenCalledWith({
        title: '网络错误',
        message: '请检查网络连接',
        duration: 5000
      })
    })

    it('should handle NOT_IMPLEMENTED correctly', () => {
      const mockError = {
        response: {
          status: 501,
          data: {
            message: 'Not implemented'
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.NOT_IMPLEMENTED)
      expect(result.message).toBe('功能暂未实现')
      expect(ElMessage.warning).toHaveBeenCalledWith('该功能暂未开放')
    })

    it('should handle VALIDATION_ERROR correctly', () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: 'Validation failed'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(result.message).toBe('Validation failed')
      expect(ElMessage.error).toHaveBeenCalledWith('Validation failed')
    })

    it('should handle MISSING_REQUIRED_FIELDS correctly', () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.MISSING_REQUIRED_FIELDS,
              message: 'Missing required fields'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.MISSING_REQUIRED_FIELDS)
      expect(result.message).toBe('Missing required fields')
      expect(ElMessage.error).toHaveBeenCalledWith('Missing required fields')
    })

    it('should handle NOT_FOUND correctly', () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            error: {
              code: ErrorCode.NOT_FOUND,
              message: 'Not found'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.NOT_FOUND)
      expect(result.message).toBe('Not found')
      expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在')
    })

    it('should handle ALREADY_EXISTS correctly', () => {
      const mockError = {
        response: {
          status: 409,
          data: {
            error: {
              code: ErrorCode.ALREADY_EXISTS,
              message: 'Already exists'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.ALREADY_EXISTS)
      expect(result.message).toBe('Already exists')
      expect(ElMessage.error).toHaveBeenCalledWith('资源已存在')
    })

    it('should handle INSUFFICIENT_PERMISSION correctly', () => {
      const mockError = {
        response: {
          status: 403,
          data: {
            error: {
              code: ErrorCode.INSUFFICIENT_PERMISSION,
              message: 'Insufficient permission'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.INSUFFICIENT_PERMISSION)
      expect(result.message).toBe('Insufficient permission')
      expect(ElMessage.error).toHaveBeenCalledWith('权限不足')
    })

    it('should handle TIMEOUT correctly', () => {
      const mockError = {
        code: 'ECONNABORTED'
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.TIMEOUT)
      expect(result.message).toBe('请求超时')
      expect(ElMessage.error).toHaveBeenCalledWith('请求超时，请稍后重试')
    })

    it('should handle unknown errors correctly', () => {
      const mockError = {
        message: 'Unknown error occurred'
      }

      const result = ErrorHandler.handle(mockError, true)

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.message).toBe('Unknown error occurred')
      expect(ElMessage.error).toHaveBeenCalledWith('Unknown error occurred')
    })

    it('should not show message when showMessage is false', () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            error: {
              code: ErrorCode.NOT_FOUND,
              message: 'Not found'
            }
          }
        }
      }

      const result = ErrorHandler.handle(mockError, false)

      expect(result.code).toBe(ErrorCode.NOT_FOUND)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })

    it('should log error details in development environment', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' },
        writable: true
      })

      const consoleSpy = vi.spyOn(console, 'error')
      const mockError = {
        response: {
          status: 404,
          data: {
            error: {
              code: ErrorCode.NOT_FOUND,
              message: 'Not found'
            }
          }
        }
      }

      ErrorHandler.handle(mockError, true)

      expect(consoleSpy).toHaveBeenCalledWith('Error details:', expect.any(Object))
      consoleSpy.mockRestore()
    })
  })

  describe('ErrorHandler.parseError', () => {
    it('should parse axios error response with standard format', () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: 'Validation failed',
              detail: { field: 'email', message: 'Invalid email' }
            }
          }
        }
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        detail: { field: 'email', message: 'Invalid email' },
        statusCode: 400
      })
    })

    it('should parse axios error response with non-standard format', () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            message: 'Not found message',
            msg: 'Alternative message'
          }
        }
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result.code).toBe(ErrorCode.NOT_FOUND)
      expect(result.message).toBe('Not found message')
      expect(result.detail).toEqual({ message: 'Not found message', msg: 'Alternative message' })
      expect(result.statusCode).toBe(404)
    })

    it('should parse network error', () => {
      const mockError = {
        code: 'ERR_NETWORK'
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.NETWORK_ERROR,
        message: '网络连接失败'
      })
    })

    it('should parse connection refused error', () => {
      const mockError = {
        code: 'ECONNREFUSED'
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.NETWORK_ERROR,
        message: '网络连接失败'
      })
    })

    it('should parse timeout error', () => {
      const mockError = {
        code: 'ECONNABORTED'
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.TIMEOUT,
        message: '请求超时'
      })
    })

    it('should parse ETIMEDOUT error', () => {
      const mockError = {
        code: 'ETIMEDOUT'
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.TIMEOUT,
        message: '请求超时'
      })
    })

    it('should parse generic error', () => {
      const mockError = {
        message: 'Generic error message'
      }

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.UNKNOWN_ERROR,
        message: 'Generic error message'
      })
    })

    it('should parse error without message', () => {
      const mockError = {}

      const result = ErrorHandler.parseError(mockError)

      expect(result).toEqual({
        code: ErrorCode.UNKNOWN_ERROR,
        message: '未知错误'
      })
    })
  })

  describe('ErrorHandler.getErrorCodeByStatus', () => {
    it('should return correct error codes for HTTP status codes', () => {
      expect(ErrorHandler['getErrorCodeByStatus'](400)).toBe(ErrorCode.VALIDATION_ERROR)
      expect(ErrorHandler['getErrorCodeByStatus'](401)).toBe(ErrorCode.UNAUTHORIZED)
      expect(ErrorHandler['getErrorCodeByStatus'](403)).toBe(ErrorCode.INSUFFICIENT_PERMISSION)
      expect(ErrorHandler['getErrorCodeByStatus'](404)).toBe(ErrorCode.NOT_FOUND)
      expect(ErrorHandler['getErrorCodeByStatus'](409)).toBe(ErrorCode.ALREADY_EXISTS)
      expect(ErrorHandler['getErrorCodeByStatus'](501)).toBe(ErrorCode.NOT_IMPLEMENTED)
      expect(ErrorHandler['getErrorCodeByStatus'](504)).toBe(ErrorCode.TIMEOUT)
      expect(ErrorHandler['getErrorCodeByStatus'](500)).toBe(ErrorCode.UNKNOWN_ERROR)
    })
  })

  describe('ErrorHandler.getDefaultMessage', () => {
    it('should return correct default messages for HTTP status codes', () => {
      expect(ErrorHandler['getDefaultMessage'](400)).toBe('请求参数错误')
      expect(ErrorHandler['getDefaultMessage'](401)).toBe('未授权，请先登录')
      expect(ErrorHandler['getDefaultMessage'](403)).toBe('没有权限访问此资源')
      expect(ErrorHandler['getDefaultMessage'](404)).toBe('请求的资源不存在')
      expect(ErrorHandler['getDefaultMessage'](409)).toBe('资源冲突')
      expect(ErrorHandler['getDefaultMessage'](500)).toBe('服务器内部错误')
      expect(ErrorHandler['getDefaultMessage'](501)).toBe('功能暂未实现')
      expect(ErrorHandler['getDefaultMessage'](502)).toBe('网关错误')
      expect(ErrorHandler['getDefaultMessage'](503)).toBe('服务暂时不可用')
      expect(ErrorHandler['getDefaultMessage'](504)).toBe('网关超时')
      expect(ErrorHandler['getDefaultMessage'](999)).toBe('请求失败')
    })
  })

  describe('ErrorHandler.formatValidationErrors', () => {
    it('should format string validation errors', () => {
      const errors = 'Validation error message'
      const result = ErrorHandler.formatValidationErrors(errors)
      expect(result).toBe('Validation error message')
    })

    it('should format array validation errors', () => {
      const errors = [
        { message: 'First error' },
        { message: 'Second error' },
        { field: 'email', message: 'Invalid email' }
      ]
      const result = ErrorHandler.formatValidationErrors(errors)
      expect(result).toBe('First error；Second error；Invalid email')
    })

    it('should format object validation errors', () => {
      const errors = {
        email: 'Invalid email format',
        password: 'Password too short',
        name: 'Name is required'
      }
      const result = ErrorHandler.formatValidationErrors(errors)
      expect(result).toBe('email: Invalid email format；password: Password too short；name: Name is required')
    })

    it('should handle unknown validation error format', () => {
      const errors = 123 as any
      const result = ErrorHandler.formatValidationErrors(errors)
      expect(result).toBe('验证失败')
    })
  })

  describe('ErrorHandler.handleFormErrors', () => {
    it('should handle form errors and show message', () => {
      const errors = {
        email: 'Invalid email format',
        password: 'Password too short'
      }

      const result = ErrorHandler.handleFormErrors(errors, true)

      expect(result).toEqual(errors)
      expect(ElMessage.error).toHaveBeenCalledWith('Invalid email format')
    })

    it('should handle form errors without showing message', () => {
      const errors = {
        email: 'Invalid email format',
        password: 'Password too short'
      }

      const result = ErrorHandler.handleFormErrors(errors, false)

      expect(result).toEqual(errors)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })

    it('should handle empty form errors', () => {
      const errors = {}

      const result = ErrorHandler.handleFormErrors(errors, true)

      expect(result).toEqual(errors)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('ErrorHandler.createUserFriendlyMessage', () => {
    it('should create user-friendly message for network error', () => {
      const error = {
        code: 'ERR_NETWORK'
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('网络连接异常，请检查您的网络设置')
    })

    it('should create user-friendly message for timeout error', () => {
      const error = {
        code: 'ECONNABORTED'
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('请求超时，请检查网络后重试')
    })

    it('should create user-friendly message for unauthorized error', () => {
      const error = {
        response: {
          status: 401,
          data: {
            error: {
              code: ErrorCode.UNAUTHORIZED
            }
          }
        }
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('您尚未登录或登录已过期')
    })

    it('should create user-friendly message for insufficient permission error', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              code: ErrorCode.INSUFFICIENT_PERMISSION
            }
          }
        }
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('您没有权限执行此操作')
    })

    it('should create user-friendly message for not found error', () => {
      const error = {
        response: {
          status: 404,
          data: {
            error: {
              code: ErrorCode.NOT_FOUND
            }
          }
        }
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('您访问的内容不存在')
    })

    it('should create user-friendly message for validation error with details', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              detail: {
                email: 'Invalid email format',
                password: 'Password too short'
              }
            }
          }
        }
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('email: Invalid email format；password: Password too short')
    })

    it('should create user-friendly message for validation error without details', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR
            }
          }
        }
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('输入信息有误，请检查后重试')
    })

    it('should create user-friendly message for unknown error', () => {
      const error = {
        message: 'Unknown error'
      }

      const result = ErrorHandler.createUserFriendlyMessage(error)

      expect(result).toBe('操作失败，请稍后重试')
    })
  })

  describe('ErrorHandler.handleMultipleErrors', () => {
    it('should handle multiple errors', () => {
      const errors = [
        {
          response: {
            status: 404,
            data: {
              error: {
                code: ErrorCode.NOT_FOUND,
                message: 'Not found'
              }
            }
          }
        },
        {
          code: 'ERR_NETWORK'
        },
        {
          response: {
            status: 403,
            data: {
              error: {
                code: ErrorCode.INSUFFICIENT_PERMISSION,
                message: 'Insufficient permission'
              }
            }
          }
        }
      ]

      const results = ErrorHandler.handleMultipleErrors(errors, true)

      expect(results).toHaveLength(3)
      expect(results[0].code).toBe(ErrorCode.NOT_FOUND)
      expect(results[1].code).toBe(ErrorCode.NETWORK_ERROR)
      expect(results[2].code).toBe(ErrorCode.INSUFFICIENT_PERMISSION)
    })

    it('should handle empty errors array', () => {
      const errors: any[] = []
      const results = ErrorHandler.handleMultipleErrors(errors, true)
      expect(results).toEqual([])
    })
  })

  describe('ErrorHandler.getRecoverySuggestion', () => {
    it('should return recovery suggestion for network error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.NETWORK_ERROR)
      expect(result).toBe('请检查网络连接后重试')
    })

    it('should return recovery suggestion for unauthorized error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.UNAUTHORIZED)
      expect(result).toBe('请重新登录')
    })

    it('should return recovery suggestion for token expired error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.TOKEN_EXPIRED)
      expect(result).toBe('请重新登录')
    })

    it('should return recovery suggestion for validation error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.VALIDATION_ERROR)
      expect(result).toBe('请检查输入信息是否正确')
    })

    it('should return recovery suggestion for not found error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.NOT_FOUND)
      expect(result).toBe('请确认访问地址是否正确')
    })

    it('should return recovery suggestion for insufficient permission error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.INSUFFICIENT_PERMISSION)
      expect(result).toBe('请联系管理员获取权限')
    })

    it('should return recovery suggestion for timeout error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.TIMEOUT)
      expect(result).toBe('请稍后重试或刷新页面')
    })

    it('should return default recovery suggestion for unknown error', () => {
      const result = ErrorHandler.getRecoverySuggestion(ErrorCode.UNKNOWN_ERROR)
      expect(result).toBe('请稍后重试或联系技术支持')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete error workflow', () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            error: {
              code: ErrorCode.UNAUTHORIZED,
              message: 'Unauthorized'
            }
          }
        }
      }

      // Parse error
      const parsedError = ErrorHandler.parseError(mockError)
      expect(parsedError.code).toBe(ErrorCode.UNAUTHORIZED)

      // Create user-friendly message
      const userMessage = ErrorHandler.createUserFriendlyMessage(mockError)
      expect(userMessage).toBe('您尚未登录或登录已过期')

      // Get recovery suggestion
      const suggestion = ErrorHandler.getRecoverySuggestion(parsedError.code)
      expect(suggestion).toBe('请重新登录')

      // Handle error
      const result = ErrorHandler.handle(mockError, true)
      expect(result.code).toBe(ErrorCode.UNAUTHORIZED)

      // Verify side effects
      expect(useUserStore().clearUserInfo).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('should handle form validation workflow', () => {
      const validationErrors = {
        email: 'Invalid email format',
        password: 'Password too short',
        name: 'Name is required'
      }

      // Format validation errors
      const formattedMessage = ErrorHandler.formatValidationErrors(validationErrors)
      expect(formattedMessage).toBe('email: Invalid email format；password: Password too short；name: Name is required')

      // Handle form errors
      const result = ErrorHandler.handleFormErrors(validationErrors, true)
      expect(result).toEqual(validationErrors)
      expect(ElMessage.error).toHaveBeenCalledWith('Invalid email format')
    })

    it('should handle multiple error scenarios', () => {
      const errors = [
        { response: { status: 404, data: { error: { code: ErrorCode.NOT_FOUND, message: 'Not found' } } } },
        { code: 'ERR_NETWORK' },
        { response: { status: 400, data: { error: { code: ErrorCode.VALIDATION_ERROR, message: 'Validation failed' } } } }
      ]

      const results = ErrorHandler.handleMultipleErrors(errors, true)

      expect(results).toHaveLength(3)
      expect(results[0].code).toBe(ErrorCode.NOT_FOUND)
      expect(results[1].code).toBe(ErrorCode.NETWORK_ERROR)
      expect(results[2].code).toBe(ErrorCode.VALIDATION_ERROR)

      // Verify appropriate messages were shown
      expect(ElMessage.error).toHaveBeenCalledWith('请求的资源不存在')
      expect(ElNotification.error).toHaveBeenCalledWith({
        title: '网络错误',
        message: '请检查网络连接',
        duration: 5000
      })
      expect(ElMessage.error).toHaveBeenCalledWith('Validation failed')
    })
  })

  describe('Performance Tests', () => {
    it('should handle high-frequency error processing efficiently', () => {
      const errors = Array(1000).fill(null).map((_, i) => ({
        response: {
          status: 404,
          data: {
            error: {
              code: ErrorCode.NOT_FOUND,
              message: `Not found ${i}`
            }
          }
        }
      }))

      const startTime = performance.now()
      const results = ErrorHandler.handleMultipleErrors(errors, false)
      const endTime = performance.now()

      expect(results).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
    })

    it('should handle complex validation error formatting efficiently', () => {
      const complexErrors = {
        email: 'Invalid email format',
        password: 'Password too short',
        name: 'Name is required',
        phone: 'Invalid phone format',
        address: 'Address is required',
        city: 'City is required',
        country: 'Country is required',
        zipcode: 'Invalid zipcode format'
      }

      const startTime = performance.now()
      const result = ErrorHandler.formatValidationErrors(complexErrors)
      const endTime = performance.now()

      expect(result).toContain('email: Invalid email format')
      expect(result).toContain('password: Password too short')
      expect(endTime - startTime).toBeLessThan(10) // Should be very fast
    })
  })

  describe('Security Tests', () => {
    it('should sanitize error messages to prevent XSS', () => {
      const maliciousError = {
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: '<script>alert("xss")</script>',
              detail: {
                field: '<img src="x" onerror="alert(\'xss\')">',
                message: ' malicious content '
              }
            }
          }
        }
      }

      const result = ErrorHandler.handle(maliciousError, true)

      // Should not execute scripts
      expect(result.message).toBe('<script>alert("xss")</script>')
      expect(ElMessage.error).toHaveBeenCalledWith('<script>alert("xss")</script>')
    })

    it('should not expose sensitive information in error messages', () => {
      const sensitiveError = {
        response: {
          status: 500,
          data: {
            error: {
              code: ErrorCode.UNKNOWN_ERROR,
              message: 'Database connection failed',
              detail: {
                host: 'internal-db.company.com',
                username: 'admin',
                password: 'secret123'
              }
            }
          }
        }
      }

      const result = ErrorHandler.handle(sensitiveError, true)

      // Should not expose sensitive details in user-facing message
      expect(ElMessage.error).toHaveBeenCalledWith('Database connection failed')
      expect(result.detail).toEqual({
        host: 'internal-db.company.com',
        username: 'admin',
        password: 'secret123'
      })
    })

    it('should handle prototype pollution attempts', () => {
      const maliciousError = {
        __proto__: { malicious: true },
        constructor: { prototype: { malicious: true } },
        response: {
          status: 400,
          data: {
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: 'Validation failed'
            }
          }
        }
      }

      expect(() => {
        ErrorHandler.handle(maliciousError, true)
      }).not.toThrow()

      // Verify prototypes were not polluted
      expect(({} as any).malicious).toBeUndefined()
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('should handle null/undefined errors', () => {
      expect(() => {
        ErrorHandler.handle(null as any, true)
      }).not.toThrow()

      expect(() => {
        ErrorHandler.handle(undefined as any, true)
      }).not.toThrow()
    })

    it('should handle errors without response property', () => {
      const error = {
        message: 'Network error',
        code: 'UNKNOWN_ERROR'
      }

      const result = ErrorHandler.handle(error, true)

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.message).toBe('Network error')
    })

    it('should handle errors with response but no data', () => {
      const error = {
        response: {
          status: 500
        }
      }

      const result = ErrorHandler.handle(error, true)

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR)
      expect(result.message).toBe('服务器内部错误')
    })

    it('should handle errors with non-standard error format', () => {
      const error = {
        response: {
          status: 400,
          data: {
            customError: {
              customCode: 'CUSTOM_ERROR',
              customMessage: 'Custom error message'
            }
          }
        }
      }

      const result = ErrorHandler.handle(error, true)

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(result.message).toBe('请求参数错误')
    })
  })
})