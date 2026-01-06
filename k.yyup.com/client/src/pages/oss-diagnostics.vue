<template>
  <div class="oss-diagnostics">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">🔧 OSS 诊断工具</span>
          <el-button type="primary" @click="runDiagnostics">运行诊断</el-button>
        </div>
      </template>

      <!-- 诊断结果 -->
      <div v-if="diagnostics" class="diagnostics-result">
        <el-alert
          :title="diagnostics.connection.status === 'success' ? '✅ 连接成功' : '❌ 连接失败'"
          :type="diagnostics.connection.status === 'success' ? 'success' : 'error'"
          :closable="false"
          show-icon
        />

        <el-divider>环境配置</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Bucket">
            {{ diagnostics.environment.bucket }}
          </el-descriptions-item>
          <el-descriptions-item label="Region">
            {{ diagnostics.environment.region }}
          </el-descriptions-item>
          <el-descriptions-item label="Access Key ID">
            <el-tag v-if="diagnostics.environment.hasAccessKeyId" type="success">已配置</el-tag>
            <el-tag v-else type="danger">未配置</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Access Key Secret">
            <el-tag v-if="diagnostics.environment.hasAccessKeySecret" type="success">已配置</el-tag>
            <el-tag v-else type="danger">未配置</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 错误信息 -->
        <div v-if="diagnostics.connection.error" class="error-section">
          <el-divider>错误信息</el-divider>
          <el-alert
            :title="`错误代码: ${diagnostics.connection.error.code}`"
            :description="diagnostics.connection.error.message"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>

      <!-- 配置指南 -->
      <el-divider>OSS 配置指南</el-divider>
      <div v-if="guide" class="guide-section">
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step
            v-for="step in guide.steps"
            :key="step.step"
            :title="`步骤 ${step.step}`"
            :description="step.title"
          />
        </el-steps>

        <div class="steps-content">
          <div v-for="step in guide.steps" :key="step.step" class="step-item">
            <h3>{{ step.step }}. {{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <div v-if="step.url" class="step-link">
              <el-button type="primary" link :href="step.url" target="_blank">
                {{ step.title }}
              </el-button>
            </div>
            <div v-if="step.config" class="step-config">
              <el-code-block
                v-for="(value, key) in step.config"
                :key="key"
                language="bash"
              >
                {{ key }}={{ value }}
              </el-code-block>
            </div>
          </div>
        </div>

        <!-- 故障排除 -->
        <el-divider>故障排除</el-divider>
        <div class="troubleshooting">
          <div v-for="(item, index) in guide.troubleshooting" :key="index" class="trouble-item">
            <h4>{{ item.issue }}</h4>
            <ul>
              <li v-for="(solution, idx) in item.solutions" :key="idx">
                {{ solution }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { request } from '@/utils/request';

const diagnostics = ref(null);
const guide = ref(null);
const activeStep = ref(0);
const loading = ref(false);

const runDiagnostics = async () => {
  loading.value = true;
  try {
    const result = await request.get('/oss-diagnostics/diagnose');
    diagnostics.value = result.data;
    
    if (result.data.connection.status === 'success') {
      ElMessage.success('✅ OSS 连接成功！');
    } else {
      ElMessage.error('❌ OSS 连接失败，请检查配置');
    }
  } catch (error) {
    ElMessage.error('诊断失败');
  } finally {
    loading.value = false;
  }
};

const loadGuide = async () => {
  try {
    const result = await request.get('/oss-diagnostics/guide');
    guide.value = result.data;
  } catch (error) {
    ElMessage.error('加载指南失败');
  }
};

onMounted(() => {
  loadGuide();
  runDiagnostics();
});
</script>

<style scoped lang="scss">
.oss-diagnostics {
  padding: var(--spacing-lg);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: var(--text-lg);
      font-weight: bold;
    }
  }

  .diagnostics-result {
    margin-bottom: 20px;

    .error-section {
      margin-top: 20px;
    }
  }

  .guide-section {
    .steps-content {
      margin-top: 20px;

      .step-item {
        margin-bottom: 30px;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;

        h3 {
          margin-top: 0;
          color: #333;
        }

        p {
          color: #666;
          margin: 10px 0;
        }

        .step-link {
          margin: 10px 0;
        }

        .step-config {
          background: #fff;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-family: monospace;
          font-size: var(--text-xs);
          overflow-x: auto;
        }
      }
    }

    .troubleshooting {
      .trouble-item {
        margin-bottom: 20px;
        padding: 15px;
        background: #fef0f0;
        border-left: 4px solid #f56c6c;
        border-radius: 4px;

        h4 {
          margin-top: 0;
          color: #f56c6c;
        }

        ul {
          margin: 10px 0;
          padding-left: 20px;

          li {
            margin: 5px 0;
            color: #666;
          }
        }
      }
    }
  }
}
</style>

