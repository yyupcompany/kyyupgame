/**
 * 角色-数据库表权限映射配置
 * 
 * 🔒 安全规则：
 * 1. 每个角色只能访问明确列出的表
 * 2. 不在白名单中的表一律拒绝访问
 * 3. 必须添加WHERE条件限制数据范围
 * 4. 禁止跨角色数据访问
 */

export interface TablePermission {
  tableName: string;
  description: string;
  allowedFields: string[];  // 允许查询的字段
  requiredConditions?: string[];  // 必须添加的WHERE条件
  forbiddenFields?: string[];  // 禁止查询的字段（敏感信息）
}

export interface RolePermissions {
  roleName: string;
  description: string;
  allowedTables: TablePermission[];
  forbiddenTables: string[];  // 明确禁止访问的表
}

/**
 * 角色权限配置
 */
export const ROLE_TABLE_PERMISSIONS: Record<string, RolePermissions> = {
  
  // ==================== 系统管理员角色 ====================
  'super_admin': {
    roleName: 'super_admin',
    description: '系统管理员 - 拥有所有表的访问权限，包括系统配置',
    allowedTables: [
      {
        tableName: 'users',
        description: '用户表',
        allowedFields: ['id', 'username', 'email', 'role', 'real_name', 'phone', 'status', 'created_at'],
        forbiddenFields: ['password', 'password_hash']  // 禁止查询密码
      },
      {
        tableName: 'roles',
        description: '角色表',
        allowedFields: ['id', 'name', 'code', 'description', 'status', 'created_at']
      },
      {
        tableName: 'permissions',
        description: '权限表',
        allowedFields: ['id', 'name', 'code', 'resource', 'action', 'status', 'created_at']
      },
      {
        tableName: 'user_roles',
        description: '用户角色关系表',
        allowedFields: ['id', 'user_id', 'role_id', 'created_at']
      },
      {
        tableName: 'role_permissions',
        description: '角色权限关系表',
        allowedFields: ['id', 'role_id', 'permission_id', 'created_at']
      },
      {
        tableName: 'system_configs',
        description: '系统配置表',
        allowedFields: ['id', 'config_key', 'config_value', 'description', 'status', 'created_at']
      },
      {
        tableName: 'system_logs',
        description: '系统日志表',
        allowedFields: ['id', 'user_id', 'action', 'module', 'ip_address', 'created_at']
      },
      {
        tableName: 'ai_model_configs',
        description: 'AI模型配置表',
        allowedFields: ['id', 'name', 'display_name', 'provider', 'model_type', 'status', 'created_at']
      },
      {
        tableName: 'teachers',
        description: '教师表',
        allowedFields: ['id', 'user_id', 'kindergarten_id', 'teacher_no', 'position', 'hire_date', 'education', 'status']
      },
      {
        tableName: 'students',
        description: '学生表',
        allowedFields: ['id', 'name', 'student_no', 'kindergarten_id', 'class_id', 'gender', 'birth_date', 'enrollment_date', 'status']
      },
      {
        tableName: 'classes',
        description: '班级表',
        allowedFields: ['id', 'name', 'code', 'kindergarten_id', 'type', 'grade', 'capacity', 'current_student_count', 'status']
      },
      {
        tableName: 'class_teachers',
        description: '班级教师关系表',
        allowedFields: ['id', 'class_id', 'teacher_id', 'is_main_teacher', 'subject', 'start_date', 'end_date']
      },
      {
        tableName: 'parents',
        description: '家长表',
        allowedFields: ['id', 'name', 'gender', 'phone', 'email', 'relationship', 'occupation', 'status']
      },
      {
        tableName: 'activities',
        description: '活动表',
        allowedFields: ['id', 'kindergarten_id', 'title', 'activity_type', 'start_time', 'end_time', 'location', 'capacity', 'registered_count', 'status']
      },
      {
        tableName: 'activity_registrations',
        description: '活动报名表',
        allowedFields: ['id', 'activity_id', 'parent_id', 'student_id', 'contact_name', 'contact_phone', 'registration_time', 'status']
      },
      {
        tableName: 'enrollment_applications',
        description: '招生申请表',
        allowedFields: ['id', 'student_name', 'gender', 'birth_date', 'parent_id', 'plan_id', 'status', 'apply_date', 'contact_phone']
      },
      {
        tableName: 'marketing_campaigns',
        description: '营销活动表',
        allowedFields: ['id', 'kindergarten_id', 'title', 'campaign_type', 'start_date', 'end_date', 'budget', 'target_reach', 'status']
      }
    ],
    forbiddenTables: []  // 系统管理员没有禁止的表
  },

  // ==================== 园长角色 ====================
  'principal': {
    roleName: 'principal',
    description: '园长 - 拥有幼儿园业务数据的完整访问权限，但不能访问系统配置',
    allowedTables: [
      {
        tableName: 'users',
        description: '用户表（仅限本幼儿园用户）',
        allowedFields: ['id', 'username', 'email', 'role', 'real_name', 'phone', 'status', 'created_at'],
        forbiddenFields: ['password', 'password_hash'],
        requiredConditions: [
          'users.id IN (SELECT user_id FROM teachers WHERE kindergarten_id = {current_kindergarten_id})'
        ]
      },
      {
        tableName: 'teachers',
        description: '教师表（仅限本幼儿园）',
        allowedFields: ['id', 'user_id', 'kindergarten_id', 'teacher_no', 'position', 'hire_date', 'education', 'status'],
        requiredConditions: [
          'teachers.kindergarten_id = {current_kindergarten_id}'
        ]
      },
      {
        tableName: 'students',
        description: '学生表（仅限本幼儿园）',
        allowedFields: ['id', 'name', 'student_no', 'kindergarten_id', 'class_id', 'gender', 'birth_date', 'enrollment_date', 'status'],
        requiredConditions: [
          'students.kindergarten_id = {current_kindergarten_id}'
        ]
      },
      {
        tableName: 'classes',
        description: '班级表（仅限本幼儿园）',
        allowedFields: ['id', 'name', 'code', 'kindergarten_id', 'type', 'grade', 'capacity', 'current_student_count', 'status'],
        requiredConditions: [
          'classes.kindergarten_id = {current_kindergarten_id}'
        ]
      },
      {
        tableName: 'class_teachers',
        description: '班级教师关系表（仅限本幼儿园）',
        allowedFields: ['id', 'class_id', 'teacher_id', 'is_main_teacher', 'subject', 'start_date', 'end_date'],
        requiredConditions: [
          'class_teachers.class_id IN (SELECT id FROM classes WHERE kindergarten_id = {current_kindergarten_id})'
        ]
      },
      {
        tableName: 'parents',
        description: '家长表（仅限本幼儿园学生的家长）',
        allowedFields: ['id', 'name', 'gender', 'phone', 'email', 'relationship', 'occupation', 'status'],
        requiredConditions: [
          'parents.id IN (SELECT parent_id FROM parent_student_relations WHERE student_id IN (SELECT id FROM students WHERE kindergarten_id = {current_kindergarten_id}))'
        ]
      },
      {
        tableName: 'activities',
        description: '活动表（仅限本幼儿园）',
        allowedFields: ['id', 'kindergarten_id', 'title', 'activity_type', 'start_time', 'end_time', 'location', 'capacity', 'registered_count', 'status'],
        requiredConditions: [
          'activities.kindergarten_id = {current_kindergarten_id}'
        ]
      },
      {
        tableName: 'activity_registrations',
        description: '活动报名表（仅限本幼儿园）',
        allowedFields: ['id', 'activity_id', 'parent_id', 'student_id', 'contact_name', 'contact_phone', 'registration_time', 'status'],
        requiredConditions: [
          'activity_registrations.activity_id IN (SELECT id FROM activities WHERE kindergarten_id = {current_kindergarten_id})'
        ]
      },
      {
        tableName: 'enrollment_applications',
        description: '招生申请表（仅限本幼儿园）',
        allowedFields: ['id', 'student_name', 'gender', 'birth_date', 'parent_id', 'plan_id', 'status', 'apply_date', 'contact_phone'],
        requiredConditions: [
          'enrollment_applications.plan_id IN (SELECT id FROM enrollment_plans WHERE kindergarten_id = {current_kindergarten_id})'
        ]
      },
      {
        tableName: 'marketing_campaigns',
        description: '营销活动表（仅限本幼儿园）',
        allowedFields: ['id', 'kindergarten_id', 'title', 'campaign_type', 'start_date', 'end_date', 'budget', 'target_reach', 'status'],
        requiredConditions: [
          'marketing_campaigns.kindergarten_id = {current_kindergarten_id}'
        ]
      }
    ],
    forbiddenTables: [
      'roles',  // 禁止查询角色表
      'permissions',  // 禁止查询权限表
      'user_roles',  // 禁止查询用户角色关系
      'role_permissions',  // 禁止查询角色权限关系
      'system_configs',  // 禁止查询系统配置
      'system_logs',  // 禁止查询系统日志
      'ai_model_configs',  // 禁止查询AI模型配置
      'ai_conversations',  // 禁止查询AI对话记录
      'ai_memories'  // 禁止查询AI记忆
    ]
  },

  // ==================== 管理员角色（兼容旧代码） ====================
  'admin': {
    roleName: 'admin',
    description: '管理员 - 等同于园长角色',
    allowedTables: [],  // 将使用principal的配置
    forbiddenTables: []
  },

  // ==================== 教师角色 ====================
  'teacher': {
    roleName: 'teacher',
    description: '教师 - 只能访问自己负责的班级和学生数据',
    allowedTables: [
      {
        tableName: 'students',
        description: '学生表（仅限自己班级的学生）',
        allowedFields: ['id', 'name', 'student_no', 'class_id', 'gender', 'birth_date', 'enrollment_date', 'status'],
        requiredConditions: [
          'students.class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = {current_teacher_id})'
        ]
      },
      {
        tableName: 'classes',
        description: '班级表（仅限自己负责的班级）',
        allowedFields: ['id', 'name', 'code', 'type', 'grade', 'capacity', 'current_student_count', 'status'],
        requiredConditions: [
          'classes.id IN (SELECT class_id FROM class_teachers WHERE teacher_id = {current_teacher_id})'
        ]
      },
      {
        tableName: 'class_teachers',
        description: '班级教师关系表（仅限自己的记录）',
        allowedFields: ['id', 'class_id', 'teacher_id', 'is_main_teacher', 'subject', 'start_date', 'end_date'],
        requiredConditions: [
          'class_teachers.teacher_id = {current_teacher_id}'
        ]
      },
      {
        tableName: 'activities',
        description: '活动表（仅限自己幼儿园的活动）',
        allowedFields: ['id', 'title', 'activity_type', 'start_time', 'end_time', 'location', 'capacity', 'registered_count', 'status'],
        requiredConditions: [
          'activities.kindergarten_id = (SELECT kindergarten_id FROM teachers WHERE id = {current_teacher_id})'
        ]
      },
      {
        tableName: 'activity_registrations',
        description: '活动报名表（仅限自己班级学生的报名）',
        allowedFields: ['id', 'activity_id', 'student_id', 'contact_name', 'registration_time', 'status'],
        requiredConditions: [
          'activity_registrations.student_id IN (SELECT id FROM students WHERE class_id IN (SELECT class_id FROM class_teachers WHERE teacher_id = {current_teacher_id}))'
        ]
      },
      {
        tableName: 'activity_evaluations',
        description: '活动评估表（仅限自己创建的评估）',
        allowedFields: ['id', 'activity_id', 'student_id', 'evaluation_score', 'teacher_comments', 'created_at'],
        requiredConditions: [
          'activity_evaluations.teacher_id = {current_teacher_id}'
        ]
      }
    ],
    forbiddenTables: [
      'users',  // 禁止查询用户表
      'roles',  // 禁止查询角色表
      'permissions',  // 禁止查询权限表
      'teachers',  // 禁止查询其他教师信息
      'parents',  // 禁止直接查询家长表
      'enrollment_applications',  // 禁止查询招生申请
      'marketing_campaigns',  // 禁止查询营销活动
      'system_configs',  // 禁止查询系统配置
      'system_logs',  // 禁止查询系统日志
      'ai_model_config',  // 禁止查询AI模型配置
      'ai_conversations',  // 禁止查询AI对话记录
      'ai_memories'  // 禁止查询AI记忆
    ]
  },

  // ==================== 家长角色 ====================
  'parent': {
    roleName: 'parent',
    description: '家长 - 只能访问自己孩子的数据',
    allowedTables: [
      {
        tableName: 'students',
        description: '学生表（仅限自己的孩子）',
        allowedFields: ['id', 'name', 'student_no', 'class_id', 'gender', 'birth_date', 'enrollment_date', 'status'],
        requiredConditions: [
          'students.id IN (SELECT student_id FROM parent_student_relations WHERE parent_id = {current_parent_id})'
        ]
      },
      {
        tableName: 'classes',
        description: '班级表（仅限孩子所在的班级）',
        allowedFields: ['id', 'name', 'code', 'type', 'grade'],
        requiredConditions: [
          'classes.id IN (SELECT class_id FROM students WHERE id IN (SELECT student_id FROM parent_student_relations WHERE parent_id = {current_parent_id}))'
        ]
      },
      {
        tableName: 'activities',
        description: '活动表（仅限孩子幼儿园的活动）',
        allowedFields: ['id', 'title', 'activity_type', 'start_time', 'end_time', 'location', 'capacity', 'registered_count', 'status'],
        requiredConditions: [
          'activities.kindergarten_id IN (SELECT kindergarten_id FROM students WHERE id IN (SELECT student_id FROM parent_student_relations WHERE parent_id = {current_parent_id}))'
        ]
      },
      {
        tableName: 'activity_registrations',
        description: '活动报名表（仅限自己孩子的报名）',
        allowedFields: ['id', 'activity_id', 'student_id', 'contact_name', 'registration_time', 'status'],
        requiredConditions: [
          'activity_registrations.student_id IN (SELECT student_id FROM parent_student_relations WHERE parent_id = {current_parent_id})'
        ]
      }
    ],
    forbiddenTables: [
      'users',  // 禁止查询用户表
      'roles',  // 禁止查询角色表
      'permissions',  // 禁止查询权限表
      'teachers',  // 禁止查询教师表
      'parents',  // 禁止查询其他家长信息
      'class_teachers',  // 禁止查询班级教师关系
      'enrollment_applications',  // 禁止查询招生申请
      'marketing_campaigns',  // 禁止查询营销活动
      'system_configs',  // 禁止查询系统配置
      'system_logs',  // 禁止查询系统日志
      'ai_model_config',  // 禁止查询AI模型配置
      'ai_conversations',  // 禁止查询AI对话记录
      'ai_memories',  // 禁止查询AI记忆
      'activity_evaluations'  // 禁止查询活动评估
    ]
  }
};

