// 模拟数据服务入口文件
import { 
  mockGetActivityList, 
  mockGetActivityDetail, 
  mockDeleteActivity, 
  mockBatchDeleteActivities, 
  mockUpdateActivityStatus 
} from './activityMock';

import { 
  mockGetPrincipalDashboardStats,
  mockGetCampusOverview,
  mockGetApprovalList,
  mockProcessApproval,
  mockGetImportantNotices,
  mockPublishNotice
} from './principalMock';

import {
  mockGetEnrollmentPlanList,
  mockGetEnrollmentPlanDetail,
  mockCreateEnrollmentPlan,
  mockUpdateEnrollmentPlan,
  mockDeleteEnrollmentPlan,
  mockUpdateEnrollmentPlanStatus,
  mockGetEnrollmentAnalytics
} from './enrollmentPlanMock';

import {
  mockGetMarketingActivityList,
  mockGetMarketingActivityDetail,
  mockCreateMarketingActivity,
  mockUpdateMarketingActivity,
  mockDeleteMarketingActivity,
  mockUpdateMarketingActivityStatus,
  mockUpdateMarketingActivityResults,
  mockGetMarketingChannelList,
  mockCreateMarketingChannel,
  mockUpdateMarketingChannel,
  mockDeleteMarketingChannel,
  mockGetMarketingAnalytics
} from './marketingMock';

// 导入API前缀常量
import { API_PREFIX } from '../api/endpoints';

// 是否使用模拟数据（可根据环境变量配置）
// ⚠️ 注意：推荐使用基于 Swagger 的自动 Mock 服务器
// 新方式：运行 npm run mock:swagger:v2 (端口: 3010)
// 旧方式：设置 useMock = true 使用本地 mock 数据
export const useMock = false;

// 创建代理函数，用于替代原来的直接替换方式
export function createMockFunction<T extends (...args: any[]) => any>(mockFn: T): T {
  return ((...args: any[]) => {
    if (useMock) {
      return mockFn(...args);
    }
    // 如果不使用mock，则会尝试调用真实API，但由于我们只是导出这个函数，
    // 真实API的调用会在实际API模块中进行
    throw new Error('真实API调用未实现，请确保useMock为true或提供真实API实现');
  }) as T;
}

// 导出代理后的API函数
// 活动管理模块
export const getActivityList = createMockFunction(mockGetActivityList);
export const getActivityDetail = createMockFunction(mockGetActivityDetail);
export const deleteActivity = createMockFunction(mockDeleteActivity);
export const batchDeleteActivities = createMockFunction(mockBatchDeleteActivities);
export const updateActivityStatus = createMockFunction(mockUpdateActivityStatus);

// 园长模块
export const getPrincipalDashboardStats = createMockFunction(mockGetPrincipalDashboardStats);
export const getCampusOverview = createMockFunction(mockGetCampusOverview);
export const getApprovalList = createMockFunction(mockGetApprovalList);
export const processApproval = createMockFunction(mockProcessApproval);
export const getImportantNotices = createMockFunction(mockGetImportantNotices);
export const publishNotice = createMockFunction(mockPublishNotice);

// 招生计划模块
export const getEnrollmentPlanList = createMockFunction(mockGetEnrollmentPlanList);
export const getEnrollmentPlanDetail = createMockFunction(mockGetEnrollmentPlanDetail);
export const createEnrollmentPlan = createMockFunction(mockCreateEnrollmentPlan);
export const updateEnrollmentPlan = createMockFunction(mockUpdateEnrollmentPlan);
export const deleteEnrollmentPlan = createMockFunction(mockDeleteEnrollmentPlan);
export const updateEnrollmentPlanStatus = createMockFunction(mockUpdateEnrollmentPlanStatus);
export const getEnrollmentAnalytics = createMockFunction(mockGetEnrollmentAnalytics);

