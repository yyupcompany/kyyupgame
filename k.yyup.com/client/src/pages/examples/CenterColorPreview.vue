<template>
  <div class="center-color-preview">
    <div class="controls">
      <span class="label">选择中心：</span>
      <el-button-group>
        <el-button v-for="c in centers" :key="c" size="small"
                   :type="currentCenter === c ? 'primary' : 'default'"
                   @click="setCenter(c)">{{ labels[c] }}</el-button>
      </el-button-group>
      <el-switch class="ml12" v-model="dark" active-text="暗色" inactive-text="亮色" @change="toggleTheme" />
    </div>

    <el-card class="mt16">
      <template #header>
        <div class="card-header">
          <span>组件预览（受 data-center 和主题令牌驱动）</span>
          <small class="token">--primary-color: {{ primaryColor }}</small>
          <small class="token">--primary-hover: {{ primaryHover }}</small>
        </div>
      </template>
      <div class="demo-grid">
        <section>
          <h4>Buttons</h4>
          <el-button type="primary">主按钮</el-button>
          <el-button>默认</el-button>
          <el-button type="success">成功</el-button>
          <el-button type="warning">警告</el-button>
        </section>
        <section>
          <h4>Tabs</h4>
          <el-tabs v-model="tab">
            <el-tab-pane label="概览" name="a" />
            <el-tab-pane label="明细" name="b" />
            <el-tab-pane label="配置" name="c" />
          </el-tabs>
        </section>
        <section>
          <h4>Pagination</h4>
          <el-pagination background :page-size="10" :total="100" layout="prev, pager, next" />
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const centers = ['personnel','enrollment','activity','marketing','system','ai'] as const
const labels: Record<typeof centers[number], string> = {
  personnel: '人员',
  enrollment: '招生',
  activity: '活动',
  marketing: '营销',
  system: '系统',
  ai: 'AI'
}

const route = useRoute()
const router = useRouter()
const tab = ref('a')
const dark = ref(false)

const currentCenter = computed(() => {
  const c = route.params.center
  return typeof c === 'string' && centers.includes(c as any) ? (c as (typeof centers)[number]) : 'personnel'
})

function setCenter(c: (typeof centers)[number]) {
  router.replace({ name: 'CenterColorPreview', params: { center: c } })
}

function readCssVar(name: string) {
  return getComputedStyle(document.body).getPropertyValue(name).trim()
}

const primaryColor = ref('')
const primaryHover = ref('')

function refreshTokens() {
  primaryColor.value = readCssVar('--primary-color')
  primaryHover.value = readCssVar('--primary-hover')
}

onMounted(() => {
  // 若首次无参，默认到 personnel；afterEach 会读取路由参数设置 data-center
  if (!route.params.center) {
    setCenter('personnel')
  } else {
    refreshTokens()
  }
})

watch(() => route.fullPath, () => {
  // 路由切换后刷新令牌显示
  setTimeout(refreshTokens, 0)
})

function toggleTheme() {
  const html = document.documentElement
  if (dark.value) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  setTimeout(refreshTokens, 0)
}
</script>

<style scoped>
.center-color-preview { padding: var(--text-sm); }
.controls { display: flex; align-items: center; gap: var(--text-sm); }
.label { color: var(--text-regular); margin-right: var(--spacing-xs); }
.mt16 { margin-top: var(--text-lg); }
.ml12 { margin-left: var(--text-sm); }
.demo-grid { display: grid; grid-template-columns: repeat(3, minmax(220px, 1fr)); gap: var(--text-lg); }
.card-header { display: flex; gap: var(--text-lg); align-items: baseline; }
.card-header .token { color: var(--text-secondary); }
@media (max-width: 960px) { .demo-grid { grid-template-columns: 1fr; } }
</style>

