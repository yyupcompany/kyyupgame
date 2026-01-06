/**
 * 数据转换工具
 * 用于前端和后端API数据格式的对齐转换
 */

// 通用数据转换函数
export const normalizeResponse = (response: any) => {
  if (!response) return { items: [], total: 0, success: false };
  
  // 如果response直接是数组，则包装为标准格式
  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      success: true
    };
  }
  
  // 如果response有data字段，则提取data
  if (response.data) {
    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        total: response.total || response.data.length,
        success: response.success !== false
      };
    } else if (response.data.items) {
      return {
        items: response.data.items,
        total: response.data.total || response.data.items.length,
        success: response.success !== false
      };
    } else if (response.data.list && Array.isArray(response.data.list)) {
      // 修复：统一分页响应格式 list -> items
      return {
        items: response.data.list,
        total: response.data.total || response.data.list.length,
        success: response.success !== false
      };
    }
  }
  
  // 如果response直接有items字段
  if (response.items) {
    return {
      items: response.items,
      total: response.total || response.items.length,
      success: response.success !== false
    };
  }
  
  // 修复：如果response直接有list字段，转换为items
  if (response.list && Array.isArray(response.list)) {
    return {
      items: response.list,
      total: response.total || response.list.length,
      success: response.success !== false
    };
  }
  
  // 兜底情况
  return {
    items: [],
    total: 0,
    success: response.success !== false
  };
};

// 用户数据转换
export const transformUserData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    username: backendData.username,
    email: backendData.email,
    realName: backendData.realName || backendData.real_name,
    phone: backendData.phone,
    avatarUrl: backendData.avatarUrl || backendData.avatar_url || backendData.avatar,
    status: transformUserStatus(backendData.status),
    role: transformUserRole(backendData.role),
    department: backendData.department,
    position: backendData.position,
    kindergartenId: backendData.kindergartenId || backendData.kindergarten_id,
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    lastLoginAt: formatDate(backendData.lastLoginAt || backendData.last_login_at),
    
    // 移除原始字段
    real_name: undefined,
    avatar_url: undefined,
    kindergarten_id: undefined,
    created_at: undefined,
    updated_at: undefined,
    last_login_at: undefined
  };
};

// 用户状态转换
export const transformUserStatus = (status: any) => {
  if (typeof status === 'string') return status;
  
  const statusMap: Record<number, string> = {
    1: 'ACTIVE',
    0: 'INACTIVE',
    2: 'LOCKED',
    3: 'SUSPENDED'
  };
  return statusMap[status] || 'INACTIVE';
};

// 用户角色转换
export const transformUserRole = (role: any) => {
  if (typeof role === 'string') return role;
  
  const roleMap: Record<number, string> = {
    1: 'ADMIN',
    2: 'PRINCIPAL',
    3: 'TEACHER',
    4: 'PARENT',
    5: 'STAFF'
  };
  return roleMap[role] || 'STAFF';
};

