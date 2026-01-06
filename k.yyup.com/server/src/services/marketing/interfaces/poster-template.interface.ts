/**
 * 海报模板服务接口
 * 定义了海报模板的相关操作
 */

import { PosterTemplate } from '../../../models/poster-template.model';

export interface IPosterTemplateService {
  /**
   * 创建海报模板
   * @param data 模板数据
   * @returns 创建的模板
   */
  createPosterTemplate(data: any): Promise<PosterTemplate>;

  /**
   * 获取所有海报模板
   * @param query 查询参数
   * @returns 模板列表和总数
   */
  getAllPosterTemplates(query: any): Promise<{
    rows: PosterTemplate[];
    count: number;
  }>;

  /**
   * 获取单个海报模板
   * @param id 模板ID
   * @returns 找到的模板
   */
  getPosterTemplateById(id: number): Promise<PosterTemplate | null>;

  /**
   * 更新海报模板
   * @param id 模板ID
   * @param data 更新数据
   * @returns 更新后的模板
   */
  updatePosterTemplate(id: number, data: any): Promise<PosterTemplate | null>;

  /**
   * 删除海报模板
   * @param id 模板ID
   * @returns 删除结果
   */
  deletePosterTemplate(id: number): Promise<boolean>;
} 