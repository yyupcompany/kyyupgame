/**
 * 消息模板服务接口定义
 */

export interface MessageTemplateData {
  [key: string]: string | number | boolean;
}

export interface MessageTemplate {
  id: number;
  code: string;
  name: string;
  type: 'sms' | 'email' | 'wechat' | 'notification';
  content: string;
  variables: string[]; // 模板中的变量名列表
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageTemplateService {
  /**
   * 获取消息模板
   * @param code 模板代码
   */
  getTemplate(code: string): Promise<MessageTemplate>;
  
  /**
   * 创建消息模板
   * @param template 模板信息
   */
  createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<MessageTemplate>;
  
  /**
   * 更新消息模板
   * @param id 模板ID
   * @param template 模板信息
   */
  updateTemplate(id: number, template: Partial<MessageTemplate>): Promise<MessageTemplate>;
  
  /**
   * 删除消息模板
   * @param id 模板ID
   */
  deleteTemplate(id: number): Promise<boolean>;
  
  /**
   * 渲染消息模板
   * @param code 模板代码
   * @param data 模板数据
   */
  renderTemplate(code: string, data: MessageTemplateData): Promise<string>;
} 