/**
 * Mock API服务
 * 提供基于真实数据结构的Mock API响应
 */

import { realisticDataGenerator } from './realistic-data-generator';
import { StandardAPIResponse, StandardPaginatedResponse, StandardAuthResponse } from '../../src/utils/apiResponseEnhanced';

export interface MockAPIConfig {
  delay?: number;
  errorRate?: number;
  boundaryDataRate?: number;
}

export class MockAPIService {
  private config: MockAPIConfig;
  private users: any[] = [];
  private students: any[] = [];
  private teachers: any[] = [];
  private classes: any[] = [];
  private activities: any[] = [];
  private notifications: any[] = [];
  private campaigns: any[] = [];

  constructor(config: MockAPIConfig = {}) {
    this.config = {
      delay: config.delay || 0,
      errorRate: config.errorRate || 0,
      boundaryDataRate: config.boundaryDataRate || 0
    };

    this.initializeData();
  }

  /**
   * 初始化基础数据
   */
  private initializeData(): void {
    // 生成基础数据
    for (let i = 0; i < 50; i++) {
      this.students.push(realisticDataGenerator.generateStudent());
    }

    for (let i = 0; i < 20; i++) {
      this.teachers.push(realisticDataGenerator.generateTeacher());
    }

    for (let i = 0; i < 15; i++) {
      this.classes.push(realisticDataGenerator.generateClass());
    }

    for (let i = 0; i < 30; i++) {
      this.activities.push(realisticDataGenerator.generateActivity());
    }

    for (let i = 0; i < 100; i++) {
      this.notifications.push(realisticDataGenerator.generateNotification());
    }

    for (let i = 0; i < 25; i++) {
      this.campaigns.push(realisticDataGenerator.generateMarketingCampaign());
    }

    // 生成用户
    const roles = ['admin', 'principal', 'teacher', 'parent'];
    roles.forEach(role => {
      for (let i = 0; i < 5; i++) {
        this.users.push(realisticDataGenerator.generateUser(role, 'active'));
      }
    });
  }

  /**
   * 模拟网络延迟
   */
  private async delay(ms?: number): Promise<void> {
    const delayMs = ms || this.config.delay || 0;
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  /**
   * 模拟随机错误
   */
  private shouldSimulateError(): boolean {
    return Math.random() < (this.config.errorRate || 0);
  }

  /**
   * 模拟边界情况数据
   */
  private shouldReturnBoundaryData(): boolean {
    return Math.random() < (this.config.boundaryDataRate || 0);
  }

  /**
   * 认证API
   */
  async login(username: string, password: string): Promise<StandardAuthResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    // 模拟登录验证
    const user = this.users.find(u => u.username === username);
    if (!user) {
      return realisticDataGenerator.generateErrorResponse('用户名或密码错误', 'INVALID_CREDENTIALS', 401);
    }

    return realisticDataGenerator.generateAuthResponse(user);
  }

  async logout(): Promise<StandardAPIResponse> {
    await this.delay();
    return realisticDataGenerator.generateAPIResponse(null, '登出成功');
  }

