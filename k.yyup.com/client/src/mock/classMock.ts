// 班级管理模块模拟数据
import {
  Class
} from '../api/modules/class';
import {
  ClassInfo,
  ClassType,
  ClassStatus,
  // ClassQueryParams,
  ClassStudent,
  TeacherAssignmentParams
} from '../types/class';

// 生成随机ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// 生成随机日期
const generateDate = (start: Date, end: Date) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

// 生成随机电话号码
const generatePhone = () => {
  return `1${Math.floor(Math.random() * 9) + 1}${Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')}`;
};

// 生成随机班级数据
export const generateClassData = (count: number = 10): ClassInfo[] => {
  const classTypes = Object.values(ClassType);
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  // const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  return Array.from({ length: count }, (_, index) => {
    const capacity = Math.floor(Math.random() * 20) + 10; // 10-30
    const currentCount = Math.floor(Math.random() * (capacity + 1));
    const type = classTypes[Math.floor(Math.random() * classTypes.length)];
    const status = Math.random() > 0.5 ? 'active' : 'inactive';
    // const startDate = generateDate(lastYear, today);

    const id = `CLS${String(index + 1).padStart(4, '0')}`;
    const createdAt = new Date(lastYear.getTime() + Math.random() * (today.getTime() - lastYear.getTime())).toISOString();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * (today.getTime() - new Date(createdAt).getTime())).toISOString();

    return {
      id,
      name: `${type === ClassType.SPECIAL ? '特色' : type === ClassType.FULL_TIME ? '全日制' : '半日制'}班级${index + 1}`,
      grade: `${Math.floor(Math.random() * 3) + 3}-${Math.floor(Math.random() * 3) + 5}岁`,
      capacity,
      currentCount,
      headTeacherId: `TCH${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
      kindergartenId: `KG${String(Math.floor(Math.random() * 5) + 1).padStart(4, '0')}`,
      status,
      createdAt,
      updatedAt,
      // ClassInfo specific properties
      headTeacher: {
        id: `TCH${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
        name: `教师${Math.floor(Math.random() * 20) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=teacher${index}`
      },
      teachers: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
        id: `TCH${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}`,
        name: `助教${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=assistant${i}`,
        role: '助教'
      })),
      students: Array.from({ length: currentCount }, (_, i) => ({
        id: `STU${String(Math.floor(Math.random() * 100) + 1).padStart(4, '0')}`,
        name: `学生${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`,
        age: Math.floor(Math.random() * 3) + 3,
        gender: Math.random() > 0.5 ? 'male' : 'female' as 'male' | 'female'
      }))
    };
  });
};

// 生成随机学生数据
export const generateStudentData = (count: number = 30): ClassStudent[] => {
  const statuses = ['ACTIVE', 'INACTIVE', 'TRANSFERRED'];
  const today = new Date();
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return Array.from({ length: count }, (_, index) => {
    const id = `STU${String(index + 1).padStart(4, '0')}`;
    const joinDate = generateDate(lastYear, today);
    const birthDate = generateDate(new Date(today.getFullYear() - 7, 0, 1), new Date(today.getFullYear() - 2, 11, 31));
    const age = today.getFullYear() - new Date(birthDate).getFullYear();
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
    const attendanceRate = Math.random() * 0.4 + 0.6; // 60%-100%

    return {
      id,
      studentId: `S${String(index + 1).padStart(6, '0')}`,
      name: `学生${index + 1}`,
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      age,
      birthDate,
      enrollmentDate: generateDate(new Date(lastYear.getFullYear(), lastYear.getMonth() - 3, lastYear.getDate()), lastYear),
      joinDate,
      parentName: `家长${index + 1}`,
      parentContact: generatePhone(),
      address: `城市区域第${Math.floor(Math.random() * 20) + 1}小区${Math.floor(Math.random() * 100) + 1}号`,
      remarks: Math.random() > 0.7 ? `这是学生${index + 1}的备注信息` : undefined,
      status,
      attendanceRate
    };
  });
};

