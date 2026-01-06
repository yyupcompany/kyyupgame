/**
 * 测试用户配置
 * 定义四个角色的测试用户账号和权限
 */

export interface TestUser {
  id: string
  username: string
  password: string
  role: 'ADMIN' | 'TEACHER' | 'PRINCIPAL' | 'PARENT'
  name: string
  email: string
  phone: string
  permissions: string[]
  centers: string[]
}

export const TEST_USERS: Record<string, TestUser> = {
  // 系统管理员
  admin: {
    id: 'admin-001',
    username: 'admin_test',
    password: 'Test@123456',
    role: 'ADMIN',
    name: '系统管理员测试',
    email: 'admin@test.com',
    phone: '13800138001',
    permissions: [
      'system.settings',
      'user.management',
      'role.management',
      'permission.management',
      'audit.logs',
      'data.backup',
      'system.maintenance'
    ],
    centers: ['user-center', 'system-center', 'permission-center']
  },

  // 教师
  teacher: {
    id: 'teacher-001',
    username: 'teacher_test',
    password: 'Test@123456',
    role: 'TEACHER',
    name: '教师测试',
    email: 'teacher@test.com',
    phone: '13800138002',
    permissions: [
      'class.management',
      'student.management',
      'teaching.tools',
      'activity.management',
      'parent.communication',
      'attendance.management',
      'grade.management'
    ],
    centers: ['class-center', 'student-center', 'teaching-center']
  },

  // 园长
  principal: {
    id: 'principal-001',
    username: 'principal_test',
    password: 'Test@123456',
    role: 'PRINCIPAL',
    name: '园长测试',
    email: 'principal@test.com',
    phone: '13800138003',
    permissions: [
      'enrollment.management',
      'staff.management',
      'financial.management',
      'report.view',
      'approval.workflow',
      'quality.supervision',
      'parent.relations'
    ],
    centers: ['enrollment-center', 'finance-center', 'report-center', 'approval-center']
  },

  // 家长
  parent: {
    id: 'parent-001',
    username: 'parent_test',
    password: 'Test@123456',
    role: 'PARENT',
    name: '家长测试',
    email: 'parent@test.com',
    phone: '13800138004',
    permissions: [
      'child.info.view',
      'activity.registration',
      'teacher.communication',
      'growth.records',
      'photo.album',
      'notifications.view'
    ],
    centers: ['child-center', 'activity-center', 'communication-center']
  }
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  ADMIN: {
    canAccessAllCenters: true,
    canManageUsers: true,
    canManageSystem: true,
    canViewAllData: true
  },
  TEACHER: {
    canAccessOwnClass: true,
    canManageStudents: true,
    canCreateActivities: true,
    canCommunicateWithParents: true
  },
  PRINCIPAL: {
    canManageStaff: true,
    canViewReports: true,
    canApproveRequests: true,
    canManageEnrollment: true
  },
  PARENT: {
    canViewOwnChildren: true,
    canRegisterActivities: true,
    canCommunicateWithTeachers: true,
    canViewGrowthRecords: true
  }
}

// 获取测试用户
export function getTestUser(role: keyof typeof TEST_USERS): TestUser {
  const user = TEST_USERS[role]
  if (!user) {
    throw new Error(`Test user not found for role: ${role}`)
  }
  return user
}

// 获取所有测试用户
export function getAllTestUsers(): TestUser[] {
  return Object.values(TEST_USERS)
}

// 验证用户权限
export function hasPermission(user: TestUser, permission: string): boolean {
  return user.permissions.includes(permission)
}