/**
* @swagger
 * components:
 *   schemas:
 *     Ai-knowledge:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-knowledge ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-knowledge 名称
 *           example: "示例Ai-knowledge"
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
 *     CreateAi-knowledgeRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-knowledge 名称
 *           example: "新Ai-knowledge"
 *     UpdateAi-knowledgeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-knowledge 名称
 *           example: "更新后的Ai-knowledge"
 *     Ai-knowledgeListResponse:
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
 *                 $ref: '#/components/schemas/Ai-knowledge'
 *         message:
 *           type: string
 *           example: "获取ai-knowledge列表成功"
 *     Ai-knowledgeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-knowledge'
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
 * ai-knowledge管理路由文件
 * 提供ai-knowledge的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-knowledge列表
 * - 创建新ai-knowledge
 * - 获取ai-knowledge详情
 * - 更新ai-knowledge信息
 * - 删除ai-knowledge
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/ai-knowledge/by-page/{pagePath}:
 *   get:
 *     summary: 根据页面路径获取AI知识库文档
 *     description: 根据页面路径获取对应的AI知识库文档
 *     tags:
 *       - AI知识库
 *     parameters:
 *       - in: path
 *         name: pagePath
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面路径
 *     responses:
 *       200:
 *         description: 获取成功
 *       400:
 *         description: 请求参数错误
*/
router.get('/by-page/:pagePath', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pagePath } = req.params;

    if (!pagePath) {
      res.status(400).json({
        success: false,
        message: '页面路径不能为空'
      });
      return;
    }

    // 解码URL路径
    const decodedPath = decodeURIComponent(pagePath);

    console.log('[AI]: 🔍 查找AI知识库文档，页面路径:', decodedPath);

    // 根据页面路径映射到知识库分类
    const pathToCategoryMap: Record<string, string[]> = {
      // 原有的 /centers/ 路径映射
      '/centers/finance': ['finance_center', 'finance_operations', 'finance_reports', 'finance_data_structure'],
      '/centers/script': ['script_center', 'script_templates', 'script_statistics', 'script_scenarios'],
      '/centers/personnel': ['personnel_management', 'employee_records', 'payroll_management', 'attendance_system'],
      '/centers/activity': ['activity_management', 'activity_planning', 'activity_execution', 'activity_evaluation'],
      '/centers/enrollment': ['enrollment_management', 'application_processing', 'interview_assessment', 'admission_decision'],
      '/centers/marketing': ['marketing_management', 'campaign_marketing', 'advertising_promotion', 'brand_building'],
      '/centers/ai': ['ai_center_management', 'ai_model_management', 'ai_data_analytics', 'intelligent_dialogue'],
      '/principal/media-center': ['media_center', 'content_creation', 'media_templates', 'media_management'],
      '/centers/customer-pool': ['customer_pool_center', 'customer_management', 'followup_system', 'customer_analytics'],
      '/dashboard': ['dashboard_overview', 'dashboard_statistics', 'dashboard_navigation', 'dashboard_management'],
      '/centers/task': ['task_center_management', 'task_planning', 'task_execution', 'task_tracking'],
      '/centers/system': ['system_center_management', 'system_configuration', 'system_monitoring', 'system_maintenance'],
      '/centers/business': ['business_center_management', 'business_operations', 'business_analytics', 'business_optimization'],
      '/centers/teaching': ['teaching_center_management', 'curriculum_planning', 'teaching_resources', 'learning_assessment'],
      '/centers/media': ['media_center', 'content_creation', 'media_templates', 'media_management'],
      '/centers/inspection': ['inspection_center_management', 'inspection_planning', 'inspection_execution', 'document_management'],

      // 新增：前端实际使用的中心页面路径映射
      '/teacher-center': ['personnel_management', 'employee_records', 'payroll_management', 'attendance_system', 'teaching_center_management', 'curriculum_planning', 'teaching_resources', 'learning_assessment'],
      '/teacher-center/dashboard': ['personnel_management', 'teaching_center_management'],
      '/teacher-center/creative-curriculum': ['curriculum_planning', 'teaching_resources'],
      '/teacher-center/teaching-plan': ['curriculum_planning', 'teaching_resources'],
      '/teacher-center/class-management': ['teaching_center_management', 'learning_assessment'],
      '/teacher-center/student-management': ['learning_assessment', 'teaching_resources'],
      '/teacher-center/performance': ['personnel_management', 'employee_records'],
      '/teacher-center/enrollment': ['enrollment_management', 'application_processing'],
      '/teacher-center/customers': ['customer_pool_center', 'customer_management'],
      '/teacher-center/workspace': ['teaching_center_management', 'teaching_resources'],
      '/teacher-center/communication': ['teaching_center_management'],
      '/teacher-center/resources': ['teaching_resources', 'media_center'],
      '/teacher-center/schedule': ['teaching_center_management', 'curriculum_planning'],

      '/inspection-center': ['inspection_center_management', 'inspection_planning', 'inspection_execution', 'document_management'],
      '/inspection-center/document-templates': ['document_management', 'inspection_planning'],
      '/inspection-center/document-instances': ['document_management', 'inspection_execution'],
      '/inspection-center/inspection-types': ['inspection_center_management'],
      '/inspection-center/inspection-plans': ['inspection_planning'],
      '/inspection-center/inspection-tasks': ['inspection_execution'],
      '/inspection-center/document-statistics': ['inspection_center_management', 'document_management'],

      '/activity-center': ['activity_management', 'activity_planning', 'activity_execution', 'activity_evaluation'],
      '/activity-center/list': ['activity_management'],
      '/activity-center/create': ['activity_planning'],
      '/activity-center/calendar': ['activity_execution'],
      '/activity-center/registration': ['activity_execution'],
      '/activity-center/evaluation': ['activity_evaluation'],
      '/activity-center/reports': ['activity_management', 'activity_evaluation'],
      '/activity-center/analysis': ['activity_management', 'activity_evaluation'],

      '/enrollment-center': ['enrollment_management', 'application_processing', 'interview_assessment', 'admission_decision'],
      '/enrollment-center/plans': ['enrollment_management'],
      '/enrollment-center/applications': ['application_processing'],
      '/enrollment-center/interviews': ['interview_assessment'],
      '/enrollment-center/admissions': ['admission_decision'],
      '/enrollment-center/statistics': ['enrollment_management'],
      '/enrollment-center/reports': ['enrollment_management', 'admission_decision'],

      '/marketing-center': ['marketing_management', 'campaign_marketing', 'advertising_promotion', 'brand_building'],
      '/marketing-center/campaigns': ['campaign_marketing'],
      '/marketing-center/advertisements': ['advertising_promotion'],
      '/marketing-center/referrals': ['marketing_management'],
      '/marketing-center/analytics': ['marketing_management', 'campaign_marketing'],
      '/marketing-center/social-media': ['advertising_promotion', 'brand_building'],
      '/marketing-center/promotions': ['campaign_marketing', 'brand_building'],

      '/parent-center': ['customer_pool_center', 'customer_management', 'followup_system', 'customer_analytics'],
      '/parent-center/dashboard': ['customer_pool_center'],
      '/parent-center/students': ['customer_management'],
      '/parent-center/communication': ['followup_system'],
      '/parent-center/activities': ['activity_management'],
      '/parent-center/fees': ['finance_center', 'finance_operations'],
      '/parent-center/schedule': ['teaching_center_management'],
      '/parent-center/reports': ['customer_analytics', 'followup_system'],

      '/finance-center': ['finance_center', 'finance_operations', 'finance_reports', 'finance_data_structure'],
      '/finance-center/overview': ['finance_center', 'finance_reports'],
      '/finance-center/tuition': ['finance_operations'],
      '/finance-center/payments': ['finance_operations'],
      '/finance-center/refunds': ['finance_operations'],
      '/finance-center/scholarships': ['finance_operations'],
      '/finance-center/invoicing': ['finance_operations', 'finance_reports'],
      '/finance-center/reports': ['finance_reports'],
      '/finance-center/analytics': ['finance_center', 'finance_analytics']
    };

    // 获取对应的文档分类
    const categories = pathToCategoryMap[decodedPath];

    if (!categories || categories.length === 0) {
      console.log('[AI]: 📝 页面暂无AI知识库文档:', decodedPath);
      // 返回成功响应但无数据，避免前端404错误
      res.json({
        success: true,
        data: {
          id: `ai-empty-${decodedPath.replace(/\//g, '-')}`,
          pagePath: decodedPath,
          pageName: getPageName(decodedPath),
          pageDescription: `${getPageName(decodedPath)}的AI智能助手知识库，正在建设中`,
          category: 'ai_knowledge',
          importance: 0,
          relatedTables: [],
          contextPrompt: `当前页面是${getPageName(decodedPath)}，相关AI知识库正在建设中`,
          sections: [],
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          message: '该页面的AI知识库正在建设中，请稍后再试'
        }
      });
      return;
    }

    // 查询AI知识库文档
    const placeholders = categories.map(() => '?').join(',');
    const query = `
      SELECT id, category, title, content, metadata, created_at, updated_at
      FROM ai_knowledge_base 
      WHERE category IN (${placeholders})
      ORDER BY 
        FIELD(category, ${categories.map(() => '?').join(',')}),
        created_at ASC
    `;

    const rows = await sequelize.query(query, {
      replacements: [...categories, ...categories],
      type: QueryTypes.SELECT
    });

    if (Array.isArray(rows) && rows.length > 0) {
      // 构造页面指南格式的响应
      const pageGuide = {
        id: `ai-${decodedPath.replace(/\//g, '-')}`,
        pagePath: decodedPath,
        pageName: getPageName(decodedPath),
        pageDescription: `${getPageName(decodedPath)}的AI智能助手知识库，提供专业的功能指导和操作建议`,
        category: 'ai_knowledge',
        importance: 1,
        relatedTables: [],
        contextPrompt: `当前页面是${getPageName(decodedPath)}，用户可以在这里进行相关的管理操作`,
        sections: rows.map((row: any, index: number) => ({
          id: `section-${row.id}`,
          sectionName: row.title,
          sectionDescription: row.content,
          sectionPath: decodedPath,
          features: [],
          sortOrder: index + 1,
          category: row.category,
          metadata: row.metadata,
          // 兼容AI知识库格式
          title: row.title,
          content: row.content
        })),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('[AI]: ✅ AI知识库文档查询成功:', pageGuide.pageName, `(${rows.length}个文档)`);

      res.json({
        success: true,
        data: pageGuide
      });
    } else {
      console.log('[AI]: 📝 未找到对应的AI知识库文档:', decodedPath);
      res.status(404).json({
        success: false,
        message: '未找到对应的AI知识库文档'
      });
    }

  } catch (error: any) {
    console.error('[AI]: ❌ 查询AI知识库文档失败:', error);
    res.status(500).json({
      success: false,
      message: '查询AI知识库文档失败',
      error: error.message
    });
  }
});

