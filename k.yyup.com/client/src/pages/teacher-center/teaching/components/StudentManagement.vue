<template>
  <div class="student-management">
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="选择班级" clearable style="max-width: 150px; width: 100%">
            <el-option label="全部班级" value="" />
            <el-option label="大班A" value="1" />
            <el-option label="中班B" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="filterForm.gender" placeholder="选择性别" clearable style="max-width: 120px; width: 100%">
            <el-option label="全部" value="" />
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索学生姓名"
            clearable
            style="max-width: 200px; width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <UnifiedIcon name="Search" />
            搜索
          </el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 学生卡片列表 -->
    <div class="student-cards" v-loading="loading">
      <el-row :gutter="24">
        <el-col 
          v-for="student in filteredStudents" 
          :key="student.id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card class="student-card" shadow="hover">
            <div class="student-avatar">
              <el-avatar :size="60" :src="student.avatar">
                <UnifiedIcon name="default" />
              </el-avatar>
            </div>
            
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-meta">
                <el-tag :type="student.gender === '男' ? 'primary' : 'danger'" size="small">
                  {{ student.gender }}
                </el-tag>
                <span class="student-age">{{ student.age }}岁</span>
              </div>
              <div class="student-class">{{ student.className }}</div>
            </div>
            
            <div class="student-stats">
              <div class="stat-item">
                <div class="stat-value">{{ student.attendance }}%</div>
                <div class="stat-label">出勤率</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" :class="getPerformanceClass(student.performance)">
                  {{ student.performance }}
                </div>
                <div class="stat-label">表现</div>
              </div>
            </div>
            
            <div class="student-actions">
              <el-button size="small" @click="handleViewStudent(student)">
                查看详情
              </el-button>
              <el-dropdown @command="(command) => handleDropdownCommand(command, student)">
                <el-button size="small">
                  更多<UnifiedIcon name="default" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="attendance">考勤记录</el-dropdown-item>
                    <el-dropdown-item command="performance">学习表现</el-dropdown-item>
                    <el-dropdown-item command="contact">联系家长</el-dropdown-item>
                    <el-dropdown-item command="note">添加备注</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <div v-if="filteredStudents.length === 0" class="empty-state">
        <el-empty description="暂无学生数据" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[12, 24, 48]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 学生详情弹窗 -->
    <el-dialog
      v-model="studentDetailVisible"
      title="学生详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentStudent" class="student-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentStudent.avatar">
            <UnifiedIcon name="default" />
          </el-avatar>
          <div class="detail-info">
            <div class="detail-name">{{ currentStudent.name }}</div>
            <div class="detail-meta">
              <el-tag :type="currentStudent.gender === '男' ? 'primary' : 'danger'" size="small">
                {{ currentStudent.gender }}
              </el-tag>
              <span>{{ currentStudent.age }}岁</span>
              <span>{{ currentStudent.className }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学号">
            {{ currentStudent.studentId || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="入学日期">
            {{ formatDate(currentStudent.enrollmentDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="出勤率">
            {{ currentStudent.attendance }}%
          </el-descriptions-item>
          <el-descriptions-item label="学习表现">
            <el-tag :type="getPerformanceType(currentStudent.performance)" size="small">
              {{ currentStudent.performance }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="家长姓名">
            {{ currentStudent.parentName || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentStudent.parentPhone || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="家庭地址" span="2">
            {{ currentStudent.address || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注信息" span="2">
            {{ currentStudent.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="left">最近表现记录</el-divider>
        <div class="performance-records">
          <div 
            v-for="record in currentStudent.performanceRecords || []" 
            :key="record.id"
            class="performance-record"
          >
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-content">{{ record.content }}</div>
            <el-tag :type="getPerformanceType(record.level)" size="small">
              {{ record.level }}
            </el-tag>
          </div>
          <div v-if="!currentStudent.performanceRecords || currentStudent.performanceRecords.length === 0">
            <el-empty description="暂无表现记录" :image-size="60" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="studentDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditStudent(currentStudent)">编辑信息</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  User,
  ArrowDown
} from '@element-plus/icons-vue'

interface Student {
  id: number
  name: string
  className: string
  age: number
  gender: '男' | '女'
  attendance: number
  performance: '优秀' | '良好' | '一般' | '需改进'
  avatar?: string
  studentId?: string
  enrollmentDate?: string
  parentName?: string
  parentPhone?: string
  address?: string
  notes?: string
  performanceRecords?: Array<{
    id: number
    date: string
    content: string
    level: '优秀' | '良好' | '一般' | '需改进'
  }>
}

interface Props {
  students: Student[]
}

interface Emits {
  (e: 'view-student', student: Student): void
  (e: 'edit-student', student: Student): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const studentDetailVisible = ref(false)
const currentStudent = ref<Student | null>(null)

const filterForm = reactive({
  classId: '',
  gender: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 12,
  total: 0
})

// 计算属性
const filteredStudents = computed(() => {
  let result = props.students
  
  if (filterForm.classId) {
    result = result.filter(student => 
      student.className.includes(filterForm.classId === '1' ? '大班A' : '中班B')
    )
  }
  
  if (filterForm.gender) {
    result = result.filter(student => student.gender === filterForm.gender)
  }
  
  if (filterForm.keyword) {
    result = result.filter(student => 
      student.name.toLowerCase().includes(filterForm.keyword.toLowerCase())
    )
  }
  
  // 分页处理
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  pagination.total = result.length
  
  return result.slice(start, end)
})

// 方法
const handleFilter = () => {
  pagination.page = 1
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    classId: '',
    gender: '',
    keyword: ''
  })
  pagination.page = 1
}

const handleViewStudent = (student: Student) => {
  currentStudent.value = student
  studentDetailVisible.value = true
  emit('view-student', student)
}

const handleEditStudent = (student: Student) => {
  emit('edit-student', student)
}

const handleDropdownCommand = (command: string, student: Student) => {
  switch (command) {
    case 'attendance':
      ElMessage.info(`查看${student.name}的考勤记录`)
      break
    case 'performance':
      ElMessage.info(`查看${student.name}的学习表现`)
      break
    case 'contact':
      ElMessage.info(`联系${student.name}的家长`)
      break
    case 'note':
      ElMessage.info(`为${student.name}添加备注`)
      break
  }
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

// 工具方法
const getPerformanceClass = (performance: string) => {
  const classMap = {
    '优秀': 'excellent',
    '良好': 'good',
    '一般': 'average',
    '需改进': 'poor'
  }
  return classMap[performance] || 'average'
}

const getPerformanceType = (performance: string) => {
  const typeMap = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '需改进': 'danger'
  }
  return typeMap[performance] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.student-management {
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background-color: #f9fafb;
    border-radius: var(--spacing-sm);
  }
  
  .student-cards {
    .student-card {
      text-align: center;
      margin-bottom: var(--text-2xl);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(var(--transform-hover-lift));
        box-shadow: 0 var(--spacing-sm) 25px var(--shadow-light);
      }
      
      .student-avatar {
        margin-bottom: var(--text-lg);
      }
      
      .student-info {
        margin-bottom: var(--text-lg);
        
        .student-name {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .student-meta {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
          
          .student-age {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
        
        .student-class {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
      
      .student-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: var(--text-lg);
        
        .stat-item {
          text-align: center;
          
          .stat-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            
            &.excellent {
              color: var(--success-color);
            }
            
            &.good {
              color: var(--primary-color);
            }
            
            &.average {
              color: var(--warning-color);
            }
            
            &.poor {
              color: var(--danger-color);
            }
          }
          
          .stat-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }
      
      .student-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
      }
    }
  }
  
  .empty-state {
    padding: var(--spacing-10xl);
    text-align: center;
  }
  
  .pagination {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: center;
  }
  
  .student-detail {
    .detail-header {
      display: flex;
      align-items: center;
      gap: var(--text-2xl);
      
      .detail-info {
        flex: 1;
        
        .detail-name {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }
        
        .detail-meta {
          display: flex;
          align-items: center;
          gap: var(--text-sm);
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }
    
    .performance-records {
      .performance-record {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-sm);
        background-color: #f9fafb;
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-sm);
        
        .record-date {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          min-width: auto;
        }
        
        .record-content {
          flex: 1;
          margin: 0 var(--text-lg);
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .student-management {
    .student-cards {
      .student-card {
        .student-actions {
          flex-direction: column;
          
          .el-button {
            width: 100%;
          }
        }
      }
    }
    
    .student-detail {
      .detail-header {
        flex-direction: column;
        text-align: center;
        gap: var(--text-lg);
      }
      
      .performance-records {
        .performance-record {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>
