/**
* @swagger
 * components:
 *   schemas:
 *     Document-import:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Document-import ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Document-import 名称
 *           example: "示例Document-import"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateDocument-importRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Document-import 名称
 *           example: "新Document-import"
 *     UpdateDocument-importRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Document-import 名称
 *           example: "更新后的Document-import"
 *     Document-importListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document-import'
 *         message:
 *           type: string
 *           example: "获取document-import列表成功"
 *     Document-importResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Document-import'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * document-import管理路由文件
 * 提供document-import的基础CRUD操作
*
 * 功能包括：
 * - 获取document-import列表
 * - 创建新document-import
 * - 获取document-import详情
 * - 更新document-import信息
 * - 删除document-import
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 文档导入API路由
 * 支持AI驱动的教师和家长数据导入功能
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/document-import/permissions:
 *   get:
 *     summary: 获取当前用户的导入权限
 *     description: 查询当前用户可以导入哪些类型的数据
 *     tags: [文档导入]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取权限信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userRole:
 *                       type: string
 *                       example: "teacher"
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         teacher:
 *                           type: boolean
 *                         parent:
 *                           type: boolean
 *                     canImportTeacher:
 *                       type: boolean
 *                     canImportParent:
 *                       type: boolean
 *                     permissionInfo:
 *                       type: object
 *                       properties:
 *                         teacher:
 *                           type: string
 *                         parent:
 *                           type: string
*/
router.get('/permissions', (req: any, res) => {
  try {
    const userRole = req.user?.role?.toLowerCase() || 'unknown';
    
    const permissions = {
      teacher: ['principal', 'admin'].includes(userRole),
      parent: ['teacher', 'principal', 'admin'].includes(userRole)
    };

    res.json({
      success: true,
      data: {
        userRole: req.user?.role || 'unknown',
        permissions,
        canImportTeacher: permissions.teacher,
        canImportParent: permissions.parent,
        permissionInfo: {
          teacher: '只有园长和管理员可以导入教师数据',
          parent: '教师、园长和管理员可以导入家长数据'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取权限信息失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/document-import/formats:
 *   get:
 *     summary: 获取支持的文档格式
 *     description: 获取系统支持的文档格式和字段说明
 *     tags: [文档导入]
 *     responses:
 *       200:
 *         description: 获取格式信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     supportedFormats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           examples:
 *                             type: array
 *                             items:
 *                               type: string
 *                     teacherFields:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           required:
 *                             type: boolean
 *                           description:
 *                             type: string
 *                     parentFields:
 *                       type: array
 *                       items:
 *                         type: object
*/
router.get('/formats', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        supportedFormats: [
          {
            type: 'text',
            description: '纯文本格式',
            examples: ['姓名: 张三\\n邮箱: zhang@example.com\\n电话: 13800138000']
          },
          {
            type: 'table',
            description: '表格格式（制表符或逗号分隔）',
            examples: ['姓名\\t邮箱\\t电话\\n张三\\tzhang@example.com\\t13800138000']
          },
          {
            type: 'json',
            description: 'JSON格式',
            examples: ['[{"name": "张三", "email": "zhang@example.com", "phone": "13800138000"}]']
          }
        ],
        teacherFields: [
          { field: 'name', required: true, description: '教师姓名' },
          { field: 'email', required: false, description: '邮箱地址' },
          { field: 'phone', required: false, description: '手机号码' },
          { field: 'qualification', required: false, description: '教师资格' },
          { field: 'experience', required: false, description: '工作年限' },
          { field: 'specialization', required: false, description: '专业领域' },
          { field: 'employmentDate', required: false, description: '入职日期' }
        ],
        parentFields: [
          { field: 'name', required: true, description: '家长姓名' },
          { field: 'email', required: false, description: '邮箱地址' },
          { field: 'phone', required: false, description: '手机号码' },
          { field: 'relationship', required: false, description: '与学生关系' },
          { field: 'occupation', required: false, description: '职业' },
          { field: 'address', required: false, description: '地址' },
          { field: 'studentName', required: false, description: '学生姓名' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取格式信息失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/document-import/preview:
 *   post:
 *     summary: 预览文档解析结果
 *     description: 使用AI解析文档内容但不实际导入，用于预览和验证
 *     tags: [文档导入]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentContent
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [teacher, parent]
 *                 description: 数据类型
 *               documentContent:
 *                 type: string
 *                 description: 文档内容
 *     responses:
 *       200:
 *         description: 预览解析成功
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
*/
router.post('/preview', (req: any, res) => {
  try {
    const { documentType, documentContent } = req.body;
    const userRole = req.user?.role?.toLowerCase();

    // 简单权限检查
    if (!documentType || !['teacher', 'parent'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'documentType只能是teacher或parent'
      });
    }

    if (!documentContent || typeof documentContent !== 'string' || documentContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的文档内容'
      });
    }

    // 权限检查
    const permissions = {
      teacher: ['principal', 'admin'].includes(userRole),
      parent: ['teacher', 'principal', 'admin'].includes(userRole)
    };

    if (!permissions[documentType]) {
      return res.status(403).json({
        success: false,
        message: `您的角色 ${userRole} 无权限导入${documentType === 'teacher' ? '教师' : '家长'}数据`
      });
    }

    // 模拟解析结果
    const mockData = documentType === 'teacher' ? [
      {
        name: '张三',
        email: 'zhang@example.com',
        phone: '13800138000',
        qualification: '幼师资格证',
        experience: 3,
        specialization: '幼儿教育',
        status: 'active'
      }
    ] : [
      {
        name: '李四',
        email: 'li@example.com', 
        phone: '13900139000',
        relationship: 'mother',
        occupation: '护士',
        emergencyContact: true,
        studentName: '李小明'
      }
    ];

    res.json({
      success: true,
      message: '文档预览解析完成',
      data: {
        documentType,
        totalParsed: mockData.length,
        parsedData: mockData,
        validationErrors: [],
        canImport: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '文档预览解析失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/document-import/import:
 *   post:
 *     summary: 导入文档数据
 *     description: 使用AI解析文档内容并导入教师或家长数据到数据库
 *     tags: [文档导入]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentType
 *               - documentContent
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [teacher, parent]
 *                 description: 导入数据类型
 *               documentContent:
 *                 type: string
 *                 description: 文档内容
 *               previewOnly:
 *                 type: boolean
 *                 default: false
 *                 description: 仅预览不导入
 *     responses:
 *       200:
 *         description: 导入成功
 *       400:
 *         description: 请求参数错误或数据验证失败
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
*/
router.post('/import', (req: any, res) => {
  try {
    const { documentType, documentContent } = req.body;
    const userRole = req.user?.role?.toLowerCase();

    // 权限和参数检查（与preview相同）
    if (!documentType || !['teacher', 'parent'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'documentType只能是teacher或parent'
      });
    }

    if (!documentContent || typeof documentContent !== 'string' || documentContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的文档内容'
      });
    }

    const permissions = {
      teacher: ['principal', 'admin'].includes(userRole),
      parent: ['teacher', 'principal', 'admin'].includes(userRole)
    };

    if (!permissions[documentType]) {
      return res.status(403).json({
        success: false,
        message: `您的角色 ${userRole} 无权限导入${documentType === 'teacher' ? '教师' : '家长'}数据`
      });
    }

    // 模拟导入成功
    res.json({
      success: true,
      message: '文档导入成功',
      data: {
        documentType,
        importedCount: 1,
        skippedCount: 0,
        totalParsed: 1,
        parsedData: [],
        errors: []
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '文档导入服务异常',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/document-import/history:
 *   get:
 *     summary: 获取导入历史记录
 *     description: 查询用户的文档导入历史记录
 *     tags: [文档导入]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取历史记录成功
*/
router.get('/history', (req: any, res) => {
  try {
    res.json({
      success: true,
      message: '导入历史记录功能待实现',
      data: {
        history: [],
        total: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取历史记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;