// 营销管理模块
export const getMarketingActivityList = createMockFunction(mockGetMarketingActivityList);
export const getMarketingActivityDetail = createMockFunction(mockGetMarketingActivityDetail);
export const createMarketingActivity = createMockFunction(mockCreateMarketingActivity);
export const updateMarketingActivity = createMockFunction(mockUpdateMarketingActivity);
export const deleteMarketingActivity = createMockFunction(mockDeleteMarketingActivity);
export const updateMarketingActivityStatus = createMockFunction(mockUpdateMarketingActivityStatus);
export const updateMarketingActivityResults = createMockFunction(mockUpdateMarketingActivityResults);
export const getMarketingChannelList = createMockFunction(mockGetMarketingChannelList);
export const createMarketingChannel = createMockFunction(mockCreateMarketingChannel);
export const updateMarketingChannel = createMockFunction(mockUpdateMarketingChannel);
export const deleteMarketingChannel = createMockFunction(mockDeleteMarketingChannel);
export const getMarketingAnalytics = createMockFunction(mockGetMarketingAnalytics);

// 输出日志
console.log('已启用API模拟数据系统');

// 模拟API拦截器
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockData, generateAttendanceData } from './classMock';

// 创建一个新的axios实例用于模拟
// @ts-ignore - 忽略类型检查，因为版本不匹配导致的类型问题
const mock = new MockAdapter(axios, { delayResponse: 1000 });

// 班级相关API
// 获取班级列表
mock.onGet(`${API_PREFIX}/classes`).reply((config) => {
  const { keyword, status, page = 1, pageSize = 10 } = config.params || {};
  // type参数暂时不使用，因为ClassInfo没有type属性
  
  let filteredClasses = [...mockData.classes];
  
  // 按关键词筛选
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredClasses = filteredClasses.filter(c =>
      c.name.toLowerCase().includes(lowerKeyword) ||
      c.grade?.toLowerCase().includes(lowerKeyword)
    );
  }
  
  // 按类型筛选 (暂时跳过，因为ClassInfo没有type属性)
  // if (type) {
  //   filteredClasses = filteredClasses.filter(c => c.type === type);
  // }
  
  // 按状态筛选
  if (status) {
    filteredClasses = filteredClasses.filter(c => c.status === status);
  }
  
  // 分页
  const total = filteredClasses.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedClasses = filteredClasses.slice(start, end);
  
  return [200, { items: paginatedClasses, total }];
});

// 获取班级详情
mock.onGet(new RegExp(`${API_PREFIX}/classes/[^/]+$`)).reply((config) => {
  const id = config.url?.split('/').pop();
  const classInfo = mockData.classes.find(c => c.id === id);
  
  if (classInfo) {
    return [200, classInfo];
  } else {
    return [404, { message: '班级不存在' }];
  }
});

// 创建班级
mock.onPost(`${API_PREFIX}/classes`).reply((config) => {
  const newClass = JSON.parse(config.data);
  const id = `CLS${String(mockData.classes.length + 1).padStart(4, '0')}`;
  const createdAt = new Date().toISOString();
  
  const classInfo = {
    ...newClass,
    id,
    currentCount: 0,
    createdAt,
    updatedAt: createdAt
  };
  
  mockData.classes.push(classInfo);
  return [200, classInfo];
});

