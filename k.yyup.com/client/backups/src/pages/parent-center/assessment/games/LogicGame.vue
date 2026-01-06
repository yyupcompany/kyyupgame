<template>
  <div class="logic-game">
    <div class="game-instructions">
      <h3>分类游戏</h3>
      <p>请将物品拖到正确的分类中</p>
      <p class="hint">拖动物品到对应的分类框内</p>
    </div>

    <div class="game-area">
      <div class="items-container">
        <div
          v-for="(item, index) in availableItems"
          :key="index"
          class="item"
          draggable="true"
          @dragstart="handleDragStart($event, item.index)"
          @dragend="handleDragEnd"
        >
          {{ item.name }}
        </div>
      </div>

      <div class="categories-container">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="category"
          :class="{ 'drag-over': dragOverCategory === index }"
          @dragover.prevent="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
        >
          <h4>{{ category.name }}</h4>
          <div class="category-items">
            <div
              v-for="itemIndex in category.items"
              :key="itemIndex"
              class="category-item"
              draggable="true"
              @dragstart="handleDragStart($event, itemIndex)"
            >
              {{ items[itemIndex].name }}
              <el-icon class="remove-icon" @click="removeFromCategory(itemIndex, index)">
                <Close />
              </el-icon>
            </div>
            <div v-if="category.items.length === 0" class="empty-hint">
              拖放物品到这里
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">已分类:</span>
        <span class="stat-value">{{ classifiedCount }}/{{ items.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">正确数:</span>
        <span class="stat-value correct">{{ correctCount }}/{{ items.length }}</span>
      </div>
    </div>

    <div class="game-controls">
      <el-button @click="resetGame">重新开始</el-button>
      <el-button type="primary" @click="submitAnswer" :disabled="classifiedCount < items.length">
        提交答案
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'

const props = defineProps<{
  config?: any
}>()

const emit = defineEmits<{
  answer: [value: any]
}>()

// 默认数据
const defaultItems = [
  { name: '苹果', category: 0 },
  { name: '香蕉', category: 0 },
  { name: '橙子', category: 0 },
  { name: '汽车', category: 1 },
  { name: '飞机', category: 1 },
  { name: '火车', category: 1 },
  { name: '猫', category: 2 },
  { name: '狗', category: 2 },
  { name: '鸟', category: 2 }
]

const defaultCategories = [
  { name: '水果', items: [] as number[] },
  { name: '交通工具', items: [] as number[] },
  { name: '动物', items: [] as number[] }
]

// 从配置或默认值初始化
const initGameData = () => {
  if (props.config?.categories && props.config?.items) {
    // 从配置加载
    const configCategories = props.config.categories
    const configItems = props.config.items
    
    categories.value = configCategories.map((cat: string, index: number) => ({
      name: cat,
      items: [] as number[]
    }))
    
    items.value = configItems.map((item: any, index: number) => ({
      name: item.name || item,
      category: item.category !== undefined ? item.category : index % configCategories.length
    }))
  } else {
    // 使用默认值
    categories.value = JSON.parse(JSON.stringify(defaultCategories))
    items.value = JSON.parse(JSON.stringify(defaultItems))
  }
  
  // 打乱物品顺序
  for (let i = items.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items.value[i], items.value[j]] = [items.value[j], items.value[i]]
  }
}

const items = ref<any[]>([])
const categories = ref<any[]>([])
const draggedIndex = ref<number | null>(null)
const dragOverCategory = ref<number | null>(null)

const availableItems = computed(() => {
  const allInCategories = categories.value.flatMap(cat => cat.items)
  return items.value
    .map((item, index) => ({ ...item, index }))
    .filter(item => !allInCategories.includes(item.index))
})

const classifiedCount = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.items.length, 0)
})

const correctCount = computed(() => {
  let count = 0
  items.value.forEach((item, index) => {
    const category = categories.value[item.category]
    if (category && category.items.includes(index)) {
      count++
    }
  })
  return count
})

const handleDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
  
  // 添加拖拽样式
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
  draggedIndex.value = null
  dragOverCategory.value = null
}

