<template>
  <MobileSubPageLayout title="班级通讯录" back-path="/mobile/teacher-center">
    <div class="class-contacts-page">
      <van-search v-model="searchQuery" placeholder="搜索家长或学生" />
      <van-index-bar :index-list="indexList">
        <div v-for="(group, letter) in contactGroups" :key="letter">
          <van-index-anchor :index="letter" />
          <van-cell v-for="contact in group" :key="contact.id" :title="contact.parentName" :label="`${contact.studentName} | ${contact.class}`" is-link @click="viewContact(contact)">
            <template #icon><van-icon name="user-circle-o" size="24" style="margin-right:12px;" /></template>
            <template #value><van-icon name="phone-circle-o" size="20" @click.stop="callParent(contact)" /></template>
          </van-cell>
        </div>
      </van-index-bar>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { request } from '@/utils/request'

interface Contact {
  id: number
  parentName: string
  studentName: string
  class: string
  phone: string
  initial: string
}

const searchQuery = ref('')
const loading = ref(false)
const contacts = ref<Contact[]>([])

const indexList = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])

const contactGroups = computed(() => {
  return contacts.value.reduce((groups: any, contact) => {
    const letter = contact.initial
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(contact)
    return groups
  }, {})
})

const loadContacts = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })
    
    // 获取教师的班级
    const classResponse = await request.get('/api/classes')
    
    if (classResponse.success && classResponse.data) {
      const allContacts: Contact[] = []
      
      // 遍历每个班级获取家长联系方式
      for (const cls of classResponse.data) {
        const parentsResponse = await request.get(`/class/${cls.id}/parents`)
        
        if (parentsResponse.success && parentsResponse.data) {
          parentsResponse.data.forEach((parent: any) => {
            allContacts.push({
              id: parent.id,
              parentName: parent.name,
              studentName: parent.studentName || '',
              class: cls.name,
              phone: parent.phone,
              initial: parent.name.charAt(0).toUpperCase()
            })
          })
        }
      }
      
      contacts.value = allContacts
    }
  } catch (error) {
    console.error('加载通讯录失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
    closeToast()
  }
}

const viewContact = (contact: Contact) => {
  showToast('查看联系人: ' + contact.parentName)
}

const callParent = (contact: Contact) => {
  window.location.href = `tel:${contact.phone}`
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadContacts()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


@import '@/styles/mobile-base.scss';
.class-contacts-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
}
</style>

