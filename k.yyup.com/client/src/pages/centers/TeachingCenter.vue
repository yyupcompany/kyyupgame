<template>
  <UnifiedCenterLayout
    title="教学中心"
    description="管理脑科学课程、自定义课程和教学进度"
    :show-header="true"
    :show-title="true"
  >
    <div class="teaching-center">
      <!-- 顶部操作栏 -->
      <div class="header-bar">
        <div class="header-left"></div>
        <el-button type="primary" class="create-btn">
          <el-icon><Plus /></el-icon>
          新建课程
        </el-button>
      </div>

      <!-- Tab页面 -->
      <el-tabs v-model="activeTab" class="teaching-tabs" @tab-change="handleTabChange">
        <!-- Tab1: 脑科学课程 -->
        <el-tab-pane label="脑科学课程" name="brain-science">
          <!-- 四进度时间轴 -->
          <div class="progress-timeline">
            <div 
              v-for="(phase, index) in brainSciencePhases" 
              :key="phase.key"
              class="phase-item"
              :class="{ 'active': phase.status === 'active', 'completed': phase.status === 'completed' }"
            >
              <div class="phase-icon">{{ phase.icon }}</div>
              <div class="phase-info">
                <div class="phase-title">{{ phase.title }}</div>
                <div class="phase-subtitle">{{ phase.subtitle }}</div>
              </div>
              <div class="phase-progress">
                <el-progress :percentage="phase.progress" :stroke-width="8" />
              </div>
              <div class="phase-connector" v-if="index < brainSciencePhases.length - 1"></div>
            </div>
          </div>

          <!-- 脑科学课程列表 -->
          <div class="course-list-section">
            <div class="section-header">
              <span>课程列表</span>
              <el-button type="primary" @click="handleCreateBrainScienceCourse">
                <UnifiedIcon name="Plus" />
                创建脑科学课程
              </el-button>
            </div>
            <DataTable
              :data="brainScienceCourses"
              :columns="brainScienceColumns"
              :loading="loading"
              :total="brainScienceCourses.length"
            >
              <template #column-courseName="{ row }">
                <div class="course-name-cell">
                  <span class="course-name">{{ row.course_name }}</span>
                  <el-tag v-if="row.status === 'published'" type="success" size="small">已发布</el-tag>
                  <el-tag v-else-if="row.status === 'draft'" type="info" size="small">草稿</el-tag>
                </div>
              </template>
              <template #column-ageGroup="{ row }">
                {{ getAgeGroupLabel(row.age_group) }}
              </template>
              <template #column-progressConfig="{ row }">
                <div v-if="row.progress_config" class="progress-config">
                  <span>室内{{ row.progress_config.indoor_weeks }}周</span>
                  <span>户外{{ row.progress_config.outdoor_weeks }}周</span>
                </div>
                <span v-else class="text-secondary">未配置</span>
              </template>
              <template #column-actions="{ row }">
                <el-button type="primary" link @click="handleEditCourse(row)">编辑</el-button>
                <el-button type="success" link @click="handleScheduleCourse(row)">排期</el-button>
                <el-button
                  v-if="row.status === 'draft'"
                  type="warning"
                  link
                  @click="handlePublishCourse(row)"
                >
                  发布
                </el-button>
              </template>
            </DataTable>
          </div>
        </el-tab-pane>

        <!-- Tab2: 自定义课程 -->
        <el-tab-pane label="自定义课程" name="custom-courses">
          <!-- 筛选工具栏 -->
          <div class="filter-toolbar">
            <el-input
              v-model="customFilter.search"
              placeholder="搜索课程名称"
              clearable
              style="width: 200px"
              @clear="loadCustomCourses"
              @keyup.enter="loadCustomCourses"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
            <el-select v-model="customFilter.status" placeholder="状态" clearable style="width: 120px" @change="loadCustomCourses">
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-select v-model="customFilter.age_group" placeholder="年龄组" clearable style="width: 120px" @change="loadCustomCourses">
              <el-option label="小班(3-4岁)" value="3-4" />
              <el-option label="中班(4-5岁)" value="4-5" />
              <el-option label="大班(5-6岁)" value="5-6" />
              <el-option label="全年龄段" value="3-6" />
            </el-select>
            <div class="flex-grow"></div>
            <el-button type="primary" @click="handleCreateCustomCourse">
              <UnifiedIcon name="Plus" />
              创建课程
            </el-button>
          </div>

          <!-- 课程卡片列表 -->
          <div class="course-cards">
            <el-empty v-if="!customCourses.length && !loading" description="暂无自定义课程">
              <el-button type="primary" @click="handleCreateCustomCourse">创建第一个课程</el-button>
            </el-empty>
            <div v-else class="cards-grid">
              <div
                v-for="course in customCourses"
                :key="course.id"
                class="course-card"
                @click="handleViewCourse(course)"
              >
                <div class="card-cover">
                  <el-image
                    v-if="course.thumbnail_url"
                    :src="course.thumbnail_url"
                    fit="cover"
                    class="cover-image"
                  />
                  <div v-else class="cover-placeholder">
                    <UnifiedIcon name="Document" :size="40" />
                  </div>
                  <div class="card-status">
                    <el-tag v-if="course.status === 'published'" type="success" size="small">已发布</el-tag>
                    <el-tag v-else-if="course.status === 'draft'" type="info" size="small">草稿</el-tag>
                    <el-tag v-else type="warning" size="small">已归档</el-tag>
                  </div>
                </div>
                <div class="card-content">
                  <div class="card-title">{{ course.course_name }}</div>
                  <div class="card-meta">
                    <span>{{ getAgeGroupLabel(course.age_group) }}</span>
                    <span>{{ course.total_sessions || 16 }}课时</span>
                  </div>
                  <div class="card-description">{{ course.course_description || '暂无描述' }}</div>
                </div>
                <div class="card-actions" @click.stop>
                  <el-button type="primary" link size="small" @click="handleEditCourse(course)">
                    <UnifiedIcon name="Edit" />
                    编辑
                  </el-button>
                  <el-button type="success" link size="small" @click="handleScheduleCourse(course)">
                    <UnifiedIcon name="Calendar" />
                    排期
                  </el-button>
                  <el-dropdown trigger="click">
                    <el-button type="info" link size="small">
                      <UnifiedIcon name="More" />
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handlePublishCourse(course)" v-if="course.status === 'draft'">
                          <UnifiedIcon name="Check" />发布
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleArchiveCourse(course)" v-if="course.status === 'published'">
                          <UnifiedIcon name="FolderOpened" />归档
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteCourse(course)" divided>
                          <UnifiedIcon name="Delete" />删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-container" v-if="customTotal > customPageSize">
            <el-pagination
              v-model:current-page="customPage"
              v-model:page-size="customPageSize"
              :total="customTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadCustomCourses"
              @current-change="loadCustomCourses"
            />
          </div>
        </el-tab-pane>

        <!-- Tab3: 进度监控 -->
        <el-tab-pane label="进度监控" name="progress-monitor">
          <!-- 延期告警列表 -->
          <div class="alert-section" v-if="delayedSchedules.length">
            <div class="section-header alert-header">
              <span>⚠️ 延期告警 ({{ delayedSchedules.length }})</span>
              <el-button type="primary" link @click="refreshDelayedSchedules">刷新</el-button>
            </div>
            <div class="alert-list">
              <div
                v-for="schedule in delayedSchedules"
                :key="schedule.id"
                class="alert-item"
                :class="schedule.alert_level"
              >
                <div class="alert-icon">
                  <UnifiedIcon v-if="schedule.alert_level === 'critical'" name="Warning" />
                  <UnifiedIcon v-else name="Clock" />
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ schedule.course?.course_name }}</div>
                  <div class="alert-meta">
                    <span>{{ schedule.class?.class_name }}</span>
                    <span>{{ schedule.teacher?.name }}</span>
                  </div>
                </div>
                <div class="alert-message" :class="schedule.alert_level">
                  {{ schedule.alert_message }}
                </div>
                <el-button type="primary" size="small" @click="handleViewSchedule(schedule)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>

          <!-- 教师完成度统计 -->
          <div class="teacher-stats-section">
            <div class="section-header">
              <span>教师课程完成度</span>
            </div>
            <DataTable
              :data="teacherStats"
              :columns="teacherStatsColumns"
              :loading="loading"
              :total="teacherStats.length"
              :pagination-enabled="false"
            >
              <template #column-totalCourses="{ row }">
                {{ row.total_courses }}
              </template>
              <template #column-inProgress="{ row }">
                {{ row.in_progress }}
              </template>
              <template #column-completed="{ row }">
                {{ row.completed }}
              </template>
              <template #column-completionRate="{ row }">
                <el-progress
                  :percentage="row.completion_rate"
                  :status="row.completion_rate >= 80 ? 'success' : (row.completion_rate >= 50 ? '' : 'exception')"
                />
              </template>
              <template #column-delayed="{ row }">
                <el-tag v-if="row.delayed > 0" type="danger" size="small">{{ row.delayed }}</el-tag>
                <span v-else>-</span>
              </template>
            </DataTable>
          </div>
        </el-tab-pane>

        <!-- Tab4: 互动课件管理 -->
        <el-tab-pane label="互动课件管理" name="interactive-courses">
          <!-- 教师筛选 -->
          <div class="filter-toolbar">
            <el-select 
              v-model="interactiveFilter.teacher_id" 
              placeholder="选择教师" 
              clearable
              style="width: 200px"
              @change="loadInteractiveCourses"
            >
              <el-option 
                v-for="teacher in teacherList" 
                :key="teacher.id" 
                :label="teacher.name" 
                :value="teacher.id"
              />
            </el-select>

            <el-select 
              v-model="interactiveFilter.status" 
              placeholder="课件状态" 
              clearable
              style="width: 200px"
              @change="loadInteractiveCourses"
            >
              <el-option label="所有" value="" />
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已关联" value="linked" />
            </el-select>

            <el-button type="primary" @click="loadInteractiveCourses">刷新</el-button>
          </div>

          <!-- 互动课件列表 -->
          <DataTable
            :data="interactiveCourses"
            :columns="interactiveColumns"
            :loading="loading"
            :total="interactiveCourses.length"
            :pagination-enabled="false"
          >
            <template #column-courseName="{ row }">
              <div class="course-name-cell">
                <span class="course-name">{{ row.course_name }}</span>
                <el-tag
                  v-if="row.status === 'published'"
                  type="success"
                  size="small"
                >
                  已发布
                </el-tag>
                <el-tag
                  v-else-if="row.status === 'linked'"
                  type="primary"
                  size="small"
                >
                  已关联
                </el-tag>
                <el-tag
                  v-else
                  type="info"
                  size="small"
                >
                  草稿
                </el-tag>
              </div>
            </template>
            <template #column-createdAt="{ row }">
              {{ new Date(row.created_at).toLocaleString('zh-CN') }}
            </template>
            <template #column-actions="{ row }">
              <el-button
                link
                type="primary"
                @click="viewInteractiveCourse(row)"
              >
                查看
              </el-button>
              <el-button
                link
                type="primary"
                @click="showLinkedCourses(row)"
              >
                关联课程
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDeleteInteractive(row)"
              >
                删除
              </el-button>
            </template>
          </DataTable>
        </el-tab-pane>
      </el-tabs>

      <!-- 课程编辑对话框 -->
      <CourseEditDialog
        v-if="false"
        v-model:visible="courseDialogVisible"
        :course="editingCourse"
        :mode="courseDialogMode"
        @saved="handleCourseSaved"
      />

      <!-- 课程排期对话框 -->
      <CourseScheduleDialog
        v-if="false"
        v-model:visible="scheduleDialogVisible"
        :course="schedulingCourse"
        @saved="handleScheduleSaved"
      />
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';
import DataTable from '@/components/centers/DataTable.vue';
import CourseEditDialog from './components/CourseEditDialog.vue';
import CourseScheduleDialog from './components/CourseScheduleDialog.vue';
import {
  getCourses,
  getCourseStats,
  getDelayedSchedules,
  publishCourse,
  archiveCourse,
  deleteCourse,
  type CustomCourse,
  type CourseStats,
  type DelayedSchedule
} from '@/api/endpoints/custom-course';

