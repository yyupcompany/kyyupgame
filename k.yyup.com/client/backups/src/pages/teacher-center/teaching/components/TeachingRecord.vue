<template>
  <div class="teaching-record">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreateRecord">
        <el-icon><Plus /></el-icon>
        添加记录
      </el-button>
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>
        导出记录
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="选择班级" clearable style="width: 150px">
            <el-option label="全部班级" value="" />
            <el-option label="大班A" value="1" />
            <el-option label="中班B" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>
            筛选
          </el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 记录列表 -->
    <div class="record-list" v-loading="loading">
      <div 
        v-for="record in filteredRecords" 
        :key="record.id"
        class="record-item"
      >
        <el-card shadow="hover">
          <div class="record-header">
            <div class="record-info">
              <div class="record-title">{{ record.className }} - {{ record.courseName }}</div>
              <div class="record-meta">
                <el-tag size="small">{{ formatDate(record.date) }}</el-tag>
                <span class="record-duration">{{ record.duration }}分钟</span>
                <span class="record-attendance">出勤: {{ record.attendance }}人</span>
              </div>
            </div>
            <div class="record-actions">
              <el-button size="small" @click="handleViewRecord(record)">
                查看
              </el-button>
              <el-button size="small" @click="handleEditRecord(record)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleDeleteRecord(record)">
                删除
              </el-button>
            </div>
          </div>
          
          <div class="record-content">
            <div class="content-text">{{ record.content }}</div>
            
            <!-- 媒体文件 -->
            <div v-if="record.mediaFiles && record.mediaFiles.length > 0" class="media-files">
              <div class="media-label">教学媒体:</div>
              <div class="media-list">
                <div 
                  v-for="media in record.mediaFiles" 
                  :key="media.id"
                  class="media-item"
                  @click="handleViewMedia(media)"
                >
                  <el-icon v-if="media.type === 'image'"><Picture /></el-icon>
                  <el-icon v-else-if="media.type === 'video'"><VideoPlay /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                  <span class="media-name">{{ media.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- 学生表现 -->
            <div v-if="record.studentPerformance && record.studentPerformance.length > 0" class="student-performance">
              <div class="performance-label">学生表现:</div>
              <div class="performance-list">
                <el-tag 
                  v-for="performance in record.studentPerformance" 
                  :key="performance.studentId"
                  :type="getPerformanceType(performance.level)"
                  size="small"
                  class="performance-tag"
                >
                  {{ performance.studentName }}: {{ performance.level }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-if="filteredRecords.length === 0" class="empty-state">
        <el-empty description="暂无教学记录" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Search,
  Picture,
  VideoPlay,
  Document
} from '@element-plus/icons-vue'

interface TeachingRecord {
  id: number
  className: string
  courseName: string
  date: string
  duration: number
  attendance: number
  content: string
  mediaFiles?: Array<{
    id: number
    name: string
    type: 'image' | 'video' | 'document'
    url: string
  }>
  studentPerformance?: Array<{
    studentId: number
    studentName: string
    level: '优秀' | '良好' | '一般' | '需改进'
  }>
}

interface Props {
  records: TeachingRecord[]
}

interface Emits {
  (e: 'create-record'): void
  (e: 'edit-record', record: TeachingRecord): void
  (e: 'delete-record', record: TeachingRecord): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)

const filterForm = reactive({
  classId: '',
  dateRange: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const filteredRecords = computed(() => {
  let result = props.records
  
  if (filterForm.classId) {
    // 根据班级ID筛选（这里简化处理）
    result = result.filter(record => record.className.includes(filterForm.classId === '1' ? '大班A' : '中班B'))
  }
  
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    result = result.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  // 分页处理
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  pagination.total = result.length
  
  return result.slice(start, end)
})

// 方法
const handleCreateRecord = () => {
  emit('create-record')
}

const handleEditRecord = (record: TeachingRecord) => {
  emit('edit-record', record)
}

const handleDeleteRecord = async (record: TeachingRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除这条教学记录吗？', '确认删除', {
      type: 'warning'
    })
    emit('delete-record', record)
  } catch (error) {
    // 用户取消删除
  }
}

const handleViewRecord = (record: TeachingRecord) => {
  ElMessage.info('查看记录详情功能开发中...')
}

const handleViewMedia = (media: any) => {
  ElMessage.info(`查看媒体文件: ${media.name}`)
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleFilter = () => {
  pagination.page = 1
}

const handleResetFilter = () => {
  Object.assign(filterForm, {
    classId: '',
    dateRange: null
  })
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

// 工具方法
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const getPerformanceType = (level: string) => {
  const typeMap = {
    '优秀': 'success',
    '良好': 'primary',
    '一般': 'warning',
    '需改进': 'danger'
  }
  return typeMap[level] || 'info'
}
</script>

<style lang="scss" scoped>
.teaching-record {
  .action-bar {
    margin-bottom: var(--text-lg);
    display: flex;
    gap: var(--text-sm);
  }
  
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background-color: #f9fafb;
    border-radius: var(--spacing-sm);
  }
  
  .record-list {
    .record-item {
      margin-bottom: var(--text-lg);
      
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--text-sm);
        
        .record-info {
          flex: 1;
          
          .record-title {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }
          
          .record-meta {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }
        
        .record-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }
      
      .record-content {
        .content-text {
          font-size: var(--text-base);
          line-height: 1.6;
          color: var(--color-gray-700);
          margin-bottom: var(--text-sm);
        }
        
        .media-files {
          margin-bottom: var(--text-sm);
          
          .media-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }
          
          .media-list {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
            
            .media-item {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              padding: var(--spacing-xs) var(--spacing-sm);
              background-color: #f3f4f6;
              border-radius: var(--spacing-xs);
              cursor: pointer;
              font-size: var(--text-sm);
              color: var(--color-gray-700);
              
              &:hover {
                background-color: var(--border-color);
              }
              
              .media-name {
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }
        }
        
        .student-performance {
          .performance-label {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
          }
          
          .performance-list {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-lg);
            
            .performance-tag {
              font-size: var(--text-sm);
            }
          }
        }
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
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teaching-record {
    .record-list {
      .record-item {
        .record-header {
          flex-direction: column;
          gap: var(--text-sm);
          align-items: flex-start;
          
          .record-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
        
        .record-content {
          .media-files .media-list {
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>
