"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getSystemSettingsByGroup = exports.setSystemSetting = exports.getSystemSetting = exports.initSystemSettings = void 0;
/**
 * 初始化系统设置默认数据
 */
var system_config_model_1 = require("../models/system-config.model");
var init_1 = require("../init");
var defaultSettings = [
    // 基本设置
    {
        groupKey: 'basic',
        configKey: 'siteName',
        configValue: '幼儿园管理系统',
        valueType: system_config_model_1.ConfigValueType.STRING,
        description: '站点名称',
        isSystem: true,
        isReadonly: false,
        sortOrder: 1
    },
    {
        groupKey: 'basic',
        configKey: 'version',
        configValue: '1.0.0',
        valueType: system_config_model_1.ConfigValueType.STRING,
        description: '系统版本',
        isSystem: true,
        isReadonly: true,
        sortOrder: 2
    },
    {
        groupKey: 'basic',
        configKey: 'timezone',
        configValue: 'Asia/Shanghai',
        valueType: system_config_model_1.ConfigValueType.STRING,
        description: '系统时区',
        isSystem: true,
        isReadonly: false,
        sortOrder: 3
    },
    {
        groupKey: 'basic',
        configKey: 'language',
        configValue: 'zh-CN',
        valueType: system_config_model_1.ConfigValueType.STRING,
        description: '系统语言',
        isSystem: true,
        isReadonly: false,
        sortOrder: 4
    },
    {
        groupKey: 'basic',
        configKey: 'maintenanceMode',
        configValue: 'false',
        valueType: system_config_model_1.ConfigValueType.BOOLEAN,
        description: '维护模式',
        isSystem: true,
        isReadonly: false,
        sortOrder: 5
    },
    // 安全设置
    {
        groupKey: 'security',
        configKey: 'sessionTimeout',
        configValue: '1440',
        valueType: system_config_model_1.ConfigValueType.NUMBER,
        description: '会话超时时间（分钟）',
        isSystem: true,
        isReadonly: false,
        sortOrder: 1
    },
    {
        groupKey: 'security',
        configKey: 'passwordComplexity',
        configValue: JSON.stringify({
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
        }),
        valueType: system_config_model_1.ConfigValueType.JSON,
        description: '密码复杂度要求',
        isSystem: true,
        isReadonly: false,
        sortOrder: 2
    },
    {
        groupKey: 'security',
        configKey: 'minPasswordLength',
        configValue: '8',
        valueType: system_config_model_1.ConfigValueType.NUMBER,
        description: '最短密码长度',
        isSystem: true,
        isReadonly: false,
        sortOrder: 3
    },
    // 邮件设置
    {
        groupKey: 'email',
        configKey: 'emailNotifications',
        configValue: 'true',
        valueType: system_config_model_1.ConfigValueType.BOOLEAN,
        description: '邮件通知开关',
        isSystem: true,
        isReadonly: false,
        sortOrder: 1
    },
    {
        groupKey: 'email',
        configKey: 'smsNotifications',
        configValue: 'false',
        valueType: system_config_model_1.ConfigValueType.BOOLEAN,
        description: '短信通知开关',
        isSystem: true,
        isReadonly: false,
        sortOrder: 2
    },
    // 存储设置
    {
        groupKey: 'storage',
        configKey: 'maxFileSize',
        configValue: '10MB',
        valueType: system_config_model_1.ConfigValueType.STRING,
        description: '最大文件上传大小',
        isSystem: true,
        isReadonly: false,
        sortOrder: 1
    }
];
/**
 * 初始化系统设置
 */
function initSystemSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, defaultSettings_1, setting, existing, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log('🔧 开始初始化系统设置...');
                    // 检查数据库连接
                    return [4 /*yield*/, init_1.sequelize.authenticate()];
                case 1:
                    // 检查数据库连接
                    _a.sent();
                    console.log('✅ 数据库连接成功');
                    _i = 0, defaultSettings_1 = defaultSettings;
                    _a.label = 2;
                case 2:
                    if (!(_i < defaultSettings_1.length)) return [3 /*break*/, 7];
                    setting = defaultSettings_1[_i];
                    return [4 /*yield*/, system_config_model_1.SystemConfig.findOne({
                            where: {
                                groupKey: setting.groupKey,
                                configKey: setting.configKey
                            }
                        })];
                case 3:
                    existing = _a.sent();
                    if (!!existing) return [3 /*break*/, 5];
                    return [4 /*yield*/, system_config_model_1.SystemConfig.create(__assign(__assign({}, setting), { creatorId: 1 // 假设管理员用户ID为1
                         }))];
                case 4:
                    _a.sent();
                    console.log("\u2705 \u521B\u5EFA\u8BBE\u7F6E: ".concat(setting.groupKey, ".").concat(setting.configKey, " = ").concat(setting.configValue));
                    return [3 /*break*/, 6];
                case 5:
                    console.log("\u23ED\uFE0F  \u8BBE\u7F6E\u5DF2\u5B58\u5728: ".concat(setting.groupKey, ".").concat(setting.configKey));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log('🎉 系统设置初始化完成！');
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ 系统设置初始化失败:', error_1);
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.initSystemSettings = initSystemSettings;
/**
 * 获取系统设置值
 */
