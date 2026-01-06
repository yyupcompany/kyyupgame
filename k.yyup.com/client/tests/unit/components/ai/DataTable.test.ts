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
import DataTable from '@/components/ai/DataTable.vue';

describe('DataTable.vue', () => {
  let wrapper;

  const mockData = [
    { id: 1, name: 'John Doe', age: 30, salary: 50000, joinDate: '2024-01-01', active: true },
    { id: 2, name: 'Jane Smith', age: 25, salary: 60000, joinDate: '2024-02-01', active: false },
    { id: 3, name: 'Bob Johnson', age: 35, salary: 70000, joinDate: '2024-03-01', active: true }
  ];

  const mockColumns = [
    { key: 'name', title: '姓名', sortable: true },
    { key: 'age', title: '年龄', sortable: true, type: 'numeric' },
    { key: 'salary', title: '薪资', type: 'currency' },
    { key: 'joinDate', title: '入职日期', type: 'date' },
    { key: 'active', title: '状态', type: 'boolean' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document.createElement and its methods
    global.document.createElement = vi.fn(() => ({
      setAttribute: vi.fn(),
      style: { visibility: 'hidden' },
      click: vi.fn(),
      href: ''
    }));
    
    global.document.body = {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    };
  });

  it('renders properly with basic props', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        title: '员工列表'
      }
    });

    expect(wrapper.find('.ai-data-table').exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('员工列表');
    expect(wrapper.find('.table-header').exists()).toBe(true);
    expect(wrapper.find('.table-container').exists()).toBe(true);
  });

  it('displays table headers correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const headers = wrapper.findAll('th');
    expect(headers).toHaveLength(mockColumns.length);
    
    mockColumns.forEach((column, index) => {
      expect(headers[index].text()).toContain(column.title);
    });
  });

  it('displays table rows correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(mockData.length);
  });

  it('handles empty data state', () => {
    wrapper = mount(DataTable, {
      props: {
        data: [],
        columns: mockColumns
      }
    });

    expect(wrapper.find('.empty-table').exists()).toBe(true);
    expect(wrapper.find('.empty-table').text()).toBe('暂无数据');
  });

  it('filters data based on search query', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        searchable: true
      }
    });

    // Set search query
    await wrapper.setData({ searchQuery: 'John' });

    const filteredData = wrapper.vm.displayData;
    expect(filteredData).toHaveLength(1);
    expect(filteredData[0].name).toBe('John Doe');
  });

  it('sorts data by column', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    // Sort by name ascending
    await wrapper.vm.sortBy('name');
    expect(wrapper.vm.sortedColumn).toBe('name');
    expect(wrapper.vm.sortDirection).toBe('asc');

    let sortedData = wrapper.vm.displayData;
    expect(sortedData[0].name).toBe('Bob Johnson');
    expect(sortedData[1].name).toBe('Jane Smith');
    expect(sortedData[2].name).toBe('John Doe');

    // Sort by name descending
    await wrapper.vm.sortBy('name');
    expect(wrapper.vm.sortDirection).toBe('desc');

    sortedData = wrapper.vm.displayData;
    expect(sortedData[0].name).toBe('John Doe');
    expect(sortedData[1].name).toBe('Jane Smith');
    expect(sortedData[2].name).toBe('Bob Johnson');
  });

  it('handles pagination correctly', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        pageSize: 2
      }
    });

    expect(wrapper.vm.displayData).toHaveLength(2);
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.totalPages).toBe(2);

    // Change to second page
    await wrapper.vm.changePage(2);
    expect(wrapper.vm.currentPage).toBe(2);
    expect(wrapper.vm.displayData).toHaveLength(1);
  });

  it('formats date columns correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const formatDate = wrapper.vm.formatDate;
    expect(formatDate('2024-01-01')).toBe('2024-01-01');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });

  it('formats currency columns correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const formatCurrency = wrapper.vm.formatCurrency;
    expect(formatCurrency(50000)).toBe('¥50,000.00');
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });

  it('displays boolean values correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const booleanCells = wrapper.findAll('.boolean-value');
    expect(booleanCells).toHaveLength(mockData.length);
    
    // Check that boolean values are rendered correctly
    const trueCell = booleanCells[0];
    const falseCell = booleanCells[1];
    
    expect(trueCell.classes()).toContain('boolean-true');
    expect(trueCell.text()).toBe('是');
    
    expect(falseCell.classes()).toContain('boolean-false');
    expect(falseCell.text()).toBe('否');
  });

  it('identifies numeric values correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const isNumeric = wrapper.vm.isNumeric;
    expect(isNumeric(30)).toBe(true);
    expect(isNumeric('30')).toBe(true);
    expect(isNumeric('not a number')).toBe(false);
    expect(isNumeric(null)).toBe(false);
    expect(isNumeric(undefined)).toBe(false);
  });

  it('identifies date values correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const isDate = wrapper.vm.isDate;
    expect(isDate('2024-01-01')).toBe(true);
    expect(isDate(new Date())).toBe(true);
    expect(isDate('invalid-date')).toBe(false);
    expect(isDate(null)).toBe(false);
  });

  it('gets status labels correctly', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const getStatusLabel = wrapper.vm.getStatusLabel;
    expect(getStatusLabel('success')).toBe('成功');
    expect(getStatusLabel('warning')).toBe('警告');
    expect(getStatusLabel('danger')).toBe('危险');
    expect(getStatusLabel('info')).toBe('信息');
    expect(getStatusLabel('unknown')).toBe('unknown');
  });

  it('exports data to CSV', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        exportable: true
      }
    });

    const mockBlob = new Blob(['test'], { type: 'text/csv;charset=utf-8;' });
    global.URL.createObjectURL.mockReturnValue('blob:test-url');

    await wrapper.vm.exportData();

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.document.createElement).toHaveBeenCalledWith('a');
    expect(global.document.body.appendChild).toHaveBeenCalled();
  });

  it('handles column render functions', () => {
    const columnsWithRender = [
      ...mockColumns,
      {
        key: 'name',
        title: '姓名（自定义）',
        render: vi.fn((value, row) => `<strong>${value}</strong> (${row.age}岁)`)
      }
    ];

    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: columnsWithRender
      }
    });

    // The render function should be called for each row
    expect(columnsWithRender[5].render).toHaveBeenCalledTimes(mockData.length);
  });

  it('shows sortable column icons', () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    const sortableHeaders = wrapper.findAll('th.sortable');
    expect(sortableHeaders).toHaveLength(2); // name and age columns are sortable

    sortableHeaders.forEach(header => {
      expect(header.find('.sort-icon').exists()).toBe(true);
    });
  });

  it('shows sorted column indicators', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns
      }
    });

    // Sort by name
    await wrapper.vm.sortBy('name');

    const nameHeader = wrapper.findAll('th')[0];
    expect(nameHeader.classes()).toContain('sorted-asc');

    // Sort again to change direction
    await wrapper.vm.sortBy('name');
    expect(nameHeader.classes()).toContain('sorted-desc');
  });

  it('resets pagination when data changes', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        pageSize: 2
      }
    });

    // Go to second page
    await wrapper.vm.changePage(2);
    expect(wrapper.vm.currentPage).toBe(2);

    // Change data (simulating data refresh)
    await wrapper.setProps({
      data: [...mockData]
    });

    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('handles non-array data gracefully', () => {
    wrapper = mount(DataTable, {
      props: {
        data: null,
        columns: mockColumns
      }
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    expect(wrapper.vm.filteredData).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('DataTable props.data is not an array:', null);
    
    consoleSpy.mockRestore();
  });

  it('validates currentPage to prevent invalid values', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        pageSize: 2
      }
    });

    // Try to set invalid page numbers
    await wrapper.setData({ currentPage: 0 });
    expect(wrapper.vm.currentPage).toBe(1);

    await wrapper.setData({ currentPage: -1 });
    expect(wrapper.vm.currentPage).toBe(1);

    await wrapper.setData({ currentPage: null });
    expect(wrapper.vm.currentPage).toBe(1);
  });

  it('prevents navigation to invalid pages', async () => {
    wrapper = mount(DataTable, {
      props: {
        data: mockData,
        columns: mockColumns,
        pagination: true,
        pageSize: 2
      }
    });

    // Try to navigate to invalid pages
    await wrapper.vm.changePage(0);
    expect(wrapper.vm.currentPage).toBe(1);

    await wrapper.vm.changePage(3); // Only 2 pages exist
    expect(wrapper.vm.currentPage).toBe(2);
  });
});