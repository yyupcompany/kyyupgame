<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    class="course-edit-dialog"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="form-section">
            <el-form-item label="课程名称" prop="course_name">
              <el-input v-model="form.course_name" placeholder="请输入课程名称" maxlength="100" show-word-limit />
            </el-form-item>

            <el-form-item label="课程描述">
              <el-input
                v-model="form.course_description"
                type="textarea"
                :rows="4"
                placeholder="请输入课程描述"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="年龄组" prop="age_group">
                  <el-select v-model="form.age_group" placeholder="选择年龄组" style="width: 100%">
                    <el-option label="小班(3-4岁)" value="3-4" />
                    <el-option label="中班(4-5岁)" value="4-5" />
                    <el-option label="大班(5-6岁)" value="5-6" />
                    <el-option label="全年龄段(3-6岁)" value="3-6" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="学期" prop="semester">
                  <el-select v-model="form.semester" placeholder="选择学期" style="width: 100%">
                    <el-option label="上学期" value="上学期" />
                    <el-option label="下学期" value="下学期" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="学年" prop="academic_year">
                  <el-input v-model="form.academic_year" placeholder="如：2024-2025" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="总课时">
                  <el-input-number v-model="form.total_sessions" :min="1" :max="100" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="每节课时长">
                  <el-input-number v-model="form.session_duration" :min="10" :max="120" style="width: 150px" />
                  <span style="margin-left: 10px; color: var(--el-text-color-secondary)">分钟</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="班级类型">
                  <el-input v-model="form.target_class_type" placeholder="适用的班级类型" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="课程目标">
              <el-input
                v-model="form.objectives"
                type="textarea"
                :rows="3"
                placeholder="请输入课程教学目标"
              />
            </el-form-item>

            <el-form-item label="课程封面">
              <div class="thumbnail-upload">
                <el-upload
                  class="thumbnail-uploader"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleThumbnailSuccess"
                  :before-upload="beforeThumbnailUpload"
                  accept="image/*"
                >
                  <el-image
                    v-if="form.thumbnail_url"
                    :src="form.thumbnail_url"
                    class="thumbnail-image"
                    fit="cover"
                  />
                  <div v-else class="thumbnail-placeholder">
                    <el-icon :size="32"><Plus /></el-icon>
                    <div>上传封面</div>
                  </div>
                </el-upload>
                <div class="thumbnail-tip">建议尺寸: 400x300px</div>
              </div>
            </el-form-item>

            <!-- 脑科学四进度配置 -->
            <div v-if="form.course_type === 'brain_science'" class="progress-config-section">
              <el-divider content-position="left">四进度配置</el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="室内课周数">
                    <el-input-number
                      v-model="form.progress_config.indoor_weeks"
                      :min="1"
                      :max="20"
                      style="width: 150px"
                    />
                    <span style="margin-left: 10px">周</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="户外课周数">
                    <el-input-number
                      v-model="form.progress_config.outdoor_weeks"
                      :min="1"
                      :max="20"
                      style="width: 150px"
                    />
                    <span style="margin-left: 10px">周</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="校外展示">
                    <el-input-number
                      v-model="form.progress_config.display_count"
                      :min="0"
                      :max="10"
                      style="width: 150px"
                    />
                    <span style="margin-left: 10px">次/学期</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="锦标赛">
                    <el-input-number
                      v-model="form.progress_config.championship_count"
                      :min="0"
                      :max="5"
                      style="width: 150px"
                    />
                    <span style="margin-left: 10px">次/学期</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>

        <!-- 课程内容 -->
        <el-tab-pane label="课程内容" name="contents">
          <CourseContentEditor
            v-if="form.id"
            :course-id="form.id"
            v-model="courseContents"
            :interactive-courses="interactiveCourses"
            @change="handleContentChange"
          />
          <el-empty v-else description="请先保存基本信息后再添加课程内容">
            <el-button type="primary" @click="handleSaveBasic">保存基本信息</el-button>
          </el-empty>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
        <el-button 
          v-if="mode === 'edit' && form.status === 'draft'" 
          type="success" 
          @click="handleSaveAndPublish"
        >
          保存并发布
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import CourseContentEditor from './CourseContentEditor.vue';
import {
  createCourse,
  updateCourse,
  publishCourse,
  getCourseContents,
  type CustomCourse,
  type CourseContent
} from '@/api/endpoints/custom-course';
import { useUserStore } from '@/stores/user';

// Props
interface Props {
  visible: boolean;
  course?: CustomCourse | null;
  mode: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
  mode: 'create'
});

// Emits
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'saved'): void;
}>();

// 用户存储
const userStore = useUserStore();

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 对话框标题
const dialogTitle = computed(() => {
  const typeLabel = props.course?.course_type === 'brain_science' ? '脑科学课程' : '自定义课程';
  return props.mode === 'create' ? `创建${typeLabel}` : `编辑${typeLabel}`;
});

