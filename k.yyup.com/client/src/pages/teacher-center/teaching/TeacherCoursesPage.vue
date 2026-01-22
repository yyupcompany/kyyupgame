<template>
  <UnifiedCenterLayout
    title="教学课程"
    description="查看园长分配的课程内容，管理教学进度"
    icon="Reading"
  >
    <div class="teacher-courses-page">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card total">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-value">{{ scheduleStats.total }}</div>
            <div class="stat-label">我的课程</div>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-value">{{ scheduleStats.in_progress }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ scheduleStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-value">{{ scheduleStats.pending }}</div>
            <div class="stat-label">待确认</div>
          </div>
        </div>
      </div>

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="course-tabs">
        <!-- 我的课程 -->
        <el-tab-pane label="我的课程" name="my-courses">
          <!-- 筛选工具栏 -->
          <div class="filter-toolbar">
            <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px" @change="loadSchedules">
              <el-option label="待确认" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-select v-model="filter.class_id" placeholder="班级" clearable style="width: 150px" @change="loadSchedules">
              <el-option
                v-for="cls in classList"
                :key="cls.id"
                :label="cls.class_name"
                :value="cls.id"
              />
            </el-select>
            <div class="flex-grow"></div>
            <el-button @click="loadSchedules">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>

          <!-- 课程列表 -->
          <div class="course-list">
            <el-empty v-if="!schedules.length && !loading" description="暂无分配的课程">
              <p class="empty-tip">园长分配课程后将显示在这里</p>
            </el-empty>

            <div v-else class="course-cards-grid">
              <div 
                v-for="schedule in schedules" 
                :key="schedule.id" 
                class="course-schedule-card"
                :class="{ 'needs-confirm': !schedule.teacher_confirmed }"
                @click="handleViewCourse(schedule)"
              >
                <!-- 课程封面 -->
                <div class="card-cover">
                  <el-image 
                    v-if="schedule.course?.thumbnail_url" 
                    :src="schedule.course.thumbnail_url" 
                    fit="cover" 
                    class="cover-image"
                  />
                  <div v-else class="cover-placeholder">
                    <span class="course-type-icon">
                      {{ schedule.course?.course_type === 'brain_science' ? '🧠' : '📚' }}
                    </span>
                  </div>
                  
                  <!-- 状态标签 -->
                  <div class="card-badges">
                    <el-tag 
                      v-if="!schedule.teacher_confirmed" 
                      type="warning" 
                      size="small"
                    >
                      待确认
                    </el-tag>
                    <el-tag 
                      :type="getStatusType(schedule.schedule_status)" 
                      size="small"
                    >
                      {{ getStatusLabel(schedule.schedule_status) }}
                    </el-tag>
                  </div>
                </div>

                <!-- 课程信息 -->
                <div class="card-content">
                  <div class="course-name">{{ schedule.course?.course_name || '课程' }}</div>
                  <div class="course-meta">
                    <span class="class-name">
                      <el-icon><HomeFilled /></el-icon>
                      {{ schedule.class?.class_name }}
                    </span>
                  </div>
                  
                  <!-- 进度条 -->
                  <div class="progress-section">
                    <div class="progress-header">
                      <span>进度</span>
                      <span>{{ schedule.completed_sessions }}/{{ schedule.total_sessions }}课时</span>
                    </div>
                    <el-progress 
                      :percentage="Math.round((schedule.completed_sessions / schedule.total_sessions) * 100)"
                      :stroke-width="6"
                      :status="getProgressStatus(schedule)"
                    />
                  </div>

                  <!-- 时间信息 -->
                  <div class="time-info">
                    <span class="date-range">
                      {{ formatDate(schedule.planned_start_date) }} - {{ formatDate(schedule.planned_end_date) }}
                    </span>
                    <span v-if="isDelayed(schedule)" class="delayed-warning">
                      ⚠️ 已延期
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card-actions" @click.stop>
                  <el-button 
                    v-if="!schedule.teacher_confirmed" 
                    type="success" 
                    size="small"
                    @click="handleConfirmSchedule(schedule)"
                  >
                    确认接收
                  </el-button>
                  <el-button type="primary" size="small" @click="handleViewCourse(schedule)">
                    查看内容
                  </el-button>
                  <el-button 
                    v-if="schedule.schedule_status === 'in_progress'"
                    type="success" 
                    size="small"
                    @click="handleStartLesson(schedule)"
                  >
                    开始上课
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- AI互动课件 -->
        <el-tab-pane label="我的互动课件" name="interactive">
          <div class="interactive-section">
            <div class="section-header">
              <p class="section-description">使用AI生成的互动课件可以关联到分配的课程中</p>
              <el-button type="primary" @click="goToCreateInteractive">
                <el-icon><MagicStick /></el-icon>
                创建互动课件
              </el-button>
            </div>
            
            <!-- 互动课件列表 -->
            <div class="interactive-list">
              <el-empty v-if="!interactiveCourses.length" description="暂无互动课件">
                <el-button type="primary" @click="goToCreateInteractive">创建第一个互动课件</el-button>
              </el-empty>
              
              <div v-else class="interactive-cards-grid">
                <div 
                  v-for="item in interactiveCourses" 
                  :key="item.id" 
                  class="interactive-card"
                >
                  <div class="card-icon">🎮</div>
                  <div class="card-info">
                    <div class="card-title">{{ item.name }}</div>
                    <div class="card-domain">{{ item.domain }}</div>
                  </div>
                  <div class="card-link-status">
                    <el-tag v-if="item.linked_course" type="success" size="small">
                      已关联
                    </el-tag>
                    <el-tag v-else size="small">
                      未关联
                    </el-tag>
                  </div>
                  <div class="card-actions">
                    <el-button 
                      v-if="!item.linked_course"
                      type="primary" 
                      link 
                      size="small"
                      @click="handleLinkToCourse(item)"
                    >
                      关联课程
                    </el-button>
                    <el-button type="info" link size="small" @click="handlePreviewInteractive(item)">
                      预览
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 课程内容查看对话框 -->
      <el-drawer
        v-model="courseDrawerVisible"
        :title="currentSchedule?.course?.course_name"
        direction="rtl"
        size="60%"
        class="course-content-drawer"
      >
        <div v-if="currentSchedule?.course" class="drawer-content">
          <!-- 课程基本信息 -->
          <div class="course-info-section">
            <div class="info-row">
              <span class="label">课程类型:</span>
              <el-tag :type="currentSchedule.course.course_type === 'brain_science' ? 'danger' : 'primary'" size="small">
                {{ currentSchedule.course.course_type === 'brain_science' ? '脑科学课程' : '自定义课程' }}
              </el-tag>
            </div>
            <div class="info-row">
              <span class="label">年龄组:</span>
              <span>{{ getAgeGroupLabel(currentSchedule.course.age_group) }}</span>
            </div>
            <div class="info-row">
              <span class="label">学期:</span>
              <span>{{ currentSchedule.course.semester }} {{ currentSchedule.course.academic_year }}</span>
            </div>
            <div class="info-row" v-if="currentSchedule.course.objectives">
              <span class="label">教学目标:</span>
              <span>{{ currentSchedule.course.objectives }}</span>
            </div>
          </div>

          <!-- 课程内容列表 -->
          <div class="course-contents-section">
            <h4>课程内容</h4>
            <el-empty v-if="!currentCourseContents.length" description="暂无课程内容" />
            <div v-else class="content-list">
              <div 
                v-for="(content, index) in currentCourseContents" 
                :key="content.id"
                class="content-item"
              >
                <div class="content-order">{{ index + 1 }}</div>
                <div class="content-type-icon">
                  {{ getContentTypeIcon(content.content_type) }}
                </div>
                <div class="content-info">
                  <div class="content-title">
                    {{ content.content_title }}
                    <el-tag v-if="content.is_required" type="danger" size="small">必学</el-tag>
                  </div>
                  <div class="content-meta">
                    <span>{{ getContentTypeLabel(content.content_type) }}</span>
                    <span v-if="content.duration_minutes">{{ content.duration_minutes }}分钟</span>
                  </div>
                </div>
                <div class="content-preview">
                  <!-- 文本预览 -->
                  <template v-if="content.content_type === 'text'">
                    <div class="text-preview">{{ getTextPreview(content.content_data?.text) }}</div>
                  </template>
                  <!-- 图片预览 -->
                  <template v-else-if="content.content_type === 'image'">
                    <el-image 
                      v-if="content.content_data?.image_url"
                      :src="content.content_data.image_url" 
                      class="image-preview"
                      fit="cover"
                      :preview-src-list="[content.content_data.image_url]"
                    />
                  </template>
                  <!-- 视频预览 -->
                  <template v-else-if="content.content_type === 'video'">
                    <div class="video-preview" @click="playVideo(content)">
                      <el-image 
                        v-if="content.content_data?.video_cover"
                        :src="content.content_data.video_cover" 
                        class="video-cover"
                        fit="cover"
                      />
                      <el-icon class="play-icon" :size="32"><VideoPlay /></el-icon>
                    </div>
                  </template>
                  <!-- 互动课件 -->
                  <template v-else-if="content.content_type === 'interactive'">
                    <el-button type="primary" size="small" @click="playInteractive(content)">
                      <el-icon><MagicStick /></el-icon>
                      启动互动课件
                    </el-button>
                  </template>
                </div>
                <!-- 教学备注 -->
                <div v-if="content.teaching_notes" class="teaching-notes">
                  <el-icon><InfoFilled /></el-icon>
                  {{ content.teaching_notes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>

      <!-- 关联课程对话框 -->
      <el-dialog
        v-model="linkDialogVisible"
        title="关联到课程"
        width="500px"
        :close-on-click-modal="false"
      >
        <p>选择要关联的课程：</p>
        <el-select 
          v-model="linkForm.course_id" 
          placeholder="选择课程" 
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="schedule in schedules"
            :key="schedule.course_id"
            :label="schedule.course?.course_name"
            :value="schedule.course_id"
          />
        </el-select>
        <template #footer>
          <el-button @click="linkDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="linkLoading" @click="handleSaveLink">
            确认关联
          </el-button>
        </template>
      </el-dialog>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import {
  Refresh,
  HomeFilled,
  MagicStick,
  VideoPlay,
  InfoFilled
} from '@element-plus/icons-vue';
import {
  getTeacherCourses,
  getCourseContents,
  confirmSchedule,
  linkInteractiveCourse,
  type CourseSchedule,
  type CourseContent
} from '@/api/endpoints/custom-course';
import { classApi } from '@/api/endpoints/class';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const activeTab = ref('my-courses');

// 统计数据
const scheduleStats = computed(() => {
  const total = schedules.value.length;
  const in_progress = schedules.value.filter(s => s.schedule_status === 'in_progress').length;
  const completed = schedules.value.filter(s => s.schedule_status === 'completed').length;
  const pending = schedules.value.filter(s => !s.teacher_confirmed).length;
  return { total, in_progress, completed, pending };
});

// 筛选
const filter = reactive({
  status: '',
  class_id: undefined as number | undefined
});

// 数据
const schedules = ref<CourseSchedule[]>([]);
const classList = ref<Array<{ id: number; class_name: string }>>([]);
const interactiveCourses = ref<Array<{ id: number; name: string; domain: string; linked_course?: string }>>([]);

// 当前选中的排期
const currentSchedule = ref<CourseSchedule | null>(null);
const currentCourseContents = ref<CourseContent[]>([]);
const courseDrawerVisible = ref(false);

// 关联对话框
const linkDialogVisible = ref(false);
const linkLoading = ref(false);
const linkForm = reactive({
  interactive_id: undefined as number | undefined,
  course_id: undefined as number | undefined
});

// 加载课程排期
const loadSchedules = async () => {
  try {
    loading.value = true;
    const res = await getTeacherCourses({
      status: filter.status || undefined,
      class_id: filter.class_id
    });
    if (res.success) {
      schedules.value = res.data;
      
      // 提取班级列表
      const classMap = new Map();
      res.data.forEach((s: CourseSchedule) => {
        if (s.class && !classMap.has(s.class.id)) {
          classMap.set(s.class.id, s.class);
        }
      });
      classList.value = Array.from(classMap.values());
    }
  } catch (error) {
    console.error('加载课程失败:', error);
    ElMessage.error('加载课程失败');
  } finally {
    loading.value = false;
  }
};

// 获取状态类型
const getStatusType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'delayed': 'danger',
    'cancelled': 'info'
  };
  return typeMap[status] || 'info';
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

// 获取进度状态
const getProgressStatus = (schedule: CourseSchedule): 'success' | 'exception' | '' => {
  const percentage = schedule.completed_sessions / schedule.total_sessions;
  if (percentage >= 1) return 'success';
  if (schedule.schedule_status === 'delayed') return 'exception';
  return '';
};

// 格式化日期
const formatDate = (date: string): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// 检查是否延期
const isDelayed = (schedule: CourseSchedule): boolean => {
  if (schedule.schedule_status === 'completed' || schedule.schedule_status === 'cancelled') {
    return false;
  }
  return new Date() > new Date(schedule.planned_end_date);
};

// 获取年龄组标签
const getAgeGroupLabel = (ageGroup: string): string => {
  const labels: Record<string, string> = {
    '3-4': '小班(3-4岁)',
    '4-5': '中班(4-5岁)',
    '5-6': '大班(5-6岁)',
    '3-6': '全年龄段'
  };
  return labels[ageGroup] || ageGroup;
};

// 获取内容类型图标
const getContentTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'text': '📝',
    'image': '🖼️',
    'video': '🎬',
    'interactive': '🎮',
    'document': '📄'
  };
  return iconMap[type] || '📋';
};

