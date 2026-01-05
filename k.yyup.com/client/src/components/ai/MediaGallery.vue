<template>
  <div class="media-gallery">
    <!-- 标题区域 -->
    <div class="gallery-header">
      <h3 class="gallery-title">{{ title || '媒体相册' }}</h3>
      <div class="gallery-controls">
        <!-- 媒体类型筛选 -->
        <el-select
          v-model="selectedMediaType"
          placeholder="筛选类型"
          size="small"
          clearable
          @change="filterMedia"
        >
          <el-option
            v-for="type in mediaTypeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>

        <!-- 视图切换 -->
        <el-button-group size="small">
          <el-button
            :type="viewMode === 'grid' ? 'primary' : ''"
            @click="viewMode = 'grid'"
          >
            <UnifiedIcon name="grid" :size="16" />
          </el-button>
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="viewMode = 'list'"
          >
            <UnifiedIcon name="list" :size="16" />
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 媒体统计 -->
    <div v-if="statistics" class="media-statistics">
      <div class="stat-item">
        <span class="stat-label">总计:</span>
        <span class="stat-value">{{ statistics.total || filteredMedia.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">照片:</span>
        <span class="stat-value">{{ statistics.photos || photoCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">视频:</span>
        <span class="stat-value">{{ statistics.videos || videoCount }}</span>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid' && filteredMedia.length > 0" class="media-grid">
      <div
        v-for="media in paginatedMedia"
        :key="media.id"
        class="media-item"
        @click="openPreview(media)"
      >
        <div class="media-thumbnail">
          <!-- 图片预览 -->
          <img
            v-if="isPhoto(media)"
            :src="getThumbnailUrl(media)"
            :alt="media.title"
            @error="handleImageError"
          />

          <!-- 视频预览 -->
          <div v-else-if="isVideo(media)" class="video-thumbnail">
            <video
              :src="getVideoUrl(media)"
              :poster="getThumbnailUrl(media)"
              preload="metadata"
            />
            <div class="video-overlay">
              <UnifiedIcon name="play" :size="16" />
              <span class="duration">{{ formatDuration(media.duration) }}</span>
            </div>
          </div>
        </div>

        <div class="media-info">
          <h4 class="media-title">{{ media.title || media.name || '未命名' }}</h4>
          <p class="media-meta">
            <span class="media-type">{{ getMediaTypeLabel(media.media_type) }}</span>
            <span class="media-date">{{ formatDate(media.created_at) }}</span>
          </p>
          <p v-if="media.description" class="media-description">{{ media.description }}</p>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="viewMode === 'list' && filteredMedia.length > 0" class="media-list">
      <div class="table-wrapper">
        <el-table class="responsive-table" :data="paginatedMedia" stripe>
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <div class="media-cell-title">
                <i :class="getMediaTypeIcon(row.media_type)"></i>
                {{ row.title || row.name || '未命名' }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="media_type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getMediaTypeTagType(row.media_type)" size="small">
                {{ getMediaTypeLabel(row.media_type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="file_size" label="大小" width="100">
            <template #default="{ row }">
              {{ formatFileSize(row.file_size) }}
            </template>
          </el-table-column>

          <el-table-column v-if="hasVideos" prop="duration" label="时长" width="100">
            <template #default="{ row }">
              {{ isVideo(row) ? formatDuration(row.duration) : '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="text" size="small" @click="openPreview(row)">
                预览
              </el-button>
              <el-button
                v-if="row.file_path"
                type="text"
                size="small"
                @click="downloadMedia(row)"
              >
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredMedia.length === 0" class="empty-state">
      <UnifiedIcon name="image" :size="16" />
      <p>{{ selectedMediaType ? '没有找到符合条件的媒体' : '暂无媒体内容' }}</p>
    </div>

    <!-- 分页 -->
    <div v-if="filteredMedia.length > pageSize" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="filteredMedia.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      :title="previewMedia?.title || '媒体预览'"
      width="80%"
      :append-to-body="true"
      destroy-on-close
    >
      <div v-if="previewMedia" class="media-preview">
        <!-- 图片预览 -->
        <img
          v-if="isPhoto(previewMedia)"
          :src="getFullImageUrl(previewMedia)"
          :alt="previewMedia.title"
          class="preview-image"
        />

        <!-- 视频预览 -->
        <video
          v-else-if="isVideo(previewMedia)"
          :src="getFullVideoUrl(previewMedia)"
          controls
          class="preview-video"
        >
          您的浏览器不支持视频播放
        </video>

        <!-- 媒体信息 -->
        <div class="preview-info">
          <h3>{{ previewMedia.title || previewMedia.name || '未命名' }}</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">类型:</span>
              <span>{{ getMediaTypeLabel(previewMedia.media_type) }}</span>
            </div>
            <div class="info-item">
              <span class="label">大小:</span>
              <span>{{ formatFileSize(previewMedia.file_size) }}</span>
            </div>
            <div v-if="isVideo(previewMedia)" class="info-item">
              <span class="label">时长:</span>
              <span>{{ formatDuration(previewMedia.duration) }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span>{{ formatDate(previewMedia.created_at) }}</span>
            </div>
          </div>
          <p v-if="previewMedia.description" class="description">
            {{ previewMedia.description }}
          </p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'MediaGallery',

  props: {
    data: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: '媒体相册'
    },
    statistics: {
      type: Object,
      default: null
    },
    pageSize: {
      type: Number,
      default: 12
    }
  },

  setup(props) {
    // 响应式数据
    const viewMode = ref('grid'); // 'grid' | 'list'
    const selectedMediaType = ref('');
    const currentPage = ref(1);
    const pageSize = ref(props.pageSize);
    const previewVisible = ref(false);
    const previewMedia = ref(null);

    // 媒体类型选项
    const mediaTypeOptions = [
      { label: '班级照片', value: 'class_photo' },
      { label: '班级视频', value: 'class_video' },
      { label: '学生照片', value: 'student_photo' },
      { label: '学生视频', value: 'student_video' }
    ];

    // 计算属性
    const filteredMedia = computed(() => {
      if (!selectedMediaType.value) {
        return props.data || [];
      }
      return (props.data || []).filter(media =>
        media.media_type === selectedMediaType.value
      );
    });

    const paginatedMedia = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredMedia.value.slice(start, end);
    });

    const photoCount = computed(() =>
      filteredMedia.value.filter(media => isPhoto(media)).length
    );

    const videoCount = computed(() =>
      filteredMedia.value.filter(media => isVideo(media)).length
    );

    const hasVideos = computed(() =>
      filteredMedia.value.some(media => isVideo(media))
    );

    // 工具函数
    const isPhoto = (media) => {
      return media?.media_type?.includes('photo');
    };

    const isVideo = (media) => {
      return media?.media_type?.includes('video');
    };

    const getMediaTypeLabel = (type) => {
      const labels = {
        'class_photo': '班级照片',
        'class_video': '班级视频',
        'student_photo': '学生照片',
        'student_video': '学生视频'
      };
      return labels[type] || type;
    };

    const getMediaTypeIcon = (type) => {
      const icons = {
        'class_photo': 'image',
        'class_video': 'video',
        'student_photo': 'image',
        'student_video': 'play'
      };
      return icons[type] || 'file-text';
    };

    const getMediaTypeTagType = (type) => {
      return type?.includes('photo') ? 'success' : 'primary';
    };

    const getThumbnailUrl = (media) => {
      if (media?.thumbnail_path) {
        return media.thumbnail_path;
      }
      if (media?.file_path && isPhoto(media)) {
        return media.file_path;
      }
      return '/placeholder-image.jpg'; // 占位图
    };

    const getFullImageUrl = (media) => {
      return media?.file_path ? media.file_path : getThumbnailUrl(media);
    };

    const getVideoUrl = (media) => {
      return media?.file_path ? media.file_path : '';
    };

    const getFullVideoUrl = (media) => {
      return media?.file_path ? media.file_path : '';
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString('zh-CN');
    };

    const formatFileSize = (bytes) => {
      if (!bytes) return '-';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const formatDuration = (seconds) => {
      if (!seconds) return '-';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 事件处理
    const filterMedia = () => {
      currentPage.value = 1; // 重置到第一页
    };

    const handleSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1;
    };

    const handleCurrentChange = (page) => {
      currentPage.value = page;
    };

    const openPreview = (media) => {
      previewMedia.value = media;
      previewVisible.value = true;
    };

    const downloadMedia = (media) => {
      if (media.file_path) {
        const link = document.createElement('a');
        link.href = media.file_path;
        link.download = media.title || media.name || 'media';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const handleImageError = (event) => {
      event.target.src = '/placeholder-image.jpg';
    };

    return {
      viewMode,
      selectedMediaType,
      currentPage,
      pageSize,
      previewVisible,
      previewMedia,
      mediaTypeOptions,
      filteredMedia,
      paginatedMedia,
      photoCount,
      videoCount,
      hasVideos,
      isPhoto,
      isVideo,
      getMediaTypeLabel,
      getMediaTypeIcon,
      getMediaTypeTagType,
      getThumbnailUrl,
      getFullImageUrl,
      getVideoUrl,
      getFullVideoUrl,
      formatDate,
      formatFileSize,
      formatDuration,
      filterMedia,
      handleSizeChange,
      handleCurrentChange,
      openPreview,
      downloadMedia,
      handleImageError
    };
  }
};
</script>

<style scoped lang="scss">
.media-gallery {
  font-size: inherit; /* 继承父组件的字体大小 */
  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    .gallery-title {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    .gallery-controls {
      display: flex;
      gap: var(--text-sm);
      align-items: center;
    }
  }

  .media-statistics {
    display: flex;
    gap: var(--text-3xl);
    margin-bottom: var(--text-lg);
    padding: var(--text-sm);
    background-color: var(--bg-secondary);
    border-radius: var(--spacing-sm);

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .stat-label {
        color: var(--text-regular);
        font-size: var(--text-base);
      }

      .stat-value {
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--text-lg);

    .media-item {
      background: var(--bg-primary);
      border-radius: var(--text-sm);
      overflow: hidden;
      border: var(--border-width) solid var(--border-color-light);
      cursor: pointer;
      transition: all var(--transition-normal) ease;

      &:hover {
        transform: translateY(-var(--spacing-xs));
        box-shadow: 0 var(--spacing-sm) 25px var(--shadow-medium);
      }

      .media-thumbnail {
        position: relative;
        min-height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .video-thumbnail {
          position: relative;
          height: 100%;

          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .video-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--black-alpha-30);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-on-primary);

            i {
              font-size: var(--text-5xl);
              margin-bottom: var(--spacing-sm);
            }

            .duration {
              position: absolute;
              bottom: var(--spacing-sm);
              right: var(--spacing-sm);
              background: var(--black-alpha-70);
              padding: var(--spacing-xs) var(--spacing-sm);
              border-radius: var(--spacing-xs);
              font-size: var(--text-sm);
            }
          }
        }
      }

      .media-info {
        padding: var(--text-lg);

        .media-title {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .media-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-sm);
          color: var(--text-regular);

          .media-type {
            background: var(--primary-color);
            color: var(--text-on-primary);
            padding: var(--spacing-sm) 6px;
            border-radius: var(--spacing-xs);
          }
        }

        .media-description {
          margin: 0;
          font-size: var(--text-base);
          color: var(--text-regular);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .media-list {
    .media-cell-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      i {
        color: var(--primary-color);
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-12xl) var(--text-3xl);
    color: var(--text-regular);

    i {
      font-size: var(--text-6xl);
      margin-bottom: var(--text-lg);
      color: var(--text-placeholder);
    }

    p {
      margin: 0;
      font-size: var(--text-lg);
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: var(--text-3xl);
  }

  .media-preview {
    .preview-image {
      width: 100%;
      max-height: 500px;
      object-fit: contain;
      border-radius: var(--spacing-sm);
      margin-bottom: var(--text-lg);
    }

    .preview-video {
      width: 100%;
      max-height: 500px;
      border-radius: var(--spacing-sm);
      margin-bottom: var(--text-lg);
    }

    .preview-info {
      h3 {
        margin: 0 0 var(--text-lg) 0;
        color: var(--text-primary);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--text-sm);
        margin-bottom: var(--text-lg);

        .info-item {
          display: flex;

          .label {
            font-weight: 600;
            margin-right: var(--spacing-sm);
            color: var(--text-regular);
          }
        }
      }

      .description {
        margin: 0;
        color: var(--text-regular);
        line-height: 1.6;
      }
    }
  }
}

/* 深色模式适配 */
:root[data-theme="dark"] .media-gallery {
  font-size: inherit; /* 继承父组件的字体大小 */
  .media-item {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  .media-statistics {
    background: var(--bg-tertiary);
  }
}

.full-width {
  width: 100%;
}
</style>