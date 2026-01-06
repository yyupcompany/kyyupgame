<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
      <span 
        v-if="index === breadcrumbs.length - 1 || !item.redirect" 
        class="no-redirect"
      >
        {{ item.meta?.title }}
      </span>
      <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { RouteLocationMatched, useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const breadcrumbs = ref<RouteLocationMatched[]>([])
    
    // 过滤不需要在面包屑中显示的路由
    const getBreadcrumbs = () => {
      // 安全检查：确保route.matched存在
      if (!route.matched || !Array.isArray(route.matched)) {
        return []
      }

      let matched = route.matched.filter(item => item.meta && item.meta.title)
      
      // 如果首页不是dashboard，则添加dashboard作为首页
      const first = matched[0]
      if (first && first.path !== '/dashboard') {
        matched = [
          {
            path: '/dashboard',
            meta: { title: '首页' }
          } as RouteLocationMatched
        ].concat(matched)
      }
      
      breadcrumbs.value = matched
    }
    
    // 处理链接点击
    const handleLink = (item: RouteLocationMatched) => {
      const { redirect, path } = item
      if (redirect) {
        router.push(redirect.toString())
        return
      }
      router.push(path)
    }
    
    // 路由变化时更新面包屑
    watch(
      () => route.path,
      () => getBreadcrumbs(),
      { immediate: true }
    )
    
    return {
      breadcrumbs,
      handleLink
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.app-breadcrumb {
  display: inline-block;
  line-height: var(--header-height, 60px);
  margin-left: var(--spacing-sm);
  
  .no-redirect {
    color: var(--text-disabled);
    cursor: text;
  }
  
  a {
    color: var(--primary-color);
    cursor: pointer;
    
    &:hover {
      color: var(--primary-light);
    }
  }
}
</style> 