<template>
  <div class="class-management">
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="年级">
          <el-select v-model="filterForm.grade" placeholder="选择年级" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="小班" value="小班" />
            <el-option label="中班" value="中班" />
            <el-option label="大班" value="大班" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索班级名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 班级卡片列表 -->
    <div class="class-cards" v-loading="loading">
      <el-row :gutter="20">
        <el-col
          v-for="classItem in filteredClasses"
          :key="classItem.id"
          :xs="24" :sm="12" :md="12" :lg="8" :xl="6"
        >
          <el-card class="class-card" shadow="hover">
            <div class="class-header">
              <div class="class-name">{{ classItem.name }}</div>
              <el-tag :type="getGradeType(classItem.grade)" size="small">
                {{ classItem.grade }}
              </el-tag>
            </div>
            
            <div class="class-info">
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ classItem.studentCount }}名学生</span>
              </div>
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <span>{{ classItem.classroom }}</span>
              </div>
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>{{ classItem.schedule }}</span>
              </div>
            </div>
            
            <div class="class-progress">
              <div class="progress-label">教学进度</div>
              <el-progress 
                :percentage="classItem.progress || 0" 
                :stroke-width="6"
                :show-text="false"
              />
              <span class="progress-text">{{ classItem.progress || 0 }}%</span>
            </div>
            
            <div class="class-actions">
              <el-button size="small" @click="handleViewClass(classItem)">
                查看详情
              </el-button>
              <el-button size="small" @click="handleViewStudents(classItem)">
                学生列表
              </el-button>
              <el-dropdown @command="(command) => handleDropdownCommand(command, classItem)">
                <el-button size="small">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="schedule">课程表</el-dropdown-item>
                    <el-dropdown-item command="progress">教学进度</el-dropdown-item>
                    <el-dropdown-item command="records">教学记录</el-dropdown-item>
                    <el-dropdown-item command="attendance">考勤统计</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <div v-if="filteredClasses.length === 0" class="empty-state">
        <el-empty description="暂无班级数据" />
      </div>
    </div>

    <!-- 班级详情弹窗 -->
    <el-dialog
      v-model="classDetailVisible"
      title="班级详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentClass" class="class-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="班级名称">
            {{ currentClass.name }}
          </el-descriptions-item>
          <el-descriptions-item label="年级">
            {{ currentClass.grade }}
          </el-descriptions-item>
          <el-descriptions-item label="学生人数">
            {{ currentClass.studentCount }}名
          </el-descriptions-item>
          <el-descriptions-item label="教室">
            {{ currentClass.classroom }}
          </el-descriptions-item>
          <el-descriptions-item label="上课时间" span="2">
            {{ currentClass.schedule }}
          </el-descriptions-item>
          <el-descriptions-item label="班主任">
            {{ currentClass.headTeacher || '未分配' }}
          </el-descriptions-item>
          <el-descriptions-item label="副班主任">
            {{ currentClass.assistantTeacher || '未分配' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider content-position="left">最近教学记录</el-divider>
        <div class="recent-records">
          <div 
            v-for="record in currentClass.recentRecords || []" 
            :key="record.id"
            class="record-item"
          >
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-content">{{ record.content }}</div>
            <div class="record-attendance">出勤: {{ record.attendance }}人</div>
          </div>
          <div v-if="!currentClass.recentRecords || currentClass.recentRecords.length === 0">
            <el-empty description="暂无教学记录" :image-size="80" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="classDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditClass(currentClass)">编辑班级</el-button>
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
  Location,
  Clock,
  ArrowDown
} from '@element-plus/icons-vue'

interface ClassItem {
  id: number
  name: string
  grade: string
  studentCount: number
  classroom: string
  schedule: string
  progress?: number
  headTeacher?: string
  assistantTeacher?: string
  recentRecords?: Array<{
    id: number
    date: string
    content: string
    attendance: number
  }>
}

interface Props {
  classes: ClassItem[]
}

interface Emits {
  (e: 'view-class', classItem: ClassItem): void
  (e: 'edit-class', classItem: ClassItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const classDetailVisible = ref(false)
const currentClass = ref<ClassItem | null>(null)

const filterForm = reactive({
  grade: '',
  keyword: ''
})

// 计算属性
const filteredClasses = computed(() => {
  let result = props.classes
  
  if (filterForm.grade) {
    result = result.filter(item => item.grade === filterForm.grade)
  }
  
  if (filterForm.keyword) {
    result = result.filter(item => 
      item.name.toLowerCase().includes(filterForm.keyword.toLowerCase())
    )
  }
  
  return result
})

// 方法
const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    grade: '',
    keyword: ''
  })
}

