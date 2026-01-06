/**
 * 系统配置服务接口定义
 */

export type ConfigValueType = string | number | boolean | object | null;

export interface SystemConfig {
  id: number;
  key: string;           // 配置键
  value: ConfigValueType; // 配置值
  type: 'string' | 'number' | 'boolean' | 'json'; // 值类型
  description: string;   // 配置说明
  group: string;         // 配置分组
  isPublic: boolean;     // 是否公开配置(非敏感信息)
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfigQuery {
  key?: string;
  group?: string;
  isPublic?: boolean;
}

export interface ISystemConfigService {
  /**
   * 获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   */
  get<T = any>(key: string, defaultValue?: T): Promise<T>;
  
  /**
   * 设置配置值
   * @param key 配置键
   * @param value 配置值
   * @param type 值类型
   * @param options 其他选项
   */
  set(
    key: string, 
    value: ConfigValueType, 
    type?: 'string' | 'number' | 'boolean' | 'json',
    options?: { description?: string; group?: string; isPublic?: boolean }
  ): Promise<SystemConfig>;
  
  /**
   * 删除配置
   * @param key 配置键
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * 查询配置列表
   * @param query 查询条件
   */
  query(query: SystemConfigQuery): Promise<SystemConfig[]>;
  
  /**
   * 获取配置分组
   */
  getGroups(): Promise<string[]>;
  
  /**
   * 批量设置配置
   * @param configs 配置项数组
   */
  batchSet(configs: Array<{
    key: string;
    value: ConfigValueType;
    type?: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    group?: string;
    isPublic?: boolean;
  }>): Promise<SystemConfig[]>;
} 