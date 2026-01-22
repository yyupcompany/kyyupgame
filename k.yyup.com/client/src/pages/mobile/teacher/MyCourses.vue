<template>
  <MobileCenterLayout title="我的课程" back-path="/mobile/teacher">
    <template #right>
      <van-icon name="replay" size="20" @click="loadData" />
    </template>

    <div class="my-courses-mobile">
      <!-- 今日课程提醒 -->
      <div class="today-section" v-if="todayCourses.length">
        <div class="section-header">
          <span class="section-title">📅 今日课程</span>
          <span class="section-count">{{ todayCourses.length }}节</span>
        </div>
        <van-swipe :loop="false" :width="300" class="today-swipe">
          <van-swipe-item v-for="course in todayCourses" :key="course.id">
            <div class="today-card" @click="handleViewCourse(course)">
              <div class="course-type-badge">
                {{ course.course?.course_type === 'brain_science' ? '🧠' : '📚' }}
              </div>
              <div class="today-info">
                <div class="today-title">{{ course.course?.course_name }}</div>
                <div class="today-class">{{ course.class?.class_name }}</div>
              </div>
              <van-button size="small" type="primary" @click.stop="handleStartLesson(course)">
                开始上课
              </van-button>
            </div>
          </van-swipe-item>
        </van-swipe>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">全部课程</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.in_progress }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-item" @click="showPendingOnly = !showPendingOnly">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待确认</div>
          <van-badge v-if="stats.pending > 0" :content="stats.pending" class="pending-badge" />
        </div>
      </div>

      <!-- 课程列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadMore"
        >
          <div class="course-list">
            <div 
              v-for="schedule in displaySchedules" 
              :key="schedule.id" 
              class="course-card"
              :class="{ 'needs-confirm': !schedule.teacher_confirmed }"
              @click="handleViewCourse(schedule)"
            >
              <!-- 课程类型图标 -->
              <div class="course-icon">
                {{ schedule.course?.course_type === 'brain_science' ? '🧠' : '📚' }}
              </div>

              <!-- 课程信息 -->
              <div class="course-content">
                <div class="course-header">
                  <div class="course-name">{{ schedule.course?.course_name }}</div>
                  <van-tag 
                    :type="getStatusType(schedule.schedule_status)" 
                    size="mini"
                  >
                    {{ getStatusLabel(schedule.schedule_status) }}
                  </van-tag>
                </div>
                <div class="course-meta">
                  <span><van-icon name="wap-home-o" /> {{ schedule.class?.class_name }}</span>
                </div>

                <!-- 进度条 -->
                <div class="progress-row">
                  <van-progress 
                    :percentage="Math.round((schedule.completed_sessions / schedule.total_sessions) * 100)"
                    :stroke-width="4"
                    :show-pivot="false"
                    :color="getProgressColor(schedule)"
                  />
                  <span class="progress-text">
                    {{ schedule.completed_sessions }}/{{ schedule.total_sessions }}
                  </span>
                </div>

                <!-- 时间信息 -->
                <div class="time-row">
                  <span class="date-range">
                    {{ formatDate(schedule.planned_start_date) }} - {{ formatDate(schedule.planned_end_date) }}
                  </span>
                  <van-tag v-if="isDelayed(schedule)" type="danger" size="mini">
                    已延期
                  </van-tag>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="course-actions">
                <van-button 
                  v-if="!schedule.teacher_confirmed" 
                  type="success" 
                  size="mini"
                  @click.stop="handleConfirm(schedule)"
                >
                  确认
                </van-button>
                <van-icon name="arrow" color="var(--van-gray-5)" />
              </div>
            </div>

            <van-empty v-if="!loading && schedules.length === 0" description="暂无课程" />
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 课程内容查看弹出层 -->
      <van-popup
        v-model:show="coursePopupVisible"
        position="bottom"
        round
        :style="{ height: '80%' }"
      >
        <div class="course-popup" v-if="currentSchedule">
          <div class="popup-header">
            <div class="popup-title">{{ currentSchedule.course?.course_name }}</div>
            <van-icon name="cross" @click="coursePopupVisible = false" />
          </div>

          <div class="popup-content">
            <!-- 课程信息卡片 -->
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">课程类型</span>
                <van-tag :type="currentSchedule.course?.course_type === 'brain_science' ? 'danger' : 'primary'">
                  {{ currentSchedule.course?.course_type === 'brain_science' ? '脑科学课程' : '自定义课程' }}
                </van-tag>
              </div>
              <div class="info-item">
                <span class="info-label">班级</span>
                <span class="info-value">{{ currentSchedule.class?.class_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">进度</span>
                <span class="info-value">{{ currentSchedule.completed_sessions }}/{{ currentSchedule.total_sessions }}课时</span>
              </div>
            </div>

            <!-- 课程内容列表 -->
            <div class="contents-section">
              <div class="section-title">📖 课程内容</div>
              <van-loading v-if="contentLoading" size="24px" vertical>加载中...</van-loading>
              <van-empty v-else-if="!currentContents.length" description="暂无课程内容" />
              <div v-else class="content-list">
                <div 
                  v-for="(content, index) in currentContents" 
                  :key="content.id"
                  class="content-item"
                  @click="handleViewContent(content)"
                >
                  <div class="content-order">{{ index + 1 }}</div>
                  <div class="content-icon">{{ getContentIcon(content.content_type) }}</div>
                  <div class="content-info">
                    <div class="content-title">{{ content.content_title }}</div>
                    <div class="content-meta">
                      <span>{{ getContentLabel(content.content_type) }}</span>
                      <span v-if="content.duration_minutes">{{ content.duration_minutes }}分钟</span>
                    </div>
                  </div>
                  <van-icon name="arrow" color="var(--van-gray-5)" />
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div class="popup-footer">
            <van-button 
              v-if="!currentSchedule.teacher_confirmed"
              type="success" 
              block 
              @click="handleConfirm(currentSchedule)"
            >
              确认接收课程
            </van-button>
            <van-button 
              v-else-if="currentSchedule.schedule_status === 'in_progress'"
              type="primary" 
              block 
              @click="handleStartLesson(currentSchedule)"
            >
              开始上课
            </van-button>
          </div>
        </div>
      </van-popup>

      <!-- 内容查看弹出层 -->
      <van-popup
        v-model:show="contentPopupVisible"
        position="bottom"
        round
        :style="{ height: '90%' }"
      >
        <div class="content-popup" v-if="currentContent">
          <div class="popup-header">
            <div class="popup-title">{{ currentContent.content_title }}</div>
            <van-icon name="cross" @click="contentPopupVisible = false" />
          </div>

          <div class="popup-body">
            <!-- 文本内容 -->
            <div v-if="currentContent.content_type === 'text'" class="text-content">
              {{ currentContent.content_data?.text }}
            </div>

            <!-- 图片内容 -->
            <div v-else-if="currentContent.content_type === 'image'" class="image-content">
              <van-image 
                :src="currentContent.content_data?.image_url" 
                fit="contain"
                class="content-image"
              />
            </div>

            <!-- 视频内容 -->
            <div v-else-if="currentContent.content_type === 'video'" class="video-content">
              <video 
                v-if="currentContent.content_data?.video_url"
                :src="currentContent.content_data.video_url" 
                controls 
                class="content-video"
              />
            </div>

            <!-- 互动课件 -->
            <div v-else-if="currentContent.content_type === 'interactive'" class="interactive-content">
              <div class="interactive-placeholder">
                <div class="interactive-icon">🎮</div>
                <div class="interactive-name">{{ currentContent.content_data?.interactive_name }}</div>
                <van-button type="primary" @click="playInteractive(currentContent)">
                  启动互动课件
                </van-button>
              </div>
            </div>

            <!-- 教学备注 -->
            <div v-if="currentContent.teaching_notes" class="teaching-notes">
              <div class="notes-title">📝 教学备注</div>
              <div class="notes-content">{{ currentContent.teaching_notes }}</div>
            </div>
          </div>
        </div>
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue';
import {
  getTeacherCourses,
  getCourseContents,
  confirmSchedule,
  updateCourseSchedule,
  type CourseSchedule,
  type CourseContent
} from '@/api/endpoints/custom-course';

const router = useRouter();

// 状态
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const contentLoading = ref(false);
const showPendingOnly = ref(false);

// 数据
const schedules = ref<CourseSchedule[]>([]);
const currentSchedule = ref<CourseSchedule | null>(null);
const currentContents = ref<CourseContent[]>([]);
const currentContent = ref<CourseContent | null>(null);

// 弹出层
const coursePopupVisible = ref(false);
const contentPopupVisible = ref(false);

// 统计
const stats = computed(() => {
  const total = schedules.value.length;
  const in_progress = schedules.value.filter(s => s.schedule_status === 'in_progress').length;
  const completed = schedules.value.filter(s => s.schedule_status === 'completed').length;
  const pending = schedules.value.filter(s => !s.teacher_confirmed).length;
  return { total, in_progress, completed, pending };
});

// 今日课程
const todayCourses = computed(() => {
  return schedules.value.filter(s => 
    s.schedule_status === 'in_progress' && s.teacher_confirmed
  ).slice(0, 5);
});

// 显示的排期列表
const displaySchedules = computed(() => {
  if (showPendingOnly.value) {
    return schedules.value.filter(s => !s.teacher_confirmed);
  }
  return schedules.value;
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const res = await getTeacherCourses();
    if (res.success) {
      schedules.value = res.data;
    }
    finished.value = true;
  } catch (error) {
    console.error('加载失败:', error);
    showToast('加载失败');
  } finally {
    loading.value = false;
  }
};

// 下拉刷新
const onRefresh = async () => {
  await loadData();
  refreshing.value = false;
};

// 加载更多
const loadMore = async () => {
  // 一次性加载，无需分页
  finished.value = true;
};

// 获取状态类型
const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'primary' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'primary'> = {
    'pending': 'primary',
    'in_progress': 'warning',
    'completed': 'success',
    'delayed': 'danger',
    'cancelled': 'primary'
  };
  return typeMap[status] || 'primary';
};

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'delayed': '已延期',
    'cancelled': '已取消'
  };
  return labelMap[status] || status;
};

