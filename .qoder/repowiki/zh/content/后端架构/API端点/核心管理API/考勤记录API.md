# 考勤记录API

<cite>
**本文档引用文件**  
- [attendance.ts](file://client/src/api/modules/attendance.ts)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts)
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts)
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts)
- [teacher-attendance.routes.ts](file://server/src/routes/teacher-attendance.routes.ts)
- [attendance-center.routes.ts](file://server/src/routes/attendance-center.routes.ts)
- [teacher-attendance.model.ts](file://server/src/models/teacher-attendance.model.ts)
</cite>

## 目录
1. [简介](#简介)
2. [API端点概览](#api端点概览)
3. [核心数据结构](#核心数据结构)
4. [教师考勤API](#教师考勤api)
5. [考勤中心API](#考勤中心api)
6. [请求/响应示例](#请求响应示例)
7. [前端调用示例](#前端调用示例)
8. [异常处理与验证规则](#异常处理与验证规则)

## 简介

本API文档详细描述了幼儿园管理系统中的考勤记录功能，涵盖日常打卡、请假申请、出勤统计和异常处理等核心功能。API分为教师端和管理员端两个部分，分别满足日常考勤管理和全园数据分析的需求。

**Section sources**
- [attendance.ts](file://client/src/api/modules/attendance.ts)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts)

## API端点概览

### 教师考勤API端点
教师考勤API用于日常考勤管理，基础路径为 `/api/teacher/attendance`。

```mermaid
flowchart TD
A[教师考勤API] --> B[获取负责班级]
A --> C[获取班级学生]
A --> D[获取考勤记录]
A --> E[批量创建考勤]
A --> F[更新考勤记录]
A --> G[获取统计信息]
A --> H[导出考勤报表]
```

**Diagram sources**
- [attendance.ts](file://client/src/api/endpoints/attendance.ts#L9-L30)

### 考勤中心API端点
考勤中心API用于全园考勤管理，基础路径为 `/attendance-center`。

```mermaid
flowchart TD
A[考勤中心API] --> B[获取全园概览]
A --> C[获取各类统计]
A --> D[管理所有考勤记录]
A --> E[异常考勤分析]
A --> F[健康监测数据]
A --> G[批量导入考勤]
```

**Diagram sources**
- [attendance.ts](file://client/src/api/endpoints/attendance.ts#L37-L91)

## 核心数据结构

### 考勤状态定义

考勤状态枚举定义了学生出勤的各种状态：

| 状态 | 说明 |
|------|------|
| PRESENT | 正常出勤 |
| ABSENT | 缺勤 |
| LATE | 迟到 |
| EARLY_LEAVE | 早退 |
| SICK_LEAVE | 病假 |
| PERSONAL_LEAVE | 事假 |

**Section sources**
- [attendance.ts](file://client/src/api/modules/attendance.ts#L13-L20)

### 健康状态定义

健康状态枚举用于记录学生的健康状况：

| 状态 | 说明 |
|------|------|
| NORMAL | 正常 |
| FEVER | 发烧 |
| COUGH | 咳嗽 |
| COLD | 感冒 |
| OTHER | 其他 |

**Section sources**
- [attendance.ts](file://client/src/api/modules/attendance.ts#L25-L31)

### 考勤记录模型

考勤记录模型定义了考勤数据的结构：

```mermaid
classDiagram
class AttendanceRecord {
+id : number
+studentId : number
+classId : number
+kindergartenId : number
+attendanceDate : string
+status : AttendanceStatus
+checkInTime? : string
+checkOutTime? : string
+temperature? : number
+healthStatus? : HealthStatus
+notes? : string
+leaveReason? : string
+recordedBy : number
+createdAt : string
+updatedAt : string
}
```

**Diagram sources**
- [attendance.ts](file://client/src/api/modules/attendance.ts#L60-L79)

## 教师考勤API

### 获取教师负责的班级列表

获取当前登录教师负责的所有班级。

**HTTP方法**: `GET`  
**URL路径**: `/api/teacher/attendance/classes`  
**请求头**: `Authorization: Bearer <token>`  
**响应格式**: JSON

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "小班A",
      "studentCount": 25,
      "kindergartenId": 1
    }
  ]
}
```

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L20-L73)
- [teacher-attendance.routes.ts](file://server/src/routes/teacher-attendance.routes.ts#L347)

### 获取班级学生列表

获取指定班级的所有学生信息。

**HTTP方法**: `GET`  
**URL路径**: `/api/teacher/attendance/students/{classId}`  
**请求头**: `Authorization: Bearer <token>`  
**路径参数**: `classId` - 班级ID  
**响应格式**: JSON

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "张小明",
      "studentNumber": "ST001",
      "gender": "男",
      "classId": 1
    }
  ]
}
```

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L87-L137)
- [teacher-attendance.routes.ts](file://server/src/routes/teacher-attendance.routes.ts#L426)

### 批量创建考勤记录

为指定班级的学生批量创建考勤记录。

**HTTP方法**: `POST`  
**URL路径**: `/api/teacher/attendance/records`  
**请求头**: `Authorization: Bearer <token>`  
**请求体**:
```json
{
  "classId": 1,
  "kindergartenId": 1,
  "attendanceDate": "2024-01-15",
  "records": [
    {
      "studentId": 123,
      "status": "PRESENT",
      "checkInTime": "08:30:00",
      "temperature": 36.5,
      "healthStatus": "NORMAL",
      "notes": "状态良好"
    }
  ]
}
```

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "successCount": 25,
    "records": [...]
  },
  "message": "成功创建 25 条考勤记录"
}
```

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L227-L282)
- [teacher-attendance.routes.ts](file://server/src/routes/teacher-attendance.routes.ts#L707)

### 更新考勤记录

更新指定的考勤记录（教师只能修改当天的记录）。

**HTTP方法**: `PUT`  
**URL路径**: `/api/teacher/attendance/records/{id}`  
**请求头**: `Authorization: Bearer <token>`  
**路径参数**: `id` - 考勤记录ID  
**请求体**:
```json
{
  "status": "EARLY_LEAVE",
  "checkOutTime": "15:30:00",
  "notes": "家长提前接走",
  "changeReason": "家长有事提前接孩子"
}
```

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "EARLY_LEAVE",
    "checkOutTime": "15:30:00",
    "notes": "家长提前接走",
    "updatedAt": "2024-01-15T15:35:00.000Z"
  },
  "message": "考勤记录更新成功"
}
```

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L302-L372)
- [teacher-attendance.routes.ts](file://server/src/routes/teacher-attendance.routes.ts#L709-L785)

### 获取本班统计数据

获取指定班级的考勤统计数据。

**HTTP方法**: `GET`  
**URL路径**: `/api/teacher/attendance/statistics`  
**请求头**: `Authorization: Bearer <token>`  
**查询参数**: 
- `classId`: 班级ID
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "totalRecords": 25,
    "presentCount": 23,
    "absentCount": 2,
    "lateCount": 1,
    "earlyLeaveCount": 0,
    "sickLeaveCount": 1,
    "personalLeaveCount": 0,
    "attendanceRate": 92.00
  }
}
```

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L392-L481)
- [attendance.ts](file://client/src/api/modules/attendance.ts#L206-L210)

## 考勤中心API

### 获取全园概览

获取全园的考勤概览数据。

**HTTP方法**: `GET`  
**URL路径**: `/attendance-center/overview`  
**请求头**: `Authorization: Bearer <token>`  
**查询参数**: 
- `kindergartenId`: 幼儿园ID
- `date`: 日期（可选）

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "totalRecords": 100,
    "presentCount": 95,
    "absentCount": 5,
    "lateCount": 3,
    "earlyLeaveCount": 2,
    "sickLeaveCount": 4,
    "personalLeaveCount": 1,
    "attendanceRate": 95.00,
    "abnormalTemperature": 2
  }
}
```

**Section sources**
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts#L19-L74)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts#L254-L258)

### 获取月度统计

获取指定月份的考勤统计。

**HTTP方法**: `GET`  
**URL路径**: `/attendance-center/statistics/monthly`  
**请求头**: `Authorization: Bearer <token>`  
**查询参数**: 
- `kindergartenId`: 幼儿园ID
- `year`: 年份
- `month`: 月份

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "totalRecords": 2000,
    "presentCount": 1900,
    "monthlyAttendanceRate": 95.00,
    "dailyData": [
      {
        "date": "2024-01-01",
        "totalRecords": 100,
        "presentCount": 98,
        "absentCount": 2,
        "attendanceRate": 98.00
      }
    ]
  }
}
```

**Section sources**
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts#L227-L290)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts#L288-L293)

### 批量导入考勤

园长权限下批量导入考勤记录。

**HTTP方法**: `POST`  
**URL路径**: `/api/attendance-center/import`  
**请求头**: `Authorization: Bearer <token>`  
**请求体**:
```json
{
  "records": [
    {
      "studentId": 123,
      "classId": 1,
      "kindergartenId": 1,
      "attendanceDate": "2024-01-15",
      "status": "PRESENT",
      "checkInTime": "08:30:00"
    }
  ]
}
```

**响应格式**: JSON

```json
{
  "success": true,
  "data": {
    "successCount": 50,
    "failureCount": 2,
    "errors": ["学生123在2024-01-15的记录已存在"]
  }
}
```

**Section sources**
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts#L784-L823)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts#L419-L423)

## 请求/响应示例

### 单日考勤记录示例

**请求**:
```json
GET /api/teacher/attendance/records?classId=1&attendanceDate=2024-01-15 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1001,
        "studentId": 123,
        "studentName": "张小明",
        "classId": 1,
        "className": "小班A",
        "attendanceDate": "2024-01-15",
        "status": "PRESENT",
        "checkInTime": "08:30:00",
        "temperature": 36.5,
        "healthStatus": "NORMAL",
        "recordedByName": "李老师"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20
  }
}
```

### 月度统计报表示例

**请求**:
```json
GET /attendance-center/statistics/monthly?kindergartenId=1&year=2024&month=1 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应**:
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "month": 1,
    "totalRecords": 2000,
    "presentCount": 1900,
    "monthlyAttendanceRate": 95.00,
    "dailyData": [
      {
        "date": "2024-01-01",
        "totalRecords": 100,
        "presentCount": 98,
        "absentCount": 2,
        "attendanceRate": 98.00
      },
      {
        "date": "2024-01-02",
        "totalRecords": 100,
        "presentCount": 97,
        "absentCount": 3,
        "attendanceRate": 97.00
      }
    ]
  }
}
```

**Section sources**
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts#L227-L290)
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts#L151-L213)

## 前端调用示例

### Vue组件中使用Axios

```vue
<template>
  <div>
    <h2>考勤管理</h2>
    <select v-model="selectedClass" @change="loadStudents">
      <option v-for="cls in classes" :key="cls.id" :value="cls.id">
        {{ cls.name }} ({{ cls.studentCount }}人)
      </option>
    </select>
    
    <table>
      <thead>
        <tr>
          <th>姓名</th>
          <th>学号</th>
          <th>考勤状态</th>
          <th>签到时间</th>
          <th>体温</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.name }}</td>
          <td>{{ student.studentNumber }}</td>
          <td>
            <select v-model="attendance[student.id].status">
              <option value="PRESENT">出勤</option>
              <option value="ABSENT">缺勤</option>
              <option value="LATE">迟到</option>
              <option value="EARLY_LEAVE">早退</option>
            </select>
          </td>
          <td><input v-model="attendance[student.id].checkInTime" type="time"></td>
          <td><input v-model="attendance[student.id].temperature" type="number" step="0.1" min="35" max="42"></td>
        </tr>
      </tbody>
    </table>
    
    <button @click="submitAttendance">提交考勤</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  getTeacherClasses, 
  getClassStudents, 
  createAttendanceRecords 
} from '@/api/modules/attendance';

const classes = ref([]);
const students = ref([]);
const selectedClass = ref('');
const attendance = ref({});

// 获取教师负责的班级
const loadClasses = async () => {
  try {
    const response = await getTeacherClasses();
    classes.value = response.data;
    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0].id;
      loadStudents();
    }
  } catch (error) {
    console.error('获取班级列表失败:', error);
  }
};

