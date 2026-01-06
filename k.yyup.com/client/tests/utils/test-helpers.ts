/**
 * 测试辅助工具
 * 提供通用的测试工具和模拟数据
 */

import { mount, VueWrapper } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import ElementPlus from 'element-plus';
import { expectNoConsoleErrors } from '../setup/console-monitoring';

/**
 * 通用测试设置
 */
export interface TestSetup {
  mount: typeof mount;
  expect: typeof expect;
  vi: typeof vi;
  pinia: ReturnType<typeof createPinia>;
}

/**
 * 创建测试包装器，包含通用设置
 */
export function createTestWrapper(component: any, options: any = {}): VueWrapper {
  const pinia = createPinia();
  setActivePinia(pinia);

  const defaultOptions = {
    global: {
      plugins: [pinia, ElementPlus],
      stubs: {
        'el-button': true,
        'el-input': true,
        'el-form': true,
        'el-form-item': true,
        'el-table': true,
        'el-table-column': true,
        'el-dialog': true,
        'el-drawer': true,
        'el-card': true,
        'el-row': true,
        'el-col': true,
        'el-select': true,
        'el-option': true,
        'el-date-picker': true,
        'el-upload': true,
        'el-image': true,
        'el-icon': true,
        'router-link': true,
        'router-view': true,
        'unified-icon': true,
        'lucide-icon': true,
        'multi-style-icon': true
      },
      mocks: {
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn()
        },
        $route: {
          path: '/',
          query: {},
          params: {},
          name: 'test',
          meta: {}
        }
      }
    },
    ...options
  };

  return mount(component, defaultOptions);
}

/**
 * 创建带权限控制的测试包装器
 */
export function createTestWrapperWithPermissions(
  component: any, 
  permissions: string[] = [],
  options: any = {}
): VueWrapper {
  const pinia = createPinia();
  setActivePinia(pinia);

  // Mock权限store
  const mockPermissionStore = {
    hasPermission: vi.fn((permission: string) => permissions.includes(permission)),
    hasAnyPermission: vi.fn((perms: string[]) => perms.some(p => permissions.includes(p))),
    hasAllPermissions: vi.fn((perms: string[]) => perms.every(p => permissions.includes(p))),
    permissions: permissions
  };

  const defaultOptions = {
    global: {
      plugins: [pinia, ElementPlus],
      stubs: {
        'el-button': true,
        'el-input': true,
        'el-form': true,
        'el-form-item': true,
        'el-table': true,
        'el-table-column': true,
        'el-dialog': true,
        'el-drawer': true,
        'el-card': true,
        'el-row': true,
        'el-col': true,
        'el-select': true,
        'el-option': true,
        'el-date-picker': true,
        'el-upload': true,
        'el-image': true,
        'el-icon': true
      },
      mocks: {
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          go: vi.fn(),
          back: vi.fn(),
          forward: vi.fn()
        },
        $route: {
          path: '/',
          query: {},
          params: {},
          name: 'test',
          meta: {}
        }
      }
    },
    ...options
  };

  const wrapper = mount(component, defaultOptions);
  
  // 注入权限store
  (wrapper.vm as any).$permissionStore = mockPermissionStore;

  return wrapper;
}

/**
 * 通用测试套件设置
 */
export function setupCommonTestSuite(description: string, testFn: (setup: TestSetup) => void) {
  describe(description, () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
      pinia = createPinia();
      setActivePinia(pinia);
      vi.clearAllMocks();
    });

    afterEach(() => {
      expectNoConsoleErrors();
    });

    testFn({
      mount,
      expect,
      vi,
      pinia
    });
  });
}

/**
 * 模拟API响应
 */
export const mockApiResponse = {
  success: <T = any>(data: T) => ({
    success: true,
    data,
    code: 200,
    message: 'Success'
  }),

  error: (message: string, code: number = 500) => ({
    success: false,
    data: null,
    code,
    message
  }),

  list: <T = any>(items: T[], total: number = items.length) => ({
    success: true,
    data: {
      items,
      total,
      page: 1,
      pageSize: 10
    },
    code: 200,
    message: 'Success'
  })
};

/**
 * 模拟用户数据
 */
export const mockUserData = {
  admin: {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    permissions: ['*']
  },

  teacher: {
    id: '2',
    username: 'teacher',
    name: 'Teacher User',
    email: 'teacher@example.com',
    role: 'TEACHER',
    permissions: ['teacher.read', 'teacher.write', 'student.read']
  },

  parent: {
    id: '3',
    username: 'parent',
    name: 'Parent User',
    email: 'parent@example.com',
    role: 'PARENT',
    permissions: ['parent.read', 'student.read.own']
  },

  principal: {
    id: '4',
    username: 'principal',
    name: 'Principal User',
    email: 'principal@example.com',
    role: 'PRINCIPAL',
    permissions: ['principal.*', 'teacher.read', 'student.read', 'class.read']
  }
};

/**
 * 模拟学生数据
 */
