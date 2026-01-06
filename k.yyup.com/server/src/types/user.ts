import {  User  } from '../models/index';

export interface CreateUserDto {
  username: string;
  password: string;
  email: string;
  realName?: string;
  phone?: string;
  roleIds?: number[];
  status?: number;
}

export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  id: number;
  password?: string;
}

export interface UserResponse extends Omit<User, 'password' | 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface UserListResponse {
  total: number;
  items: UserResponse[];
  page: number;
  pageSize: number;
} 