// 更新班级
mock.onPut(new RegExp(`${API_PREFIX}/classes/[^/]+$`)).reply((config) => {
  const id = config.url?.split('/').pop();
  const updateData = JSON.parse(config.data);
  const index = mockData.classes.findIndex(c => c.id === id);
  
  if (index !== -1) {
    mockData.classes[index] = {
      ...mockData.classes[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return [200, mockData.classes[index]];
  } else {
    return [404, { message: '班级不存在' }];
  }
});

// 删除班级
mock.onDelete(new RegExp(`${API_PREFIX}/classes/[^/]+$`)).reply((config) => {
  const id = config.url?.split('/').pop();
  const index = mockData.classes.findIndex(c => c.id === id);
  
  if (index !== -1) {
    mockData.classes.splice(index, 1);
    return [200, { success: true }];
  } else {
    return [404, { message: '班级不存在' }];
  }
});

// 更新班级状态
mock.onPatch(new RegExp(`${API_PREFIX}/classes/[^/]+/status$`)).reply((config) => {
  const id = config.url?.split('/')[3];
  const { status } = JSON.parse(config.data);
  const index = mockData.classes.findIndex(c => c.id === id);
  
  if (index !== -1) {
    mockData.classes[index].status = status;
    mockData.classes[index].updatedAt = new Date().toISOString();
    return [200, mockData.classes[index]];
  } else {
    return [404, { message: '班级不存在' }];
  }
});

// 分配教师
mock.onPut(new RegExp(`${API_PREFIX}/classes/[^/]+/teachers$`)).reply((config) => {
  const id = config.url?.split('/')[3];
  const { headTeacherId } = JSON.parse(config.data);
  // assistantTeacherIds暂时不使用，因为ClassInfo没有相关属性
  const index = mockData.classes.findIndex(c => c.id === id);
  
  if (index !== -1) {
    if (headTeacherId) {
      const headTeacher = mockData.teachers.find(t => t.id === headTeacherId);
      mockData.classes[index].headTeacherId = headTeacherId;
      // 设置headTeacher对象而不是headTeacherName字符串
      if (headTeacher) {
        (mockData.classes[index] as any).headTeacher = {
          id: headTeacher.id,
          name: headTeacher.name,
          avatar: (headTeacher as any).avatar || undefined
        };
      }
    }

    // assistantTeacherIds和assistantTeacherNames不在ClassInfo类型中，暂时注释
    // if (assistantTeacherIds) {
    //   mockData.classes[index].assistantTeacherIds = assistantTeacherIds;
    //   mockData.classes[index].assistantTeacherNames = assistantTeacherIds.map((tid: string) => {
    //     const teacher = mockData.teachers.find(t => t.id === tid);
    //     return teacher ? teacher.name : '未知教师';
    //   });
    // }
    
    mockData.classes[index].updatedAt = new Date().toISOString();
    return [200, mockData.classes[index]];
  } else {
    return [404, { message: '班级不存在' }];
  }
});

// 获取班级学生
mock.onGet(new RegExp(`${API_PREFIX}/classes/[^/]+/students$`)).reply((config) => {
  const classId = config.url?.split('/')[3] || '';
  const { status, keyword, page = 1, pageSize = 10 } = config.params || {};
  
  // 模拟该班级的学生
  const classStudents = mockData.students.filter((_, index) => index % 5 === Number(classId.replace(/\D/g, '')) % 5);
  
  let filteredStudents = [...classStudents];
  
  // 按关键词筛选
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredStudents = filteredStudents.filter(s => 
      s.name.toLowerCase().includes(lowerKeyword) || 
      s.parentName.toLowerCase().includes(lowerKeyword) ||
      s.parentContact.includes(keyword)
    );
  }
  
  // 按状态筛选
  if (status) {
    filteredStudents = filteredStudents.filter(s => s.status === status);
  }
  
  // 分页
  const total = filteredStudents.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedStudents = filteredStudents.slice(start, end);
  
  return [200, { items: paginatedStudents, total }];
});

// 添加学生到班级
mock.onPost(new RegExp(`${API_PREFIX}/classes/[^/]+/students$`)).reply((config) => {
  const classId = config.url?.split('/')[3];
  const { studentIds, joinDate } = JSON.parse(config.data);
  const classIndex = mockData.classes.findIndex(c => c.id === classId);
  
  if (classIndex === -1) {
    return [404, { message: '班级不存在' }];
  }
  
  const classInfo = mockData.classes[classIndex];
  const availableCapacity = classInfo.capacity - classInfo.currentCount;
  
  if (studentIds.length > availableCapacity) {
    return [400, { 
      message: '班级容量不足',
      success: false,
      failedStudents: studentIds.slice(availableCapacity).map((id: string) => {
        const student = mockData.students.find(s => s.id === id);
        return { id, name: student ? student.name : '未知学生' };
      })
    }];
  }
  
  // 更新学生信息
  const addedStudents = [];
  for (const studentId of studentIds) {
    const studentIndex = mockData.students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      mockData.students[studentIndex].joinDate = joinDate;
      mockData.students[studentIndex].status = 'ACTIVE';
      addedStudents.push(mockData.students[studentIndex]);
    }
  }
  
  // 更新班级人数
  mockData.classes[classIndex].currentCount += addedStudents.length;
  
  return [200, { 
    success: true, 
    items: addedStudents,
    total: addedStudents.length
  }];
});