// 获取内容类型标签
const getContentTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'text': '文本',
    'image': '图片',
    'video': '视频',
    'interactive': '互动课件',
    'document': '文档'
  };
  return labelMap[type] || type;
};

// 获取文本预览
const getTextPreview = (text?: string): string => {
  if (!text) return '';
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};

// 确认接收课程
const handleConfirmSchedule = async (schedule: CourseSchedule) => {
  try {
    await ElMessageBox.confirm('确认接收此课程？确认后将开始计入教学进度。', '确认接收');
    const res = await confirmSchedule(schedule.id);
    if (res.success) {
      ElMessage.success('确认成功');
      await loadSchedules();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认失败:', error);
      ElMessage.error('确认失败');
    }
  }
};

// 查看课程内容
const handleViewCourse = async (schedule: CourseSchedule) => {
  currentSchedule.value = schedule;
  
  // 加载课程内容
  if (schedule.course_id) {
    try {
      const res = await getCourseContents(schedule.course_id);
      if (res.success) {
        currentCourseContents.value = res.data;
      }
    } catch (error) {
      console.error('加载课程内容失败:', error);
    }
  }
  
  courseDrawerVisible.value = true;
};

// 开始上课
const handleStartLesson = (schedule: CourseSchedule) => {
  ElMessage.info('开始上课功能开发中');
  // TODO: 跳转到上课记录页面
};

