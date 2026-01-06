<template>
  <div class="message-list" ref="messageListContainer">
    <div v-if="messages.length === 0" class="empty-state">
      <el-empty description="还没有消息，开始对话吧！" />
    </div>
    
    <template v-else>
      <div 
        v-for="message in messages" 
        :key="message.id" 
        :class="['message-item', `message-${message.role}`]"
      >
        <!-- 侧边栏模式：移除头像图标，节省空间 -->
        
        <div class="message-content">
          <!-- 消息主体（侧边栏模式：移除消息头部，节省空间） -->
          <div class="message-body">
            <!-- 文本内容 -->
            <div v-if="message.content" class="message-text" v-html="renderMarkdown(message.content)"></div>
            
            <!-- 附件（图片等） -->
            <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
              <div 
                v-for="(attachment, index) in message.attachments" 
                :key="index"
                class="attachment-item"
              >
                <img 
                  v-if="attachment.type === 'image'" 
                  :src="attachment.url" 
                  :alt="attachment.name"
                  class="attachment-image"
                  @click="previewImage(attachment.url)"
                />
                <div 
                  v-else
                  class="attachment-file"
                >
                  <UnifiedIcon name="default" />
                  <span>{{ attachment.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- 动态组件渲染 -->
            <div v-if="getMessageComponents(message).length > 0" class="message-components">
              <component-renderer
                v-for="(component, index) in getMessageComponents(message)"
                :key="`comp-${message.id}-${index}`"
                :json-data="component"
                @action="handleComponentAction"
              />
            </div>
            
            <!-- 加载状态 -->
            <div v-if="message.status === 'sending'" class="message-loading">
              <UnifiedIcon name="default" />
              <span>正在发送...</span>
            </div>
            
            <!-- 错误状态 -->
            <div v-if="message.status === 'error'" class="message-error">
              <UnifiedIcon name="default" />
              <span>发送失败</span>
              <el-button 
                type="text" 
                size="small"
                @click="$emit('retry', message.id)"
              >
                重试
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载指示器 -->
      <div v-if="loading" class="loading-indicator">
        <UnifiedIcon name="default" />
        <span>AI正在思考...</span>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated, PropType, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, ChatDotRound, Document, Loading, WarningFilled } from '@element-plus/icons-vue';
import ComponentRenderer from './ComponentRenderer.vue';
import { format } from 'date-fns';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 定义消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'received' | 'error';
  components?: any[];
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export default defineComponent({
  name: 'MessageList',
  
  components: {
    ComponentRenderer
  },
  
  props: {
    messages: {
      type: Array as PropType<Message[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['retry'],
  
  setup(props) {
    const messageListContainer = ref<HTMLElement | null>(null);
    
    // 格式化时间
    const formatTime = (timestamp: string) => {
      try {
        const date = new Date(timestamp);
        return format(date, 'yyyy-MM-dd HH:mm');
      } catch (e) {
        return timestamp;
      }
    };
    
    // 解析AI回复中的组件标记
    const parseMessageComponents = (content: string) => {
      const componentRegex = /\[COMPONENTS\](.*?)\[\/COMPONENTS\]/s;
      const match = content.match(componentRegex);

      if (match) {
        try {
          const componentsData = JSON.parse(match[1]);
          const cleanContent = content.replace(componentRegex, '').trim();
          return {
            content: cleanContent,
            components: Array.isArray(componentsData) ? componentsData : [componentsData]
          };
        } catch (e) {
          console.error('解析组件数据失败:', e);
          return { content, components: [] };
        }
      }

      return { content, components: [] };
    };

    // 渲染markdown
    const renderMarkdown = (content: string) => {
      try {
        // 先解析组件标记，只渲染纯文本部分
        const { content: cleanContent } = parseMessageComponents(content);

        // 配置marked选项
        marked.setOptions({
          breaks: true, // 支持换行
          gfm: true, // 支持GitHub风格的Markdown
        });

        // 将markdown转换为HTML
        const html = marked(cleanContent) as string;

        // 进行安全过滤，保留必要的HTML标签和属性
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote',
            'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
        });
      } catch (e) {
        console.error('Markdown渲染失败:', e);
        // 如果渲染失败，至少保留换行
        return content.replace(/\n/g, '<br>');
      }
    };
    
    // 预览图片
    const previewImage = (url: string) => {
      ElMessageBox.alert('<div class="image-preview"><img src="' + url + '" /></div>', '图片预览', {
        dangerouslyUseHTMLString: true,
        showClose: true,
        showCancelButton: false,
        confirmButtonText: '关闭',
        callback: () => {}
      });
    };

    // 获取消息的组件数据
    const getMessageComponents = (message: Message) => {
      // 优先使用消息对象中的components字段
      if (message.components && message.components.length > 0) {
        return message.components;
      }

      // 如果没有，则从content中解析
      if (message.content && message.role === 'assistant') {
        const { components } = parseMessageComponents(message.content);
        return components;
      }

      return [];
    };

    // 处理组件动作
    const handleComponentAction = (action: any) => {
      console.log('组件动作:', action);
      // TODO: 根据动作类型处理不同逻辑
      if (action.type === 'copy') {
        navigator.clipboard.writeText(action.text).then(() => {
          ElMessage.success('复制成功');
        }).catch(() => {
          ElMessage.error('复制失败');
        });
      }
    };
    
    // 滚动到底部
    const scrollToBottom = () => {
      if (messageListContainer.value) {
        messageListContainer.value.scrollTop = messageListContainer.value.scrollHeight;
      }
    };
    
    // 监听消息变化，自动滚动
    watch(() => props.messages.length, () => {
      setTimeout(scrollToBottom, 100);
    });
    
    // 组件挂载后滚动到底部
    onMounted(scrollToBottom);
    
    // 组件更新后滚动到底部
    onUpdated(scrollToBottom);
    
    // 暴露方法给父组件
    return {
      messageListContainer,
      formatTime,
      renderMarkdown,
      previewImage,
      getMessageComponents,
      handleComponentAction,
      scrollToBottom,
      // 图标
      User,
      Assistant: ChatDotRound,
      Document,
      Loading,
      WarningFilled
    };
  }
});
</script>

<style lang="scss" scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--text-base);
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
  
  .empty-state {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .message-item {
    display: flex;
    margin-bottom: var(--spacing-sm); // 侧边栏模式：减小消息间距
    
    &.message-user {
      flex-direction: row-reverse;
      
      .message-content {
        align-items: flex-end;
        
        .message-body {
          background-color: var(--el-color-primary-light-8);
          border-radius: var(--text-xs) 2px var(--text-sm) var(--text-sm);
        }
      }
    }
    
    &.message-assistant {
      .message-body {
        background-color: var(--el-bg-color-page);
        border-radius: var(--radius-xs) var(--text-sm) var(--text-sm) var(--text-sm);
      }
    }
    
    &.message-system {
      justify-content: center;
      
      .message-content {
        width: auto;
        
        .message-body {
          background-color: var(--el-color-info-light-8);
          border-radius: var(--text-xs);
          padding: var(--spacing-sm) var(--text-lg);
        }
      }
    }
  }
  
  // 侧边栏模式：移除头像样式，节省空间
  
  .message-content {
    display: flex;
    flex-direction: column;
    max-width: 100%; // 侧边栏模式：扩展到全宽
    
    .message-body {
      padding: var(--text-xs) var(--text-lg);
      border-radius: var(--spacing-xs);
      
      .message-text {
        word-break: break-word;
        
        :deep(p) {
          margin: 0.5em 0;
        }
        
        :deep(pre) {
          background-color: var(--el-bg-color-page);
          padding: var(--text-xs);
          border-radius: var(--spacing-xs);
          overflow-x: auto;
          margin: var(--spacing-sm) 0;
        
        :deep(code) {
          font-family: monospace;
          background-color: var(--el-bg-color-page);
          padding: var(--spacing-sm) var(--spacing-xs);
          border-radius: var(--radius-xs);
        }
        
        :deep(a) {
          color: var(--el-color-primary);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }

        // 标题样式
        :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
          margin: 1em 0 0.5em 0;
          font-weight: 600;
          line-height: 1.4;
        }

        :deep(h1) { font-size: 1.5em; }
        :deep(h2) { font-size: 1.3em; }
        :deep(h3) { font-size: 1.2em; }

        // 列表样式
        :deep(ul), :deep(ol) {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }

        :deep(li) {
          margin: 0.2em 0;
        }

        // 引用样式
        :deep(blockquote) {
          border-left: var(--spacing-xs) solid rgba(99, 102, 241, 0.6);
          margin: 0.5em 0;
          padding: 0.5em 1em;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
          border-radius: 0 var(--spacing-xs) var(--spacing-xs) 0;
        }

        // 表格样式
        :deep(table) {
          border-collapse: collapse;
          width: 100%;
          margin: 0.5em 0;
          border: var(--border-width) solid var(--el-border-color);
        }

        :deep(th), :deep(td) {
          border: var(--border-width) solid var(--el-border-color);
          padding: var(--spacing-sm) var(--text-sm);
          text-align: left;
        }

        :deep(th) {
          background-color: var(--el-color-info-light-9);
          font-weight: 600;
        }

        // 强调样式
        :deep(strong) {
          font-weight: 600;
        }

        :deep(em) {
          font-style: italic;
        }
      }
      
      .message-attachments {
        margin-top: var(--spacing-sm);
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        
        .attachment-item {
          .attachment-image {
            max-max-width: 200px; width: 100%;
            max-min-height: 60px; height: auto;
            border-radius: var(--spacing-xs);
            cursor: pointer;
            
            &:hover {
              opacity: 0.9;
            }
          }
          
          .attachment-file {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            background-color: var(--el-bg-color-page);
            padding: var(--spacing-sm) var(--text-sm);
            border-radius: var(--spacing-xs);
        }
      }
      
      .message-components {
        margin-top: var(--text-lg);
        display: flex;
        flex-direction: column;
        gap: var(--text-xs);
      }
      
      .message-loading, .message-error {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-sm);
        font-size: var(--text-xs);
        color: var(--el-text-color-secondary);
      
      .message-error {
        color: var(--el-color-danger);
      }
    }
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--text-xs);
    color: var(--el-text-color-secondary);
    margin: 0 auto;
}

:deep(.image-preview) {
  width: 100%;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 80vh;
  }
}
}
}
}
}
</style> 