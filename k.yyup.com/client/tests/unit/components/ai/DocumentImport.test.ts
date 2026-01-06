
vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))


vi.mock('@/utils/request', () => ({
  default: vi.fn(),
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

vi.mock('../utils/request', () => ({
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn()
}))

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
import DocumentImport from '@/components/ai/DocumentImport.vue';
import ElementPlus from 'element-plus';

// Mock the request utility
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

// Mock Element Plus components and utilities
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

describe('DocumentImport.vue', () => {
  let wrapper;

  const mockPermissions = {
    teacher: true,
    parent: true
  };

  const mockPermissionInfo = {
    teacher: '可以导入教师数据',
    parent: '可以导入家长数据'
  };

  const mockFormats = {
    supportedFormats: [
      {
        description: '文本格式',
        examples: [
          '姓名: 张三\n邮箱: zhang@example.com\n电话: 13800138000',
          '姓名\t邮箱\t电话\n张三\tzhang@example.com\t13800138000'
        ]
      }
    ],
    teacherFields: [
      { field: 'name', required: true, description: '教师姓名' },
      { field: 'email', required: true, description: '邮箱地址' },
      { field: 'phone', required: false, description: '联系电话' }
    ],
    parentFields: [
      { field: 'name', required: true, description: '家长姓名' },
      { field: 'email', required: true, description: '邮箱地址' },
      { field: 'relationship', required: false, description: '与学生关系' }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock responses
    const request = require('@/utils/request').default;
    request.get.mockImplementation((url) => {
      if (url === '/api/document-import/permissions') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              permissions: mockPermissions,
              permissionInfo: mockPermissionInfo
            }
          }
        });
      } else if (url === '/api/document-import/formats') {
        return Promise.resolve({
          data: {
            success: true,
            data: mockFormats
          }
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    request.post.mockImplementation((url, data) => {
      if (url === '/api/document-import/preview') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              totalParsed: 2,
              validationErrors: [],
              parsedData: [
                { name: '张三', email: 'zhang@example.com', phone: '13800138000' },
                { name: '李四', email: 'li@example.com', phone: '13900139000' }
              ]
            }
          }
        });
      } else if (url === '/api/document-import/import') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              importedCount: 2,
              skippedCount: 0
            }
          }
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    // Mock ElMessageBox.confirm
    const { ElMessageBox } = require('element-plus');
    ElMessageBox.confirm.mockResolvedValue(true);

    wrapper = mount(DocumentImport, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-tag': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-input': true,
          'el-button': true,
          'el-table': true,
          'el-table-column': true,
          'el-alert': true,
          'el-empty': true,
          'el-dialog': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-scrollbar': true
        }
      }
    });
  });

  it('renders properly with header', () => {
    expect(wrapper.find('.document-import').exists()).toBe(true);
    expect(wrapper.find('.import-header').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('AI文档导入助手');
  });

  it('loads permissions on mount', async () => {
    const request = require('@/utils/request').default;
    
    await nextTick();
    
    expect(request.get).toHaveBeenCalledWith('/api/document-import/permissions');
    expect(wrapper.vm.permissions).toEqual(mockPermissions);
    expect(wrapper.vm.permissionInfo).toEqual(mockPermissionInfo);
  });

  it('loads formats on mount', async () => {
    const request = require('@/utils/request').default;
    
    await nextTick();
    
    expect(request.get).toHaveBeenCalledWith('/api/document-import/formats');
    expect(wrapper.vm.supportedFormats).toEqual(mockFormats.supportedFormats);
    expect(wrapper.vm.teacherFields).toEqual(mockFormats.teacherFields);
    expect(wrapper.vm.parentFields).toEqual(mockFormats.parentFields);
  });

  it('shows permission status correctly', async () => {
    await nextTick();
    
    const permissionCards = wrapper.findAll('.permission-item');
    expect(permissionCards).toHaveLength(2);
    
    const teacherPermission = permissionCards[0];
    expect(teacherPermission.find('.el-tag').text()).toContain('已授权');
    
    const parentPermission = permissionCards[1];
    expect(parentPermission.find('.el-tag').text()).toContain('已授权');
  });

  it('handles permission loading error', async () => {
    const request = require('@/utils/request').default;
    request.get.mockRejectedValueOnce(new Error('Permission error'));
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { ElMessage } = require('element-plus');
    
    await nextTick();
    
    expect(consoleSpy).toHaveBeenCalledWith('获取权限信息失败:', expect.any(Error));
    expect(ElMessage.error).toHaveBeenCalledWith('获取权限信息失败');
    
    consoleSpy.mockRestore();
  });

  it('auto-selects available type when current type has no permission', async () => {
    const request = require('@/utils/request').default;
    
    // Mock permissions where teacher is not allowed
    request.get.mockImplementationOnce((url) => {
      if (url === '/api/document-import/permissions') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              permissions: { teacher: false, parent: true },
              permissionInfo: { teacher: '无权限', parent: '可以导入家长数据' }
            }
          }
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    wrapper = mount(DocumentImport, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          'el-card': true,
          'el-tag': true,
          'el-radio-group': true,
          'el-radio': true,
          'el-input': true,
          'el-button': true
        }
      }
    });

    await nextTick();
    
    expect(wrapper.vm.selectedType).toBe('parent');
  });

  it('returns correct placeholder text based on selected type', async () => {
    await nextTick();
    
    expect(wrapper.vm.getPlaceholder()).toContain('教师数据');
    
    await wrapper.setData({ selectedType: 'parent' });
    expect(wrapper.vm.getPlaceholder()).toContain('家长数据');
  });

  it('returns correct table columns based on selected type', async () => {
    await nextTick();
    
    const teacherColumns = wrapper.vm.getTableColumns();
    expect(teacherColumns[0].prop).toBe('name');
    expect(teacherColumns[0].label).toBe('姓名');
    expect(teacherColumns[1].prop).toBe('email');
    expect(teacherColumns[1].label).toBe('邮箱');
    
    await wrapper.setData({ selectedType: 'parent' });
    const parentColumns = wrapper.vm.getTableColumns();
    expect(parentColumns[0].prop).toBe('name');
    expect(parentColumns[3].prop).toBe('relationship');
    expect(parentColumns[3].label).toBe('关系');
  });

  it('returns correct fields data based on selected type', async () => {
    await nextTick();
    
    expect(wrapper.vm.getFieldsData()).toEqual(mockFormats.teacherFields);
    
    await wrapper.setData({ selectedType: 'parent' });
    expect(wrapper.vm.getFieldsData()).toEqual(mockFormats.parentFields);
  });

  it('computes canPreview correctly', async () => {
    await nextTick();
    
    expect(wrapper.vm.canPreview).toBe(false); // No content
    
    await wrapper.setData({ documentContent: 'Some content' });
    expect(wrapper.vm.canPreview).toBe(true);
    
    await wrapper.setData({ selectedType: 'invalid' });
    expect(wrapper.vm.canPreview).toBe(false); // Invalid type
    
    await wrapper.setData({ selectedType: 'teacher' });
    await wrapper.setData({ permissions: { teacher: false, parent: false } });
    expect(wrapper.vm.canPreview).toBe(false); // No permission
  });

  it('computes canImport correctly', async () => {
    await nextTick();
    
    expect(wrapper.vm.canImport).toBe(false);
    
    // Set up for can import
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher',
      permissions: { teacher: true, parent: true },
      previewResult: { canImport: true }
    });
    
    expect(wrapper.vm.canImport).toBe(true);
  });

  it('handles preview request', async () => {
    await nextTick();
    
    await wrapper.setData({
      documentContent: '姓名: 张三\n邮箱: zhang@example.com',
      selectedType: 'teacher'
    });
    
    await wrapper.vm.handlePreview();
    
    const request = require('@/utils/request').default;
    expect(request.post).toHaveBeenCalledWith('/api/document-import/preview', {
      documentType: 'teacher',
      documentContent: '姓名: 张三\n邮箱: zhang@example.com'
    });
    
    expect(wrapper.vm.previewResult).toEqual({
      totalParsed: 2,
      validationErrors: [],
      parsedData: [
        { name: '张三', email: 'zhang@example.com', phone: '13800138000' },
        { name: '李四', email: 'li@example.com', phone: '13900139000' }
      ]
    });
    
    const { ElMessage } = require('element-plus');
    expect(ElMessage.success).toHaveBeenCalledWith('文档预览解析完成');
  });

  it('handles preview error', async () => {
    const request = require('@/utils/request').default;
    request.post.mockRejectedValueOnce(new Error('Preview error'));
    
    await nextTick();
    await wrapper.setData({
      documentContent: 'Invalid content',
      selectedType: 'teacher'
    });
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { ElMessage } = require('element-plus');
    
    await wrapper.vm.handlePreview();
    
    expect(consoleSpy).toHaveBeenCalledWith('预览解析失败:', expect.any(Error));
    expect(ElMessage.error).toHaveBeenCalledWith('预览解析失败');
    
    consoleSpy.mockRestore();
  });

  it('handles import request with confirmation', async () => {
    await nextTick();
    
    // Set up preview result
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher',
      previewResult: { canImport: true, totalParsed: 2 }
    });
    
    await wrapper.vm.handleImport();
    
    const { ElMessageBox } = require('element-plus');
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(
      expect.stringContaining('确认导入 2 条教师数据吗？'),
      '确认导入',
      expect.objectContaining({
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'warning'
      })
    );
    
    const request = require('@/utils/request').default;
    expect(request.post).toHaveBeenCalledWith('/api/document-import/import', {
      documentType: 'teacher',
      documentContent: 'Some content'
    });
    
    const { ElMessage } = require('element-plus');
    expect(ElMessage.success).toHaveBeenCalledWith('导入成功！导入 2 条数据');
  });

  it('handles import cancellation', async () => {
    const { ElMessageBox } = require('element-plus');
    ElMessageBox.confirm.mockRejectedValueOnce('cancel');
    
    await nextTick();
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher',
      previewResult: { canImport: true, totalParsed: 2 }
    });
    
    await wrapper.vm.handleImport();
    
    const request = require('@/utils/request').default;
    expect(request.post).not.toHaveBeenCalled();
  });

  it('clears content and preview after successful import', async () => {
    await nextTick();
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher',
      previewResult: { canImport: true, totalParsed: 2 }
    });
    
    await wrapper.vm.handleImport();
    
    expect(wrapper.vm.documentContent).toBe('');
    expect(wrapper.vm.previewResult).toBeNull();
  });

  it('resets preview when selected type changes', async () => {
    await nextTick();
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher',
      previewResult: { canImport: true }
    });
    
    await wrapper.setData({ selectedType: 'parent' });
    
    expect(wrapper.vm.previewResult).toBeNull();
    expect(wrapper.vm.documentContent).toBe('');
  });

  it('shows format help dialog', async () => {
    await nextTick();
    
    expect(wrapper.vm.showFormatHelp).toBe(false);
    
    await wrapper.setData({ showFormatHelp: true });
    
    expect(wrapper.vm.showFormatHelp).toBe(true);
    expect(wrapper.find('.el-dialog').exists()).toBe(true);
  });

  it('handles load history request', async () => {
    const request = require('@/utils/request').default;
    request.get.mockImplementationOnce((url) => {
      if (url === '/api/document-import/history') {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              history: [
                { id: 1, type: 'teacher', importedCount: 5, timestamp: '2024-01-01' }
              ]
            }
          }
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    await nextTick();
    await wrapper.setData({ showHistory: true });
    
    await wrapper.vm.loadHistory();
    
    expect(request.get).toHaveBeenCalledWith('/api/document-import/history');
    expect(wrapper.vm.historyList).toEqual([
      { id: 1, type: 'teacher', importedCount: 5, timestamp: '2024-01-01' }
    ]);
  });

  it('shows loading states during API calls', async () => {
    const request = require('@/utils/request').default;
    
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const testPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    request.post.mockReturnValueOnce(testPromise);

    await nextTick();
    await wrapper.setData({
      documentContent: 'Some content',
      selectedType: 'teacher'
    });

    // Start preview
    wrapper.vm.handlePreview();
    expect(wrapper.vm.previewLoading).toBe(true);

    // Resolve the promise
    resolvePromise({ data: { success: true, data: { totalParsed: 1 } } });
    await nextTick();

    expect(wrapper.vm.previewLoading).toBe(false);
  });
});