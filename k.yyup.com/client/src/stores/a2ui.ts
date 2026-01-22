/**
 * A2UI 状态管理 Store
 * 支持增量更新（搭积木模式）
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';

/**
 * SSE组件消息类型（与后端保持一致）
 */
export interface SSEComponentMessage {
  type: 'component' | 'progress' | 'thinking' | 'complete' | 'error' | 'image_ready';
  action?: 'append' | 'update' | 'replace';
  targetId?: string;
  component?: A2UIComponentNode;
  content?: string;
  message?: string;
  imageUrl?: string;
  imageId?: string;
  timestamp?: string;
}

export interface A2UISession {
  id: string;
  status: 'idle' | 'initializing' | 'ready' | 'running' | 'paused' | 'completed' | 'error';
  rootNode: A2UIComponentNode | null;
  dataModel: Record<string, any>;
  currentScene: string;
  score: number;
  timeRemaining: number;
  userProgress: Record<string, any>;
  error: { code: string; message: string } | null;
  createdAt: number;
  updatedAt: number;
}

export const useA2UIStore = defineStore('a2ui', () => {
  // 状态 - 使用普通对象替代 Map，兼容性更好
  const sessions = ref<Record<string, A2UISession>>({});
  const currentSessionId = ref<string | null>(null);
  const eventLog = ref<Array<{ timestamp: number; event: A2UIEvent }>>([]);

  // Getters
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null;
    return sessions.value[currentSessionId.value] || null;
  });

  const isRunning = computed(() => {
    const session = currentSession.value;
    return session && ['ready', 'running'].includes(session.status);
  });

  const totalScore = computed(() => {
    const session = currentSession.value;
    return session?.score || 0;
  });

  const sessionList = computed(() => {
    return Object.values(sessions.value);
  });

  // Actions
  function createSession(sessionId: string): A2UISession {
    const session: A2UISession = {
      id: sessionId,
      status: 'idle',
      rootNode: null,
      dataModel: {},
      currentScene: '',
      score: 0,
      timeRemaining: 0,
      userProgress: {},
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    sessions.value[sessionId] = session;
    currentSessionId.value = sessionId;
    return session;
  }

  function getSession(sessionId: string): A2UISession | null {
    return sessions.value[sessionId] || null;
  }

  function setSessionId(sessionId: string) {
    currentSessionId.value = sessionId;
  }

  function updateRootNode(sessionId: string, rootNode: A2UIComponentNode) {
    const session = sessions.value[sessionId];
    if (session) {
      session.rootNode = rootNode;
      session.status = 'ready';
      session.updatedAt = Date.now();
    }
  }

  function updateDataModel(sessionId: string, update: { path: string; value: any; operation: 'set' | 'delete' | 'push' | 'splice' }) {
    const session = sessions.value[sessionId];
    if (session) {
      const keys = update.path.split('.');
      let current: any = session.dataModel;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      switch (update.operation) {
        case 'set':
          current[lastKey] = update.value;
          break;
        case 'delete':
          delete current[lastKey];
          break;
        case 'push':
          if (Array.isArray(current[lastKey])) {
            current[lastKey].push(update.value);
          }
          break;
        case 'splice':
          if (Array.isArray(current[lastKey]) && Array.isArray(update.value)) {
            const [index, count, ...items] = update.value;
            current[lastKey].splice(index, count, ...items);
          }
          break;
      }

      session.updatedAt = Date.now();
    }
  }

  function updateScore(sessionId: string, score: number) {
    const session = sessions.value[sessionId];
    if (session) {
      session.score = score;
      session.updatedAt = Date.now();
    }
  }

  function addScore(sessionId: string, points: number) {
    const session = sessions.value[sessionId];
    if (session) {
      session.score += points;
      session.updatedAt = Date.now();
    }
  }

  function updateTimeRemaining(sessionId: string, time: number) {
    const session = sessions.value[sessionId];
    if (session) {
      session.timeRemaining = time;
      session.updatedAt = Date.now();
    }
  }

  function setSessionStatus(sessionId: string, status: A2UISession['status']) {
    const session = sessions.value[sessionId];
    if (session) {
      session.status = status;
      session.updatedAt = Date.now();
    }
  }

  function setSessionError(sessionId: string, error: { code: string; message: string }) {
    const session = sessions.value[sessionId];
    if (session) {
      session.error = error;
      session.status = 'error';
      session.updatedAt = Date.now();
    }
  }

  function updateUserProgress(sessionId: string, progress: Record<string, any>) {
    const session = sessions.value[sessionId];
    if (session) {
      session.userProgress = {
        ...session.userProgress,
        ...progress
      };
      session.updatedAt = Date.now();
    }
  }

  function logEvent(event: A2UIEvent) {
    eventLog.value.push({
      timestamp: Date.now(),
      event
    });

    // 保留最近1000条日志
    if (eventLog.value.length > 1000) {
      eventLog.value = eventLog.value.slice(-1000);
    }
  }

  function clearEventLog() {
    eventLog.value = [];
  }

  function clearSession(sessionId: string) {
    delete sessions.value[sessionId];
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null;
    }
  }

  function clearAllSessions() {
    sessions.value = {};
    currentSessionId.value = null;
    eventLog.value = [];
  }

  /**
   * 🧱 增量更新方法：在组件树中查找特定组件
   */
  function findComponentById(root: A2UIComponentNode | null, targetId: string): A2UIComponentNode | null {
    if (!root) return null;
    if (root.id === targetId) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findComponentById(child, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 🧱 增量更新方法：追加子组件到指定父组件
   */
  function appendComponent(sessionId: string, parentId: string, component: A2UIComponentNode) {
    const session = sessions.value[sessionId];
    if (!session || !session.rootNode) {
      console.warn(`[A2UI Store] 会话不存在或根节点为空: ${sessionId}`);
      return false;
    }

    const parent = findComponentById(session.rootNode, parentId);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(component);
      session.updatedAt = Date.now();
      console.log(`✅ [A2UI Store] 追加组件 ${component.id} 到 ${parentId}`);
      return true;
    } else {
      console.warn(`[A2UI Store] 找不到父组件: ${parentId}`);
      return false;
    }
  }

  /**
   * 🧱 增量更新方法：更新特定组件
   */
  function updateComponent(sessionId: string, targetId: string, newComponent: A2UIComponentNode) {
    const session = sessions.value[sessionId];
    if (!session || !session.rootNode) {
      console.warn(`[A2UI Store] 会话不存在或根节点为空: ${sessionId}`);
      return false;
    }

    // 如果目标是根节点
    if (session.rootNode.id === targetId) {
      session.rootNode = newComponent;
      session.updatedAt = Date.now();
      console.log(`✅ [A2UI Store] 更新根组件: ${targetId}`);
      return true;
    }

    // 递归查找并更新
    const updated = updateComponentRecursive(session.rootNode, targetId, newComponent);
    if (updated) {
      session.updatedAt = Date.now();
      console.log(`✅ [A2UI Store] 更新组件: ${targetId}`);
    } else {
      console.warn(`[A2UI Store] 找不到组件: ${targetId}`);
    }
    return updated;
  }

  /**
   * 辅助函数：递归更新组件
   */
  function updateComponentRecursive(parent: A2UIComponentNode, targetId: string, newComponent: A2UIComponentNode): boolean {
    if (!parent.children) return false;
    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i].id === targetId) {
        parent.children[i] = newComponent;
        return true;
      }
      if (updateComponentRecursive(parent.children[i], targetId, newComponent)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 🧱 增量更新方法：替换根节点
   */
  function replaceRootNode(sessionId: string, rootNode: A2UIComponentNode) {
    const session = sessions.value[sessionId];
    if (!session) {
      // 如果会话不存在，创建新会话
      createSession(sessionId);
    }
    const targetSession = sessions.value[sessionId]!;
    targetSession.rootNode = rootNode;
    targetSession.status = 'ready';
    targetSession.updatedAt = Date.now();
    console.log(`✅ [A2UI Store] 替换根节点: ${rootNode.id}`);
  }

  /**
   * 🧱 处理SSE组件消息（搭积木核心方法）
   */
  function handleComponentMessage(sessionId: string, msg: SSEComponentMessage): boolean {
    if (msg.type !== 'component' || !msg.component) {
      return false;
    }

    switch (msg.action) {
      case 'replace':
        replaceRootNode(sessionId, msg.component);
        return true;

      case 'append':
        if (msg.targetId) {
          return appendComponent(sessionId, msg.targetId, msg.component);
        }
        console.warn('[A2UI Store] append操作缺少targetId');
        return false;

      case 'update':
        if (msg.targetId) {
          return updateComponent(sessionId, msg.targetId, msg.component);
        }
        console.warn('[A2UI Store] update操作缺少targetId');
        return false;

      default:
        console.warn(`[A2UI Store] 未知操作类型: ${msg.action}`);
        return false;
    }
  }

  /**
   * 🧱 更新图片URL（图片生成完成后更新轮播组件）
   */
  function updateImageInCarousel(sessionId: string, carouselId: string, imageId: string, imageUrl: string) {
    const session = sessions.value[sessionId];
    if (!session || !session.rootNode) return false;

    const carousel = findComponentById(session.rootNode, carouselId);
    if (carousel && carousel.props?.images) {
      const images = carousel.props.images as Array<{ id: string; src: string; alt?: string }>;
      const imgIndex = images.findIndex(img => img.id === imageId);
      if (imgIndex >= 0) {
        images[imgIndex].src = imageUrl;
        session.updatedAt = Date.now();
        console.log(`✅ [A2UI Store] 更新图片 ${imageId} -> ${imageUrl.substring(0, 50)}...`);
        return true;
      }
    }
    return false;
  }

  /**
   * 获取当前组件数量（用于调试）
   */
  function getComponentCount(sessionId: string): number {
    const session = sessions.value[sessionId];
    if (!session || !session.rootNode) return 0;

    let count = 0;
    const countRecursive = (node: A2UIComponentNode) => {
      count++;
      if (node.children) {
        node.children.forEach(countRecursive);
      }
    };
    countRecursive(session.rootNode);
    return count;
  }

  function completeSession(sessionId: string) {
    const session = sessions.value[sessionId];
    if (session) {
      session.status = 'completed';
      session.updatedAt = Date.now();
    }
  }

  return {
    // 状态
    sessions,
    currentSessionId,
    eventLog,

    // Getters
    currentSession,
    isRunning,
    totalScore,
    sessionList,

    // Actions
    createSession,
    getSession,
    setSessionId,
    updateRootNode,
    updateDataModel,
    updateScore,
    addScore,
    updateTimeRemaining,
    setSessionStatus,
    setSessionError,
    updateUserProgress,
    logEvent,
    clearEventLog,
    clearSession,
    clearAllSessions,
    completeSession,

    // 🧱 搭积木模式新增方法
    findComponentById,
    appendComponent,
    updateComponent,
    replaceRootNode,
    handleComponentMessage,
    updateImageInCarousel,
    getComponentCount
  };
});
