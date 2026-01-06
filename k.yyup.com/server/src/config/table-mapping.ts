/**
 * 数据表映射文件
 * 定义AI系统与现有系统表的映射关系
 */

// 表名常量
export const tables = {
  // 现有系统表
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  USER_ROLES: 'user_roles',
  ROLE_PERMISSIONS: 'role_permissions',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  PARENTS: 'parents',
  CLASSES: 'classes',
  CLASS_TEACHERS: 'class_teachers',
  KINDERGARTENS: 'kindergartens',
  ACTIVITIES: 'activities',
  
  // AI系统表（计划开发，目前不存在）
  AI_USER_RELATIONS: 'ai_user_relations',
  AI_USER_PERMISSIONS: 'ai_user_permissions',
  AI_MEMORIES: 'ai_memories',
  AI_CONVERSATIONS: 'ai_conversations',
  AI_MODEL_CONFIG: 'ai_model_config',
  AI_MODEL_USAGE: 'ai_model_usage',
  AI_MODEL_BILLING: 'ai_model_billing',
  AI_TABLE_METADATA: 'ai_table_metadata',
  AI_COLUMN_METADATA: 'ai_column_metadata',
  AI_ROLE_TABLE_ACCESS: 'ai_role_table_access',
  AI_QUERY_HISTORY: 'ai_query_history'
};

// 表字段映射
export const tableFields = {
  // 用户表字段
  [tables.USERS]: {
    ID: 'id',
    USERNAME: 'username',
    PASSWORD: 'password',
    EMAIL: 'email',
    PHONE: 'phone',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    REAL_NAME: 'real_name'
  },
  
  // 角色表字段
  [tables.ROLES]: {
    ID: 'id',
    NAME: 'name',
    CODE: 'code',
    DESCRIPTION: 'description',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // 权限表字段
  [tables.PERMISSIONS]: {
    ID: 'id',
    NAME: 'name',
    CODE: 'code',
    TYPE: 'type',
    PARENT_ID: 'parent_id',
    PATH: 'path',
    COMPONENT: 'component',
    PERMISSION: 'permission',
    ICON: 'icon',
    SORT: 'sort',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // 用户角色关联表字段
  [tables.USER_ROLES]: {
    ID: 'id',
    USER_ID: 'user_id',
    ROLE_ID: 'role_id',
    IS_PRIMARY: 'is_primary',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    GRANTOR_ID: 'grantor_id',
    CREATOR_ID: 'creator_id',
    UPDATER_ID: 'updater_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DELETED_AT: 'deleted_at',
    IS_SYSTEM: 'is_system'
  },
  
  // 角色权限关联表字段
  [tables.ROLE_PERMISSIONS]: {
    ID: 'id',
    ROLE_ID: 'role_id',
    PERMISSION_ID: 'permission_id',
    IS_INHERIT: 'is_inherit',
    GRANT_TIME: 'grant_time',
    GRANTOR_ID: 'grantor_id',
    CREATOR_ID: 'creator_id',
    UPDATER_ID: 'updater_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DELETED_AT: 'deleted_at',
    IS_SYSTEM: 'is_system'
  },
  
  // AI用户关系表字段（计划开发）
  [tables.AI_USER_RELATIONS]: {
    ID: 'id',
    EXTERNAL_USER_ID: 'external_user_id',
    AI_SETTINGS: 'ai_settings',
    LAST_ACTIVITY: 'last_activity',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  }
};

// 表关系映射
export const tableRelations = [
  // 用户与角色的多对多关系
  {
    sourceTable: tables.USERS,
    targetTable: tables.ROLES,
    relationType: 'many-to-many',
    junctionTable: tables.USER_ROLES,
    sourceKey: tableFields[tables.USERS].ID,
    targetKey: tableFields[tables.ROLES].ID,
    sourceJunctionKey: tableFields[tables.USER_ROLES].USER_ID,
    targetJunctionKey: tableFields[tables.USER_ROLES].ROLE_ID
  },
  
  // 角色与权限的多对多关系
  {
    sourceTable: tables.ROLES,
    targetTable: tables.PERMISSIONS,
    relationType: 'many-to-many',
    junctionTable: tables.ROLE_PERMISSIONS,
    sourceKey: tableFields[tables.ROLES].ID,
    targetKey: tableFields[tables.PERMISSIONS].ID,
    sourceJunctionKey: tableFields[tables.ROLE_PERMISSIONS].ROLE_ID,
    targetJunctionKey: tableFields[tables.ROLE_PERMISSIONS].PERMISSION_ID
  },
  
  // AI用户关系与用户的一对一关系（计划开发）
  {
    sourceTable: tables.AI_USER_RELATIONS,
    targetTable: tables.USERS,
    relationType: 'one-to-one',
    sourceKey: tableFields[tables.AI_USER_RELATIONS].EXTERNAL_USER_ID,
    targetKey: tableFields[tables.USERS].ID
  }
];

// 数据查询映射
export const queryMapping = {
  // 获取用户角色
  getUserRoles: `
    SELECT r.id, r.name, r.code
    FROM ${tables.ROLES} r
    JOIN ${tables.USER_ROLES} ur ON r.id = ur.role_id
    WHERE ur.user_id = ? AND ur.deleted_at IS NULL
  `,
  
  // 获取角色权限
  getRolePermissions: `
    SELECT p.id, p.name, p.code, p.permission
    FROM ${tables.PERMISSIONS} p
    JOIN ${tables.ROLE_PERMISSIONS} rp ON p.id = rp.permission_id
    WHERE rp.role_id = ? AND rp.deleted_at IS NULL
  `,
  
  // 获取用户信息
  getUserInfo: `
    SELECT u.id, u.username, u.email, u.phone, u.status, u.real_name
    FROM ${tables.USERS} u
    WHERE u.id = ?
  `
}; 