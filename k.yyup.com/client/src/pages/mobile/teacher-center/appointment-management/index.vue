<template>
  <MobileSubPageLayout title="预约管理" back-path="/mobile/teacher-center">
    <div class="appointment-management-page">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="待确认" name="pending">
          <van-cell v-for="appt in appointments.filter(a => a.status === '待确认')" :key="appt.id" :title="appt.name" :label="`${appt.date} ${appt.time}`" is-link @click="handleAppointment(appt)">
            <template #value><van-tag type="warning">{{ appt.status }}</van-tag></template>
          </van-cell>
        </van-tab>
        <van-tab title="已确认" name="confirmed">
          <van-cell v-for="appt in appointments.filter(a => a.status === '已确认')" :key="appt.id" :title="appt.name" :label="`${appt.date} ${appt.time}`" :value="appt.type" />
        </van-tab>
      </van-tabs>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'

interface Appointment {
  id: number
  name: string
  date: string
  time: string
  type: string
  status: string
}

const activeTab = ref('pending')
const loading = ref(false)
const appointments = ref<Appointment[]>([])

const loadAppointments = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })
    
    const response = await request.get('/enrollment-interviews', {
      params: {
        page: 1,
        pageSize: 50
      }
    })
    
    if (response.success && response.data) {
      appointments.value = (response.data.items || response.data.list || response.data || []).map((item: any) => ({
        id: item.id,
        name: item.parentName || item.name,
        date: item.appointmentDate,
        time: item.appointmentTime,
        type: item.type || '试听预约',
        status: item.status === 'pending' ? '待确认' : '已确认'
      }))
    }
  } catch (error) {
    console.error('加载预约失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const handleAppointment = async (appt: Appointment) => {
  try {
    await request.post(`/teacher/appointments/${appt.id}/confirm`)
    showToast('预约已确认')
    await loadAppointments()
  } catch (error) {
    showToast('操作失败')
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadAppointments()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.appointment-management-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>