// 日期格式化
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// 计算年龄
export const calculateAge = (birthDate: string): number => {
  if (!birthDate || birthDate === 'invalid-date') return 0;

  try {
    const today = new Date();
    const birth = new Date(birthDate);

    // 检查日期是否有效
    if (isNaN(birth.getTime())) {
      return 0;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // 确保年龄为非负数
    return Math.max(0, age);
  } catch (error) {
    return 0;
  }
};

// 学生数据转换
export const transformStudentData = (backendData: any) => {
  if (!backendData) return null;
  
  const birthDate = backendData.birthDate || backendData.birth_date;
  
  return {
    id: backendData.id,
    name: backendData.name,
    
    // 性别转换：数字 -> 字符串枚举
    gender: backendData.gender === 1 ? 'MALE' : backendData.gender === 2 ? 'FEMALE' : backendData.gender,
    
    // 日期字段
    birthDate: formatDate(birthDate),
    age: calculateAge(birthDate),
    enrollmentDate: formatDate(backendData.enrollmentDate || backendData.enrollment_date),
    graduationDate: formatDate(backendData.graduationDate || backendData.graduation_date),
    
    // 状态转换
    status: transformStudentStatus(backendData.status),
    
    // 关联信息
    currentClassId: backendData.classId || backendData.currentClassId,
    currentClassName: backendData.class?.name || backendData.className || backendData.class_name,
    kindergartenId: backendData.kindergartenId || backendData.kindergarten_id,
    kindergartenName: backendData.kindergarten?.name || backendData.kindergartenName || backendData.kindergarten_name,
    
    // 家长信息
    guardian: backendData.parent ? {
      name: backendData.parent.name,
      relationship: backendData.parent.relationship || '家长',
      phone: backendData.parent.phone,
      email: backendData.parent.email,
      address: backendData.parent.address
    } : backendData.guardian,
    
    // 学生信息
    studentNo: backendData.studentNo || backendData.student_no,
    avatar: backendData.avatar || backendData.photo_url,
    
    // 健康信息
    healthCondition: backendData.healthCondition || backendData.health_condition,
    allergyHistory: backendData.allergyHistory || backendData.allergy_history,
    specialNeeds: backendData.specialNeeds || backendData.special_needs,
    
    // 时间信息
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    
    // 移除原始字段
    birth_date: undefined,
    student_no: undefined,
    kindergarten_id: undefined,
    class_name: undefined,
    kindergarten_name: undefined,
    enrollment_date: undefined,
    graduation_date: undefined,
    health_condition: undefined,
    allergy_history: undefined,
    special_needs: undefined,
    photo_url: undefined,
    created_at: undefined,
    updated_at: undefined,
    class: undefined,
    kindergarten: undefined,
    parent: undefined
  };
};

// 学生状态转换
export const transformStudentStatus = (status: number) => {
  const statusMap: Record<number, string> = {
    1: 'ACTIVE',        // 在读 (STUDYING)
    3: 'GRADUATED',     // 毕业
    0: 'INACTIVE',      // 退学 (DROPPED_OUT)
    2: 'SUSPENDED',     // 请假 (ON_LEAVE)
    4: 'PRE_ADMISSION'  // 预录取
  };
  return statusMap[status] || 'INACTIVE';
};

// 教师职位枚举转换
export const transformTeacherPosition = (position: number | string): string => {
  if (typeof position === 'string') return position;
  
  const positionMap: Record<number, string> = {
    1: 'PRINCIPAL',           // 园长
    2: 'VICE_PRINCIPAL',      // 副园长
    3: 'RESEARCH_DIRECTOR',   // 教研主任
    4: 'HEAD_TEACHER',        // 班主任
    5: 'REGULAR_TEACHER',     // 普通教师
    6: 'ASSISTANT_TEACHER'    // 助教
  };
  return positionMap[position] || 'REGULAR_TEACHER';
};

// 教师数据转换
export const transformTeacherData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    // 基础信息
    id: backendData.id,
    
    // 从关联的user对象获取基础信息
    name: backendData.user?.name || backendData.user?.real_name || backendData.name,
    gender: transformGender(backendData.user?.gender || backendData.gender),
    phone: backendData.user?.phone || backendData.phone,
    email: backendData.user?.email || backendData.email,
    
    // 教师特有信息
    employeeId: backendData.teacherNo || backendData.employee_id || backendData.employeeId,
    status: transformTeacherStatus(backendData.status),
    position: transformTeacherPosition(backendData.position), // 修复：添加职位枚举转换
    title: transformTeacherPosition(backendData.position || backendData.title), // 职称从position字段获取
    type: backendData.type || 'FULL_TIME', // 默认全职
    department: backendData.department || '未指定',
    hireDate: formatDate(backendData.entryDate || backendData.hire_date || backendData.hireDate),
    
    // 关联信息
    kindergartenId: backendData.kindergartenId || backendData.kindergarten_id,
    kindergartenName: backendData.kindergarten?.name,
    
    // 班级信息
    classes: backendData.classes || [],
    classIds: backendData.classes?.map((c: any) => c.id) || [],
    classNames: backendData.classes?.map((c: any) => c.name) || [],
    
    // 时间信息
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    
    // 工作信息
    workExperience: backendData.workExperience || backendData.work_experience,
    emergencyContact: backendData.emergencyContact || backendData.emergency_contact,
    emergencyPhone: backendData.emergencyPhone || backendData.emergency_phone,
    
    // 移除原始嵌套结构
    user: undefined,
    kindergarten: undefined,
    teacherNo: undefined,
    hire_date: undefined,
    work_experience: undefined,
    emergency_contact: undefined,
    emergency_phone: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 教师状态转换
export const transformTeacherStatus = (status: number | string): string => {
  if (typeof status === 'string') return status;
  
  const statusMap: Record<number, string> = {
    1: 'ACTIVE',      // 在职
    2: 'ON_LEAVE',    // 请假中 (修复：统一为ON_LEAVE)
    0: 'RESIGNED',    // 离职
    3: 'PROBATION'    // 见习期
  };
  return statusMap[status] || 'ACTIVE';
};

// 性别转换
export const transformGender = (gender: any) => {
  if (typeof gender === 'string') return gender;
  
  const genderMap: Record<number, string> = {
    1: 'MALE',
    2: 'FEMALE'
  };
  return genderMap[gender] || 'MALE';
};

// 班级数据转换
export const transformClassData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    kindergartenId: backendData.kindergartenId,
    headTeacherId: backendData.headTeacherId,
    assistantTeacherId: backendData.assistantTeacherId,
    currentStudentCount: backendData.currentStudentCount,
    imageUrl: backendData.imageUrl,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt
  };
};

