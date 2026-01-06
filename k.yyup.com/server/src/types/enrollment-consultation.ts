/**
 * 招生咨询类型定义文件
 */

/**
 * 创建招生咨询的数据传输对象
 */
export interface CreateEnrollmentConsultationDto {
  kindergartenId: number;
  consultantId: number;
  parentName: string;
  childName: string;
  childAge: number;
  childGender: number;
  contactPhone: string;
  contactAddress?: string;
  sourceChannel: number;
  sourceDetail?: string;
  consultContent: string;
  consultMethod: number;
  consultDate: string;
  intentionLevel: number;
  followupStatus?: number;
  nextFollowupDate?: string;
  remark?: string;
}

/**
 * 更新招生咨询的数据传输对象
 */
export interface UpdateEnrollmentConsultationDto {
  id: number;
  parentName?: string;
  childName?: string;
  childAge?: number;
  childGender?: number;
  contactPhone?: string;
  contactAddress?: string;
  sourceChannel?: number;
  sourceDetail?: string;
  consultContent?: string;
  consultMethod?: number;
  consultDate?: string;
  intentionLevel?: number;
  followupStatus?: number;
  nextFollowupDate?: string;
  remark?: string;
}

/**
 * 招生咨询响应对象
 */
export interface EnrollmentConsultationResponse {
  id: number;
  kindergartenId: number;
  consultantId: number;
  parentName: string;
  childName: string;
  childAge: number;
  childGender: number;
  childGenderText: string;
  contactPhone: string;
  contactAddress: string | null;
  sourceChannel: number;
  sourceChannelText: string;
  sourceDetail: string | null;
  consultContent: string;
  consultMethod: number;
  consultMethodText: string;
  consultDate: string;
  intentionLevel: number;
  intentionLevelText: string;
  followupStatus: number;
  followupStatusText: string;
  nextFollowupDate: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  consultant?: {
    id: number;
    name: string;
  };
  kindergarten?: {
    id: number;
    name: string;
  };
  followupCount?: number;
}

/**
 * 招生咨询列表响应对象
 */
export interface EnrollmentConsultationListResponse {
  total: number;
  items: EnrollmentConsultationResponse[];
  page: number;
  pageSize: number;
}

/**
 * 招生咨询过滤参数
 */
export interface EnrollmentConsultationFilterParams {
  page?: number;
  pageSize?: number;
  kindergartenId?: number;
  consultantId?: number;
  parentName?: string;
  childName?: string;
  contactPhone?: string;
  sourceChannel?: number;
  intentionLevel?: number;
  followupStatus?: number;
  startDate?: string;
  endDate?: string;
  needFollowup?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 创建招生咨询跟进的数据传输对象
 */
export interface CreateEnrollmentConsultationFollowupDto {
  consultationId: number;
  followupMethod: number;
  followupContent: string;
  followupDate: string;
  intentionLevel: number;
  followupResult: number;
  nextFollowupDate?: string;
  remark?: string;
}

/**
 * 招生咨询跟进响应对象
 */
export interface EnrollmentConsultationFollowupResponse {
  id: number;
  consultationId: number;
  followupUserId: number;
  followupMethod: number;
  followupMethodText: string;
  followupContent: string;
  followupDate: string;
  intentionLevel: number;
  intentionLevelText: string;
  followupResult: number;
  followupResultText: string;
  nextFollowupDate: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  followupUser?: {
    id: number;
    name: string;
  };
}

/**
 * 招生咨询跟进列表响应对象
 */
export interface EnrollmentConsultationFollowupListResponse {
  total: number;
  items: EnrollmentConsultationFollowupResponse[];
  page: number;
  pageSize: number;
}

/**
 * 招生咨询跟进过滤参数
 */
export interface EnrollmentConsultationFollowupFilterParams {
  page?: number;
  pageSize?: number;
  consultationId?: number;
  followupUserId?: number;
  followupMethod?: number;
  followupResult?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 招生咨询统计响应对象
 */
export interface EnrollmentConsultationStatisticsResponse {
  total: number;
  bySourceChannel: {
    channel: number;
    channelName: string;
    count: number;
    percentage: number;
  }[];
  byIntentionLevel: {
    level: number;
    levelName: string;
    count: number;
    percentage: number;
  }[];
  byFollowupStatus: {
    status: number;
    statusName: string;
    count: number;
    percentage: number;
  }[];
  byConsultMethod: {
    method: number;
    methodName: string;
    count: number;
    percentage: number;
  }[];
  byDate: {
    date: string;
    count: number;
  }[];
  conversionRate: number;
} 