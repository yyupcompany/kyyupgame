/**
 * 数据库实体类型定义
 * 根据数据库关系映射定义精确的TypeScript类型
 * 避免在代码中使用any类型
 */

// 枚举类型定义
export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WAIT_LISTED = 'wait_listed'
}

export enum MaterialType {
  ID_CARD = 'id_card',
  BIRTH_CERTIFICATE = 'birth_certificate',
  HEALTH_RECORD = 'health_record',
  VACCINATION = 'vaccination',
  PHOTO = 'photo',
  OTHER = 'other'
}

export enum AdmissionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WAIT_LISTED = 'wait_listed'
}

export enum AdmissionType {
  NORMAL = 'normal',
  PRIORITY = 'priority',
  SPECIAL = 'special'
}

export enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  APP = 'app',
  WECHAT = 'wechat'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

// 通用类型
export interface BaseEntity {
  id: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  deleted_at?: Date | string | null;
  created_by?: number;
  updated_by?: number;
}

export interface User extends BaseEntity {
  username: string;
  password: string;
  email: string;
  real_name: string;
  phone: string;
  status: number;
  
  // 关联字段
  roles?: Role[];
  profile?: UserProfile;
  teacher?: Teacher;
  parents?: Parent[];
}

export interface Role extends BaseEntity {
  name: string;
  code: string;
  description: string;
  status: number;
  
  // 关联字段
  users?: User[];
  permissions?: Permission[];
}

export interface Permission extends BaseEntity {
  name: string;
  code: string;
  type: string;
  parent_id?: number;
  path: string;
  component?: string;
  permission?: string;
  icon?: string;
  sort: number;
  status: number;
  
  // 关联字段
  roles?: Role[];
  parent?: Permission;
  childrenPermissions?: Permission[];
}

export interface UserRole extends BaseEntity {
  user_id: number;
  role_id: number;
  is_primary: number;
  start_time?: Date | string;
  end_time?: Date | string;
  grantor_id?: number;
  creator_id?: number;
  updater_id?: number;
  is_system: number;
  
  // 关联字段
  user?: User;
  role?: Role;
  grantor?: User;
}

export interface RolePermission extends BaseEntity {
  role_id: number;
  permission_id: number;
  is_inherit: number;
  grant_time?: Date | string;
  grantor_id?: number;
  creator_id?: number;
  updater_id?: number;
  is_system: number;
  
  // 关联字段
  role?: Role;
  permission?: Permission;
  grantor?: User;
}

export interface UserProfile extends BaseEntity {
  user_id: number;
  avatar?: string;
  gender?: number;
  birthday?: Date | string;
  address?: string;
  education?: string;
  introduction?: string;
  tags?: string;
  contact_info?: string;
  extended_info?: string;
  
  // 关联字段
  user?: User;
}

export interface Kindergarten extends BaseEntity {
  name: string;
  code: string;
  type: number;
  level: number;
  address: string;
  longitude: number;
  latitude: number;
  phone: string;
  email: string;
  principal: string;
  established_date: Date | string;
  area: number;
  building_area: number;
  class_count: number;
  teacher_count: number;
  student_count: number;
  description: string;
  features: string;
  philosophy: string;
  fee_description: string;
  status: number;
  
  // 关联字段
  classes?: Class[];
  teachers?: Teacher[];
  students?: Student[];
  enrollmentPlans?: EnrollmentPlan[];
  activities?: Activity[];
  coupons?: Coupon[];
  marketingCampaigns?: MarketingCampaign[];
  channelTrackings?: ChannelTracking[];
  advertisements?: Advertisement[];
  conversionTrackings?: ConversionTracking[];
}

export interface Class extends BaseEntity {
  name: string;
  code: string;
  kindergarten_id: number;
  type: number;
  grade?: string;
  head_teacher_id?: number;
  assistant_teacher_id?: number;
  capacity: number;
  current_student_count: number;
  classroom?: string;
  description?: string;
  image_url?: string;
  status: number;
  creator_id?: number;
  updater_id?: number;
  is_system: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  students?: Student[];
  teachers?: Teacher[];
}

export interface Teacher extends BaseEntity {
  user_id: number;
  kindergarten_id: number;
  teacher_no: string;
  position: number;
  hire_date?: Date | string;
  education?: number;
  school?: string;
  major?: string;
  teaching_age?: number;
  professional_skills?: string;
  certifications?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  classes?: Class[];
  user?: User;
  enrollmentTasks?: EnrollmentTask[];
  activityEvaluations?: ActivityEvaluation[];
}

