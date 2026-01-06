import redisService from './redis.service';

/**
 * 角色缓存服务
 * 为教师、admin、园长角色提供Redis缓存功能
 *
 * ⚠️ 注意：权限缓存已统一由 PermissionCacheService 管理
 * 本服务仅负责角色特定的业务数据缓存（教师班级、学生、活动等）
 */
export class RoleCacheService {
  // 缓存键前缀 - 仅保留角色特定的业务数据缓存
  private static readonly PREFIX = {
    TEACHER: 'teacher:',           // 教师特定数据
    ADMIN: 'admin:',               // 管理员特定数据
    PRINCIPAL: 'principal:',       // 园长特定数据
    TEACHER_CLASS: 'teacher:class:',     // 教师班级数据
    TEACHER_STUDENT: 'teacher:student:', // 教师学生数据
    TEACHER_ACTIVITY: 'teacher:activity:', // 教师活动数据
    DASHBOARD_DATA: 'dashboard:',  // 仪表板数据
    CLASS_DATA: 'class:',          // 班级数据
    STUDENT_DATA: 'student:',      // 学生数据
    ACTIVITY_DATA: 'activity:'     // 活动数据
  };

  // 缓存过期时间（秒）
  private static readonly TTL = {
    SHORT: 60,           // 1分钟
    MEDIUM: 300,         // 5分钟
    LONG: 1800,          // 30分钟
    VERY_LONG: 3600,     // 1小时
    DASHBOARD: 300,      // 仪表板数据5分钟
    LIST: 180            // 列表数据3分钟
  };

  /**
   * 获取教师数据缓存
   */
  static async getTeacherData(teacherId: number, dataType: string): Promise<any> {
    const key = `${this.PREFIX.TEACHER}${teacherId}:${dataType}`;
    return await redisService.get(key);
  }

  /**
   * 设置教师数据缓存
   */
  static async setTeacherData(
    teacherId: number, 
    dataType: string, 
    data: any, 
    ttl: number = this.TTL.MEDIUM
  ): Promise<void> {
    const key = `${this.PREFIX.TEACHER}${teacherId}:${dataType}`;
    await redisService.set(key, data, ttl);
  }

  /**
   * 获取管理员数据缓存
   */
  static async getAdminData(dataType: string, params?: any): Promise<any> {
    const key = params 
      ? `${this.PREFIX.ADMIN}${dataType}:${JSON.stringify(params)}`
      : `${this.PREFIX.ADMIN}${dataType}`;
    return await redisService.get(key);
  }

  /**
   * 设置管理员数据缓存
   */
  static async setAdminData(
    dataType: string, 
    data: any, 
    ttl: number = this.TTL.MEDIUM,
    params?: any
  ): Promise<void> {
    const key = params 
      ? `${this.PREFIX.ADMIN}${dataType}:${JSON.stringify(params)}`
      : `${this.PREFIX.ADMIN}${dataType}`;
    await redisService.set(key, data, ttl);
  }

  /**
   * 获取园长数据缓存
   */
  static async getPrincipalData(principalId: number, dataType: string): Promise<any> {
    const key = `${this.PREFIX.PRINCIPAL}${principalId}:${dataType}`;
    return await redisService.get(key);
  }

  /**
   * 设置园长数据缓存
   */
  static async setPrincipalData(
    principalId: number, 
    dataType: string, 
    data: any, 
    ttl: number = this.TTL.MEDIUM
  ): Promise<void> {
    const key = `${this.PREFIX.PRINCIPAL}${principalId}:${dataType}`;
    await redisService.set(key, data, ttl);
  }

  // ⚠️ 权限缓存已移至 PermissionCacheService，不再在此处处理
  // 使用 PermissionCacheService.getUserPermissions() 获取权限缓存

  /**
   * 获取仪表板数据缓存
   */
  static async getDashboardData(userId: number, role: string): Promise<any> {
    const key = `${this.PREFIX.DASHBOARD_DATA}${role}:${userId}`;
    return await redisService.get(key);
  }

  /**
   * 设置仪表板数据缓存
   */
  static async setDashboardData(userId: number, role: string, data: any): Promise<void> {
    const key = `${this.PREFIX.DASHBOARD_DATA}${role}:${userId}`;
    await redisService.set(key, data, this.TTL.DASHBOARD);
  }

  /**
   * 获取班级数据缓存
   */
  static async getClassData(classId: number): Promise<any> {
    const key = `${this.PREFIX.CLASS_DATA}${classId}`;
    return await redisService.get(key);
  }

  /**
   * 设置班级数据缓存
   */
  static async setClassData(classId: number, data: any): Promise<void> {
    const key = `${this.PREFIX.CLASS_DATA}${classId}`;
    await redisService.set(key, data, this.TTL.MEDIUM);
  }

  /**
   * 获取学生列表缓存
   */
  static async getStudentList(params: any): Promise<any> {
    const key = `${this.PREFIX.STUDENT_DATA}list:${JSON.stringify(params)}`;
    return await redisService.get(key);
  }

  /**
   * 设置学生列表缓存
   */
  static async setStudentList(params: any, data: any): Promise<void> {
    const key = `${this.PREFIX.STUDENT_DATA}list:${JSON.stringify(params)}`;
    await redisService.set(key, data, this.TTL.LIST);
  }

