/**
 * 消息发送服务接口定义
 */

export interface MessagePayload {
  to: string | string[]; // 接收者，可以是手机号、邮箱等
  subject?: string;      // 主题，适用于邮件
  content: string;       // 消息内容
  templateCode?: string; // 消息模板代码
  templateData?: any;    // 模板数据
  attachments?: {        // 附件，适用于邮件
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  updatedAt: Date;
  error?: string;
}

export interface IMessageSendingService {
  /**
   * 发送短信
   * @param payload 消息内容
   */
  sendSms(payload: MessagePayload): Promise<MessageResult>;
  
  /**
   * 发送邮件
   * @param payload 消息内容
   */
  sendEmail(payload: MessagePayload): Promise<MessageResult>;
  
  /**
   * 发送微信消息
   * @param payload 消息内容
   */
  sendWechatMessage(payload: MessagePayload): Promise<MessageResult>;
  
  /**
   * 发送系统通知
   * @param payload 消息内容
   */
  sendNotification(payload: MessagePayload): Promise<MessageResult>;
  
  /**
   * 获取消息状态
   * @param messageId 消息ID
   */
  getMessageStatus(messageId: string): Promise<MessageStatus>;
} 