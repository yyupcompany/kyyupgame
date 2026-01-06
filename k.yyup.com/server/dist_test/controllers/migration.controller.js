"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MigrationController = void 0;
var init_1 = require("../init");
var response_handler_1 = require("../utils/response-handler");
/**
 * 数据库迁移控制器
 * 用于执行数据库表结构更新
 */
var MigrationController = /** @class */ (function () {
    function MigrationController() {
    }
    /**
     * 执行活动海报相关表的迁移
     */
    MigrationController.migrateActivityPosterTables = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var columnsToAdd, _i, columnsToAdd_1, column, columnExists, error_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        console.log('开始执行活动海报相关表迁移...');
                        columnsToAdd = [
                            { name: 'poster_id', sql: 'ADD COLUMN poster_id INT NULL COMMENT \'关联的主海报ID\'' },
                            { name: 'poster_url', sql: 'ADD COLUMN poster_url VARCHAR(500) NULL COMMENT \'主海报URL\'' },
                            { name: 'share_poster_url', sql: 'ADD COLUMN share_poster_url VARCHAR(500) NULL COMMENT \'分享海报URL\'' },
                            { name: 'marketing_config', sql: 'ADD COLUMN marketing_config JSON NULL COMMENT \'营销配置信息(团购、积分、分享等)\'' },
                            { name: 'publish_status', sql: 'ADD COLUMN publish_status TINYINT NOT NULL DEFAULT 0 COMMENT \'发布状态 - 0:草稿 1:已发布 2:已暂停\'' },
                            { name: 'share_count', sql: 'ADD COLUMN share_count INT NOT NULL DEFAULT 0 COMMENT \'分享次数\'' },
                            { name: 'view_count', sql: 'ADD COLUMN view_count INT NOT NULL DEFAULT 0 COMMENT \'浏览次数\'' }
                        ];
                        _i = 0, columnsToAdd_1 = columnsToAdd;
                        _a.label = 1;
                    case 1:
                        if (!(_i < columnsToAdd_1.length)) return [3 /*break*/, 9];
                        column = columnsToAdd_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, init_1.sequelize.query("\n            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS\n            WHERE TABLE_SCHEMA = DATABASE()\n            AND TABLE_NAME = 'activities'\n            AND COLUMN_NAME = '".concat(column.name, "'\n          "))];
                    case 3:
                        columnExists = _a.sent();
                        if (!(columnExists[0].length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, init_1.sequelize.query("ALTER TABLE activities ".concat(column.sql))];
                    case 4:
                        _a.sent();
                        console.log("\u2705 \u6DFB\u52A0\u5B57\u6BB5 ".concat(column.name, " \u6210\u529F"));
                        return [3 /*break*/, 6];
                    case 5:
                        console.log("\u26A0\uFE0F \u5B57\u6BB5 ".concat(column.name, " \u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7"));
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error("\u274C \u6DFB\u52A0\u5B57\u6BB5 ".concat(column.name, " \u5931\u8D25:"), error_1);
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: 
                    // 2. 创建活动海报关联表
                    return [4 /*yield*/, init_1.sequelize.query("\n        CREATE TABLE IF NOT EXISTS activity_posters (\n          id INT PRIMARY KEY AUTO_INCREMENT COMMENT '\u5173\u8054ID',\n          activity_id INT NOT NULL COMMENT '\u6D3B\u52A8ID',\n          poster_id INT NOT NULL COMMENT '\u6D77\u62A5ID',\n          poster_type ENUM('main', 'share', 'detail', 'preview') NOT NULL DEFAULT 'main' COMMENT '\u6D77\u62A5\u7C7B\u578B',\n          is_active BOOLEAN NOT NULL DEFAULT true COMMENT '\u662F\u5426\u542F\u7528',\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n          INDEX idx_activity_id (activity_id),\n          INDEX idx_poster_id (poster_id),\n          INDEX idx_activity_poster_type (activity_id, poster_type)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='\u6D3B\u52A8\u6D77\u62A5\u5173\u8054\u8868'\n      ")];
                    case 10:
                        // 2. 创建活动海报关联表
                        _a.sent();
                        // 3. 创建活动分享记录表
                        return [4 /*yield*/, init_1.sequelize.query("\n        CREATE TABLE IF NOT EXISTS activity_shares (\n          id INT PRIMARY KEY AUTO_INCREMENT COMMENT '\u5206\u4EAB\u8BB0\u5F55ID',\n          activity_id INT NOT NULL COMMENT '\u6D3B\u52A8ID',\n          poster_id INT NULL COMMENT '\u5206\u4EAB\u7684\u6D77\u62A5ID',\n          share_channel ENUM('wechat', 'weibo', 'qq', 'link', 'qrcode', 'other') NOT NULL COMMENT '\u5206\u4EAB\u6E20\u9053',\n          share_url VARCHAR(500) NULL COMMENT '\u5206\u4EAB\u94FE\u63A5',\n          sharer_id INT NULL COMMENT '\u5206\u4EAB\u8005ID',\n          share_ip VARCHAR(45) NULL COMMENT '\u5206\u4EAB\u8005IP',\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n          INDEX idx_activity_id (activity_id),\n          INDEX idx_share_channel (share_channel),\n          INDEX idx_created_at (created_at)\n        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='\u6D3B\u52A8\u5206\u4EAB\u8BB0\u5F55\u8868'\n      ")];
                    case 11:
                        // 3. 创建活动分享记录表
                        _a.sent();
                        console.log('✅ 活动海报相关表迁移完成');
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                message: '活动海报相关表迁移成功',
                                tables: ['activities (新增字段)', 'activity_posters', 'activity_shares']
                            })];
                    case 12:
                        error_2 = _a.sent();
                        console.error('迁移失败:', error_2);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '数据库迁移失败: ' + error_2.message)];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 修复AI记忆表结构
     */
    MigrationController.fixAIMemoriesTable = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tableExists, fieldsToCheck, _i, fieldsToCheck_1, field, fieldExists, error_3, indexes, _a, indexes_1, index, indexExists, error_4, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 22, , 23]);
                        console.log('开始修复AI记忆表结构...');
                        return [4 /*yield*/, init_1.sequelize.query("\n        SHOW TABLES LIKE 'ai_memories'\n      ")];
                    case 1:
                        tableExists = _b.sent();
                        if (!(tableExists[0].length === 0)) return [3 /*break*/, 3];
                        // 创建ai_memories表
                        return [4 /*yield*/, init_1.sequelize.query("\n          CREATE TABLE ai_memories (\n            id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'AI\u8BB0\u5FC6ID',\n            user_id INT NOT NULL COMMENT '\u7528\u6237ID',\n            conversation_id VARCHAR(255) NULL COMMENT '\u4F1A\u8BDDID',\n            content TEXT NOT NULL COMMENT '\u8BB0\u5FC6\u5185\u5BB9',\n            importance FLOAT NOT NULL DEFAULT 0.5 COMMENT '\u91CD\u8981\u6027\u8BC4\u5206',\n            memory_type ENUM('short_term', 'long_term', 'working') NOT NULL DEFAULT 'short_term' COMMENT '\u8BB0\u5FC6\u7C7B\u578B',\n            embedding LONGBLOB NULL COMMENT '\u5411\u91CF\u5D4C\u5165',\n            expires_at TIMESTAMP NULL COMMENT '\u8FC7\u671F\u65F6\u95F4',\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n            INDEX idx_user_id (user_id),\n            INDEX idx_conversation_id (conversation_id),\n            INDEX idx_memory_type (memory_type),\n            INDEX idx_importance (importance)\n          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI\u8BB0\u5FC6\u8868'\n        ")];
                    case 2:
                        // 创建ai_memories表
                        _b.sent();
                        console.log('✅ 创建ai_memories表成功');
                        return [3 /*break*/, 21];
                    case 3:
                        fieldsToCheck = [
                            { name: 'user_id', sql: 'ADD COLUMN user_id INT NOT NULL COMMENT \'用户ID\' AFTER id' },
                            { name: 'conversation_id', sql: 'ADD COLUMN conversation_id VARCHAR(255) NULL COMMENT \'会话ID\' AFTER user_id' },
                            { name: 'content', sql: 'ADD COLUMN content TEXT NOT NULL COMMENT \'记忆内容\' AFTER conversation_id' },
                            { name: 'importance', sql: 'ADD COLUMN importance FLOAT NOT NULL DEFAULT 0.5 COMMENT \'重要性评分\' AFTER content' },
                            { name: 'memory_type', sql: 'ADD COLUMN memory_type ENUM(\'short_term\', \'long_term\', \'working\') NOT NULL DEFAULT \'short_term\' COMMENT \'记忆类型\' AFTER importance' },
                            { name: 'embedding', sql: 'ADD COLUMN embedding LONGBLOB NULL COMMENT \'向量嵌入\' AFTER memory_type' },
                            { name: 'expires_at', sql: 'ADD COLUMN expires_at TIMESTAMP NULL COMMENT \'过期时间\' AFTER embedding' }
                        ];
                        _i = 0, fieldsToCheck_1 = fieldsToCheck;
                        _b.label = 4;
                    case 4:
                        if (!(_i < fieldsToCheck_1.length)) return [3 /*break*/, 12];
                        field = fieldsToCheck_1[_i];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 10, , 11]);
                        return [4 /*yield*/, init_1.sequelize.query("\n              SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS\n              WHERE TABLE_SCHEMA = DATABASE()\n              AND TABLE_NAME = 'ai_memories'\n              AND COLUMN_NAME = '".concat(field.name, "'\n            "))];
                    case 6:
                        fieldExists = _b.sent();
                        if (!(fieldExists[0].length === 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, init_1.sequelize.query("ALTER TABLE ai_memories ".concat(field.sql))];
                    case 7:
                        _b.sent();
                        console.log("\u2705 \u6DFB\u52A0\u5B57\u6BB5 ".concat(field.name, " \u6210\u529F"));
                        return [3 /*break*/, 9];
                    case 8:
                        console.log("\u26A0\uFE0F \u5B57\u6BB5 ".concat(field.name, " \u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7"));
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_3 = _b.sent();
                        console.error("\u274C \u6DFB\u52A0\u5B57\u6BB5 ".concat(field.name, " \u5931\u8D25:"), error_3);
                        return [3 /*break*/, 11];
                    case 11:
                        _i++;
                        return [3 /*break*/, 4];
                    case 12:
                        indexes = [
                            { name: 'idx_user_id', sql: 'ADD INDEX idx_user_id (user_id)' },
                            { name: 'idx_conversation_id', sql: 'ADD INDEX idx_conversation_id (conversation_id)' },
                            { name: 'idx_memory_type', sql: 'ADD INDEX idx_memory_type (memory_type)' },
                            { name: 'idx_importance', sql: 'ADD INDEX idx_importance (importance)' }
                        ];
                        _a = 0, indexes_1 = indexes;
                        _b.label = 13;
                    case 13:
                        if (!(_a < indexes_1.length)) return [3 /*break*/, 21];
                        index = indexes_1[_a];
                        _b.label = 14;
                    case 14:
                        _b.trys.push([14, 19, , 20]);
                        return [4 /*yield*/, init_1.sequelize.query("\n              SHOW INDEX FROM ai_memories WHERE Key_name = '".concat(index.name, "'\n            "))];
                    case 15:
                        indexExists = _b.sent();
                        if (!(indexExists[0].length === 0)) return [3 /*break*/, 17];
                        return [4 /*yield*/, init_1.sequelize.query("ALTER TABLE ai_memories ".concat(index.sql))];
                    case 16:
                        _b.sent();
                        console.log("\u2705 \u6DFB\u52A0\u7D22\u5F15 ".concat(index.name, " \u6210\u529F"));
                        return [3 /*break*/, 18];
                    case 17:
                        console.log("\u26A0\uFE0F \u7D22\u5F15 ".concat(index.name, " \u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7"));
                        _b.label = 18;
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_4 = _b.sent();
                        console.error("\u274C \u6DFB\u52A0\u7D22\u5F15 ".concat(index.name, " \u5931\u8D25:"), error_4);
                        return [3 /*break*/, 20];
                    case 20:
                        _a++;
                        return [3 /*break*/, 13];
                    case 21:
                        console.log('✅ AI记忆表结构修复完成');
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                message: 'AI记忆表结构修复成功',
                                table: 'ai_memories'
                            })];
                    case 22:
                        error_5 = _b.sent();
                        console.error('AI记忆表修复失败:', error_5);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, 'AI记忆表修复失败: ' + error_5.message)];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查迁移状态
     */
    MigrationController.checkMigrationStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activitiesColumns, activityPostersExists, activitySharesExists, status_1, allMigrated, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SHOW COLUMNS FROM activities LIKE 'poster_id'\n      ")];
                    case 1:
                        activitiesColumns = _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SHOW TABLES LIKE 'activity_posters'\n      ")];
                    case 2:
                        activityPostersExists = _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SHOW TABLES LIKE 'activity_shares'\n      ")];
                    case 3:
                        activitySharesExists = _a.sent();
                        status_1 = {
                            activitiesTableUpdated: activitiesColumns[0].length > 0,
                            activityPostersTableExists: activityPostersExists[0].length > 0,
                            activitySharesTableExists: activitySharesExists[0].length > 0
                        };
                        allMigrated = status_1.activitiesTableUpdated &&
                            status_1.activityPostersTableExists &&
                            status_1.activitySharesTableExists;
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                migrationStatus: allMigrated ? 'completed' : 'pending',
                                details: status_1
                            })];
                    case 4:
                        error_6 = _a.sent();
                        console.error('检查迁移状态失败:', error_6);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '检查迁移状态失败: ' + error_6.message)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 回滚迁移
     */
    MigrationController.rollbackMigration = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('开始回滚活动海报相关表迁移...');
                        // 删除新创建的表
                        return [4 /*yield*/, init_1.sequelize.query("DROP TABLE IF EXISTS activity_shares")];
                    case 1:
                        // 删除新创建的表
                        _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query("DROP TABLE IF EXISTS activity_posters")];
                    case 2:
                        _a.sent();
                        // 删除activities表中的新字段
                        return [4 /*yield*/, init_1.sequelize.query("\n        ALTER TABLE activities \n        DROP COLUMN IF EXISTS view_count,\n        DROP COLUMN IF EXISTS share_count,\n        DROP COLUMN IF EXISTS publish_status,\n        DROP COLUMN IF EXISTS marketing_config,\n        DROP COLUMN IF EXISTS share_poster_url,\n        DROP COLUMN IF EXISTS poster_url,\n        DROP COLUMN IF EXISTS poster_id\n      ")];
                    case 3:
                        // 删除activities表中的新字段
                        _a.sent();
                        console.log('✅ 迁移回滚完成');
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                message: '迁移回滚成功'
                            })];
                    case 4:
                        error_7 = _a.sent();
                        console.error('回滚失败:', error_7);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '迁移回滚失败: ' + error_7.message)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return MigrationController;
}());
exports.MigrationController = MigrationController;