// 获取班级学生
const loadStudents = async () => {
  if (!selectedClass.value) return;
  
  try {
    const response = await getClassStudents(selectedClass.value);
    students.value = response.data;
    
    // 初始化考勤数据
    attendance.value = {};
    students.value.forEach(student => {
      attendance.value[student.id] = {
        studentId: student.id,
        status: 'PRESENT',
        checkInTime: '',
        temperature: null,
        healthStatus: 'NORMAL',
        notes: ''
      };
    });
  } catch (error) {
    console.error('获取学生列表失败:', error);
  }
};

// 提交考勤
const submitAttendance = async () => {
  const records = Object.values(attendance.value);
  
  const payload = {
    classId: selectedClass.value,
    kindergartenId: 1, // 实际应用中从用户信息获取
    attendanceDate: new Date().toISOString().split('T')[0],
    records: records
  };
  
  try {
    const response = await createAttendanceRecords(payload);
    alert(`成功创建 ${response.data.successCount} 条考勤记录`);
  } catch (error) {
    console.error('提交考勤失败:', error);
    alert('提交考勤失败，请重试');
  }
};

onMounted(() => {
  loadClasses();
});
</script>
```

### 考勤日历视图集成

```vue
<template>
  <div class="attendance-calendar">
    <div class="calendar-header">
      <button @click="prevMonth">❮</button>
      <h3>{{ currentMonth }}</h3>
      <button @click="nextMonth">❯</button>
    </div>
    
    <div class="calendar-weekdays">
      <div>日</div>
      <div>一</div>
      <div>二</div>
      <div>三</div>
      <div>四</div>
      <div>五</div>
      <div>六</div>
    </div>
    
    <div class="calendar-days">
      <div 
        v-for="day in days" 
        :key="day.date" 
        :class="['calendar-day', { 'today': day.isToday }]"
      >
        <div class="day-number">{{ day.day }}</div>
        <div v-if="day.attendance" class="attendance-status" 
             :class="getStatusClass(day.attendance.status)">
          {{ getStatusText(day.attendance.status) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAttendanceRecords } from '@/api/modules/attendance';

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const attendanceData = ref({});

// 获取当前月份的天数
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
});

