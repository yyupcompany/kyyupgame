import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

/**
 * AI快捷操作配置控制器
 */
export class AIShortcutsController {
  constructor() {
    // 不需要初始化，直接使用sequelize
  }

  /**
   * 获取AI快捷操作列表（支持角色过滤）
   */
  async getShortcuts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        role, 
        category, 
        is_active, 
        page = 1, 
        pageSize = 20,
        search 
      } = req.query;

      // 构建查询条件
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      // 角色过滤
      if (role && role !== 'all') {
        whereClause += ' AND (role = ? OR role = "all")';
        params.push(role);
      }

      // 类别过滤
      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      // 状态过滤
      if (is_active !== undefined) {
        whereClause += ' AND is_active = ?';
        params.push(is_active === 'true' ? 1 : 0);
      }

      // 搜索过滤
      if (search) {
        whereClause += ' AND (shortcut_name LIKE ? OR prompt_name LIKE ? OR system_prompt LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // 计算总数
      const countQuery = `SELECT COUNT(*) as total FROM ai_shortcuts ${whereClause}`;
      const countResult = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      const total = (countResult[0] as any)?.total || 0;

      // 分页查询
      const offset = (Number(page) - 1) * Number(pageSize);
      const dataQuery = `
        SELECT id, shortcut_name, prompt_name, category, role, api_endpoint, 
               is_active, sort_order, created_at, updated_at
        FROM ai_shortcuts 
        ${whereClause}
        ORDER BY sort_order ASC, created_at DESC
        LIMIT ? OFFSET ?
      `;
      params.push(Number(pageSize), offset);

      const shortcuts = await sequelize.query(dataQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const response = {
        success: true,
        code: 200,
        message: '获取AI快捷操作列表成功',
        data: {
          list: shortcuts,
          pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total,
            totalPages: Math.ceil(total / Number(pageSize))
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('获取AI快捷操作列表失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '获取AI快捷操作列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 根据ID获取AI快捷操作详情
   */
  async getShortcutById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT * FROM ai_shortcuts WHERE id = ?
      `;
      const shortcuts = await sequelize.query(query, {
        replacements: [id],
        type: QueryTypes.SELECT
      });

      if (shortcuts.length === 0) {
        res.status(404).json({
          success: false,
          code: 404,
          message: 'AI快捷操作不存在'
        });
        return;
      }

      const response = {
        success: true,
        code: 200,
        message: '获取AI快捷操作详情成功',
        data: shortcuts[0]
      };

      res.json(response);
    } catch (error) {
      console.error('获取AI快捷操作详情失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '获取AI快捷操作详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 创建AI快捷操作
   */
  async createShortcut(req: Request, res: Response): Promise<void> {
    try {
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      const {
        shortcut_name,
        prompt_name,
        category,
        role = 'all',
        system_prompt,
        api_endpoint,
        is_active = true,
        sort_order = 0
      } = req.body;

      // 检查prompt_name是否已存在
      const existQuery = 'SELECT id FROM ai_shortcuts WHERE prompt_name = ?';
      const existResult = await sequelize.query(existQuery, {
        replacements: [prompt_name],
        type: QueryTypes.SELECT
      });
      
      if (existResult.length > 0) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '提示词名称已存在'
        });
        return;
      }

      const insertQuery = `
        INSERT INTO ai_shortcuts 
        (shortcut_name, prompt_name, category, role, system_prompt, api_endpoint, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await sequelize.query(insertQuery, {
        replacements: [
          shortcut_name,
          prompt_name,
          category,
          role,
          system_prompt,
          api_endpoint,
          is_active,
          sort_order
        ],
        type: QueryTypes.INSERT
      });

      const response = {
        success: true,
        code: 201,
        message: '创建AI快捷操作成功',
        data: {
          id: (result as any)[0],
          shortcut_name,
          prompt_name,
          category,
          role,
          api_endpoint,
          is_active,
          sort_order
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('创建AI快捷操作失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '创建AI快捷操作失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新AI快捷操作
   */
  async updateShortcut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // 验证请求参数
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '参数验证失败',
          errors: errors.array()
        });
        return;
      }

      // 检查记录是否存在
      const existQuery = 'SELECT id FROM ai_shortcuts WHERE id = ?';
      const existResult = await sequelize.query(existQuery, {
        replacements: [id],
        type: QueryTypes.SELECT
      });
      
      if (existResult.length === 0) {
        res.status(404).json({
          success: false,
          code: 404,
          message: 'AI快捷操作不存在'
        });
        return;
      }

      const {
        shortcut_name,
        prompt_name,
        category,
        role,
        system_prompt,
        api_endpoint,
        is_active,
        sort_order
      } = req.body;

      // 如果更新prompt_name，检查是否与其他记录冲突
      if (prompt_name) {
        const conflictQuery = 'SELECT id FROM ai_shortcuts WHERE prompt_name = ? AND id != ?';
        const conflictResult = await sequelize.query(conflictQuery, {
          replacements: [prompt_name, id],
          type: QueryTypes.SELECT
        });
        
        if (conflictResult.length > 0) {
          res.status(400).json({
            success: false,
            code: 400,
            message: '提示词名称已存在'
          });
          return;
        }
      }

      // 构建更新语句
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (shortcut_name !== undefined) {
        updateFields.push('shortcut_name = ?');
        updateValues.push(shortcut_name);
      }
      if (prompt_name !== undefined) {
        updateFields.push('prompt_name = ?');
        updateValues.push(prompt_name);
      }
      if (category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(category);
      }
      if (role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(role);
      }
      if (system_prompt !== undefined) {
        updateFields.push('system_prompt = ?');
        updateValues.push(system_prompt);
      }
      if (api_endpoint !== undefined) {
        updateFields.push('api_endpoint = ?');
        updateValues.push(api_endpoint);
      }
      if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(is_active);
      }
      if (sort_order !== undefined) {
        updateFields.push('sort_order = ?');
        updateValues.push(sort_order);
      }

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '没有提供要更新的字段'
        });
        return;
      }

      updateValues.push(id);
      const updateQuery = `
        UPDATE ai_shortcuts 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await sequelize.query(updateQuery, {
        replacements: updateValues,
        type: QueryTypes.UPDATE
      });

      const response = {
        success: true,
        code: 200,
        message: '更新AI快捷操作成功'
      };

      res.json(response);
    } catch (error) {
      console.error('更新AI快捷操作失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '更新AI快捷操作失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 删除AI快捷操作（软删除）
   */
  async deleteShortcut(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 检查记录是否存在
      const existQuery = 'SELECT id FROM ai_shortcuts WHERE id = ?';
      const existResult = await sequelize.query(existQuery, {
        replacements: [id],
        type: QueryTypes.SELECT
      });

      if (existResult.length === 0) {
        res.status(404).json({
          success: false,
          code: 404,
          message: 'AI快捷操作不存在'
        });
        return;
      }

      // 软删除：设置is_active为false
      const deleteQuery = `
        UPDATE ai_shortcuts
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await sequelize.query(deleteQuery, {
        replacements: [id],
        type: QueryTypes.UPDATE
      });

      const response = {
        success: true,
        code: 200,
        message: '删除AI快捷操作成功'
      };

      res.json(response);
    } catch (error) {
      console.error('删除AI快捷操作失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '删除AI快捷操作失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量删除AI快捷操作
   */
  async batchDeleteShortcuts(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '请提供要删除的ID列表'
        });
        return;
      }

      const placeholders = ids.map(() => '?').join(',');
      const deleteQuery = `
        UPDATE ai_shortcuts
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id IN (${placeholders})
      `;

      const result = await sequelize.query(deleteQuery, {
        replacements: ids,
        type: QueryTypes.UPDATE
      });

      const response = {
        success: true,
        code: 200,
        message: `批量删除AI快捷操作成功，共删除${(result as any)[1]}条记录`
      };

      res.json(response);
    } catch (error) {
      console.error('批量删除AI快捷操作失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '批量删除AI快捷操作失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 更新排序顺序
   */
  async updateSortOrder(req: Request, res: Response): Promise<void> {
    try {
      const { sortData } = req.body;

      if (!Array.isArray(sortData) || sortData.length === 0) {
        res.status(400).json({
          success: false,
          code: 400,
          message: '请提供排序数据'
        });
        return;
      }

      // 批量更新排序
      const updatePromises = sortData.map((item: { id: number; sort_order: number }) => {
        const updateQuery = 'UPDATE ai_shortcuts SET sort_order = ? WHERE id = ?';
        return sequelize.query(updateQuery, {
          replacements: [item.sort_order, item.id],
          type: QueryTypes.UPDATE
        });
      });

      await Promise.all(updatePromises);

      const response = {
        success: true,
        code: 200,
        message: '更新排序成功'
      };

      res.json(response);
    } catch (error) {
      console.error('更新排序失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '更新排序失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取用户可用的快捷操作（前端调用）
   */
  async getUserShortcuts(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req.user as any)?.role as string || 'all'; // 从认证中间件获取用户角色

      const query = `
        SELECT id, shortcut_name, prompt_name, category, api_endpoint, sort_order
        FROM ai_shortcuts
        WHERE is_active = true
        AND (role = ? OR role = 'all' OR ? = 'admin')
        ORDER BY sort_order ASC, created_at DESC
      `;

      const shortcuts = await sequelize.query(query, {
        replacements: [userRole, userRole],
        type: QueryTypes.SELECT
      });

      const response = {
        success: true,
        code: 200,
        message: '获取用户快捷操作成功',
        data: shortcuts
      };

      res.json(response);
    } catch (error) {
      console.error('获取用户快捷操作失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '获取用户快捷操作失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 根据ID获取快捷操作配置（用于AI调用）
   */
  async getShortcutConfig(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = (req.user as any)?.role as string || 'all';

      const query = `
        SELECT id, shortcut_name, prompt_name, category, role, system_prompt, api_endpoint
        FROM ai_shortcuts
        WHERE id = ? AND is_active = true
        AND (role = ? OR role = 'all' OR ? = 'admin')
      `;

      const shortcuts = await sequelize.query(query, {
        replacements: [id, userRole, userRole],
        type: QueryTypes.SELECT
      });

      if (shortcuts.length === 0) {
        res.status(404).json({
          success: false,
          code: 404,
          message: 'AI快捷操作不存在或无权限访问'
        });
        return;
      }

      const response = {
        success: true,
        code: 200,
        message: '获取快捷操作配置成功',
        data: shortcuts[0]
      };

      res.json(response);
    } catch (error) {
      console.error('获取快捷操作配置失败:', error);
      res.status(500).json({
        success: false,
        code: 500,
        message: '获取快捷操作配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}

export default new AIShortcutsController();
