import { Request, Response } from 'express';
import { Kindergarten } from '../models/kindergarten.model';
import { createKindergartenSchema, updateKindergartenSchema } from '../validations/kindergarten.validation';
import { validateRequest } from '../utils/validator';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { Op, WhereOptions, Transaction } from 'sequelize';
import { CreateKindergartenDto, UpdateKindergartenDto } from '../types';
import { sequelize } from '../config/database';

/**
 * 幼儿园控制器
 */
export class KindergartenController {
  /**
   * 创建幼儿园
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async create(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      // 验证请求数据
      const validatedData = await validateRequest<CreateKindergartenDto>(req.body, createKindergartenSchema);

      // 检查幼儿园编码是否已存在
      const existingKindergarten = await Kindergarten.findOne({
        where: { code: validatedData.code },
        transaction
      });

      if (existingKindergarten) {
        await transaction.rollback();
        throw ApiError.badRequest('幼儿园编码已存在', 'KINDERGARTEN_CODE_EXISTS');
      }

      // 创建幼儿园
      const kindergarten = await Kindergarten.create({
        ...validatedData,
        status: validatedData.status || 1
      }, { transaction });

      await transaction.commit();
      ApiResponse.success(res, kindergarten, '幼儿园创建成功');
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('创建幼儿园失败', 'KINDERGARTEN_CREATE_ERROR');
    }
  }

  /**
   * 获取幼儿园列表
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async list(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 10, keyword } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const where: WhereOptions<Kindergarten> = keyword ? {
        [Op.or]: [
          { name: { [Op.like]: `%${String(keyword)}%` } },
          { code: { [Op.like]: `%${String(keyword)}%` } }
        ]
      } : {};

      const { count, rows } = await Kindergarten.findAndCountAll({
        where,
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.success(res, {
        total: count,
        items: rows,
        page: Number(page),
        pageSize: Number(pageSize)
      }, '获取幼儿园列表成功');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取幼儿园列表失败', 'KINDERGARTEN_LIST_ERROR');
    }
  }

  /**
   * 获取幼儿园详情
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      const kindergarten = await Kindergarten.findByPk(id);

      if (!kindergarten) {
        throw ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      ApiResponse.success(res, kindergarten, '获取幼儿园详情成功');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('获取幼儿园详情失败', 'KINDERGARTEN_DETAIL_ERROR');
    }
  }

  /**
   * 更新幼儿园信息
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async update(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        await transaction.rollback();
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      const validatedData = await validateRequest<UpdateKindergartenDto>(req.body, updateKindergartenSchema);

      const kindergarten = await Kindergarten.findByPk(id, { transaction });
      if (!kindergarten) {
        await transaction.rollback();
        throw ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      // 如果更新编码，检查是否与其他幼儿园重复
      if (validatedData.code && validatedData.code !== kindergarten.code) {
        const existingKindergarten = await Kindergarten.findOne({
          where: {
            code: validatedData.code,
            id: { [Op.ne]: id }
          },
          transaction
        });

        if (existingKindergarten) {
          await transaction.rollback();
          throw ApiError.badRequest('幼儿园编码已存在', 'KINDERGARTEN_CODE_EXISTS');
        }
      }

      await kindergarten.update(validatedData, { transaction });

      await transaction.commit();
      ApiResponse.success(res, kindergarten, '更新幼儿园成功');
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('更新幼儿园失败', 'KINDERGARTEN_UPDATE_ERROR');
    }
  }

  /**
   * 删除幼儿园
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async delete(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        await transaction.rollback();
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      const kindergarten = await Kindergarten.findByPk(id, { transaction });
      if (!kindergarten) {
        await transaction.rollback();
        throw ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      await kindergarten.destroy({ transaction });

      await transaction.commit();
      ApiResponse.success(res, { message: '删除幼儿园成功' });
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('删除幼儿园失败', 'KINDERGARTEN_DELETE_ERROR');
    }
  }
}

export default KindergartenController; 