// 从班级移除学生
mock.onDelete(new RegExp(`${API_PREFIX}/classes/[^/]+/students/[^/]+$`)).reply((config) => {
  const parts = config.url?.split('/');
  const classId = parts?.[3];
  const studentId = parts?.[5];
  
  const classIndex = mockData.classes.findIndex(c => c.id === classId);
  if (classIndex === -1) {
    return [404, { message: '班级不存在' }];
  }
  
  const studentIndex = mockData.students.findIndex(s => s.id === studentId);
  if (studentIndex === -1) {
    return [404, { message: '学生不存在' }];
  }
  
  // 更新学生状态
  mockData.students[studentIndex].status = 'TRANSFERRED';
  
  // 更新班级人数
  mockData.classes[classIndex].currentCount = Math.max(0, mockData.classes[classIndex].currentCount - 1);
  
  return [200, { success: true }];
});

// 转班
mock.onPost(new RegExp(`${API_PREFIX}/classes/[^/]+/transfer$`)).reply((config) => {
  const classId = config.url?.split('/')[3];
  const { studentIds, targetClassId, transferDate } = JSON.parse(config.data);
  
  const sourceClassIndex = mockData.classes.findIndex(c => c.id === classId);
  if (sourceClassIndex === -1) {
    return [404, { message: '源班级不存在' }];
  }
  
  const targetClassIndex = mockData.classes.findIndex(c => c.id === targetClassId);
  if (targetClassIndex === -1) {
    return [404, { message: '目标班级不存在' }];
  }
  
  const targetClass = mockData.classes[targetClassIndex];
  const availableCapacity = targetClass.capacity - targetClass.currentCount;
  
  if (studentIds.length > availableCapacity) {
    return [400, { 
      message: '目标班级容量不足',
      success: false,
      failedStudents: studentIds.slice(availableCapacity).map((id: string) => {
        const student = mockData.students.find(s => s.id === id);
        return { id, name: student ? student.name : '未知学生' };
      })
    }];
  }
  
  // 更新学生信息
  const transferredStudents = [];
  for (const studentId of studentIds) {
    const studentIndex = mockData.students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      mockData.students[studentIndex].joinDate = transferDate;
      mockData.students[studentIndex].status = 'ACTIVE';
      transferredStudents.push(mockData.students[studentIndex]);
    }
  }
  
  // 更新班级人数
  mockData.classes[sourceClassIndex].currentCount -= transferredStudents.length;
  mockData.classes[targetClassIndex].currentCount += transferredStudents.length;
  
  return [200, { 
    success: true, 
    items: transferredStudents,
    total: transferredStudents.length
  }];
});

// 获取班级统计数据
mock.onGet(`${API_PREFIX}/classes/statistics`).reply(() => {
  // 使用grade作为分组依据，因为ClassInfo没有type属性
  const statistics = Object.values(mockData.classes.reduce((acc, cls) => {
    const gradeKey = cls.grade || 'unknown';
    if (!acc[gradeKey]) {
      acc[gradeKey] = {
        type: gradeKey,
        count: 0,
        studentCount: 0,
        averageAttendance: 0
      };
    }

    acc[gradeKey].count += 1;
    acc[gradeKey].studentCount += cls.currentCount;
    acc[gradeKey].averageAttendance += Math.random() * 0.2 + 0.8; // 80%-100%

    return acc;
  }, {} as Record<string, any>)).map(stat => ({
    ...(stat as any),
    averageAttendance: (stat as any).count > 0 ? (stat as any).averageAttendance / (stat as any).count : 0
  }));
  
  return [200, statistics];
});

