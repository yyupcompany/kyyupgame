import {  Role  } from '../models/index';

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  permissionIds?: number[];
  status?: number;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  id: number;
  code?: string;
}

export interface RoleResponse extends Omit<Role, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface RoleListResponse {
  total: number;
  items: RoleResponse[];
  page: number;
  pageSize: number;
} 