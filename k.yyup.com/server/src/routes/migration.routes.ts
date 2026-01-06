/**
* @swagger
 * components:
 *   schemas:
 *     Migration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Migration ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Migration 名称
 *           example: "示例Migration"
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
 *     CreateMigrationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Migration 名称
 *           example: "新Migration"
 *     UpdateMigrationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Migration 名称
 *           example: "更新后的Migration"
 *     MigrationListResponse:
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
 *                 $ref: '#/components/schemas/Migration'
 *         message:
 *           type: string
 *           example: "获取migration列表成功"
 *     MigrationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Migration'
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
 * migration管理路由文件
 * 提供migration的基础CRUD操作
*
 * 功能包括：
 * - 获取migration列表
 * - 创建新migration
 * - 获取migration详情
 * - 更新migration信息
 * - 删除migration
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { MigrationController } from '../controllers/migration.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 数据库迁移路由 - 数据库结构管理和版本控制
 * 提供数据库表结构的迁移、修复、状态检查和回滚功能，确保数据库版本的可控性和数据完整性
*/

/**
* @summary 执行活动海报相关表迁移
* @description 执行数据库表结构的迁移，创建或更新活动海报相关的数据表。包括活动海报表、海报模板表、海报使用记录表等，确保活动管理功能的数据结构完整性。
* @tags Migration - 数据迁移管理
* @access Private (Admin)
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.optional 迁移执行参数
* @param {boolean} [requestBody.body.force=false] optional 是否强制执行迁移（忽略冲突检查）
* @param {boolean} [requestBody.body.backup=true] optional 是否在迁移前创建数据备份
* @param {boolean} [requestBody.body.validateData=true] optional 是否验证迁移后的数据完整性
* @param {boolean} [requestBody.body.skipExisting=false] optional 是否跳过已存在的表
* @responses {200} {object} Success_迁移执行成功
* @responses {400} {object} Error_请求参数错误或迁移配置无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足（仅管理员可执行）
* @responses {409} {object} Error_迁移冲突（表已存在且未强制执行）
* @responses {500} {object} Error_服务器内部错误或迁移执行失败
*/
router.post('/activity-poster-tables', MigrationController.migrateActivityPosterTables);

/**
* @summary 修复AI记忆表结构
* @description 修复和优化AI记忆相关的数据表结构，解决数据不一致、索引缺失、约束冲突等问题。支持数据验证、结构优化、性能提升，确保AI记忆系统的稳定运行。
* @tags Migration - 数据迁移管理
* @access Private (Admin)
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.optional 修复执行参数
* @param {boolean} [requestBody.body.validateData=true] optional 是否验证现有数据的完整性
* @param {boolean} [requestBody.body.createBackup=true] optional 是否在修复前创建数据备份
* @param {boolean} [requestBody.body.optimizePerformance=true] optional 是否优化表结构和索引
* @param {boolean} [requestBody.body.fixConstraints=true] optional 是否修复数据约束和外键关系
* @param {string} [requestBody.body.targetVersion] optional 目标版本号（默认为最新版本）
* @responses {200} {object} Success_AI记忆表修复完成
* @responses {400} {object} Error_请求参数错误或修复配置无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足（仅管理员可执行）
* @responses {500} {object} Error_服务器内部错误或修复执行失败
*/
router.post('/fix-ai-memories', MigrationController.fixAIMemoriesTable);

/**
* @summary 检查迁移状态
* @description 检查数据库迁移的当前状态和历史记录，包括当前数据库版本、待执行的迁移、已完成的迁移、数据库连接状态等。提供全面的迁移状态概览。
* @tags Migration - 数据迁移管理
* @access Private (Admin)
* @security [{"bearerAuth": []}]
* @param {string} [query.version] query optional 指定版本查询（查询特定版本的迁移状态）
* @param {boolean} [query.includeDetails=false] query optional 是否包含详细的迁移执行信息
* @param {boolean} [query.includeValidation=true] query optional 是否包含数据验证结果
* @param {string} [query.status] query optional 迁移状态筛选 - pending:待执行, completed:已完成, failed:执行失败, all:全部
* @param {integer} [query.limit=50] query optional 返回记录数限制
* @responses {200} {object} Success_获取迁移状态成功
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误或状态查询失败
*/
router.get('/status', MigrationController.checkMigrationStatus);

/**
* @summary 回滚迁移
* @description 回滚指定的数据库迁移，恢复到之前的状态。支持单步回滚或多步回滚，包括数据恢复、表结构回退、索引重建等操作。提供安全的回滚机制保障数据安全。
* @tags Migration - 数据迁移管理
* @access Private (Admin)
* @security [{"bearerAuth": []}]
* @param {object} requestBody.body.required 回滚执行参数
* @param {string} [requestBody.body.migrationId] optional 要回滚的迁移ID（与steps二选一）
* @param {integer} [requestBody.body.steps] optional 回滚步数（回滚最近N个迁移，与migrationId二选一）
* @param {boolean} [requestBody.body.force=false] optional 是否强制回滚（忽略安全检查）
* @param {boolean} [requestBody.body.backupBeforeRollback=true] optional 回滚前是否创建备份
* @param {boolean} [requestBody.body.validateAfterRollback=true] optional 回滚后是否验证数据完整性
* @param {string} [requestBody.body.rollbackReason] optional 回滚原因说明
* @responses {200} {object} Success_迁移回滚成功
* @responses {400} {object} Error_请求参数错误或回滚配置无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足（仅管理员可执行）
* @responses {404} {object} Error_指定的迁移不存在
* @responses {409} {object} Error_回滚冲突（数据依赖关系不允许回滚）
* @responses {500} {object} Error_服务器内部错误或回滚执行失败
*/
router.post('/rollback', MigrationController.rollbackMigration);

export default router;