const handleDragOver = (event: DragEvent, categoryIndex: number) => {
  dragOverCategory.value = categoryIndex
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = () => {
  dragOverCategory.value = null
}

const handleDrop = (event: DragEvent, categoryIndex: number) => {
  event.preventDefault()
  
  if (draggedIndex.value === null) return

  const itemIndex = draggedIndex.value
  const item = items.value[itemIndex]

  // 从其他分类中移除
  categories.value.forEach(cat => {
    const index = cat.items.indexOf(itemIndex)
    if (index > -1) {
      cat.items.splice(index, 1)
    }
  })

  // 添加到当前分类
  if (!categories.value[categoryIndex].items.includes(itemIndex)) {
    categories.value[categoryIndex].items.push(itemIndex)
  }

  // 检查是否正确
  const isCorrect = item.category === categoryIndex
  if (isCorrect) {
    ElMessage.success('分类正确！')
  } else {
    ElMessage.warning('分类可能有误，请再想想')
  }

  draggedIndex.value = null
  dragOverCategory.value = null
}

const removeFromCategory = (itemIndex: number, categoryIndex: number) => {
  const cat = categories.value[categoryIndex]
  const index = cat.items.indexOf(itemIndex)
  if (index > -1) {
    cat.items.splice(index, 1)
    ElMessage.info('已移除')
  }
}

const resetGame = () => {
  initGameData()
  ElMessage.info('游戏已重置')
}

const submitAnswer = () => {
  const accuracy = correctCount.value / items.value.length
  emit('answer', {
    correctCount: correctCount.value,
    totalCount: items.value.length,
    accuracy: accuracy,
    classifications: categories.value.map((cat, index) => ({
      category: cat.name,
      items: cat.items.map(i => items.value[i].name),
      correct: cat.items.filter(i => items.value[i].category === index).length,
      total: cat.items.length
    }))
  })
}

// 监听配置变化
watch(() => props.config, () => {
  initGameData()
}, { deep: true })

onMounted(() => {
  initGameData()
})
</script>

<style scoped lang="scss">
.logic-game {
  width: 100%;
  padding: var(--text-2xl);

  .game-instructions {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    h3 {
      margin-bottom: var(--spacing-2xl);
      font-size: var(--text-3xl);
      color: var(--text-primary);
    }

    p {
      margin: var(--spacing-base) 0;
      color: var(--text-regular);
      font-size: var(--text-lg);

      &.hint {
        color: var(--info-color);
        font-size: var(--text-base);
      }
    }
  }

  .game-area {
    margin-bottom: var(--spacing-8xl);

    .items-container {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-4xl);
      margin-bottom: var(--spacing-8xl);
      justify-content: center;
      padding: var(--text-2xl);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      min-height: 100px;

      .item {
        padding: var(--spacing-4xl) 25px;
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;
        border-radius: var(--spacing-sm);
        cursor: move;
        user-select: none;
        font-size: var(--text-lg);
        font-weight: 500;
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #764ba2 0%, var(--primary-color) 100%);
          transform: translateY(-2px);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    .categories-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--text-2xl);

      .category {
        min-height: 250px;
        border: 3px dashed var(--border-color);
        border-radius: var(--text-sm);
        padding: var(--text-2xl);
        background: var(--bg-tertiary);
        transition: all 0.3s;

        &.drag-over {
          border-color: var(--primary-color);
          background: #ecf5ff;
          transform: scale(1.02);
        }

        h4 {
          margin-top: 0;
          margin-bottom: var(--spacing-4xl);
          text-align: center;
          color: var(--text-primary);
          font-size: var(--text-2xl);
          font-weight: bold;
          padding-bottom: var(--spacing-2xl);
          border-bottom: 2px solid var(--border-color);
        }

        .category-items {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-2xl);

          .category-item {
            padding: var(--text-sm) 15px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            border-radius: 6px;
            text-align: center;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            box-shadow: 0 2px 6px var(--shadow-light);
            transition: all 0.3s;

            &:hover {
              transform: translateX(5px);
              box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-medium);

              .remove-icon {
                opacity: 1;
              }
            }

            .remove-icon {
              opacity: 0.7;
              cursor: pointer;
              transition: opacity 0.3s;
              font-size: var(--text-xl);

              &:hover {
                opacity: 1;
                transform: scale(1.2);
              }
            }
          }

          .empty-hint {
            text-align: center;
            color: var(--text-placeholder);
            font-size: var(--text-base);
            padding: var(--text-2xl);
            font-style: italic;
          }
        }
      }
    }
  }

  .game-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-8xl);
    margin-bottom: var(--spacing-8xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-base);

      .stat-label {
        font-size: var(--text-base);
        color: var(--info-color);
      }

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--primary-color);

        &.correct {
          color: var(--success-color);
        }
      }
    }
  }

  .game-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing-4xl);
  }
}
</style>

