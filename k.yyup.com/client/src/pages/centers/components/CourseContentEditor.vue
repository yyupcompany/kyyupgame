<template>
  <div class="course-content-editor">
    <!-- 内容列表 -->
    <div class="content-list">
      <el-empty v-if="!contents.length" description="暂无课程内容，点击下方按钮添加">
        <template #image>
          <el-icon :size="60" color="var(--el-color-info-light-3)"><Document /></el-icon>
        </template>
      </el-empty>

      <draggable
        v-else
        v-model="contents"
        item-key="id"
        handle=".drag-handle"
        @end="handleDragEnd"
        class="content-draggable"
      >
        <template #item="{ element, index }">
          <div class="content-item" :class="{ 'is-editing': editingId === element.id }">
            <!-- 拖拽手柄 -->
            <div class="drag-handle">
              <el-icon><Rank /></el-icon>
            </div>

            <!-- 内容类型图标 -->
            <div class="content-type-icon" :class="element.content_type">
              <el-icon v-if="element.content_type === 'text'"><Document /></el-icon>
              <el-icon v-else-if="element.content_type === 'image'"><Picture /></el-icon>
              <el-icon v-else-if="element.content_type === 'video'"><VideoCamera /></el-icon>
              <el-icon v-else-if="element.content_type === 'interactive'"><MagicStick /></el-icon>
              <el-icon v-else><Document /></el-icon>
            </div>

            <!-- 内容信息 -->
            <div class="content-info" @click="handleEditContent(element)">
              <div class="content-title">
                <span class="order-num">{{ index + 1 }}.</span>
                {{ element.content_title }}
                <el-tag v-if="element.is_required" type="danger" size="small">必学</el-tag>
              </div>
              <div class="content-meta">
                <span class="type-label">{{ getContentTypeLabel(element.content_type) }}</span>
                <span v-if="element.duration_minutes" class="duration">
                  <el-icon><Clock /></el-icon>
                  {{ element.duration_minutes }}分钟
                </span>
              </div>
              <!-- 内容预览 -->
              <div class="content-preview">
                <template v-if="element.content_type === 'text'">
                  {{ getTextPreview(element.content_data?.text) }}
                </template>
                <template v-else-if="element.content_type === 'image'">
                  <el-image
                    v-if="element.content_data?.image_url"
                    :src="element.content_data.image_url"
                    class="preview-image"
                    fit="cover"
                  />
                </template>
                <template v-else-if="element.content_type === 'video'">
                  <div class="video-preview">
                    <el-image
                      v-if="element.content_data?.video_cover"
                      :src="element.content_data.video_cover"
                      class="preview-image"
                      fit="cover"
                    />
                    <el-icon v-else :size="32"><VideoPlay /></el-icon>
                  </div>
                </template>
                <template v-else-if="element.content_type === 'interactive'">
                  <span class="interactive-name">
                    🎮 {{ element.content_data?.interactive_name || '互动课件' }}
                  </span>
                </template>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="content-actions">
              <el-button type="primary" link @click="handleEditContent(element)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-popconfirm
                title="确定删除此内容吗？"
                @confirm="handleDeleteContent(element)"
              >
                <template #reference>
                  <el-button type="danger" link>
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 添加内容按钮组 -->
    <div class="add-content-buttons">
      <el-button @click="handleAddContent('text')">
        <el-icon><Document /></el-icon>
        添加文本
      </el-button>
      <el-button @click="handleAddContent('image')">
        <el-icon><Picture /></el-icon>
        添加图片
      </el-button>
      <el-button @click="handleAddContent('video')">
        <el-icon><VideoCamera /></el-icon>
        添加视频
      </el-button>
      <el-button @click="handleAddContent('interactive')">
        <el-icon><MagicStick /></el-icon>
        关联互动课件
      </el-button>
    </div>

    <!-- 内容编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑内容' : '添加内容'"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <!-- 标题 -->
        <el-form-item label="内容标题" prop="content_title">
          <el-input v-model="form.content_title" placeholder="请输入内容标题" />
        </el-form-item>

        <!-- 根据类型显示不同的编辑区域 -->
        <template v-if="form.content_type === 'text'">
          <el-form-item label="文本内容" prop="content_data.text">
            <el-input
              v-model="form.content_data.text"
              type="textarea"
              :rows="8"
              placeholder="请输入文本内容"
            />
          </el-form-item>
        </template>

        <template v-else-if="form.content_type === 'image'">
          <el-form-item label="图片" prop="content_data.image_url">
            <div class="image-upload-area">
              <el-upload
                class="image-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleImageSuccess"
                :before-upload="beforeImageUpload"
                accept="image/*"
              >
                <el-image
                  v-if="form.content_data.image_url"
                  :src="form.content_data.image_url"
                  class="uploaded-image"
                  fit="contain"
                />
                <div v-else class="upload-placeholder">
                  <el-icon :size="40"><Plus /></el-icon>
                  <div>点击上传图片</div>
                </div>
              </el-upload>
              <el-input
                v-model="form.content_data.image_url"
                placeholder="或直接输入图片URL"
                style="margin-top: 10px"
              />
            </div>
          </el-form-item>
        </template>

        <template v-else-if="form.content_type === 'video'">
          <el-form-item label="视频" prop="content_data.video_url">
            <el-upload
              class="video-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleVideoSuccess"
              :before-upload="beforeVideoUpload"
              accept="video/*"
            >
              <div v-if="form.content_data.video_url" class="video-preview-area">
                <video :src="form.content_data.video_url" class="uploaded-video" controls />
              </div>
              <div v-else class="upload-placeholder">
                <el-icon :size="40"><VideoCamera /></el-icon>
                <div>点击上传视频</div>
              </div>
            </el-upload>
            <el-input
              v-model="form.content_data.video_url"
              placeholder="或直接输入视频URL"
              style="margin-top: 10px"
            />
          </el-form-item>
          <el-form-item label="视频封面">
            <el-input v-model="form.content_data.video_cover" placeholder="视频封面URL（可选）" />
          </el-form-item>
        </template>

        <template v-else-if="form.content_type === 'interactive'">
          <el-form-item label="互动课件">
            <el-select
              v-model="form.content_data.interactive_id"
              placeholder="选择互动课件"
              filterable
              style="width: 100%"
              @change="handleInteractiveChange"
            >
              <el-option
                v-for="item in interactiveCourses"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <div v-if="form.content_data.interactive_name" class="interactive-selected">
              已选择: {{ form.content_data.interactive_name }}
            </div>
          </el-form-item>
        </template>

        <!-- 通用设置 -->
        <el-form-item label="预计时长">
          <el-input-number
            v-model="form.duration_minutes"
            :min="1"
            :max="180"
            placeholder="分钟"
          />
          <span style="margin-left: 10px; color: var(--el-text-color-secondary)">分钟</span>
        </el-form-item>

        <el-form-item label="必学内容">
          <el-switch v-model="form.is_required" />
          <span style="margin-left: 10px; color: var(--el-text-color-secondary)">
            标记为必须学习的内容
          </span>
        </el-form-item>

        <el-form-item label="教学备注">
          <el-input
            v-model="form.teaching_notes"
            type="textarea"
            :rows="3"
            placeholder="给教师的教学提示和备注（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveContent">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadProps } from 'element-plus';