export interface Student extends BaseEntity {
  name: string;
  student_no: string;
  kindergarten_id: number;
  class_id: number | null;
  gender: number;
  birth_date: Date;
  id_card_no: string | null;
  household_address: string | null;
  current_address: string | null;
  blood_type: string | null;
  nationality: string | null;
  enrollment_date: Date;
  graduation_date: Date | null;
  health_condition: string | null;
  allergy_history: string | null;
  special_needs: string | null;
  photo_url: string | null;
  interests: string | null;
  tags: string | null;
  status: number;
  remark: string | null;
  creator_id: number | null;
  updater_id: number | null;
  
  // 关联字段
  kindergarten?: Kindergarten;
  class?: Class;
  parents?: Parent[];
  activityRegistrations?: ActivityRegistration[];
}

export interface Parent extends BaseEntity {
  user_id: number;
  student_id: number;
  relationship: string;
  is_primary_contact: number;
  is_legal_guardian: number;
  id_card_no?: string;
  work_unit?: string;
  occupation?: string;
  education?: string;
  address?: string;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  user?: User;
  student?: Student;
  applications?: EnrollmentApplication[];
  activityRegistrations?: ActivityRegistration[];
  activityEvaluations?: ActivityEvaluation[];
  conversionTrackings?: ConversionTracking[];
}

export interface ClassTeacher extends BaseEntity {
  class_id: number;
  teacher_id: number;
  is_main_teacher: number;
  subject?: string;
  start_date: Date | string;
  end_date?: Date | string;
  status: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
}

export interface EnrollmentPlan extends BaseEntity {
  kindergarten_id: number;
  title: string;
  year: number;
  semester: number;
  start_date: Date | string;
  end_date: Date | string;
  target_count: number;
  target_amount: number;
  age_range: string;
  requirements?: string;
  description?: string;
  status: number;
  approved_by?: number;
  approved_at?: Date | string;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  tasks?: EnrollmentTask[];
  applications?: EnrollmentApplication[];
  activities?: Activity[];
}

export interface EnrollmentTask extends BaseEntity {
  plan_id: number;
  teacher_id: number;
  title: string;
  task_type: number;
  target_count: number;
  actual_count: number;
  start_date: Date | string;
  end_date: Date | string;
  description?: string;
  requirement?: string;
  priority: number;
  status: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  plan?: EnrollmentPlan;
  teacher?: Teacher;
}

export interface Activity extends BaseEntity {
  kindergarten_id: number;
  plan_id?: number;
  title: string;
  activity_type: number;
  cover_image?: string;
  start_time: Date | string;
  end_time: Date | string;
  location: string;
  capacity: number;
  registered_count: number;
  checked_in_count: number;
  fee: number;
  description?: string;
  agenda?: string;
  registration_start_time: Date | string;
  registration_end_time: Date | string;
  needs_approval: number;
  status: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  plan?: EnrollmentPlan;
  registrations?: ActivityRegistration[];
  evaluations?: ActivityEvaluation[];
}

export interface ActivityRegistration extends BaseEntity {
  activity_id: number;
  parent_id?: number;
  student_id?: number;
  contact_name: string;
  contact_phone: string;
  child_name?: string;
  child_age?: number;
  child_gender?: number;
  registration_time: Date | string;
  attendee_count: number;
  special_needs?: string;
  source?: string;
  status: number;
  check_in_time?: Date | string;
  check_in_location?: string;
  feedback?: string;
  is_conversion: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  activity?: Activity;
  parent?: Parent;
  student?: Student;
  evaluations?: ActivityEvaluation[];
}

export interface ActivityEvaluation extends BaseEntity {
  activity_id: number;
  registration_id?: number;
  parent_id?: number;
  teacher_id?: number;
  evaluator_type: number;
  evaluator_name: string;
  evaluation_time: Date | string;
  overall_rating: number;
  content_rating?: number;
  organization_rating?: number;
  environment_rating?: number;
  service_rating?: number;
  comment?: string;
  strengths?: string;
  weaknesses?: string;
  suggestions?: string;
  images?: string;
  is_public: number;
  status: number;
  reply_content?: string;
  reply_time?: Date | string;
  reply_user_id?: number;
  remark?: string;
  creator_id?: number;
  updater_id?: number;
  
  // 关联字段
  activity?: Activity;
  registration?: ActivityRegistration;
  parent?: Parent;
  teacher?: Teacher;
}

export interface EnrollmentApplication extends BaseEntity {
  student_name: string;
  gender: string;
  birth_date: Date | string;
  parent_id: number;
  plan_id: number;
  status: ApplicationStatus;
  apply_date: Date | string;
  contact_phone: string;
  application_source: string;
  created_by: number;
  
  // 关联字段
  parent?: Parent;
  plan?: EnrollmentPlan;
  reviewer?: User;
  creator?: User;
  updater?: User;
  materials?: EnrollmentApplicationMaterial[];
  admissionResult?: AdmissionResult;
}

