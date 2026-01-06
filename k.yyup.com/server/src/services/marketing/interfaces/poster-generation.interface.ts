/**
 * 海报生成服务接口
 * 定义了海报生成的相关操作
 */

export interface IPosterGenerationService {
  /**
   * 根据模板生成海报
   * @param templateId 模板ID
   * @param data 海报数据
   * @returns 生成的海报URL
   */
  generatePoster(templateId: number, data: any): Promise<string>;
  
  /**
   * 批量生成海报
   * @param templateId 模板ID
   * @param dataList 海报数据列表
   * @returns 生成的海报URL列表
   */
  batchGeneratePosters(templateId: number, dataList: any[]): Promise<string[]>;
  
  /**
   * 获取海报生成历史
   * @param userId 用户ID
   * @param query 查询参数
   * @returns 历史记录和总数
   */
  getPosterHistory(userId: number, query: any): Promise<{
    rows: any[];
    count: number;
  }>;
} 