// 获取进度条颜色
const getProgressColor = (schedule: CourseSchedule): string => {
  if (schedule.schedule_status === 'delayed') return '#ee0a24';
  const percentage = schedule.completed_sessions / schedule.total_sessions;
  if (percentage >= 0.8) return '#07c160';
  if (percentage >= 0.5) return '#ff976a';
  return '#1989fa';
};

// 格式化日期
const formatDate = (date: string): string => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 检查是否延期
const isDelayed = (schedule: CourseSchedule): boolean => {
  if (schedule.schedule_status === 'completed' || schedule.schedule_status === 'cancelled') {
    return false;
  }
  return new Date() > new Date(schedule.planned_end_date);
};

// 获取内容图标
const getContentIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'text': '📝',
    'image': '🖼️',
    'video': '🎬',
    'interactive': '🎮',
    'document': '📄'
  };
  return iconMap[type] || '📋';
};

// 获取内容标签
const getContentLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'text': '文本',
    'image': '图片',
    'video': '视频',
    'interactive': '互动课件',
    'document': '文档'
  };
  return labelMap[type] || type;
};

// 查看课程
const handleViewCourse = async (schedule: CourseSchedule) => {
  currentSchedule.value = schedule;
  coursePopupVisible.value = true;

  // 加载课程内容
  if (schedule.course_id) {
    try {
      contentLoading.value = true;
      const res = await getCourseContents(schedule.course_id);
      if (res.success) {
        currentContents.value = res.data;
      }
    } catch (error) {
      console.error('加载内容失败:', error);
    } finally {
      contentLoading.value = false;
    }
  }
};

