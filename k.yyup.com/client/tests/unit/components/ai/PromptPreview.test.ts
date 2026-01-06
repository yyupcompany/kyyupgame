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
import PromptPreview from '@/components/ai/PromptPreview.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    prompts: [
      {
        id: 1,
        title: 'Code Review',
        content: 'Please review the following code and provide feedback on its quality, performance, and best practices.',
        category: 'development',
        tags: ['code', 'review', 'quality'],
        isFavorite: true,
        usageCount: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Content Writing',
        content: 'Write a comprehensive article about the benefits of renewable energy.',
        category: 'writing',
        tags: ['content', 'article', 'renewable'],
        isFavorite: false,
        usageCount: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    categories: ['development', 'writing', 'analysis', 'creative'],
    tags: ['code', 'review', 'quality', 'content', 'article', 'renewable'],
    isLoading: false,
    error: null,
    fetchPrompts: vi.fn(),
    createPrompt: vi.fn(),
    updatePrompt: vi.fn(),
    deletePrompt: vi.fn(),
    favoritePrompt: vi.fn(),
    unfavoritePrompt: vi.fn(),
    usePrompt: vi.fn(),
    searchPrompts: vi.fn(),
    filterPrompts: vi.fn(),
    sortPrompts: vi.fn()
  })
}));

