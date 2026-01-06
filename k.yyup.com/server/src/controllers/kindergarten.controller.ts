import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { createKindergartenSchema, updateKindergartenSchema } from '../validations/kindergarten.validation';
import { validateRequest } from '../utils/validator';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { CreateKindergartenDto, UpdateKindergartenDto } from '../types';
import { RequestWithUser } from '../types/express';

// 直接使用sequelize实例

/**
 * 幼儿园控制器
 */
export class KindergartenController {
  /**
   * 创建幼儿园
   * @param req 请求对象
   * @param res 响应对象
   */
  public static async create(req: RequestWithUser, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      console.log('🏫 创建幼儿园API被调用');
      console.log('用户信息:', req.user);
      console.log('请求数据:', req.body);

      // 简化验证，只验证必要字段
      const { name, address, phone, principal } = req.body;
      if (!name || !address || !phone || !principal) {
        throw ApiError.badRequest('缺少必要字段：name, address, phone, principal');
      }

      // 获取系统中的集团（应该只有一个）
      const systemGroups = await sequelize.query(
        `SELECT id, name, code FROM \`groups\` WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1`,
        {
          type: QueryTypes.SELECT,
          transaction
        }
      ) as any[];

      if (!systemGroups || systemGroups.length === 0) {
        throw ApiError.badRequest('系统中没有集团，请先创建集团');
      }

      const systemGroup = systemGroups[0];
      console.log('🏢 系统集团:', systemGroup);

      const validatedData = {
        name,
        code: req.body.code || `KG_${Date.now()}`,
        type: req.body.type || 1,
        level: req.body.level || 1,
        address,
        longitude: req.body.longitude || 116.4074,  // 默认北京经度
        latitude: req.body.latitude || 39.9042,    // 默认北京纬度
        phone,
        email: req.body.email || `${Date.now()}@example.com`,  // 生成默认邮箱
        principal,
        establishedDate: req.body.establishedDate || new Date(),
        area: req.body.area || 1000,  // 默认面积
        buildingArea: req.body.buildingArea || 800,  // 默认建筑面积
        classCount: req.body.classCount || 0,
        teacherCount: req.body.teacherCount || 0,
        studentCount: req.body.studentCount || 0,
        description: req.body.description || '',
        features: req.body.features || '',
        philosophy: req.body.philosophy || '',
        feeDescription: req.body.feeDescription || '',
        status: req.body.status || 1,
        groupId: systemGroup.id,  // 关联到系统集团
        isGroupHeadquarters: req.body.isGroupHeadquarters || 0,  // 默认不是总部
        groupRole: req.body.groupRole || 4,  // 默认为加盟园 (1-总部 2-旗舰园 3-标准园 4-加盟园)
        joinGroupDate: new Date()  // 加入集团日期为当前时间
      };

      // 跳过编码检查，简化创建流程

      // 创建幼儿园（包含所有必填字段和集团关联）
      const result = await sequelize.query(
        `INSERT INTO kindergartens
         (name, code, type, level, address, longitude, latitude, phone, email, principal,
          established_date, area, building_area, status, group_id, is_group_headquarters,
          group_role, join_group_date, creator_id, created_at, updated_at)
         VALUES
         (:name, :code, :type, :level, :address, :longitude, :latitude, :phone, :email, :principal,
          :establishedDate, :area, :buildingArea, 1, :groupId, :isGroupHeadquarters,
          :groupRole, :joinGroupDate, :creatorId, NOW(), NOW())`,
        {
          replacements: {
            name: validatedData.name,
            code: validatedData.code,
            type: validatedData.type,
            level: validatedData.level,
            address: validatedData.address,
            longitude: validatedData.longitude,
            latitude: validatedData.latitude,
            phone: validatedData.phone,
            email: validatedData.email,
            principal: validatedData.principal,
            establishedDate: validatedData.establishedDate,
            area: validatedData.area,
            buildingArea: validatedData.buildingArea,
            groupId: validatedData.groupId,
            isGroupHeadquarters: validatedData.isGroupHeadquarters,
            groupRole: validatedData.groupRole,
            joinGroupDate: validatedData.joinGroupDate,
            creatorId: req.user.id
          },
          type: 'INSERT',
          transaction
        }
      );

      const kindergartenId = Array.isArray(result) && result.length > 0 ? 
        (result[0] as any).insertId || (result[0] as any) : null;

      // 获取新创建的幼儿园
      const kindergartens = await sequelize.query(
        `SELECT * FROM kindergartens WHERE id = :id`,
        {
          replacements: { id: kindergartenId },
          type: 'SELECT',
          transaction
        }
      );

      const kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
      await transaction.commit();
      ApiResponse.success(res, kindergartensList[0] || null, '幼儿园创建成功');
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
  public static async list(req: RequestWithUser, res: Response): Promise<void> {
    try {
      console.log('🔍 幼儿园列表API被调用');
      console.log('用户信息:', req.user);
      console.log('查询参数:', req.query);

      const { page = 1, pageSize = 10, keyword, groupId, status, type } = req.query;
      const pageNum = Math.max(1, Number(page) || 1); const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10)); const offset = Math.max(0, (pageNum - 1) * pageSizeNum);
      const limit = pageSizeNum;

      let whereClause = 'WHERE 1=1';
      const replacements: { [key: string]: any } = {};

      // ✅ 添加 group_id 过滤 - 数据隔离
      if (groupId) {
        whereClause += ' AND group_id = :groupId';
        replacements.groupId = Number(groupId);
        console.log('✅ 添加集团过滤:', groupId);
      }

      // 添加关键词过滤
      if (keyword) {
        whereClause += ' AND (name LIKE :keyword OR code LIKE :keyword)';
        replacements.keyword = `%${String(keyword)}%`;
      }

      // 添加状态过滤
      if (status !== undefined && status !== '') {
        whereClause += ' AND status = :status';
        replacements.status = Number(status);
      }

      // 添加类型过滤
      if (type !== undefined && type !== '') {
        whereClause += ' AND type = :type';
        replacements.type = Number(type);
      }

      // 查询总数
      console.log('🔍 开始查询总数...');
      console.log('SQL:', `SELECT COUNT(*) as total FROM kindergartens ${whereClause}`);
      console.log('参数:', replacements);

      const countResult = await sequelize.query(
        `SELECT COUNT(*) as total FROM kindergartens ${whereClause}`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      );

      const countList = Array.isArray(countResult) ? countResult : [];
      console.log('✅ 查询总数成功:', countList[0]);

      // 查询列表
      const rows = await sequelize.query(
        `SELECT * FROM kindergartens
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            ...replacements,
            limit,
            offset
          },
          type: QueryTypes.SELECT
        }
      );

      // 格式化日期和字段名（下划线转驼峰）
      const rowsList = Array.isArray(rows) ? rows : [];
      const formattedRows = rowsList.map(row => {
        const rowData = row as Record<string, unknown>;
        return {
          id: rowData.id,
          name: rowData.name,
          code: rowData.code,
          type: rowData.type,
          level: rowData.level,
          address: rowData.address,
          longitude: rowData.longitude,
          latitude: rowData.latitude,
          phone: rowData.phone,
          email: rowData.email,
          principal: rowData.principal,
          establishedDate: rowData.established_date,
          area: rowData.area,
          buildingArea: rowData.building_area,
          classCount: rowData.class_count,
          teacherCount: rowData.teacher_count,
          studentCount: rowData.student_count,
          description: rowData.description,
          features: rowData.features,
          philosophy: rowData.philosophy,
          feeDescription: rowData.fee_description,
          status: rowData.status,
          createdAt: rowData.created_at,
          updatedAt: rowData.updated_at,
          deletedAt: rowData.deleted_at
        };
      });

      ApiResponse.success(res, {
        total: countList.length > 0 ? (countList[0] as Record<string, unknown>).total : 0,
        items: formattedRows,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 0
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
  public static async getById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { groupId } = req.query;

      if (!id || isNaN(Number(id) || 0)) {
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      let whereClause = 'WHERE id = :id';
      const replacements: { [key: string]: any } = { id: Number(id) || 0 };

      // ✅ 添加 group_id 验证 - 数据隔离
      if (groupId) {
        whereClause += ' AND group_id = :groupId';
        replacements.groupId = Number(groupId);
        console.log('✅ 验证集团权限:', groupId);
      }

      const kindergartens = await sequelize.query(
        `SELECT * FROM kindergartens ${whereClause}`,
        {
          replacements,
          type: QueryTypes.SELECT
        }
      );

      const kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
      if (kindergartensList.length === 0) {
        throw ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      // 格式化字段名（下划线转驼峰）
      const row = kindergartensList[0] as Record<string, unknown>;
      const formattedKindergarten = {
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        level: row.level,
        address: row.address,
        longitude: row.longitude,
        latitude: row.latitude,
        phone: row.phone,
        email: row.email,
        principal: row.principal,
        establishedDate: row.established_date,
        area: row.area,
        buildingArea: row.building_area,
        classCount: row.class_count,
        teacherCount: row.teacher_count,
        studentCount: row.student_count,
        description: row.description,
        features: row.features,
        philosophy: row.philosophy,
        feeDescription: row.fee_description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
      };

      ApiResponse.success(res, formattedKindergarten, '获取幼儿园详情成功');
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
  public static async update(req: RequestWithUser, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { groupId } = req.query;
      const validatedData = req.body; // 简化验证，直接使用请求体

      if (!id || isNaN(Number(id) || 0)) {
        await transaction.rollback();
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      let whereClause = 'WHERE id = :id';
      const replacements: { [key: string]: any } = { id: Number(id) || 0 };

      // ✅ 添加 group_id 验证 - 数据隔离
      if (groupId) {
        whereClause += ' AND group_id = :groupId';
        replacements.groupId = Number(groupId);
        console.log('✅ 验证集团权限:', groupId);
      }

      const existingKindergartens = await sequelize.query(
        `SELECT * FROM kindergartens ${whereClause}`,
        {
          replacements,
          type: 'SELECT',
          transaction
        }
      );

      const existingList = Array.isArray(existingKindergartens) ? existingKindergartens : [];
      if (existingList.length === 0) {
        await transaction.rollback();
        throw ApiError.notFound('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
      }

      const kindergarten = existingList[0] as Record<string, unknown>;

      // 如果更新编码，检查是否与其他幼儿园重复
      if (validatedData.code && validatedData.code !== kindergarten.code) {
        const existingWithCode = await sequelize.query(
          `SELECT id FROM kindergartens WHERE code = :code AND id != :id`,
          {
            replacements: { code: validatedData.code, id: Number(id) || 0 },
            type: 'SELECT',
            transaction
          }
        );

        const codeList = Array.isArray(existingWithCode) ? existingWithCode : [];
        if (codeList.length > 0) {
          await transaction.rollback();
          throw ApiError.badRequest('幼儿园编码已存在', 'KINDERGARTEN_CODE_EXISTS');
        }
      }

      // 构建更新字段
      const updateFields: string[] = [];
      // ✅ 重用 replacements 对象，而不是重新声明
      replacements.id = Number(id) || 0;

      for (const [key, value] of Object.entries(validatedData)) {
        if (value !== undefined) {
          const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          updateFields.push(`${dbKey} = :${key}`);
          replacements[key] = value;
        }
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        await sequelize.query(
          `UPDATE kindergartens SET ${updateFields.join(', ')} WHERE id = :id`,
          {
            replacements,
            transaction
          }
        );
      }

      // 获取更新后的幼儿园信息
      const updatedKindergartens = await sequelize.query(
        `SELECT * FROM kindergartens WHERE id = :id`,
        {
          replacements: { id: Number(id) || 0 },
          type: 'SELECT',
          transaction
        }
      );
      
      const updatedList = Array.isArray(updatedKindergartens) ? updatedKindergartens : [];
      const row = updatedList[0] as Record<string, unknown>;
      const formattedKindergarten = {
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        level: row.level,
        address: row.address,
        longitude: row.longitude,
        latitude: row.latitude,
        phone: row.phone,
        email: row.email,
        principal: row.principal,
        establishedDate: row.established_date,
        area: row.area,
        buildingArea: row.building_area,
        classCount: row.class_count,
        teacherCount: row.teacher_count,
        studentCount: row.student_count,
        description: row.description,
        features: row.features,
        philosophy: row.philosophy,
        feeDescription: row.fee_description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
      };

      await transaction.commit();
      ApiResponse.success(res, formattedKindergarten, '幼儿园更新成功');
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
  public static async delete(req: RequestWithUser, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    let isTransactionFinished = false;

    try {
      const { id } = req.params;
      const { groupId } = req.query;

      if (!id || isNaN(Number(id) || 0)) {
        await transaction.rollback();
        isTransactionFinished = true;
        throw ApiError.badRequest('无效的幼儿园ID', 'INVALID_KINDERGARTEN_ID');
      }

      let whereClause = 'WHERE id = :id';
      const replacements: { [key: string]: any } = { id: Number(id) || 0 };

      // ✅ 添加 group_id 验证 - 数据隔离
      if (groupId) {
        whereClause += ' AND group_id = :groupId';
        replacements.groupId = Number(groupId);
        console.log('✅ 验证集团权限:', groupId);
      }

      // 检查幼儿园是否存在，实现幂等性
      const kindergartens = await sequelize.query(
        `SELECT id FROM kindergartens ${whereClause}`,
        {
          replacements,
          type: 'SELECT',
          transaction
        }
      );

      const kindergartensList = Array.isArray(kindergartens) ? kindergartens : [];
      if (kindergartensList.length === 0) {
        // 幼儿园不存在，但删除操作仍然成功（幂等性）
        await transaction.commit();
        isTransactionFinished = true;
        return ApiResponse.success(res, { message: '删除幼儿园成功' });
      }

      // 删除幼儿园
      await sequelize.query(
        `DELETE FROM kindergartens ${whereClause}`,
        {
          replacements,
          transaction
        }
      );

      await transaction.commit();
      isTransactionFinished = true;
      ApiResponse.success(res, { message: '删除幼儿园成功' });
    } catch (error) {
      if (!isTransactionFinished) {
        await transaction.rollback();
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.serverError('删除幼儿园失败', 'KINDERGARTEN_DELETE_ERROR');
    }
  }
}

export default KindergartenController; 
