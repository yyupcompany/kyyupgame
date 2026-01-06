<!--
  📱 移动端个人中心（我的）
  - 查看与编辑个人资料（与后端共用 API/DB）
  - 接口对接：
    GET  /api/users/profile -> getUserInfo()
    PUT  /api/users/profile -> updateUserInfo()
    POST /api/upload/avatar  -> uploadAvatar(formData)
-->
<template>
  <div class="mobile-profile">
    <!-- 顶部卡片 -->
    <section class="profile-header">
      <div class="avatar-wrap" @click="onSelectAvatar">
        <img v-if="profile.avatar" :src="profile.avatar" class="avatar" alt="avatar" />
        <div v-else class="avatar placeholder">{{ avatarText }}</div>
        <input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="onAvatarChange" />
      </div>
      <div class="base-info">
        <div class="name-row">
          <h2 class="name">{{ profile.realName || profile.username || '用户' }}</h2>
          <span v-if="isAdmin" class="tag admin">管理员</span>
        </div>
        <p class="username">@{{ profile.username }}</p>
      </div>
    </section>

    <!-- 基本资料表单 -->
    <section class="profile-form">
      <div class="field">
        <label>姓名</label>
        <input v-model="editForm.realName" type="text" placeholder="请输入姓名" />
      </div>
      <div class="field">
        <label>邮箱</label>
        <input v-model="editForm.email" type="email" placeholder="请输入邮箱" />
      </div>
      <div class="field">
        <label>手机号</label>
        <input v-model="editForm.phone" type="tel" placeholder="请输入手机号" />
      </div>

      <div class="actions">
        <button class="btn primary" :disabled="saving" @click="onSave">{{ saving ? '保存中...' : '保存' }}</button>
        <button class="btn ghost" :disabled="saving" @click="onCancel">取消</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUserInfo, uploadAvatar } from '@/api/modules/user'

interface Profile {
  id?: number | string
  username?: string
  realName?: string
  email?: string
  phone?: string
  avatar?: string
  role?: string
  roleName?: string
  isAdmin?: boolean
}

const profile = reactive<Profile>({})
const editForm = reactive<{ realName: string; email: string; phone: string }>({ realName: '', email: '', phone: '' })
const saving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

const isAdmin = computed(() => profile.isAdmin || profile.role === 'admin')
const avatarText = computed(() => (profile.realName || profile.username || 'U').slice(0, 1).toUpperCase())

const loadProfile = async () => {
  try {
    const res = await getUserInfo()
    if (res.success) {
      const data: any = res.data || {}
      Object.assign(profile, data)
      editForm.realName = data.realName || ''
      editForm.email = data.email || ''
      editForm.phone = data.phone || ''
    } else {
      throw new Error(res.message || '获取用户资料失败')
    }
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '获取用户资料失败')
  }
}

const onSave = async () => {
  try {
    saving.value = true
    const res = await updateUserInfo({
      name: editForm.realName,
      email: editForm.email,
      phone: editForm.phone
    })
    if (res.success) {
      ElMessage.success('保存成功')
      await loadProfile()
    } else {
      throw new Error(res.message || '保存失败')
    }
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const onCancel = () => {
  editForm.realName = profile.realName || ''
  editForm.email = profile.email || ''
  editForm.phone = profile.phone || ''
}

const onSelectAvatar = () => avatarInput.value?.click()

const onAvatarChange = async (ev: Event) => {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await uploadAvatar(form)
    if (res.success) {
      ElMessage.success('头像已更新')
      await loadProfile()
    } else {
      throw new Error(res.message || '上传失败')
    }
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '上传失败')
  } finally {
    if (avatarInput.value) avatarInput.value.value = ''
  }
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.mobile-profile { padding: 12px; }
.profile-header {
  display: flex; gap: 12px; align-items: center; padding: 12px; margin-bottom: 12px;
  background: #fff; border: var(--border-width-base) solid #eef2f7; border-radius: 1var(--spacing-xs);
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.avatar-wrap { position: relative; }
.avatar { width: 6var(--spacing-xs); height: 6var(--spacing-xs); border-radius: var(--radius-full); object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,.08); }
.avatar.placeholder { width: 6var(--spacing-xs); height: 6var(--spacing-xs); border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #475569; font-weight: 700; }
.hidden-input { display: none; }
.base-info { flex: 1; overflow: hidden; }
.name-row { display: flex; align-items: center; gap: var(--spacing-sm); }
.name { margin: 0; font-size: 1var(--spacing-sm); font-weight: 700; color: #111827; }
.tag.admin { background: #eff6ff; color: #1e40af; border: var(--border-width-base) solid #bfdbfe; border-radius: 999px; padding: 2px var(--spacing-sm); font-size: 12px; }
.username { margin: 2px 0 0; color: #64748b; font-size: 12px; }

.profile-form { background: #fff; border: var(--border-width-base) solid #eef2f7; border-radius: 1var(--spacing-xs); padding: 12px; box-shadow: 0 2px 6px rgba(0,0,0,.04); }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.field label { color: #475569; font-size: 12px; }
.field input { height: 36px; padding: 6px 10px; border: var(--border-width-base) solid #e5e7eb; border-radius: 10px; outline: none; }
.field input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147,197,253,.25); }
.actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn { height: 36px; padding: 0 1var(--spacing-xs); border-radius: 10px; border: var(--border-width-base) solid #e5e7eb; background: #fff; cursor: pointer; }
.btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.btn.ghost { background: #fff; color: #111827; }
</style>