// 播放视频
const playVideo = (content: CourseContent) => {
  if (content.content_data?.video_url) {
    window.open(content.content_data.video_url, '_blank');
  }
};

// 播放互动课件
const playInteractive = (content: CourseContent) => {
  if (content.content_data?.interactive_id) {
    router.push(`/teacher-center/creative-curriculum/play/${content.content_data.interactive_id}`);
  }
};

// 跳转到创建互动课件
const goToCreateInteractive = () => {
  router.push('/teacher-center/creative-curriculum');
};

// 关联到课程
const handleLinkToCourse = (item: any) => {
  linkForm.interactive_id = item.id;
  linkForm.course_id = undefined;
  linkDialogVisible.value = true;
};

// 保存关联
const handleSaveLink = async () => {
  if (!linkForm.course_id || !linkForm.interactive_id) {
    ElMessage.warning('请选择要关联的课程');
    return;
  }

  try {
    linkLoading.value = true;
    const res = await linkInteractiveCourse(linkForm.course_id, {
      creative_curriculum_id: linkForm.interactive_id
    });
    if (res.success) {
      ElMessage.success('关联成功');
      linkDialogVisible.value = false;
      // TODO: 刷新互动课件列表
    }
  } catch (error) {
    console.error('关联失败:', error);
    ElMessage.error('关联失败');
  } finally {
    linkLoading.value = false;
  }
};