// 响应格式标准化 (已去重，使用第一个版本)

// 批量转换学生数据
export const transformStudentList = (students: any[]) => {
  if (!Array.isArray(students)) return [];
  return students.map(transformStudentData);
};

// 批量转换教师数据
export const transformTeacherList = (teachers: any[]) => {
  if (!Array.isArray(teachers)) return [];
  return teachers.map(transformTeacherData);
};

// 批量转换班级数据
export const transformClassList = (classes: any[]) => {
  if (!Array.isArray(classes)) return [];
  return classes.map(transformClassData);
};

// 第一个重复的transformActivityList已删除，保留后面更完整的版本

// 通用列表响应转换
export const transformListResponse = (response: any, dataTransformer?: (item: any) => any) => {
  const normalized = normalizeResponse(response);
  
  if (normalized.items && dataTransformer) {
    normalized.items = normalized.items.map(dataTransformer);
  }
  
  // 保持与原始 API 响应格式一致，前端期望 { success, data: { items, total, ... } }
  return {
    success: normalized.success,
    message: response?.message || '',
    data: {
      items: normalized.items,
      total: normalized.total,
      page: response?.data?.page || 1,
      pageSize: response?.data?.pageSize || 10,
      totalPages: response?.data?.totalPages || Math.ceil(normalized.total / (response?.data?.pageSize || 10))
    }
  };
};

// 学生表单数据转换（前端 -> 后端）
export const transformStudentFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    birth_date: frontendData.birthDate,
    student_no: frontendData.studentNo,
    kindergarten_id: frontendData.kindergartenId,
    enrollment_date: frontendData.enrollmentDate,
    graduation_date: frontendData.graduationDate,
    health_condition: frontendData.healthCondition,
    allergy_history: frontendData.allergyHistory,
    special_needs: frontendData.specialNeeds,
    photo_url: frontendData.photoUrl,
    
    // 性别转换：字符串 -> 数字
    gender: frontendData.gender === 'MALE' ? 1 : frontendData.gender === 'FEMALE' ? 2 : frontendData.gender,
    
    // 状态转换
    status: transformStudentStatusToBackend(frontendData.status),
    
    // 移除前端字段
    birthDate: undefined,
    studentNo: undefined,
    kindergartenId: undefined,
    enrollmentDate: undefined,
    graduationDate: undefined,
    healthCondition: undefined,
    allergyHistory: undefined,
    specialNeeds: undefined,
    photoUrl: undefined
  };
};