// 生成随机出勤记录
export const generateAttendanceData = (studentId: string, count: number = 30) => {
  const statuses = ['PRESENT', 'ABSENT', 'LATE'];
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  return Array.from({ length: count }, () => {
    const date = generateDate(lastMonth, today);
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'PRESENT' | 'ABSENT' | 'LATE';
    const recordedAt = new Date(date + 'T08:00:00').toISOString();

    return {
      id: generateId(),
      studentId,
      date,
      status,
      remarks: status !== 'PRESENT' ? `${status === 'ABSENT' ? '缺席' : '迟到'}原因记录` : undefined,
      recordedAt,
      recordedBy: `教师${Math.floor(Math.random() * 20) + 1}`
    };
  });
};

// 生成随机教师数据
export const generateTeacherData = (count: number = 20) => {
  return Array.from({ length: count }, (_, index) => {
    const id = `TCH${String(index + 1).padStart(4, '0')}`;
    return {
      id,
      name: `教师${index + 1}`,
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      age: Math.floor(Math.random() * 20) + 25,
      contact: generatePhone(),
      email: `teacher${index + 1}@example.com`,
      position: Math.random() > 0.3 ? '班主任' : '助理教师',
      isHeadTeacher: Math.random() > 0.7
    };
  });
};

// 导出所有Mock数据
export const mockData = {
  classes: generateClassData(20),
  students: generateStudentData(100),
  teachers: generateTeacherData(30)
};

// 生成模拟班级数据
const generateMockClasses = (count: number): Class[] => {
  const statusValues = Object.values(ClassStatus);
  const typeValues = Object.values(ClassType);
  
  return Array.from({ length: count }, (_, index) => {
    const id = `CLS${String(index + 1).padStart(4, '0')}`;
    const type = typeValues[Math.floor(Math.random() * typeValues.length)];
    const status = statusValues[Math.floor(Math.random() * statusValues.length)];
    
    // 生成随机日期
    const now = new Date();
    const startDate = new Date(now);
    
    // 根据班级类型设置不同的年龄范围
    let ageRange = '';
    switch (type) {
      case ClassType.FULL_TIME:
        ageRange = '3-4岁';
        break;
      case ClassType.HALF_TIME:
        ageRange = '4-5岁';
        break;
      case ClassType.SPECIAL:
        ageRange = '5-6岁';
        break;
      default:
        ageRange = '3-6岁';
        break;
    }
    
    // 根据状态设置不同的日期范围
    if (status === ClassStatus.CLOSED) {
      startDate.setFullYear(now.getFullYear() - 1);
    } else if (status === ClassStatus.ACTIVE) {
      startDate.setMonth(now.getMonth() - Math.floor(Math.random() * 6));
    } else if (status === ClassStatus.PENDING) {
      startDate.setMonth(now.getMonth() + Math.floor(Math.random() * 3) + 1);
    }
    
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    
    const createdDate = new Date(startDate);
    createdDate.setMonth(startDate.getMonth() - 1);
    
    // 班级容量和当前人数
    const capacity = Math.floor(Math.random() * 15) + 20;
    let currentCount = 0;
    
    if (status === ClassStatus.ACTIVE) {
      currentCount = Math.floor(capacity * (Math.random() * 0.5 + 0.5));
    } else if (status === ClassStatus.CLOSED) {
      currentCount = Math.floor(capacity * (Math.random() * 0.2 + 0.8));
    } else if (status === ClassStatus.INACTIVE) {
      currentCount = Math.floor(capacity * (Math.random() * 0.5));
    }
    
    // 班级名称
    let name = '';
    switch (type) {
      case ClassType.FULL_TIME:
        name = `全日制${index % 5 + 1}班`;
        break;
      case ClassType.HALF_TIME:
        name = `半日制${index % 5 + 1}班`;
        break;
      case ClassType.SPECIAL:
        name = `特色${['艺术', '音乐', '科学', '体育', '双语'][index % 5]}班`;
        break;
      default:
        name = `班级${index + 1}`;
        break;
    }
    
    // 班级教师
    const headTeacherId = status !== ClassStatus.PENDING ? `TCH${String(Math.floor(Math.random() * 20) + 1).padStart(4, '0')}` : undefined;
    const headTeacherName = headTeacherId ? `教师${Math.floor(Math.random() * 20) + 1}` : undefined;
    
    const assistantTeacherIds = status !== ClassStatus.PENDING ? [
      `TCH${String(Math.floor(Math.random() * 20) + 21).padStart(4, '0')}`,
      `TCH${String(Math.floor(Math.random() * 20) + 41).padStart(4, '0')}`
    ] : undefined;
    
    const assistantTeacherNames = assistantTeacherIds ? [
      `教师${Math.floor(Math.random() * 20) + 21}`,
      `教师${Math.floor(Math.random() * 20) + 41}`
    ] : undefined;
    
    // 教室
    const classroom = `${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 3) + 1}${Math.floor(Math.random() * 9) + 1}`;
    
    // 课程表
    const subjects = ['语言', '数学', '科学', '艺术', '音乐', '体育', '英语', '思维'];
    const schedule = Array.from({ length: 5 }, (_, i) => {
      const morningSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const afternoonSubject = subjects[Math.floor(Math.random() * subjects.length)];
      
      return [
        {
          day: i + 1,  // 周一到周五
          startTime: '09:00',
          endTime: '11:30',
          subject: morningSubject
        },
        {
          day: i + 1,
          startTime: '14:00',
          endTime: '16:30',
          subject: afternoonSubject
        }
      ];
    }).flat();
    
    return {
      id,
      name,
      type,
      status,
      capacity,
      currentCount,
      headTeacherId,
      headTeacherName,
      assistantTeacherIds,
      assistantTeacherNames,
      classroom,
      schedule,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      description: `${name}是一个${ageRange}的${type === ClassType.SPECIAL ? '特色' : '常规'}班级，采用趣味教学方式，促进幼儿全面发展。`,
      ageRange,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + 86400000 * (Math.random() * 5)).toISOString()
    };
  });
};