// 响应式数据
const loading = ref(false);
const activeTab = ref('brain-science');

// 统计数据
const stats = reactive<CourseStats>({
  courses: {
    total: 0,
    published: 0,
    draft: 0,
    brain_science: 0,
    custom: 0
  },
  schedules: {
    total: 0,
    in_progress: 0,
    completed: 0,
    delayed: 0
  },
  interactiveCourses: {
    total: 0,
    published: 0,
    linked: 0
  }
});

// 脑科学课程四进度配置
const brainSciencePhases = computed(() => [
  {
    key: 'indoor',
    icon: '🏠',
    title: '室内课',
    subtitle: '每周1次，共16周',
    progress: 75,
    status: 'active'
  },
  {
    key: 'outdoor',
    icon: '🌳',
    title: '户外课',
    subtitle: '每周1次，共16周',
    progress: 60,
    status: 'active'
  },
  {
    key: 'display',
    icon: '🎭',
    title: '校外展示',
    subtitle: '每学期2次',
    progress: 50,
    status: 'pending'
  },
  {
    key: 'championship',
    icon: '🏆',
    title: '锦标赛',
    subtitle: '每学期1次',
    progress: 0,
    status: 'pending'
  }
]);

// 课程列表
const brainScienceCourses = ref<CustomCourse[]>([]);
const customCourses = ref<CustomCourse[]>([]);
const customPage = ref(1);
const customPageSize = ref(10);
const customTotal = ref(0);
const customFilter = reactive({
  search: '',
  status: '',
  age_group: ''
});