// 学生状态转换（前端 -> 后端）
export const transformStudentStatusToBackend = (status: string) => {
  const statusMap: Record<string, number> = {
    'ACTIVE': 1,        // 在读 (STUDYING)
    'GRADUATED': 3,     // 毕业
    'INACTIVE': 0,      // 退学 (DROPPED_OUT)
    'SUSPENDED': 2,     // 请假 (ON_LEAVE)
    'PRE_ADMISSION': 4  // 预录取
  };
  return statusMap[status] || 0;
};

// 教师职位转换（前端 -> 后端）
export const transformTeacherPositionToBackend = (position: string): number => {
  const positionMap: Record<string, number> = {
    'PRINCIPAL': 1,           // 园长
    'VICE_PRINCIPAL': 2,      // 副园长
    'RESEARCH_DIRECTOR': 3,   // 教研主任
    'HEAD_TEACHER': 4,        // 班主任
    'REGULAR_TEACHER': 5,     // 普通教师
    'ASSISTANT_TEACHER': 6    // 助教
  };
  return positionMap[position] || 5;
};

// 教师状态转换（前端 -> 后端）
export const transformTeacherStatusToBackend = (status: string): number => {
  const statusMap: Record<string, number> = {
    'ACTIVE': 1,      // 在职
    'ON_LEAVE': 2,    // 请假中
    'RESIGNED': 0,    // 离职
    'PROBATION': 3    // 见习期
  };
  return statusMap[status] || 1;
};

// 教师表单数据转换（前端 -> 后端）
export const transformTeacherFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    real_name: frontendData.realName || frontendData.name,
    phone_number: frontendData.phoneNumber || frontendData.phone,
    employee_id: frontendData.employeeId,
    kindergarten_id: frontendData.kindergartenId,
    hire_date: frontendData.hireDate,
    work_experience: frontendData.workExperience,
    emergency_contact: frontendData.emergencyContact,
    emergency_phone: frontendData.emergencyPhone,
    
    // 性别转换：字符串 -> 数字
    gender: frontendData.gender === 'MALE' ? 1 : frontendData.gender === 'FEMALE' ? 2 : frontendData.gender,
    
    // 职位转换：字符串 -> 数字
    position: transformTeacherPositionToBackend(frontendData.position),
    
    // 状态转换：字符串 -> 数字
    status: transformTeacherStatusToBackend(frontendData.status),
    
    // 移除前端字段
    realName: undefined,
    phoneNumber: undefined,
    employeeId: undefined,
    kindergartenId: undefined,
    hireDate: undefined,
    workExperience: undefined,
    emergencyContact: undefined,
    emergencyPhone: undefined
  };
};

// 用户数据转换（后端 -> 前端） - 已去重，保留上面更完整的版本

// 角色数据转换（后端 -> 前端）
export const transformRoleData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    isSystem: backendData.is_system,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // 移除下划线字段
    is_system: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 权限数据转换（后端 -> 前端）
export const transformPermissionData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    parentId: backendData.parent_id || backendData.parentId,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // 移除下划线字段
    parent_id: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 批量转换用户数据
export const transformUserList = (users: any[]) => {
  if (!Array.isArray(users)) return [];
  return users.map(transformUserData);
};

// 批量转换角色数据
export const transformRoleList = (roles: any[]) => {
  if (!Array.isArray(roles)) return [];
  return roles.map(transformRoleData);
};

// 批量转换权限数据
export const transformPermissionList = (permissions: any[]) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.map(transformPermissionData);
};

// 用户表单数据转换（前端 -> 后端）
export const transformUserFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    real_name: frontendData.realName,
    
    // 角色ID转换：字符串数组转为数字数组
    roleIds: frontendData.roleIds ? frontendData.roleIds.map((id: string | number) => Number(id)) : undefined,
    
    // 移除前端字段
    realName: undefined
  };
};