// 获取可用教室
mock.onGet(`${API_PREFIX}/classes/available-classrooms`).reply(() => {
  const classrooms = Array.from({ length: 10 }, (_, i) => `教室${i + 1}`);
  return [200, classrooms];
});

// 导出班级数据
mock.onGet(`${API_PREFIX}/classes/export`).reply(() => {
  return [200, { fileUrl: 'https://example.com/download/classes.xlsx' }];
});

// 学生相关API
// 搜索可添加的学生
mock.onGet(`${API_PREFIX}/students/available`).reply((config) => {
  const { keyword, excludeClassId, page = 1, pageSize = 10 } = config.params || {};
  
  let filteredStudents = [...mockData.students];
  
  // 排除已在班级的学生
  if (excludeClassId) {
    filteredStudents = filteredStudents.filter((_, index) => 
      index % 5 !== Number(excludeClassId.replace(/\D/g, '')) % 5
    );
  }
  
  // 按关键词筛选
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredStudents = filteredStudents.filter(s => 
      s.name.toLowerCase().includes(lowerKeyword) || 
      s.studentId.toLowerCase().includes(lowerKeyword)
    );
  }
  
  // 分页
  const total = filteredStudents.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedStudents = filteredStudents.slice(start, end);
  
  return [200, { items: paginatedStudents, total }];
});

// 获取学生详情
mock.onGet(new RegExp(`${API_PREFIX}/students/[^/]+$`)).reply((config) => {
  const id = config.url?.split('/').pop();
  const student = mockData.students.find(s => s.id === id);
  
  if (student) {
    return [200, student];
  } else {
    return [404, { message: '学生不存在' }];
  }
});

// 仪表盘相关API
// 获取仪表盘统计数据
mock.onGet(`${API_PREFIX}/dashboard/stats`).reply(() => {
  return [200, {
    success: true,
    data: {
      studentCount: 356,
      classCount: 12,
      teacherCount: 28,
      activityCount: 15,
      enrollmentRate: 0.85,
      attendanceRate: 0.92,
      graduationRate: 0.97
    }
  }];
});

