/**
 * 创建教师的数据传输对象
 */
export interface CreateTeacherDto {
  /**
   * 用户ID（可选，如果不提供则从人员中心创建）
   */
  userId?: number;

  /**
   * 幼儿园ID（可选，如果不提供则从用户上下文获取）
   */
  kindergartenId?: number;

  /**
   * 职位
   */
  position: string;

  /**
   * 教师编号
   */
  teacherNo?: string;

  /**
   * 入职日期
   */
  entryDate?: Date;

  /**
   * 离职日期
   */
  departureDate?: Date;

  /**
   * 状态（1:在职, 0:离职）
   */
  status?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 班级ID列表
   */
  classIds?: number[];

  // ✅ 从人员中心创建时的字段
  /**
   * 真实姓名（从人员中心创建时使用）
   */
  realName?: string;

  /**
   * 手机号（从人员中心创建时使用）
   */
  phone?: string;

  /**
   * 邮箱（从人员中心创建时使用）
   */
  email?: string;

  /**
   * 教育背景（从人员中心创建时使用）
   */
  education?: number;

  /**
   * 专业（从人员中心创建时使用）
   */
  major?: string;

  /**
   * 聘用日期（从人员中心创建时使用）
   */
  hireDate?: string | Date;

  /**
   * 角色ID（从人员中心创建时使用，用于创建 user_roles 关联）
   */
  roleId?: number;
}

/**
 * 更新教师的数据传输对象
 */
export interface UpdateTeacherDto {
  /**
   * 用户ID
   */
  userId?: number;
  
  /**
   * 幼儿园ID
   */
  kindergartenId?: number;
  
  /**
   * 职位
   */
  position?: string;
  
  /**
   * 教师编号
   */
  teacherNo?: string;
  
  /**
   * 入职日期
   */
  entryDate?: Date;
  
  /**
   * 离职日期
   */
  departureDate?: Date;
  
  /**
   * 状态（1:在职, 0:离职）
   */
  status?: number;
  
  /**
   * 备注
   */
  remark?: string;
  
  /**
   * 班级ID列表
   */
  classIds?: number[];
} 