<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-teaching">
    <!-- 页面头部 -->
    <div class="teaching-header">
      <div class="header-content">
        <div class="page-title">
          <h1>
            <el-icon><School /></el-icon>
            教学中心
          </h1>
          <p>管理您的班级、学生和教学进度</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateRecord">
            <el-icon><Plus /></el-icon>
            添加教学记录
          </el-button>
          <el-button @click="handleUploadMedia">
            <el-icon><Upload /></el-icon>
            上传媒体
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 教学统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="负责班级"
            :value="teachingStats.classes"
            icon="School"
            color="var(--el-color-primary)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="学生总数"
            :value="teachingStats.students"
            icon="User"
            color="var(--el-color-success)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="本周课程"
            :value="teachingStats.weekCourses"
            icon="Calendar"
            color="var(--el-color-warning)"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :lg="6">
          <TeachingStatCard
            title="教学完成率"
            :value="teachingStats.completionRate"
            icon="TrendCharts"
            color="var(--el-color-danger)"
            suffix="%"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 功能导航卡片 -->
    <div class="function-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="function-card" shadow="hover" @click="activeTab = 'classes'">
            <div class="function-content">
              <div class="function-icon">
                <el-icon><School /></el-icon>
              </div>
              <div class="function-info">
                <div class="function-title">班级管理</div>
                <div class="function-desc">管理您负责的班级信息</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="function-card" shadow="hover" @click="activeTab = 'progress'">
            <div class="function-content">
              <div class="function-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="function-info">
                <div class="function-title">教学进度</div>
                <div class="function-desc">查看和更新教学进度</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="function-card" shadow="hover" @click="activeTab = 'records'">
            <div class="function-content">
              <div class="function-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="function-info">
                <div class="function-title">教学记录</div>
                <div class="function-desc">记录每次上课情况</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-card>
        <template #header>
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="班级管理" name="classes">
              <template #label>
                <span class="tab-label">
                  <el-icon><School /></el-icon>
                  班级管理
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="教学进度" name="progress">
              <template #label>
                <span class="tab-label">
                  <el-icon><TrendCharts /></el-icon>
                  教学进度
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="教学记录" name="records">
              <template #label>
                <span class="tab-label">
                  <el-icon><Document /></el-icon>
                  教学记录
                </span>
              </template>
            </el-tab-pane>
            <el-tab-pane label="学生管理" name="students">
              <template #label>
                <span class="tab-label">
                  <el-icon><User /></el-icon>
                  学生管理
                </span>
              </template>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- 班级管理 -->
        <div v-if="activeTab === 'classes'" class="tab-content">
          <ClassManagement 
            :classes="classList"
            @view-class="handleViewClass"
            @edit-class="handleEditClass"
          />
        </div>

        <!-- 教学进度 -->
        <div v-if="activeTab === 'progress'" class="tab-content">
          <TeachingProgress 
            :progress-data="progressData"
            @update-progress="handleUpdateProgress"
            @view-details="handleViewProgressDetails"
          />
        </div>

        <!-- 教学记录 -->
        <div v-if="activeTab === 'records'" class="tab-content">
          <TeachingRecord 
            :records="recordsList"
            @create-record="handleCreateRecord"
            @edit-record="handleEditRecord"
            @delete-record="handleDeleteRecord"
          />
        </div>

        <!-- 学生管理 -->
        <div v-if="activeTab === 'students'" class="tab-content">
          <StudentManagement 
            :students="studentsList"
            @view-student="handleViewStudent"
            @edit-student="handleEditStudent"
          />
        </div>
      </el-card>
    </div>

    <!-- 媒体上传弹窗 -->
    <MediaUpload 
      v-model="mediaUploadVisible"
      @upload-success="handleMediaUploadSuccess"
    />

    <!-- 教学记录弹窗 -->
    <TeachingRecordDialog 
      v-model="recordDialogVisible"
      :record="currentRecord"
      @save="handleSaveRecord"
    />
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { teacherTeachingApi, type TeachingStats, type ClassInfo, type ProgressInfo, type TeachingRecord as TeachingRecordType, type StudentInfo } from '@/api/modules/teacher-teaching'
import {
  School,
  Plus,
  Upload,
  Refresh,
  User,
  Calendar,
  TrendCharts,
  Document
} from '@element-plus/icons-vue'

// 导入组件
import TeachingStatCard from './components/TeachingStatCard.vue'
import ClassManagement from './components/ClassManagement.vue'
import TeachingProgress from './components/TeachingProgress.vue'
import TeachingRecord from './components/TeachingRecord.vue'
import StudentManagement from './components/StudentManagement.vue'
import MediaUpload from './components/MediaUpload.vue'
import TeachingRecordDialog from './components/TeachingRecordDialog.vue'

// 响应式数据
const activeTab = ref('classes')
const mediaUploadVisible = ref(false)
const recordDialogVisible = ref(false)
const currentRecord = ref(null)

// 教学统计
const teachingStats = reactive({
  classes: 0,
  students: 0,
  weekCourses: 0,
  completionRate: 0
})

// 数据列表
const classList = ref([])
const progressData = ref([])
const recordsList = ref([])
const studentsList = ref([])

// 方法
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  loadTabData(tabName)
}

const handleCreateRecord = () => {
  currentRecord.value = null
  recordDialogVisible.value = true
}

const handleEditRecord = (record: any) => {
  currentRecord.value = record
  recordDialogVisible.value = true
}

const handleDeleteRecord = async (record: any) => {
  try {
    await teacherTeachingApi.deleteTeachingRecord(record.id)
    ElMessage.success('教学记录已删除')
    loadTabData('records')
  } catch (error) {
    console.error('删除记录失败:', error)
    ElMessage.error('删除失败')
  }
}