// 延期告警
const delayedSchedules = ref<DelayedSchedule[]>([]);

// 教师统计数据（模拟）
const teacherStats = ref([
  { id: 1, name: '张老师', total_courses: 5, in_progress: 3, completed: 2, delayed: 0, completion_rate: 40 },
  { id: 2, name: '李老师', total_courses: 4, in_progress: 2, completed: 1, delayed: 1, completion_rate: 25 },
  { id: 3, name: '王老师', total_courses: 6, in_progress: 1, completed: 5, delayed: 0, completion_rate: 83 }
]);

// 互动课件数据
const interactiveCourses = ref<any[]>([]);
const teacherList = ref<any[]>([]);
const interactiveFilter = reactive({
  teacher_id: undefined as number | undefined,
  status: ''
});

// 对话框状态
const courseDialogVisible = ref(false);
const courseDialogMode = ref<'create' | 'edit'>('create');
const editingCourse = ref<CustomCourse | null>(null);
const scheduleDialogVisible = ref(false);
const schedulingCourse = ref<CustomCourse | null>(null);

// DataTable column configurations
const brainScienceColumns = computed(() => [
  {
    key: 'course_name',
    label: '课程名称',
    minWidth: 180,
    slot: 'courseName'
  },
  {
    key: 'age_group',
    label: '年龄组',
    width: 100,
    slot: 'ageGroup'
  },
  {
    key: 'semester',
    label: '学期',
    width: 120
  },
  {
    key: 'total_sessions',
    label: '总课时',
    width: 80,
    align: 'center'
  },
  {
    key: 'progress_config',
    label: '四进度配置',
    width: 200,
    slot: 'progressConfig'
  },
  {
    key: 'actions',
    label: '操作',
    width: 180,
    fixed: 'right',
    slot: 'actions'
  }
]);

