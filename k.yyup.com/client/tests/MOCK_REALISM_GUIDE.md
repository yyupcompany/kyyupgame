# Mock真实性使用指南

## 概述

本指南确保测试环境中的Mock数据与真实API响应结构100%一致，遵循项目的严格验证规则。

## 🚨 核心规则

### 强制验证标准
1. ✅ **数据结构验证** - 验证API返回的数据格式
2. ✅ **字段类型验证** - 验证所有字段的数据类型
3. ✅ **必填字段验证** - 验证所有必填字段存在
4. ✅ **控制台错误检测** - 捕获所有控制台错误

### 禁止行为
- ❌ 只使用 `expect(result).toEqual(mockResponse)` 的浅层验证
- ❌ 忽略错误场景和异常情况
- ❌ 使用不真实的假数据

## 🔧 Mock配置系统

### 1. 全局Mock设置

位置：`client/tests/setup.ts`

```typescript
import { setupRequestMock } from './mocks/request.mock'

// 全局设置
beforeAll(() => {
  // 设置Request Mock（解决aiService导出问题）
  setupRequestMock()
})
```

### 2. API Mock配置

位置：`client/tests/mocks/api.mock.ts`

```typescript
// API路由映射
export const apiRoutes = {
  '/auto-image/generate': {
    method: 'POST',
    response: (data: any) => ({
      success: true,
      data: {
        imageUrl: 'https://example.com/generated-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 150,
          total_tokens: 200
        }
      },
      message: '图片生成成功'
    })
  }
}
```

### 3. Request Mock导出

位置：`client/tests/mocks/request.mock.ts`

```typescript
export const mockRequestModule = {
  // 默认导出
  default: mockRequest,

  // AI服务相关导出（必须与真实模块一致）
  aiService: mockAxios,
  aiRequest: mockAxios,
  videoCreationRequest: {
    get: mockAxios.get,
    post: mockAxios.post,
    put: mockAxios.put,
    delete: mockAxios.delete
  },

  // 兼容性导出
  requestFunc: mockRequest,
  requestMethod: mockRequest,
  getApiBaseURL: () => 'http://localhost:3000/api'
}
```

## 📋 真实性验证工具

### 1. API响应验证

```typescript
import { validateMockRealism } from '@/tests/utils/mock-validation'

// 验证Mock真实性
const mockResponse = {
  success: true,
  data: {
    imageUrl: 'https://example.com/image.jpg'
  },
  message: '操作成功'
}

const isValid = validateMockRealism('/auto-image/generate', 'POST', mockResponse)
expect(isValid).toBe(true) // 验证通过
```

### 2. 严格验证规则

```typescript
import { strictValidationTools } from '@/tests/utils/mock-validation'

// 必填字段验证
const { valid, missing } = strictValidationTools.validateRequiredFields(
  response,
  ['success', 'data', 'message']
)
expect(valid).toBe(true)
expect(missing).toHaveLength(0)

// 字段类型验证
const { valid: typeValid, typeErrors } = strictValidationTools.validateFieldTypes(
  response,
  {
    success: 'boolean',
    data: 'object',
    message: 'string'
  }
)
expect(typeValid).toBe(true)
expect(typeErrors).toHaveLength(0)
```

### 3. 控制台错误检测

```typescript
const { hasErrors, errors } = strictValidationTools.detectConsoleErrors(() => {
  // 执行可能产生错误的代码
  someApiCall()
})

expect(hasErrors).toBe(false)
expect(errors).toHaveLength(0)
```

## 🎯 测试编写最佳实践

### 1. API测试

```typescript
describe('Auto Image API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate image with correct response structure', async () => {
    const requestData = {
      prompt: 'A beautiful sunset',
      category: 'activity',
      style: 'natural'
    }

    const mockResponse = {
      success: true,
      data: {
        imageUrl: 'https://example.com/generated-image.jpg',
        usage: {
          generated_images: 1,
          output_tokens: 150,
          total_tokens: 200
        },
        metadata: {
          prompt: requestData.prompt,
          model: 'dall-e-3',
          parameters: requestData,
          duration: 2.5
        }
      },
      message: '图片生成成功'
    }

    // 验证Mock真实性
    expect(validateMockRealism('/auto-image/generate', 'POST', mockResponse)).toBe(true)

    vi.mocked(request.post).mockResolvedValue(mockResponse)

    const result = await api.generateImage(requestData)

    // 严格验证，不只是浅层比较
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(typeof result.data.imageUrl).toBe('string')
    expect(result.data.imageUrl).toMatch(/^https:\/\//)
    expect(result.data.usage).toBeDefined()
    expect(result.data.usage.generated_images).toBe(1)
    expect(result.message).toBe('图片生成成功')

    // 验证请求参数
    expect(request.post).toHaveBeenCalledWith('/auto-image/generate', requestData)
  })
})
```