// 表单引用
const formRef = ref<FormInstance>();
const activeTab = ref('basic');
const saving = ref(false);

// 表单数据
const form = reactive<Partial<CustomCourse>>({
  id: undefined,
  course_name: '',
  course_description: '',
  course_type: 'custom',
  age_group: '3-6',
  semester: '',
  academic_year: '',
  status: 'draft',
  thumbnail_url: '',
  objectives: '',
  target_class_type: '',
  total_sessions: 16,
  session_duration: 40,
  progress_config: {
    indoor_weeks: 16,
    outdoor_weeks: 16,
    display_count: 2,
    championship_count: 1
  }
});

// 表单验证规则
const formRules: FormRules = {
  course_name: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  age_group: [
    { required: true, message: '请选择年龄组', trigger: 'change' }
  ],
  semester: [
    { required: true, message: '请选择学期', trigger: 'change' }
  ],
  academic_year: [
    { required: true, message: '请输入学年', trigger: 'blur' }
  ]
};

// 课程内容
const courseContents = ref<CourseContent[]>([]);

// 互动课程列表（用于关联）
const interactiveCourses = ref<Array<{ id: number; name: string; description?: string }>>([]);

// 上传配置
const uploadUrl = computed(() => '/api/upload');
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}));

// 监听course变化，初始化表单
watch(
  () => props.course,
  async (newCourse) => {
    if (newCourse) {
      Object.assign(form, {
        ...newCourse,
        progress_config: newCourse.progress_config || {
          indoor_weeks: 16,
          outdoor_weeks: 16,
          display_count: 2,
          championship_count: 1
        }
      });
      // 加载课程内容
      if (newCourse.id) {
        await loadCourseContents(newCourse.id);
      }
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.course_name = '';
  form.course_description = '';
  form.course_type = 'custom';
  form.age_group = '3-6';
  form.semester = '';
  form.academic_year = '';
  form.status = 'draft';
  form.thumbnail_url = '';
  form.objectives = '';
  form.target_class_type = '';
  form.total_sessions = 16;
  form.session_duration = 40;
  form.progress_config = {
    indoor_weeks: 16,
    outdoor_weeks: 16,
    display_count: 2,
    championship_count: 1
  };
  courseContents.value = [];
  activeTab.value = 'basic';
};

// 加载课程内容
const loadCourseContents = async (courseId: number) => {
  try {
    const res = await getCourseContents(courseId);
    if (res.success) {
      courseContents.value = res.data;
    }
  } catch (error) {
    console.error('加载课程内容失败:', error);
  }
};

// 封面上传成功
const handleThumbnailSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.success && response.data?.url) {
    form.thumbnail_url = response.data.url;
    ElMessage.success('封面上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 封面上传前验证
const beforeThumbnailUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!');
    return false;
  }
  return true;
};

// 内容变化
const handleContentChange = () => {
  // 内容已自动保存到后端
};

// 保存基本信息
const handleSaveBasic = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    await handleSave();
    if (form.id) {
      activeTab.value = 'contents';
    }
  } catch (error) {
    console.error('验证失败:', error);
  }
};

// 保存
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    const courseData = {
      course_name: form.course_name,
      course_description: form.course_description,
      course_type: form.course_type,
      age_group: form.age_group,
      semester: form.semester,
      academic_year: form.academic_year,
      thumbnail_url: form.thumbnail_url,
      objectives: form.objectives,
      target_class_type: form.target_class_type,
      total_sessions: form.total_sessions,
      session_duration: form.session_duration,
      progress_config: form.course_type === 'brain_science' ? form.progress_config : undefined
    };

    let res;
    if (props.mode === 'edit' && form.id) {
      res = await updateCourse(form.id, courseData);
    } else {
      res = await createCourse(courseData);
    }

    if (res.success) {
      if (!form.id && res.data?.id) {
        form.id = res.data.id;
      }
      ElMessage.success('保存成功');
      emit('saved');
      
      if (props.mode === 'create') {
        // 创建模式下切换到内容编辑
        activeTab.value = 'contents';
      } else {
        dialogVisible.value = false;
      }
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 保存并发布
const handleSaveAndPublish = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    // 先保存
    await handleSave();

    // 再发布
    if (form.id) {
      const res = await publishCourse(form.id);
      if (res.success) {
        ElMessage.success('发布成功');
        dialogVisible.value = false;
        emit('saved');
      }
    }
  } catch (error) {
    console.error('保存并发布失败:', error);
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.course-edit-dialog {
  :deep(.el-dialog__body) {
    padding-top: 10px;
  }
}

.form-section {
  padding: 10px 0;
}

.thumbnail-upload {
  .thumbnail-uploader :deep(.el-upload) {
    width: 200px;
    height: 150px;
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .thumbnail-image {
    width: 200px;
    height: 150px;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    width: 200px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-placeholder);
    gap: 8px;
  }

  .thumbnail-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.progress-config-section {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>


