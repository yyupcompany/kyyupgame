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
import DraggableTable from '@/components/ai/DraggableTable.vue';

// Mock the ai store
vi.mock('@/stores/ai', () => ({
  useAiStore: () => ({
    tableData: [
      { id: 1, name: 'Item 1', value: 100, category: 'A', status: 'active' },
      { id: 2, name: 'Item 2', value: 200, category: 'B', status: 'inactive' },
      { id: 3, name: 'Item 3', value: 150, category: 'A', status: 'active' }
    ],
    tableConfig: {
      columns: [
        { key: 'name', label: 'Name', sortable: true, filterable: true },
        { key: 'value', label: 'Value', sortable: true, filterable: true },
        { key: 'category', label: 'Category', sortable: true, filterable: true },
        { key: 'status', label: 'Status', sortable: true, filterable: true }
      ],
      draggable: true,
      selectable: true,
      editable: true,
      deletable: true
    },
    updateTableData: vi.fn(),
    updateTableConfig: vi.fn(),
    sortTable: vi.fn(),
    filterTable: vi.fn(),
    searchTable: vi.fn(),
    deleteTableRow: vi.fn(),
    addTableRow: vi.fn(),
    editTableRow: vi.fn(),
    moveTableRow: vi.fn()
  }
}));

describe('DraggableTable.vue', () => {
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
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.draggable-table').exists()).toBe(true);
    expect(wrapper.find('.table-header').exists()).toBe(true);
    expect(wrapper.find('.table-body').exists()).toBe(true);
  });

  it('displays table headers correctly', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const headers = wrapper.findAll('.table-header th');
    expect(headers.length).toBe(4);
    expect(headers[0].text()).toBe('Name');
    expect(headers[1].text()).toBe('Value');
    expect(headers[2].text()).toBe('Category');
    expect(headers[3].text()).toBe('Status');
  });

  it('displays table rows correctly', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const rows = wrapper.findAll('.table-body tr');
    expect(rows.length).toBe(3);
    
    const firstRowCells = rows[0].findAll('td');
    expect(firstRowCells[0].text()).toBe('Item 1');
    expect(firstRowCells[1].text()).toBe('100');
    expect(firstRowCells[2].text()).toBe('A');
    expect(firstRowCells[3].text()).toBe('active');
  });

  it('disables row selection when selectable is false', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: false
      }
    });

    const checkboxes = wrapper.findAll('.row-checkbox');
    expect(checkboxes.length).toBe(0);
  });

  it('enables row selection when selectable is true', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: true
      }
    });

    const checkboxes = wrapper.findAll('.row-checkbox');
    expect(checkboxes.length).toBe(3);
  });

  it('handles row selection', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: true
      }
    });

    const checkbox = wrapper.find('.row-checkbox');
    await checkbox.setChecked(true);

    expect(wrapper.vm.selectedRows).toContain(1);
  });

  it('handles select all rows', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: true
      }
    });

    const selectAllCheckbox = wrapper.find('.select-all-checkbox');
    await selectAllCheckbox.setChecked(true);

    expect(wrapper.vm.selectedRows).toEqual([1, 2, 3]);
  });

  it('handles header sorting click', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const sortTableSpy = vi.fn();
    wrapper.vm.sortTable = sortTableSpy;

    const nameHeader = wrapper.find('.sort-header');
    await nameHeader.trigger('click');

    expect(sortTableSpy).toHaveBeenCalledWith('name');
  });

  it('displays sort indicators', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ sortBy: 'name', sortOrder: 'asc' });

    const sortIndicator = wrapper.find('.sort-indicator');
    expect(sortIndicator.exists()).toBe(true);
    expect(sortIndicator.classes()).toContain('asc');
  });

  it('handles filter input', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const filterTableSpy = vi.fn();
    wrapper.vm.filterTable = filterTableSpy;

    const filterInput = wrapper.find('.filter-input');
    await filterInput.setValue('test');

    expect(filterTableSpy).toHaveBeenCalledWith('test');
  });

  it('handles search input', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const searchTableSpy = vi.fn();
    wrapper.vm.searchTable = searchTableSpy;

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('Item 1');

    expect(searchTableSpy).toHaveBeenCalledWith('Item 1');
  });

  it('handles row deletion', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        deletable: true
      }
    });

    const deleteTableRowSpy = vi.fn();
    wrapper.vm.deleteTableRow = deleteTableRowSpy;

    const deleteButton = wrapper.find('.delete-row-button');
    await deleteButton.trigger('click');

    expect(deleteTableRowSpy).toHaveBeenCalledWith(1);
  });

  it('handles row editing', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        editable: true
      }
    });

    const editTableRowSpy = vi.fn();
    wrapper.vm.editTableRow = editTableRowSpy;

    const editButton = wrapper.find('.edit-row-button');
    await editButton.trigger('click');

    expect(editTableRowSpy).toHaveBeenCalledWith(1);
  });

  it('handles row addition', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        editable: true
      }
    });

    const addTableRowSpy = vi.fn();
    wrapper.vm.addTableRow = addTableRowSpy;

    const addButton = wrapper.find('.add-row-button');
    await addButton.trigger('click');

    expect(addTableRowSpy).toHaveBeenCalled();
  });

  it('handles drag start', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    const row = wrapper.find('.draggable-row');
    await row.trigger('dragstart');

    expect(wrapper.vm.draggedRow).toBe(1);
  });

  it('handles drag over', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    const row = wrapper.find('.draggable-row');
    await row.trigger('dragover');

    expect(wrapper.vm.dragOverRow).toBe(1);
  });

  it('handles drop', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    const moveTableRowSpy = vi.fn();
    wrapper.vm.moveTableRow = moveTableRowSpy;

    await wrapper.setData({ draggedRow: 1, dragOverRow: 2 });

    const row = wrapper.find('.draggable-row');
    await row.trigger('drop');

    expect(moveTableRowSpy).toHaveBeenCalledWith(1, 2);
  });

  it('handles drag end', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    await wrapper.setData({ draggedRow: 1, dragOverRow: 2 });

    const row = wrapper.find('.draggable-row');
    await row.trigger('dragend');

    expect(wrapper.vm.draggedRow).toBeNull();
    expect(wrapper.vm.dragOverRow).toBeNull();
  });

  it('disables dragging when draggable is false', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: false
      }
    });

    const rows = wrapper.findAll('.draggable-row');
    expect(rows.length).toBe(0);
  });

  it('enables dragging when draggable is true', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    const rows = wrapper.findAll('.draggable-row');
    expect(rows.length).toBe(3);
  });

  it('displays drag handles', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        draggable: true
      }
    });

    const dragHandles = wrapper.findAll('.drag-handle');
    expect(dragHandles.length).toBe(3);
  });

  it('handles column resizing', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const resizeHandle = wrapper.find('.resize-handle');
    await resizeHandle.trigger('mousedown');

    expect(wrapper.vm.isResizing).toBe(true);
  });

  it('handles column visibility toggle', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const columnToggle = wrapper.find('.column-toggle');
    await columnToggle.trigger('click');

    expect(wrapper.vm.showColumnMenu).toBe(true);
  });

  it('handles column reordering', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const moveColumnSpy = vi.fn();
    wrapper.vm.moveColumn = moveColumnSpy;

    const header = wrapper.find('.table-header th');
    await header.trigger('dragstart');

    expect(moveColumnSpy).toHaveBeenCalled();
  });

  it('displays row actions on hover', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        editable: true,
        deletable: true
      }
    });

    const row = wrapper.find('.table-body tr');
    await row.trigger('mouseenter');

    expect(wrapper.find('.row-actions').exists()).toBe(true);
  });

  it('hides row actions on mouse leave', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        editable: true,
        deletable: true
      }
    });

    const row = wrapper.find('.table-body tr');
    await row.trigger('mouseenter');
    await row.trigger('mouseleave');

    expect(wrapper.find('.row-actions').exists()).toBe(false);
  });

  it('handles bulk actions', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: true,
        editable: true,
        deletable: true
      }
    });

    await wrapper.setData({ selectedRows: [1, 2] });

    const bulkDeleteButton = wrapper.find('.bulk-delete-button');
    expect(bulkDeleteButton.exists()).toBe(true);

    const bulkEditButton = wrapper.find('.bulk-edit-button');
    expect(bulkEditButton.exists()).toBe(true);
  });

  it('handles bulk delete', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      },
      props: {
        selectable: true,
        deletable: true
      }
    });

    const bulkDeleteSpy = vi.fn();
    wrapper.vm.bulkDeleteRows = bulkDeleteSpy;

    await wrapper.setData({ selectedRows: [1, 2] });

    const bulkDeleteButton = wrapper.find('.bulk-delete-button');
    await bulkDeleteButton.trigger('click');

    expect(bulkDeleteSpy).toHaveBeenCalledWith([1, 2]);
  });

  it('handles pagination', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const pagination = wrapper.find('.table-pagination');
    expect(pagination.exists()).toBe(true);

    const pageButton = wrapper.find('.page-button');
    await pageButton.trigger('click');

    expect(wrapper.vm.currentPage).toBe(2);
  });

  it('displays table summary', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const summary = wrapper.find('.table-summary');
    expect(summary.exists()).toBe(true);
    expect(summary.text()).toContain('3');
  });

  it('handles export functionality', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const exportTableSpy = vi.fn();
    wrapper.vm.exportTable = exportTableSpy;

    const exportButton = wrapper.find('.export-button');
    await exportButton.trigger('click');

    expect(exportTableSpy).toHaveBeenCalled();
  });

  it('handles import functionality', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    const importTableSpy = vi.fn();
    wrapper.vm.importTable = importTableSpy;

    const importButton = wrapper.find('.import-button');
    await importButton.trigger('click');

    expect(importTableSpy).toHaveBeenCalled();
  });

  it('displays loading state', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ isLoading: true });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('displays empty state when no data', async () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    await wrapper.setData({ tableData: [] });

    expect(wrapper.find('.empty-state').exists()).toBe(true);
    expect(wrapper.find('.empty-state').text()).toContain('暂无数据');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(DraggableTable).exists()).toBe(true);
  });

  it('has correct component structure', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.find('.draggable-table').exists()).toBe(true);
    expect(wrapper.find('.table-header').exists()).toBe(true);
    expect(wrapper.find('.table-body').exists()).toBe(true);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(DraggableTable, {
      global: {
        plugins: [router, pinia]
      }
    });

    expect(wrapper.classes()).toContain('draggable-table');
  });
});