// 查看内容
const handleViewContent = (content: CourseContent) => {
  currentContent.value = content;
  contentPopupVisible.value = true;
};

// 确认接收
const handleConfirm = async (schedule: CourseSchedule) => {
  try {
    await showConfirmDialog({
      title: '确认接收',
      message: '确认接收此课程？确认后将开始计入教学进度。'
    });
    
    const res = await confirmSchedule(schedule.id);
    if (res.success) {
      showToast('确认成功');
      await loadData();
      coursePopupVisible.value = false;
    }
  } catch (error) {
    // 用户取消
  }
};

// 开始上课 - 记录课时完成
const handleStartLesson = async (schedule: CourseSchedule) => {
  // 检查是否已完成所有课时
  if (schedule.completed_sessions >= schedule.total_sessions) {
    showToast('该课程已完成所有课时');
    return;
  }
  
  try {
    await showConfirmDialog({
      title: '开始上课',
      message: `确认开始 ${schedule.course?.course_name || '课程'} 的第 ${schedule.completed_sessions + 1} 节课？\n课时将计入教学进度。`,
      confirmButtonText: '确认上课',
      cancelButtonText: '取消'
    });
    
    // 调用API更新课时完成数
    const res = await updateCourseSchedule(schedule.id, {
      completed_sessions: schedule.completed_sessions + 1
    });
    
    if (res.success) {
      showToast(`第 ${schedule.completed_sessions + 1} 节课开始！`);
      // 刷新数据
      await loadData();
      coursePopupVisible.value = false;
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast(error?.message || '操作失败');
    }
  }
};

