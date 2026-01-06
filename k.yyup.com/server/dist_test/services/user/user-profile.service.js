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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.UserProfileService = void 0;
var init_1 = require("../../init");
var user_model_1 = require("../../models/user.model");
var user_profile_model_1 = require("../../models/user-profile.model");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var uuid_1 = require("uuid");
/**
 * 用户资料服务实现
 * @description 实现用户个人资料管理相关的业务逻辑
 */
var UserProfileService = /** @class */ (function () {
    function UserProfileService() {
        // 头像存储目录
        this.AVATAR_DIR = path_1["default"].join(process.cwd(), 'public', 'uploads', 'avatars');
    }
    /**
     * 确保头像存储目录存在
     */
    UserProfileService.prototype.ensureAvatarDir = function () {
        if (!fs_1["default"].existsSync(this.AVATAR_DIR)) {
            fs_1["default"].mkdirSync(this.AVATAR_DIR, { recursive: true });
        }
    };
    /**
     * 创建用户资料
     * @param data 用户资料创建数据
     * @returns 创建结果
     */
    UserProfileService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, user, existingProfile, profile, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, user_model_1.User.findByPk(data.userId, { transaction: transaction })];
                    case 3:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        return [4 /*yield*/, user_profile_model_1.UserProfile.findOne({
                                where: { userId: data.userId },
                                transaction: transaction
                            })];
                    case 4:
                        existingProfile = _a.sent();
                        if (existingProfile) {
                            throw new Error('用户资料已存在');
                        }
                        return [4 /*yield*/, user_profile_model_1.UserProfile.create({
                                userId: data.userId,
                                avatar: data.avatar || null,
                                gender: data.gender !== undefined ? data.gender : null,
                                birthday: data.birthday || null,
                                address: data.address || null,
                                education: data.education || null,
                                introduction: data.introduction || null,
                                tags: data.tags ? JSON.stringify(data.tags) : null,
                                contactInfo: data.contactInfo ? JSON.stringify(data.contactInfo) : null,
                                extendedInfo: data.extendedInfo ? JSON.stringify(data.extendedInfo) : null
                            }, { transaction: transaction })];
                    case 5:
                        profile = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, profile];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        console.error('创建用户资料失败:', error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据用户ID获取用户资料
     * @param userId 用户ID
     * @returns 用户资料信息
     */
    UserProfileService.prototype.findByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, plainProfile, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_profile_model_1.UserProfile.findOne({
                                where: { userId: userId },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['id', 'username', 'email', 'realName', 'phone', 'status']
                                    }
                                ]
                            })];
                    case 1:
                        profile = _a.sent();
                        if (!profile) {
                            return [2 /*return*/, null];
                        }
                        plainProfile = profile.get({ plain: true });
                        result = __assign({}, plainProfile);
                        // 处理标签
                        if (plainProfile.tags) {
                            try {
                                // Sequelize automatically parses JSON string fields
                                result.tags = Array.isArray(plainProfile.tags) ? plainProfile.tags : JSON.parse(plainProfile.tags);
                            }
                            catch (e) {
                                result.tags = [];
                            }
                        }
                        else {
                            result.tags = [];
                        }
                        // 处理联系信息
                        if (plainProfile.contactInfo) {
                            try {
                                result.contactInfo = typeof plainProfile.contactInfo === 'object' ? plainProfile.contactInfo : JSON.parse(plainProfile.contactInfo);
                            }
                            catch (e) {
                                result.contactInfo = {};
                            }
                        }
                        else {
                            result.contactInfo = {};
                        }
                        // 处理扩展信息
                        if (plainProfile.extendedInfo) {
                            try {
                                result.extendedInfo = typeof plainProfile.extendedInfo === 'object' ? plainProfile.extendedInfo : JSON.parse(plainProfile.extendedInfo);
                            }
                            catch (e) {
                                result.extendedInfo = {};
                            }
                        }
                        else {
                            result.extendedInfo = {};
                        }
                        return [2 /*return*/, result];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取用户资料失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户资料
     * @param userId 用户ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    UserProfileService.prototype.update = function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, updateData, currentExtendedInfo, newExtendedInfo, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 11]);
                        return [4 /*yield*/, user_profile_model_1.UserProfile.findOne({
                                where: { userId: userId },
                                transaction: transaction
                            })];
                    case 3:
                        profile = _a.sent();
                        if (!!profile) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.create(__assign({ userId: userId }, data))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        updateData = {};
                        if (data.avatar !== undefined)
                            updateData.avatar = data.avatar;
                        if (data.gender !== undefined)
                            updateData.gender = data.gender;
                        if (data.birthday !== undefined)
                            updateData.birthday = data.birthday;
                        if (data.address !== undefined)
                            updateData.address = data.address;
                        if (data.education !== undefined)
                            updateData.education = data.education;
                        if (data.introduction !== undefined)
                            updateData.introduction = data.introduction;
                        // 处理标签
                        if (data.tags !== undefined) {
                            updateData.tags = JSON.stringify(data.tags);
                        }
                        // 处理联系信息
                        if (data.contactInfo !== undefined) {
                            updateData.contactInfo = JSON.stringify(data.contactInfo);
                        }
                        // 处理扩展信息
                        if (data.extendedInfo !== undefined) {
                            currentExtendedInfo = {};
                            if (profile.extendedInfo) {
                                try {
                                    currentExtendedInfo = JSON.parse(profile.extendedInfo);
                                }
                                catch (e) {
                                    // 如果解析失败，使用空对象
                                }
                            }
                            newExtendedInfo = __assign(__assign({}, currentExtendedInfo), data.extendedInfo);
                            updateData.extendedInfo = JSON.stringify(newExtendedInfo);
                        }
                        // 更新资料
                        return [4 /*yield*/, profile.update(updateData, { transaction: transaction })];
                    case 7:
                        // 更新资料
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 9:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _a.sent();
                        console.error('更新用户资料失败:', error_3);
                        throw error_3;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除用户资料
     * @param userId 用户ID
     * @returns 是否删除成功
     */
    UserProfileService.prototype["delete"] = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_profile_model_1.UserProfile.destroy({
                                where: { userId: userId }
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('删除用户资料失败:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 上传用户头像
     * @param userId 用户ID
     * @param file 头像文件
     * @returns 头像URL
     */
    UserProfileService.prototype.uploadAvatar = function (userId, file) {
        return __awaiter(this, void 0, void 0, function () {
            var fileExt, fileName, filePath, avatarUrl, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 确保目录存在
                        this.ensureAvatarDir();
                        fileExt = path_1["default"].extname(file.originalname);
                        fileName = "".concat(userId, "_").concat((0, uuid_1.v4)()).concat(fileExt);
                        filePath = path_1["default"].join(this.AVATAR_DIR, fileName);
                        // 写入文件
                        fs_1["default"].writeFileSync(filePath, file.buffer);
                        avatarUrl = "/uploads/avatars/".concat(fileName);
                        // 更新用户资料的头像字段
                        return [4 /*yield*/, this.update(userId, { avatar: avatarUrl })];
                    case 1:
                        // 更新用户资料的头像字段
                        _a.sent();
                        return [2 /*return*/, avatarUrl];
                    case 2:
                        error_5 = _a.sent();
                        console.error('上传头像失败:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户标签列表
     * @param userId 用户ID
     * @returns 标签列表
     */
    UserProfileService.prototype.getUserTags = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertProfileExists(userId)];
                    case 1:
                        profile = _a.sent();
                        if (!profile.tags)
                            return [2 /*return*/, []];
                        try {
                            return [2 /*return*/, JSON.parse(profile.tags)];
                        }
                        catch (e) {
                            return [2 /*return*/, []];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 添加用户标签
     * @param userId 用户ID
     * @param tags 标签列表
     * @returns 是否添加成功
     */
    UserProfileService.prototype.addUserTags = function (userId, tags) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, currentTags, newTags, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.assertProfileExists(userId, transaction)];
                    case 3:
                        profile = _a.sent();
                        currentTags = [];
                        if (profile.tags) {
                            try {
                                currentTags = JSON.parse(profile.tags);
                            }
                            catch (e) {
                                // 如果解析失败，使用空数组
                            }
                        }
                        newTags = __spreadArray([], new Set(__spreadArray(__spreadArray([], currentTags, true), tags, true)), true);
                        return [4 /*yield*/, profile.update({ tags: JSON.stringify(newTags) }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_6 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        console.error('添加用户标签失败:', error_6);
                        throw error_6;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 移除用户标签
     * @param userId 用户ID
     * @param tags 标签列表
     * @returns 是否移除成功
     */
    UserProfileService.prototype.removeUserTags = function (userId, tags) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, currentTags, newTags, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.assertProfileExists(userId, transaction)];
                    case 3:
                        profile = _a.sent();
                        currentTags = [];
                        if (profile.tags) {
                            try {
                                currentTags = JSON.parse(profile.tags);
                            }
                            catch (e) {
                                // 如果解析失败，使用空数组
                            }
                        }
                        newTags = currentTags.filter(function (tag) { return !tags.includes(tag); });
                        return [4 /*yield*/, profile.update({ tags: JSON.stringify(newTags) }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_7 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        console.error('移除用户标签失败:', error_7);
                        throw error_7;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户扩展信息
     * @param userId 用户ID
     * @param key 键名
     * @param value 键值
     * @returns 是否更新成功
     */
    UserProfileService.prototype.updateExtendedInfo = function (userId, key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, extendedInfo, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.assertProfileExists(userId, transaction)];
                    case 3:
                        profile = _a.sent();
                        extendedInfo = {};
                        if (profile.extendedInfo) {
                            try {
                                extendedInfo = JSON.parse(profile.extendedInfo);
                            }
                            catch (e) {
                                // 如果解析失败，使用空对象
                            }
                        }
                        extendedInfo[key] = value;
                        return [4 /*yield*/, profile.update({ extendedInfo: JSON.stringify(extendedInfo) }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_8 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        console.error('更新扩展信息失败:', error_8);
                        throw error_8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户扩展信息
     * @param userId 用户ID
     * @param key 键名，不提供则获取所有
     * @returns 扩展信息值
     */
    UserProfileService.prototype.getExtendedInfo = function (userId, key) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, extendedInfo, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.assertProfileExists(userId)];
                    case 1:
                        profile = _a.sent();
                        extendedInfo = {};
                        if (profile.extendedInfo) {
                            try {
                                extendedInfo = JSON.parse(profile.extendedInfo);
                            }
                            catch (e) {
                                // 如果解析失败，使用空对象
                            }
                        }
                        if (key) {
                            return [2 /*return*/, extendedInfo[key]];
                        }
                        return [2 /*return*/, extendedInfo];
                    case 2:
                        error_9 = _a.sent();
                        console.error('获取扩展信息失败:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除用户扩展信息
     * @param userId 用户ID
     * @param key 键名
     * @returns 是否删除成功
     */
    UserProfileService.prototype.deleteExtendedInfo = function (userId, key) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, extendedInfo, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, this.assertProfileExists(userId, transaction)];
                    case 3:
                        profile = _a.sent();
                        extendedInfo = {};
                        if (profile.extendedInfo) {
                            try {
                                extendedInfo = JSON.parse(profile.extendedInfo);
                            }
                            catch (e) {
                                // 如果解析失败，使用空对象
                            }
                        }
                        if (!(key in extendedInfo)) return [3 /*break*/, 5];
                        delete extendedInfo[key];
                        return [4 /*yield*/, profile.update({ extendedInfo: JSON.stringify(extendedInfo) }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_10 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        console.error('删除扩展信息失败:', error_10);
                        throw error_10;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户联系信息
     * @param userId 用户ID
     * @returns 联系信息对象
     */
    UserProfileService.prototype.getContactInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.assertProfileExists(userId)];
                    case 1:
                        profile = _a.sent();
                        if (!profile.contactInfo)
                            return [2 /*return*/, {}];
                        try {
                            return [2 /*return*/, JSON.parse(profile.contactInfo)];
                        }
                        catch (e) {
                            return [2 /*return*/, {}];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户联系信息
     * @param userId 用户ID
     * @param contactInfo 联系信息
     * @returns 是否更新成功
     */
    UserProfileService.prototype.updateContactInfo = function (userId, contactInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, profile, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.assertProfileExists(userId, transaction)];
                    case 3:
                        profile = _a.sent();
                        return [4 /*yield*/, profile.update({ contactInfo: JSON.stringify(contactInfo) }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_11 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        console.error('更新联系信息失败:', error_11);
                        throw error_11;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 辅助函数：断言用户资料存在
     * @param userId 用户ID
     * @param transaction 事务对象
     * @returns 用户资料实例
     */
    UserProfileService.prototype.assertProfileExists = function (userId, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_profile_model_1.UserProfile.findOne({ where: { userId: userId }, transaction: transaction })];
                    case 1:
                        profile = _a.sent();
                        if (!profile) {
                            throw new Error('用户资料不存在');
                        }
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    return UserProfileService;
}());
exports.UserProfileService = UserProfileService;
exports["default"] = new UserProfileService();