  async getCurrentUser(userId: number): Promise<StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('用户未找到', 'USER_NOT_FOUND', 404);
    }

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return realisticDataGenerator.generateErrorResponse('用户未找到', 'USER_NOT_FOUND', 404);
    }

    return realisticDataGenerator.generateAPIResponse(user, '获取用户信息成功');
  }

  /**
   * 学生API
   */
  async getStudents(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredStudents = [...this.students];

    // 应用过滤器
    if (filters?.classId) {
      filteredStudents = filteredStudents.filter(s => s.classId === parseInt(filters.classId));
    }

    if (filters?.status) {
      filteredStudents = filteredStudents.filter(s => s.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredStudents = filteredStudents.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.studentId.toLowerCase().includes(searchLower)
      );
    }

    // 边界情况
    if (this.shouldReturnBoundaryData()) {
      return realisticDataGenerator.generateBoundaryData('empty');
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredStudents, page, pageSize, '获取学生列表成功');
  }

  async getStudent(id: number): Promise<StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    const student = this.students.find(s => s.id === id);
    if (!student) {
      return realisticDataGenerator.generateErrorResponse('学生未找到', 'STUDENT_NOT_FOUND', 404);
    }

    return realisticDataGenerator.generateAPIResponse(student, '获取学生信息成功');
  }

  async createStudent(data: any): Promise<StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('创建失败', 'CREATE_FAILED', 400);
    }

    const newStudent = realisticDataGenerator.generateStudent(data);
    this.students.push(newStudent);

    return realisticDataGenerator.generateAPIResponse(newStudent, '学生创建成功');
  }

  /**
   * 教师API
   */
  async getTeachers(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredTeachers = [...this.teachers];

    // 应用过滤器
    if (filters?.department) {
      filteredTeachers = filteredTeachers.filter(t => t.department === filters.department);
    }

    if (filters?.status) {
      filteredTeachers = filteredTeachers.filter(t => t.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTeachers = filteredTeachers.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.employeeId.toLowerCase().includes(searchLower)
      );
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredTeachers, page, pageSize, '获取教师列表成功');
  }

  /**
   * 班级API
   */
  async getClasses(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredClasses = [...this.classes];

    // 应用过滤器
    if (filters?.grade) {
      filteredClasses = filteredClasses.filter(c => c.grade === filters.grade);
    }

    if (filters?.status) {
      filteredClasses = filteredClasses.filter(c => c.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredClasses = filteredClasses.filter(c =>
        c.name.toLowerCase().includes(searchLower)
      );
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredClasses, page, pageSize, '获取班级列表成功');
  }

  /**
   * 活动API
   */
  async getActivities(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredActivities = [...this.activities];

    // 应用过滤器
    if (filters?.type) {
      filteredActivities = filteredActivities.filter(a => a.type === filters.type);
    }

    if (filters?.status) {
      filteredActivities = filteredActivities.filter(a => a.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredActivities = filteredActivities.filter(a =>
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower)
      );
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredActivities, page, pageSize, '获取活动列表成功');
  }

  /**
   * 通知API
   */
  async getNotifications(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredNotifications = [...this.notifications];

    // 应用过滤器
    if (filters?.type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }

    if (filters?.priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === filters.priority);
    }

    if (filters?.readStatus !== undefined) {
      const isRead = filters.readStatus === 'true';
      filteredNotifications = filteredNotifications.filter(n => n.readStatus === isRead);
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredNotifications, page, pageSize, '获取通知列表成功');
  }

  /**
   * 营销活动API
   */
  async getMarketingCampaigns(page = 1, pageSize = 10, filters?: any): Promise<StandardPaginatedResponse | StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    let filteredCampaigns = [...this.campaigns];

    // 应用过滤器
    if (filters?.type) {
      filteredCampaigns = filteredCampaigns.filter(c => c.type === filters.type);
    }

    if (filters?.status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    return realisticDataGenerator.generatePaginatedResponse(filteredCampaigns, page, pageSize, '获取营销活动列表成功');
  }

  /**
   * 仪表板API
   */
  async getDashboardData(): Promise<StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    const dashboardData = {
      overview: {
        totalStudents: this.students.length,
        totalTeachers: this.teachers.length,
        totalClasses: this.classes.length,
        activeActivities: this.activities.filter(a => a.status === 'ongoing').length
      },
      recentNotifications: this.notifications.slice(0, 5),
      upcomingActivities: this.activities
        .filter(a => a.status === 'published')
        .slice(0, 5),
      statistics: {
        monthlyEnrollments: realisticDataGenerator.datatype.number({ min: 5, max: 20 }),
        parentEngagement: realisticDataGenerator.datatype.number({ min: 60, max: 95 }),
        attendanceRate: realisticDataGenerator.datatype.number({ min: 85, max: 98 })
      }
    };

    return realisticDataGenerator.generateAPIResponse(dashboardData, '获取仪表板数据成功');
  }

  /**
   * 系统配置API
   */
  async getSystemConfigs(): Promise<StandardAPIResponse> {
    await this.delay();

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('服务器错误', 'SERVER_ERROR', 500);
    }

    const configs = {
      system: {
        name: '幼儿园管理系统',
        version: '1.0.0',
        maintenance: false,
        timezone: 'Asia/Shanghai'
      },
      notification: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true
      },
      security: {
        sessionTimeout: 7200,
        passwordMinLength: 8,
        twoFactorEnabled: false
      },
      backup: {
        autoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 30
      }
    };

    return realisticDataGenerator.generateAPIResponse(configs, '获取系统配置成功');
  }

  /**
   * 模拟文件上传
   */
  async uploadFile(file: any): Promise<StandardAPIResponse> {
    await this.delay(1000); // 文件上传通常需要更长时间

    if (this.shouldSimulateError()) {
      return realisticDataGenerator.generateErrorResponse('文件上传失败', 'UPLOAD_FAILED', 400);
    }

    const uploadedFile = {
      id: realisticDataGenerator.datatype.number({ min: 1, max: 10000 }),
      originalName: file.originalname || 'test.txt',
      filename: `file_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      size: file.size || 1024,
      mimetype: file.mimetype || 'text/plain',
      url: `https://example.com/uploads/file_${Date.now()}.txt`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 1
    };

    return realisticDataGenerator.generateAPIResponse(uploadedFile, '文件上传成功');
  }

  /**
   * 获取Mock统计信息
   */
  getMockStats(): any {
    return {
      users: this.users.length,
      students: this.students.length,
      teachers: this.teachers.length,
      classes: this.classes.length,
      activities: this.activities.length,
      notifications: this.notifications.length,
      campaigns: this.campaigns.length,
      config: this.config
    };
  }
}

// 创建默认Mock服务实例
export const mockAPIService = new MockAPIService({
  delay: 100, // 模拟100ms延迟
  errorRate: 0.05, // 5%错误率
  boundaryDataRate: 0.1 // 10%边界数据率
});