<template>
  <div class="dialog-demo">
    <h2>BaseDialog 使用示例</h2>

    <!-- 基础对话框示例 -->
    <div class="demo-section">
      <h3>基础对话框</h3>
      <van-space>
        <van-button @click="showBasicDialog">基础Dialog</van-button>
        <van-button @click="showAlertDialog">Alert提示</van-button>
        <van-button @click="showConfirmDialog">确认对话框</van-button>
      </van-space>
    </div>

    <!-- 弹出框示例 -->
    <div class="demo-section">
      <h3>弹出框</h3>
      <van-space>
        <van-button @click="showBottomPopup">底部弹出</van-button>
        <van-button @click="showFullscreenPopup">全屏弹出</van-button>
        <van-button @click="showCenterPopup">居中弹出</van-button>
      </van-space>
    </div>

    <!-- 表单对话框示例 -->
    <div class="demo-section">
      <h3>表单对话框</h3>
      <van-space>
        <van-button @click="showFormDialog">表单Dialog</van-button>
        <van-button @click="showAddStudentDialog">添加学生</van-button>
      </van-space>
    </div>

    <!-- ActionSheet 示例 -->
    <div class="demo-section">
      <h3>ActionSheet</h3>
      <van-space>
        <van-button @click="showActionSheet">操作菜单</van-button>
        <van-button @click="showShareSheet">分享菜单</van-button>
      </van-space>
    </div>

    <!-- 列表选择对话框 -->
    <div class="demo-section">
      <h3>列表选择</h3>
      <van-space>
        <van-button @click="showListSelector">选择城市</van-button>
        <van-button @click="showImageSelector">选择图片</van-button>
      </van-space>
    </div>

    <!-- 基础对话框 -->
    <BaseDialog
      v-model="basicDialog.visible"
      :title="basicDialog.title"
      :type="basicDialog.type"
      :show-confirm-button="basicDialog.showConfirmButton"
      :show-cancel-button="basicDialog.showCancelButton"
      :confirm-button-text="basicDialog.confirmButtonText"
      :cancel-button-text="basicDialog.cancelButtonText"
      :loading="basicDialog.loading"
      @confirm="handleBasicConfirm"
      @cancel="handleBasicCancel"
    >
      {{ basicDialog.content }}
    </BaseDialog>

    <!-- 底部弹出框 -->
    <BaseDialog
      v-model="popupDialog.visible"
      :title="popupDialog.title"
      type="popup"
      position="bottom"
      :height="popupDialog.height"
      :round="popupDialog.round"
      :show-header="popupDialog.showHeader"
      :show-actions="popupDialog.showActions"
      @confirm="handlePopupConfirm"
      @cancel="handlePopupCancel"
    >
      <div class="popup-content">
        <h4>弹出框内容</h4>
        <p>这是底部弹出框的内容区域</p>
        <van-cell-group>
          <van-cell title="选项1" />
          <van-cell title="选项2" />
          <van-cell title="选项3" />
        </van-cell-group>
      </div>
    </BaseDialog>

    <!-- 表单对话框 -->
    <BaseDialog
      v-model="formDialog.visible"
      title="添加学生"
      type="popup"
      position="bottom"
      height="70vh"
      :loading="formDialog.loading"
      @confirm="handleFormSubmit"
    >
      <van-form ref="studentFormRef" @submit="handleFormSubmit">
        <van-cell-group inset>
          <van-field
            v-model="studentForm.name"
            name="name"
            label="姓名"
            placeholder="请输入学生姓名"
            :rules="[{ required: true, message: '请输入学生姓名' }]"
          />
          <van-field
            v-model="studentForm.age"
            name="age"
            label="年龄"
            placeholder="请输入年龄"
            type="number"
            :rules="[{ required: true, message: '请输入年龄' }]"
          />
          <van-field
            v-model="studentForm.class"
            name="class"
            label="班级"
            placeholder="请选择班级"
            readonly
            is-link
            @click="showClassPicker = true"
          />
        </van-cell-group>
      </van-form>
    </BaseDialog>

    <!-- ActionSheet -->
    <BaseDialog
      v-model="actionSheet.visible"
      :title="actionSheet.title"
      type="actionsheet"
      :actions="actionSheet.actions"
      :description="actionSheet.description"
      @action-select="handleActionSelect"
    />

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { BaseDialog } from './BaseDialog.vue'
import { useBaseDialog, useFormDialog, useListDialog } from '@/composables/useBaseDialog'

// ====== 使用 Composable 的方式 ======

// 基础对话框
const dialog = useBaseDialog()

// 表单对话框
const formDialog = useFormDialog({
  name: '',
  age: '',
  class: ''
})

// 列表选择对话框
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉']
const cityDialog = useListDialog(
  cities,
  (city) => city,
  (city) => city
)

// ====== 直接使用组件的方式 ======

// 基础对话框状态
const basicDialog = reactive({
  visible: false,
  title: '',
  type: 'dialog' as const,
  content: '',
  showConfirmButton: true,
  showCancelButton: true,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  loading: false
})

// 弹出框状态
const popupDialog = reactive({
  visible: false,
  title: '',
  height: 'auto',
  round: true,
  showHeader: true,
  showActions: true
})

