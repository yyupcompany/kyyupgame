<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item 
      v-for="(item, index) in breadcrumbList" 
      :key="index"
      :to="index === breadcrumbList.length - 1 ? '' : { path: item.path }"
    >
      {{ item.title || item.name }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { BreadcrumbNav } from '../../types/layout'

export default defineComponent({
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    const breadcrumbList = ref<BreadcrumbNav[]>([])

    // 更新面包屑数据
    const updateBreadcrumb = () => {
      breadcrumbList.value = []

      // 获取匹配的路由
      const matched = route.matched.filter(item => item.meta && item.meta.title)

      // 如果没有匹配的路由项，使用路径生成面包屑
      if (matched.length === 0) {
        generateBreadcrumbFromPath()
        return
      }

      // 处理匹配的路由信息构建面包屑
      matched.forEach(item => {
        // 跳过根路由
        if (item.path === '/') return

        // 使用activeMenu作为路径，如果存在
        const path = item.meta.activeMenu
          ? item.meta.activeMenu as string
          : item.path

        breadcrumbList.value.push({
          title: item.meta.title as string,
          name: item.meta.title as string,
          path
        })
      })

      // 如果面包屑为空，使用路径生成
      if (breadcrumbList.value.length === 0) {
        generateBreadcrumbFromPath()
      }
    }

    // 根据路径生成面包屑
    const generateBreadcrumbFromPath = () => {
      const pathSegments = route.path.split('/').filter(Boolean)

      // 路径到标题的映射
      const pathTitleMap: Record<string, string> = {
        'dashboard': '工作台',
        'system': '系统管理',
        'users': '用户管理',
        'roles': '角色管理',
        'permissions': '权限管理',
        'settings': '系统设置',
        'logs': '系统日志',
        'backup': '数据备份',
        'ai-model-config': 'AI模型配置',
        'message-template': '消息模板',
        'enrollment': '招生管理',
        'enrollment-plan': '招生计划',
        'teacher': '教师管理',
        'student': '学生管理',
        'parent': '家长管理',
        'class': '班级管理',
        'activity': '活动管理',
        'ai': 'AI系统',
        'chat': 'AI对话',
        'memory': 'AI记忆管理',
        'model': 'AI模型管理',
        'principal': '园长功能',
        'performance': '绩效管理',
        'customer-pool': '客户池管理',
        'statistics': '统计分析',
        'customer': '客户管理',
        'advertisement': '广告管理',
        'marketing': '营销管理',
        'application': '应用管理',
        'chat-interface': 'AI对话'
      }

      let currentPath = ''
      pathSegments.forEach(segment => {
        currentPath += `/${segment}`
        const title = pathTitleMap[segment] || segment

        breadcrumbList.value.push({
          title,
          name: title,
          path: currentPath
        })
      })
    }

    // 监听路由变化
    watch(() => route.path, updateBreadcrumb, { immediate: true })

    return {
      breadcrumbList
    }
  },
  props: {
    // 允许外部传入面包屑数据
    items: {
      type: Array as () => BreadcrumbNav[],
      default: () => []
    }
  },
  watch: {
    // 当外部传入的items变化时更新面包屑
    items: {
      handler(newItems) {
        if (newItems && newItems.length > 0) {
          this.breadcrumbList = newItems
        }
      },
      immediate: true
    }
  }
})
</script>

<style scoped>

.el-breadcrumb {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  
  :deep(.el-breadcrumb__inner) {
    color: var(--text-secondary);
    font-weight: 400;
    transition: color var(--transition-duration);
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  :deep(.el-breadcrumb__item) {
    &:last-child {
      .el-breadcrumb__inner {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
  
  :deep(.el-breadcrumb__separator) {
    color: var(--text-placeholder);
    margin: 0 var(--app-gap-xs);
  }
}

// Element Plus 组件主题化
:deep(.el-breadcrumb) {
  --el-breadcrumb-font-size: var(--text-sm);
  --el-breadcrumb-separator-color: var(--text-placeholder);
}
</style> 