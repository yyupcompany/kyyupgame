<template>
  <MobileSubPageLayout title="个人中心" back-path="/mobile/parent-center">
    <div class="mobile-parent-profile">
      <!-- 头部信息卡片 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div class="profile-header">
          <div class="user-card">
            <div class="avatar-section">
              <van-image
                class="user-avatar"
                :src="parent?.avatar || defaultAvatar"
                round
                width="60"
                height="60"
                fit="cover"
                :show-error="true"
                :show-loading="true"
              >
                <template #error>
                  <div class="avatar-fallback">
                    {{ parent?.name ? parent.name.charAt(0).toUpperCase() : '家' }}
                  </div>
                </template>
              </van-image>
              <div class="user-info">
                <h2 class="user-name">{{ parent?.name || '未知家长' }}</h2>
                <div class="user-meta">
                  <van-tag
                    :type="getParentStatusType(parent?.status)"
                    size="small"
                    class="status-tag"
                  >
                    {{ parent?.status || '未认证' }}
                  </van-tag>
                  <span class="user-phone">{{ parent?.phone || '未留手机号' }}</span>
                </div>
              </div>
            </div>
            <div class="action-buttons">
              <van-button
                size="small"
                type="primary"
                plain
                @click="handleEdit"
                class="action-btn"
              >
                <van-icon name="edit" />
                编辑资料
              </van-button>
              <van-button
                size="small"
                @click="showSettings = true"
                class="action-btn"
              >
                <van-icon name="setting-o" />
                设置
              </van-button>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <van-grid :column-num="4" :gutter="12" class="stats-grid">
            <van-grid-item class="stat-item">
              <div class="stat-value">{{ parent?.children?.length || 0 }}</div>
              <div class="stat-label">子女</div>
            </van-grid-item>
            <van-grid-item class="stat-item">
              <div class="stat-value">{{ parent?.followUpRecords?.length || 0 }}</div>
              <div class="stat-label">跟进记录</div>
            </van-grid-item>
            <van-grid-item class="stat-item">
              <div class="stat-value">{{ parent?.activities?.length || 0 }}</div>
              <div class="stat-label">活动参与</div>
            </van-grid-item>
            <van-grid-item class="stat-item">
              <div class="stat-value">{{ getActiveDays() }}</div>
              <div class="stat-label">活跃天数</div>
            </van-grid-item>
          </van-grid>
        </div>

        <!-- 个人信息 -->
        <div class="info-section">
          <van-cell-group inset class="info-group">
            <van-cell title="基本信息" is-link @click="showBasicInfo = !showBasicInfo" />
            <van-collapse v-model="activeNames" v-show="showBasicInfo">
              <van-cell title="姓名" :value="parent?.name || '未填写'" />
              <van-cell title="手机号" :value="parent?.phone || '未填写'" />
              <van-cell title="状态">
                <template #value>
                  <van-tag :type="getParentStatusType(parent?.status)" size="small">
                    {{ parent?.status || '未认证' }}
                  </van-tag>
                </template>
              </van-cell>
              <van-cell title="注册时间" :value="parent?.registerDate || '未知'" />
              <van-cell title="来源渠道" :value="parent?.source || '未知'" />
              <van-cell title="居住地址" :value="parent?.address || '未填写'" />
            </van-collapse>
          </van-cell-group>

          <!-- 备注信息 -->
          <van-cell-group inset class="remark-group">
            <van-cell title="备注信息" />
            <van-cell>
              <template #value>
                <div class="remark-content">{{ parent?.remark || '暂无备注' }}</div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 子女信息 -->
        <div class="children-section">
          <div class="section-header">
            <h3 class="section-title">子女信息</h3>
            <van-button
              size="small"
              type="primary"
              plain
              @click="handleAddChild"
              class="add-btn"
            >
              <van-icon name="plus" />
              添加孩子
            </van-button>
          </div>

          <div v-if="parent?.children && parent.children.length > 0" class="children-list">
            <van-swipe-cell v-for="child in parent.children" :key="child.id">
              <van-card
                class="child-card"
                :thumb="child.avatar || defaultAvatar"
              >
                <template #title>
                  <div class="child-title">
                    <span class="child-name">{{ child.name }}</span>
                    <van-tag
                      :type="getChildStatusType(child.status)"
                      size="small"
                    >
                      {{ child.status }}
                    </van-tag>
                  </div>
                </template>
                <template #desc>
                  <div class="child-info">
                    <div class="info-row">
                      <span class="info-label">性别：</span>
                      <span class="info-value">{{ child.gender }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">年龄：</span>
                      <span class="info-value">{{ child.age }}岁</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">生日：</span>
                      <span class="info-value">{{ child.birthday }}</span>
                    </div>
                  </div>
                </template>
                <template #footer>
                  <div class="child-actions">
                    <van-button
                      size="mini"
                      type="primary"
                      plain
                      @click="handleEditChild(child)"
                    >
                      编辑
                    </van-button>
                    <van-button
                      size="mini"
                      type="danger"
                      plain
                      @click="handleDeleteChild(child)"
                    >
                      删除
                    </van-button>
                  </div>
                </template>
              </van-card>
              <template #right>
                <van-button
                  square
                  type="danger"
                  text="删除"
                  @click="handleDeleteChild(child)"
                  class="delete-btn"
                />
              </template>
            </van-swipe-cell>
          </div>

          <van-empty v-else description="暂无孩子信息" class="empty-state">
            <van-button
              type="primary"
              size="small"
              @click="handleAddChild"
            >
              添加第一个孩子
            </van-button>
          </van-empty>
        </div>

        <!-- 跟进记录 -->
        <div class="follow-up-section">
          <div class="section-header">
            <h3 class="section-title">跟进记录</h3>
            <van-button
              size="small"
              type="primary"
              plain
              @click="handleAddFollowUp"
              class="add-btn"
            >
              <van-icon name="plus" />
              添加跟进
            </van-button>
          </div>

          <div v-if="parent?.followUpRecords && parent.followUpRecords.length > 0" class="follow-up-list">
            <van-steps direction="vertical" :active="followUpRecords.length" active-icon="none">
              <van-step v-for="record in followUpRecords" :key="record.id">
                <div class="follow-up-item" @click="handleViewFollowUp(record)">
                  <div class="follow-up-header">
                    <h4 class="follow-up-title">{{ record.title }}</h4>
                    <van-tag
                      :type="getFollowUpTypeColor(record.type)"
                      size="small"
                    >
                      {{ record.type }}
                    </van-tag>
                  </div>
                  <div class="follow-up-meta">
                    <span class="follow-up-time">{{ record.time }}</span>
                    <span class="follow-up-creator">{{ record.creator }}</span>
                  </div>
                  <div class="follow-up-content">{{ record.content || '暂无详细内容' }}</div>
                </div>
              </van-step>
            </van-steps>
          </div>

          <van-empty v-else description="暂无跟进记录" class="empty-state">
            <van-button
              type="primary"
              size="small"
              @click="handleAddFollowUp"
            >
              创建第一条跟进记录
            </van-button>
          </van-empty>
        </div>

        <!-- 活动参与 -->
        <div class="activities-section">
          <div class="section-header">
            <h3 class="section-title">活动参与</h3>
            <van-button
              size="small"
              type="primary"
              plain
              @click="handleAssignActivity"
              class="add-btn"
            >
              <van-icon name="plus" />
              分配活动
            </van-button>
          </div>

          <div v-if="parent?.activities && parent.activities.length > 0" class="activities-list">
            <van-card
              v-for="activity in parent.activities"
              :key="activity.id"
              class="activity-card"
              :thumb="activity.banner || defaultAvatar"
              @click="handleViewActivity(activity)"
            >
              <template #title>
                <div class="activity-title">
                  <span class="activity-name">{{ activity.title }}</span>
                  <van-tag
                    :type="getActivityStatusType(activity.status)"
                    size="small"
                  >
                    {{ activity.status }}
                  </van-tag>
                </div>
              </template>
              <template #desc>
                <div class="activity-info">
                  <div class="info-row">
                    <van-icon name="clock-o" />
                    <span>{{ activity.time }}</span>
                  </div>
                </div>
              </template>
              <template #footer>
                <div class="activity-actions">
                  <van-button
                    size="mini"
                    type="primary"
                    plain
                    @click.stop="handleViewActivity(activity)"
                  >
                    查看详情
                  </van-button>
                  <van-button
                    size="mini"
                    type="warning"
                    plain
                    @click.stop="handleCancelActivity(activity)"
                  >
                    取消参与
                  </van-button>
                </div>
              </template>
            </van-card>
          </div>

          <van-empty v-else description="暂无活动参与记录" class="empty-state">
            <van-button
              type="primary"
              size="small"
              @click="handleAssignActivity"
            >
              分配活动
            </van-button>
          </van-empty>
        </div>
      </van-pull-refresh>

      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" color="#1989fa" class="loading-state" />

      <!-- 错误状态 -->
      <van-empty v-else-if="!parent" description="未找到家长信息" class="error-state">
        <van-button type="primary" @click="goBack">返回</van-button>
      </van-empty>
    </div>

    <!-- 跟进记录详情弹窗 -->
    <van-popup
      v-model:show="showFollowUpDetail"
      position="bottom"
      round
      :style="{ height: '70%' }"
    >
      <div class="follow-up-detail">
        <div class="detail-header">
          <h3>跟进记录详情</h3>
          <van-icon name="cross" @click="showFollowUpDetail = false" />
        </div>
        <div v-if="currentFollowUp" class="detail-content">
          <van-cell-group inset>
            <van-cell title="标题" :value="currentFollowUp.title" />
            <van-cell title="时间" :value="currentFollowUp.time" />
            <van-cell title="创建人" :value="currentFollowUp.creator" />
            <van-cell title="类型">
              <template #value>
                <van-tag :type="getFollowUpTypeColor(currentFollowUp.type)" size="small">
                  {{ currentFollowUp.type }}
                </van-tag>
              </template>
            </van-cell>
            <van-cell title="内容">
              <template #value>
                <div class="content-text">{{ currentFollowUp.content || '暂无详细内容' }}</div>
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 设置弹窗 -->
    <van-popup
      v-model:show="showSettings"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="settings-panel">
        <div class="settings-header">
          <h3>设置</h3>
          <van-icon name="cross" @click="showSettings = false" />
        </div>
        <van-cell-group>
          <van-cell title="消息通知" is-link @click="handleNotificationSettings" />
          <van-cell title="隐私设置" is-link @click="handlePrivacySettings" />
          <van-cell title="账号安全" is-link @click="handleSecuritySettings" />
          <van-cell title="关于我们" is-link @click="handleAbout" />
          <van-cell title="退出登录" @click="handleLogout" class="logout-cell" />
        </van-cell-group>
      </div>
    </van-popup>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import { PARENT_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

// 数据接口定义
interface Child {
  id: number
  name: string
  gender: string
  age: number
  birthday: string
  status: string
  avatar?: string
}

interface FollowUpRecord {
  id: number
  title: string
  time: string
  creator: string
  type: string
  content?: string
}

interface Activity {
  id: number
  title: string
  time: string
  status: string
  banner?: string
}

interface Parent {
  id: number
  name: string
  phone: string
  status: string
  registerDate: string
  source: string
  address: string
  avatar?: string
  remark?: string
  children: Child[]
  followUpRecords: FollowUpRecord[]
  activities: Activity[]
}

// 响应式数据
const router = useRouter()
const loading = ref(true)
const refreshing = ref(false)
const parent = ref<Parent | null>(null)
const showFollowUpDetail = ref(false)
const currentFollowUp = ref<FollowUpRecord | null>(null)
const showSettings = ref(false)
const showBasicInfo = ref(true)
const activeNames = ref(['1'])

// 默认头像
const defaultAvatar = '/default-avatar.png'

// 计算属性
const followUpRecords = computed(() => {
  return parent.value?.followUpRecords || []
})

// 获取家长信息
const fetchParentDetail = async () => {
  try {
    // 模拟API调用获取家长详情，实际项目中应该调用真实API
    // const parentId = userStore.userInfo?.id
    // const response: ApiResponse = await request.get(PARENT_ENDPOINTS.GET_BY_ID(parentId))

    // 这里使用模拟数据，严格按照PC端页面结构
    const mockParent: Parent = {
      id: 1,
      name: '张三',
      phone: '13800138000',
      status: '正式家长',
      registerDate: '2024-01-15',
      source: '朋友推荐',
      address: '北京市朝阳区某某街道',
      avatar: '',
      remark: '优质家长，配合度高，对孩子的教育非常重视，积极参加幼儿园各项活动。',
      children: [
        {
          id: 1,
          name: '张小明',
          gender: '男',
          age: 5,
          birthday: '2019-05-15',
          status: '已入学',
          avatar: ''
        },
        {
          id: 2,
          name: '张小红',
          gender: '女',
          age: 3,
          birthday: '2021-03-20',
          status: '未入学',
          avatar: ''
        }
      ],
      followUpRecords: [
        {
          id: 1,
          title: '电话咨询',
          time: '2024-01-20 14:30',
          creator: '李老师',
          type: '电话咨询',
          content: '家长对幼儿园的师资力量表示认可，希望进一步了解课程设置和学费标准。预约了下次实地参观时间。'
        },
        {
          id: 2,
          title: '实地参观',
          time: '2024-01-25 10:00',
          creator: '王老师',
          type: '实地参观',
          content: '家长参观了园区环境，对硬件设施表示满意。重点考察了食堂卫生状况和教室安全设施。'
        },
        {
          id: 3,
          title: '报名确认',
          time: '2024-02-01 15:00',
          creator: '张老师',
          type: '会议沟通',
          content: '家长确认报名，已完成缴费手续。讨论了孩子的入学准备事项和开学安排。'
        }
      ],
      activities: [
        {
          id: 1,
          title: '春季亲子运动会',
          time: '2024-03-15 09:00',
          status: '已报名',
          banner: ''
        },
        {
          id: 2,
          title: '家长开放日',
          time: '2024-02-28 14:00',
          status: '已完成',
          banner: ''
        },
        {
          id: 3,
          title: '儿童绘本阅读活动',
          time: '2024-03-20 16:00',
          status: '待确认',
          banner: ''
        }
      ]
    }

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    parent.value = mockParent

  } catch (error) {
    console.error('获取家长信息失败:', error)
    showToast('获取家长信息失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await fetchParentDetail()
}

// 获取活跃天数（模拟）
const getActiveDays = () => {
  return Math.floor(Math.random() * 100) + 1
}

// 状态类型映射，与PC端保持一致
const getParentStatusType = (status?: string): string => {
  switch (status) {
    case '正式家长':
    case 'ACTIVE':
      return 'success'
    case '潜在家长':
    case 'PENDING':
      return 'warning'
    case '已退学':
    case 'INACTIVE':
      return 'default'
    case '已拒绝':
    case 'REJECTED':
      return 'danger'
    default:
      return 'default'
  }
}

const getChildStatusType = (status: string): string => {
  switch (status) {
    case '已入学':
    case 'ENROLLED':
      return 'success'
    case '未入学':
    case 'PENDING':
      return 'warning'
    case '已毕业':
    case 'GRADUATED':
      return 'primary'
    case '已退学':
    case 'WITHDRAWN':
      return 'danger'
    default:
      return 'default'
  }
}

const getFollowUpTypeColor = (type: string): string => {
  switch (type) {
    case '电话咨询':
    case 'PHONE_CALL':
      return 'primary'
    case '实地参观':
    case 'VISIT':
      return 'success'
    case '邮件联系':
    case 'EMAIL':
      return 'warning'
    case '会议沟通':
    case 'MEETING':
      return 'danger'
    default:
      return 'default'
  }
}

const getActivityStatusType = (status: string): string => {
  switch (status) {
    case '已报名':
    case 'ACTIVE':
      return 'success'
    case '待确认':
    case 'PENDING':
      return 'warning'
    case '已完成':
    case 'COMPLETED':
      return 'primary'
    case '已取消':
    case 'CANCELED':
      return 'danger'
    default:
      return 'default'
  }
}

// 事件处理函数，与PC端功能保持一致
const goBack = () => {
  router.back()
}

const handleEdit = () => {
  showToast('编辑资料功能开发中')
  // router.push('/mobile/parent-center/edit-profile')
}

const handleAddChild = () => {
  showToast('添加孩子功能开发中')
  // router.push('/mobile/parent-center/add-child')
}

const handleEditChild = (child: Child) => {
  showToast(`编辑${child.name}功能开发中`)
  // router.push(`/mobile/parent-center/edit-child/${child.id}`)
}

const handleDeleteChild = (child: Child) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除孩子"${child.name}"的信息吗？`,
  }).then(() => {
    if (parent.value) {
      parent.value.children = parent.value.children.filter(item => item.id !== child.id)
      showSuccessToast('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

const handleAddFollowUp = () => {
  showToast('添加跟进记录功能开发中')
  // router.push('/mobile/parent-center/add-follow-up')
}

const handleViewFollowUp = (record: FollowUpRecord) => {
  currentFollowUp.value = record
  showFollowUpDetail.value = true
}

const handleDeleteFollowUp = (record: FollowUpRecord) => {
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除跟进记录"${record.title}"吗？`,
  }).then(() => {
    if (parent.value) {
      parent.value.followUpRecords = parent.value.followUpRecords.filter(item => item.id !== record.id)
      showSuccessToast('删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}

const handleAssignActivity = () => {
  showToast('分配活动功能开发中')
  // router.push('/mobile/parent-center/assign-activity')
}

const handleViewActivity = (activity: Activity) => {
  showToast(`查看活动"${activity.title}"功能开发中`)
  // router.push(`/mobile/activity/detail/${activity.id}`)
}

const handleCancelActivity = (activity: Activity) => {
  showConfirmDialog({
    title: '确认取消',
    message: `确定要取消参与"${activity.title}"活动吗？`,
  }).then(() => {
    if (parent.value) {
      parent.value.activities = parent.value.activities.filter(item => item.id !== activity.id)
      showSuccessToast('取消成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 设置相关功能
const handleNotificationSettings = () => {
  showToast('消息通知设置开发中')
}

const handlePrivacySettings = () => {
  showToast('隐私设置开发中')
}

const handleSecuritySettings = () => {
  showToast('账号安全设置开发中')
}

const handleAbout = () => {
  showToast('关于我们页面开发中')
  // router.push('/mobile/about')
}

const handleLogout = () => {
  showConfirmDialog({
    title: '确认退出',
    message: '确定要退出当前账号吗？',
  }).then(() => {
    showSuccessToast('退出成功')
    router.push('/mobile/login')
  }).catch(() => {
    // 取消退出
  })
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  fetchParentDetail()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-parent-profile {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--app-bg-color);
  padding-bottom: var(--app-gap);

  // 头部信息卡片
  .profile-header {
    padding: var(--van-padding-md);

    .user-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-lg);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

      .avatar-section {
        display: flex;
        align-items: center;
        margin-bottom: var(--van-padding-md);

        .user-avatar {
          margin-right: var(--van-padding-md);
          border: 2px solid rgba(255, 255, 255, 0.3);

          .avatar-fallback {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--van-font-size-lg);
            font-weight: bold;
            color: white;
            border-radius: 50%;
          }
        }

        .user-info {
          flex: 1;

          .user-name {
            margin: 0 0 var(--van-padding-xs) 0;
            font-size: var(--van-font-size-xl);
            font-weight: bold;
            color: white;
          }

          .user-meta {
            display: flex;
            align-items: center;
            gap: var(--van-padding-sm);
            flex-wrap: wrap;

            .status-tag {
              background: rgba(255, 255, 255, 0.2);
              border: none;
              backdrop-filter: blur(10px);
            }

            .user-phone {
              font-size: var(--van-font-size-sm);
              opacity: 0.9;
              color: white;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: var(--van-padding-sm);

        .action-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }

          :deep(.van-icon) {
            margin-right: var(--van-padding-xs);
          }
        }
      }
    }
  }

  // 统计信息
  .stats-section {
    padding: 0 var(--van-padding-md) var(--van-padding-md);

    .stats-grid {
      background: white;
      border-radius: var(--van-radius-lg);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .stat-item {
        text-align: center;
        padding: var(--van-padding-md) 0;

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: bold;
          color: var(--van-primary-color);
          margin-bottom: var(--van-padding-xs);
        }

        .stat-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
        }
      }
    }
  }

  // 各个区块的通用样式
  .info-section,
  .children-section,
  .follow-up-section,
  .activities-section {
    margin-bottom: var(--van-padding-md);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--van-padding-md);

      .section-title {
        margin: 0;
        font-size: var(--van-font-size-lg);
        font-weight: bold;
        color: var(--van-text-color-1);
      }

      .add-btn {
        :deep(.van-icon) {
          margin-right: var(--van-padding-xs);
        }
      }
    }

    .info-group,
    .remark-group {
      margin-bottom: var(--van-padding-sm);

      .remark-content {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        line-height: 1.5;
      }
    }
  }

  // 子女信息样式
  .children-list {
    padding: 0 var(--van-padding-md);

    .child-card {
      margin-bottom: var(--van-padding-sm);
      border-radius: var(--van-radius-lg);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .child-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .child-name {
          font-weight: bold;
          font-size: var(--van-font-size-md);
        }
      }

      .child-info {
        margin-top: var(--van-padding-xs);

        .info-row {
          display: flex;
          margin-bottom: var(--van-padding-xs);

          .info-label {
            color: var(--van-text-color-2);
            margin-right: var(--van-padding-xs);
            min-width: 60px;
          }

          .info-value {
            color: var(--van-text-color-1);
            flex: 1;
          }
        }
      }

      .child-actions {
        display: flex;
        gap: var(--van-padding-xs);
      }
    }

    .delete-btn {
      height: 100%;
      background: var(--van-danger-color);
    }
  }

  // 跟进记录样式
  .follow-up-list {
    padding: 0 var(--van-padding-md);

    .follow-up-item {
      cursor: pointer;
      padding: var(--van-padding-sm);
      border-radius: var(--van-radius-md);
      transition: background-color 0.3s;
      background: white;
      margin-bottom: var(--van-padding-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &:hover {
        background-color: var(--van-background-color-light);
      }

      .follow-up-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--van-padding-xs);

        .follow-up-title {
          margin: 0;
          font-weight: bold;
          font-size: var(--van-font-size-md);
          color: var(--van-text-color-1);
        }
      }

      .follow-up-meta {
        display: flex;
        gap: var(--van-padding-md);
        margin-bottom: var(--van-padding-xs);
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
      }

      .follow-up-content {
        font-size: var(--van-font-size-sm);
        color: var(--van-text-color-2);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }

  // 活动参与样式
  .activities-list {
    padding: 0 var(--van-padding-md);

    .activity-card {
      margin-bottom: var(--van-padding-sm);
      border-radius: var(--van-radius-lg);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      cursor: pointer;

      .activity-title {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .activity-name {
          font-weight: bold;
          font-size: var(--van-font-size-md);
        }
      }

      .activity-info {
        margin-top: var(--van-padding-xs);

        .info-row {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          color: var(--van-text-color-2);
          font-size: var(--van-font-size-sm);
        }
      }

      .activity-actions {
        display: flex;
        gap: var(--van-padding-xs);
      }
    }
  }

  // 空状态样式
  .empty-state {
    padding: var(--van-padding-xl) var(--van-padding-md);
    text-align: center;
    background: white;
    margin: 0 var(--van-padding-md);
    border-radius: var(--van-radius-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  // 加载和错误状态
  .loading-state,
  .error-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
}

// 跟进记录详情弹窗样式
.follow-up-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--van-font-size-lg);
      color: var(--van-text-color-1);
    }

    .van-icon {
      font-size: var(--van-font-size-lg);
      color: var(--van-text-color-3);
      cursor: pointer;
    }
  }

  .detail-content {
    padding: var(--van-padding-md);
    max-height: calc(70vh - 60px);
    overflow-y: auto;

    .content-text {
      line-height: 1.5;
      white-space: pre-wrap;
      color: var(--van-text-color-1);
    }
  }
}

// 设置面板样式
.settings-panel {
  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    h3 {
      margin: 0;
      font-size: var(--van-font-size-lg);
      color: var(--van-text-color-1);
    }

    .van-icon {
      font-size: var(--van-font-size-lg);
      color: var(--van-text-color-3);
      cursor: pointer;
    }
  }

  .logout-cell {
    color: var(--van-danger-color);

    :deep(.van-cell__value) {
      color: var(--van-danger-color);
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-parent-profile {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);

    .profile-header .user-card {
      .avatar-section {
        .user-avatar {
          width: 80px;
          height: 80px;
        }
      }
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>