// 生成模拟班级学生数据
const generateMockClassStudents = (_classId: string, count: number): ClassStudent[] => {
  const genders = ['MALE', 'FEMALE'];
  const statusWeights = [0.8, 0.15, 0.05]; // 活跃学生占80%，非活跃15%，转班5%
  
  return Array.from({ length: count }, (_, index) => {
    const id = `STU${String(index + 1).padStart(4, '0')}`;
    const studentId = `STU${String(index + 1).padStart(4, '0')}`;
    const gender = genders[Math.floor(Math.random() * genders.length)] as 'MALE' | 'FEMALE';
    
    // 根据权重随机选择状态
    let status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
    const rand = Math.random();
    if (rand < statusWeights[0]) {
      status = 'ACTIVE';
    } else if (rand < statusWeights[0] + statusWeights[1]) {
      status = 'INACTIVE';
    } else {
      status = 'TRANSFERRED';
    }
    
    // 生成随机日期
    const now = new Date();
    const birthDate = new Date(now);
    birthDate.setFullYear(now.getFullYear() - Math.floor(Math.random() * 3) - 3); // 3-6岁
    birthDate.setMonth(Math.floor(Math.random() * 12));
    birthDate.setDate(Math.floor(Math.random() * 28) + 1);
    
    const joinDate = new Date(now);
    joinDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12));
    
    // 计算年龄
    const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    // 出勤率
    let attendanceRate = 0;
    if (status === 'ACTIVE') {
      attendanceRate = Math.random() * 0.15 + 0.85; // 85% - 100%
    } else if (status === 'INACTIVE') {
      attendanceRate = Math.random() * 0.3 + 0.5; // 50% - 80%
    } else {
      attendanceRate = Math.random() * 0.5 + 0.3; // 30% - 80%
    }
    
    const name = `学生${index + 1}`;
    const parentName = `${name}家长`;
    const parentContact = `1${Math.floor(Math.random() * 9) + 3}${Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')}`;
    
    return {
      id,
      studentId,
      name,
      gender,
      birthDate: birthDate.toISOString().split('T')[0],
      age,
      parentName,
      parentContact,
      joinDate: joinDate.toISOString().split('T')[0],
      status,
      attendanceRate,
      remarks: status === 'TRANSFERRED' ? '已转至其他班级' : undefined,
      enrollmentDate: joinDate.toISOString().split('T')[0]
    };
  });
};