// 角色表单数据转换（前端 -> 后端）
export const transformRoleFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    is_system: frontendData.isSystem,
    
    // 移除前端字段
    isSystem: undefined
  };
};

// 权限表单数据转换（前端 -> 后端）
export const transformPermissionFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    parent_id: frontendData.parentId,
    
    // 移除前端字段
    parentId: undefined
  };
};

// 活动数据转换（后端 -> 前端）
export const transformActivityData = (backendData: any) => {
  if (!backendData) return null;
  
  // 检查是否为 dashboard 活动数据（只有 activityName, participantCount, completionRate）
  if (backendData.activityName && backendData.participantCount !== undefined) {
    return {
      activityName: backendData.activityName,
      participantCount: backendData.participantCount,
      completionRate: backendData.completionRate || 0
    };
  }
  
  // 完整的活动数据转换 - 支持两种格式：下划线和驼峰
  return {
    ...backendData,
    // 字段名转换 - 优先使用驼峰格式，回退到下划线格式
    activityType: backendData.activityType || backendData.activity_type,
    coverImage: backendData.coverImage || backendData.cover_image,
    startTime: backendData.startTime || backendData.start_time,
    endTime: backendData.endTime || backendData.end_time,
    registrationStartTime: backendData.registrationStartTime || backendData.registration_start_time,
    registrationEndTime: backendData.registrationEndTime || backendData.registration_end_time,
    needsApproval: backendData.needsApproval !== undefined ? backendData.needsApproval : backendData.needs_approval,
    registeredCount: backendData.registeredCount !== undefined ? backendData.registeredCount : backendData.registered_count,
    kindergartenId: backendData.kindergartenId || backendData.kindergarten_id,
    planId: backendData.planId || backendData.plan_id,
    createdAt: backendData.createdAt || backendData.created_at,
    updatedAt: backendData.updatedAt || backendData.updated_at,

    // 移除下划线字段（如果存在）
    activity_type: undefined,
    cover_image: undefined,
    start_time: undefined,
    end_time: undefined,
    registration_start_time: undefined,
    registration_end_time: undefined,
    needs_approval: undefined,
    registered_count: undefined,
    kindergarten_id: undefined,
    plan_id: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 活动报名数据转换（后端 -> 前端）
export const transformActivityRegistrationData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    activityId: backendData.activity_id,
    parentId: backendData.parent_id,
    studentId: backendData.student_id,
    contactName: backendData.contact_name,
    contactPhone: backendData.contact_phone,
    childName: backendData.child_name,
    childAge: backendData.child_age,
    childGender: backendData.child_gender,
    attendeeCount: backendData.attendee_count,
    specialNeeds: backendData.special_needs,
    isConversion: backendData.is_conversion,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // 移除下划线字段
    activity_id: undefined,
    parent_id: undefined,
    student_id: undefined,
    contact_name: undefined,
    contact_phone: undefined,
    child_name: undefined,
    child_age: undefined,
    child_gender: undefined,
    attendee_count: undefined,
    special_needs: undefined,
    is_conversion: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 批量转换活动数据
export const transformActivityList = (activities: any[]) => {
  if (!Array.isArray(activities)) return [];
  return activities.map(transformActivityData);
};

// 批量转换活动报名数据
export const transformActivityRegistrationList = (registrations: any[]) => {
  if (!Array.isArray(registrations)) return [];
  return registrations.map(transformActivityRegistrationData);
};

// 活动表单数据转换（前端 -> 后端）
export const transformActivityFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    activity_type: frontendData.activityType,
    cover_image: frontendData.coverImage,
    start_time: frontendData.startTime,
    end_time: frontendData.endTime,
    registration_start_time: frontendData.registrationStartTime,
    registration_end_time: frontendData.registrationEndTime,
    needs_approval: frontendData.needsApproval,
    kindergarten_id: frontendData.kindergartenId,
    plan_id: frontendData.planId,
    
    // 移除前端字段
    activityType: undefined,
    coverImage: undefined,
    startTime: undefined,
    endTime: undefined,
    registrationStartTime: undefined,
    registrationEndTime: undefined,
    needsApproval: undefined,
    kindergartenId: undefined,
    planId: undefined
  };
};

