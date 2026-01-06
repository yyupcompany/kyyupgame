/**
 * 测试数据配置
 * 定义测试所需的各种数据
 */

export interface TestStudent {
  id: string
  name: string
  age: number
  gender: '男' | '女'
  classId: string
  parentId: string
  admissionDate: string
  status: 'active' | 'inactive' | 'graduated'
}

export interface TestTeacher {
  id: string
  name: string
  gender: '男' | '女'
  email: string
  phone: string
  subject: string
  experience: number
  status: 'active' | 'inactive'
}

export interface TestClass {
  id: string
  name: string
  grade: string
  capacity: number
  currentCount: number
  teacherId: string
  classroom: string
  schedule: string[]
}

export interface TestActivity {
  id: string
  title: string
  description: string
  type: 'indoor' | 'outdoor' | 'online'
  capacity: number
  currentRegistrations: number
  startDate: string
  endDate: string
  status: 'draft' | 'published' | 'ongoing' | 'completed'
  organizerId: string
}

export interface TestParent {
  id: string
  name: string
  email: string
  phone: string
  relationship: 'father' | 'mother' | 'guardian'
  childrenIds: string[]
  status: 'active' | 'inactive'
}

// 测试学生数据
export const TEST_STUDENTS: TestStudent[] = [
  {
    id: 'student-001',
    name: '张小明',
    age: 4,
    gender: '男',
    classId: 'class-001',
    parentId: 'parent-001',
    admissionDate: '2024-09-01',
    status: 'active'
  },
  {
    id: 'student-002',
    name: '李小华',
    age: 5,
    gender: '女',
    classId: 'class-001',
    parentId: 'parent-002',
    admissionDate: '2023-09-01',
    status: 'active'
  },
  {
    id: 'student-003',
    name: '王大伟',
    age: 4,
    gender: '男',
    classId: 'class-002',
    parentId: 'parent-003',
    admissionDate: '2024-09-01',
    status: 'active'
  },
  {
    id: 'student-004',
    name: '刘小红',
    age: 6,
    gender: '女',
    classId: 'class-002',
    parentId: 'parent-004',
    admissionDate: '2022-09-01',
    status: 'active'
  },
  {
    id: 'student-005',
    name: '陈小军',
    age: 5,
    gender: '男',
    classId: 'class-003',
    parentId: 'parent-005',
    admissionDate: '2023-09-01',
    status: 'inactive'
  }
]

// 测试教师数据
export const TEST_TEACHERS: TestTeacher[] = [
  {
    id: 'teacher-001',
    name: '王老师',
    gender: '女',
    email: 'wang.teacher@test.com',
    phone: '13800138101',
    subject: '语言',
    experience: 5,
    status: 'active'
  },
  {
    id: 'teacher-002',
    name: '李老师',
    gender: '男',
    email: 'li.teacher@test.com',
    phone: '13800138102',
    subject: '数学',
    experience: 3,
    status: 'active'
  },
  {
    id: 'teacher-003',
    name: '张老师',
    gender: '女',
    email: 'zhang.teacher@test.com',
    phone: '13800138103',
    subject: '艺术',
    experience: 8,
    status: 'active'
  },
  {
    id: 'teacher-004',
    name: '陈老师',
    gender: '男',
    email: 'chen.teacher@test.com',
    phone: '13800138104',
    subject: '体育',
    experience: 2,
    status: 'inactive'
  }
]

// 测试班级数据
export const TEST_CLASSES: TestClass[] = [
  {
    id: 'class-001',
    name: '小班A班',
    grade: '小班',
    capacity: 25,
    currentCount: 20,
    teacherId: 'teacher-001',
    classroom: '教室101',
    schedule: ['08:00-09:00 早餐', '09:00-10:00 语言课', '10:00-11:00 游戏时间']
  },
  {
    id: 'class-002',
    name: '中班B班',
    grade: '中班',
    capacity: 30,
    currentCount: 28,
    teacherId: 'teacher-002',
    classroom: '教室102',
    schedule: ['08:00-09:00 早餐', '09:00-10:00 数学课', '10:00-11:0 0艺术课']
  },
  {
    id: 'class-003',
    name: '大班C班',
    grade: '大班',
    capacity: 35,
    currentCount: 32,
    teacherId: 'teacher-003',
    classroom: '教室103',
    schedule: ['08:00-09:00 早餐', '09:00-10:00 语言课', '10:00-11:00 体育课']
  }
]

// 测试活动数据
export const TEST_ACTIVITIES: TestActivity[] = [
  {
    id: 'activity-001',
    title: '春季运动会',
    description: '幼儿园春季户外运动会',
    type: 'outdoor',
    capacity: 100,
    currentRegistrations: 75,
    startDate: '2024-04-15',
    endDate: '2024-04-15',
    status: 'published',
    organizerId: 'teacher-004'
  },
  {
    id: 'activity-002',
    title: '亲子手工课',
    description: '家长和孩子一起参与的手工制作活动',
    type: 'indoor',
    capacity: 50,
    currentRegistrations: 45,
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    status: 'completed',
    organizerId: 'teacher-003'
  },
  {
    id: 'activity-003',
    title: '线上安全讲座',
    description: '儿童安全知识线上讲座',
    type: 'online',
    capacity: 200,
    currentRegistrations: 120,
    startDate: '2024-04-10',
    endDate: '2024-04-10',
    status: 'published',
    organizerId: 'teacher-001'
  },
  {
    id: 'activity-004',
    title: '毕业典礼筹备',
    description: '大班学生毕业典礼筹备活动',
    type: 'indoor',
    capacity: 40,
    currentRegistrations: 0,
    startDate: '2024-06-30',
    endDate: '2024-06-30',
    status: 'draft',
    organizerId: 'teacher-003'
  }
]

