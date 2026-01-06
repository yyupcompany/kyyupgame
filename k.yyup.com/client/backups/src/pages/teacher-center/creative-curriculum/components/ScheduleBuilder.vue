<template>
  <div class="schedule-builder">
    <div class="schedule-header">
      <h3>📅 课程表构建器</h3>
      <el-button type="primary" size="small" @click="addScheduleItem">
        <el-icon><Plus /></el-icon>
        添加课程
      </el-button>
    </div>

    <div class="schedule-table">
      <table>
        <thead>
          <tr>
            <th>星期</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>课程名称</th>
            <th>教室</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in scheduleItems" :key="index">
            <td>
              <el-select v-model="item.dayOfWeek" size="small">
                <el-option label="周一" :value="1"></el-option>
                <el-option label="周二" :value="2"></el-option>
                <el-option label="周三" :value="3"></el-option>
                <el-option label="周四" :value="4"></el-option>
                <el-option label="周五" :value="5"></el-option>
                <el-option label="周六" :value="6"></el-option>
                <el-option label="周日" :value="0"></el-option>
              </el-select>
            </td>
            <td>
              <el-time-picker
                v-model="item.startTime"
                format="HH:mm"
                value-format="HH:mm"
                size="small"
                placeholder="开始时间"
              ></el-time-picker>
            </td>
            <td>
              <el-time-picker
                v-model="item.endTime"
                format="HH:mm"
                value-format="HH:mm"
                size="small"
                placeholder="结束时间"
              ></el-time-picker>
            </td>
            <td>
              <el-select
                v-model="item.curriculumId"
                size="small"
                placeholder="选择课程"
                filterable
                remote
                :remote-method="searchCurriculums"
                :loading="loadingCurriculums"
                @change="onCurriculumChange(item, $event)"
              >
                <el-option
                  v-for="curriculum in curriculumList"
                  :key="curriculum.id"
                  :label="curriculum.name"
                  :value="curriculum.id"
                />
              </el-select>
            </td>
            <td>
              <el-input
                v-model="item.classroom"
                size="small"
                placeholder="教室"
              ></el-input>
            </td>
            <td>
              <el-input
                v-model="item.notes"
                size="small"
                placeholder="备注"
              ></el-input>
            </td>
            <td>
              <el-button
                type="danger"
                size="small"
                @click="removeScheduleItem(index)"
              >
                删除
              </el-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="scheduleItems.length === 0" class="empty-state">
      <p>📭 还没有添加课程，点击"添加课程"开始创建课程表</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ScheduleItem } from '../types/curriculum'

interface Props {
  items: ScheduleItem[]
}

interface Emits {
  (e: 'update:items', value: ScheduleItem[]): void
}

interface Curriculum {
  id: string
  name: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const emit = defineEmits<Emits>()

const scheduleItems = ref<ScheduleItem[]>(props.items || [])
const curriculumList = ref<Curriculum[]>([])
const loadingCurriculums = ref(false)
const allCurriculums = ref<Curriculum[]>([])

// 获取所有课程列表
async function fetchAllCurriculums() {
  try {
    loadingCurriculums.value = true
    console.log('📚 开始获取课程列表...')

    const response = await fetch('/api/teacher-center/creative-curriculum?limit=100', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    console.log('📚 API响应状态:', response.status)

    if (!response.ok) {
      console.warn('⚠️ API返回非200状态:', response.status)
      // 即使API失败，也不显示错误提示，只是不加载课程列表
      return
    }

    const data = await response.json()
    console.log('📚 API响应数据:', data)

    if (data.code === 200 && data.data?.rows) {
      allCurriculums.value = data.data.rows.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description
      }))
      curriculumList.value = allCurriculums.value
      console.log('✅ 课程列表加载成功，共', allCurriculums.value.length, '个课程')
    } else {
      console.warn('⚠️ API返回数据格式不符:', data)
    }
  } catch (error) {
    console.error('❌ 获取课程列表失败:', error)
    // 不显示错误提示，因为这可能是正常的（比如还没有保存任何课程）
  } finally {
    loadingCurriculums.value = false
  }
}

// 搜索课程
function searchCurriculums(query: string) {
  if (query) {
    curriculumList.value = allCurriculums.value.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    )
  } else {
    curriculumList.value = allCurriculums.value
  }
}

// 课程选择变化时的处理
function onCurriculumChange(item: ScheduleItem, curriculumId: string) {
  const curriculum = allCurriculums.value.find(c => c.id === curriculumId)
  if (curriculum) {
    item.curriculumName = curriculum.name
  }
  emitUpdate()
}

function addScheduleItem() {
  scheduleItems.value.push({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    classroom: '',
    notes: '',
    curriculumId: undefined,
    curriculumName: undefined
  })
  emitUpdate()
}

function removeScheduleItem(index: number) {
  scheduleItems.value.splice(index, 1)
  emitUpdate()
}

function emitUpdate() {
  emit('update:items', scheduleItems.value)
}

// 组件挂载时获取课程列表
onMounted(() => {
  fetchAllCurriculums()
})
</script>

<style scoped lang="scss">
.schedule-builder {
  background: white;
  border-radius: var(--spacing-sm);
  overflow: hidden;
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);

  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-4xl);
    border-bottom: var(--border-width-base) solid #eee;
    background: var(--bg-tertiary);

    h3 {
      margin: 0;
      font-size: 1em;
      color: var(--text-primary);
    }
  }

  .schedule-table {
    overflow-x: auto;
    padding: var(--spacing-4xl);

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-base);

      thead {
        background: var(--bg-secondary);

        th {
          padding: var(--text-sm);
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 2px solid #ddd;
          white-space: nowrap;

          &:nth-child(1) { width: 80px; }  // 星期
          &:nth-child(2) { width: 100px; } // 开始时间
          &:nth-child(3) { width: 100px; } // 结束时间
          &:nth-child(4) { width: 150px; } // 课程名称
          &:nth-child(5) { width: 100px; } // 教室
          &:nth-child(6) { width: 120px; } // 备注
          &:nth-child(7) { width: 80px; }  // 操作
        }
      }

      tbody {
        tr {
          border-bottom: var(--border-width-base) solid #eee;

          &:hover {
            background: var(--bg-tertiary);
          }

          td {
            padding: var(--text-sm);
            vertical-align: middle;

            :deep(.el-input),
            :deep(.el-select),
            :deep(.el-time-picker) {
              width: 100%;
            }
          }
        }
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

