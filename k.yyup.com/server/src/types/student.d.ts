/**
 * 学生模块的Data Transfer Objects (DTOs) 和类型定义
 */

// 创建学生时的数据传输对象
export interface CreateStudentDto {
  name: string;
  studentNo: string;
  gender: number;
  birthDate?: Date;
  kindergartenId: number;
  classId?: number;
  enrollmentDate?: Date;
  status?: number;
  idCardNo?: string;
  householdAddress?: string;
  currentAddress?: string;
  bloodType?: string;
  nationality?: string;
  healthCondition?: string;
  allergyHistory?: string;
  specialNeeds?: string;
  interests?: string | string[];
  tags?: string | string[];
  photoUrl?: string;
  remark?: string;
}

// 更新学生时的数据传输对象
export type UpdateStudentDto = Partial<Omit<CreateStudentDto, 'interests' | 'tags'>> & {
  interests?: string | string[];
  tags?: string | string[];
};

// 分配班级的数据传输对象
export interface AssignClassDto {
  studentId: number;
  classId: number;
}

// 批量分配班级的数据传输对象
export interface BatchAssignClassDto {
  studentIds: number[];
  classId: number;
}

// 更新学生状态的数据传输对象
export interface UpdateStudentStatusDto {
  studentId: number;
  status: number;
} 