// 测试家长数据
export const TEST_PARENTS: TestParent[] = [
  {
    id: 'parent-001',
    name: '张先生',
    email: 'zhang.parent@test.com',
    phone: '13900139001',
    relationship: 'father',
    childrenIds: ['student-001'],
    status: 'active'
  },
  {
    id: 'parent-002',
    name: '李女士',
    email: 'li.parent@test.com',
    phone: '13900139002',
    relationship: 'mother',
    childrenIds: ['student-002'],
    status: 'active'
  },
  {
    id: 'parent-003',
    name: '王先生',
    email: 'wang.parent@test.com',
    phone: '13900139003',
    relationship: 'father',
    childrenIds: ['student-003'],
    status: 'active'
  },
  {
    id: 'parent-004',
    name: '刘女士',
    email: 'liu.parent@test.com',
    phone: '13900139004',
    relationship: 'mother',
    childrenIds: ['student-004'],
    status: 'active'
  },
  {
    id: 'parent-005',
    name: '陈女士',
    email: 'chen.parent@test.com',
    phone: '13900139005',
    relationship: 'mother',
    childrenIds: ['student-005'],
    status: 'inactive'
  }
]

// 测试API响应模板
export const API_RESPONSE_TEMPLATES = {
  success: {
    code: 200,
    message: 'success',
    data: null,
    timestamp: new Date().toISOString()
  },
  created: {
    code: 201,
    message: 'created successfully',
    data: null,
    timestamp: new Date().toISOString()
  },
  badRequest: {
    code: 400,
    message: 'bad request',
    data: null,
    timestamp: new Date().toISOString()
  },
  unauthorized: {
    code: 401,
    message: 'unauthorized',
    data: null,
    timestamp: new Date().toISOString()
  },
  forbidden: {
    code: 403,
    message: 'forbidden',
    data: null,
    timestamp: new Date().toISOString()
  },
  notFound: {
    code: 404,
    message: 'not found',
    data: null,
    timestamp: new Date().toISOString()
  },
  serverError: {
    code: 500,
    message: 'internal server error',
    data: null,
    timestamp: new Date().toISOString()
  }
}

// 测试数据生成器
export class TestDataGenerator {
  static generateRandomStudent(overrides?: Partial<TestStudent>): TestStudent {
    const randomId = Math.random().toString(36).substr(2, 9)
    return {
      id: `student-${randomId}`,
      name: `测试学生${randomId}`,
      age: Math.floor(Math.random() * 4) + 3,
      gender: Math.random() > 0.5 ? '男' : '女',
      classId: TEST_CLASSES[Math.floor(Math.random() * TEST_CLASSES.length)].id,
      parentId: TEST_PARENTS[Math.floor(Math.random() * TEST_PARENTS.length)].id,
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'active',
      ...overrides
    }
  }

  static generateRandomTeacher(overrides?: Partial<TestTeacher>): TestTeacher {
    const randomId = Math.random().toString(36).substr(2, 9)
    const names = ['张老师', '李老师', '王老师', '刘老师', '陈老师']
    const subjects = ['语言', '数学', '艺术', '体育', '音乐', '科学']
    return {
      id: `teacher-${randomId}`,
      name: names[Math.floor(Math.random() * names.length)],
      gender: Math.random() > 0.5 ? '男' : '女',
      email: `teacher${randomId}@test.com`,
      phone: `13800138${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      experience: Math.floor(Math.random() * 10) + 1,
      status: 'active',
      ...overrides
    }
  }

  static generateRandomClass(overrides?: Partial<TestClass>): TestClass {
    const randomId = Math.random().toString(36).substr(2, 9)
    const grades = ['小班', '中班', '大班']
    const classrooms = ['教室101', '教室102', '教室103', '教室104', '教室105']
    return {
      id: `class-${randomId}`,
      name: `${grades[Math.floor(Math.random() * grades.length)]}测试班`,
      grade: grades[Math.floor(Math.random() * grades.length)],
      capacity: Math.floor(Math.random() * 20) + 20,
      currentCount: 0,
      teacherId: TEST_TEACHERS[Math.floor(Math.random() * TEST_TEACHERS.length)].id,
      classroom: classrooms[Math.floor(Math.random() * classrooms.length)],
      schedule: ['08:00-09:00 早餐', '09:00-10:00 主课', '10:00-11:00 活动'],
      ...overrides
    }
  }

  static generateRandomActivity(overrides?: Partial<TestActivity>): TestActivity {
    const randomId = Math.random().toString(36).substr(2, 9)
    const types: ('indoor' | 'outdoor' | 'online')[] = ['indoor', 'outdoor', 'online']
    const statuses: ('draft' | 'published' | 'ongoing' | 'completed')[] = ['draft', 'published', 'ongoing', 'completed']
    return {
      id: `activity-${randomId}`,
      title: `测试活动${randomId}`,
      description: '这是一个测试活动',
      type: types[Math.floor(Math.random() * types.length)],
      capacity: Math.floor(Math.random() * 100) + 20,
      currentRegistrations: 0,
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      organizerId: TEST_TEACHERS[Math.floor(Math.random() * TEST_TEACHERS.length)].id,
      ...overrides
    }
  }
}

// 测试数据清理器
export class TestDataCleaner {
  static async cleanupTestData() {
    // 这里可以添加清理测试数据的逻辑
    // 例如删除测试生成的数据，重置数据库状态等
    console.log('Cleaning up test data...')
  }
}

// 导出所有测试数据
export const TEST_DATA = {
  students: TEST_STUDENTS,
  teachers: TEST_TEACHERS,
  classes: TEST_CLASSES,
  activities: TEST_ACTIVITIES,
  parents: TEST_PARENTS,
  apiTemplates: API_RESPONSE_TEMPLATES
}