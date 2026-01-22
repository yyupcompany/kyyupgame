/**
 * Center 统一组件库
 *
 * 用于所有 center 页面和子页面的统一样式组件
 * 遵循项目设计令牌系统，支持暗黑模式和响应式设计
 *
 * @module components/center
 */

// 基础组件
export { default as CenterCard } from './CenterCard.vue'
export { default as CenterStatCard } from './CenterStatCard.vue'
export { default as CenterButton } from './CenterButton.vue'
export { default as CenterTable } from './CenterTable.vue'
export { default as CenterFormItem } from './CenterFormItem.vue'
export { default as CenterTag } from './CenterTag.vue'
export { default as CenterBadge } from './CenterBadge.vue'
export { default as CenterIcon } from './CenterIcon.vue'

// 类型导出
export type { Column } from './types'

/**
 * 使用示例:
 *
 * ```vue
 * <script setup lang="ts">
 * import {
 *   CenterCard,
 *   CenterStatCard,
 *   CenterButton,
 *   CenterTable,
 *   CenterTag,
 *   CenterBadge,
 *   CenterIcon
 * } from '@/components/center'
 * </script>
 *
 * <template>
 *   <CenterCard>
 *     <CenterStatCard
 *       icon="dashboard"
 *       label="总用户数"
 *       :value="1234"
 *       variant="primary"
 *     />
 *     <CenterButton type="primary">提交</CenterButton>
 *     <CenterTable :columns="columns" :data-source="data" />
 *   </CenterCard>
 * </template>
 * ```
 */
