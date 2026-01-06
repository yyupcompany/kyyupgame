import {  Kindergarten  } from '../models/index';

/**
 * 创建幼儿园的请求数据类型
 */
export interface CreateKindergartenDto {
  name: string;
  code: string;
  type: number;
  level: number;
  address: string;
  longitude: number;
  latitude: number;
  phone: string;
  email: string;
  principal: string;
  establishedDate: Date | string;
  area: number;
  buildingArea: number;
  classCount?: number;
  teacherCount?: number;
  studentCount?: number;
  description?: string;
  features?: string;
  philosophy?: string;
  feeDescription?: string;
  status?: number;
}

/**
 * 更新幼儿园的请求数据类型
 */
export interface UpdateKindergartenDto extends Partial<CreateKindergartenDto> {
  id?: number;
}

/**
 * 幼儿园响应数据类型
 */
export interface KindergartenResponse extends Omit<Kindergarten, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

/**
 * 幼儿园列表响应数据类型
 */
export interface KindergartenListResponse {
  total: number;
  items: KindergartenResponse[];
  page: number;
  pageSize: number;
} 