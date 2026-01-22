import { ref, computed } from 'vue'

// Dialog 类型
export type DialogType = 'dialog' | 'popup' | 'actionsheet'
export type PopupPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

// ActionSheet Action 类型
export interface DialogAction {
  name: string
  value?: any
  subname?: string
  loading?: boolean
  disabled?: boolean
  color?: string
  className?: string
}

// Dialog 配置
export interface DialogConfig {
  type?: DialogType
  title?: string
  content?: string
  showConfirmButton?: boolean
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonDisabled?: boolean
  closeOnClickOverlay?: boolean
  loading?: boolean

  // Popup 专用
  position?: PopupPosition
  height?: string | number
  maxHeight?: string | number
  round?: boolean
  showHeader?: boolean
  showBackArrow?: boolean
  showActions?: boolean

  // ActionSheet 专用
  actions?: DialogAction[]
  description?: string
  closeOnClickAction?: boolean

  // 样式
  width?: string | number
  dialogClass?: string
  popupClass?: string
  contentClass?: string

  // 回调函数
  onConfirm?: () => void
  onCancel?: () => void
  onActionSelect?: (action: DialogAction) => void
}

/**
 * 通用对话框 Composable
 * 提供统一的对话框管理
 */
export function useBaseDialog(initialConfig: DialogConfig = {}) {
  // 响应式状态
  const visible = ref(false)
  const loading = ref(false)
  const config = ref<DialogConfig>({
    type: 'dialog',
    title: '',
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    closeOnClickOverlay: true,
    loading: false,
    onConfirm: undefined,
    onCancel: undefined,
    onActionSelect: undefined,
    ...initialConfig
  })

  // 计算属性
  const dialogProps = computed(() => ({
    modelValue: visible.value,
    ...config.value,
    loading: loading.value
  }))

  // 显示对话框
  const show = (newConfig?: Partial<DialogConfig>) => {
    if (newConfig) {
      config.value = { ...config.value, ...newConfig }
    }
    visible.value = true
  }

  // 隐藏对话框
  const hide = () => {
    visible.value = false
    loading.value = false
  }

  // 切换显示状态
  const toggle = (newConfig?: Partial<DialogConfig>) => {
    if (visible.value) {
      hide()
    } else {
      show(newConfig)
    }
  }

  // 设置加载状态
  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  // 更新配置
  const updateConfig = (newConfig: Partial<DialogConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  // 便捷方法
  const alert = (content: string, title?: string) => {
    show({
      type: 'dialog',
      title: title || '提示',
      content,
      showCancelButton: false,
      confirmButtonText: '确定'
    })
  }

  const confirm = (content: string, title?: string, options?: Partial<DialogConfig>) => {
    return new Promise<boolean>((resolve) => {
      show({
        type: 'dialog',
        title: title || '确认',
        content,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        ...options
      })

      const originalConfirm = config.value.onConfirm
      const originalCancel = config.value.onCancel

      config.value.onConfirm = () => {
        originalConfirm?.()
        hide()
        resolve(true)
      }

      config.value.onCancel = () => {
        originalCancel?.()
        hide()
        resolve(false)
      }
    })
  }

  const prompt = (content: string, title?: string, defaultValue?: string) => {
    return new Promise<string | null>((resolve) => {
      show({
        type: 'dialog',
        title: title || '输入',
        content,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      const originalConfirm = config.value.onConfirm
      const originalCancel = config.value.onCancel

      config.value.onConfirm = () => {
        originalConfirm?.()
        // 这里需要从输入框获取值，具体实现需要配合表单组件
        hide()
        resolve('') // 暂时返回空字符串
      }

      config.value.onCancel = () => {
        originalCancel?.()
        hide()
        resolve(null)
      }
    })
  }

  const actionsheet = (actions: DialogAction[], title?: string, description?: string) => {
    return new Promise<DialogAction | null>((resolve) => {
      show({
        type: 'actionsheet',
        title,
        description,
        actions,
        closeOnClickAction: true
      })

      config.value.onActionSelect = (action: DialogAction) => {
        resolve(action)
        hide()
      }

      config.value.onCancel = () => {
        resolve(null)
        hide()
      }
    })
  }

  // 底部弹出框
  const popup = (content: string, title?: string, options?: Partial<DialogConfig>) => {
    show({
      type: 'popup',
      title,
      position: 'bottom',
      height: 'auto',
      round: true,
      showHeader: !!title,
      showActions: true,
      showCancelButton: true,
      showConfirmButton: false,
      content,
      ...options
    })
  }

  return {
    // 状态
    visible,
    loading,
    config,
    dialogProps,

    // 方法
    show,
    hide,
    toggle,
    setLoading,
    updateConfig,

    // 便捷方法
    alert,
    confirm,
    prompt,
    actionsheet,
    popup
  }
}

/**
 * 表单对话框 Composable
 * 专门用于表单类型的对话框
 */
export function useFormDialog<T = any>(
  initialData: T = {} as T,
  initialConfig: DialogConfig = {}
) {
  const dialog = useBaseDialog(initialConfig)
  const formData = ref<T>({ ...initialData })
  const formRef = ref()

  // 显示表单对话框
  const showForm = (data?: Partial<T>, config?: Partial<DialogConfig>) => {
    if (data) {
      formData.value = { ...formData.value, ...data }
    }
    dialog.show({
      type: 'popup',
      position: 'bottom',
      height: '80vh',
      round: true,
      showHeader: true,
      showActions: true,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      ...config
    })
  }

  // 验证表单
  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return false

    try {
      await formRef.value.validate()
      return true
    } catch (error) {
      console.error('表单验证失败:', error)
      return false
    }
  }

  // 提交表单
  const submitForm = async (onSubmit: (data: T) => Promise<void>) => {
    const isValid = await validateForm()
    if (!isValid) return

    dialog.setLoading(true)

    try {
      await onSubmit(formData.value)
      dialog.hide()
      return true
    } catch (error) {
      console.error('表单提交失败:', error)
      return false
    } finally {
      dialog.setLoading(false)
    }
  }

  // 重置表单
  const resetForm = () => {
    formData.value = { ...initialData }
    formRef.value?.resetValidation?.()
  }

  return {
    ...dialog,
    formData,
    formRef,
    showForm,
    validateForm,
    submitForm,
    resetForm
  }
}

/**
 * 列表选择对话框 Composable
 * 用于从列表中选择一项
 */
export function useListDialog<T>(
  items: T[],
  getItemText: (item: T) => string,
  getItemValue: (item: T) => any = (item) => item,
  initialConfig: DialogConfig = {}
) {
  const dialog = useBaseDialog(initialConfig)
  const selectedValue = ref<any>(null)
  const searchKeyword = ref('')

  // 过滤后的列表
  const filteredItems = computed(() => {
    if (!searchKeyword.value) return items

    return items.filter(item => {
      const text = getItemText(item).toLowerCase()
      return text.includes(searchKeyword.value.toLowerCase())
    })
  })

  // 显示选择对话框
  const showSelector = (title = '请选择', currentValue?: any) => {
    selectedValue.value = currentValue
    dialog.show({
      type: 'popup',
      title,
      position: 'bottom',
      height: '60vh',
      round: true,
      showHeader: true,
      showActions: false,
      showConfirmButton: false,
      showCancelButton: false,
      ...initialConfig
    })
  }

  // 选择项目
  const selectItem = (item: T) => {
    selectedValue.value = getItemValue(item)
    dialog.hide()
  }

  // 获取选中项
  const getSelectedItem = () => {
    return items.find(item => getItemValue(item) === selectedValue.value)
  }

  return {
    ...dialog,
    selectedValue,
    searchKeyword,
    filteredItems,
    showSelector,
    selectItem,
    getSelectedItem
  }
}

/**
 * 图片预览对话框
 */
export function useImageDialog(initialConfig: DialogConfig = {}) {
  const dialog = useBaseDialog({
    type: 'popup',
    position: 'center',
    width: '90vw',
    height: 'auto',
    maxHeight: '80vh',
    showHeader: false,
    showActions: false,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: '关闭',
    closeOnClickOverlay: true,
    ...initialConfig
  })

  const images = ref<string[]>([])
  const currentIndex = ref(0)

  // 显示图片
  const showImages = (imageList: string[], index = 0) => {
    images.value = imageList
    currentIndex.value = index
    dialog.show()
  }

  // 显示单张图片
  const showImage = (imageUrl: string) => {
    showImages([imageUrl], 0)
  }

  // 下一张
  const nextImage = () => {
    if (currentIndex.value < images.value.length - 1) {
      currentIndex.value++
    }
  }

  // 上一张
  const prevImage = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  return {
    ...dialog,
    images,
    currentIndex,
    showImages,
    showImage,
    nextImage,
    prevImage
  }
}