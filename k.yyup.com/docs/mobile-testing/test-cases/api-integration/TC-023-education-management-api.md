# TC-023: 教育管理API集成测试

## 📋 测试概述

**测试目标**: 验证移动端教育管理相关API的完整集成，包括学生管理、班级管理、课程管理、教师管理等功能
**测试类型**: API集成测试
**优先级**: 高
**预计执行时间**: 10-15分钟

---

## 🎯 测试场景

### 场景1: 学生管理API集成测试
- **目标**: 验证学生信息CRUD操作
- **覆盖功能**: 学生注册、信息修改、班级分配、家长关联

### 场景2: 班级管理API集成测试
- **目标**: 验证班级管理相关功能
- **覆盖功能**: 班级创建、学生分配、教师分配、课程安排

### 场景3: 教师管理API集成测试
- **目标**: 验证教师管理功能
- **覆盖功能**: 教师信息、班级分配、课程分配、工作量统计

### 场景4: 课程管理API集成测试
- **目标**: 验证课程管理功能
- **覆盖功能**: 课程创建、时间安排、资源分配、成绩管理

### 场景5: 考勤管理API集成测试
- **目标**: 验证考勤记录功能
- **覆盖功能**: 考勤记录、统计分析、异常处理

---

## 🔍 详细测试用例

### TC-023-01: 学生管理API集成测试

**测试步骤**:
1. 调用学生列表API接口
2. 测试学生创建功能
3. 验证学生信息更新
4. 检查班级分配功能
5. 测试家长关联功能

**API端点**: 
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `POST /api/students/:id/assign-class`

**严格验证要求**:
```typescript
// 1. 学生列表响应验证
const listResponse = await getStudents({ page: 1, pageSize: 10 });
const listFields = ['success', 'data'];
const listValidation = validateRequiredFields(listResponse, listFields);
expect(listValidation.valid).toBe(true);

// 2. 分页结构验证
const paginationFields = ['items', 'total', 'page', 'pageSize'];
const paginationValidation = validateRequiredFields(listResponse.data, paginationFields);
expect(paginationValidation.valid).toBe(true);

// 3. 学生对象字段验证
if (listResponse.data.items.length > 0) {
  const studentFields = ['id', 'studentId', 'name', 'gender', 'age', 'classId'];
  const studentValidation = validateRequiredFields(
    listResponse.data.items[0], 
    studentFields
  );
  expect(studentValidation.valid).toBe(true);

  // 4. 字段类型验证
  const typeValidation = validateFieldTypes(listResponse.data.items[0], {
    id: 'string',
    studentId: 'string',
    name: 'string',
    gender: 'string',
    age: 'number',
    classId: 'string'
  });
  expect(typeValidation.valid).toBe(true);
}

// 5. 数组类型验证
expect(Array.isArray(listResponse.data.items)).toBe(true);
```

**学生创建验证**:
```typescript
// 1. 创建响应验证
const createResponse = await createStudent(testStudent);
const createFields = ['success', 'data', 'message'];
const createValidation = validateRequiredFields(createResponse, createFields);
expect(createValidation.valid).toBe(true);

// 2. 创建学生字段验证
const createdFields = ['id', 'studentId', 'name', 'status'];
const createdValidation = validateRequiredFields(createResponse.data.student, createdFields);
expect(createdValidation.valid).toBe(true);

// 3. 学号唯一性验证
expect(createResponse.data.student.studentId).toMatch(/^STU\d{6}$/);

// 4. 状态默认值验证
expect(createResponse.data.student.status).toBe('ACTIVE');

// 5. 关联数据验证
if (testStudent.parentIds) {
  expect(Array.isArray(createResponse.data.student.parents)).toBe(true);
}
```

**测试数据**:
```typescript
const testStudent = {
  name: '测试学生_' + Date.now(),
  gender: 'MALE',
  birthDate: '2018-01-01',
  parentIds: ['parent1', 'parent2'],
  address: '测试地址',
  emergencyContact: {
    name: '紧急联系人',
    phone: '13800138000',
    relationship: 'FATHER'
  }
};
```

**预期结果**:
- ✅ 学生列表正确分页返回
- ✅ 学生创建成功且学号自动生成
- ✅ 学生信息更新功能正常
- ✅ 班级分配功能正确执行
- ✅ 家长关联关系正确建立

### TC-023-02: 班级管理API集成测试

**测试步骤**:
1. 创建测试班级
2. 分配学生到班级
3. 分配教师到班级
4. 更新班级信息
5. 获取班级详情

**API端点**: 
- `POST /api/classes`
- `GET /api/classes/:id`
- `PUT /api/classes/:id`
- `POST /api/classes/:id/assign-students`
- `POST /api/classes/:id/assign-teacher`

