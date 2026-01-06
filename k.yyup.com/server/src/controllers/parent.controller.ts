import { Request, Response, NextFunction } from 'express';
import { ParentService } from '../services/parent/parent.service';

/**
 * 家长控制器
 * 实现对家长信息的增删改查
 */
export class ParentController {
  private parentService: ParentService;

  constructor() {
    this.parentService = new ParentService();
  }

  /**
   * 创建家长
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentData = req.body;
      const parent = await this.parentService.create(parentData);
      res.status(201).json({ data: parent, message: '家长创建成功' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 获取家长列表（支持分页和搜索）
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 获取查询参数
      const {
        page = 1,
        pageSize = 10,
        keyword,
        studentId,
        userId,
        relationship,
        isPrimaryContact,
        isLegalGuardian,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // 构建过滤参数
      const filters = {
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: keyword as string,
        studentId: studentId ? Number(studentId) : undefined,
        userId: userId ? Number(userId) : undefined,
        relationship: relationship as string,
        isPrimaryContact: isPrimaryContact !== undefined ? Number(isPrimaryContact) : undefined,
        isLegalGuardian: isLegalGuardian !== undefined ? Number(isLegalGuardian) : undefined,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string).toUpperCase() as 'ASC' | 'DESC'
      };

      // 使用新的分页方法
      const result = await this.parentService.list(filters);
      res.status(200).json({
        success: true,
        data: {
          list: result.rows,
          total: result.count,
          page: filters.page,
          pageSize: filters.pageSize
        },
        message: '获取家长列表成功'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 根据ID获取家长
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public detail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.id);
      const findOneParentData = await this.parentService.detail(parentId);

      res.status(200).json({ data: findOneParentData, message: '获取家长详情成功' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 更新家长信息
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.id);
      const parentData = req.body;
      const updateParentData = await this.parentService.update(parentId, parentData);

      res.status(200).json({ data: updateParentData, message: '更新成功' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 删除家长
   * @param req 请求对象
   * @param res 响应对象
   * @param next 下一个中间件
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parentId = Number(req.params.id);
      await this.parentService.delete(parentId);

      res.status(200).json({ message: '删除成功' });
    } catch (error) {
      next(error);
    }
  };
} 