const handleViewClass = (classItem: ClassItem) => {
  currentClass.value = classItem
  classDetailVisible.value = true
  emit('view-class', classItem)
}

const handleEditClass = (classItem: ClassItem) => {
  emit('edit-class', classItem)
}

const handleViewStudents = (classItem: ClassItem) => {
  ElMessage.info(`查看${classItem.name}的学生列表`)
}

const handleDropdownCommand = (command: string, classItem: ClassItem) => {
  switch (command) {
    case 'schedule':
      ElMessage.info(`查看${classItem.name}的课程表`)
      break
    case 'progress':
      ElMessage.info(`查看${classItem.name}的教学进度`)
      break
    case 'records':
      ElMessage.info(`查看${classItem.name}的教学记录`)
      break
    case 'attendance':
      ElMessage.info(`查看${classItem.name}的考勤统计`)
      break
  }
}

// 工具方法
const getGradeType = (grade: string) => {
  const typeMap = {
    '小班': 'success',
    '中班': 'warning',
    '大班': 'danger'
  }
  return typeMap[grade] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.class-management {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  .filter-section {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background-color: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);
    width: 100%;
    max-width: 100%;
  }

  .class-cards {
    width: 100%;
    max-width: 100%;
    flex: 1 1 auto;

    :deep(.el-row) {
      width: 100%;
      max-width: 100%;
      margin: 0 -10px;
    }
    .class-card {
      margin-bottom: var(--text-2xl);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 var(--spacing-sm) 25px var(--shadow-light);
      }
      
      .class-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-lg);
        
        .class-name {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .class-info {
        margin-bottom: var(--text-lg);
        
        .info-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          font-size: var(--text-base);
          color: var(--el-text-color-secondary);

          .el-icon {
            color: var(--el-text-color-placeholder);
          }
        }
      }
      
      .class-progress {
        margin-bottom: var(--text-lg);
        
        .progress-label {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .progress-text {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
          margin-left: var(--spacing-sm);
        }
      }
      
      .class-actions {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
      }
    }
  }
  
  .empty-state {
    padding: var(--spacing-10xl);
    text-align: center;
  }
  
  .class-detail {
    .recent-records {
      .record-item {
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
        }
        
        .record-content {
          flex: 1;
          margin: 0 var(--text-lg);
          font-size: var(--text-base);
          color: var(--color-gray-700);
        }
        
        .record-attendance {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .class-management {
    .class-cards {
      :deep(.el-col) {
        margin-bottom: var(--text-lg);
      }
    }
  }
}

@media (max-width: 992px) {
  .class-management {
    .filter-section {
      .el-form {
        flex-direction: column;
        align-items: flex-start;

        .el-form-item {
          margin-bottom: var(--text-sm);
        }
      }
    }

    .class-cards {
      :deep(.el-col) {
        margin-bottom: var(--text-lg);
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .class-management {
    .class-cards {
      .class-card {
        .class-actions {
          flex-direction: column;

          .el-button {
            width: 100%;
          }
        }
      }
    }

    .class-detail {
      .recent-records {
        .record-item {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-sm);
        }
      }
    }
  }
}
</style>
