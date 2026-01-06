<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <h1>教师详情</h1>
        <el-tag v-if="teacher.status" :type="getStatusTagType(teacher.status)">
          {{ getStatusText(teacher.status) }}
        </el-tag>
      </div>
      <div class="page-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>
    
    <el-card v-loading="loading" class="detail-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ teacher.name || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ teacher.id || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ teacher.gender === 'MALE' ? '男' : teacher.gender === 'FEMALE' ? '女' : '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ teacher.title || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ teacher.phone || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="电子邮箱">{{ teacher.email || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="员工ID">{{ teacher.employeeId || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ teacher.department || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="入职日期">{{ teacher.hireDate || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="教师类型">{{ getTypeText(teacher.type) || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>教育背景</span>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="teacher.education">
        <el-descriptions-item label="学历">{{ teacher.education.degree || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ teacher.education.major || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="毕业院校">{{ teacher.education.school || '暂无' }}</el-descriptions-item>
        <el-descriptions-item label="毕业年份">{{ teacher.education.graduationYear || '暂无' }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无教育背景信息" />
    </el-card>
    
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>专业技能与证书</span>
        </div>
      </template>
      
      <div class="skills-section">
        <div class="section-title">专业技能</div>
        <div class="tag-list" v-if="teacher.skills && teacher.skills.length">
          <el-tag v-for="skill in teacher.skills" :key="skill" class="skill-tag">{{ skill }}</el-tag>
        </div>
        <el-empty v-else description="暂无专业技能信息" :image-size="60" />
      </div>
      
      <div class="skills-section">
        <div class="section-title">证书</div>
        <div class="tag-list" v-if="teacher.certification && teacher.certification.length">
          <el-tag v-for="cert in teacher.certification" :key="cert" type="success" class="skill-tag">{{ cert }}</el-tag>
        </div>
        <el-empty v-else description="暂无证书信息" :image-size="60" />
      </div>
    </el-card>
    
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span>所带班级</span>
        </div>
      </template>
      
      <el-table :data="teacherClasses" border v-loading="classesLoading" style="width: 100%">
        <el-table-column prop="id" label="班级ID" width="100" />
        <el-table-column prop="name" label="班级名称" />
        <el-table-column prop="type" label="班级类型" />
        <el-table-column label="教师角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'HEAD_TEACHER' ? 'danger' : 'primary'">
              {{ row.role === 'HEAD_TEACHER' ? '班主任' : '助理教师' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="viewClass(row)">查看班级</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="teacherClasses.length === 0 && !classesLoading" description="暂无班级信息" />
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTeacherDetail, getTeacherClasses, type Teacher as TeacherType } from '@/api/modules/teacher'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/stores/user'

// 教师状态枚举
const TeacherStatus = {
  ACTIVE: 'ACTIVE',
  LEAVE: 'LEAVE',
  RESIGNED: 'RESIGNED',
  SUSPENDED: 'SUSPENDED'
} as const

// 教师类型枚举
const TeacherType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN'
} as const

type TeacherStatusType = typeof TeacherStatus[keyof typeof TeacherStatus]
type TeacherTypeType = typeof TeacherType[keyof typeof TeacherType]

// 使用API模块的Teacher类型
type Teacher = TeacherType

// 定义班级类型
interface ClassInfo {
  id: string;
  name: string;
  type: string;
  role: 'HEAD_TEACHER' | 'ASSISTANT_TEACHER';
}

export default defineComponent({
  name: 'TeacherDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const classesLoading = ref(false)
    const teacher = ref<Teacher>({} as Teacher)
    const teacherClasses = ref<ClassInfo[]>([])
    
    // 从路由参数获取教师ID
    const teacherId = computed(() => {
      const id = route.params.id as string
      console.log('🔍 TeacherDetail: 路由参数获取', { 
        routePath: route.path, 
        routeParams: route.params, 
        id, 
        type: typeof id 
      })
      return id
    })
    
    // 验证教师ID
    const validateTeacherId = (id: any): string | null => {
      if (!id || id === 'undefined' || id === undefined || id === null || String(id).trim() === '') {
        return null
      }
      
      const validId = String(id).trim()
      if (validId === 'undefined' || validId === 'null' || validId === '' || validId.startsWith(':')) {
        return null
      }
      
      // 检查是否是数字ID
      if (!/^\d+$/.test(validId)) {
        return null
      }
      
      return validId
    }
    
    // 获取状态文本
    const getStatusText = (status: TeacherStatusType) => {
      const statusMap = {
        [TeacherStatus.ACTIVE]: '在职',
        [TeacherStatus.LEAVE]: '请假',
        [TeacherStatus.RESIGNED]: '离职',
        [TeacherStatus.SUSPENDED]: '停职'
      }
      return statusMap[status] || '未知'
    }
    
    // 获取类型文本
    const getTypeText = (type: TeacherTypeType) => {
      const typeMap = {
        [TeacherType.FULL_TIME]: '全职',
        [TeacherType.PART_TIME]: '兼职',
        [TeacherType.CONTRACT]: '合同工',
        [TeacherType.INTERN]: '实习生'
      }
      return typeMap[type] || '未知'
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status: TeacherStatusType): 'success' | 'warning' | 'info' | 'danger' | undefined => {
      const map: Record<TeacherStatusType, 'success' | 'warning' | 'info' | 'danger'> = {
        [TeacherStatus.ACTIVE]: 'success',
        [TeacherStatus.LEAVE]: 'warning',
        [TeacherStatus.RESIGNED]: 'info',
        [TeacherStatus.SUSPENDED]: 'danger'
      }
      return status ? map[status] : undefined
    }
    
    // 获取教师详情
    const fetchTeacherDetail = async () => {
      const validId = validateTeacherId(teacherId.value)
      if (!validId) {
        console.error('❌ TeacherDetail: 教师ID无效', { id: teacherId.value })
        ElMessage.error('教师ID不能为空或无效')
        return
      }
      
      console.log('✅ TeacherDetail: 开始获取教师详情', { teacherId: validId })
      loading.value = true
      try {
        const res = await getTeacherDetail(validId)
        
        if (res.success || res.data) {
          teacher.value = res.data || {} as Teacher
        } else {
          ElMessage.error(res.message || '获取教师详情失败')
        }
      } catch (error) {
        console.error('获取教师详情失败:', error)
        ElMessage.error('获取教师详情失败')
      } finally {
        loading.value = false
      }
    }
    
    // 获取教师所带班级
    const fetchTeacherClasses = async () => {
      const validId = validateTeacherId(teacherId.value)
      if (!validId) {
        console.error('❌ TeacherDetail: 获取班级时教师ID无效', { id: teacherId.value })
        ElMessage.error('教师ID不能为空或无效')
        return
      }
      
      console.log('✅ TeacherDetail: 开始获取教师班级', { teacherId: validId })
      classesLoading.value = true
      try {
        const res = await getTeacherClasses(validId)
        
        if (res.success || res.items || res.data) {
          const classes = res.items || res.data || []
          teacherClasses.value = Array.isArray(classes) ? classes : []
        } else {
          ElMessage.error(res.message || '获取教师班级失败')
        }
      } catch (error) {
        console.error('获取教师班级失败:', error)
        ElMessage.error('获取教师班级失败')
      } finally {
        classesLoading.value = false
      }
    }
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
    // 编辑教师
    const handleEdit = () => {
      const validId = validateTeacherId(teacherId.value)
      if (validId) {
        router.push(`/teacher/edit/${validId}`)
      } else {
        ElMessage.error('教师ID无效，无法编辑')
      }
    }
    
    // 查看班级
    const viewClass = (classInfo: ClassInfo) => {
      router.push(`/class/detail/${classInfo.id}`)
    }
    
    // 加载数据的统一方法
    const loadData = () => {
      const rawId = teacherId.value
      const validId = validateTeacherId(rawId)
      
      console.log('🔍 TeacherDetail: loadData检查', { 
        rawId, 
        validId, 
        routePath: route.path,
        fullPath: route.fullPath 
      })
      
      if (validId) {
        console.log('✅ TeacherDetail: 加载数据', { teacherId: validId })
        fetchTeacherDetail()
        fetchTeacherClasses()
      } else {
        console.warn('⚠️ TeacherDetail: 教师ID无效，无法加载数据', { 
          rawId, 
          reason: rawId?.startsWith(':') ? '路由参数占位符' : '无效ID格式',
          routePath: route.path 
        })
        ElMessage.warning('教师ID无效，请检查访问链接')
      }
    }

    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId, oldId) => {
        console.log('✅ TeacherDetail: 路由参数变化', { 
          oldId, 
          newId, 
          type: typeof newId,
          routePath: route.path,
          fullPath: route.fullPath
        })
        
        // 如果新ID是路由占位符，不执行加载
        if (newId === ':id' || newId?.startsWith(':')) {
          console.warn('⚠️ TeacherDetail: 检测到路由占位符，不执行数据加载', { newId })
          return
        }
        
        if (validateTeacherId(newId)) {
          loadData()
        } else {
          console.warn('⚠️ TeacherDetail: 路由参数无效', { newId })
        }
      },
      { immediate: true }
    )

    // 组件挂载时获取数据
    onMounted(() => {
      nextTick(() => {
        console.log('🚀 TeacherDetail: 组件挂载，检查初始路由参数', {
          routePath: route.path,
          routeParams: route.params,
          teacherId: teacherId.value
        })
        
        // 由于watch已经设置了immediate: true，这里不需要再次调用loadData
        // 只在watch中没有触发的情况下手动调用
        if (validateTeacherId(teacherId.value)) {
          console.log('🔄 TeacherDetail: 从onMounted补充加载数据')
          // loadData() // 注释掉，因为watch已经处理了
        }
      })
    })
    
    return {
      teacher,
      teacherClasses,
      teacherId,
      loading,
      classesLoading,
      getStatusText,
      getTypeText,
      getStatusTagType,
      goBack,
      handleEdit,
      viewClass,
      validateTeacherId
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局样式：.page-container, .page-header, .page-title, .page-actions */

.page-title h1 {
  font-size: var(--text-2xl);
  margin: 0;
}

.detail-card {
  margin-bottom: var(--text-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skills-section {
  margin-bottom: var(--text-2xl);
}

.section-title {
  font-weight: bold;
  margin-bottom: var(--spacing-2xl);
  font-size: var(--text-base);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.skill-tag {
  margin-right: 0;
}
</style> 