/**
 * 检查角色是否有权限访问指定表
 */
export function checkTablePermission(role: string, tableName: string): boolean {
  let rolePermissions = ROLE_TABLE_PERMISSIONS[role.toLowerCase()];

  if (!rolePermissions) {
    console.warn(`[权限检查] 未知角色: ${role}`);
    return false;
  }

  // 🔄 admin角色使用principal的配置
  if (role.toLowerCase() === 'admin' && rolePermissions.allowedTables.length === 0) {
    rolePermissions = ROLE_TABLE_PERMISSIONS['principal'];
    console.log(`[权限检查] admin角色使用principal配置`);
  }

  // 检查是否在禁止列表中
  if (rolePermissions.forbiddenTables.includes(tableName)) {
    console.warn(`[权限检查] 角色 ${role} 禁止访问表 ${tableName}`);
    return false;
  }

  // 检查是否在允许列表中
  const allowed = rolePermissions.allowedTables.some(t => t.tableName === tableName);
  if (!allowed) {
    console.warn(`[权限检查] 角色 ${role} 未授权访问表 ${tableName}`);
  }

  return allowed;
}

/**
 * 获取角色对指定表的权限配置
 */
export function getTablePermission(role: string, tableName: string): TablePermission | null {
  let rolePermissions = ROLE_TABLE_PERMISSIONS[role.toLowerCase()];

  if (!rolePermissions) {
    return null;
  }

  // 🔄 admin角色使用principal的配置
  if (role.toLowerCase() === 'admin' && rolePermissions.allowedTables.length === 0) {
    rolePermissions = ROLE_TABLE_PERMISSIONS['principal'];
  }

  return rolePermissions.allowedTables.find(t => t.tableName === tableName) || null;
}

/**
 * 验证SQL查询是否符合角色权限
 */
export function validateSQLPermissions(role: string, sql: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 提取SQL中的表名
  const tablePattern = /FROM\s+(\w+)|JOIN\s+(\w+)/gi;
  const matches = sql.matchAll(tablePattern);
  const tables = new Set<string>();
  
  for (const match of matches) {
    const tableName = match[1] || match[2];
    if (tableName) {
      tables.add(tableName.toLowerCase());
    }
  }
  
  // 检查每个表的权限
  for (const tableName of tables) {
    if (!checkTablePermission(role, tableName)) {
      errors.push(`角色 ${role} 无权访问表 ${tableName}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