**严格验证要求**:
```typescript
// 1. 班级创建验证
const classResponse = await createClass(testClass);
const classFields = ['success', 'data', 'message'];
const classValidation = validateRequiredFields(classResponse, classFields);
expect(classValidation.valid).toBe(true);

// 2. 班级对象字段验证
const createdClassFields = ['id', 'name', 'grade', 'capacity', 'status'];
const classObjValidation = validateRequiredFields(
  classResponse.data.class, 
  createdClassFields
);
expect(classObjValidation.valid).toBe(true);

// 3. 字段类型验证
const typeValidation = validateFieldTypes(classResponse.data.class, {
  id: 'string',
  name: 'string',
  grade: 'number',
  capacity: 'number',
  status: 'string'
});
expect(typeValidation.valid).toBe(true);

// 4. 数值范围验证
expect(classResponse.data.class.grade).toBeGreaterThanOrEqual(1);
expect(classResponse.data.class.grade).toBeLessThanOrEqual(6);
expect(classResponse.data.class.capacity).toBeGreaterThan(0);
```

**学生分配验证**:
```typescript
// 1. 分操作响应验证
const assignResponse = await assignStudentsToClass(classId, studentIds);
const assignFields = ['success', 'data', 'message'];
const assignValidation = validateRequiredFields(assignResponse, assignFields);
expect(assignValidation.valid).toBe(true);

// 2. 分配结果验证
expect(assignResponse.data.assignedCount).toBe(studentIds.length);
expect(assignResponse.data.failedCount).toBe(0);

// 3. 班级学生数更新验证
const classDetail = await getClassDetail(classId);
expect(classDetail.data.studentCount).toBe(assignResponse.data.assignedCount);

// 4. 学生班级关联验证
for (const studentId of studentIds) {
  const studentDetail = await getStudentDetail(studentId);
  expect(studentDetail.data.classId).toBe(classId);
}
```

**预期结果**:
- ✅ 班级创建成功且信息完整
- ✅ 学生分配功能正常工作
- ✅ 教师分配功能正确执行
- ✅ 班级容量限制有效
- ✅ 班级统计信息准确

### TC-023-03: 教师管理API集成测试

**测试步骤**:
1. 创建教师账户
2. 分配班级给教师
3. 分配课程给教师
4. 获取教师工作量
5. 更新教师信息

**API端点**: 
- `POST /api/teachers`
- `GET /api/teachers/:id`
- `PUT /api/teachers/:id`
- `POST /api/teachers/:id/assign-classes`
- `GET /api/teachers/:id/workload`

**严格验证要求**:
```typescript
// 1. 教师创建验证
const teacherResponse = await createTeacher(testTeacher);
const teacherFields = ['success', 'data', 'message'];
const teacherValidation = validateRequiredFields(teacherResponse, teacherFields);
expect(teacherValidation.valid).toBe(true);

// 2. 教师信息字段验证
const teacherInfoFields = ['id', 'name', 'email', 'phone', 'employeeId', 'status'];
const teacherInfoValidation = validateRequiredFields(
  teacherResponse.data.teacher, 
  teacherInfoFields
);
expect(teacherInfoValidation.valid).toBe(true);

// 3. 工号格式验证
expect(teacherResponse.data.teacher.employeeId).toMatch(/^TCH\d{6}$/);

// 4. 联系方式验证
expect(teacherResponse.data.teacher.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
expect(teacherResponse.data.teacher.phone).toMatch(/^1[3-9]\d{9}$/);
```

**工作量统计验证**:
```typescript
// 1. 工作量响应验证
const workloadResponse = await getTeacherWorkload(teacherId);
const workloadFields = ['success', 'data'];
const workloadValidation = validateRequiredFields(workloadResponse, workloadFields);
expect(workloadValidation.valid).toBe(true);

// 2. 工作量字段验证
const workloadDataFields = ['classCount', 'studentCount', 'courseCount', 'weeklyHours'];
const workloadDataValidation = validateRequiredFields(
  workloadResponse.data.workload, 
  workloadDataFields
);
expect(workloadDataValidation.valid).toBe(true);

// 3. 数值类型验证
const workloadTypeValidation = validateFieldTypes(workloadResponse.data.workload, {
  classCount: 'number',
  studentCount: 'number',
  courseCount: 'number',
  weeklyHours: 'number'
});
expect(workloadTypeValidation.valid).toBe(true);

// 4. 数值范围验证
expect(workloadResponse.data.workload.weeklyHours).toBeGreaterThanOrEqual(0);
expect(workloadResponse.data.workload.weeklyHours).toBeLessThanOrEqual(40);
```