const teacherStatsColumns = computed(() => [
  {
    key: 'name',
    label: '教师',
    width: 120
  },
  {
    key: 'total_courses',
    label: '分配课程',
    width: 100,
    align: 'center',
    slot: 'totalCourses'
  },
  {
    key: 'in_progress',
    label: '进行中',
    width: 100,
    align: 'center',
    slot: 'inProgress'
  },
  {
    key: 'completed',
    label: '已完成',
    width: 100,
    align: 'center',
    slot: 'completed'
  },
  {
    key: 'completion_rate',
    label: '完成率',
    width: 150,
    slot: 'completionRate'
  },
  {
    key: 'delayed',
    label: '延期数',
    width: 80,
    align: 'center',
    slot: 'delayed'
  }
]);

const interactiveColumns = computed(() => [
  {
    key: 'teacher_name',
    label: '教师',
    width: 120
  },
  {
    key: 'course_name',
    label: '课件名称',
    minWidth: 200,
    slot: 'courseName'
  },
  {
    key: 'description',
    label: '描述',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    key: 'created_at',
    label: '创建时间',
    width: 180,
    slot: 'createdAt'
  },
  {
    key: 'linked_courses_count',
    label: '关联课程数',
    width: 100
  },
  {
    key: 'actions',
    label: '操作',
    width: 200,
    fixed: 'right',
    slot: 'actions'
  }
]);