const handleSaveRecord = async (recordData: any) => {
  try {
    if (currentRecord.value) {
      // 更新记录
      await teacherTeachingApi.updateTeachingRecord(currentRecord.value.id, recordData)
      ElMessage.success('教学记录更新成功')
    } else {
      // 创建记录
      await teacherTeachingApi.createTeachingRecord(recordData)
      ElMessage.success('教学记录创建成功')
    }
    recordDialogVisible.value = false
    loadTabData('records')
  } catch (error) {
    console.error('保存记录失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleUploadMedia = () => {
  mediaUploadVisible.value = true
}

const handleMediaUploadSuccess = () => {
  ElMessage.success('媒体上传成功')
  mediaUploadVisible.value = false
}

const handleViewClass = async (classInfo: any) => {
  try {
    const classDetail = await teacherTeachingApi.getClassDetail(classInfo.id)
    // TODO: 显示班级详情弹窗
    console.log('班级详情:', classDetail)
    ElMessage.info('查看班级详情功能开发中...')
  } catch (error) {
    console.error('获取班级详情失败:', error)
    ElMessage.error('获取班级详情失败')
  }
}

const handleEditClass = (classInfo: any) => {
  // TODO: 编辑班级信息
  ElMessage.info('编辑班级功能开发中...')
}

const handleUpdateProgress = async (progressInfo: any) => {
  try {
    await teacherTeachingApi.updateProgress(progressInfo.id, {
      completedSessions: progressInfo.completedSessions,
      notes: progressInfo.notes
    })
    ElMessage.success('教学进度已更新')
    loadTabData('progress')
  } catch (error) {
    console.error('更新进度失败:', error)
    ElMessage.error('更新失败')
  }
}

const handleViewProgressDetails = (progressInfo: any) => {
  // TODO: 查看进度详情
  ElMessage.info('查看进度详情功能开发中...')
}

const handleViewStudent = async (student: any) => {
  try {
    const studentDetail = await teacherTeachingApi.getStudentDetail(student.id)
    // TODO: 显示学生详情弹窗
    console.log('学生详情:', studentDetail)
    ElMessage.info('查看学生详情功能开发中...')
  } catch (error) {
    console.error('获取学生详情失败:', error)
    ElMessage.error('获取学生详情失败')
  }
}

const handleEditStudent = (student: any) => {
  // TODO: 编辑学生信息
  ElMessage.info('编辑学生功能开发中...')
}

const refreshData = () => {
  loadTeachingStats()
  loadTabData(activeTab.value)
}

const loadTeachingStats = async () => {
  try {
    // 调用API加载教学统计
    const stats = await teacherTeachingApi.getTeachingStats()
    Object.assign(teachingStats, stats)
  } catch (error) {
    console.error('加载教学统计失败:', error)
    // 设置默认值
    teachingStats.classes = 0
    teachingStats.students = 0
    teachingStats.weekCourses = 0
    teachingStats.completionRate = 0
    ElMessage.error('加载统计数据失败')
  }
}

const loadTabData = async (tabName: string) => {
  try {
    switch (tabName) {
      case 'classes':
        // 调用API加载班级数据
        try {
          classList.value = await teacherTeachingApi.getClassList()
        } catch (error) {
          console.error('加载班级数据失败:', error)
          classList.value = []
          ElMessage.error('加载班级数据失败')
        }
        break
      case 'progress':
        // 调用API加载进度数据
        try {
          progressData.value = await teacherTeachingApi.getProgressData()
        } catch (error) {
          console.error('加载进度数据失败:', error)
          progressData.value = []
          ElMessage.error('加载进度数据失败')
        }
        break
      case 'records':
        // 调用API加载记录数据
        try {
          const result = await teacherTeachingApi.getTeachingRecords()
          recordsList.value = result.records
        } catch (error) {
          console.error('加载记录数据失败:', error)
          recordsList.value = []
          ElMessage.error('加载记录数据失败')
        }
        break
      case 'students':
        // 调用API加载学生数据
        try {
          const result = await teacherTeachingApi.getStudentsList()
          studentsList.value = result.students
        } catch (error) {
          console.error('加载学生数据失败:', error)
          studentsList.value = []
          ElMessage.error('加载学生数据失败')
        }
        break
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 生命周期
onMounted(() => {
  loadTeachingStats()
  loadTabData('classes')
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.teacher-teaching {
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.teaching-header {
  margin-bottom: var(--spacing-xl);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .page-title {
      h1 {
        font-size: var(--text-2xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      p {
        color: var(--el-text-color-secondary);
        margin: 0;
        font-size: var(--text-sm);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-md);
    }
  }
}

.stats-cards {
  margin-bottom: var(--spacing-xl);
}

.function-cards {
  margin-bottom: var(--spacing-xl);
  
  .function-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow-light);
    }
    
    .function-content {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      
      .function-icon {
        width: var(--icon-size); height: var(--icon-size);
        background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: var(--text-3xl);
      }
      
      .function-info {
        flex: 1;
        
        .function-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-xs);
        }

        .function-desc {
          font-size: var(--text-base);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.main-content {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;

  .tab-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .tab-content {
    padding-top: var(--text-2xl);
    width: 100%;
    max-width: 100%;
    flex: 1 1 auto;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .teacher-teaching {
    padding: var(--text-xl);
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }

  .function-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }
}

@media (max-width: 992px) {
  .teacher-teaching {
    padding: var(--text-lg);
  }

  .teaching-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }

  .function-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .teacher-teaching {
    padding: var(--text-lg);
  }

  .teaching-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .function-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }

  .stats-cards {
    :deep(.el-col) {
      margin-bottom: var(--text-lg);
    }
  }
}
</style>