import draggable from 'vuedraggable';
import {
  Document,
  Picture,
  VideoCamera,
  MagicStick,
  Clock,
  Edit,
  Delete,
  Plus,
  VideoPlay,
  Rank
} from '@element-plus/icons-vue';
import type { CourseContent, ContentType, ContentData } from '@/api/endpoints/custom-course';
import {
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
  reorderCourseContents
} from '@/api/endpoints/custom-course';
import { useUserStore } from '@/stores/user';

// Props
interface Props {
  courseId: number;
  modelValue: CourseContent[];
  interactiveCourses?: Array<{ id: number; name: string; description?: string }>;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  interactiveCourses: () => [],
  readonly: false
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: CourseContent[]): void;
  (e: 'change'): void;
}>();

// 用户存储
const userStore = useUserStore();

// 内容列表
const contents = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 对话框状态
const dialogVisible = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<{
  content_type: ContentType;
  content_title: string;
  content_data: ContentData;
  duration_minutes?: number;
  is_required: boolean;
  teaching_notes?: string;
}>({
  content_type: 'text',
  content_title: '',
  content_data: {},
  duration_minutes: undefined,
  is_required: true,
  teaching_notes: ''
});

// 表单验证规则
const formRules: FormRules = {
  content_title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' }
  ]
};

// 上传配置
const uploadUrl = computed(() => '/api/upload');
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}));

// 获取内容类型标签
const getContentTypeLabel = (type: ContentType): string => {
  const labels: Record<ContentType, string> = {
    text: '文本',
    image: '图片',
    video: '视频',
    interactive: '互动课件',
    document: '文档'
  };
  return labels[type] || type;
};

// 获取文本预览
const getTextPreview = (text?: string): string => {
  if (!text) return '';
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
};

// 重置表单
const resetForm = () => {
  form.content_type = 'text';
  form.content_title = '';
  form.content_data = {};
  form.duration_minutes = undefined;
  form.is_required = true;
  form.teaching_notes = '';
  editingId.value = null;
};

// 添加内容
const handleAddContent = (type: ContentType) => {
  if (props.readonly) return;
  resetForm();
  form.content_type = type;
  dialogVisible.value = true;
};

