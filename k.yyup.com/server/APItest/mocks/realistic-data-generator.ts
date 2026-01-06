/**
 * 基于真实API结构的Mock数据生成器
 * 生成与生产环境一致的真实数据，包括边界情况和异常数据
 */

import { faker } from '@faker-js/faker/locale/zh_CN';
import { StandardAPIResponse, StandardPaginatedResponse, StandardAuthResponse } from '../../src/utils/apiResponseEnhanced';

// 设置faker种子以保持测试一致性
faker.seed(12345);

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface Student {
  id: number;
  name: string;
  studentId: string;
  gender: 'male' | 'female';
  age: number;
  classId?: number;
  className?: string;
  parentName?: string;
  parentPhone?: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'transferred' | 'suspended';
  avatar?: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Teacher {
  id: number;
  name: string;
  employeeId: string;
  gender: 'male' | 'female';
  age: number;
  subject?: string;
  department?: string;
  position: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  qualifications?: string[];
  experience?: number;
  avatar?: string;
}

export interface Class {
  id: number;
  name: string;
  grade: string;
  teacherId?: number;
  teacherName?: string;
  studentCount: number;
  maxStudents: number;
  classroom?: string;
  schedule?: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: 'academic' | 'sports' | 'arts' | 'social' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: number;
  organizerName: string;
  images?: string[];
  materials?: string[];
  requirements?: string[];
  cost?: number;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'alert' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  senderId: number;
  senderName: string;
  readStatus: boolean;
  createdAt: string;
  expiresAt?: string;
  attachments?: string[];
}

export interface MarketingCampaign {
  id: number;
  name: string;
  description: string;
  type: 'online' | 'offline' | 'hybrid';
  startDate: string;
  endDate: string;
  budget: number;
  actualCost?: number;
  targetAudience: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  channels: string[];
  metrics?: {
    reach: number;
    engagement: number;
    conversions: number;
    roi?: number;
  };
}

export class RealisticDataGenerator {
  private static instance: RealisticDataGenerator;

  public static getInstance(): RealisticDataGenerator {
    if (!RealisticDataGenerator.instance) {
      RealisticDataGenerator.instance = new RealisticDataGenerator();
    }
    return RealisticDataGenerator.instance;
  }

  /**
   * 生成真实用户数据
   */
  generateUser(role?: string, status?: User['status']): User {
    const roles = ['admin', 'teacher', 'parent', 'principal', 'staff'];
    const statuses: User['status'][] = ['active', 'inactive', 'suspended'];

    return {
      id: faker.datatype.number({ min: 1, max: 10000 }),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      phone: faker.phone.number('1##########'),
      role: role || faker.helpers.arrayElement(roles),
      status: status || faker.helpers.arrayElement(statuses),
      createdAt: faker.date.past(2).toISOString(),
      updatedAt: faker.date.recent(30).toISOString(),
      permissions: this.generatePermissions(role || faker.helpers.arrayElement(roles))
    };
  }

  /**
   * 生成真实学生数据
   */
  generateStudent(overrides?: Partial<Student>): Student {
    const grades = ['小班', '中班', '大班', '一年级', '二年级', '三年级'];
    const statuses: Student['status'][] = ['active', 'graduated', 'transferred', 'suspended'];

    return {
      id: faker.datatype.number({ min: 1, max: 5000 }),
      name: faker.name.fullName(),
      studentId: `STU${faker.datatype.number({ min: 10000, max: 99999 })}`,
      gender: faker.helpers.arrayElement(['male', 'female']),
      age: faker.datatype.number({ min: 3, max: 12 }),
      classId: faker.datatype.number({ min: 1, max: 50 }),
      className: `${faker.helpers.arrayElement(grades)}${faker.datatype.number({ min: 1, max: 10 })}班`,
      parentName: faker.name.fullName(),
      parentPhone: faker.phone.number('1##########'),
      enrollmentDate: faker.date.past(1).toISOString(),
      status: faker.helpers.arrayElement(statuses),
      avatar: faker.internet.url(),
      allergies: faker.helpers.arrayElements(['花生', '海鲜', '牛奶', '鸡蛋', '花粉'], { min: 0, max: 2 }),
      medicalConditions: faker.helpers.arrayElements(['哮喘', '心脏病', '过敏体质', '无'], { min: 0, max: 1 }),
      emergencyContact: {
        name: faker.name.fullName(),
        phone: faker.phone.number('1##########'),
        relationship: faker.helpers.arrayElement(['父亲', '母亲', '祖父', '祖母', '监护人'])
      },
      ...overrides
    };
  }

  /**
   * 生成真实教师数据
   */
  generateTeacher(overrides?: Partial<Teacher>): Teacher {
    const subjects = ['语文', '数学', '英语', '音乐', '美术', '体育', '科学', '社会'];
    const departments = ['教务处', '学生处', '后勤部', '教研部'];
    const positions = ['教师', '班主任', '教研组长', '年级组长', '教务主任'];

    return {
      id: faker.datatype.number({ min: 1, max: 1000 }),
      name: faker.name.fullName(),
      employeeId: `TCH${faker.datatype.number({ min: 1000, max: 9999 })}`,
      gender: faker.helpers.arrayElement(['male', 'female']),
      age: faker.datatype.number({ min: 25, max: 60 }),
      subject: faker.helpers.arrayElement(subjects),
      department: faker.helpers.arrayElement(departments),
      position: faker.helpers.arrayElement(positions),
      email: faker.internet.email(),
      phone: faker.phone.number('1##########'),
      hireDate: faker.date.past(5).toISOString(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'on_leave']),
      qualifications: faker.helpers.arrayElements(['本科', '硕士', '博士', '教师资格证', '高级教师'], { min: 1, max: 3 }),
      experience: faker.datatype.number({ min: 1, max: 30 }),
      avatar: faker.internet.url(),
      ...overrides
    };
  }

  /**
   * 生成真实班级数据
   */
  generateClass(overrides?: Partial<Class>): Class {
    const grades = ['小班', '中班', '大班', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];

    return {
      id: faker.datatype.number({ min: 1, max: 100 }),
      name: `${faker.helpers.arrayElement(grades)}${faker.datatype.number({ min: 1, max: 10 })}班`,
      grade: faker.helpers.arrayElement(grades),
      teacherId: faker.datatype.number({ min: 1, max: 200 }),
      teacherName: faker.name.fullName(),
      studentCount: faker.datatype.number({ min: 15, max: 35 }),
      maxStudents: faker.datatype.number({ min: 30, max: 40 }),
      classroom: `${faker.datatype.number({ min: 1, max: 5 })}楼${faker.datatype.number({ min: 101, max: 305 })}室`,
      schedule: {
        monday: faker.helpers.arrayElements(['语文', '数学', '英语', '体育', '音乐'], { min: 3, max: 5 }),
        tuesday: faker.helpers.arrayElements(['语文', '数学', '英语', '体育', '音乐'], { min: 3, max: 5 }),
        wednesday: faker.helpers.arrayElements(['语文', '数学', '英语', '体育', '音乐'], { min: 3, max: 5 }),
        thursday: faker.helpers.arrayElements(['语文', '数学', '英语', '体育', '音乐'], { min: 3, max: 5 }),
        friday: faker.helpers.arrayElements(['语文', '数学', '英语', '体育', '音乐'], { min: 3, max: 5 })
      },
      status: faker.helpers.arrayElement(['active', 'inactive']),
      createdAt: faker.date.past(1).toISOString(),
      ...overrides
    };
  }

  /**
   * 生成真实活动数据
   */
  generateActivity(overrides?: Partial<Activity>): Activity {
    const types: Activity['type'][] = ['academic', 'sports', 'arts', 'social', 'other'];
    const statuses: Activity['status'][] = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];

    return {
      id: faker.datatype.number({ min: 1, max: 500 }),
      title: faker.lorem.words(3) + '活动',
      description: faker.lorem.paragraphs(2),
      type: faker.helpers.arrayElement(types),
      startDate: faker.date.soon(30).toISOString(),
      endDate: faker.date.soon(60).toISOString(),
      location: faker.address.streetAddress(),
      maxParticipants: faker.datatype.number({ min: 10, max: 200 }),
      currentParticipants: faker.datatype.number({ min: 0, max: 50 }),
      status: faker.helpers.arrayElement(statuses),
      organizerId: faker.datatype.number({ min: 1, max: 200 }),
      organizerName: faker.name.fullName(),
      images: faker.helpers.arrayElements([faker.internet.url(), faker.internet.url()], { min: 0, max: 3 }),
      materials: faker.helpers.arrayElements(['画笔', '彩纸', '音响设备', '投影仪'], { min: 0, max: 2 }),
      requirements: faker.helpers.arrayElements(['家长陪同', '自备服装', '健康证明'], { min: 0, max: 2 }),
      cost: faker.datatype.number({ min: 0, max: 500 }),
      ...overrides
    };
  }

  /**
   * 生成真实通知数据
   */
  generateNotification(overrides?: Partial<Notification>): Notification {
    const types: Notification['type'][] = ['announcement', 'reminder', 'alert', 'system'];
    const priorities: Notification['priority'][] = ['low', 'medium', 'high', 'urgent'];

    return {
      id: faker.datatype.number({ min: 1, max: 1000 }),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(1),
      type: faker.helpers.arrayElement(types),
      priority: faker.helpers.arrayElement(priorities),
      targetAudience: faker.helpers.arrayElements(['全体教师', '全体家长', '全体学生', '管理层'], { min: 1, max: 2 }),
      senderId: faker.datatype.number({ min: 1, max: 100 }),
      senderName: faker.name.fullName(),
      readStatus: faker.datatype.boolean(),
      createdAt: faker.date.recent(7).toISOString(),
      expiresAt: faker.date.soon(30).toISOString(),
      attachments: faker.helpers.arrayElements([faker.internet.url(), faker.internet.url()], { min: 0, max: 2 }),
      ...overrides
    };
  }

  /**
   * 生成真实营销活动数据
   */
  generateMarketingCampaign(overrides?: Partial<MarketingCampaign>): MarketingCampaign {
    const types: MarketingCampaign['type'][] = ['online', 'offline', 'hybrid'];
    const statuses: MarketingCampaign['status'][] = ['planning', 'active', 'completed', 'cancelled'];

    const reach = faker.datatype.number({ min: 100, max: 10000 });
    const engagement = Math.floor(reach * faker.datatype.number({ min: 0.1, max: 0.8, precision: 0.01 }));
    const conversions = Math.floor(engagement * faker.datatype.number({ min: 0.05, max: 0.3, precision: 0.01 }));

    return {
      id: faker.datatype.number({ min: 1, max: 200 }),
      name: faker.lorem.words(2) + '营销活动',
      description: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(types),
      startDate: faker.date.past(1).toISOString(),
      endDate: faker.date.soon(60).toISOString(),
      budget: faker.datatype.number({ min: 1000, max: 50000 }),
      actualCost: faker.datatype.number({ min: 800, max: 55000 }),
      targetAudience: faker.helpers.arrayElement(['3-6岁儿童家长', '新迁入家庭', '二胎家庭']),
      status: faker.helpers.arrayElement(statuses),
      channels: faker.helpers.arrayElements(['微信', '抖音', '线下广告', '社区推广', '家长推荐'], { min: 2, max: 4 }),
      metrics: {
        reach,
        engagement,
        conversions,
        roi: faker.datatype.number({ min: -50, max: 300, precision: 0.01 })
      },
      ...overrides
    };
  }

  /**
   * 生成权限列表
   */
  private generatePermissions(role: string): string[] {
    const permissionMap: Record<string, string[]> = {
      admin: ['user:read', 'user:write', 'user:delete', 'system:config', 'system:backup', 'all'],
      principal: ['student:read', 'student:write', 'teacher:read', 'teacher:write', 'class:read', 'class:write', 'reports:read'],
      teacher: ['student:read', 'class:read', 'attendance:read', 'attendance:write', 'grades:write'],
      parent: ['student:read', 'grades:read', 'attendance:read', 'notifications:read'],
      staff: ['basic:read', 'notifications:read']
    };

    return permissionMap[role] || [];
  }

  /**
   * 生成标准API响应格式
   */
  generateAPIResponse<T>(data: T, message = '操作成功'): StandardAPIResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  /**
   * 生成标准分页响应格式
   */
  generatePaginatedResponse<T>(
    items: T[],
    page = 1,
    pageSize = 10,
    message = '获取数据成功'
  ): StandardPaginatedResponse<T> {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      message
    };
  }

  /**
   * 生成标准认证响应格式
   */
  generateAuthResponse(user: User, token?: string): StandardAuthResponse {
    return {
      success: true,
      data: {
        token: token || faker.datatype.string(64),
        refreshToken: faker.datatype.string(64),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          phone: user.phone,
          permissions: user.permissions
        }
      },
      message: '登录成功'
    };
  }

  /**
   * 生成错误响应
   */
  generateErrorResponse(message: string, code: string, statusCode = 400): StandardAPIResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details: process.env.NODE_ENV === 'development' ? { timestamp: new Date().toISOString() } : undefined
      }
    };
  }

  /**
   * 生成边界情况数据
   */
  generateBoundaryData(type: 'empty' | 'max' | 'invalid'): any {
    switch (type) {
      case 'empty':
        return {
          success: true,
          data: [],
          message: '暂无数据'
        };

      case 'max':
        // 生成最大限制的数据
        return this.generatePaginatedResponse(
          Array.from({ length: 100 }, () => this.generateStudent()),
          1,
          100
        );

      case 'invalid':
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: {
              fields: [
                { field: 'name', message: '姓名不能为空' },
                { field: 'age', message: '年龄必须大于0' }
              ]
            }
          }
        };

      default:
        return null;
    }
  }

  /**
   * 生成网络异常模拟数据
   */
  generateNetworkError(type: 'timeout' | 'server_error' | 'network_error'): any {
    switch (type) {
      case 'timeout':
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: '请求超时，请稍后重试'
          }
        };

      case 'server_error':
        return {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: '服务器内部错误'
          }
        };

      case 'network_error':
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: '网络连接失败'
          }
        };

      default:
        return null;
    }
  }
}

// 导出单例实例
export const realisticDataGenerator = RealisticDataGenerator.getInstance();