describe('PromptPreview.vue', () => {
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
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.prompt-preview').exists()).toBe(true);
    expect(wrapper.find('.preview-header').exists()).toBe(true);
    expect(wrapper.find('.preview-content').exists()).toBe(true);
  });

  it('displays header with title', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const header = wrapper.find('.preview-header');
    expect(header.exists()).toBe(true);
    expect(header.text()).toContain('提示词预览');
  });

  it('displays prompt list', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const promptList = wrapper.find('.prompt-list');
    expect(promptList.exists()).toBe(true);
  });

  it('displays prompt items', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const promptItems = wrapper.findAll('.prompt-item');
    expect(promptItems.length).toBe(2);
  });

  it('displays prompt titles', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const titles = wrapper.findAll('.prompt-title');
    expect(titles[0].text()).toBe('Code Review');
    expect(titles[1].text()).toBe('Content Writing');
  });

  it('displays prompt content preview', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const previews = wrapper.findAll('.prompt-content-preview');
    expect(previews[0].text()).toContain('Please review the following code');
    expect(previews[1].text()).toContain('Write a comprehensive article');
  });

  it('displays prompt categories', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const categories = wrapper.findAll('.prompt-category');
    expect(categories[0].text()).toBe('development');
    expect(categories[1].text()).toBe('writing');
  });

  it('displays prompt tags', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const tags = wrapper.findAll('.prompt-tags');
    expect(tags.length).toBe(2);
  });

  it('displays usage count', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const usageCounts = wrapper.findAll('.usage-count');
    expect(usageCounts[0].text()).toContain('25');
    expect(usageCounts[1].text()).toContain('15');
  });

  it('displays favorite status', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const favoriteIcons = wrapper.findAll('.favorite-icon');
    expect(favoriteIcons[0].classes()).toContain('favorited');
    expect(favoriteIcons[1].classes()).not.toContain('favorited');
  });

  it('handles prompt item click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const usePromptSpy = vi.fn();
    wrapper.vm.usePrompt = usePromptSpy;

    const promptItem = wrapper.find('.prompt-item');
    await promptItem.trigger('click');

    expect(usePromptSpy).toHaveBeenCalledWith(1);
  });

  it('handles favorite button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const favoritePromptSpy = vi.fn();
    wrapper.vm.favoritePrompt = favoritePromptSpy;

    const favoriteButton = wrapper.find('.favorite-button');
    await favoriteButton.trigger('click');

    expect(favoritePromptSpy).toHaveBeenCalledWith(1);
  });

  it('handles unfavorite button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const unfavoritePromptSpy = vi.fn();
    wrapper.vm.unfavoritePrompt = unfavoritePromptSpy;

    await wrapper.setData({
      prompts: [
        {
          ...wrapper.vm.prompts[0],
          isFavorite: false
        }
      ]
    });

    const favoriteButton = wrapper.find('.favorite-button');
    await favoriteButton.trigger('click');

    expect(unfavoritePromptSpy).toHaveBeenCalledWith(1);
  });

  it('handles edit button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const editPromptSpy = vi.fn();
    wrapper.vm.editPrompt = editPromptSpy;

    const editButton = wrapper.find('.edit-button');
    await editButton.trigger('click');

    expect(editPromptSpy).toHaveBeenCalledWith(1);
  });

  it('handles delete button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const deletePromptSpy = vi.fn();
    wrapper.vm.deletePrompt = deletePromptSpy;

    const deleteButton = wrapper.find('.delete-button');
    await deleteButton.trigger('click');

    expect(deletePromptSpy).toHaveBeenCalledWith(1);
  });

  it('handles copy button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const copySpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: copySpy
      }
    });

    const copyButton = wrapper.find('.copy-button');
    await copyButton.trigger('click');

    expect(copySpy).toHaveBeenCalledWith(wrapper.vm.prompts[0].content);
  });

  it('handles share button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sharePromptSpy = vi.fn();
    wrapper.vm.sharePrompt = sharePromptSpy;

    const shareButton = wrapper.find('.share-button');
    await shareButton.trigger('click');

    expect(sharePromptSpy).toHaveBeenCalledWith(1);
  });

  it('displays search input', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchInput = wrapper.find('.search-input');
    expect(searchInput.exists()).toBe(true);
  });

  it('handles search input', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchPromptsSpy = vi.fn();
    wrapper.vm.searchPrompts = searchPromptsSpy;

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('code');

    expect(searchPromptsSpy).toHaveBeenCalledWith('code');
  });

  it('displays category filter', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const categoryFilter = wrapper.find('.category-filter');
    expect(categoryFilter.exists()).toBe(true);
  });

  it('handles category filter change', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterPromptsSpy = vi.fn();
    wrapper.vm.filterPrompts = filterPromptsSpy;

    const categoryFilter = wrapper.find('.category-filter');
    await categoryFilter.setValue('development');

    expect(filterPromptsSpy).toHaveBeenCalledWith({ category: 'development' });
  });

  it('displays tag filter', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const tagFilter = wrapper.find('.tag-filter');
    expect(tagFilter.exists()).toBe(true);
  });

  it('handles tag filter change', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterPromptsSpy = vi.fn();
    wrapper.vm.filterPrompts = filterPromptsSpy;

    const tagFilter = wrapper.find('.tag-filter');
    await tagFilter.setValue('code');

    expect(filterPromptsSpy).toHaveBeenCalledWith({ tags: ['code'] });
  });

  it('displays sort options', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortOptions = wrapper.find('.sort-options');
    expect(sortOptions.exists()).toBe(true);
  });

  it('handles sort change', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortPromptsSpy = vi.fn();
    wrapper.vm.sortPrompts = sortPromptsSpy;

    const sortOptions = wrapper.find('.sort-options');
    await sortOptions.setValue('usage-desc');

    expect(sortPromptsSpy).toHaveBeenCalledWith('usage-desc');
  });

  it('displays new prompt button', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const newButton = wrapper.find('.new-prompt-button');
    expect(newButton.exists()).toBe(true);
  });

  it('handles new prompt button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const createPromptSpy = vi.fn();
    wrapper.vm.createPrompt = createPromptSpy;

    const newButton = wrapper.find('.new-prompt-button');
    await newButton.trigger('click');

    expect(createPromptSpy).toHaveBeenCalled();
  });

  it('displays import prompts button', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const importButton = wrapper.find('.import-prompts-button');
    expect(importButton.exists()).toBe(true);
  });

  it('handles import prompts button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const importPromptsSpy = vi.fn();
    wrapper.vm.importPrompts = importPromptsSpy;

    const importButton = wrapper.find('.import-prompts-button');
    await importButton.trigger('click');

    expect(importPromptsSpy).toHaveBeenCalled();
  });

  it('displays export prompts button', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportButton = wrapper.find('.export-prompts-button');
    expect(exportButton.exists()).toBe(true);
  });

  it('handles export prompts button click', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportPromptsSpy = vi.fn();
    wrapper.vm.exportPrompts = exportPromptsSpy;

    const exportButton = wrapper.find('.export-prompts-button');
    await exportButton.trigger('click');

    expect(exportPromptsSpy).toHaveBeenCalled();
  });

  it('displays view toggle', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const viewToggle = wrapper.find('.view-toggle');
    expect(viewToggle.exists()).toBe(true);
  });

  it('handles view mode change', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const viewToggle = wrapper.find('.view-toggle');
    await viewToggle.trigger('click');

    expect(wrapper.vm.viewMode).toBe('grid');
  });

  it('displays grid view when grid mode is active', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ viewMode: 'grid' });

    expect(wrapper.find('.prompt-grid').exists()).toBe(true);
  });

  it('displays list view when list mode is active', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ viewMode: 'list' });

    expect(wrapper.find('.prompt-list').exists()).toBe(true);
  });

  it('displays loading state', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays empty state when no prompts', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ prompts: [] });

    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-state').text()).toContain('暂无提示词');
  });

  it('displays error message', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to load prompts' });

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('Failed to load prompts');
  });

  it('handles error dismissal', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ error: 'Failed to load prompts' });

    const errorCloseButton = wrapper.find('.error-close-button');
    await errorCloseButton.trigger('click');

    expect(wrapper.vm.error).toBeNull();
  });

  it('displays prompt statistics', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const statistics = wrapper.find('.prompt-statistics');
    expect(statistics.exists()).toBe(true);
  });

  it('displays total prompts count', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const totalCount = wrapper.find('.total-count');
    expect(totalCount.exists()).toBe(true);
    expect(totalCount.text()).toContain('2');
  });

  it('displays favorite prompts count', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const favoriteCount = wrapper.find('.favorite-count');
    expect(favoriteCount.exists()).toBe(true);
    expect(favoriteCount.text()).toContain('1');
  });

  it('displays most used prompt', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const mostUsed = wrapper.find('.most-used');
    expect(mostUsed.exists()).toBe(true);
    expect(mostUsed.text()).toContain('Code Review');
  });

  it('handles prompt hover effects', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const promptItem = wrapper.find('.prompt-item');
    await promptItem.trigger('mouseenter');

    expect(wrapper.find('.prompt-actions').exists()).toBe(true);
  });

  it('handles prompt hover leave', async () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    const promptItem = wrapper.find('.prompt-item');
    await promptItem.trigger('mouseenter');
    await promptItem.trigger('mouseleave');

    expect(wrapper.find('.prompt-actions').exists()).toBe(false);
  });

  it('is a Vue instance', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(PromptPreview).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.prompt-preview').exists()).toBe(true);
    expect(wrapper.find('.preview-header').exists()).toBe(true);
    expect(wrapper.find('.preview-content').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(PromptPreview, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('prompt-preview');
  });
});