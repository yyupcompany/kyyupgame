/**
 * 专家咨询接口定义
 */

export interface IExpertConsultationRequest {
  userId: number;
  domain?: string;
  question?: string;
  query?: string;  // 别名，兼容控制器
  context?: string;
  attachments?: string[];
  preferences?: any;
}

// 别名导出，兼容控制器使用
export type ConsultationRequest = IExpertConsultationRequest;

export interface IExpertConsultationResponse {
  id: string;
  answer: string;
  references?: string[];
  confidence: number;
  domain: string;
  createdAt?: Date;
}

export interface IConsultationDomain {
  id: string;
  name: string;
  description: string;
  expertLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface IConsultationHistory {
  id: string;
  userId: number;
  domain: string;
  question: string;
  answer: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
}

export interface IExpertProfile {
  id: string;
  name: string;
  domain: string;
  specialties: string[];
  experience: number;
  rating: number;
}

