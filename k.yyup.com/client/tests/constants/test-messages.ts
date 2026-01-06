/**
 * 测试消息常量
 * 统一管理测试中使用的错误消息和提示文本
 */

// 文件上传相关错误消息
export const FILE_UPLOAD_MESSAGES = {
  UNSUPPORTED_FILE_TYPE: '不支持的文件类型',
  FILE_SIZE_EXCEEDED: '文件大小不能超过 10MB', // 注意：实际代码中是动态的
  UPLOAD_SUCCESS: '上传成功',
  UPLOAD_FAILED: '上传失败'
} as const

// AI相关错误消息
export const AI_MESSAGES = {
  GENERATION_FAILED: '生成失败',
  GENERATION_SUCCESS: '生成成功',
  SERVICE_UNAVAILABLE: '服务不可用',
  INVALID_PROMPT: '无效的提示词'
} as const

// 表单验证消息
export const FORM_VALIDATION_MESSAGES = {
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_EMAIL: '请输入有效的邮箱地址',
  PASSWORD_TOO_SHORT: '密码长度不能少于6位',
  PASSWORDS_NOT_MATCH: '两次输入的密码不一致'
} as const

// 操作成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  CREATE_SUCCESS: '创建成功'
} as const

// 操作失败消息
export const ERROR_MESSAGES = {
  SAVE_FAILED: '保存失败',
  DELETE_FAILED: '删除失败',
  UPDATE_FAILED: '更新失败',
  CREATE_FAILED: '创建失败',
  NETWORK_ERROR: '网络错误',
  SERVER_ERROR: '服务器错误'
} as const

// 权限相关消息
export const PERMISSION_MESSAGES = {
  ACCESS_DENIED: '访问被拒绝',
  INSUFFICIENT_PERMISSIONS: '权限不足',
  LOGIN_REQUIRED: '请先登录'
} as const

// 数据验证消息
export const VALIDATION_MESSAGES = {
  INVALID_DATA: '数据格式不正确',
  MISSING_REQUIRED_FIELDS: '缺少必填字段',
  DATA_TOO_LONG: '数据长度超出限制'
} as const

// 导出所有消息常量
export const TEST_MESSAGES = {
  ...FILE_UPLOAD_MESSAGES,
  ...AI_MESSAGES,
  ...FORM_VALIDATION_MESSAGES,
  ...SUCCESS_MESSAGES,
  ...ERROR_MESSAGES,
  ...PERMISSION_MESSAGES,
  ...VALIDATION_MESSAGES
} as const

// 类型定义
export type TestMessageKey = keyof typeof TEST_MESSAGES
export type TestMessage = typeof TEST_MESSAGES[TestMessageKey]