// 表单对话框状态
const formDialogDirect = reactive({
  visible: false,
  loading: false
})

// 学生表单
const studentForm = reactive({
  name: '',
  age: '',
  class: ''
})

const studentFormRef = ref()

// ActionSheet 状态
const actionSheet = reactive({
  visible: false,
  title: '',
  description: '',
  actions: [
    { name: '选项1', value: 'option1' },
    { name: '选项2', value: 'option2' },
    { name: '选项3', value: 'option3' },
    { name: '删除', value: 'delete', color: '#ee0a24' }
  ]
})

// 班级选择
const showClassPicker = ref(false)
const classColumns = ['小班', '中班', '大班', '学前班']

// ====== 事件处理 ======

// 基础对话框事件
const handleBasicConfirm = () => {
  console.log('基础对话框确认')
  basicDialog.visible = false
}

const handleBasicCancel = () => {
  console.log('基础对话框取消')
}

// 弹出框事件
const handlePopupConfirm = () => {
  console.log('弹出框确认')
  popupDialog.visible = false
}

const handlePopupCancel = () => {
  console.log('弹出框取消')
}

// 表单提交
const handleFormSubmit = async () => {
  try {
    basicDialog.loading = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('表单数据:', studentForm)

    basicDialog.visible = false
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    basicDialog.loading = false
  }
}

// ActionSheet 选择
const handleActionSelect = (action: any) => {
  console.log('选择的操作:', action)
}

// 班级选择
const onClassConfirm = ({ selectedValues }: any) => {
  studentForm.class = selectedValues[0]
  showClassPicker.value = false
}

// ====== 示例方法 ======

// 使用 Composable 的示例
const showComposableDialog = () => {
  dialog.alert('这是一个提示消息', '提示')
}

const showComposableConfirm = async () => {
  const result = await dialog.confirm('确定要执行此操作吗？', '确认')
  console.log('确认结果:', result)
}

const showComposableActions = () => {
  dialog.actionsheet([
    { name: '编辑', value: 'edit' },
    { name: '删除', value: 'delete', color: '#ee0a24' },
    { name: '分享', value: 'share' }
  ], '选择操作')
}

// 使用组件的示例
const showBasicDialog = () => {
  basicDialog.title = '基础对话框'
  basicDialog.content = '这是一个基础的对话框示例'
  basicDialog.visible = true
}

const showAlertDialog = () => {
  basicDialog.title = '提示'
  basicDialog.content = '这是一个提示信息'
  basicDialog.showCancelButton = false
  basicDialog.confirmButtonText = '知道了'
  basicDialog.visible = true
}

const showConfirmDialog = () => {
  basicDialog.title = '确认'
  basicDialog.content = '确定要删除这个项目吗？此操作不可撤销。'
  basicDialog.showCancelButton = true
  basicDialog.confirmButtonText = '删除'
  basicDialog.cancelButtonText = '取消'
  basicDialog.visible = true
}

const showBottomPopup = () => {
  popupDialog.title = '底部弹出框'
  popupDialog.height = '60vh'
  popupDialog.visible = true
}

const showFullscreenPopup = () => {
  popupDialog.title = '全屏弹出框'
  popupDialog.height = '100vh'
  popupDialog.round = false
  popupDialog.visible = true
}

const showCenterPopup = () => {
  dialog.show({
    type: 'popup',
    title: '居中弹出框',
    position: 'center',
    width: '80vw',
    height: 'auto',
    showCancelButton: true,
    showConfirmButton: false
  })
}

const showFormDialog = () => {
  formDialog.showForm({}, {
    title: '添加学生信息'
  })
}

const showAddStudentDialog = () => {
  basicDialog.visible = true
  basicDialog.title = '添加学生'
}

const showActionSheet = () => {
  actionSheet.title = '选择操作'
  actionSheet.visible = true
}

const showShareSheet = () => {
  actionSheet.title = '分享到'
  actionSheet.description = '选择分享平台'
  actionSheet.actions = [
    { name: '微信', value: 'wechat' },
    { name: '朋友圈', value: 'moments' },
    { name: 'QQ', value: 'qq' },
    { name: '微博', value: 'weibo' }
  ]
  actionSheet.visible = true
}

const showListSelector = () => {
  cityDialog.showSelector('请选择城市')
}

const showImageSelector = () => {
  // 这里可以结合图片预览功能
  dialog.show({
    type: 'popup',
    title: '选择图片',
    position: 'center',
    width: '90vw',
    height: '60vh'
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.dialog-demo {
  padding: var(--mobile-gap);

  h2 {
    margin-bottom: var(--mobile-gap-lg);
    text-align: center;
    color: var(--text-primary);
  }

  .demo-section {
    margin-bottom: var(--mobile-gap-xl);

    h3 {
      margin-bottom: var(--mobile-gap);
      color: var(--text-secondary);
      font-size: var(--mobile-text-lg);
    }
  }

  .popup-content {
    h4 {
      margin-bottom: var(--mobile-gap);
      color: var(--text-primary);
    }

    p {
      margin-bottom: var(--mobile-gap);
      color: var(--text-secondary);
    }
  }
}
</style>