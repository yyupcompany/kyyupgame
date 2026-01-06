export const testUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    password: '$2b$10$testhashedpassword',
    role: 'admin',
    profile: {
      name: '系统管理员',
      phone: '13800138000'
    }
  },
  {
    id: 2,
    username: 'principal',
    email: 'principal@test.com',
    password: '$2b$10$testhashedpassword',
    role: 'principal',
    profile: {
      name: '园长',
      phone: '13800138001'
    }
  },
  {
    id: 3,
    username: 'teacher1',
    email: 'teacher1@test.com',
    password: '$2b$10$testhashedpassword',
    role: 'teacher',
    profile: {
      name: '张老师',
      phone: '13800138002',
      qualification: '学前教育',
      experience: 5
    }
  },
  {
    id: 4,
    username: 'parent1',
    email: 'parent1@test.com',
    password: '$2b$10$testhashedpassword',
    role: 'parent',
    profile: {
      name: '王家长',
      phone: '13800138003'
    }
  }
];

export const testClasses = [
  {
    id: 1,
    name: '大班A',
    grade: '大班',
    capacity: 25,
    currentCount: 20,
    teacherId: 3,
    description: '5-6岁儿童班级'
  },
  {
    id: 2,
    name: '中班B',
    grade: '中班',
    capacity: 20,
    currentCount: 15,
    teacherId: 3,
    description: '4-5岁儿童班级'
  },
  {
    id: 3,
    name: '小班C',
    grade: '小班',
    capacity: 15,
    currentCount: 12,
    teacherId: 3,
    description: '3-4岁儿童班级'
  }
];

export const testStudents = [
  {
    id: 1,
    name: '小明',
    gender: '男',
    birthDate: '2020-01-15',
    parentId: 4,
    classId: 1,
    enrollmentDate: '2023-09-01',
    status: '在读',
    medicalInfo: {
      allergies: ['花生'],
      medications: []
    }
  },
  {
    id: 2,
    name: '小红',
    gender: '女',
    birthDate: '2020-06-20',
    parentId: 4,
    classId: 2,
    enrollmentDate: '2023-09-01',
    status: '在读',
    medicalInfo: {
      allergies: [],
      medications: []
    }
  },
  {
    id: 3,
    name: '小李',
    gender: '男',
    birthDate: '2021-03-10',
    parentId: 4,
    classId: 3,
    enrollmentDate: '2024-09-01',
    status: '在读',
    medicalInfo: {
      allergies: ['牛奶'],
      medications: ['维生素D']
    }
  }
];

export const testActivities = [
  {
    id: 1,
    title: '春游活动',
    description: '带领孩子们到公园进行春季户外活动',
    type: '户外活动',
    startTime: new Date('2024-04-15T09:00:00'),
    endTime: new Date('2024-04-15T15:00:00'),
    location: '市民公园',
    capacity: 30,
    currentRegistrations: 25,
    status: '开放报名',
    fee: 50,
    organizer: '张老师'
  },
  {
    id: 2,
    title: '音乐启蒙课',
    description: '通过音乐培养孩子的艺术感',
    type: '艺术课程',
    startTime: new Date('2024-04-20T10:00:00'),
    endTime: new Date('2024-04-20T11:00:00'),
    location: '音乐教室',
    capacity: 15,
    currentRegistrations: 10,
    status: '开放报名',
    fee: 0,
    organizer: '李老师'
  },
  {
    id: 3,
    title: '科学实验课',
    description: '简单有趣的科学实验',
    type: '科学课程',
    startTime: new Date('2024-04-25T14:00:00'),
    endTime: new Date('2024-04-25T15:30:00'),
    location: '科学实验室',
    capacity: 12,
    currentRegistrations: 8,
    status: '开放报名',
    fee: 20,
    organizer: '王老师'
  }
];

export const testEnrollmentPlans = [
  {
    id: 1,
    title: '2024年秋季招生计划',
    description: '2024年秋季学期新生招生',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    targetCount: 100,
    currentCount: 65,
    status: '进行中',
    ageRange: '3-6岁',
    requirements: ['户口本', '疫苗接种证明', '体检报告'],
    tuition: 2000
  },
  {
    id: 2,
    title: '2024年春季补招计划',
    description: '春季学期补充招生',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-29'),
    targetCount: 20,
    currentCount: 18,
    status: '即将结束',
    ageRange: '4-5岁',
    requirements: ['户口本', '疫苗接种证明'],
    tuition: 1800
  }
];