**预期结果**:
- ✅ 教师创建成功且工号自动生成
- ✅ 班级分配功能正确执行
- ✅ 课程分配功能正常工作
- ✅ 工作量统计准确
- ✅ 教师信息更新功能完整

### TC-023-04: 课程管理API集成测试

**测试步骤**:
1. 创建课程
2. 安排课程时间
3. 分配教师到课程
4. 分配学生到课程
5. 记录课程成绩

**API端点**: 
- `POST /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses/:id/schedule`
- `POST /api/courses/:id/assign-teacher`
- `POST /api/courses/:id/record-grades`

**严格验证要求**:
```typescript
// 1. 课程创建验证
const courseResponse = await createCourse(testCourse);
const courseFields = ['success', 'data', 'message'];
const courseValidation = validateRequiredFields(courseResponse, courseFields);
expect(courseValidation.valid).toBe(true);

// 2. 课程信息字段验证
const courseInfoFields = ['id', 'name', 'code', 'credits', 'duration', 'status'];
const courseInfoValidation = validateRequiredFields(
  courseResponse.data.course, 
  courseInfoFields
);
expect(courseInfoValidation.valid).toBe(true);

// 3. 课程代码格式验证
expect(courseResponse.data.course.code).toMatch(/^[A-Z]{3}\d{3}$/);

// 4. 学分和时间验证
const courseTypeValidation = validateFieldTypes(courseResponse.data.course, {
  credits: 'number',
  duration: 'number',
  maxStudents: 'number'
});
expect(courseTypeValidation.valid).toBe(true);

// 5. 数值范围验证
expect(courseResponse.data.course.credits).toBeGreaterThan(0);
expect(courseResponse.data.course.credits).toBeLessThanOrEqual(10);
```

**课程安排验证**:
```typescript
// 1. 课程安排响应验证
const scheduleResponse = await scheduleCourse(courseId, scheduleData);
const scheduleFields = ['success', 'data', 'message'];
const scheduleValidation = validateRequiredFields(scheduleResponse, scheduleFields);
expect(scheduleValidation.valid).toBe(true);

// 2. 安排时间验证
const scheduleDataFields = ['startTime', 'endTime', 'dayOfWeek', 'classroom'];
const scheduleDataValidation = validateRequiredFields(
  scheduleResponse.data.schedule, 
  scheduleDataFields
);
expect(scheduleDataValidation.valid).toBe(true);

// 3. 时间格式验证
const timeValidation = validateDateFormat(scheduleResponse.data.schedule.startTime);
expect(timeValidation).toBe(true);

// 4. 星期验证
expect(scheduleResponse.data.schedule.dayOfWeek).toBeGreaterThanOrEqual(1);
expect(scheduleResponse.data.schedule.dayOfWeek).toBeLessThanOrEqual(7);
```

**预期结果**:
- ✅ 课程创建成功且代码自动生成
- ✅ 课程时间安排功能正常
- ✅ 教师分配功能正确执行
- ✅ 学生选课功能正常工作
- ✅ 成绩记录功能完整

### TC-023-05: 考勤管理API集成测试

**测试步骤**:
1. 记录学生考勤
2. 批量考勤操作
3. 查询考勤统计
4. 处理考勤异常
5. 生成考勤报告

**API端点**: 
- `POST /api/attendance/record`
- `GET /api/attendance/statistics`
- `POST /api/attendance/batch-record`
- `GET /api/attendance/exceptions`

**严格验证要求**:
```typescript
// 1. 考勤记录验证
const attendanceResponse = await recordAttendance(attendanceData);
const attendanceFields = ['success', 'data', 'message'];
const attendanceValidation = validateRequiredFields(attendanceResponse, attendanceFields);
expect(attendanceValidation.valid).toBe(true);

// 2. 考勤记录字段验证
const recordFields = ['id', 'studentId', 'date', 'status', 'recordedBy'];
const recordValidation = validateRequiredFields(
  attendanceResponse.data.record, 
  recordFields
);
expect(recordValidation.valid).toBe(true);

// 3. 考勤状态枚举验证
const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
expect(validStatuses).toContain(attendanceResponse.data.record.status);

// 4. 日期格式验证
const dateValidation = validateDateFormat(attendanceResponse.data.record.date);
expect(dateValidation).toBe(true);
```