  /**
   * 获取活动列表缓存
   */
  static async getActivityList(params: any): Promise<any> {
    const key = `${this.PREFIX.ACTIVITY_DATA}list:${JSON.stringify(params)}`;
    return await redisService.get(key);
  }

  /**
   * 设置活动列表缓存
   */
  static async setActivityList(params: any, data: any): Promise<void> {
    const key = `${this.PREFIX.ACTIVITY_DATA}list:${JSON.stringify(params)}`;
    await redisService.set(key, data, this.TTL.LIST);
  }

  /**
   * 清除教师特定用户的所有缓存
   * @param teacherId 教师ID（不是userId）
   */
  static async clearTeacherCache(teacherId: number): Promise<void> {
    console.log(`🗑️ 清除教师缓存: teacherId=${teacherId}`);
    const patterns = [
      `${this.PREFIX.TEACHER}${teacherId}:*`,
      `${this.PREFIX.TEACHER_CLASS}${teacherId}:*`,
      `${this.PREFIX.TEACHER_STUDENT}${teacherId}:*`,
      `${this.PREFIX.TEACHER_ACTIVITY}${teacherId}:*`
    ];

    for (const pattern of patterns) {
      try {
        await redisService.del(pattern);
        console.log(`✅ 已清除缓存: ${pattern}`);
      } catch (error) {
        console.error(`❌ 清除缓存失败: ${pattern}`, error);
      }
    }
  }

  /**
   * 清除园长特定用户的所有缓存
   * @param principalId 园长ID（不是userId）
   */
  static async clearPrincipalCache(principalId: number): Promise<void> {
    console.log(`🗑️ 清除园长缓存: principalId=${principalId}`);
    const patterns = [
      `${this.PREFIX.PRINCIPAL}${principalId}:*`,
      `${this.PREFIX.DASHBOARD_DATA}principal:${principalId}:*`
    ];

    for (const pattern of patterns) {
      try {
        await redisService.del(pattern);
        console.log(`✅ 已清除缓存: ${pattern}`);
      } catch (error) {
        console.error(`❌ 清除缓存失败: ${pattern}`, error);
      }
    }
  }

  /**
   * 清除所有角色相关缓存（清除整个角色的所有缓存）
   * @param role 角色类型: 'teacher' | 'admin' | 'principal'
   */
  static async clearRoleCache(role: string): Promise<void> {
    let pattern: string;

    switch (role) {
      case 'teacher':
        pattern = `${this.PREFIX.TEACHER}*`;
        console.log(`🗑️ 清除所有教师缓存`);
        break;
      case 'admin':
        pattern = `${this.PREFIX.ADMIN}*`;
        console.log(`🗑️ 清除所有管理员缓存`);
        break;
      case 'principal':
        pattern = `${this.PREFIX.PRINCIPAL}*`;
        console.log(`🗑️ 清除所有园长缓存`);
        break;
      default:
        console.warn(`⚠️ 未知的角色类型: ${role}`);
        return;
    }

    try {
      await redisService.del(pattern);
      console.log(`✅ 已清除角色缓存: ${role}`);
    } catch (error) {
      console.error(`❌ 清除角色缓存失败: ${role}`, error);
    }
  }

  /**
   * 清除班级相关缓存
   */
  static async clearClassCache(classId: number): Promise<void> {
    const key = `${this.PREFIX.CLASS_DATA}${classId}`;
    await redisService.del(key);
  }

  /**
   * 清除学生列表缓存
   */
  static async clearStudentListCache(): Promise<void> {
    const pattern = `${this.PREFIX.STUDENT_DATA}list:*`;
    await redisService.del(pattern);
  }

  /**
   * 清除活动列表缓存
   */
  static async clearActivityListCache(): Promise<void> {
    const pattern = `${this.PREFIX.ACTIVITY_DATA}list:*`;
    await redisService.del(pattern);
  }

  /**
   * 批量清除缓存
   */
  static async clearMultipleCache(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      await redisService.del(pattern);
    }
  }

  /**
   * 获取缓存统计信息
   * ⚠️ 权限缓存已移至 PermissionCacheService，此处不再统计
   */
  static async getCacheStats(): Promise<any> {
    const stats = {
      teacher: await redisService.keys(`${this.PREFIX.TEACHER}*`),
      admin: await redisService.keys(`${this.PREFIX.ADMIN}*`),
      principal: await redisService.keys(`${this.PREFIX.PRINCIPAL}*`),
      dashboard: await redisService.keys(`${this.PREFIX.DASHBOARD_DATA}*`),
      class: await redisService.keys(`${this.PREFIX.CLASS_DATA}*`),
      student: await redisService.keys(`${this.PREFIX.STUDENT_DATA}*`),
      activity: await redisService.keys(`${this.PREFIX.ACTIVITY_DATA}*`)
    };

    return {
      teacherCacheCount: stats.teacher.length,
      adminCacheCount: stats.admin.length,
      principalCacheCount: stats.principal.length,
      dashboardCacheCount: stats.dashboard.length,
      classCacheCount: stats.class.length,
      studentCacheCount: stats.student.length,
      activityCacheCount: stats.activity.length,
      totalCacheCount: Object.values(stats).reduce((sum, arr) => sum + arr.length, 0),
      note: '权限缓存已由 PermissionCacheService 管理'
    };
  }
}

export default RoleCacheService;

