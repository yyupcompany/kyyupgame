"use strict";
exports.__esModule = true;
var express_1 = require("express");
var migration_controller_1 = require("../controllers/migration.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * 数据库迁移路由
 * 用于执行数据库表结构更新
 */
// 执行活动海报相关表的迁移
router.post('/activity-poster-tables', auth_middleware_1.authMiddleware, migration_controller_1.MigrationController.migrateActivityPosterTables);
// 修复AI记忆表结构
router.post('/fix-ai-memories', auth_middleware_1.authMiddleware, migration_controller_1.MigrationController.fixAIMemoriesTable);
// 检查迁移状态
router.get('/status', auth_middleware_1.authMiddleware, migration_controller_1.MigrationController.checkMigrationStatus);
// 回滚迁移
router.post('/rollback', auth_middleware_1.authMiddleware, migration_controller_1.MigrationController.rollbackMigration);
exports["default"] = router;
