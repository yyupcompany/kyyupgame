import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const GROUP_ENDPOINTS = {
  UPGRADE: `${API_PREFIX}/groups/upgrade`,
  ADD_KINDERGARTEN: (groupId: number) => `${API_PREFIX}/groups/${groupId}/add-kindergarten`,
  REMOVE_KINDERGARTEN: (groupId: number) => `${API_PREFIX}/groups/${groupId}/remove-kindergarten`
} as const;

/**
 * 集团类型枚举
 */
export enum GroupType {
  EDUCATION = 1, // 教育集团
  CHAIN_BRAND = 2, // 连锁品牌
  INVESTMENT = 3, // 投资集团
}

/**
 * 集团状态枚举
 */
export enum GroupStatus {
  DISABLED = 0, // 禁用
  ACTIVE = 1, // 正常
  PENDING = 2, // 审核中
}

/**
 * 集团角色枚举
 */
export enum GroupRole {
  INVESTOR = 1, // 投资人
  ADMIN = 2, // 集团管理员
  FINANCE_DIRECTOR = 3, // 财务总监
  OPERATION_DIRECTOR = 4, // 运营总监
  HR_DIRECTOR = 5, // 人力资源总监
}

/**
 * 集团信息接口
 */
export interface Group {
  id: number;
  name: string;
  code: string;
  type: GroupType;
  legalPerson?: string;
  registeredCapital?: number;
  businessLicense?: string;
  establishedDate?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  brandName?: string;
  slogan?: string;
  description?: string;
  vision?: string;
  culture?: string;
  chairman?: string;
  ceo?: string;
  investorId?: number;
  kindergartenCount: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCapacity: number;
  annualRevenue?: number;
  annualProfit?: number;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 集团用户接口
 */
export interface GroupUser {
  id: number;
  groupId: number;
  userId: number;
  role: GroupRole;
  canViewAllKindergartens: number;
  canManageKindergartens: number;
  canViewFinance: number;
  canManageFinance: number;
  status: number;
  remark?: string;
  user?: {
    id: number;
    username: string;
    realName: string;
    email: string;
    phone: string;
    avatar?: string;
  };
}

/**
 * 集团统计数据接口
 */
export interface GroupStatistics {
  kindergartenCount: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCapacity: number;
  enrollmentRate: number;
  avgStudentsPerKindergarten: number;
  avgTeachersPerKindergarten: number;
  kindergartenDetails: Array<{
    id: number;
    name: string;
    code: string;
    studentCount: number;
    teacherCount: number;
    classCount: number;
    capacity: number;
    enrollmentRate: string;
    area?: number;
    buildingArea?: number;
    isHeadquarters: boolean;
  }>;
}

/**
 * 升级资格检查结果接口
 */
export interface UpgradeEligibility {
  eligible: boolean;
  kindergartenCount: number;
  kindergartens: Array<{
    id: number;
    name: string;
    code: string;
    studentCount: number;
    teacherCount: number;
  }>;
  suggestUpgrade: boolean;
  reason?: string;
}

/**
 * 集团管理API
 */
export const groupApi = {
  /**
   * 获取集团列表
   */
  getGroupList(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: GroupStatus;
    type?: GroupType;
    investorId?: number;
  }) {
    return request.get<{
      items: Group[];
      total: number;
      page: number;
      pageSize: number;
    }>('/groups', { params });
  },

  /**
   * 获取当前用户的集团列表
   */
  getMyGroups() {
    return request.get<Group[]>('/groups/my');
  },

  /**
   * 获取集团详情
   */
  getGroupDetail(id: number) {
    return request.get<Group>(`/groups/${id}`);
  },

  /**
   * 创建集团
   */
  createGroup(data: {
    name: string;
    code?: string;
    type: GroupType;
    legalPerson?: string;
    registeredCapital?: number;
    businessLicense?: string;
    establishedDate?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    brandName?: string;
    slogan?: string;
    description?: string;
    vision?: string;
    culture?: string;
    chairman?: string;
    ceo?: string;
  }) {
    return request.post<Group>('/groups', data);
  },

  /**
   * 更新集团信息
   */
  updateGroup(id: number, data: Partial<Group>) {
    return request.put<Group>(`/groups/${id}`, data);
  },

  /**
   * 删除集团
   */
  deleteGroup(id: number) {
    return request.delete(`/groups/${id}`);
  },

  /**
   * 获取集团用户列表
   */
  getGroupUsers(groupId: number) {
    return request.get<GroupUser[]>(`/groups/${groupId}/users`);
  },

  /**
   * 添加集团用户
   */
  addGroupUser(groupId: number, data: {
    userId: number;
    role: GroupRole;
    canViewAllKindergartens?: number;
    canManageKindergartens?: number;
    canViewFinance?: number;
    canManageFinance?: number;
    remark?: string;
  }) {
    return request.post<GroupUser>(`/groups/${groupId}/users`, data);
  },

  /**
   * 更新集团用户权限
   */
  updateGroupUser(groupId: number, userId: number, data: {
    role?: GroupRole;
    canViewAllKindergartens?: number;
    canManageKindergartens?: number;
    canViewFinance?: number;
    canManageFinance?: number;
    status?: number;
    remark?: string;
  }) {
    return request.put<GroupUser>(`/groups/${groupId}/users/${userId}`, data);
  },

  /**
   * 移除集团用户
   */
  removeGroupUser(groupId: number, userId: number) {
    return request.delete(`/groups/${groupId}/users/${userId}`);
  },

  /**
   * 获取集团统计数据
   */
  getGroupStatistics(id: number) {
    return request.get<GroupStatistics>(`/groups/${id}/statistics`);
  },

  /**
   * 获取集团活动数据
   */
  getGroupActivities(id: number, params?: {
    startDate?: string;
    endDate?: string;
  }) {
    return request.get(`/groups/${id}/activities`, { params });
  },

  /**
   * 获取集团招生数据
   */
  getGroupEnrollment(id: number, params?: {
    year?: number;
  }) {
    return request.get(`/groups/${id}/enrollment`, { params });
  },

  /**
   * 检测升级资格
   */
  checkUpgradeEligibility() {
    return request.get<UpgradeEligibility>('/groups/check-upgrade');
  },

  /**
   * 升级为集团
   */
  upgradeToGroup(data: {
    groupName: string;
    groupCode?: string;
    kindergartenIds: number[];
    headquartersId?: number;
    brandName?: string;
    slogan?: string;
    description?: string;
  }) {
    return request.post(GROUP_ENDPOINTS.UPGRADE, data);
  },

  /**
   * 园所加入集团
   */
  addKindergartenToGroup(groupId: number, data: {
    kindergartenId: number;
    groupRole?: number;
  }) {
    return request.post(GROUP_ENDPOINTS.ADD_KINDERGARTEN(groupId), data);
  },

  /**
   * 园所退出集团
   */
  removeKindergartenFromGroup(groupId: number, data: {
    kindergartenId: number;
  }) {
    return request.post(GROUP_ENDPOINTS.REMOVE_KINDERGARTEN(groupId), data);
  },
};

export default groupApi;

