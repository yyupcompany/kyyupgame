import { Router } from 'express'
import { websiteAutomationController } from '../controllers/websiteAutomationController'
import { verifyToken } from '../middlewares/auth.middleware'
import { body, param, query, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

// 简单的验证中间件
const validateRequest = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)))

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errors.array()
    })
  }
}

const router = Router()

/**
 * @swagger
 * /api/website-automation/tasks:
 *   get:
 *     summary: 获取所有自动化任务
 *     description: 获取所有网站自动化任务列表
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tasks',
  verifyToken,
  websiteAutomationController.getAllTasks
)

/**
 * @swagger
 * /api/website-automation/tasks:
 *   post:
 *     summary: 创建自动化任务
 *     description: 创建新的网站自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 description: 任务名称
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: 目标URL
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 自动化步骤
 *               config:
 *                 type: object
 *                 description: 任务配置
 *     responses:
 *       200:
 *         description: 创建成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks',
  verifyToken,
  validateRequest([
    body('name').notEmpty().withMessage('任务名称不能为空'),
    body('url').isURL().withMessage('请提供有效的URL'),
    body('steps').isArray().withMessage('步骤必须是数组格式'),
    body('config').optional().isObject().withMessage('配置必须是对象格式')
  ]),
  websiteAutomationController.createTask
)

/**
 * @swagger
 * /api/website-automation/tasks/{id}:
 *   put:
 *     summary: 更新自动化任务
 *     description: 更新指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/tasks/:id',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的任务ID'),
    body('name').optional().notEmpty().withMessage('任务名称不能为空'),
    body('url').optional().isURL().withMessage('请提供有效的URL'),
    body('steps').optional().isArray().withMessage('步骤必须是数组格式')
  ]),
  websiteAutomationController.updateTask
)

/**
 * @swagger
 * /api/website-automation/tasks/{id}:
 *   delete:
 *     summary: 删除自动化任务
 *     description: 删除指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/tasks/:id',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的任务ID')
  ]),
  websiteAutomationController.deleteTask
)

/**
 * @swagger
 * /api/website-automation/tasks/{id}/execute:
 *   post:
 *     summary: 执行自动化任务
 *     description: 执行指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 执行成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks/:id/execute',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的任务ID')
  ]),
  websiteAutomationController.executeTask
)

/**
 * @swagger
 * /api/website-automation/tasks/{id}/stop:
 *   post:
 *     summary: 停止自动化任务
 *     description: 停止正在执行的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 停止成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks/:id/stop',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的任务ID')
  ]),
  websiteAutomationController.stopTask
)

/**
 * @swagger
 * /api/website-automation/tasks/{id}/history:
 *   get:
 *     summary: 获取任务执行历史
 *     description: 获取指定任务的执行历史记录
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tasks/:id/history',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的任务ID')
  ]),
  websiteAutomationController.getTaskHistory
)

/**
 * @swagger
 * /api/website-automation/templates:
 *   get:
 *     summary: 获取所有模板
 *     description: 获取所有自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/templates',
  verifyToken,
  websiteAutomationController.getAllTemplates
)

/**
 * @swagger
 * /api/website-automation/templates:
 *   post:
 *     summary: 创建模板
 *     description: 创建新的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - complexity
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [web, form, data, test, custom]
 *               complexity:
 *                 type: string
 *                 enum: [simple, medium, complex]
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: object
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 创建成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/templates',
  verifyToken,
  validateRequest([
    body('name').notEmpty().withMessage('模板名称不能为空'),
    body('category').isIn(['web', 'form', 'data', 'test', 'custom']).withMessage('无效的模板分类'),
    body('complexity').isIn(['simple', 'medium', 'complex']).withMessage('无效的复杂度级别'),
    body('steps').isArray().withMessage('步骤必须是数组格式'),
    body('parameters').optional().isArray().withMessage('参数必须是数组格式'),
    body('config').optional().isObject().withMessage('配置必须是对象格式')
  ]),
  websiteAutomationController.createTemplate
)

/**
 * @swagger
 * /api/website-automation/templates/{id}:
 *   put:
 *     summary: 更新模板
 *     description: 更新指定的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [web, form, data, test, custom]
 *               complexity:
 *                 type: string
 *                 enum: [simple, medium, complex]
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/templates/:id',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的模板ID'),
    body('name').optional().notEmpty().withMessage('模板名称不能为空'),
    body('category').optional().isIn(['web', 'form', 'data', 'test', 'custom']).withMessage('无效的模板分类'),
    body('complexity').optional().isIn(['simple', 'medium', 'complex']).withMessage('无效的复杂度级别')
  ]),
  websiteAutomationController.updateTemplate
)

/**
 * @swagger
 * /api/website-automation/templates/{id}:
 *   delete:
 *     summary: 删除模板
 *     description: 删除指定的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/templates/:id',
  verifyToken,
  validateRequest([
    param('id').isUUID().withMessage('无效的模板ID')
  ]),
  websiteAutomationController.deleteTemplate
)

/**
 * @swagger
 * /api/website-automation/templates/{templateId}/create-task:
 *   post:
 *     summary: 从模板创建任务
 *     description: 基于模板创建新的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/templates/:templateId/create-task',
  verifyToken,
  validateRequest([
    param('templateId').isUUID().withMessage('无效的模板ID'),
    body('parameters').optional().isObject().withMessage('参数必须是对象格式')
  ]),
  websiteAutomationController.createTaskFromTemplate
)

/**
 * @swagger
 * /api/website-automation/screenshot:
 *   post:
 *     summary: 截取网页截图
 *     description: 截取指定URL的网页截图
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: 截图成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/screenshot',
  verifyToken,
  validateRequest([
    body('url').isURL().withMessage('请提供有效的URL'),
    body('options').optional().isObject().withMessage('选项必须是对象格式')
  ]),
  websiteAutomationController.captureScreenshot
)

/**
 * @swagger
 * /api/website-automation/analyze:
 *   post:
 *     summary: 分析页面元素
 *     description: 分析网页的页面元素
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               screenshot:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 分析成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/analyze',
  verifyToken,
  validateRequest([
    body('url').isURL().withMessage('请提供有效的URL'),
    body('screenshot').optional().notEmpty().withMessage('截图数据不能为空'),
    body('config').optional().isObject().withMessage('配置必须是对象格式')
  ]),
  websiteAutomationController.analyzePageElements
)

/**
 * @swagger
 * /api/website-automation/find-element:
 *   post:
 *     summary: 查找页面元素
 *     description: 根据描述查找页面元素
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - description
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               screenshot:
 *                 type: string
 *     responses:
 *       200:
 *         description: 查找成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/find-element',
  verifyToken,
  validateRequest([
    body('url').isURL().withMessage('请提供有效的URL'),
    body('description').notEmpty().withMessage('元素描述不能为空'),
    body('screenshot').optional().notEmpty().withMessage('截图数据不能为空')
  ]),
  websiteAutomationController.findElementByDescription
)

/**
 * @swagger
 * /api/website-automation/statistics:
 *   get:
 *     summary: 获取统计数据
 *     description: 获取网站自动化的统计数据
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/statistics',
  verifyToken,
  websiteAutomationController.getStatistics
)

export { router as websiteAutomationRouter }