// 获取当前月份的第一天是星期几
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay();
});

// 生成日历天数
const days = computed(() => {
  const result = [];
  
  // 添加上个月的空白天
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    result.push({ day: '', date: '', attendance: null });
  }
  
  // 添加当前月份的天数
  for (let i = 1; i <= daysInMonth.value; i++) {
    const date = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    result.push({ 
      day: i, 
      date: date, 
      attendance: attendanceData.value[date],
      isToday: date === new Date().toISOString().split('T')[0]
    });
  }
  
  return result;
});

// 获取当前月份名称
const currentMonth = computed(() => {
  return `${currentYear.value}年${currentMonth.value + 1}月`;
});

// 获取考勤数据
const loadAttendanceData = async () => {
  try {
    const startDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-01`;
    const endDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(daysInMonth.value).padStart(2, '0')}`;
    
    const response = await getAttendanceRecords({
      classId: 1, // 实际应用中从选择获取
      startDate,
      endDate
    });
    
    // 按日期组织考勤数据
    attendanceData.value = {};
    response.data.rows.forEach(record => {
      attendanceData.value[record.attendanceDate] = record;
    });
  } catch (error) {
    console.error('获取考勤数据失败:', error);
  }
};

// 月份导航
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadAttendanceData();
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadAttendanceData();
};

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case 'PRESENT': return 'present';
    case 'ABSENT': return 'absent';
    case 'LATE': return 'late';
    case 'EARLY_LEAVE': return 'early-leave';
    default: return '';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'PRESENT': return '出勤';
    case 'ABSENT': return '缺勤';
    case 'LATE': return '迟到';
    case 'EARLY_LEAVE': return '早退';
    default: return '';
  }
};