// 预览互动课件
const handlePreviewInteractive = (item: any) => {
  router.push(`/teacher-center/creative-curriculum/preview/${item.id}`);
};

// 初始化
onMounted(() => {
  loadSchedules();
});
</script>

<style lang="scss" scoped>
.teacher-courses-page {
  padding: 20px;
}

// 统计区域
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);

  .stat-icon {
    font-size: 36px;
  }

  .stat-content {
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .stat-label {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  &.total {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  }

  &.in-progress {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  }

  &.completed {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  }

  &.pending {
    background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
  }
}

// Tab样式
.course-tabs {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
}

// 筛选工具栏
.filter-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;

  .flex-grow {
    flex: 1;
  }
}

// 课程卡片网格
.course-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-schedule-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.needs-confirm {
    border-color: var(--el-color-warning-light-3);
  }

  .card-cover {
    height: 120px;
    position: relative;
    background: var(--el-fill-color-light);

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .course-type-icon {
        font-size: 48px;
      }
    }

    .card-badges {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      gap: 6px;
    }
  }

  .card-content {
    padding: 16px;

    .course-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .course-meta {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;

      .class-name {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .progress-section {
      margin-bottom: 12px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 6px;
      }
    }

    .time-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .delayed-warning {
        color: var(--el-color-danger);
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    justify-content: flex-end;
  }
}

// 互动课件区域
.interactive-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-description {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
  }
}

