<template>
  <MobileCenterLayout title="教师详情" back-path="/mobile/centers">
    <div v-if="loading" class="loading-container">
      <van-loading size="24px">加载中...</van-loading>
    </div>

    <div v-else-if="teacher" class="teacher-detail">
      <!-- 基本信息 -->
      <van-cell-group inset class="info-section">
        <van-cell center>
          <template #title>
            <div class="teacher-header">
              <van-image
                round
                width="60"
                height="60"
                :src="teacher.avatar || defaultAvatar"
              />
              <div class="teacher-info">
                <div class="teacher-name">{{ teacher.name }}</div>
                <div class="teacher-title">{{ teacher.title || '教师' }}</div>
              </div>
            </div>
          </template>
        </van-cell>

        <van-cell title="工号" :value="teacher.employeeId || '-'" />
        <van-cell title="性别" :value="teacher.gender === 'male' ? '男' : '女'" />
        <van-cell title="手机号" :value="teacher.phone || '-'" />
        <van-cell title="邮箱" :value="teacher.email || '-'" />
      </van-cell-group>

      <!-- 工作信息 -->
      <van-cell-group inset class="info-section">
        <van-cell title="所属班级" :value="teacher.classes || '暂无分配'" />
        <van-cell title="入职日期" :value="formatDate(teacher.hireDate)" />
        <van-cell title="工作状态">
          <template #value>
            <van-tag :type="teacher.status === 'active' ? 'success' : 'danger'">
              {{ teacher.status === 'active' ? '在职' : '离职' }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 教学信息 -->
      <van-cell-group inset class="info-section">
        <van-cell title="任教科目" :value="teacher.subjects || '暂无'" />
        <van-cell title="教师资格" :value="teacher.qualification || '暂无'" />
        <van-cell title="学历" :value="teacher.education || '暂无'" />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          type="primary"
          block
          @click="handleEdit"
        >
          编辑信息
        </van-button>
        <van-button
          plain
          type="danger"
          block
          @click="handleDelete"
        >
          删除教师
        </van-button>
      </div>
    </div>

    <div v-else class="empty-state">
      <van-empty description="教师信息不存在" />
    </div>

    <!-- 教师编辑弹窗 -->
    <TeacherEditDialog
      v-model="editDialogVisible"
      :teacher-data="teacher"
      @refresh="refreshData"
    />
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import TeacherEditDialog from './components/TeacherEditDialog.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const teacher = ref<any>(null)
const defaultAvatar = 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png'

// 编辑弹窗
const editDialogVisible = ref(false)

// 加载教师详情
const loadTeacherDetail = async () => {
  try {
    const teacherId = route.params.id
    loading.value = true

    // TODO: 调用API获取教师详情
    // const response = await getTeacherDetail(teacherId)
    // if (response.success) {
    //   teacher.value = response.data
    // }

    // 模拟数据
    teacher.value = {
      id: teacherId,
      name: '张老师',
      title: '高级教师',
      employeeId: 'T2024001',
      gender: 'female',
      phone: '13800138000',
      email: 'zhang@example.com',
      classes: '大一班、大二班',
      hireDate: '2020-09-01',
      status: 'active',
      subjects: '语言、艺术',
      qualification: '幼儿园教师资格证',
      education: '本科'
    }
  } catch (error) {
    console.error('加载教师详情失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 返回
const handleGoBack = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  if (teacher.value) {
    editDialogVisible.value = true
  }
}

// 刷新数据
const refreshData = () => {
  loadTeacherDetail()
}

// 删除
const handleDelete = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这位教师吗？此操作不可恢复。'
    })

    // TODO: 调用API删除教师
    showToast('删除成功')
    router.back()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadTeacherDetail()
})
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';
@import '@/styles/design-tokens.scss';

.teacher-detail {
  padding: var(--spacing-md);

  .info-section {
    margin-bottom: var(--spacing-lg);
  }

  .teacher-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);

    .teacher-info {
      flex: 1;

      .teacher-name {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--mobile-text-primary);
        margin-bottom: var(--spacing-xs);
      }

      .teacher-title {
        font-size: var(--text-sm);
        color: var(--mobile-text-secondary);
      }
    }
  }

  .action-buttons {
    margin-top: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-5xl) 0;
}

.empty-state {
  padding: var(--spacing-5xl) 0;
}
</style>