// 活动报名表单数据转换（前端 -> 后端）
export const transformActivityRegistrationFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    activity_id: frontendData.activityId,
    parent_id: frontendData.parentId,
    student_id: frontendData.studentId,
    contact_name: frontendData.contactName,
    contact_phone: frontendData.contactPhone,
    child_name: frontendData.childName,
    child_age: frontendData.childAge,
    child_gender: frontendData.childGender,
    attendee_count: frontendData.attendeeCount,
    special_needs: frontendData.specialNeeds,
    is_conversion: frontendData.isConversion,
    
    // 移除前端字段
    activityId: undefined,
    parentId: undefined,
    studentId: undefined,
    contactName: undefined,
    contactPhone: undefined,
    childName: undefined,
    childAge: undefined,
    childGender: undefined,
    attendeeCount: undefined,
    specialNeeds: undefined,
    isConversion: undefined
  };
};

// 家长数据转换（后端 -> 前端）
export const transformParentData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    studentId: backendData.student_id,
    studentName: backendData.student_name,
    userId: backendData.user_id,
    registerDate: backendData.register_date,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // 移除下划线字段
    student_id: undefined,
    student_name: undefined,
    user_id: undefined,
    register_date: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 家长跟进记录数据转换（后端 -> 前端）
export const transformParentFollowUpData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    parentId: backendData.parent_id,
    followupDate: backendData.followup_date,
    followupType: backendData.followup_type,
    followupContent: backendData.followup_content,
    followupResult: backendData.followup_result,
    nextPlan: backendData.next_plan,
    creatorId: backendData.creator_id,
    creatorName: backendData.creator_name,
    createdAt: backendData.created_at,
    updatedAt: backendData.updated_at,
    
    // 移除下划线字段
    parent_id: undefined,
    followup_date: undefined,
    followup_type: undefined,
    followup_content: undefined,
    followup_result: undefined,
    next_plan: undefined,
    creator_id: undefined,
    creator_name: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 批量转换家长数据
export const transformParentList = (parents: any[]) => {
  if (!Array.isArray(parents)) return [];
  return parents.map(transformParentData);
};

// 批量转换家长跟进记录数据
export const transformParentFollowUpList = (followUps: any[]) => {
  if (!Array.isArray(followUps)) return [];
  return followUps.map(transformParentFollowUpData);
};

// 家长表单数据转换（前端 -> 后端）
export const transformParentFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    student_id: frontendData.studentId,
    student_name: frontendData.studentName,
    user_id: frontendData.userId,
    register_date: frontendData.registerDate,
    
    // 移除前端字段
    studentId: undefined,
    studentName: undefined,
    userId: undefined,
    registerDate: undefined
  };
};

// 家长跟进记录表单数据转换（前端 -> 后端）
export const transformParentFollowUpFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    parent_id: frontendData.parentId,
    followup_date: frontendData.followupDate,
    followup_type: frontendData.followupType,
    followup_content: frontendData.followupContent,
    followup_result: frontendData.followupResult,
    next_plan: frontendData.nextPlan,
    creator_id: frontendData.creatorId,
    creator_name: frontendData.creatorName,
    
    // 移除前端字段
    parentId: undefined,
    followupDate: undefined,
    followupType: undefined,
    followupContent: undefined,
    followupResult: undefined,
    nextPlan: undefined,
    creatorId: undefined,
    creatorName: undefined
  };
};

// Dashboard 数据转换（后端 -> 前端） - 修复以对齐后端API /api/dashboard/stats
export const transformDashboardStats = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    // 直接使用后端返回的字段名
    userCount: backendData.userCount || 0,
    kindergartenCount: backendData.kindergartenCount || 0,
    studentCount: backendData.studentCount || 0,
    enrollmentCount: backendData.enrollmentCount || 0,
    activityCount: backendData.activityCount || 0,
    
    // 向后兼容的字段映射 - 修复教师数据显示
    teacherCount: backendData.teacherCount || backendData.teacher_count || backendData.userCount || 0,
    classCount: backendData.classCount || backendData.class_count || 0,
    
    // 计算字段
    enrollmentRate: backendData.enrollmentRate || backendData.enrollment_rate || 0,
    attendanceRate: backendData.attendanceRate || backendData.attendance_rate || 0,
    graduationRate: backendData.graduationRate || backendData.graduation_rate || 0
  };
};

