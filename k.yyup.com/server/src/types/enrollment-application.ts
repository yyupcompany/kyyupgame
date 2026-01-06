/**
 * 报名申请状态枚举
 */
export enum ApplicationStatus {
  DRAFT = 'draft',           // 草稿
  SUBMITTED = 'submitted',   // 已提交
  REVIEWING = 'reviewing',   // 审核中
  APPROVED = 'approved',     // 已通过
  REJECTED = 'rejected',     // 已拒绝
  CANCELED = 'canceled',     // 已取消
  EXPIRED = 'expired'        // 已过期
}

/**
 * 申请材料类型枚举
 */
export enum DocumentType {
  ID_CARD = 'id_card',                  // 身份证
  BIRTH_CERTIFICATE = 'birth_certificate', // 出生证明
  HOUSEHOLD_REGISTER = 'household_register', // 户口本
  VACCINATION_RECORD = 'vaccination_record', // 疫苗接种记录
  HEALTH_CERTIFICATE = 'health_certificate', // 健康证明
  PARENT_ID_CARD = 'parent_id_card',     // 家长身份证
  OTHER = 'other'                        // 其他
}

/**
 * 创建报名申请DTO
 */
export interface CreateEnrollmentApplicationDto {
  kindergartenId: number;      // 幼儿园ID
  childName: string;           // 孩子姓名
  childGender: string;         // 孩子性别
  childBirthday: Date;         // 孩子生日
  parentName: string;          // 家长姓名
  parentPhone: string;         // 家长电话
  parentRelation: string;      // 与孩子关系
  address: string;             // 家庭住址
  enrollmentYear: number;      // 入学年份
  enrollmentSeason: string;    // 入学季节
  gradeLevel: string;          // 年级
  specialNeeds?: string;       // 特殊需求
  emergencyContact?: string;   // 紧急联系人
  emergencyPhone?: string;     // 紧急联系电话
  previousSchool?: string;     // 之前就读学校
  referralSource?: string;     // 推荐来源
  consultationId?: number;     // 关联的咨询ID
  remark?: string;             // 备注
}

/**
 * 更新报名申请DTO
 */
export interface UpdateEnrollmentApplicationDto extends Partial<CreateEnrollmentApplicationDto> {
  id: number;                  // 申请ID
}

/**
 * 报名申请筛选参数
 */
export interface EnrollmentApplicationFilterParams {
  page?: number;               // 页码
  pageSize?: number;           // 每页条数
  sortBy?: string;             // 排序字段
  sortOrder?: 'asc' | 'desc';  // 排序方式
  kindergartenId?: number;     // 幼儿园ID
  status?: ApplicationStatus;  // 申请状态
  childName?: string;          // 孩子姓名
  parentName?: string;         // 家长姓名
  parentPhone?: string;        // 家长电话
  enrollmentYear?: number;     // 入学年份
  enrollmentSeason?: string;   // 入学季节
  gradeLevel?: string;         // 年级
  startDate?: Date;            // 开始日期
  endDate?: Date;              // 结束日期
  keyword?: string;            // 关键词
}

/**
 * 审核报名申请DTO
 */
export interface ReviewEnrollmentApplicationDto {
  id: number;                  // 申请ID
  status: ApplicationStatus;   // 申请状态
  reviewComment?: string;      // 审核意见
  approvalDate?: Date;         // 审批日期
  rejectionReason?: string;    // 拒绝原因
}

/**
 * 上传申请材料DTO
 */
export interface UploadApplicationDocumentDto {
  applicationId: number;       // 申请ID
  documentType: DocumentType;  // 文档类型
  documentName: string;        // 文档名称
  filePath: string;            // 文件路径
  fileSize: number;            // 文件大小
  mimeType: string;            // 文件MIME类型
  description?: string;        // 文档描述
}

/**
 * 报名申请实体
 */
export interface EnrollmentApplication {
  id: number;                  // 申请ID
  kindergartenId: number;      // 幼儿园ID
  childName: string;           // 孩子姓名
  childGender: string;         // 孩子性别
  childBirthday: Date;         // 孩子生日
  parentName: string;          // 家长姓名
  parentPhone: string;         // 家长电话
  parentRelation: string;      // 与孩子关系
  address: string;             // 家庭住址
  enrollmentYear: number;      // 入学年份
  enrollmentSeason: string;    // 入学季节
  gradeLevel: string;          // 年级
  specialNeeds?: string;       // 特殊需求
  emergencyContact?: string;   // 紧急联系人
  emergencyPhone?: string;     // 紧急联系电话
  previousSchool?: string;     // 之前就读学校
  referralSource?: string;     // 推荐来源
  consultationId?: number;     // 关联的咨询ID
  status: ApplicationStatus;   // 申请状态
  reviewComment?: string;      // 审核意见
  approvalDate?: Date;         // 审批日期
  rejectionReason?: string;    // 拒绝原因
  remark?: string;             // 备注
  createdBy: number;           // 创建人ID
  createdAt: Date;             // 创建时间
  updatedBy?: number;          // 更新人ID
  updatedAt?: Date;            // 更新时间
  reviewedBy?: number;         // 审核人ID
  reviewedAt?: Date;           // 审核时间
  documents?: EnrollmentApplicationDocument[]; // 申请材料
}

/**
 * 报名申请材料实体
 */
export interface EnrollmentApplicationDocument {
  id: number;                  // 文档ID
  applicationId: number;       // 申请ID
  documentType: DocumentType;  // 文档类型
  documentName: string;        // 文档名称
  filePath: string;            // 文件路径
  fileSize: number;            // 文件大小
  mimeType: string;            // 文件MIME类型
  description?: string;        // 文档描述
  createdBy: number;           // 创建人ID
  createdAt: Date;             // 创建时间
  updatedBy?: number;          // 更新人ID
  updatedAt?: Date;            // 更新时间
} 