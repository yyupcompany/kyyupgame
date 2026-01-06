<template>
  <div class="template-selector">
    <div class="selector-header">
      <h3>🎯 选择课程模板</h3>
      <el-input
        v-model="searchQuery"
        placeholder="搜索模板..."
        style="max-width: 200px; width: 100%"
        clearable
      >
        <template #prefix>
          <UnifiedIcon name="Search" />
        </template>
      </el-input>
    </div>

    <div class="domain-filter">
      <el-button
        v-for="domain in domains"
        :key="domain.value"
        :type="selectedDomain === domain.value ? 'primary' : 'info'"
        size="small"
        @click="selectedDomain = domain.value"
      >
        {{ domain.label }}
      </el-button>
    </div>

    <div class="templates-grid">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="selectTemplate(template)"
      >
        <div class="template-icon">{{ getDomainIcon(template.domain) }}</div>
        <h4>{{ template.name }}</h4>
        <p class="description">{{ template.description }}</p>
        <div class="template-meta">
          <span class="age-group">{{ template.ageGroup }}</span>
          <span class="domain-tag">{{ getDomainLabel(template.domain) }}</span>
        </div>
        <el-button type="primary" size="small" class="select-btn">
          使用模板
        </el-button>
      </div>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <p>😔 没有找到匹配的模板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { curriculumTemplates } from '../utils/curriculum-templates'
import { CurriculumDomain } from '../types/curriculum'
import type { CurriculumTemplate } from '../types/curriculum'

interface Emits {
  (e: 'select', template: CurriculumTemplate): void
}

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedDomain = ref<CurriculumDomain | 'all'>('all')

const domains = [
  { value: 'all', label: '全部' },
  { value: CurriculumDomain.HEALTH, label: '🏃 健康领域' },
  { value: CurriculumDomain.LANGUAGE, label: '🗣️ 语言领域' },
  { value: CurriculumDomain.SOCIAL, label: '👥 社会领域' },
  { value: CurriculumDomain.SCIENCE, label: '🔬 科学领域' },
  { value: CurriculumDomain.ART, label: '🎨 艺术领域' }
]

const filteredTemplates = computed(() => {
  return curriculumTemplates.filter(template => {
    const matchDomain = selectedDomain.value === 'all' || template.domain === selectedDomain.value
    const matchSearch = template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                       template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchDomain && matchSearch
  })
})

function getDomainIcon(domain: CurriculumDomain): string {
  const icons: Record<CurriculumDomain, string> = {
    [CurriculumDomain.HEALTH]: '🏃',
    [CurriculumDomain.LANGUAGE]: '🗣️',
    [CurriculumDomain.SOCIAL]: '👥',
    [CurriculumDomain.SCIENCE]: '🔬',
    [CurriculumDomain.ART]: '🎨'
  }
  return icons[domain]
}

function getDomainLabel(domain: CurriculumDomain): string {
  const labels: Record<CurriculumDomain, string> = {
    [CurriculumDomain.HEALTH]: '健康',
    [CurriculumDomain.LANGUAGE]: '语言',
    [CurriculumDomain.SOCIAL]: '社会',
    [CurriculumDomain.SCIENCE]: '科学',
    [CurriculumDomain.ART]: '艺术'
  }
  return labels[domain]
}

function selectTemplate(template: CurriculumTemplate) {
  emit('select', template)
}
</script>

<style scoped lang="scss">
.template-selector {
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4xl);
    border-bottom: var(--z-index-dropdown) solid #eee;
    background: var(--bg-tertiary);

    h3 {
      margin: 0;
      font-size: 1em;
      color: var(--text-primary);
    }
  }

  .domain-filter {
    display: flex;
    gap: var(--spacing-2xl);
    padding: var(--spacing-4xl);
    border-bottom: var(--z-index-dropdown) solid #eee;
    flex-wrap: wrap;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-4xl);
    padding: var(--spacing-4xl);

    .template-card {
      display: flex;
      flex-direction: column;
      padding: var(--spacing-4xl);
      border: 2px solid #eee;
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.2);
        transform: translateY(var(--transform-hover-lift));
      }

      .template-icon {
        font-size: 2.5em;
        text-align: center;
        margin-bottom: var(--spacing-2xl);
      }

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 1em;
        color: var(--text-primary);
      }

      .description {
        margin: 0 0 10px 0;
        font-size: 0.85em;
        color: var(--text-secondary);
        line-height: 1.4;
        flex: 1;
      }

      .template-meta {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-2xl);
        flex-wrap: wrap;

        span {
          font-size: 0.75em;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--spacing-xs);
          background: var(--bg-gray-light);
          color: var(--text-secondary);
        }

        .domain-tag {
          background: #e6f7ff;
          color: #0050b3;
        }
      }

      .select-btn {
        width: 100%;
      }
    }
  }

  .empty-state {
    padding: var(--spacing-10xl) var(--text-2xl);
    text-align: center;
    color: var(--text-tertiary);

    p {
      margin: 0;
      font-size: var(--text-base);
    }
  }
}
</style>

