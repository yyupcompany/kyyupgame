<template>
  <CenterContainer
    :title="activity.title || '活动详情'"
    :show-header="true"
    :show-actions="true"
  >
    <template #header-actions>
      <el-tag :type="getTagType(activity.status)" size="large">
        {{ getStatusText(activity.status) }}
      </el-tag>
    </template>

    <template #content>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-else-if="error"
      :type="'error'"
      :title="error"
      description="无法加载活动计划详情，请稍后重试"
      show-icon
    />

    <!-- 数据展示 -->
    <template v-else>


      <!-- 活动基本信息卡片 -->
      <div class="card card--primary">
        <div class="card-header">
          <h3 class="card-title with-icon">
            <el-icon class="card-icon"><InfoFilled /></el-icon>
            活动信息
          </h3>
        </div>
        <div class="card-body">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="活动ID">{{ activity.id }}</el-descriptions-item>
            <el-descriptions-item label="活动标题">{{ activity.title || '暂无标题' }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatDate(activity.startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatDate(activity.endTime) }}</el-descriptions-item>
            <el-descriptions-item label="活动地点">{{ activity.location || '暂无地点' }}</el-descriptions-item>
            <el-descriptions-item label="活动容量">{{ activity.capacity || 0 }} 人</el-descriptions-item>
            <el-descriptions-item label="已报名人数">{{ activity.registeredCount || 0 }} 人</el-descriptions-item>
            <el-descriptions-item label="活动费用">{{ activity.fee ? activity.fee + ' 元' : '免费' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始时间">{{ formatDate(activity.registrationStartTime) }}</el-descriptions-item>
            <el-descriptions-item label="报名结束时间">{{ formatDate(activity.registrationEndTime) }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(activity.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(activity.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="活动描述" :span="2">
              <div class="description-content">{{ activity.description || '暂无描述' }}</div>
            </el-descriptions-item>
            <el-descriptions-item v-if="activity.agenda" label="活动议程" :span="2">
              <div class="description-content">{{ activity.agenda }}</div>
            </el-descriptions-item>
            <el-descriptions-item v-if="activity.remark" label="备注" :span="2">
              <div class="description-content">{{ activity.remark }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 海报和营销功能卡片 -->
      <div class="card card--warning">
        <div class="card-header">
          <h3 class="card-title with-icon">
            <el-icon class="card-icon"><Picture /></el-icon>
            宣传海报与营销
          </h3>
        </div>
        <div class="card-body">
          <div class="poster-actions">
            <el-button
              @click="generatePoster"
              type="primary"
              :icon="Picture"
              :loading="posterLoading"
            >
              生成宣传海报
            </el-button>

            <el-button
              @click="previewPoster"
              type="success"
              :icon="View"
              :disabled="!activity.posterUrl"
            >
              预览海报
            </el-button>

            <el-button
              @click="publishActivityAction"
              type="warning"
              :icon="Upload"
              :disabled="activity.publishStatus === 1"
              :loading="publishLoading"
            >
              {{ activity.publishStatus === 1 ? '已发布' : '一键发布' }}
            </el-button>

            <el-dropdown @command="handleShare" :disabled="activity.publishStatus !== 1">
              <el-button type="info" :icon="Share">
                一键转发<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="wechat">微信分享</el-dropdown-item>
                <el-dropdown-item command="weibo">微博分享</el-dropdown-item>
                <el-dropdown-item command="qq">QQ分享</el-dropdown-item>
                <el-dropdown-item command="link">复制链接</el-dropdown-item>
                <el-dropdown-item command="qrcode">生成二维码</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

          <!-- 海报预览区域 -->
          <div v-if="activity.posterUrl" class="poster-preview">
            <el-image
              :src="activity.posterUrl"
              :preview-src-list="[activity.posterUrl]"
              fit="contain"
              style="width: 200px; height: 280px;"
              class="poster-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                  <span>海报加载失败</span>
                </div>
              </template>
            </el-image>

            <!-- 营销配置显示 -->
            <div v-if="activity.marketingConfig" class="marketing-config">
              <h4>营销配置</h4>
              <el-tag v-if="activity.marketingConfig.groupBuy" type="success" class="config-tag">
                团购 ({{ activity.marketingConfig.groupBuy.minPeople }}人成团)
              </el-tag>
              <el-tag v-if="activity.marketingConfig.points" type="primary" class="config-tag">
                积分 ({{ activity.marketingConfig.points.ratio }}% 返积分)
              </el-tag>
              <el-tag v-if="activity.marketingConfig.coupon" type="warning" class="config-tag">
                优惠券
              </el-tag>
              <el-tag v-if="activity.marketingConfig.referral" type="info" class="config-tag">
                推荐奖励
              </el-tag>
            </div>

            <!-- 分享统计 -->
            <div class="share-stats">
              <el-statistic title="分享次数" :value="activity.shareCount || 0" />
              <el-statistic title="浏览次数" :value="activity.viewCount || 0" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮卡片 -->
      <div class="card">
        <div class="card-body">
          <div class="action-buttons">
            <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
            <el-button @click="editActivity" type="primary" :icon="Edit">编辑</el-button>
            <el-button @click="confirmDelete" type="danger" :icon="Delete">删除</el-button>
          </div>
        </div>
      </div>
    </template>
    </template>
  </CenterContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import CenterContainer from '@/components/centers/CenterContainer.vue';
import {
  Picture,
  InfoFilled,
  View,
  Upload,
  Share,
  ArrowDown,
  ArrowLeft,
  Edit,
  Delete
} from '@element-plus/icons-vue';

// 统一API端点导入 - 修复：使用正确的活动端点
import { getActivityDetail, type Activity } from '@/api/modules/activity'
import { get, post, put, del } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import { ErrorHandler } from '@/utils/errorHandler'

// 活动海报相关API
import {
  generateActivityPoster,
  previewActivityPoster,
  publishActivity,
  shareActivity,
  getActivityShareStats,
  copyShareLink,
  openShareWindow,
  generateWeChatShareUrl,
  generateWeiboShareUrl,
  generateQQShareUrl,
  formatShareData
} from '@/api/modules/activity-poster'

// 活动状态枚举 - 与后端Activity模型对齐
enum ActivityStatus {
  PLANNED = 0,           // 计划中
  REGISTRATION_OPEN = 1, // 报名中
  FULL = 2,             // 已满员
  IN_PROGRESS = 3,      // 进行中
  FINISHED = 4,         // 已结束
  CANCELLED = 5         // 已取消
}

const router = useRouter();
const route = useRoute();
const activityId = ref<number>(Number(route.params.id));

const activity = ref<Activity>({} as Activity);
const loading = ref<boolean>(true);
const error = ref<string>('');

// 海报相关状态
const posterLoading = ref<boolean>(false);
const publishLoading = ref<boolean>(false);

onMounted(async () => {
  await fetchActivityDetail();
});

const fetchActivityDetail = async () => {
  if (!activityId.value || isNaN(activityId.value)) {
    error.value = '无效的活动ID';
    loading.value = false;
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await getActivityDetail(activityId.value)
    
    if (response.success && response.data) {
      // transformActivityData 已经处理了字段转换，直接使用
      activity.value = response.data;

      // 调试信息：打印接收到的数据
      console.log('活动详情数据:', {
        id: response.data.id,
        title: response.data.title,
        startTime: response.data.startTime,
        endTime: response.data.endTime,
        location: response.data.location,
        capacity: response.data.capacity,
        registeredCount: response.data.registeredCount,
        description: response.data.description
      });
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取活动详情失败'), false);
      error.value = errorInfo.message;
    }
  } catch (err) {
    const errorInfo = ErrorHandler.handle(err, false);
    error.value = errorInfo.message;
    console.error('Failed to fetch activity detail', err);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | Date): string => {
  if (!dateString) {
    return '暂无';
  }

  try {
    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效日期';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    console.error('日期格式化错误:', error, '原始值:', dateString);
    return '格式错误';
  }
};

const getTagType = (status: ActivityStatus): 'success' | 'warning' | 'info' | 'danger' => {
  switch (status) {
    case ActivityStatus.FINISHED:
      return 'success';
    case ActivityStatus.IN_PROGRESS:
    case ActivityStatus.REGISTRATION_OPEN:
      return 'warning';
    case ActivityStatus.PLANNED:
    case ActivityStatus.FULL:
      return 'info';
    case ActivityStatus.CANCELLED:
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusText = (status: ActivityStatus): string => {
  switch (status) {
    case ActivityStatus.PLANNED:
      return '计划中';
    case ActivityStatus.REGISTRATION_OPEN:
      return '报名中';
    case ActivityStatus.FULL:
      return '已满员';
    case ActivityStatus.IN_PROGRESS:
      return '进行中';
    case ActivityStatus.FINISHED:
      return '已结束';
    case ActivityStatus.CANCELLED:
      return '已取消';
    default:
      return '未知状态';
  }
};

const goBack = () => {
  // 检查浏览器历史记录
  if (window.history.length > 1) {
    // 尝试使用router.back()
    router.back();
  } else {
    // 如果没有历史记录，则导航到活动列表页面
    router.push('/activity');
  }

  // 添加超时保护，如果2秒内没有导航成功，则强制跳转到活动列表
  setTimeout(() => {
    if (router.currentRoute.value.path === route.path) {
      console.log('后退超时，强制跳转到活动列表');
      router.push('/activity');
    }
  }, 2000);
};

const editActivity = () => {
  router.push(`/activity/edit/${activityId.value}`);
};

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该活动计划，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const response = await del(`/activities/${activityId.value}`)
    if (response.success) {
      ElMessage.success('活动计划删除成功')
      // 删除成功后直接返回列表页
      router.push('/activity');
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '删除活动计划失败'));
      error.value = errorInfo.message;
    }
  } catch (err) {
    if (err !== 'cancel') {
      const errorInfo = ErrorHandler.handle(err);
      error.value = errorInfo.message;
      console.error('Failed to delete activity plan', err);
    }
  }
};

// 海报相关方法
const generatePoster = async () => {
  try {
    posterLoading.value = true;

    // 跳转到海报生成页面，传递活动信息
    router.push({
      path: '/principal/poster-editor',
      query: {
        activityId: activityId.value,
        activityTitle: activity.value.title,
        activityDescription: activity.value.description,
        startTime: activity.value.startDate,
        endTime: activity.value.endDate,
        location: activity.value.location || '',
        capacity: activity.value.participationTarget || 0
      }
    });
  } catch (error) {
    ElMessage.error('跳转海报编辑器失败');
    console.error('Generate poster error:', error);
  } finally {
    posterLoading.value = false;
  }
};

const previewPoster = () => {
  // 使用新的海报预览功能，包含营销配置
  router.push({
    path: '/activity/poster-preview',
    query: {
      activityId: activityId.value,
      activityTitle: activity.value.title,
      activityDescription: activity.value.description,
      startTime: activity.value.startDate,
      endTime: activity.value.endDate,
      location: activity.value.location || '',
      capacity: activity.value.participationTarget || 0,
      marketingConfig: JSON.stringify(activity.value.marketingConfig || {})
    }
  });
};

const publishActivityAction = async () => {
  try {
    publishLoading.value = true;

    // 调用发布API
    const response = await publishActivity(activityId.value, {
      publishChannels: ['wechat', 'weibo']
    });

    if (response.success) {
      ElMessage.success('活动发布成功！');
      // 更新活动状态
      activity.value.publishStatus = 1;
      await fetchActivityDetail(); // 重新获取数据
    } else {
      ElMessage.error(response.message || '发布失败');
    }
  } catch (error) {
    ElMessage.error('发布失败，请稍后重试');
    console.error('Publish activity error:', error);
  } finally {
    publishLoading.value = false;
  }
};

const handleShare = async (command: string) => {
  try {
    const shareData = formatShareData(activity.value, command);
    const response = await shareActivity(activityId.value, shareData);

    if (response.success) {
      const { shareContent, shareUrl } = response.data;

      switch (command) {
        case 'link':
          // 复制链接到剪贴板
          const copied = await copyShareLink(shareUrl);
          if (copied) {
            ElMessage.success('分享链接已复制到剪贴板');
          } else {
            ElMessage.error('复制失败，请手动复制');
          }
          break;
        case 'qrcode':
          // 显示二维码（这里可以集成二维码生成组件）
          ElMessage.success('二维码生成成功');
          break;
        case 'wechat':
          // 生成微信分享链接
          const wechatUrl = generateWeChatShareUrl(shareUrl, shareContent.title, shareContent.description);
          openShareWindow(wechatUrl, '微信分享');
          break;
        case 'weibo':
          // 生成微博分享链接
          const weiboUrl = generateWeiboShareUrl(shareUrl, shareContent.title);
          openShareWindow(weiboUrl, '微博分享');
          break;
        case 'qq':
          // 生成QQ分享链接
          const qqUrl = generateQQShareUrl(shareUrl, shareContent.title, shareContent.description);
          openShareWindow(qqUrl, 'QQ分享');
          break;
      }

      // 更新分享计数
      activity.value.shareCount = (activity.value.shareCount || 0) + 1;
    } else {
      ElMessage.error(response.message || '分享失败');
    }
  } catch (error) {
    ElMessage.error('分享失败，请稍后重试');
    console.error('Share activity error:', error);
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* 使用全局样式，只添加必要的自定义样式 */

.description-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.poster-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.poster-preview {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
  margin-top: var(--spacing-lg);
}

.poster-image {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: scale(1.02);
  }
}

.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.marketing-config {
  flex: 1;

  h4 {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-primary);
    font-size: var(--text-lg);
  }
}

.config-tag {
  margin: 0 var(--spacing-xs) var(--spacing-xs) 0;
}

.share-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 120px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* Descriptions styles */
:deep(.el-descriptions) {
  background-color: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

:deep(.el-descriptions__header) {
  color: var(--text-primary);
  font-weight: 600;
}

:deep(.el-descriptions__label) {
  color: var(--text-primary);
  font-weight: 500;
  background-color: var(--bg-secondary);
}

:deep(.el-descriptions__content) {
  color: var(--text-secondary);
  background-color: var(--bg-card);
}

/* Alert styles */
:deep(.el-alert) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* Button styles */
:deep(.el-button) {
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-weight: 500;
}

:deep(.el-button:hover) {
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-sm);
}

:deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-button--primary:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

:deep(.el-button--danger) {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
}

:deep(.el-button--danger:hover) {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  opacity: 0.8;
  transform: translateY(-var(--border-width-base));
  box-shadow: var(--shadow-md);
}

/* Tag styles */
:deep(.el-tag) {
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

:deep(.el-tag--success) {
  background-color: var(--success-light-bg);
  border-color: var(--success-color);
  color: var(--success-color);
}

:deep(.el-tag--warning) {
  background-color: var(--warning-light-bg);
  border-color: var(--warning-color);
  color: var(--warning-color);
}

:deep(.el-tag--info) {
  background-color: var(--info-light-bg);
  border-color: var(--info-color);
  color: var(--info-color);
}

:deep(.el-tag--danger) {
  background-color: var(--danger-light-bg);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* Skeleton loading styles */
:deep(.el-skeleton) {
  padding: var(--spacing-lg);
}

:deep(.el-skeleton__item) {
  background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Divider styles */
:deep(.el-divider) {
  border-color: var(--border-color);
  margin: var(--spacing-lg) 0;
}

/* Message box styles */
:deep(.el-message-box) {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

:deep(.el-message-box__header) {
  color: var(--text-primary);
}

:deep(.el-message-box__content) {
  color: var(--text-secondary);
}

/* Hover effects for cards */
.loading-container,
.detail-header,
:deep(.el-descriptions) {
  transition: all var(--transition-normal);
}

.loading-container:hover,
.detail-header:hover,
:deep(.el-descriptions:hover) {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 内容区域滚动优化 */
:deep(.center-content) {
  /* 确保活动详情内容可以完全显示 */
  height: auto !important;
  max-height: none !important;
  overflow-y: visible !important;
}

/* 如果内容过长，启用滚动 */
.center-container {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

/* Responsive design */
@media (max-width: var(--breakpoint-md)) {
  .activity-detail {
    padding: var(--spacing-md);
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
  }

  .action-buttons {
    width: 100%;
    justify-content: center;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .poster-actions {
    flex-direction: column;
  }

  .poster-preview {
    flex-direction: column;
  }

  /* 移动端内容区域优化 */
  .center-container {
    max-height: calc(100vh - 60px);
  }
}
</style>