### 2. 组件测试

```typescript
describe('UserForm', () => {
  it('should handle form submission correctly', async () => {
    const wrapper = createWrapper()

    // 设置表单数据
    await wrapper.setData({
      formData: {
        username: 'testuser',
        email: 'test@example.com',
        roleIds: ['1']
      }
    })

    // Mock表单验证
    wrapper.vm.formRef = {
      validate: vi.fn().mockImplementation((callback) => callback(true, {}))
    }

    // 执行提交并检测控制台错误
    const { hasErrors, errors } = strictValidationTools.detectConsoleErrors(async () => {
      await wrapper.vm.handleSubmit()
    })

    expect(hasErrors).toBe(false)
    expect(errors).toHaveLength(0)
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
```

## 🔍 常见问题修复

### 1. aiService 导出问题

```typescript
// ❌ 错误方式
vi.mock('@/utils/request', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}))

// ✅ 正确方式（包含所有导出）
vi.mock('@/utils/request', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  get: vi.fn(),
  post: vi.fn(),
  aiService: { get: vi.fn(), post: vi.fn() },
  aiRequest: { get: vi.fn(), post: vi.fn() },
  videoCreationRequest: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))
```

### 2. Mock响应格式不一致

```typescript
// ❌ 错误方式 - 简化的假数据
const mockResponse = {
  data: { imageUrl: 'fake.jpg' }
}

// ✅ 正确方式 - 与真实API完全一致
const mockResponse = {
  success: true,
  data: {
    imageUrl: 'https://example.com/generated-image.jpg',
    usage: {
      generated_images: 1,
      output_tokens: 150,
      total_tokens: 200
    }
  },
  message: '图片生成成功'
}
```

### 3. 缺少错误场景测试

```typescript
// ❌ 只测试成功场景
it('should succeed', () => {
  // 只有成功测试
})

// ✅ 包含错误场景
it('should handle API errors', async () => {
  vi.mocked(request.post).mockRejectedValue({
    response: {
      status: 500,
      data: { message: '服务器错误', code: 'INTERNAL_ERROR' }
    }
  })

  await expect(api.generateImage({ prompt: 'test' })).rejects.toThrow('服务器错误')
})
```

## 📊 验证报告

### 生成Mock验证报告

```typescript
import { globalMockValidator } from '@/tests/utils/mock-validation'

// 测试完成后生成报告
afterAll(() => {
  const report = globalMockValidator.generateReport()
  console.log(report)

  // 如果有失败的验证，测试应该失败
  const results = globalMockValidator.getValidationResults()
  const hasFailures = Object.values(results).some((result: any) => !result.valid)

  if (hasFailures) {
    throw new Error('Mock真实性验证失败，请检查上述报告')
  }
})
```

### 报告示例

```
📋 Mock真实性验证报告
==================================================

🔍 POST /auto-image/generate:
   ✅ 通过: true

🔍 GET /auth/profile:
   ✅ 通过: true

🔍 GET /dashboard/stats:
   ✅ 通过: true
   ⚠️  警告: 发现额外字段: lastUpdate

📊 总计:
   ✅ 通过: 3
   ❌ 失败: 0
   📈 成功率: 100.0%
```

## 🎯 成功标准

- [x] 所有Mock相关测试通过
- [x] Mock结构与真实API100%一致
- [x] 可以模拟真实的API成功和失败场景
- [x] 消除所有"Cannot access"、"No export"等Mock错误
- [x] 验证报告显示100%成功率

## 🔗 相关文件

- Mock配置：`client/tests/mocks/`
- 验证工具：`client/tests/utils/mock-validation.ts`
- 全局设置：`client/tests/setup.ts`
- 测试示例：`client/tests/unit/api/auto-image.test.ts`

## 📞 支持

如果遇到Mock问题，请：

1. 检查本文档的常见问题部分
2. 使用 `validateMockRealism()` 验证Mock结构
3. 运行验证报告查看详细问题
4. 参考 `STRICT_VALIDATION_RULES` 了解正确的响应格式