export interface EnrollmentApplicationMaterial extends BaseEntity {
  application_id: number;
  material_type: MaterialType;
  material_name: string;
  file_id: number;
  upload_date: Date | string;
  uploader_id: number;
  status: string;
  created_by: number;
  
  // 关联字段
  application?: EnrollmentApplication;
  file?: FileStorage;
  uploader?: User;
  verifier?: User;
  creator?: User;
  updater?: User;
}

export interface AdmissionResult extends BaseEntity {
  application_id: number;
  student_name: string;
  parent_id: number;
  plan_id: number;
  status: AdmissionStatus;
  type: AdmissionType;
  admission_date: Date | string;
  decision_maker_id: number;
  decision_date: Date | string;
  created_by: number;
  
  // 关联字段
  application?: EnrollmentApplication;
  parent?: Parent;
  plan?: EnrollmentPlan;
  class?: Class;
  interviewer?: User;
  decisionMaker?: User;
  creator?: User;
  updater?: User;
  notifications?: AdmissionNotification[];
}

export interface AdmissionNotification extends BaseEntity {
  admission_id: number;
  student_name: string;
  parent_id: number;
  method: NotificationMethod;
  status: NotificationStatus;
  content: string;
  sender_id: number;
  recipient_contact: string;
  response_required: boolean;
  created_by: number;
  
  // 关联字段
  admission?: AdmissionResult;
  parent?: Parent;
  sender?: User;
  template?: MessageTemplate;
  creator?: User;
  updater?: User;
}

export interface EnrollmentQuota extends BaseEntity {
  plan_id: number;
  class_id: number;
  total_quota: number;
  used_quota: number;
  reserved_quota: number;
  remark?: string;
  
  // 关联字段
  plan?: EnrollmentPlan;
  class?: Class;
}

export interface PaginationResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

export interface ApiSuccessResponse<T> {
  status: 'success';
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: unknown; // 代替any使用unknown，强制使用类型检查
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// 添加缺失的接口定义
export interface Coupon extends BaseEntity {
  kindergarten_id: number;
  code: string;
  type: string;
  value: number;
  start_date: Date | string;
  end_date: Date | string;
  max_uses: number;
  current_uses: number;
  description?: string;
  status: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
}

export interface MarketingCampaign extends BaseEntity {
  kindergarten_id: number;
  name: string;
  description: string;
  target_audience: string;
  start_date: Date | string;
  end_date: Date | string;
  budget?: number;
  spent?: number;
  goal?: string;
  status: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  advertisements?: Advertisement[];
  conversionTrackings?: ConversionTracking[];
}

export interface ChannelTracking extends BaseEntity {
  kindergarten_id: number;
  visitor_id: string;
  channel: string;
  campaign?: string;
  referrer?: string;
  landing_page: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address?: string;
  visit_time: Date | string;
  
  // 关联字段
  kindergarten?: Kindergarten;
  conversionTrackings?: ConversionTracking[];
}

export interface Advertisement extends BaseEntity {
  kindergarten_id: number;
  campaign_id?: number;
  title: string;
  description?: string;
  content: string;
  media_url?: string;
  type: string;
  placement: string;
  target_url: string;
  impressions: number;
  clicks: number;
  start_date: Date | string;
  end_date: Date | string;
  budget?: number;
  spent?: number;
  status: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  campaign?: MarketingCampaign;
  conversionTrackings?: ConversionTracking[];
}

export interface ConversionTracking extends BaseEntity {
  kindergarten_id: number;
  parent_id?: number;
  campaign_id?: number;
  channel_id?: number;
  advertisement_id?: number;
  visitor_id: string;
  action: string;
  action_time: Date | string;
  conversion_value?: number;
  
  // 关联字段
  kindergarten?: Kindergarten;
  parent?: Parent;
  campaign?: MarketingCampaign;
  channel?: ChannelTracking;
  advertisement?: Advertisement;
}

export interface FileStorage extends BaseEntity {
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url?: string;
  storage_type: string;
  uploader_id?: number;
  owner_id?: number;
  is_public: boolean;
  expires_at?: Date | string;
  
  // 关联字段
  uploader?: User;
  owner?: User;
}

export interface MessageTemplate extends BaseEntity {
  name: string;
  code: string;
  type: string;
  subject?: string;
  content: string;
  variables?: string;
  description?: string;
  created_by?: number;
  updated_by?: number;
  
  // 关联字段
  creator?: User;
  updater?: User;
}

export interface ClassListQueryResult {
  id: number;
  name: string;
  code: string;
  kindergarten_id: number;
  kindergarten_name: string;
  type?: string;
  grade?: string;
  head_teacher_id?: number;
  head_teacher_name?: string;
  assistant_teacher_id?: number;
  assistant_teacher_name?: string;
  capacity: number;
  current_student_count: number;
  classroom?: string;
  description?: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
