/**
 * 海报生成相关的类型定义
 */

import { PaginationOptions } from './pagination';

// 海报生成创建参数
export interface PosterGenerationCreateParams {
  templateId: number;
  name: string;
  parameters: Record<string, any>;
  status?: number;
  kindergartenId?: number;
}

// 海报生成更新参数
export interface PosterGenerationUpdateParams {
  name?: string;
  parameters?: Record<string, any>;
  status?: number;
}

// 海报生成查询参数
export interface PosterGenerationQueryParams extends PaginationOptions {
  name?: string;
  templateId?: number;
  creatorId?: number;
  kindergartenId?: number;
  status?: number;
  startDate?: Date;
  endDate?: Date;
}

// 海报分享参数
export interface PosterShareParams {
  channel: 'wechat' | 'qq' | 'weibo' | 'link';
  recipient?: string; // e.g., WeChat user ID
} 