/**
* @swagger
 * /api/ai-knowledge:
 *   get:
 *     summary: 获取所有AI知识库文档
 *     description: 获取所有AI知识库文档列表
 *     tags:
 *       - AI知识库
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
*/
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await sequelize.query(`
      SELECT id, category, title, LENGTH(content) as content_length, 
             JSON_EXTRACT(metadata, '$.keywords') as keywords,
             created_at, updated_at
      FROM ai_knowledge_base 
      ORDER BY category, created_at ASC
    `, { type: QueryTypes.SELECT });

    res.json({
      success: true,
      data: rows
    });

  } catch (error: any) {
    console.error('[AI]: ❌ 获取AI知识库文档列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI知识库文档列表失败',
      error: error.message
    });
  }
});

/**
* @swagger
 * /api/ai-knowledge/category/{category}:
 *   get:
 *     summary: 根据分类获取AI知识库文档
 *     description: 根据分类获取对应的AI知识库文档列表
 *     tags:
 *       - AI知识库
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: 知识库分类
 *     responses:
 *       200:
 *         description: 获取成功
 *       500:
 *         description: 服务器错误
*/
router.get('/category/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const rows = await sequelize.query(`
      SELECT id, category, title, content, metadata, created_at, updated_at
      FROM ai_knowledge_base 
      WHERE category = ?
      ORDER BY created_at ASC
    `, { 
      replacements: [category],
      type: QueryTypes.SELECT 
    });

    res.json({
      success: true,
      data: rows
    });

  } catch (error: any) {
    console.error('[AI]: ❌ 根据分类查询AI知识库文档失败:', error);
    res.status(500).json({
      success: false,
      message: '根据分类查询AI知识库文档失败',
      error: error.message
    });
  }
});

/**
 * 根据页面路径获取页面名称
*/
function getPageName(path: string): string {
  const pathNameMap: Record<string, string> = {
    '/centers/finance': '财务中心',
    '/centers/script': '话术中心',
    '/centers/personnel': '人事中心',
    '/centers/activity': '活动中心',
    '/centers/enrollment': '招生中心',
    '/centers/marketing': '营销中心',
    '/centers/ai': 'AI中心',
    '/principal/media-center': '媒体中心',
    '/centers/customer-pool': '客户池中心',
    '/dashboard': 'Dashboard综合工作台',
    '/centers/inspection': '督查中心'
  };

  return pathNameMap[path] || path;
}

export default router;