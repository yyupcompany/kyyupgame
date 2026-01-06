<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="SIP配置设置"
    width="600px"
    :before-close="handleClose"
  >
    <div class="sip-settings-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="服务器地址" prop="server">
          <el-input
            v-model="formData.server"
            placeholder="请输入SIP服务器地址"
          >
            <template #append>
              <el-button @click="handleTestConnection" :loading="testing">
                测试
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="服务器端口" prop="port">
          <el-input-number
            v-model="formData.port"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入SIP用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入SIP密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="分机号" prop="extension">
          <el-select
            v-model="formData.extension"
            placeholder="请选择分机号"
            style="width: 100%"
            filterable
            allow-create
          >
            <el-option label="1001 - 主坐席" value="1001" />
            <el-option label="1002 - 坐席2" value="1002" />
            <el-option label="1003 - 坐席3" value="1003" />
            <el-option label="1004 - 坐席4" value="1004" />
            <el-option label="1005 - 坐席5" value="1005" />
          </el-select>
        </el-form-item>

        <el-form-item label="域名" prop="domain">
          <el-input
            v-model="formData.domain"
            placeholder="请输入SIP域名"
          />
        </el-form-item>

        <el-divider>高级设置</el-divider>

        <el-form-item label="传输协议" prop="transport">
          <el-select v-model="formData.transport" style="width: 100%">
            <el-option label="UDP" value="udp" />
            <el-option label="TCP" value="tcp" />
            <el-option label="TLS" value="tls" />
          </el-select>
        </el-form-item>

        <el-form-item label="编解码器" prop="codecs">
          <el-select
            v-model="formData.codecs"
            multiple
            placeholder="请选择编解码器"
            style="width: 100%"
          >
            <el-option label="PCMU" value="pcmu" />
            <el-option label="PCMA" value="pcma" />
            <el-option label="G729" value="g729" />
            <el-option label="G722" value="g722" />
            <el-option label="Opus" value="opus" />
          </el-select>
        </el-form-item>

        <el-form-item label="注册超时" prop="registerTimeout">
          <el-input-number
            v-model="formData.registerTimeout"
            :min="60"
            :max="3600"
            :step="60"
            style="width: 100%"
          />
          <div class="form-item-help">单位：秒，默认3600秒</div>
        </el-form-item>

        <el-form-item label="保持连接">
          <el-switch v-model="formData.keepAlive" />
          <div class="form-item-help">启用后可保持SIP连接稳定</div>
        </el-form-item>

        <el-form-item label="调试模式">
          <el-switch v-model="formData.debug" />
          <div class="form-item-help">启用后将输出详细日志</div>
        </el-form-item>
      </el-form>

      <!-- 连接状态 -->
      <div v-if="connectionStatus" class="connection-status">
        <el-alert
          :type="connectionStatus.type"
          :title="connectionStatus.title"
          :description="connectionStatus.description"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button
          type="primary"
          @click="handleSave"
          :loading="saving"
        >
          保存配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

interface SIPConfig {
  server: string
  port: number
  username: string
  password: string
  extension: string
  domain: string
  transport: string
  codecs: string[]
  registerTimeout: number
  keepAlive: boolean
  debug: boolean
}

interface Props {
  visible: boolean
  sipConfig: SIPConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  save: [config: SIPConfig]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)
const testing = ref(false)
const connectionStatus = ref<{
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description: string
} | null>(null)

const formData = reactive<SIPConfig>({
  server: '',
  port: 5060,
  username: '',
  password: '',
  extension: '',
  domain: '',
  transport: 'udp',
  codecs: ['pcmu', 'pcma'],
  registerTimeout: 3600,
  keepAlive: true,
  debug: false
})

const formRules: FormRules = {
  server: [
    { required: true, message: '请输入SIP服务器地址', trigger: 'blur' },
    { pattern: /^[\w\.-]+$/, message: '请输入有效的服务器地址', trigger: 'blur' }
  ],
  port: [
    { required: true, message: '请输入服务器端口', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口范围1-65535', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  extension: [
    { required: true, message: '请选择或输入分机号', trigger: 'change' },
    { pattern: /^\d{3,5}$/, message: '分机号为3-5位数字', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入域名', trigger: 'blur' }
  ]
}

// 监听props变化
watch(() => props.sipConfig, (newConfig) => {
  if (newConfig) {
    Object.assign(formData, newConfig)
  }
}, { immediate: true, deep: true })

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    connectionStatus.value = null
  }
})

// 方法
const handleClose = () => {
  connectionStatus.value = null
  emit('update:visible', false)
}

const handleReset = () => {
  if (props.sipConfig) {
    Object.assign(formData, props.sipConfig)
  }
  connectionStatus.value = null
  ElMessage.success('配置已重置')
}

const handleTestConnection = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate(['server', 'port', 'username', 'password'])

    testing.value = true
    connectionStatus.value = null

    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 这里应该调用真实的测试API
    // const response = await request.post('/call-center/sip/test', {
    //   server: formData.server,
    //   port: formData.port,
    //   username: formData.username,
    //   password: formData.password
    // })

    // 模拟测试结果
    const success = Math.random() > 0.3 // 70%成功率

    if (success) {
      connectionStatus.value = {
        type: 'success',
        title: '连接测试成功',
        description: `成功连接到SIP服务器 ${formData.server}:${formData.port}`
      }
      ElMessage.success('SIP连接测试成功')
    } else {
      connectionStatus.value = {
        type: 'error',
        title: '连接测试失败',
        description: '无法连接到SIP服务器，请检查网络和配置信息'
      }
      ElMessage.error('SIP连接测试失败')
    }
  } catch (error) {
    console.error('测试连接失败:', error)
    connectionStatus.value = {
      type: 'error',
      title: '验证失败',
      description: '请先完善必填的配置信息'
    }
  } finally {
    testing.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    saving.value = true

    // 模拟保存过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    const configToSave = { ...formData }
    emit('save', configToSave)

    ElMessage.success('SIP配置保存成功')
    handleClose()
  } catch (error) {
    console.error('保存配置失败:', error)
    ElMessage.error('请完善配置信息')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.sip-settings-content {
  .form-item-help {
    font-size: var(--text-sm);
    color: var(--text-secondary, var(--text-secondary));
    margin-top: var(--spacing-xs);
  }

  .connection-status {
    margin-top: var(--text-2xl);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 暗黑主题
.dark {
  .form-item-help {
    color: var(--white-alpha-60);
  }
}

// html.dark 兼容性
html.dark {
  .form-item-help {
    color: var(--white-alpha-60);
  }
}
</style>