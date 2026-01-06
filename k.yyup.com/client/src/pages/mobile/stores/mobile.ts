import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMobileStore = defineStore('mobile', () => {
  // 状态
  const isLogin = ref(false)
  const userInfo = ref<any>(null)
  const currentTab = ref('home')
  const loading = ref(false)

  // 操作
  const setLogin = (status: boolean) => {
    isLogin.value = status
  }

  const setUserInfo = (info: any) => {
    userInfo.value = info
  }

  const setCurrentTab = (tab: string) => {
    currentTab.value = tab
  }

  const setLoading = (status: boolean) => {
    loading.value = status
  }

  const logout = () => {
    isLogin.value = false
    userInfo.value = null
    currentTab.value = 'home'
  }

  return {
    // 状态
    isLogin,
    userInfo,
    currentTab,
    loading,
    // 操作
    setLogin,
    setUserInfo,
    setCurrentTab,
    setLoading,
    logout
  }
})