**考勤统计验证**:
```typescript
// 1. 统计响应验证
const statsResponse = await getAttendanceStatistics(classId, dateRange);
const statsFields = ['success', 'data'];
const statsValidation = validateRequiredFields(statsResponse, statsFields);
expect(statsValidation.valid).toBe(true);

// 2. 统计数据字段验证
const statisticsFields = ['totalDays', 'presentDays', 'absentDays', 'lateDays', 'attendanceRate'];
const statisticsValidation = validateRequiredFields(
  statsResponse.data.statistics, 
  statisticsFields
);
expect(statisticsValidation.valid).toBe(true);

// 3. 数值类型验证
const statsTypeValidation = validateFieldTypes(statsResponse.data.statistics, {
  totalDays: 'number',
  presentDays: 'number',
  absentDays: 'number',
  lateDays: 'number',
  attendanceRate: 'number'
});
expect(statsTypeValidation.valid).toBe(true);

// 4. 出勤率范围验证
expect(statsResponse.data.statistics.attendanceRate).toBeGreaterThanOrEqual(0);
expect(statsResponse.data.statistics.attendanceRate).toBeLessThanOrEqual(100);
```

**预期结果**:
- ✅ 考勤记录功能正常工作
- ✅ 批量考勤操作高效执行
- ✅ 考勤统计数据准确
- ✅ 考勤异常处理完善
- ✅ 考勤报告生成完整

---

## 🚨 错误场景测试

### 场景1: 班级容量超限
- **模拟**: 分配超过班级容量的学生
- **验证**: 容量限制检查
- **预期**: 返回400状态码和容量限制错误信息

### 场景2: 重复时间安排
- **模拟**: 在相同时间安排同一教室的多门课程
- **验证**: 时间冲突检测
- **预期**: 返回400状态码和时间冲突信息

### 场景3: 无效的考勤状态
- **模拟**: 提交无效的考勤状态值
- **验证**: 数据验证规则
- **预期**: 返回400状态码和验证错误信息

### 场景4: 权限不足操作
- **模拟**: 无权限用户尝试修改他人信息
- **验证**: 权限控制机制
- **预期**: 返回403状态码和权限错误信息

---

## 🔧 技术要求

### API请求格式
```typescript
// 学生创建请求
interface CreateStudentRequest {
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  parentIds?: string[];
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// 班级创建请求
interface CreateClassRequest {
  name: string;
  grade: number;
  capacity: number;
  classroom?: string;
  description?: string;
}
```

### 响应格式验证
```typescript
// 学生列表响应
interface StudentListResponse {
  success: boolean;
  data: {
    items: Student[];
    total: number;
    page: number;
    pageSize: number;
  };
}

// 考勤统计响应
interface AttendanceStatsResponse {
  success: boolean;
  data: {
    statistics: {
      totalDays: number;
      presentDays: number;
      absentDays: number;
      lateDays: number;
      attendanceRate: number;
    };
  };
}
```

---

## 📊 测试数据

### 测试班级结构
```typescript
const testClassStructure = {
  grade: 1,
  capacity: 30,
  maxStudentsPerTeacher: 20,
  subjects: ['语文', '数学', '英语', '音乐', '美术', '体育']
};
```

---

## ✅ 验收标准

1. ✅ 所有教育管理API端点正常响应
2. ✅ 数据结构验证通过率100%
3. ✅ 字段类型验证通过率100%
4. ✅ 业务逻辑验证正确
5. ✅ 数据关联关系正确
6. ✅ 权限控制机制有效
7. ✅ 数据验证规则生效
8. ✅ 统计计算准确

---

## 📝 测试报告模板

```typescript
interface EducationManagementAPITestReport {
  testId: 'TC-023';
  testDate: string;
  testEnvironment: string;
  results: {
    studentManagement: TestResult;
    classManagement: TestResult;
    teacherManagement: TestResult;
    courseManagement: TestResult;
    attendanceManagement: TestResult;
    errorHandling: TestResult;
  };
  performance: {
    averageResponseTime: number;
    maxResponseTime: number;
    batchSizePerformance: number;
  };
  dataValidation: {
    studentDataValidation: boolean;
    classCapacityValidation: boolean;
    scheduleConflictValidation: boolean;
    attendanceAccuracy: boolean;
  };
  businessLogic: {
    studentClassAssignment: boolean;
    teacherWorkloadCalculation: boolean;
    courseScheduling: boolean;
    attendanceStatistics: boolean;
  };
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
}
```

---

## 🚀 执行指南

1. **环境准备**: 创建测试班级、教师、学生数据
2. **权限准备**: 准备不同角色的测试账户
3. **数据关联**: 建立测试数据间的关联关系
4. **执行顺序**: 按照依赖关系顺序执行测试
5. **状态验证**: 每个操作后验证业务状态
6. **数据清理**: 测试完成后清理测试数据

---

**创建日期**: 2025-11-24  
**最后更新**: 2025-11-24  
**版本**: 1.0  
**状态**: 待执行