// 获取年龄组标签
const getAgeGroupLabel = (ageGroup: string): string => {
  const labels: Record<string, string> = {
    '3-4': '小班',
    '4-5': '中班',
    '5-6': '大班',
    '3-6': '全年龄段'
  };
  return labels[ageGroup] || ageGroup;
};

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getCourseStats();
    if (res.success) {
      Object.assign(stats, res.data);
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

// 加载脑科学课程
const loadBrainScienceCourses = async () => {
  try {
    loading.value = true;
    const res = await getCourses({ course_type: 'brain_science', pageSize: 50 });
    if (res.success && res.data) {
      brainScienceCourses.value = res.data.list || [];
    }
  } catch (error) {
    console.error('加载脑科学课程失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载自定义课程
const loadCustomCourses = async () => {
  try {
    loading.value = true;
    const res = await getCourses({
      course_type: 'custom',
      page: customPage.value,
      pageSize: customPageSize.value,
      status: (customFilter.status as any) || undefined,
      age_group: customFilter.age_group || undefined,
      search: customFilter.search || undefined
    });
    if (res.success && res.data) {
      customCourses.value = res.data.list || [];
      customTotal.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('加载自定义课程失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载延期告警
const refreshDelayedSchedules = async () => {
  try {
    const res = await getDelayedSchedules();
    if (res.success && res.data) {
      delayedSchedules.value = res.data || [];
    }
  } catch (error) {
    console.error('加载延期告警失败:', error);
  }
};

// Tab切换处理
const handleTabChange = (tabName: string) => {
  if (tabName === 'brain-science') {
    loadBrainScienceCourses();
  } else if (tabName === 'custom-courses') {
    loadCustomCourses();
  } else if (tabName === 'progress-monitor') {
    refreshDelayedSchedules();
  } else if (tabName === 'interactive-courses') {
    loadInteractiveCourses();
  }
};

// 显示延期列表
const showDelayedList = () => {
  activeTab.value = 'progress-monitor';
};

// 加载互动课件
const loadInteractiveCourses = async () => {
  try {
    loading.value = true;
    // TODO: 从API获取互动课件列表，支持按教师筛选
    // const res = await getInteractiveCourses({
    //   teacher_id: interactiveFilter.teacher_id,
    //   status: interactiveFilter.status || undefined
    // });
    // if (res.success) {
    //   interactiveCourses.value = res.data;
    // }
    
    // 临时模拟数据
    interactiveCourses.value = [
      { 
        id: 1, 
        teacher_name: '张老师', 
        course_name: '数学思维开发', 
        description: '利用AI创建的交互式数学课件', 
        status: 'published',
        created_at: new Date().toISOString(),
        linked_courses_count: 3
      },
      { 
        id: 2, 
        teacher_name: '李老师', 
        course_name: '英语启蒙课程', 
        description: 'AI生成的英语学习互动课件',
        status: 'linked',
        created_at: new Date().toISOString(),
        linked_courses_count: 2
      }
    ];
  } catch (error) {
    console.error('加载互动课件失败:', error);
  } finally {
    loading.value = false;
  }
};

// 查看互动课件
const viewInteractiveCourse = (row: any) => {
  ElMessage.info(`查看课件: ${row.course_name}`);
  // TODO: 导航到课件详情页面或打开预览对话框
};

// 显示关联课程
const showLinkedCourses = (row: any) => {
  ElMessageBox.alert(`课件"${row.course_name}"已关联${row.linked_courses_count}个课程`, '关联课程信息');
};

// 删除互动课件
const handleDeleteInteractive = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除课件"${row.course_name}"吗？`,
    '删除确认'
  ).then(() => {
    ElMessage.success('课件已删除');
    loadInteractiveCourses();
  }).catch(() => {
    ElMessage.info('取消删除');
  });
};

// 创建脑科学课程
const handleCreateBrainScienceCourse = () => {
  courseDialogMode.value = 'create';
  editingCourse.value = {
    course_type: 'brain_science',
    progress_config: {
      indoor_weeks: 16,
      outdoor_weeks: 16,
      display_count: 2,
      championship_count: 1
    }
  } as any;
  courseDialogVisible.value = true;
};

// 创建自定义课程
const handleCreateCustomCourse = () => {
  courseDialogMode.value = 'create';
  editingCourse.value = {
    course_type: 'custom'
  } as any;
  courseDialogVisible.value = true;
};

// 查看课程
const handleViewCourse = (course: CustomCourse) => {
  handleEditCourse(course);
};

// 编辑课程
const handleEditCourse = (course: CustomCourse) => {
  courseDialogMode.value = 'edit';
  editingCourse.value = course;
  courseDialogVisible.value = true;
};

// 课程排期
const handleScheduleCourse = (course: CustomCourse) => {
  schedulingCourse.value = course;
  scheduleDialogVisible.value = true;
};

// 发布课程
const handlePublishCourse = async (course: CustomCourse) => {
  try {
    await ElMessageBox.confirm('确定要发布此课程吗？发布后教师可以查看和使用。', '确认发布');
    const res = await publishCourse(course.id);
    if (res.success) {
      ElMessage.success('发布成功');
      loadBrainScienceCourses();
      loadCustomCourses();
      loadStats();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error);
      ElMessage.error('发布失败');
    }
  }
};

// 归档课程
const handleArchiveCourse = async (course: CustomCourse) => {
  try {
    await ElMessageBox.confirm('确定要归档此课程吗？归档后将不再显示在课程列表中。', '确认归档');
    const res = await archiveCourse(course.id);
    if (res.success) {
      ElMessage.success('归档成功');
      loadCustomCourses();
      loadStats();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归档失败:', error);
      ElMessage.error('归档失败');
    }
  }
};

// 删除课程
const handleDeleteCourse = async (course: CustomCourse) => {
  try {
    await ElMessageBox.confirm('确定要删除此课程吗？此操作不可恢复。', '确认删除', {
      type: 'warning'
    });
    const res = await deleteCourse(course.id);
    if (res.success) {
      ElMessage.success('删除成功');
      loadCustomCourses();
      loadStats();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 课程保存完成
const handleCourseSaved = () => {
  loadBrainScienceCourses();
  loadCustomCourses();
  loadStats();
};

// 排期保存完成
const handleScheduleSaved = () => {
  loadStats();
  refreshDelayedSchedules();
};

// 查看排期详情
const handleViewSchedule = (schedule: DelayedSchedule) => {
  if (schedule.course) {
    handleScheduleCourse(schedule.course as CustomCourse);
  }
};

// 初始化
onMounted(async () => {
  loadStats();
  loadBrainScienceCourses();
  refreshDelayedSchedules();
  
  // 加载教师列表用于互动课件筛选
  // TODO: 从API获取教师列表
  // const res = await getTeacherList();
  // if (res.success) {
  //   teacherList.value = res.data;
  // }
  
  // 临时使用静态教师列表
  teacherList.value = teacherStats.value;
});
</script>

<style lang="scss" scoped>
@use '@/styles/design-tokens.scss' as *;

.teaching-center {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
}

// 顶部操作栏
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);

  .header-left {
    flex: 1;
  }

  .create-btn {
    border-radius: var(--radius-md);
    height: 40px;
    font-size: var(--text-sm);
  }
}

// Tabs样式
.teaching-tabs {
  background: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 var(--spacing-xl);
    border-bottom: 2px solid var(--border-color);
    background: var(--bg-card);
  }

  :deep(.el-tabs__nav) {
    display: flex;
    gap: var(--spacing-3xl);
  }

  :deep(.el-tabs__item) {
    padding: 12px 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    border: none;
    margin: 0;

    &:hover {
      color: var(--primary-color);
    }

    &.is-active {
      color: var(--primary-color);
      border-bottom: 3px solid var(--primary-color);
    }
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-xl);
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.tab-header {
  margin-bottom: var(--spacing-xl);

  h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .tab-description {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

// 进度时间轴
.progress-timeline {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: 12px;

  .phase-item {
    flex-shrink: 0;
    text-align: center;
    min-width: 120px;
  }
}

// 课程卡片
.course-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: var(--spacing-md);
  transition: all 0.3s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

// 内容部分通用样式
.alert-section,
.stats-table,
.course-grid {
  margin-bottom: var(--spacing-xl);
}

// 四进度时间轴
.progress-timeline {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);
  background: var(--bg-page);
  border-radius: var(--radius-lg);
  position: relative;
}

.phase-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-md);
  position: relative;

  .phase-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .phase-info {
    .phase-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .phase-subtitle {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }

  .phase-progress {
    width: 80%;
    margin-top: 12px;
  }

  .phase-connector {
    position: absolute;
    top: 40px;
    right: 0;
    width: 50%;
    height: 2px;
    background: var(--border-color);

    &::after {
      content: '';
      position: absolute;
      right: -5px;
      top: -4px;
      border: 5px solid transparent;
      border-left-color: var(--border-color);
    }
  }

  &.active {
    .phase-icon {
      animation: pulse 2s infinite;
    }
  }

  &.completed {
    .phase-connector {
      background: var(--success-color);

      &::after {
        border-left-color: var(--success-color);
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

// Section header
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);

  &.alert-header {
    color: var(--warning-color);
  }
}

// 课程表格
.course-table {
  .course-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .progress-config {
    display: flex;
    gap: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// 筛选工具栏
.filter-toolbar {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  align-items: center;

  .flex-grow {
    flex: 1;
  }
}

// 课程卡片
.course-cards {
  min-height: 200px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.course-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .card-cover {
    height: 140px;
    position: relative;
    background: var(--bg-page);

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
      color: var(--text-muted);
    }

    .card-status {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }

  .card-content {
    padding: var(--spacing-md);

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      gap: var(--spacing-md);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .card-description {
      font-size: var(--text-sm);
      color: var(--text-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 12px var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }
}

// 分页
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

// 延期告警
.alert-section {
  margin-bottom: var(--spacing-xl);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-page);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--warning-color);

  &.critical {
    border-left-color: var(--danger-color);
    background: rgba(var(--danger-color-rgb), 0.1);
  }

  &.warning {
    border-left-color: var(--warning-color);
    background: rgba(var(--warning-color-rgb), 0.1);
  }

  .alert-icon {
    font-size: var(--text-2xl);
    color: var(--warning-color);
  }

  &.critical .alert-icon {
    color: var(--danger-color);
  }

  .alert-content {
    flex: 1;

    .alert-title {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .alert-meta {
      display: flex;
      gap: var(--spacing-md);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }

  .alert-message {
    font-weight: 600;
    padding: 4px var(--spacing-md);
    border-radius: var(--radius-sm);

    &.warning {
      background: rgba(var(--warning-color-rgb), 0.2);
      color: var(--warning-color-dark);
    }

    &.critical {
      background: rgba(var(--danger-color-rgb), 0.2);
      color: var(--danger-color-dark);
    }
  }
}

// 教师统计表格
.teacher-stats-section {
  .teacher-stats-table {
    width: 100%;
  }
}

// 响应式
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-timeline {
    flex-direction: column;
    gap: 16px;
  }

  .phase-item .phase-connector {
    display: none;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
