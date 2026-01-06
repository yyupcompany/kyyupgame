<template>
  <div class="wechat-moments-preview">
    <div class="moments-header">
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="status-icons">
          <span class="signal">●●●●</span>
          <span class="wifi">📶</span>
          <span class="battery">🔋</span>
        </div>
      </div>
      <div class="nav-bar">
        <div class="nav-left">
          <span class="back-btn">‹</span>
        </div>
        <div class="nav-title">朋友圈</div>
        <div class="nav-right">
          <span class="camera-btn">📷</span>
        </div>
      </div>
    </div>

    <div class="moments-content">
      <div class="cover-section">
        <div class="cover-image">
          <img :src="coverImage" alt="封面" />
        </div>
        <div class="user-info">
          <div class="avatar">
            <img :src="userAvatar" alt="头像" />
          </div>
          <div class="username">{{ userName }}</div>
        </div>
      </div>

      <div class="post-item">
        <div class="post-header">
          <div class="post-avatar">
            <img :src="userAvatar" alt="头像" />
          </div>
          <div class="post-info">
            <div class="post-username">{{ userName }}</div>
            <div class="post-content">
              <div class="text-content">{{ content }}</div>
              <div class="post-images" v-if="images && images.length > 0">
                <div 
                  v-for="(image, index) in images" 
                  :key="index"
                  class="image-item"
                  :class="`grid-${Math.min(images.length, 9)}`"
                >
                  <img :src="image" :alt="`图片${index + 1}`" />
                </div>
              </div>
            </div>
            <div class="post-meta">
              <span class="post-time">{{ formatTime(postTime) }}</span>
              <div class="post-actions">
                <span class="action-btn">👍</span>
                <span class="action-btn">💬</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string
  userName?: string
  userAvatar?: string
  images?: string[]
  postTime?: Date
}

const props = withDefaults(defineProps<Props>(), {
  userName: '阳光幼儿园',
  // 使用 1x1 透明 PNG 的 base64 编码作为占位符，避免404错误
  userAvatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  images: () => [],
  postTime: () => new Date()
})

// 使用 base64 编码的渐变色图片作为封面占位符，避免404错误
// 这是一个简单的蓝绿渐变背景
const coverImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzc1IiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0ZWM5YjA7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2NmE2ZmY7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzc1IiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg=='

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
  return time.toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.wechat-moments-preview {
  width: 375px;
  height: 667px;
  background: #f7f7f7;
  border-radius: var(--text-2xl);
  overflow: hidden;
  box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-heavy);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  position: relative;

  .moments-header {
    background: #1a1a1a;
    color: white;

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) var(--text-2xl) var(--spacing-xs);
      font-size: var(--text-base);
      font-weight: 600;

      .time {
        font-size: var(--text-base);
      }

      .status-icons {
        display: flex;
        gap: var(--spacing-xs);
        font-size: var(--text-sm);
      }
    }

    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--text-sm) var(--text-2xl);
      background: #2c2c2c;

      .nav-left, .nav-right {
        width: 60px;
      }

      .back-btn {
        font-size: var(--text-3xl);
        cursor: pointer;
      }

      .nav-title {
        font-size: var(--text-md);
        font-weight: 600;
        text-align: center;
      }

      .camera-btn {
        font-size: var(--text-xl);
        float: right;
        cursor: pointer;
      }
    }
  }

  .moments-content {
    height: calc(100% - 8var(--spacing-sm));
    overflow-y: auto;

    .cover-section {
      position: relative;
      height: 200px;

      .cover-image {
        width: 100%;
        height: 100%;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .user-info {
        position: absolute;
        bottom: var(--text-2xl);
        right: var(--text-2xl);
        display: flex;
        align-items: center;
        gap: var(--text-sm);

        .avatar {
          width: 60px;
          height: 60px;
          border-radius: var(--spacing-sm);
          overflow: hidden;
          border: 2px solid white;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .username {
          color: white;
          font-size: var(--text-lg);
          font-weight: 600;
          text-shadow: 0 var(--border-width-base) 3px var(--black-alpha-50);
        }
      }
    }

    .post-item {
      background: white;
      margin-top: var(--spacing-2xl);
      padding: var(--text-lg);

      .post-header {
        display: flex;
        gap: var(--text-sm);

        .post-avatar {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--spacing-xs);
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .post-info {
          flex: 1;

          .post-username {
            font-size: var(--text-lg);
            font-weight: 600;
            color: #576b95;
            margin-bottom: var(--spacing-xs);
          }

          .text-content {
            font-size: var(--text-lg);
            line-height: 1.4;
            color: var(--text-primary);
            white-space: pre-line;
            margin-bottom: var(--spacing-sm);
          }

          .post-images {
            display: grid;
            gap: var(--spacing-xs);
            margin-bottom: var(--text-sm);

            &.grid-1 {
              grid-template-columns: 1fr;
              max-width: 200px;
            }

            &.grid-2, &.grid-4 {
              grid-template-columns: 1fr 1fr;
            }

            &.grid-3, &.grid-5, &.grid-6, &.grid-7, &.grid-8, &.grid-9 {
              grid-template-columns: 1fr 1fr 1fr;
            }

            .image-item {
              aspect-ratio: 1;
              border-radius: var(--spacing-xs);
              overflow: hidden;

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
          }

          .post-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: var(--text-base);
            color: var(--text-tertiary);

            .post-time {
              font-size: var(--text-sm);
            }

            .post-actions {
              display: flex;
              gap: var(--text-lg);

              .action-btn {
                font-size: var(--text-lg);
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;

                &:hover {
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
