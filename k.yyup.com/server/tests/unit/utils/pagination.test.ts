/**
 * 分页工具函数测试
 */
import { paginate, PaginationOptions, PaginationResult } from '../../../src/utils/pagination';
import { vi } from 'vitest'
import { Model, ModelStatic, FindOptions } from 'sequelize';

// Mock Sequelize Model
const mockModel = {
  findAndCountAll: jest.fn()
} as unknown as ModelStatic<Model>;


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

describe('Pagination Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('paginate', () => {
    it('应该返回正确的分页结果', async () => {
      const mockData = {
        count: 25,
        rows: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' }
        ]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 25,
        items: mockData.rows,
        totalPages: 3,
        currentPage: 1,
        pageSize: 10,
        hasNext: true,
        hasPrevious: false
      });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0
      });
    });

    it('应该处理默认分页参数', async () => {
      const mockData = {
        count: 5,
        rows: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {};

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 5,
        items: mockData.rows,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false
      });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0
      });
    });

    it('应该处理第二页的分页', async () => {
      const mockData = {
        count: 25,
        rows: [
          { id: 11, name: 'Item 11' },
          { id: 12, name: 'Item 12' }
        ]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 2,
        limit: 10
      };

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 25,
        items: mockData.rows,
        totalPages: 3,
        currentPage: 2,
        pageSize: 10,
        hasNext: true,
        hasPrevious: true
      });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        offset: 10
      });
    });

    it('应该处理最后一页的分页', async () => {
      const mockData = {
        count: 25,
        rows: [
          { id: 21, name: 'Item 21' },
          { id: 22, name: 'Item 22' },
          { id: 23, name: 'Item 23' },
          { id: 24, name: 'Item 24' },
          { id: 25, name: 'Item 25' }
        ]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 3,
        limit: 10
      };

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 25,
        items: mockData.rows,
        totalPages: 3,
        currentPage: 3,
        pageSize: 10,
        hasNext: false,
        hasPrevious: true
      });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        page: 3,
        limit: 10,
        offset: 20
      });
    });

    it('应该处理空结果', async () => {
      const mockData = {
        count: 0,
        rows: []
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 0,
        items: [],
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false
      });
    });

    it('应该处理单页结果', async () => {
      const mockData = {
        count: 5,
        rows: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
          { id: 5, name: 'Item 5' }
        ]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const result = await paginate(mockModel, options);

      expect(result).toEqual({
        totalItems: 5,
        items: mockData.rows,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false
      });
    });

    it('应该传递额外的查询选项', async () => {
      const mockData = {
        count: 10,
        rows: [{ id: 1, name: 'Item 1' }]
      };

      (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

      const options: PaginationOptions = {
        page: 1,
        limit: 5,
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        include: ['user']
      };

      await paginate(mockModel, options);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        offset: 0,
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        include: ['user']
      });
    });

    describe('边界情况处理', () => {
      it('应该处理负数页码', async () => {
        const mockData = {
          count: 25,
          rows: [{ id: 1, name: 'Item 1' }]
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: -1,
          limit: 10
        };

        const result = await paginate(mockModel, options);

        expect(result.currentPage).toBe(1);
        expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
          page: -1,
          limit: 10,
          offset: 0
        });
      });

      it('应该处理零页码', async () => {
        const mockData = {
          count: 25,
          rows: [{ id: 1, name: 'Item 1' }]
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: 0,
          limit: 10
        };

        const result = await paginate(mockModel, options);

        expect(result.currentPage).toBe(1);
        expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
          page: 0,
          limit: 10,
          offset: 0
        });
      });

      it('应该处理负数限制', async () => {
        const mockData = {
          count: 25,
          rows: [{ id: 1, name: 'Item 1' }]
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: 1,
          limit: -5
        };

        const result = await paginate(mockModel, options);

        expect(result.pageSize).toBe(1);
        expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
          page: 1,
          limit: 1,
          offset: 0
        });
      });

      it('应该处理零限制', async () => {
        const mockData = {
          count: 25,
          rows: [{ id: 1, name: 'Item 1' }]
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: 1,
          limit: 0
        };

        const result = await paginate(mockModel, options);

        expect(result.pageSize).toBe(1);
      });

      it('应该限制最大页面大小', async () => {
        const mockData = {
          count: 25,
          rows: [{ id: 1, name: 'Item 1' }]
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: 1,
          limit: 200 // 超过最大限制100
        };

        const result = await paginate(mockModel, options);

        expect(result.pageSize).toBe(100);
        expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
          page: 1,
          limit: 100,
          offset: 0
        });
      });

      it('应该处理超出范围的页码', async () => {
        const mockData = {
          count: 25,
          rows: []
        };

        (mockModel.findAndCountAll as jest.Mock).mockResolvedValue(mockData);

        const options: PaginationOptions = {
          page: 10, // 超出实际页数
          limit: 10
        };

        const result = await paginate(mockModel, options);

        expect(result.currentPage).toBe(10);
        expect(result.hasNext).toBe(false);
        expect(result.hasPrevious).toBe(true);
        expect(result.items).toEqual([]);
      });
    });

    it('应该处理数据库错误', async () => {
      const error = new Error('Database connection error');
      (mockModel.findAndCountAll as jest.Mock).mockRejectedValue(error);

      const options: PaginationOptions = {
        page: 1,
        limit: 10
      };

      await expect(paginate(mockModel, options)).rejects.toThrow('Database connection error');
    });
  });
});
