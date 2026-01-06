import {  Permission  } from '../models/index';

export interface CreatePermissionDto {
  name: string;
  code: string;
  type: string;
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
}

export interface UpdatePermissionDto extends Partial<CreatePermissionDto> {
  id: number;
}

export interface PermissionResponse extends Omit<Permission, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface PermissionListResponse {
  total: number;
  items: PermissionResponse[];
  page: number;
  pageSize: number;
} 