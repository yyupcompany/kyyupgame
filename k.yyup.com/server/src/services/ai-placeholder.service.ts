/**
 * AI服务占位符
 * 已迁移到统一租户中心，这里提供兼容性接口
 */

export class AIPlaceholderService {
  static async getModels() {
    return { success: true, data: [], message: 'AI服务已迁移到统一租户中心' };
  }

  static async generateText() {
    return { success: true, data: { content: 'AI服务已迁移到统一租户中心' } };
  }

  static async generateImage() {
    return { success: true, data: { imageUrl: 'AI服务已迁移到统一租户中心' } };
  }

  static async synthesizeSpeech() {
    return { success: true, data: { audioUrl: 'AI服务已迁移到统一租户中心' } };
  }
}