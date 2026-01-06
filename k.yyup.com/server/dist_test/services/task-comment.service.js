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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.TaskCommentService = void 0;
var database_service_1 = require("./database.service");
var TaskCommentService = /** @class */ (function () {
    function TaskCommentService() {
        this.db = new database_service_1.DatabaseService();
    }
    /**
     * 获取任务评论列表
     */
    TaskCommentService.prototype.getTaskComments = function (taskId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, offset, query, comments, countQuery, countResult, total, commentTree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = options.page, limit = options.limit;
                        offset = (page - 1) * limit;
                        query = "\n      SELECT \n        tc.*,\n        u.name as user_name,\n        u.avatar as user_avatar,\n        u.role as user_role\n      FROM task_comments tc\n      LEFT JOIN users u ON tc.user_id = u.id\n      WHERE tc.task_id = ?\n      ORDER BY tc.created_at ASC\n      LIMIT ? OFFSET ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [taskId, limit, offset])];
                    case 1:
                        comments = _a.sent();
                        countQuery = 'SELECT COUNT(*) as total FROM task_comments WHERE task_id = ?';
                        return [4 /*yield*/, this.db.query(countQuery, [taskId])];
                    case 2:
                        countResult = (_a.sent())[0];
                        total = countResult.total;
                        commentTree = this.buildCommentTree(comments);
                        return [2 /*return*/, {
                                data: commentTree,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    };
    /**
     * 添加评论
     */
    TaskCommentService.prototype.addComment = function (commentData) {
        return __awaiter(this, void 0, void 0, function () {
            var task_id, user_id, content, _a, type, parent_id, attachments, _b, is_internal, query, params, result, commentId, getCommentQuery, comment;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        task_id = commentData.task_id, user_id = commentData.user_id, content = commentData.content, _a = commentData.type, type = _a === void 0 ? 'comment' : _a, parent_id = commentData.parent_id, attachments = commentData.attachments, _b = commentData.is_internal, is_internal = _b === void 0 ? false : _b;
                        query = "\n      INSERT INTO task_comments (\n        task_id, user_id, content, type, parent_id, attachments, is_internal\n      ) VALUES (?, ?, ?, ?, ?, ?, ?)\n    ";
                        params = [
                            task_id,
                            user_id,
                            content,
                            type,
                            parent_id,
                            attachments ? JSON.stringify(attachments) : null,
                            is_internal
                        ];
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        result = _c.sent();
                        commentId = result.insertId;
                        getCommentQuery = "\n      SELECT \n        tc.*,\n        u.name as user_name,\n        u.avatar as user_avatar,\n        u.role as user_role\n      FROM task_comments tc\n      LEFT JOIN users u ON tc.user_id = u.id\n      WHERE tc.id = ?\n    ";
                        return [4 /*yield*/, this.db.query(getCommentQuery, [commentId])];
                    case 2:
                        comment = (_c.sent())[0];
                        return [2 /*return*/, comment];
                }
            });
        });
    };
    /**
     * 更新评论
     */
    TaskCommentService.prototype.updateComment = function (id, updateData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var checkQuery, existingComment, updateFields, params, query, getCommentQuery, comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkQuery = 'SELECT user_id FROM task_comments WHERE id = ?';
                        return [4 /*yield*/, this.db.query(checkQuery, [id])];
                    case 1:
                        existingComment = (_a.sent())[0];
                        if (!existingComment) {
                            throw new Error('评论不存在');
                        }
                        if (existingComment.user_id !== userId) {
                            throw new Error('无权限修改此评论');
                        }
                        updateFields = [];
                        params = [];
                        Object.keys(updateData).forEach(function (key) {
                            if (key !== 'id' && updateData[key] !== undefined) {
                                updateFields.push("".concat(key, " = ?"));
                                if (key === 'attachments') {
                                    params.push(JSON.stringify(updateData[key]));
                                }
                                else {
                                    params.push(updateData[key]);
                                }
                            }
                        });
                        if (updateFields.length === 0) {
                            throw new Error('没有需要更新的字段');
                        }
                        query = "\n      UPDATE task_comments \n      SET ".concat(updateFields.join(', '), ", updated_at = CURRENT_TIMESTAMP\n      WHERE id = ?\n    ");
                        return [4 /*yield*/, this.db.query(query, __spreadArray(__spreadArray([], params, true), [id], false))];
                    case 2:
                        _a.sent();
                        getCommentQuery = "\n      SELECT \n        tc.*,\n        u.name as user_name,\n        u.avatar as user_avatar,\n        u.role as user_role\n      FROM task_comments tc\n      LEFT JOIN users u ON tc.user_id = u.id\n      WHERE tc.id = ?\n    ";
                        return [4 /*yield*/, this.db.query(getCommentQuery, [id])];
                    case 3:
                        comment = (_a.sent())[0];
                        return [2 /*return*/, comment];
                }
            });
        });
    };
    /**
     * 删除评论
     */
    TaskCommentService.prototype.deleteComment = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var checkQuery, existingComment, deleteQuery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        checkQuery = 'SELECT user_id FROM task_comments WHERE id = ?';
                        return [4 /*yield*/, this.db.query(checkQuery, [id])];
                    case 1:
                        existingComment = (_a.sent())[0];
                        if (!existingComment) {
                            throw new Error('评论不存在');
                        }
                        if (existingComment.user_id !== userId) {
                            throw new Error('无权限删除此评论');
                        }
                        deleteQuery = 'DELETE FROM task_comments WHERE id = ? OR parent_id = ?';
                        return [4 /*yield*/, this.db.query(deleteQuery, [id, id])];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取评论统计
     */
    TaskCommentService.prototype.getCommentStats = function (taskId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        COUNT(*) as total_comments,\n        SUM(CASE WHEN type = 'comment' THEN 1 ELSE 0 END) as general_comments,\n        SUM(CASE WHEN type = 'feedback' THEN 1 ELSE 0 END) as feedback_comments,\n        SUM(CASE WHEN type = 'question' THEN 1 ELSE 0 END) as question_comments,\n        SUM(CASE WHEN type = 'correction' THEN 1 ELSE 0 END) as correction_comments,\n        SUM(CASE WHEN type = 'completion' THEN 1 ELSE 0 END) as completion_comments\n      FROM task_comments\n      WHERE task_id = ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [taskId])];
                    case 1:
                        stats = (_a.sent())[0];
                        return [2 /*return*/, stats];
                }
            });
        });
    };
    /**
     * 构建评论树结构
     */
    TaskCommentService.prototype.buildCommentTree = function (comments) {
        var commentMap = new Map();
        var rootComments = [];
        // 首先创建所有评论的映射
        comments.forEach(function (comment) {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });
        // 然后构建树结构
        comments.forEach(function (comment) {
            if (comment.parent_id) {
                var parent_1 = commentMap.get(comment.parent_id);
                if (parent_1) {
                    parent_1.replies.push(comment);
                }
            }
            else {
                rootComments.push(comment);
            }
        });
        return rootComments;
    };
    /**
     * 获取最近的评论
     */
    TaskCommentService.prototype.getRecentComments = function (taskId, limit) {
        if (limit === void 0) { limit = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        tc.*,\n        u.name as user_name,\n        u.avatar as user_avatar\n      FROM task_comments tc\n      LEFT JOIN users u ON tc.user_id = u.id\n      WHERE tc.task_id = ?\n      ORDER BY tc.created_at DESC\n      LIMIT ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [taskId, limit])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 标记评论为已读
     */
    TaskCommentService.prototype.markCommentAsRead = function (commentId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以实现评论已读状态的逻辑
                // 可以创建一个 comment_reads 表来跟踪用户的阅读状态
                // 暂时先记录日志
                console.log("\u7528\u6237 ".concat(userId, " \u5DF2\u8BFB\u8BC4\u8BBA ").concat(commentId));
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取用户未读评论数量
     */
    TaskCommentService.prototype.getUnreadCommentCount = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT COUNT(*) as unread_count\n      FROM task_comments tc\n      INNER JOIN tasks t ON tc.task_id = t.id\n      WHERE (t.assignee_id = ? OR t.creator_id = ?)\n        AND tc.user_id != ?\n        AND tc.created_at > COALESCE(\n          (SELECT last_read_at FROM user_comment_reads WHERE user_id = ? AND task_id = tc.task_id),\n          '1970-01-01'\n        )\n    ";
                        return [4 /*yield*/, this.db.query(query, [userId, userId, userId, userId])];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, result.unread_count || 0];
                }
            });
        });
    };
    return TaskCommentService;
}());
exports.TaskCommentService = TaskCommentService;