.interactive-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interactive-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .card-icon {
    font-size: 32px;
  }

  .card-info {
    flex: 1;

    .card-title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .card-domain {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
  }
}

// 抽屉内容
.drawer-content {
  padding: 0 20px;
}

.course-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;

  .info-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: var(--el-text-color-secondary);
      min-width: 80px;
    }
  }
}

.course-contents-section {
  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  .content-order {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
  }

  .content-type-icon {
    font-size: 24px;
  }

  .content-info {
    flex: 1;
    min-width: 150px;

    .content-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .content-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .content-preview {
    width: 100%;
    margin-top: 12px;

    .text-preview {
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.6;
    }

    .image-preview {
      width: 200px;
      height: 120px;
      border-radius: 4px;
      cursor: pointer;
    }

    .video-preview {
      width: 200px;
      height: 120px;
      position: relative;
      cursor: pointer;
      border-radius: 4px;
      overflow: hidden;
      background: var(--el-fill-color);
      display: flex;
      align-items: center;
      justify-content: center;

      .video-cover {
        width: 100%;
        height: 100%;
      }

      .play-icon {
        position: absolute;
        color: white;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        padding: 8px;
      }
    }
  }

  .teaching-notes {
    width: 100%;
    margin-top: 12px;
    padding: 10px;
    background: var(--el-color-info-light-9);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .course-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>


