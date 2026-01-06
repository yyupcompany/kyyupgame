"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.AIUserPermission = exports.PermissionValue = exports.PermissionKey = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
// 定义常用权限键
var PermissionKey;
(function (PermissionKey) {
    PermissionKey["USE_TEXT_MODELS"] = "use_text_models";
    PermissionKey["USE_IMAGE_MODELS"] = "use_image_models";
    PermissionKey["USE_SPEECH_MODELS"] = "use_speech_models";
    PermissionKey["USE_VIDEO_MODELS"] = "use_video_models";
    PermissionKey["CUSTOM_PROMPTS"] = "custom_prompts";
    PermissionKey["ADVANCED_SETTINGS"] = "advanced_settings";
    PermissionKey["EXPORT_DATA"] = "export_data";
    PermissionKey["VIEW_ANALYTICS"] = "view_analytics";
    PermissionKey["ADMIN_ACCESS"] = "admin_access";
    PermissionKey["AI_ADMIN"] = "ai:admin";
})(PermissionKey = exports.PermissionKey || (exports.PermissionKey = {}));
// 定义权限值
var PermissionValue;
(function (PermissionValue) {
    PermissionValue[PermissionValue["DENIED"] = 0] = "DENIED";
    PermissionValue[PermissionValue["ALLOWED"] = 1] = "ALLOWED";
    PermissionValue[PermissionValue["ADVANCED"] = 2] = "ADVANCED";
})(PermissionValue = exports.PermissionValue || (exports.PermissionValue = {}));
/**
 * AI用户权限模型类
 */
var AIUserPermission = /** @class */ (function (_super) {
    __extends(AIUserPermission, _super);
    function AIUserPermission() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 检查用户是否拥有指定权限
    AIUserPermission.checkUserPermission = function (userId, permissionKey, requiredLevel) {
        if (requiredLevel === void 0) { requiredLevel = PermissionValue.ALLOWED; }
        return __awaiter(this, void 0, void 0, function () {
            var permission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AIUserPermission.findOne({
                            where: {
                                userId: userId,
                                permissionKey: permissionKey
                            }
                        })];
                    case 1:
                        permission = _a.sent();
                        // 如果没有找到权限记录，默认拒绝
                        if (!permission) {
                            return [2 /*return*/, false];
                        }
                        // 检查权限值是否大于或等于要求的级别
                        return [2 /*return*/, permission.permissionValue >= requiredLevel];
                }
            });
        });
    };
    // 获取用户的所有权限
    AIUserPermission.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, permissionMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AIUserPermission.findAll({
                            where: {
                                userId: userId
                            }
                        })];
                    case 1:
                        permissions = _a.sent();
                        permissionMap = {};
                        permissions.forEach(function (permission) {
                            permissionMap[permission.permissionKey] = permission.permissionValue;
                        });
                        return [2 /*return*/, permissionMap];
                }
            });
        });
    };
    // 设置用户权限
    AIUserPermission.setPermission = function (userId, permissionKey, permissionValue) {
        return __awaiter(this, void 0, void 0, function () {
            var permission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AIUserPermission.findOrCreate({
                            where: {
                                userId: userId,
                                permissionKey: permissionKey
                            },
                            defaults: {
                                userId: userId,
                                permissionKey: permissionKey,
                                permissionValue: permissionValue
                            }
                        })];
                    case 1:
                        permission = (_a.sent())[0];
                        if (!(permission.permissionValue !== permissionValue)) return [3 /*break*/, 3];
                        permission.permissionValue = permissionValue;
                        return [4 /*yield*/, permission.save()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, permission];
                }
            });
        });
    };
    // 批量设置用户权限
    AIUserPermission.setBulkPermissions = function (userId, permissions, sequelize) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, _a, _b, key, value, _c, permission, created;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _i = 0, _a = Object.entries(permissions);
                                        _d.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        _b = _a[_i], key = _b[0], value = _b[1];
                                        return [4 /*yield*/, AIUserPermission.findOrCreate({
                                                where: {
                                                    userId: userId,
                                                    permissionKey: key
                                                },
                                                defaults: {
                                                    userId: userId,
                                                    permissionKey: key,
                                                    permissionValue: value
                                                },
                                                transaction: transaction
                                            })];
                                    case 2:
                                        _c = _d.sent(), permission = _c[0], created = _c[1];
                                        if (!(!created && permission.permissionValue !== value)) return [3 /*break*/, 4];
                                        permission.permissionValue = value;
                                        return [4 /*yield*/, permission.save({ transaction: transaction })];
                                    case 3:
                                        _d.sent();
                                        _d.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AIUserPermission.initModel = function (sequelize) {
        AIUserPermission.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                comment: '用户ID',
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            permissionKey: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(PermissionKey)),
                allowNull: false,
                field: 'permission_key',
                comment: '权限键名'
            },
            permissionValue: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: PermissionValue.DENIED,
                field: 'permission_value',
                comment: '权限值 - 0:拒绝 1:允许 2:高级'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'ai_user_permissions',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    name: 'user_permission_idx',
                    unique: true,
                    fields: ['user_id', 'permission_key']
                },
            ]
        });
    };
    AIUserPermission.initAssociations = function () {
        AIUserPermission.belongsTo(user_model_1.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };
    return AIUserPermission;
}(sequelize_1.Model));
exports.AIUserPermission = AIUserPermission;
exports["default"] = AIUserPermission;