// 获取招生趋势
mock.onGet(`${API_PREFIX}/dashboard/trends`).reply((config) => {
  const { period: _period = 'month' } = config.params || {};
  
  let trends = [];
  let startDate = new Date();
  let dataPoints = 0;
  
  // 根据不同时间段生成不同数量的数据点
  switch (_period) {
    case 'week':
      dataPoints = 7;
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      dataPoints = 30;
      startDate.setDate(startDate.getDate() - 30);
      break;
    case 'quarter':
      dataPoints = 90;
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'year':
      dataPoints = 12; // 按月汇总
      startDate.setMonth(startDate.getMonth() - 12);
      break;
  }
  
  // 生成数据
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate);
    if (_period === 'year') {
      date.setMonth(date.getMonth() + i);
    } else {
      date.setDate(date.getDate() + i);
    }

    trends.push({
      date: _period === 'year'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` 
        : date.toISOString().slice(0, 10),
      count: Math.floor(Math.random() * 10) + 5 // 每天5-15名新生
    });
  }
  
  return [200, {
    success: true,
    data: {
      trends,
      distribution: {
        age3: 25,
        age4: 35,
        age5: 30,
        age6: 10
      }
    }
  }];
});

// 获取活动数据
mock.onGet(`${API_PREFIX}/dashboard/activityData`).reply((config) => {
  const { period: _period2 = 'month' } = config.params || {};
  
  const activities = [
    { activityName: '亲子运动会', participantCount: 152, completionRate: 0.95 },
    { activityName: '艺术展览', participantCount: 98, completionRate: 0.87 },
    { activityName: '科学实验日', participantCount: 120, completionRate: 0.92 },
    { activityName: '读书节', participantCount: 187, completionRate: 0.96 },
    { activityName: '传统文化体验', participantCount: 143, completionRate: 0.89 }
  ];
  
  return [200, {
    success: true,
    data: activities
  }];
});

// 获取近期活动
mock.onGet(`${API_PREFIX}/dashboard/recentActivities`).reply((config) => {
  const { limit = 5 } = config.params || {};
  
  const activities = [
    { 
      id: 'ACT001', 
      title: '亲子运动会', 
      status: '进行中', 
      startTime: '2023-12-10 09:00', 
      endTime: '2023-12-10 16:00', 
      location: '幼儿园操场', 
      participantCount: 152 
    },
    { 
      id: 'ACT002', 
      title: '艺术展览', 
      status: '即将开始', 
      startTime: '2023-12-15 10:00', 
      endTime: '2023-12-16 15:00', 
      location: '幼儿园多功能厅', 
      participantCount: 98 
    },
    { 
      id: 'ACT003', 
      title: '科学实验日', 
      status: '已结束', 
      startTime: '2023-12-05 13:30', 
      endTime: '2023-12-05 16:30', 
      location: '科学教室', 
      participantCount: 120 
    },
    { 
      id: 'ACT004', 
      title: '读书节', 
      status: '即将开始', 
      startTime: '2023-12-20 09:00', 
      endTime: '2023-12-22 16:00', 
      location: '图书馆', 
      participantCount: 187 
    },
    { 
      id: 'ACT005', 
      title: '传统文化体验', 
      status: '已结束', 
      startTime: '2023-12-01 10:00', 
      endTime: '2023-12-01 15:00', 
      location: '文化活动室', 
      participantCount: 143 
    }
  ];
  
  return [200, {
    success: true,
    data: activities.slice(0, limit)
  }];
});

// 更新学生状态
mock.onPatch(new RegExp(`${API_PREFIX}/students/[^/]+/status$`)).reply((config) => {
  const id = config.url?.split('/')[3];
  const { status } = JSON.parse(config.data);
  const index = mockData.students.findIndex(s => s.id === id);
  
  if (index !== -1) {
    mockData.students[index].status = status;
    return [200, { success: true }];
  } else {
    return [404, { message: '学生不存在' }];
  }
});

// 教师相关API
// 搜索教师
mock.onGet(`${API_PREFIX}/teachers/search`).reply((config) => {
  const { keyword, page = 1, pageSize = 10 } = config.params || {};
  
  let filteredTeachers = [...mockData.teachers];
  
  // 按关键词筛选
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredTeachers = filteredTeachers.filter(t => 
      t.name.toLowerCase().includes(lowerKeyword) || 
      t.id.toLowerCase().includes(lowerKeyword)
    );
  }
  
  // 分页
  const total = filteredTeachers.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedTeachers = filteredTeachers.slice(start, end);
  
  return [200, { items: paginatedTeachers, total }];
});

// 获取教师详情
mock.onGet(new RegExp(`${API_PREFIX}/teachers/[^/]+$`)).reply((config) => {
  const id = config.url?.split('/').pop();
  const teacher = mockData.teachers.find(t => t.id === id);
  
  if (teacher) {
    return [200, teacher];
  } else {
    return [404, { message: '教师不存在' }];
  }
});

// 出勤相关API
// 获取学生出勤记录
mock.onGet(new RegExp(`${API_PREFIX}/attendance/student/[^/]+$`)).reply((config) => {
  const studentId = config.url?.split('/').pop();
  const { page = 1, pageSize = 10 } = config.params || {};
  
  const attendanceRecords = generateAttendanceData(studentId as string, 30);
  
  // 分页
  const total = attendanceRecords.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRecords = attendanceRecords.slice(start, end);
  
  return [200, { items: paginatedRecords, total }];
});

export default mock; 