// 编辑内容
const handleEditContent = (content: CourseContent) => {
  if (props.readonly) return;
  editingId.value = content.id;
  form.content_type = content.content_type;
  form.content_title = content.content_title;
  form.content_data = { ...content.content_data };
  form.duration_minutes = content.duration_minutes;
  form.is_required = content.is_required;
  form.teaching_notes = content.teaching_notes;
  dialogVisible.value = true;
};

// 保存内容
const handleSaveContent = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    saving.value = true;

    const contentData = {
      content_type: form.content_type,
      content_title: form.content_title,
      content_data: form.content_data,
      duration_minutes: form.duration_minutes,
      is_required: form.is_required,
      teaching_notes: form.teaching_notes
    };

    if (editingId.value) {
      // 更新
      const res = await updateCourseContent(editingId.value, contentData);
      if (res.success) {
        const index = contents.value.findIndex(c => c.id === editingId.value);
        if (index > -1) {
          contents.value[index] = { ...contents.value[index], ...res.data };
        }
        ElMessage.success('更新成功');
      }
    } else {
      // 新增
      const res = await addCourseContent(props.courseId, contentData);
      if (res.success) {
        contents.value.push(res.data);
        ElMessage.success('添加成功');
      }
    }

    dialogVisible.value = false;
    emit('change');
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

// 删除内容
const handleDeleteContent = async (content: CourseContent) => {
  try {
    const res = await deleteCourseContent(content.id);
    if (res.success) {
      const index = contents.value.findIndex(c => c.id === content.id);
      if (index > -1) {
        contents.value.splice(index, 1);
      }
      ElMessage.success('删除成功');
      emit('change');
    }
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

// 拖拽结束
const handleDragEnd = async () => {
  try {
    const contentIds = contents.value.map(c => c.id);
    await reorderCourseContents(props.courseId, contentIds);
    emit('change');
  } catch (error) {
    console.error('排序失败:', error);
    ElMessage.error('排序失败');
  }
};

// 图片上传成功
const handleImageSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.success && response.data?.url) {
    form.content_data.image_url = response.data.url;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 图片上传前验证
const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!');
    return false;
  }
  return true;
};

// 视频上传成功
const handleVideoSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.success && response.data?.url) {
    form.content_data.video_url = response.data.url;
    ElMessage.success('视频上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 视频上传前验证
const beforeVideoUpload: UploadProps['beforeUpload'] = (file) => {
  const isVideo = file.type.startsWith('video/');
  const isLt500M = file.size / 1024 / 1024 < 500;

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!');
    return false;
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过500MB!');
    return false;
  }
  return true;
};

// 互动课件选择变化
const handleInteractiveChange = (id: number) => {
  const course = props.interactiveCourses.find(c => c.id === id);
  if (course) {
    form.content_data.interactive_id = id;
    form.content_data.interactive_name = course.name;
    if (!form.content_title) {
      form.content_title = course.name;
    }
  }
};
</script>

<style lang="scss" scoped>
.course-content-editor {
  width: 100%;
}

.content-list {
  min-height: 200px;
  margin-bottom: 20px;
}

.content-draggable {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary-light-3);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &.is-editing {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.drag-handle {
  cursor: move;
  padding: 4px;
  color: var(--el-text-color-placeholder);

  &:hover {
    color: var(--el-text-color-regular);
  }
}

.content-type-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
  flex-shrink: 0;

  &.text {
    background: #e3f2fd;
    color: #1976d2;
  }

  &.image {
    background: #e8f5e9;
    color: #388e3c;
  }

  &.video {
    background: #fff3e0;
    color: #f57c00;
  }

  &.interactive {
    background: #f3e5f5;
    color: #7b1fa2;
  }
}

.content-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.content-title {
  font-weight: 500;
  font-size: 15px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;

  .order-num {
    color: var(--el-text-color-secondary);
    margin-right: 4px;
  }

  .el-tag {
    margin-left: 8px;
  }
}

.content-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;

  .duration {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.content-preview {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
}

.preview-image {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

.video-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 80px;
  background: var(--el-fill-color);
  border-radius: 4px;
  color: var(--el-text-color-placeholder);
}

.interactive-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
  color: var(--el-color-primary);
}

.content-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.add-content-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color);
}

.image-upload-area,
.video-uploader {
  width: 100%;
}

.image-uploader :deep(.el-upload) {
  width: 100%;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
  }
}

.upload-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  gap: 8px;
}

.uploaded-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.uploaded-video {
  width: 100%;
  max-height: 300px;
}

.video-preview-area {
  width: 100%;
}

.interactive-selected {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--el-color-success-light-9);
  border-radius: 4px;
  color: var(--el-color-success);
  font-size: 13px;
}
</style>