export const mockStudentData = [
  {
    id: '1',
    name: '张三',
    studentId: 'ST001',
    classId: '1',
    className: '大一班',
    gender: 'MALE',
    birthDate: '2018-01-15',
    age: 5,
    enrollmentDate: '2023-09-01',
    status: 'ACTIVE',
    parentId: '1',
    parentName: '张父',
    contactPhone: '13800138001',
    address: '测试地址',
    emergencyContact: '张母',
    emergencyPhone: '13800138002'
  },
  {
    id: '2',
    name: '李四',
    studentId: 'ST002',
    classId: '2',
    className: '大二班',
    gender: 'FEMALE',
    birthDate: '2018-03-20',
    age: 5,
    enrollmentDate: '2023-09-01',
    status: 'ACTIVE',
    parentId: '2',
    parentName: '李父',
    contactPhone: '13800138003',
    address: '测试地址2',
    emergencyContact: '李母',
    emergencyPhone: '13800138004'
  }
];

/**
 * 模拟教师数据
 */
export const mockTeacherData = [
  {
    id: '1',
    name: '王老师',
    teacherId: 'TC001',
    email: 'wang@example.com',
    phone: '13800138001',
    gender: 'FEMALE',
    title: '高级教师',
    subject: '语文',
    experience: 8,
    joinDate: '2016-09-01',
    status: 'ACTIVE',
    classIds: ['1', '2'],
    classes: ['大一班', '大二班']
  }
];

/**
 * 模拟班级数据
 */
export const mockClassData = [
  {
    id: '1',
    name: '大一班',
    grade: '大班',
    capacity: 25,
    currentCount: 20,
    teacherId: '1',
    teacherName: '王老师',
    classroom: 'A101',
    schedule: {
      startTime: '08:00',
      endTime: '16:30'
    },
    status: 'ACTIVE'
  }
];

/**
 * 模拟统计数据
 */
export const mockStatsData = {
  dashboard: {
    totalStudents: 150,
    totalTeachers: 20,
    totalClasses: 8,
    totalParents: 300,
    enrollmentRate: 95.5,
    attendanceRate: 98.2,
    averageScore: 85.6
  },

  attendance: {
    totalStudents: 150,
    presentCount: 145,
    absentCount: 3,
    leaveCount: 2,
    attendanceRate: 96.7,
    date: '2024-01-15'
  },

  enrollment: {
    totalApplications: 80,
    approvedApplications: 65,
    pendingApplications: 12,
    rejectedApplications: 3,
    enrollmentRate: 81.25,
    currentMonth: 25
  }
};

/**
 * 事件触发辅助函数
 */
export async function triggerEvent(wrapper: VueWrapper, event: string, options: any = {}) {
  await wrapper.trigger(event, options);
  await wrapper.vm.$nextTick();
}

/**
 * 表单填写辅助函数
 */
export async function fillForm(wrapper: VueWrapper, formData: Record<string, any>) {
  for (const [field, value] of Object.entries(formData)) {
    const input = wrapper.find(`[data-testid="${field}"]`) || 
                  wrapper.find(`#${field}`) ||
                  wrapper.find(`[name="${field}"]`);
    
    if (input.exists()) {
      await input.setValue(value);
      await input.trigger('input');
    }
  }
  await wrapper.vm.$nextTick();
}

/**
 * 等待异步操作完成
 */
export async function waitForAsync(ms: number = 0) {
  await new Promise(resolve => setTimeout(resolve, ms));
  await vi.runAllTimers();
}

/**
 * Mock Element Plus 消息
 */
export const mockElementPlusMessage = () => {
  const mockMessage = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  };

  vi.mock('element-plus', async () => {
    const actual = await vi.importActual('element-plus');
    return {
      ...actual,
      ElMessage: mockMessage,
      ElNotification: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
      },
      ElMessageBox: {
        confirm: vi.fn(),
        alert: vi.fn(),
        prompt: vi.fn()
      }
    };
  });

  return mockMessage;
};

/**
 * 创建Mock Store
 */
export function createMockStore<T = any>(initialState: T) {
  let state = { ...initialState };
  
  return {
    state: () => state,
    setState: (newState: Partial<T>) => {
      state = { ...state, ...newState };
    },
    resetState: () => {
      state = { ...initialState };
    },
    getState: () => state
  };
}

/**
 * 验证组件渲染
 */
export function expectComponentRendered(wrapper: VueWrapper, selector: string) {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  return element;
}

/**
 * 验证组件不渲染
 */
export function expectComponentNotRendered(wrapper: VueWrapper, selector: string) {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(false);
}

/**
 * 验证文本内容
 */
export function expectTextContent(wrapper: VueWrapper, selector: string, expectedText: string | RegExp) {
  const element = wrapper.find(selector);
  expect(element.exists()).toBe(true);
  
  if (typeof expectedText === 'string') {
    expect(element.text()).toContain(expectedText);
  } else {
    expect(element.text()).toMatch(expectedText);
  }
}