// 模拟班级数据
const mockClasses = generateMockClasses(30);

// 模拟班级学生数据映射 (classId -> students[])
const mockClassStudentsMap: Record<string, ClassStudent[]> = {};
mockClasses.forEach(classItem => {
  if (classItem.currentCount > 0) {
    mockClassStudentsMap[classItem.id] = generateMockClassStudents(classItem.id, classItem.currentCount);
  } else {
    mockClassStudentsMap[classItem.id] = [];
  }
});

/**
 * 扩展ClassQueryParams接口以包含额外的查询参数
 */
interface ExtendedClassQueryParams {
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  type?: string;
  status?: string;
  pageSize?: number;
  page?: number;
}

/**
 * 模拟获取班级列表API
 * @param params 查询参数
 * @returns Promise<{items: Class[], total: number}>
 */
export const mockGetClassList = (params: ExtendedClassQueryParams) => {
  return new Promise<{items: Class[], total: number}>((resolve) => {
    setTimeout(() => {
      let result = [...mockClasses];
      
      // 关键词过滤
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        result = result.filter(
          item => item.name.toLowerCase().includes(keyword) || 
                 (item.description && item.description.toLowerCase().includes(keyword))
        );
      }
      
      // 类型过滤
      if (params.type) {
        result = result.filter(item => item.type === params.type);
      }
      
      // 状态过滤
      if (params.status) {
        result = result.filter(item => item.status === params.status);
      }
      
      // 教师ID过滤
      if (params.teacherId) {
        result = result.filter(
          item => item.headTeacherId === params.teacherId || 
                 (item.assistantTeacherIds && item.assistantTeacherIds.includes(params.teacherId as string))
        );
      }
      
      // 日期范围过滤
      if (params.startDate && params.startDate.trim() !== '') {
        const startDate = params.startDate;
        result = result.filter(item => item.startDate >= startDate);
      }
      
      if (params.endDate && params.endDate.trim() !== '') {
        const endDate = params.endDate;
        result = result.filter(item => item.endDate && item.endDate <= endDate);
      }
      
      // 总数
      const total = result.length;
      
      // 分页
      const pageSize = params.pageSize || 10;
      const page = params.page || 1;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      result = result.slice(start, end);
      
      resolve({
        items: result,
        total
      });
    }, 500);
  });
};

/**
 * 模拟获取班级详情API
 * @param id 班级ID
 * @returns Promise<Class>
 */
