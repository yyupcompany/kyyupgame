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
import { nextTick } from 'vue';
import MemoryListComponent from '@/components/ai/MemoryListComponent.vue';
import ElementPlus from 'element-plus';

// Mock Element Plus components and utilities
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

describe('MemoryListComponent.vue', () => {
  let wrapper;

  const mockMemories = [
    {
      id: 1,
      userId: 1,
      conversationId: 'conv_1',
      content: 'Memory 1 content',
      importance: 0.8,
      memoryType: 'short_term',
      createdAt: '2024-01-01T10:00:00Z',
      expiresAt: '2024-01-08T10:00:00Z'
    },
    {
      id: 2,
      userId: 1,
      conversationId: 'conv_1',
      content: 'Memory 2 content',
      importance: 0.6,
      memoryType: 'short_term',
      createdAt: '2024-01-02T10:00:00Z'
    },
    {
      id: 3,
      userId: 1,
      conversationId: 'conv_1',
      content: 'Memory 3 content',
      importance: 0.9,
      memoryType: 'long_term',
      createdAt: '2024-01-03T10:00:00Z'
    }
  ];

  const mockProps = {
    userId: 1,
    memoryType: 'short_term'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock ElMessageBox.confirm
    const { ElMessageBox } = require('element-plus');
    ElMessageBox.confirm.mockResolvedValue(true);

    wrapper = mount(MemoryListComponent, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-button': true,
          'el-card': true,
          'el-skeleton': true,
          'el-empty': true,
          'el-pagination': true,
          'el-tag': true
        }
      },
      props: mockProps
    });
  });

  it('renders properly with props', () => {
    expect(wrapper.find('.memory-list-container').exists()).toBe(true);
    expect(wrapper.find('.list-header').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('短期记忆');
  });

  it('shows correct memory type label', () => {
    expect(wrapper.vm.getMemoryTypeLabel('short_term')).toBe('短期记忆');
    expect(wrapper.vm.getMemoryTypeLabel('long_term')).toBe('长期记忆');
    expect(wrapper.vm.getMemoryTypeLabel('immediate')).toBe('即时记忆');
    expect(wrapper.vm.getMemoryTypeLabel('unknown')).toBe('未知类型');
  });

  it('handles alternative memory type formats', () => {
    expect(wrapper.vm.getMemoryTypeLabel('shortterm')).toBe('短期记忆');
    expect(wrapper.vm.getMemoryTypeLabel('longterm')).toBe('长期记忆');
  });

  it('formats importance correctly', () => {
    expect(wrapper.vm.formatImportance(0.8)).toBe('80%');
    expect(wrapper.vm.formatImportance(0.5)).toBe('50%');
    expect(wrapper.vm.formatImportance(1.0)).toBe('100%');
  });

  it('formats date correctly', () => {
    const dateStr = '2024-01-01T10:00:00Z';
    const formatted = wrapper.vm.formatDate(dateStr);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('01');
    expect(formatted).toContain('10:00');
  });

  it('loads memories on mount', async () => {
    // Mock the API function
    const searchMemories = vi.fn().mockResolvedValue({
      items: mockMemories.filter(m => m.memoryType === 'short_term'),
      total: 2
    });

    // Replace the mock function in the component
    wrapper.vm.searchMemories = searchMemories;

    await nextTick();

    expect(searchMemories).toHaveBeenCalledWith(1, {
      memoryType: 'short_term',
      limit: 10,
      offset: 0,
      sortField: 'createdAt',
      sortDirection: 'DESC'
    });

    expect(wrapper.vm.memories).toEqual(mockMemories.filter(m => m.memoryType === 'short_term'));
    expect(wrapper.vm.total).toBe(2);
  });

  it('handles loading state', async () => {
    expect(wrapper.vm.loading).toBe(false);

    // Simulate loading
    await wrapper.setData({ loading: true });
    expect(wrapper.find('.list-loading').exists()).toBe(true);

    await wrapper.setData({ loading: false });
    expect(wrapper.find('.list-loading').exists()).toBe(false);
  });

  it('shows empty state when no memories', () => {
    wrapper.setData({
      memories: [],
      loading: false
    });

    expect(wrapper.find('.empty-list').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'el-empty' }).exists()).toBe(true);
  });

  it('displays memories correctly', async () => {
    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const memoryCards = wrapper.findAll('.memory-card');
    expect(memoryCards).toHaveLength(2);

    const firstCard = memoryCards[0];
    expect(firstCard.find('.memory-content').text()).toBe('Memory 1 content');
    expect(firstCard.find('.memory-importance').text()).toBe('重要性: 80%');
    expect(firstCard.find('.memory-expires').text()).toContain('过期时间:');
  });

  it('handles memory deletion with confirmation', async () => {
    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const deleteMemory = vi.fn().mockResolvedValue({ success: true });
    wrapper.vm.deleteMemory = deleteMemory;

    const firstCard = wrapper.findAll('.memory-card')[0];
    const deleteButton = firstCard.findAll('.el-button')[1]; // Second button is delete
    await deleteButton.trigger('click');

    const { ElMessageBox } = require('element-plus');
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要删除此记忆吗？此操作不可恢复。',
      expect.objectContaining({
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    );

    expect(deleteMemory).toHaveBeenCalledWith(1, 1);
  });

  it('handles memory deletion cancellation', async () => {
    const { ElMessageBox } = require('element-plus');
    ElMessageBox.confirm.mockRejectedValueOnce('cancel');

    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const deleteMemory = vi.fn().mockResolvedValue({ success: true });
    wrapper.vm.deleteMemory = deleteMemory;

    const firstCard = wrapper.findAll('.memory-card')[0];
    const deleteButton = firstCard.findAll('.el-button')[1];
    await deleteButton.trigger('click');

    expect(deleteMemory).not.toHaveBeenCalled();
  });

  it('handles memory deletion error', async () => {
    const { ElMessageBox } = require('element-plus');
    ElMessageBox.confirm.mockRejectedValueOnce(new Error('Delete error'));

    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { ElMessage } = require('element-plus');

    const firstCard = wrapper.findAll('.memory-card')[0];
    const deleteButton = firstCard.findAll('.el-button')[1];
    await deleteButton.trigger('click');

    expect(consoleSpy).toHaveBeenCalledWith('删除记忆失败:', expect.any(Error));
    expect(ElMessage.error).toHaveBeenCalledWith('删除记忆失败');

    consoleSpy.mockRestore();
  });

  it('handles memory archiving with confirmation', async () => {
    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const archiveToLongTerm = vi.fn().mockResolvedValue({ success: true });
    wrapper.vm.archiveToLongTerm = archiveToLongTerm;

    const firstCard = wrapper.findAll('.memory-card')[0];
    const archiveButton = firstCard.find('.el-button'); // First button is archive
    await archiveButton.trigger('click');

    const { ElMessageBox } = require('element-plus');
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      '确定要将此记忆归档为长期记忆吗？',
      expect.objectContaining({
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    );

    expect(archiveToLongTerm).toHaveBeenCalledWith(1);
  });

  it('refreshes list after successful deletion', async () => {
    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const deleteMemory = vi.fn().mockResolvedValue({ success: true });
    wrapper.vm.deleteMemory = deleteMemory;

    const fetchMemories = vi.fn().mockResolvedValue({
      items: mockMemories.filter(m => m.memoryType === 'short_term').slice(1),
      total: 1
    });
    wrapper.vm.fetchMemories = fetchMemories;

    const firstCard = wrapper.findAll('.memory-card')[0];
    const deleteButton = firstCard.findAll('.el-button')[1];
    await deleteButton.trigger('click');

    expect(fetchMemories).toHaveBeenCalled();
  });

  it('emits refresh event after successful deletion', async () => {
    await wrapper.setData({
      memories: mockMemories.filter(m => m.memoryType === 'short_term')
    });

    const deleteMemory = vi.fn().mockResolvedValue({ success: true });
    wrapper.vm.deleteMemory = deleteMemory;

    const firstCard = wrapper.findAll('.memory-card')[0];
    const deleteButton = firstCard.findAll('.el-button')[1];
    await deleteButton.trigger('click');

    expect(wrapper.emitted('refresh')).toBeTruthy();
  });

  it('handles pagination size change', async () => {
    const fetchMemories = vi.fn().mockResolvedValue({ items: [], total: 0 });
    wrapper.vm.fetchMemories = fetchMemories;

    await wrapper.vm.handleSizeChange(20);

    expect(wrapper.vm.pageSize).toBe(20);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(fetchMemories).toHaveBeenCalled();
  });

  it('handles pagination page change', async () => {
    const fetchMemories = vi.fn().mockResolvedValue({ items: [], total: 0 });
    wrapper.vm.fetchMemories = fetchMemories;

    await wrapper.vm.handleCurrentChange(2);

    expect(wrapper.vm.currentPage).toBe(2);
    expect(fetchMemories).toHaveBeenCalled();
  });

  it('watches memoryType changes and reloads data', async () => {
    const fetchMemories = vi.fn().mockResolvedValue({ items: [], total: 0 });
    wrapper.vm.fetchMemories = fetchMemories;

    await wrapper.setProps({ memoryType: 'long_term' });

    expect(wrapper.vm.currentPage).toBe(1);
    expect(fetchMemories).toHaveBeenCalled();
  });

  it('shows archive button only for short_term memories', async () => {
    await wrapper.setData({
      memories: [
        {
          id: 1,
          userId: 1,
          conversationId: 'conv_1',
          content: 'Short term memory',
          importance: 0.8,
          memoryType: 'short_term',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: 2,
          userId: 1,
          conversationId: 'conv_1',
          content: 'Long term memory',
          importance: 0.9,
          memoryType: 'long_term',
          createdAt: '2024-01-02T10:00:00Z'
        }
      ]
    });

    const memoryCards = wrapper.findAll('.memory-card');
    expect(memoryCards).toHaveLength(2);

    // First card (short_term) should have archive button
    const firstCardButtons = memoryCards[0].findAll('.el-button');
    expect(firstCardButtons).toHaveLength(2); // Archive and Delete

    // Second card (long_term) should only have delete button
    const secondCardButtons = memoryCards[1].findAll('.el-button');
    expect(secondCardButtons).toHaveLength(1); // Only Delete
  });

  it('handles API loading error gracefully', async () => {
    const searchMemories = vi.fn().mockRejectedValue(new Error('API Error'));
    wrapper.vm.searchMemories = searchMemories;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { ElMessage } = require('element-plus');

    await nextTick();

    expect(consoleSpy).toHaveBeenCalledWith('获取记忆列表失败:', expect.any(Error));
    expect(ElMessage.error).toHaveBeenCalledWith('获取记忆列表失败');
    expect(wrapper.vm.loading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('validates memoryType prop', () => {
    // Valid memory types should not throw errors
    const validTypes = ['immediate', 'short_term', 'long_term'];
    validTypes.forEach(type => {
      expect(() => {
        wrapper.setProps({ memoryType: type });
      }).not.toThrow();
    });
  });

  it('shows refresh button in header', () => {
    const refreshButton = wrapper.find('.list-header .el-button');
    expect(refreshButton.exists()).toBe(true);
    expect(refreshButton.text()).toContain('刷新');
  });

  it('calls fetchMemories when refresh button is clicked', async () => {
    const fetchMemories = vi.fn().mockResolvedValue({ items: [], total: 0 });
    wrapper.vm.fetchMemories = fetchMemories;

    const refreshButton = wrapper.find('.list-header .el-button');
    await refreshButton.trigger('click');

    expect(fetchMemories).toHaveBeenCalled();
  });
});