// Dashboard 概览数据转换（后端 -> 前端） - 对齐后端API /api/dashboard/overview
export const transformDashboardOverview = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    totalUsers: backendData.totalUsers || 0,
    totalKindergartens: backendData.totalKindergartens || 0,
    totalStudents: backendData.totalStudents || 0,
    totalApplications: backendData.totalApplications || 0,
    recentActivities: backendData.recentActivities || []
  };
};

// Todo 数据转换（后端 -> 前端） - 修复以对齐后端API /api/dashboard/todos
export const transformTodoData = (backendData: any) => {
  if (!backendData) return null;
  
  // 将后端的数字优先级转换为字符串
  const priorityMap: {[key: number]: string} = {
    0: 'low',
    1: 'medium', 
    2: 'high',
    3: 'high' // 后端似乎使用了3作为高优先级
  };
  
  // 将后端的大写状态转换为小写
  const statusMap: {[key: string]: string} = {
    'PENDING': 'pending',
    'COMPLETED': 'completed',
    'IN_PROGRESS': 'in_progress'
  };
  
  return {
    ...backendData,
    id: backendData.id,
    title: backendData.title,
    description: backendData.description,
    status: statusMap[backendData.status] || backendData.status.toLowerCase(), // 转换为小写
    priority: priorityMap[backendData.priority] || 'medium', // 转换为字符串
    dueDate: backendData.dueDate,
    userId: backendData.userId,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    
    // 移除不需要的字段
    completedDate: undefined,
    assignedTo: undefined,
    tags: undefined,
    relatedId: undefined,
    relatedType: undefined,
    notify: undefined,
    notifyTime: undefined,
    deletedAt: undefined
  };
};

// Schedule 数据转换（后端 -> 前端）
export const transformScheduleData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    startTime: backendData.start_time || backendData.startTime,
    endTime: backendData.end_time || backendData.endTime,
    userId: backendData.user_id || backendData.userId,
    createdAt: backendData.created_at || backendData.createdAt,
    updatedAt: backendData.updated_at || backendData.updatedAt,
    
    // 移除下划线字段
    start_time: undefined,
    end_time: undefined,
    user_id: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// Enrollment Plan 数据转换（后端 -> 前端）
export const transformEnrollmentPlanData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    ...backendData,
    // 字段名转换
    planName: backendData.plan_name || backendData.planName,
    planType: backendData.plan_type || backendData.planType,
    targetCount: backendData.target_count || backendData.targetCount,
    currentCount: backendData.current_count || backendData.currentCount,
    startDate: backendData.start_date || backendData.startDate,
    endDate: backendData.end_date || backendData.endDate,
    kindergartenId: backendData.kindergarten_id || backendData.kindergartenId,
    createdAt: backendData.created_at || backendData.createdAt,
    updatedAt: backendData.updated_at || backendData.updatedAt,
    
    // 移除下划线字段
    plan_name: undefined,
    plan_type: undefined,
    target_count: undefined,
    current_count: undefined,
    start_date: undefined,
    end_date: undefined,
    kindergarten_id: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 批量转换enrollment plan数据
export const transformEnrollmentPlanList = (plans: any[]) => {
  if (!Array.isArray(plans)) return [];
  return plans.map(transformEnrollmentPlanData);
};

