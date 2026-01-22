<template>
  <MobileSubPageLayout title="家园沟通" back-path="/mobile/parent-center">
    <div class="communication-page">
      <!-- 搜索栏 -->
      <van-search
        v-model="searchQuery"
        placeholder="搜索老师或班级"
        @search="handleSearch"
      />

      <!-- Tab切换 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="班级群聊" name="class">
          <van-cell-group inset>
            <van-cell
              v-for="chat in classChats"
              :key="chat.id"
              :title="chat.name"
              :label="chat.lastMessage"
              :value="chat.time"
              is-link
              @click="openChat(chat)"
            >
              <template #icon>
                <van-badge :content="chat.unread || ''">
                  <van-icon name="friends-o" size="24" style="margin-right: 12px;" />
                </van-badge>
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>

        <van-tab title="老师私聊" name="teacher">
          <van-cell-group inset>
            <van-cell
              v-for="chat in teacherChats"
              :key="chat.id"
              :title="chat.name"
              :label="chat.lastMessage"
              :value="chat.time"
              is-link
              @click="openChat(chat)"
            >
              <template #icon>
                <van-badge :content="chat.unread || ''">
                  <van-icon name="manager-o" size="24" style="margin-right: 12px;" />
                </van-badge>
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>

        <van-tab title="通知公告" name="notice">
          <van-cell-group inset>
            <van-cell
              v-for="notice in notices"
              :key="notice.id"
              :title="notice.title"
              :label="notice.content"
              :value="notice.time"
              is-link
              @click="viewNotice(notice)"
            >
              <template #icon>
                <van-icon name="volume-o" size="20" style="margin-right: 12px;" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-tab>
      </van-tabs>

      <!-- 智能沟通中心入口 -->
      <div class="ai-hub-entrance">
        <van-button
          type="primary"
          icon="bulb-o"
          size="large"
          round
          block
          @click="goToSmartHub"
        >
          进入智能沟通中心
        </van-button>
      </div>

      <van-back-top right="20" bottom="80" />
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'
import { NOTIFICATION_ENDPOINTS } from '@/api/endpoints'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Chat {
  id: number
  name: string
  lastMessage: string
  time: string
  unread?: number
}

interface Notice {
  id: number
  title: string
  content: string
  time: string
  type: string
}

const searchQuery = ref('')
const activeTab = ref('class')
const loading = ref(false)

const classChats = ref<Chat[]>([])
const teacherChats = ref<Chat[]>([])
const notices = ref<Notice[]>([])

// 加载通知公告
const loadNotices = async () => {
  try {
    loading.value = true
    
    const response = await request.get(NOTIFICATION_ENDPOINTS.BASE, {
      params: {
        page: 1,
        pageSize: 20,
        type: 'announcement'
      }
    })
    
    if (response.success && response.data) {
      // 后端返回的是data.items而不是data.list
      const items = response.data.items || response.data.list || response.data || []
      notices.value = items.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        time: formatTime(item.created_at || item.createdAt),
        type: item.type || item.notification_type
      }))
      console.log('✅ 加载通知公告:', notices.value.length, '条')
    }
  } catch (error) {
    console.error('加载通知失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载班级聊天（暂时使用通知代替）
const loadClassChats = async () => {
  try {
    const response = await request.get(NOTIFICATION_ENDPOINTS.BASE, {
      params: {
        page: 1,
        pageSize: 10,
        type: 'class_message'
      }
    })
    
    if (response.success && response.data) {
      const items = response.data.items || response.data.list || response.data || []
      classChats.value = items.map((item: any) => ({
        id: item.id,
        name: item.title || '班级群聊',
        lastMessage: item.content,
        time: formatTime(item.created_at || item.createdAt),
        unread: item.is_read === 0 ? 1 : 0
      }))
      console.log('✅ 加载班级聊天:', classChats.value.length, '条')
    }
  } catch (error) {
    console.error('加载班级聊天失败:', error)
  }
}

// 加载教师私聊
const loadTeacherChats = async () => {
  try {
    const response = await request.get(NOTIFICATION_ENDPOINTS.BASE, {
      params: {
        page: 1,
        pageSize: 10,
        type: 'teacher_message'
      }
    })
    
    if (response.success && response.data) {
      const items = response.data.items || response.data.list || response.data || []
      teacherChats.value = items.map((item: any) => ({
        id: item.id,
        name: item.sender_name || item.senderName || '老师',
        lastMessage: item.content,
        time: formatTime(item.created_at || item.createdAt),
        unread: item.is_read === 0 ? 1 : 0
      }))
      console.log('✅ 加载教师私聊:', teacherChats.value.length, '条')
    }
  } catch (error) {
    console.error('加载教师私聊失败:', error)
  }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  
  if (days === 0) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getMonth() + 1}-${date.getDate()}`
  }
}

const handleSearch = () => {
  if (!searchQuery.value) {
    showToast('请输入搜索内容')
    return
  }
  showToast('搜索: ' + searchQuery.value)
  // TODO: 实现搜索功能
}

const openChat = (chat: Chat) => {
  showToast('打开聊天: ' + chat.name)
  // TODO: 跳转到聊天详情页
}

const viewNotice = (notice: Notice) => {
  router.push(`/mobile/notification/${notice.id}`)
}

const goToSmartHub = () => {
  router.push('/mobile/parent-center/communication/smart-hub')
}

onMounted(async () => {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  await Promise.all([
    loadNotices(),
    loadClassChats(),
    loadTeacherChats()
  ])
  closeToast()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';

.communication-page {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background-color: var(--bg-color-page);
}

.ai-hub-entrance {
  padding: var(--spacing-md);
  margin-top: 16px;

  .van-button {
    height: 50px;
    font-size: var(--text-base);
    font-weight: 600;
    background: linear-gradient(135deg, #1989fa, #40a9ff);
    border: none;
    box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);

    &:active {
      transform: scale(0.98);
    }
  }
}
</style>

