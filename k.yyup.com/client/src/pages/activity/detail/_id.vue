<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ activityData.title }}</h1>
        <p class="page-description">活动详情信息</p>
      </div>
      <div class="page-actions">
        <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
        <el-button type="primary" @click="handleEdit" :icon="Edit">编辑</el-button>
      </div>
    </div>

    <!-- 活动基本信息卡片 -->
    <div class="card card--primary">
      <div class="card-header">
        <h3 class="card-title with-icon">
          <UnifiedIcon name="default" />
          活动基本信息
        </h3>
        <div class="card-actions">
          <el-tag :type="getStatusType(activityData.status)" size="large">
            {{ activityData.status }}
          </el-tag>
        </div>
      </div>
      <div class="card-body">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动类型">{{ activityData.type }}</el-descriptions-item>
          <el-descriptions-item label="活动状态">
            <el-tag :type="getStatusType(activityData.status)">
              {{ activityData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ activityData.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ activityData.endDate }}</el-descriptions-item>
          <el-descriptions-item label="活动地点">{{ activityData.location }}</el-descriptions-item>
          <el-descriptions-item label="报名人数">
            {{ activityData.enrollmentCount }}/{{ activityData.maxParticipants }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ activityData.createdBy }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(activityData.createdAt, 'YYYY-MM-DD HH:mm') }}</el-descriptions-item>
          <el-descriptions-item label="活动描述" :span="2">
            <div class="description-content">{{ activityData.description }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 活动图片展示卡片 -->
    <div v-if="activityData.images && activityData.images.length > 0" class="card card--info">
      <div class="card-header">
        <h3 class="card-title with-icon">
          <UnifiedIcon name="default" />
          活动图片
        </h3>
        <div class="card-subtitle">共 {{ activityData.images.length }} 张图片</div>
      </div>
      <div class="card-body">
        <el-carousel :interval="4000" type="card" height="200px" indicator-position="outside">
          <el-carousel-item v-for="image in activityData.images" :key="image.id">
            <div class="image-item">
              <el-image :src="image.url" fit="cover" :alt="image.title">
                <template #error>
                  <div class="image-error">
                    <UnifiedIcon name="default" />
                    <span>加载失败</span>
                  </div>
                </template>
              </el-image>
              <div class="image-title">{{ image.title }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <!-- 参与者列表卡片 -->
    <div class="card card--success">
      <div class="card-header">
        <h3 class="card-title with-icon">
          <UnifiedIcon name="default" />
          参与者名单
        </h3>
        <div class="card-subtitle">共 {{ activityData.participants?.length || 0 }} 人</div>
      </div>
      <div class="card-body">
        <el-table class="responsive-table"
          v-if="activityData.participants && activityData.participants.length > 0"
          :data="activityData.participants"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="studentName" label="学生姓名" />
          <el-table-column prop="className" label="班级" />
          <el-table-column prop="registerTime" label="报名时间">
            <template #default="scope">
              {{ formatDate(scope.row.registerTime, 'YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="attendanceStatus" label="出席状态">
            <template #default="scope">
              <el-tag :type="getAttendanceStatusType(scope.row.attendanceStatus)">
                {{ scope.row.attendanceStatus }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无参与者" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Picture, InfoFilled, User, Edit, ArrowLeft } from '@element-plus/icons-vue'
import { formatDate } from '../../../utils/date'
import type { TagType } from '../../../types/activity'
import { get } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import { ACTIVITY_PLAN_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'

// 临时类型定义，实际项目中应导入从types/activity.ts
type ActivityImage = {
  id: string;
  url: string;
  title?: string;
}

type ActivityParticipant = {
  id: string;
  studentName: string;
  className: string;
  registerTime: string;
  attendanceStatus: string;
}

type ActivityInfo = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  enrollmentCount: number;
  maxParticipants: number;
  requiresRegistration?: boolean;
  registrationDeadline?: string;
  createdAt?: string;
  createdBy?: string;
  images?: ActivityImage[];
  participants?: ActivityParticipant[];
}

export default defineComponent({
  name: 'ActivityDetail',
  components: {
    Picture,
    InfoFilled,
    User,
    Edit,
    ArrowLeft
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const activityId = route.params.id as string
    const loading = ref(false)
    
    // 模拟活动详情数据
    const activityData = ref<ActivityInfo>({
      id: activityId,
  title: "亲子阅读日",
  type: "文化活动",
  status: "进行中",
      startDate: "2024-06-01",
      endDate: "2024-06-30",
  description: "鼓励家长与孩子共同阅读，培养阅读兴趣和习惯",
  location: "图书角",
      enrollmentCount: 25,
      maxParticipants: 50,
      requiresRegistration: true,
      registrationDeadline: "2024-05-25",
      createdAt: "2024-05-15T10:00:00Z",
      createdBy: "李老师",
  images: [
        {
          id: "img1",
  url: "https://example.com/images/activity1_1.jpg",
  title: "活动海报"
        },
        {
          id: "img2",
  url: "https://example.com/images/activity1_2.jpg",
  title: "活动照片"
        }
      ],
  participants: [
        {
          id: "p1",
          studentName: "张小明",
          className: "小班1班",
          registerTime: "2024-05-20T14:30:00Z",
          attendanceStatus: "已确认"
        },
        {
          id: "p2",
          studentName: "李小花",
          className: "中班2班",
          registerTime: "2024-05-21T09:15:00Z",
          attendanceStatus: "已确认"
        }
      ]
    })

    // 加载活动详情数据
    const fetchActivityDetail = async () => {
      const loadingInstance = ElLoading.service({
        target: '.page-container',
  text: '加载活动详情...'
      })
      
      try {
        // 修改：添加使用模拟数据的标志（开发环境可以设为false使用真实API）
        const useMockData = false;
        
        if (useMockData) {
          // 使用模拟数据
          console.log('使用模拟数据，因为API返回401错误')
          // 保持现有的模拟数据，不做API调用
          setTimeout(() => {
            loadingInstance.close();
          }, 500);
        } else {
          // 调用API获取活动详情
          const res = await get(ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID(activityId))
          if (res.success && res.data) {
            // 映射后端字段到前端期望的字段
            activityData.value = {
              ...res.data,
              startDate: res.data.startDate || res.data.start_date,
              endDate: res.data.endDate || res.data.end_date,
              startTime: res.data.startDate || res.data.start_date || res.data.startTime,
              endTime: res.data.endDate || res.data.end_date || res.data.endTime,
              createdAt: res.data.createdAt || res.data.created_at,
              updatedAt: res.data.updatedAt || res.data.updated_at
            }
            console.log('加载活动详情成功:', activityData.value)
          } else {
            const errorInfo = ErrorHandler.handle(new Error(res.message || '获取活动详情失败'), true)
          }
          loadingInstance.close();
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true)
        loadingInstance.close();
      }
    }

    // 获取状态类型
    const getStatusType = (status: string): TagType => {
      const typeMap: Record<string, TagType> = {
        '进行中': 'success',
        '即将开始': 'warning',
        '已结束': 'info',
        '已取消': 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 获取出席状态类型
    const getAttendanceStatusType = (status: string): TagType => {
      const typeMap: Record<string, TagType> = {
        '已确认': 'success',
        '未确认': 'warning',
        '已取消': 'info',
        '缺席': 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 编辑活动
    const handleEdit = () => {
      router.push(`/activity/edit/${activityId}`)
    }

    // 返回列表
    const goBack = () => {
      router.back()
    }

    onMounted(() => {
      fetchActivityDetail()
    })

    return {
      activityData,
      loading,
      formatDate,
      getStatusType,
      getAttendanceStatusType,
      handleEdit,
      goBack
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

/* 使用全局样式，只添加必要的自定义样式 */

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  background-color: var(--bg-page);
  border-radius: var(--radius-sm);
}

.image-item {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.image-title {
  text-align: center;
  margin-top: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--text-muted);
  background-color: var(--bg-page);
  border-radius: var(--radius-md);

  .el-icon {
    font-size: var(--text-3xl);
    margin-bottom: var(--spacing-sm);
    color: var(--text-muted);
  }
}

/* 图片悬停效果 */
.image-item:hover .el-image {
  transform: scale(1.05);
  transition: transform var(--transition-normal);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .page-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 