// Enrollment Plan 表单数据转换（前端 -> 后端）
export const transformEnrollmentPlanFormData = (frontendData: any) => {
  return {
    ...frontendData,
    // 转换字段名
    plan_name: frontendData.planName,
    plan_type: frontendData.planType,
    target_count: frontendData.targetCount,
    current_count: frontendData.currentCount,
    start_date: frontendData.startDate,
    end_date: frontendData.endDate,
    kindergarten_id: frontendData.kindergartenId,
    
    // 移除前端字段
    planName: undefined,
    planType: undefined,
    targetCount: undefined,
    currentCount: undefined,
    startDate: undefined,
    endDate: undefined,
    kindergartenId: undefined
  };
};

// 幼儿园数据转换（后端 -> 前端）
export const transformKindergartenData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    name: backendData.name,
    code: backendData.code,
    address: backendData.address,
    phone: backendData.phone,
    email: backendData.email,
    website: backendData.website,
    establishedDate: formatDate(backendData.establishedDate || backendData.established_date),
    principalId: backendData.principalId || backendData.principal_id,
    principalName: backendData.principal?.name || backendData.principal_name,
    capacity: backendData.capacity,
    currentEnrollment: backendData.currentEnrollment || backendData.current_enrollment,
    classCount: backendData.classCount || backendData.class_count,
    teacherCount: backendData.teacherCount || backendData.teacher_count,
    studentCount: backendData.studentCount || backendData.student_count,
    status: backendData.status,
    licenseNumber: backendData.licenseNumber || backendData.license_number,
    accreditationLevel: backendData.accreditationLevel || backendData.accreditation_level,
    images: backendData.images || [],
    description: backendData.description,
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    
    // 移除原始字段
    established_date: undefined,
    principal_id: undefined,
    principal_name: undefined,
    current_enrollment: undefined,
    class_count: undefined,
    teacher_count: undefined,
    student_count: undefined,
    license_number: undefined,
    accreditation_level: undefined,
    created_at: undefined,
    updated_at: undefined,
    principal: undefined
  };
};

// AI记忆数据转换（后端 -> 前端）
export const transformAIMemoryData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    userId: backendData.userId || backendData.user_id,
    conversationId: backendData.conversationId || backendData.conversation_id,
    content: backendData.content,
    contentType: backendData.contentType || backendData.content_type,
    embedding: backendData.embedding,
    metadata: backendData.metadata,
    importance: backendData.importance,
    accessCount: backendData.accessCount || backendData.access_count,
    lastAccessedAt: formatDate(backendData.lastAccessedAt || backendData.last_accessed_at),
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    
    // 移除原始字段
    user_id: undefined,
    conversation_id: undefined,
    content_type: undefined,
    access_count: undefined,
    last_accessed_at: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 营销活动数据转换（后端 -> 前端）
export const transformMarketingCampaignData = (backendData: any) => {
  if (!backendData) return null;
  
  return {
    id: backendData.id,
    name: backendData.name,
    description: backendData.description,
    type: backendData.type,
    status: backendData.status,
    budget: backendData.budget,
    spentAmount: backendData.spentAmount || backendData.spent_amount,
    targetAudience: backendData.targetAudience || backendData.target_audience,
    startDate: formatDate(backendData.startDate || backendData.start_date),
    endDate: formatDate(backendData.endDate || backendData.end_date),
    channels: backendData.channels || [],
    metrics: backendData.metrics || {},
    createdBy: backendData.createdBy || backendData.created_by,
    createdAt: formatDate(backendData.createdAt || backendData.created_at),
    updatedAt: formatDate(backendData.updatedAt || backendData.updated_at),
    
    // 移除原始字段
    spent_amount: undefined,
    target_audience: undefined,
    start_date: undefined,
    end_date: undefined,
    created_by: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

// 批量转换函数
export const transformKindergartenList = (kindergartens: any[]) => {
  if (!Array.isArray(kindergartens)) return [];
  return kindergartens.map(transformKindergartenData);
};

export const transformAIMemoryList = (memories: any[]) => {
  if (!Array.isArray(memories)) return [];
  return memories.map(transformAIMemoryData);
};

export const transformMarketingCampaignList = (campaigns: any[]) => {
  if (!Array.isArray(campaigns)) return [];
  return campaigns.map(transformMarketingCampaignData);
};