function getSystemSetting(groupKey, configKey) {
    return __awaiter(this, void 0, void 0, function () {
        var setting, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, system_config_model_1.SystemConfig.findOne({
                            where: {
                                groupKey: groupKey,
                                configKey: configKey
                            }
                        })];
                case 1:
                    setting = _a.sent();
                    if (!setting) {
                        return [2 /*return*/, null];
                    }
                    // 根据值类型转换返回值
                    switch (setting.valueType) {
                        case 'number':
                            return [2 /*return*/, Number(setting.configValue)];
                        case 'boolean':
                            return [2 /*return*/, setting.configValue === 'true'];
                        case 'json':
                            return [2 /*return*/, JSON.parse(setting.configValue)];
                        default:
                            return [2 /*return*/, setting.configValue];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("\u83B7\u53D6\u7CFB\u7EDF\u8BBE\u7F6E\u5931\u8D25: ".concat(groupKey, ".").concat(configKey), error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getSystemSetting = getSystemSetting;
/**
 * 设置系统设置值
 */
function setSystemSetting(groupKey, configKey, value, updaterId) {
    return __awaiter(this, void 0, void 0, function () {
        var setting, configValue, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, system_config_model_1.SystemConfig.findOne({
                            where: {
                                groupKey: groupKey,
                                configKey: configKey
                            }
                        })];
                case 1:
                    setting = _a.sent();
                    if (!setting) {
                        console.error("\u7CFB\u7EDF\u8BBE\u7F6E\u4E0D\u5B58\u5728: ".concat(groupKey, ".").concat(configKey));
                        return [2 /*return*/, false];
                    }
                    configValue = void 0;
                    switch (setting.valueType) {
                        case 'json':
                            configValue = JSON.stringify(value);
                            break;
                        default:
                            configValue = String(value);
                    }
                    return [4 /*yield*/, setting.update({
                            configValue: configValue,
                            updaterId: updaterId
                        })];
                case 2:
                    _a.sent();
                    console.log("\u2705 \u66F4\u65B0\u8BBE\u7F6E: ".concat(groupKey, ".").concat(configKey, " = ").concat(configValue));
                    return [2 /*return*/, true];
                case 3:
                    error_3 = _a.sent();
                    console.error("\u8BBE\u7F6E\u7CFB\u7EDF\u8BBE\u7F6E\u5931\u8D25: ".concat(groupKey, ".").concat(configKey), error_3);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.setSystemSetting = setSystemSetting;
/**
 * 获取分组的所有设置
 */
function getSystemSettingsByGroup(groupKey) {
    return __awaiter(this, void 0, void 0, function () {
        var settings, result, _i, settings_1, setting, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, system_config_model_1.SystemConfig.findAll({
                            where: {
                                groupKey: groupKey
                            },
                            order: [['sortOrder', 'ASC']]
                        })];
                case 1:
                    settings = _a.sent();
                    result = {};
                    for (_i = 0, settings_1 = settings; _i < settings_1.length; _i++) {
                        setting = settings_1[_i];
                        // 根据值类型转换返回值
                        switch (setting.valueType) {
                            case 'number':
                                result[setting.configKey] = Number(setting.configValue);
                                break;
                            case 'boolean':
                                result[setting.configKey] = setting.configValue === 'true';
                                break;
                            case 'json':
                                result[setting.configKey] = JSON.parse(setting.configValue);
                                break;
                            default:
                                result[setting.configKey] = setting.configValue;
                        }
                    }
                    return [2 /*return*/, result];
                case 2:
                    error_4 = _a.sent();
                    console.error("\u83B7\u53D6\u5206\u7EC4\u8BBE\u7F6E\u5931\u8D25: ".concat(groupKey), error_4);
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getSystemSettingsByGroup = getSystemSettingsByGroup;
// 如果直接运行此脚本
if (require.main === module) {
    initSystemSettings()
        .then(function () {
        console.log('系统设置初始化完成');
        process.exit(0);
    })["catch"](function (error) {
        console.error('系统设置初始化失败:', error);
        process.exit(1);
    });
}
