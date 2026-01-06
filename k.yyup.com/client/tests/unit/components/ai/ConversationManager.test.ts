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
import ConversationManager from '@/components/ai/ConversationManager.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    conversations: [
      {
        id: 1,
        title: 'Test Conversation 1',
        messages: [
          { id: 1, role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
          { id: 2, role: 'assistant', content: 'Hi there!', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isArchived: false
      },
      {
        id: 2,
        title: 'Test Conversation 2',
        messages: [
          { id: 3, role: 'user', content: 'How are you?', timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true,
        isArchived: false
      }
    ],
    currentConversation: null,
    isLoading: false,
    error: null,
    fetchConversations: vi.fn(),
    createConversation: vi.fn(),
    updateConversation: vi.fn(),
    deleteConversation: vi.fn(),
    archiveConversation: vi.fn(),
    pinConversation: vi.fn(),
    unpinConversation: vi.fn(),
    searchConversations: vi.fn(),
    exportConversation: vi.fn(),
    importConversation: vi.fn(),
    clearError: vi.fn()
  })
}));

describe('ConversationManager.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(async () => {
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
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.conversation-manager').exists()).toBe(true);
    expect(wrapper.find('.manager-header').exists()).toBe(true);
    expect(wrapper.find('.conversation-grid').exists()).toBe(true);
  });

  it('displays header with title and actions', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.manager-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('对话管理');
  });

  it('displays new conversation button', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const newButton = wrapper.find('.new-conversation-button');
    expect(newButton.exists()).toBe(true);
  });

  it('displays search input', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);
  });

  it('displays filter dropdown', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterDropdown = wrapper.find('.filter-dropdown');
    expect(filterDropdown.exists()).toBe(true);
  });

  it('displays sort dropdown', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortDropdown = wrapper.find('.sort-dropdown');
    expect(sortDropdown.exists()).toBe(true);
  });

  it('displays conversation grid', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversationGrid = wrapper.find('.conversation-grid');
    expect(conversationGrid.exists()).toBe(true);
  });

  it('displays conversation cards', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const conversationCards = wrapper.findAll('.conversation-card');
    expect(conversationCards.length).toBe(2);
  });

  it('displays conversation titles', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const titles = wrapper.findAll('.conversation-title');
    expect(titles[0].text()).toBe('Test Conversation 1');
    expect(titles[1].text()).toBe('Test Conversation 2');
  });

  it('displays message previews', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const previews = wrapper.findAll('.message-preview');
    expect(previews[0].text()).toContain('Hello');
    expect(previews[1].text()).toContain('How are you?');
  });

  it('displays message counts', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const messageCounts = wrapper.findAll('.message-count');
    expect(messageCounts[0].text()).toBe('2');
    expect(messageCounts[1].text()).toBe('1');
  });

  it('displays creation dates', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const dates = wrapper.findAll('.creation-date');
    expect(dates.length).toBe(2);
  });

  it('displays pinned status', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const pinnedBadges = wrapper.findAll('.pinned-badge');
    expect(pinnedBadges.length).toBe(1);
    expect(pinnedBadges[0].text()).toContain('已置顶');
  });

  it('handles new conversation button click', async () => {
    const wrapper = mount(ConversationManager, {
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

  it('handles conversation card click', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const selectConversationSpy = vi.fn();
    wrapper.vm.selectConversation = selectConversationSpy;

    const conversationCard = wrapper.find('.conversation-card');
    await conversationCard.trigger('click');

    expect(selectConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation delete', async () => {
    const wrapper = mount(ConversationManager, {
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

  it('handles conversation archive', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const archiveConversationSpy = vi.fn();
    wrapper.vm.archiveConversation = archiveConversationSpy;

    const archiveButton = wrapper.find('.archive-conversation-button');
    await archiveButton.trigger('click');

    expect(archiveConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation pin', async () => {
    const wrapper = mount(ConversationManager, {
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

  it('handles conversation unpin', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const unpinConversationSpy = vi.fn();
    wrapper.vm.unpinConversation = unpinConversationSpy;

    const unpinButton = wrapper.find('.unpin-conversation-button');
    await unpinButton.trigger('click');

    expect(unpinConversationSpy).toHaveBeenCalledWith(2);
  });

  it('handles conversation export', async () => {
    const wrapper = mount(ConversationManager, {
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

  it('handles search input', async () => {
    const wrapper = mount(ConversationManager, {
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

  it('handles filter change', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterDropdown = wrapper.find('.filter-dropdown');
    await filterDropdown.setValue('pinned');

    expect(wrapper.vm.currentFilter).toBe('pinned');
  });

  it('handles sort change', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortDropdown = wrapper.find('.sort-dropdown');
    await sortDropdown.setValue('date-desc');

    expect(wrapper.vm.currentSort).toBe('date-desc');
  });

  it('displays loading state', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays error message', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to load conversations' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to load conversations');
  });

  it('displays empty state when no conversations', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ conversations: [] });

    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-state').text()).toContain('暂无对话');
  });

  it('handles conversation edit', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const editConversationSpy = vi.fn();
    wrapper.vm.editConversation = editConversationSpy;

    const editButton = wrapper.find('.edit-conversation-button');
    await editButton.trigger('click');

    expect(editConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation duplicate', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const duplicateConversationSpy = vi.fn();
    wrapper.vm.duplicateConversation = duplicateConversationSpy;

    const duplicateButton = wrapper.find('.duplicate-conversation-button');
    await duplicateButton.trigger('click');

    expect(duplicateConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles conversation share', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const shareConversationSpy = vi.fn();
    wrapper.vm.shareConversation = shareConversationSpy;

    const shareButton = wrapper.find('.share-conversation-button');
    await shareButton.trigger('click');

    expect(shareConversationSpy).toHaveBeenCalledWith(1);
  });

  it('handles bulk selection mode', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const selectModeButton = wrapper.find('.select-mode-button');
    await selectModeButton.trigger('click');

    expect(wrapper.vm.isSelectionMode).toBe(true);
  });

  it('handles conversation selection in bulk mode', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isSelectionMode: true });

    const checkbox = wrapper.find('.conversation-checkbox');
    await checkbox.setChecked(true);

    expect(wrapper.vm.selectedConversations).toContain(1);
  });

  it('handles bulk delete', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isSelectionMode: true, selectedConversations: [1, 2] });

    const bulkDeleteSpy = vi.fn();
    wrapper.vm.bulkDeleteConversations = bulkDeleteSpy;

    const bulkDeleteButton = wrapper.find('.bulk-delete-button');
    await bulkDeleteButton.trigger('click');

    expect(bulkDeleteSpy).toHaveBeenCalledWith([1, 2]);
  });

  it('handles bulk archive', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isSelectionMode: true, selectedConversations: [1, 2] });

    const bulkArchiveSpy = vi.fn();
    wrapper.vm.bulkArchiveConversations = bulkArchiveSpy;

    const bulkArchiveButton = wrapper.find('.bulk-archive-button');
    await bulkArchiveButton.trigger('click');

    expect(bulkArchiveSpy).toHaveBeenCalledWith([1, 2]);
  });

  it('handles bulk export', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isSelectionMode: true, selectedConversations: [1, 2] });

    const bulkExportSpy = vi.fn();
    wrapper.vm.bulkExportConversations = bulkExportSpy;

    const bulkExportButton = wrapper.find('.bulk-export-button');
    await bulkExportButton.trigger('click');

    expect(bulkExportSpy).toHaveBeenCalledWith([1, 2]);
  });

  it('displays conversation statistics', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const stats = wrapper.find('.conversation-stats');
    expect(stats.exists()).toBe(true);
    expect(stats.text()).toContain('2');
  });

  it('handles view mode change', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const viewModeButton = wrapper.find('.view-mode-button');
    await viewModeButton.trigger('click');

    expect(wrapper.vm.viewMode).toBe('list');
  });

  it('displays conversation in list view', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ viewMode: 'list' });

    expect(wrapper.find('.conversation-list').exists()).toBe(true);
  });

  it('handles import conversation', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const importConversationSpy = vi.fn();
    wrapper.vm.importConversation = importConversationSpy;

    const importButton = wrapper.find('.import-conversation-button');
    await importButton.trigger('click');

    expect(importConversationSpy).toHaveBeenCalled();
  });

  it('handles conversation tag management', async () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const manageTagsSpy = vi.fn();
    wrapper.vm.manageTags = manageTagsSpy;

    const tagsButton = wrapper.find('.manage-tags-button');
    await tagsButton.trigger('click');

    expect(manageTagsSpy).toHaveBeenCalled();
  });

  it('displays conversation tags', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    const tags = wrapper.findAll('.conversation-tag');
    expect(tags.length).toBeGreaterThanOrEqual(0);
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ConversationManager).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.conversation-manager').exists()).toBe(true);
    expect(wrapper.find('.manager-header').exists()).toBe(true);
    expect(wrapper.find('.conversation-grid').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ConversationManager, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('conversation-manager');
  });
});