// 播放互动课件
const playInteractive = (content: CourseContent) => {
  if (content.content_data?.interactive_id) {
    router.push(`/mobile/interactive/play/${content.content_data.interactive_id}`);
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.my-courses-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
  padding-bottom: 20px;
}

// 今日课程
.today-section {
  padding: 12px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--van-text-color);
    }
    
    .section-count {
      font-size: 12px;
      color: var(--van-gray-6);
    }
  }
}

.today-swipe {
  .today-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 16px;
    margin-right: 12px;
    color: white;
    
    .course-type-badge {
      font-size: 32px;
    }
    
    .today-info {
      flex: 1;
      
      .today-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .today-class {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }
}

// 统计行
.stats-row {
  display: flex;
  padding: 16px 12px;
  gap: 12px;
  
  .stat-item {
    flex: 1;
    text-align: center;
    background: var(--van-background);
    border-radius: 8px;
    padding: 12px 8px;
    position: relative;
    
    .stat-value {
      font-size: 22px;
      font-weight: 600;
      color: var(--van-primary-color);
    }
    
    .stat-label {
      font-size: 11px;
      color: var(--van-gray-6);
      margin-top: 4px;
    }
    
    .pending-badge {
      position: absolute;
      top: 4px;
      right: 4px;
    }
  }
}

// 课程列表
.course-list {
  padding: 0 12px;
}

.course-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--van-background);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  
  &.needs-confirm {
    border: 1px solid var(--van-warning-color);
    background: rgba(255, 151, 106, 0.05);
  }
  
  .course-icon {
    font-size: 36px;
    line-height: 1;
  }
  
  .course-content {
    flex: 1;
    min-width: 0;
    
    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      
      .course-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--van-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .course-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--van-gray-6);
      margin-bottom: 8px;
    }
    
    .progress-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      
      :deep(.van-progress) {
        flex: 1;
      }
      
      .progress-text {
        font-size: 11px;
        color: var(--van-gray-6);
        min-width: 40px;
      }
    }
    
    .time-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .date-range {
        font-size: 11px;
        color: var(--van-gray-6);
      }
    }
  }
  
  .course-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

// 课程详情弹出层
.course-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--van-border-color);
  
  .popup-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.info-card {
  background: var(--van-gray-1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--van-border-color);
    }
    
    .info-label {
      font-size: 13px;
      color: var(--van-gray-6);
    }
    
    .info-value {
      font-size: 14px;
      color: var(--van-text-color);
    }
  }
}

.contents-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
}

.content-list {
  .content-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--van-background);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    border: 1px solid var(--van-border-color);
    
    .content-order {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--van-primary-color);
      color: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
    }
    
    .content-icon {
      font-size: 24px;
    }
    
    .content-info {
      flex: 1;
      
      .content-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--van-text-color);
        margin-bottom: 4px;
      }
      
      .content-meta {
        font-size: 11px;
        color: var(--van-gray-6);
        
        span + span {
          margin-left: 8px;
        }
      }
    }
  }
}

.popup-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--van-border-color);
}

// 内容查看弹出层
.content-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.text-content {
  font-size: 15px;
  line-height: 1.8;
  color: var(--van-text-color);
  white-space: pre-wrap;
}

.image-content {
  .content-image {
    width: 100%;
    border-radius: 8px;
  }
}

.video-content {
  .content-video {
    width: 100%;
    border-radius: 8px;
  }
}

.interactive-content {
  .interactive-placeholder {
    text-align: center;
    padding: 40px 20px;
    
    .interactive-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .interactive-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: 24px;
    }
  }
}

.teaching-notes {
  margin-top: 24px;
  padding: 16px;
  background: var(--van-gray-1);
  border-radius: 8px;
  
  .notes-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 8px;
  }
  
  .notes-content {
    font-size: 14px;
    line-height: 1.6;
    color: var(--van-gray-7);
  }
}
</style>


