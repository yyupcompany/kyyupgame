import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, Router } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import ConversationDrawer from '@/components/ai/ConversationDrawer.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    conversations: [
      {
        id: 1,
        title: 'First Conversation',
        lastMessage: 'Hello',
        timestamp: new Date().toISOString(),
        unreadCount: 0
      },
      {
        id: 2,
        title: 'Second Conversation',
        lastMessage: 'How are you?',
        timestamp: new Date().toISOString(),
        unreadCount: 2
      }
    ],
    currentConversationId: 1,
    isLoading: false,
    error: null,
    fetchConversations: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    selectConversation: vi.fn(),
    markAsRead: vi.fn(),
    searchConversations: vi.fn()
  })
}));

describe('ConversationDrawer.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        }
      ]
    });

    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.conversation-drawer').exists()).toBe(true);
    expect(wrapper.find('.drawer-header').exists()).toBe(true);
    expect(wrapper.find('.conversation-list').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.drawer-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('对话历史');
  });

  it('displays new conversation button', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const newButton = wrapper.find('.new-conversation-button');
    expect(newButton.exists()).toBe(true);
  });

  it('displays search input', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);
  });

  it('displays conversation list', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversations = wrapper.findAll('.conversation-item');
    expect(conversations.length).toBe(2);
  });

  it('displays conversation titles', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const titles = wrapper.findAll('.conversation-title');
    expect(titles[0].text()).toBe('First Conversation');
    expect(titles[1].text()).toBe('Second Conversation');
  });

  it('displays last messages', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const lastMessages = wrapper.findAll('.last-message');
    expect(lastMessages[0].text()).toBe('Hello');
    expect(lastMessages[1].text()).toBe('How are you?');
  });

  it('displays timestamps', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const timestamps = wrapper.findAll('.timestamp');
    expect(timestamps.length).toBe(2);
  });

  it('displays unread count badges', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const badges = wrapper.findAll('.unread-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].text()).toBe('2');
  });

  it('highlights current conversation', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversations = wrapper.findAll('.conversation-item');
    expect(conversations[0].classes()).toContain('active');
    expect(conversations[1].classes()).not.toContain('active');
  });

  it('handles new conversation button click', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const createConversationSpy = vi.fn();
    wrapper.vm.createConversation = createConversationSpy;

    const newButton = wrapper.find('.new-conversation-button');
    await newButton.trigger('click');

    expect(createConversationSpy).toHaveBeenCalled();
  });

  it('handles conversation item click', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const selectConversationSpy = vi.fn();
    wrapper.vm.selectConversation = selectConversationSpy;

    const conversationItem = wrapper.findAll('.conversation-item')[1];
    await conversationItem.trigger('click');

    expect(selectConversationSpy).toHaveBeenCalledWith(2);
  });

  it('handles conversation delete', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const deleteConversationSpy = vi.fn();
    wrapper.vm.deleteConversation = deleteConversationSpy;

    const deleteButton = wrapper.find('.delete-conversation-button');
    await deleteButton.trigger('click');

    expect(deleteConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles search input', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchConversationsSpy = vi.fn();
    wrapper.vm.searchConversations = searchConversationsSpy;

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('test');

    expect(searchConversationsSpy).toHaveBeenCalledWith('test');
  });

  it('displays loading state', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays error message', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to load conversations' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to load conversations');
  });

  it('displays empty state when no conversations', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ conversations: [] });

    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-state').text()).toContain('暂无对话');
  });

  it('handles close button click', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const closeButton = wrapper.find('.close-button');
    await closeButton.trigger('click');

    expect(wrapper.emitted('close')).toBeTruthy();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('handles conversation hover', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversationItem = wrapper.find('.conversation-item');
    await conversationItem.trigger('mouseenter');

    expect(wrapper.find('.conversation-actions').exists()).toBe(true);
  });

  it('hides conversation actions on mouse leave', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversationItem = wrapper.find('.conversation-item');
    await conversationItem.trigger('mouseenter');
    await conversationItem.trigger('mouseleave');

    expect(wrapper.find('.conversation-actions').exists()).toBe(false);
  });

  it('handles conversation rename', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const renameConversationSpy = vi.fn();
    wrapper.vm.renameConversation = renameConversationSpy;

    const renameButton = wrapper.find('.rename-conversation-button');
    await renameButton.trigger('click');

    expect(renameConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation export', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportConversationSpy = vi.fn();
    wrapper.vm.exportConversation = exportConversationSpy;

    const exportButton = wrapper.find('.export-conversation-button');
    await exportButton.trigger('click');

    expect(exportConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation pin', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const pinConversationSpy = vi.fn();
    wrapper.vm.pinConversation = pinConversationSpy;

    const pinButton = wrapper.find('.pin-conversation-button');
    await pinButton.trigger('click');

    expect(pinConversationSpy).toHaveBeenCalledWith(1);
  });

  it('displays pinned conversations at the top', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({
      conversations: [
        {
          id: 1,
          title: 'Pinned Conversation',
          lastMessage: 'Pinned',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
          isPinned: true
        },
        {
          id: 2,
          title: 'Normal Conversation',
          lastMessage: 'Normal',
          timestamp: new Date().toISOString(),
          unreadCount: 0,
          isPinned: false
        }
      ]
    });

    const conversations = wrapper.findAll('.conversation-item');
    expect(conversations[0].text()).toContain('Pinned Conversation');
    expect(conversations[1].text()).toContain('Normal Conversation');
  });

  it('handles conversation filtering', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ filter: 'unread' });

    const conversations = wrapper.findAll('.conversation-item');
    expect(conversations.length).toBe(1);
    expect(conversations[0].text()).toContain('Second Conversation');
  });

  it('handles conversation sorting', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortSelect = wrapper.find('.sort-select');
    await sortSelect.setValue('alphabetical');

    expect(wrapper.vm.sortBy).toBe('alphabetical');
  });

  it('displays conversation count', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const count = wrapper.find('.conversation-count');
    expect(count.exists()).toBe(true);
    expect(count.text()).toContain('2');
  });

  it('handles keyboard navigation', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchInput = wrapper.find('.search-input');
    await searchInput.trigger('keydown', { key: 'Escape' });

    expect(wrapper.vm.searchQuery).toBe('');
  });

  it('handles infinite scroll', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const loadMoreConversationsSpy = vi.fn();
    wrapper.vm.loadMoreConversations = loadMoreConversationsSpy;

    const scrollContainer = wrapper.find('.conversation-list');
    await scrollContainer.trigger('scroll');

    expect(loadMoreConversationsSpy).toHaveBeenCalled();
  });

  it('displays date separators', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const dateSeparators = wrapper.findAll('.date-separator');
    expect(dateSeparators.length).toBeGreaterThan(0);
  });

  it('handles conversation selection via keyboard', async () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    const selectConversationSpy = vi.fn();
    wrapper.vm.selectConversation = selectConversationSpy;

    const conversationItem = wrapper.find('.conversation-item');
    await conversationItem.trigger('keydown', { key: 'Enter' });

    expect(selectConversationSpy).toHaveBeenCalledWith(1);
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ConversationDrawer).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.conversation-drawer').exists()).toBe(true);
    expect(wrapper.find('.drawer-header').exists()).toBe(true);
    expect(wrapper.find('.conversation-list').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ConversationDrawer, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('conversation-drawer');
  });
});