export const mockGetClassDetail = (id: string) => {
  return new Promise<Class>((resolve, reject) => {
    setTimeout(() => {
      const classItem = mockClasses.find(item => item.id === id);
      
      if (classItem) {
        resolve(classItem);
      } else {
        reject(new Error('班级未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟创建班级API
 * @param data 班级创建参数
 * @returns Promise<Class>
 */
export const mockCreateClass = (data: any) => {
  return new Promise<Class>((resolve) => {
    setTimeout(() => {
      const id = `CLS${String(mockClasses.length + 1).padStart(4, '0')}`;
      const now = new Date().toISOString();
      
      const newClass: Class = {
        id,
        ...data,
        currentCount: 0,
        headTeacherName: data.headTeacherId ? `教师${Math.floor(Math.random() * 50) + 1}` : undefined,
        assistantTeacherNames: data.assistantTeacherIds ? data.assistantTeacherIds.map(() => `教师${Math.floor(Math.random() * 50) + 1}`) : undefined,
        createdAt: now,
        updatedAt: now
      };
      
      mockClasses.unshift(newClass);
      mockClassStudentsMap[newClass.id] = [];
      
      resolve(newClass);
    }, 500);
  });
};

/**
 * 模拟更新班级API
 * @param id 班级ID
 * @param data 班级更新参数
 * @returns Promise<Class>
 */
export const mockUpdateClass = (id: string, data: any) => {
  return new Promise<Class>((resolve, reject) => {
    setTimeout(() => {
      const index = mockClasses.findIndex(item => item.id === id);
      
      if (index !== -1) {
        const classItem = mockClasses[index];
        
        // 更新教师名称
        let headTeacherName = classItem.headTeacherName;
        if (data.headTeacherId && data.headTeacherId !== classItem.headTeacherId) {
          headTeacherName = `教师${Math.floor(Math.random() * 50) + 1}`;
        }
        
        let assistantTeacherNames = classItem.assistantTeacherNames;
        if (data.assistantTeacherIds && JSON.stringify(data.assistantTeacherIds) !== JSON.stringify(classItem.assistantTeacherIds)) {
          assistantTeacherNames = data.assistantTeacherIds.map(() => `教师${Math.floor(Math.random() * 50) + 1}`);
        }
        
        const updatedClass = {
          ...classItem,
          ...data,
          headTeacherName,
          assistantTeacherNames,
          updatedAt: new Date().toISOString()
        };
        
        mockClasses[index] = updatedClass;
        
        resolve(updatedClass);
      } else {
        reject(new Error('班级未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟删除班级API
 * @param id 班级ID
 * @returns Promise<void>
 */
export const mockDeleteClass = (id: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      const index = mockClasses.findIndex(item => item.id === id);
      
      if (index !== -1) {
        // 检查班级是否有学生
        const students = mockClassStudentsMap[id] || [];
        if (students.length > 0) {
          reject(new Error('无法删除有学生的班级'));
          return;
        }
        
        mockClasses.splice(index, 1);
        delete mockClassStudentsMap[id];
        resolve();
      } else {
        reject(new Error('班级未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟更新班级状态API
 * @param id 班级ID
 * @param status 班级状态
 * @returns Promise<Class>
 */
export const mockUpdateClassStatus = (id: string, status: ClassStatus) => {
  return new Promise<Class>((resolve, reject) => {
    setTimeout(() => {
      const classItem = mockClasses.find(item => item.id === id);
      
      if (classItem) {
        classItem.status = status;
        classItem.updatedAt = new Date().toISOString();
        resolve(classItem);
      } else {
        reject(new Error('班级未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟分配教师API
 * @param id 班级ID
 * @param data 教师分配参数
 * @returns Promise<Class>
 */
export const mockAssignTeachers = (id: string, data: TeacherAssignmentParams) => {
  return new Promise<Class>((resolve, reject) => {
    setTimeout(() => {
      const classItem = mockClasses.find(item => item.id === id);
      
      if (classItem) {
        if (data.headTeacherId) {
          classItem.headTeacherId = data.headTeacherId;
          classItem.headTeacherName = `教师${Math.floor(Math.random() * 50) + 1}`;
        }
        
        if (data.assistantTeacherIds) {
          classItem.assistantTeacherIds = data.assistantTeacherIds;
          classItem.assistantTeacherNames = data.assistantTeacherIds.map(() => `教师${Math.floor(Math.random() * 50) + 1}`);
        }
        
        classItem.updatedAt = new Date().toISOString();
        resolve(classItem);
      } else {
        reject(new Error('班级未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟获取班级学生列表API
 * @param classId 班级ID
 * @param params 查询参数
 * @returns Promise<{items: ClassStudent[], total: number}>
 */
export const mockGetClassStudents = (classId: string, params: {
  status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  keyword?: string;
  page?: number;
  pageSize?: number;
} = {}) => {
  return new Promise<{items: ClassStudent[], total: number}>((resolve, reject) => {
    setTimeout(() => {
      if (!mockClassStudentsMap[classId]) {
        reject(new Error('班级未找到'));
        return;
      }
      
      let result = [...mockClassStudentsMap[classId]];
      
      // 状态过滤
      if (params.status) {
        result = result.filter(item => item.status === params.status);
      }
      
      // 关键词过滤
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        result = result.filter(
          item => item.name.toLowerCase().includes(keyword) || 
                 item.parentName.toLowerCase().includes(keyword) ||
                 item.parentContact.includes(keyword)
        );
      }
      
      // 总数
      const total = result.length;
      
      // 分页
      const pageSize = params.pageSize || 10;
      const page = params.page || 1;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      result = result.slice(start, end);
      
      resolve({
        items: result,
        total
      });
    }, 300);
  });
};

/**
 * 模拟添加学生到班级API
 * @param classId 班级ID
 * @param studentIds 学生ID列表
 * @returns Promise<{success: boolean; failedStudents?: {id: string; reason: string}[]}>
 */
export const mockAddStudentsToClass = (classId: string, studentIds: string[]) => {
  return new Promise<{success: boolean; failedStudents?: {id: string; reason: string}[]}>((resolve, reject) => {
    setTimeout(() => {
      const classItem = mockClasses.find(item => item.id === classId);
      
      if (!classItem) {
        reject(new Error('班级未找到'));
        return;
      }
      
      if (!mockClassStudentsMap[classId]) {
        mockClassStudentsMap[classId] = [];
      }
      
      // 检查班级容量
      if (classItem.currentCount + studentIds.length > classItem.capacity) {
        resolve({
          success: false,
          failedStudents: studentIds.map(id => ({
            id,
            reason: '班级已满'
          }))
        });
        return;
      }
      
      // 模拟添加学生
      const failedStudents: {id: string; reason: string}[] = [];
      let successCount = 0;
      
      studentIds.forEach(studentId => {
        // 随机决定是否添加成功
        if (Math.random() > 0.1) { // 90%成功率
          // 创建新学生
          const newStudent = generateMockClassStudents(classId, 1)[0];
          newStudent.id = studentId;
          mockClassStudentsMap[classId].push(newStudent);
          successCount++;
        } else {
          failedStudents.push({
            id: studentId,
            reason: '学生信息不完整或已在其他班级'
          });
        }
      });
      
      // 更新班级学生数量
      classItem.currentCount += successCount;
      classItem.updatedAt = new Date().toISOString();
      
      resolve({
        success: failedStudents.length === 0,
        failedStudents: failedStudents.length > 0 ? failedStudents : undefined
      });
    }, 500);
  });
};

/**
 * 模拟从班级移除学生API
 * @param classId 班级ID
 * @param studentId 学生ID
 * @returns Promise<void>
 */
export const mockRemoveStudentFromClass = (classId: string, studentId: string) => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (!mockClassStudentsMap[classId]) {
        reject(new Error('班级未找到'));
        return;
      }
      
      const index = mockClassStudentsMap[classId].findIndex(student => student.id === studentId);
      
      if (index !== -1) {
        mockClassStudentsMap[classId].splice(index, 1);
        
        // 更新班级学生数量
        const classItem = mockClasses.find(item => item.id === classId);
        if (classItem) {
          classItem.currentCount--;
          classItem.updatedAt = new Date().toISOString();
        }
        
        resolve();
      } else {
        reject(new Error('学生未找到'));
      }
    }, 300);
  });
};

/**
 * 模拟转班API
 * @param fromClassId 源班级ID
 * @param toClassId 目标班级ID
 * @param studentIds 学生ID列表
 * @returns Promise<{success: boolean; failedStudents?: {id: string; reason: string}[]}>
 */
export const mockTransferStudents = (fromClassId: string, toClassId: string, studentIds: string[]) => {
  return new Promise<{success: boolean; failedStudents?: {id: string; reason: string}[]}>((resolve, reject) => {
    setTimeout(() => {
      if (!mockClassStudentsMap[fromClassId] || !mockClassStudentsMap[toClassId]) {
        reject(new Error('班级未找到'));
        return;
      }
      
      const fromClass = mockClasses.find(item => item.id === fromClassId);
      const toClass = mockClasses.find(item => item.id === toClassId);
      
      if (!fromClass || !toClass) {
        reject(new Error('班级未找到'));
        return;
      }
      
      // 检查目标班级容量
      if (toClass.currentCount + studentIds.length > toClass.capacity) {
        resolve({
          success: false,
          failedStudents: studentIds.map(id => ({
            id,
            reason: '目标班级已满'
          }))
        });
        return;
      }
      
      // 模拟转班
      const failedStudents: {id: string; reason: string}[] = [];
      let successCount = 0;
      
      studentIds.forEach(studentId => {
        const studentIndex = mockClassStudentsMap[fromClassId].findIndex(student => student.id === studentId);
        
        if (studentIndex !== -1) {
          // 随机决定是否转班成功
          if (Math.random() > 0.1) { // 90%成功率
            const student = mockClassStudentsMap[fromClassId][studentIndex];
            // 更新学生状态
            student.status = 'TRANSFERRED';
            // 复制学生到目标班级
            const newStudent = { 
              ...student, 
              status: 'ACTIVE' as 'ACTIVE', 
              joinDate: new Date().toISOString().split('T')[0] 
            };
            mockClassStudentsMap[toClassId].push(newStudent);
            successCount++;
          } else {
            failedStudents.push({
              id: studentId,
              reason: '转班过程中出现问题'
            });
          }
        } else {
          failedStudents.push({
            id: studentId,
            reason: '学生未找到'
          });
        }
      });
      
      // 更新班级学生数量
      fromClass.currentCount -= successCount;
      toClass.currentCount += successCount;
      fromClass.updatedAt = new Date().toISOString();
      toClass.updatedAt = new Date().toISOString();
      
      resolve({
        success: failedStudents.length === 0,
        failedStudents: failedStudents.length > 0 ? failedStudents : undefined
      });
    }, 500);
  });
};

/**
 * 模拟获取班级统计数据API
 * @returns Promise<Array<{type: ClassType; count: number; studentCount: number}>>
 */
export const mockGetClassStatistics = () => {
  return new Promise<Array<{type: ClassType; count: number; studentCount: number}>>((resolve) => {
    setTimeout(() => {
      const statistics = Object.values(ClassType).map(type => {
        const classesOfType = mockClasses.filter(classItem => classItem.type === type);
        const count = classesOfType.length;
        const studentCount = classesOfType.reduce((sum, classItem) => sum + classItem.currentCount, 0);
        
        return {
          type,
          count,
          studentCount
        };
      });
      
      resolve(statistics);
    }, 300);
  });
};

/**
 * 模拟获取班级可用教室列表API
 * @param date 日期
 * @param timeSlot 时间段
 * @returns Promise<string[]>
 */
export const mockGetAvailableClassrooms = (_date: string, _timeSlot: string) => {
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      // 生成一些随机教室名称
      const allClassrooms = Array.from({ length: 20 }, () => {
        const building = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
        const floor = Math.floor(Math.random() * 3) + 1;
        const room = Math.floor(Math.random() * 9) + 1;
        return `${building}-${floor}${room}`;
      });
      
      // 随机选择一些作为可用教室
      const availableCount = Math.floor(Math.random() * 10) + 5;
      const uniqueClassrooms = Array.from(new Set(allClassrooms));
      const availableClassrooms = uniqueClassrooms.slice(0, availableCount);
      
      resolve(availableClassrooms);
    }, 300);
  });
}; 