onMounted(() => {
  loadAttendanceData();
});
</script>

<style scoped>
.attendance-calendar {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

.calendar-header h3 {
  margin: 0;
  color: #333;
}

.calendar-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.calendar-header button:hover {
  color: #007bff;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.calendar-weekdays div {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
}

.calendar-day {
  background-color: #fff;
  min-height: 100px;
  padding: 0.5rem;
  position: relative;
}

.calendar-day.today {
  background-color: #e3f2fd;
}

.day-number {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.attendance-status {
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  text-align: center;
  margin-top: 0.2rem;
}

.attendance-status.present {
  background-color: #d4edda;
  color: #155724;
}

.attendance-status.absent {
  background-color: #f8d7da;
  color: #721c24;
}

.attendance-status.late {
  background-color: #fff3cd;
  color: #856404;
}

.attendance-status.early-leave {
  background-color: #d1ecf1;
  color: #0c5460;
}
</style>
```

**Section sources**
- [attendance.ts](file://client/src/api/modules/attendance.ts)
- [attendance-center.ts](file://client/src/api/modules/attendance-center.ts)

## 异常处理与验证规则

### 时间验证规则

1. **签到时间验证**:
   - 必须符合 `HH:mm:ss` 格式
   - 不能早于当天00:00:00
   - 不能晚于当天23:59:59

2. **签退时间验证**:
   - 必须晚于签到时间
   - 不能早于签到时间

3. **日期验证**:
   - 考勤日期不能为未来日期
   - 教师只能修改当天的考勤记录

### 自动计算逻辑

1. **出勤率计算**:
   ```
   出勤率 = (出勤人数 / 总人数) × 100%
   ```

2. **工作时长计算**:
   ```
   工作时长 = 签退时间 - 签到时间
   ```

3. **迟到判断**:
   - 签到时间晚于规定上班时间
   - 迟到时长 = 签到时间 - 规定上班时间

4. **早退判断**:
   - 签退时间早于规定下班时间
   - 早退时长 = 规定下班时间 - 签退时间

### 异常处理

1. **重复记录处理**:
   - 同一学生同一天的考勤记录只能有一条
   - 创建时检查是否已存在记录

2. **权限验证**:
   - 教师只能管理自己负责的班级
   - 园长可以管理全园考勤记录

3. **数据完整性验证**:
   - 必填字段验证
   - 数据类型验证
   - 范围验证（如体温35-42℃）

**Section sources**
- [teacher-attendance.controller.ts](file://server/src/controllers/teacher-attendance.controller.ts)
- [attendance-center.controller.ts](file://server/src/controllers/attendance-center.controller.ts)
- [teacher-attendance.model.ts](file://server/src/models/teacher-attendance.model.ts)