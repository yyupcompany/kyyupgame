import {  Class  } from '../models/index';

export interface CreateClassDto {
  name: string;
  code: string;
  kindergartenId: number;
  type?: number;
  grade?: string;
  teacherId?: number;
  headTeacherId?: number;
  assistantTeacherId?: number;
  capacity?: number;
  classroom?: string;
  description?: string;
  imageUrl?: string;
  status?: number;
  remark?: string;
  teacherIds?: number[];
}

export interface UpdateClassDto extends Partial<CreateClassDto> {
  id: number;
}

export interface ClassResponse extends Omit<Class, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface ClassListResponse {
  total: number;
  items: ClassResponse[];
  page: number;
  pageSize: number;
} 