export const testEnrollmentApplications = [
  {
    id: 1,
    studentName: '新学生1',
    studentGender: '男',
    studentBirthDate: '2021-05-15',
    parentName: '新家长1',
    parentPhone: '13900139001',
    parentEmail: 'newparent1@test.com',
    enrollmentPlanId: 1,
    preferredClassGrade: '小班',
    status: '待审核',
    submissionDate: new Date('2024-03-15'),
    documents: ['户口本.pdf', '疫苗证明.pdf'],
    notes: '孩子性格活泼开朗'
  },
  {
    id: 2,
    studentName: '新学生2',
    studentGender: '女',
    studentBirthDate: '2020-08-20',
    parentName: '新家长2',
    parentPhone: '13900139002',
    parentEmail: 'newparent2@test.com',
    enrollmentPlanId: 1,
    preferredClassGrade: '中班',
    status: '已通过',
    submissionDate: new Date('2024-03-10'),
    reviewDate: new Date('2024-03-20'),
    documents: ['户口本.pdf', '疫苗证明.pdf', '体检报告.pdf'],
    notes: '孩子适应能力强'
  }
];

export const testRoles = [
  {
    id: 1,
    name: 'admin',
    displayName: '系统管理员',
    description: '系统最高权限管理员',
    permissions: ['*']
  },
  {
    id: 2,
    name: 'principal',
    displayName: '园长',
    description: '幼儿园园长',
    permissions: [
      'dashboard.view',
      'users.manage',
      'classes.manage',
      'students.manage',
      'teachers.manage',
      'activities.manage',
      'enrollment.manage',
      'reports.view'
    ]
  },
  {
    id: 3,
    name: 'teacher',
    displayName: '教师',
    description: '班级教师',
    permissions: [
      'dashboard.view',
      'students.view',
      'students.update',
      'classes.view',
      'activities.view',
      'activities.manage_own'
    ]
  },
  {
    id: 4,
    name: 'parent',
    displayName: '家长',
    description: '学生家长',
    permissions: [
      'dashboard.view',
      'students.view_own',
      'activities.view',
      'activities.register'
    ]
  }
];

export const testPermissions = [
  { id: 1, name: 'dashboard.view', description: '查看仪表板' },
  { id: 2, name: 'users.manage', description: '管理用户' },
  { id: 3, name: 'users.view', description: '查看用户' },
  { id: 4, name: 'classes.manage', description: '管理班级' },
  { id: 5, name: 'classes.view', description: '查看班级' },
  { id: 6, name: 'students.manage', description: '管理学生' },
  { id: 7, name: 'students.view', description: '查看学生' },
  { id: 8, name: 'students.view_own', description: '查看自己的孩子' },
  { id: 9, name: 'students.update', description: '更新学生信息' },
  { id: 10, name: 'teachers.manage', description: '管理教师' },
  { id: 11, name: 'activities.manage', description: '管理活动' },
  { id: 12, name: 'activities.view', description: '查看活动' },
  { id: 13, name: 'activities.register', description: '报名活动' },
  { id: 14, name: 'activities.manage_own', description: '管理自己的活动' },
  { id: 15, name: 'enrollment.manage', description: '管理招生' },
  { id: 16, name: 'reports.view', description: '查看报表' }
];

export const testSystemConfigs = [
  {
    key: 'school_name',
    value: '测试幼儿园',
    description: '学校名称'
  },
  {
    key: 'school_address',
    value: '测试市测试区测试街123号',
    description: '学校地址'
  },
  {
    key: 'school_phone',
    value: '400-123-4567',
    description: '学校电话'
  },
  {
    key: 'max_class_size',
    value: '30',
    description: '班级最大人数'
  },
  {
    key: 'enrollment_fee',
    value: '200',
    description: '报名费（元）'
  }
];

// SQL 插入语句生成器
export function generateInsertSQL(tableName: string, data: any[]): string {
  if (data.length === 0) return '';
  
  const columns = Object.keys(data[0]);
  const values = data.map(item => 
    `(${columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
      if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
      if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      return value;
    }).join(', ')})`
  ).join(',\n');
  
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values};`;
}

// 清理测试数据的SQL
export const cleanupSQL = [
  'DELETE FROM activity_registrations WHERE id > 0;',
  'DELETE FROM activities WHERE id > 0;',
  'DELETE FROM enrollment_applications WHERE id > 0;',
  'DELETE FROM enrollment_plans WHERE id > 0;',
  'DELETE FROM students WHERE id > 0;',
  'DELETE FROM classes WHERE id > 0;',
  'DELETE FROM role_permissions WHERE id > 0;',
  'DELETE FROM user_roles WHERE id > 0;',
  'DELETE FROM permissions WHERE id > 0;',
  'DELETE FROM roles WHERE id > 0;',
  'DELETE FROM users WHERE id > 0;',
  'DELETE FROM system_configs WHERE id > 0;'
];

// 重置自增ID的SQL
export const resetAutoIncrementSQL = [
  'ALTER TABLE users AUTO_INCREMENT = 1;',
  'ALTER TABLE roles AUTO_INCREMENT = 1;',
  'ALTER TABLE permissions AUTO_INCREMENT = 1;',
  'ALTER TABLE classes AUTO_INCREMENT = 1;',
  'ALTER TABLE students AUTO_INCREMENT = 1;',
  'ALTER TABLE activities AUTO_INCREMENT = 1;',
  'ALTER TABLE enrollment_plans AUTO_INCREMENT = 1;',
  'ALTER TABLE enrollment_applications AUTO_INCREMENT = 1;'
];