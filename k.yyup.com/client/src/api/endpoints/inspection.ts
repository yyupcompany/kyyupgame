import { request } from '@/utils/request';

// 检查类别枚举
export enum InspectionCategory {
  ANNUAL = 'annual',      // 年度检查
  SPECIAL = 'special',    // 专项检查
  ROUTINE = 'routine'     // 常态化督导
}

// 城市级别枚举
export enum CityLevel {
  TIER1 = 'tier1',       // 一线城市
  TIER2 = 'tier2',       // 二线城市
  TIER3 = 'tier3',       // 三线城市
  COUNTY = 'county',     // 县级
  TOWNSHIP = 'township'  // 乡镇
}

// 检查计划状态枚举
export enum InspectionPlanStatus {
  PENDING = 'pending',           // 未开始
  PREPARING = 'preparing',       // 准备中
  IN_PROGRESS = 'in_progress',   // 进行中
  COMPLETED = 'completed',       // 已完成
  OVERDUE = 'overdue'           // 已逾期
}

// 检查类型接口
export interface InspectionType {
  id: number;
  name: string;
  category: InspectionCategory;
  description?: string;
  department?: string;
  frequency?: string;
  duration?: number;
  cityLevel?: CityLevel;
  requiredDocuments?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 检查任务状态枚举
export enum InspectionTaskStatus {
  PENDING = 'pending',           // 待开始
  IN_PROGRESS = 'in_progress',   // 进行中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled'        // 已取消
}

// 检查任务优先级枚举
export enum InspectionTaskPriority {
  LOW = 'low',                   // 低优先级
  MEDIUM = 'medium',             // 中优先级
  HIGH = 'high',                 // 高优先级
  URGENT = 'urgent'              // 紧急
}

// 检查任务接口
export interface InspectionTask {
  id: number;
  inspectionPlanId: number;
  parentTaskId?: number;
  title: string;
  description?: string;
  assignedTo?: number;
  priority: InspectionTaskPriority;
  status: InspectionTaskStatus;
  progress: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  sortOrder: number;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  assignee?: {
    id: number;
    username: string;
    realName: string;
    email: string;
  };
  creator?: {
    id: number;
    username: string;
    realName: string;
    email: string;
  };
}

// 检查计划接口
export interface InspectionPlan {
  id: number;
  kindergartenId: number;
  inspectionTypeId: number;
  planYear: number;
  planDate: string;
  actualDate?: string;
  status: InspectionPlanStatus;
  responsibleUserId?: number;
  notes?: string;
  result?: string;
  score?: number;
  grade?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  inspectionType?: InspectionType;
}

// 检查类型API
export const inspectionTypeApi = {
  // 获取检查类型列表
  getList: (params?: {
    page?: number;
    pageSize?: number;
    category?: InspectionCategory;
    cityLevel?: CityLevel;
    isActive?: boolean;
    keyword?: string;
  }) => {
    return request.get('/api/inspection/types', { params });
  },

  // 获取启用的检查类型
  getActiveList: (params?: {
    category?: InspectionCategory;
    cityLevel?: CityLevel;
  }) => {
    return request.get('/api/inspection/types/active', { params });
  },

  // 获取检查类型详情
  getDetail: (id: number) => {
    return request.get(`/inspection/types/${id}`);
  },

  // 创建检查类型
  create: (data: Partial<InspectionType>) => {
    return request.post('/api/inspection/types', data);
  },

  // 更新检查类型
  update: (id: number, data: Partial<InspectionType>) => {
    return request.put(`/inspection/types/${id}`, data);
  },

  // 删除检查类型
  delete: (id: number) => {
    return request.delete(`/inspection/types/${id}`);
  },

  // 批量删除检查类型
  batchDelete: (ids: number[]) => {
    return request.post('/api/inspection/types/batch-delete', { ids });
  }
};

// 检查计划API
export const inspectionPlanApi = {
  // 获取检查计划列表
  getList: (params?: {
    page?: number;
    pageSize?: number;
    kindergartenId?: number;
    inspectionTypeId?: number;
    planYear?: number;
    status?: InspectionPlanStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    return request.get('/api/inspection/plans', { params });
  },

  // 获取Timeline数据
  getTimeline: (queryParams: {
    kindergartenId: number;
    year: number;
  }) => {
    // 直接传递参数对象作为第二个参数
    // smartGetMethod的签名是: (url: string, params?: any, config?: AxiosRequestConfig)
    return request.get('/api/inspection/plans/timeline', queryParams as any);
  },

  // 获取检查计划详情
  getDetail: (id: number) => {
    return request.get(`/inspection/plans/${id}`);
  },

  // 创建检查计划
  create: (data: Partial<InspectionPlan>) => {
    return request.post('/api/inspection/plans', data);
  },

  // 自动生成年度检查计划
  generateYearly: (data: {
    kindergartenId: number;
    year: number;
    cityLevel: CityLevel;
  }) => {
    return request.post('/api/inspection/plans/generate-yearly', data);
  },

  // 更新检查计划
  update: (id: number, data: Partial<InspectionPlan>) => {
    return request.put(`/inspection/plans/${id}`, data);
  },

  // 删除检查计划
  delete: (id: number) => {
    return request.delete(`/inspection/plans/${id}`);
  }
};

// 检查任务API
export const inspectionTaskApi = {
  // 获取检查计划的任务列表
  getList: (planId: number, params?: {
    page?: number;
    pageSize?: number;
    status?: InspectionTaskStatus;
    priority?: InspectionTaskPriority;
    assignedTo?: number;
  }) => {
    return request.get(`/inspection/plans/${planId}/tasks`, { params });
  },

  // 创建检查任务
  create: (planId: number, data: {
    title: string;
    description?: string;
    assignedTo?: number;
    priority?: InspectionTaskPriority;
    dueDate?: string;
    parentTaskId?: number;
  }) => {
    return request.post(`/inspection/plans/${planId}/tasks`, data);
  },

  // 更新检查任务
  update: (planId: number, taskId: number, data: Partial<InspectionTask>) => {
    return request.put(`/inspection/plans/${planId}/tasks/${taskId}`, data);
  },

  // 删除检查任务
  delete: (planId: number, taskId: number) => {
    return request.delete(`/inspection/plans/${planId}/tasks/${taskId}`);
  }
};

