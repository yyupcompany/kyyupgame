/**
 * 父母/监护人类型定义
 */

export interface IParent {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  relationship: string; // 与学生的关系，如"父亲"、"母亲"、"祖父"等
  occupation?: string;
  workUnit?: string;
  workPhone?: string;
  isPrimaryContact: boolean; // 是否为主要联系人
  isLegalGuardian?: boolean; // 是否为法定监护人
  idCardNo?: string; // 身份证号
  education?: string; // 学历
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 父母/监护人创建参数
 */
export interface CreateParentDto {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  relationship: string; // 与学生的关系
  occupation?: string;
  workUnit?: string;
  workPhone?: string;
  isPrimaryContact?: boolean; // 是否为主要联系人
  isLegalGuardian?: boolean; // 是否为法定监护人
  idCardNo?: string; // 身份证号
  education?: string; // 学历
  gender?: number; // 性别: 0=未知, 1=男, 2=女
  studentId: number; // 关联的学生ID
  userId?: number; // 关联的用户ID，可能在创建时由系统分配
  remark?: string; // 备注
  creatorId?: number; // 创建人ID
  updaterId?: number; // 更新人ID
}

/**
 * 父母/监护人更新参数
 */
export interface UpdateParentDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  relationship?: string;
  occupation?: string;
  workUnit?: string;
  workPhone?: string;
  isPrimaryContact?: boolean;
  isLegalGuardian?: boolean;
  idCardNo?: string;
  education?: string;
  gender?: number;
} 