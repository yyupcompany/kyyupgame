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
exports.validateUpdateStudentStatus = exports.validateStudentId = exports.validateStudentQuery = exports.validateAddParentRelation = exports.validateAssignToClass = exports.validateUpdateStudent = exports.validateCreateStudent = exports.studentFilterSchema = exports.updateStudentStatusSchema = exports.batchAssignClassSchema = exports.assignClassSchema = exports.updateStudentProfileSchema = exports.updateStudentSchema = exports.createStudentSchema = void 0;
var Joi = require('joi');
/**
 * 创建学生验证规则
 */
exports.createStudentSchema = Joi.object({
    name: Joi.string().max(50).required().messages({
        'string.base': '姓名必须是字符串',
        'string.empty': '姓名不能为空',
        'string.max': '姓名最多50个字符',
        'any.required': '姓名是必填项'
    }),
    studentNo: Joi.string().max(50).required().messages({
        'string.base': '学号必须是字符串',
        'string.empty': '学号不能为空',
        'string.max': '学号最多50个字符',
        'any.required': '学号是必填项'
    }),
    kindergartenId: Joi.number().integer().positive().required().messages({
        'number.base': '幼儿园ID必须是数字',
        'number.integer': '幼儿园ID必须是整数',
        'number.positive': '幼儿园ID必须是正数',
        'any.required': '幼儿园ID是必填项'
    }),
    classId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数'
    }),
    gender: Joi.number().valid(0, 1, 2).required().messages({
        'number.base': '性别必须是数字',
        'any.only': '性别只能是0(未知)、1(男)或2(女)',
        'any.required': '性别是必填项'
    }),
    birthDate: Joi.date().iso().required().messages({
        'date.base': '出生日期必须是有效的日期',
        'date.format': '出生日期必须是ISO格式(YYYY-MM-DD)',
        'any.required': '出生日期是必填项'
    }),
    idCardNo: Joi.string().max(18).allow('', null).optional().messages({
        'string.base': '身份证号必须是字符串',
        'string.max': '身份证号最多18个字符'
    }),
    householdAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '户籍地址必须是字符串',
        'string.max': '户籍地址最多200个字符'
    }),
    currentAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '现居地址必须是字符串',
        'string.max': '现居地址最多200个字符'
    }),
    bloodType: Joi.string().max(10).allow('', null).optional().messages({
        'string.base': '血型必须是字符串',
        'string.max': '血型最多10个字符'
    }),
    nationality: Joi.string().max(50).allow('', null).optional().messages({
        'string.base': '民族必须是字符串',
        'string.max': '民族最多50个字符'
    }),
    enrollmentDate: Joi.date().iso().required().messages({
        'date.base': '入园日期必须是有效的日期',
        'date.format': '入园日期必须是ISO格式(YYYY-MM-DD)',
        'any.required': '入园日期是必填项'
    }),
    graduationDate: Joi.date().iso().allow('', null).optional().messages({
        'date.base': '毕业日期必须是有效的日期',
        'date.format': '毕业日期必须是ISO格式(YYYY-MM-DD)'
    }),
    healthCondition: Joi.string().allow('', null).optional().messages({
        'string.base': '健康状况必须是字符串'
    }),
    allergyHistory: Joi.string().allow('', null).optional().messages({
        'string.base': '过敏史必须是字符串'
    }),
    specialNeeds: Joi.string().allow('', null).optional().messages({
        'string.base': '特殊需求必须是字符串'
    }),
    photoUrl: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '照片URL必须是字符串',
        'string.max': '照片URL最多200个字符'
    }),
    interests: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '兴趣爱好必须是字符串',
        'string.max': '兴趣爱好最多500个字符'
    }),
    tags: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '标签必须是字符串',
        'string.max': '标签最多500个字符'
    }),
    status: Joi.number().valid(0, 1, 2)["default"](1).optional().messages({
        'number.base': '状态必须是数字',
        'any.only': '状态只能是0(离园)、1(在读)或2(休学)'
    }),
    remark: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '备注必须是字符串',
        'string.max': '备注最多500个字符'
    })
});
/**
 * 更新学生验证规则
 */
exports.updateStudentSchema = Joi.object({
    name: Joi.string().max(50).optional().messages({
        'string.base': '姓名必须是字符串',
        'string.empty': '姓名不能为空',
        'string.max': '姓名最多50个字符'
    }),
    studentNo: Joi.string().max(50).optional().messages({
        'string.base': '学号必须是字符串',
        'string.empty': '学号不能为空',
        'string.max': '学号最多50个字符'
    }),
    kindergartenId: Joi.number().integer().positive().optional().messages({
        'number.base': '幼儿园ID必须是数字',
        'number.integer': '幼儿园ID必须是整数',
        'number.positive': '幼儿园ID必须是正数'
    }),
    classId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数'
    }),
    gender: Joi.number().valid(0, 1, 2).optional().messages({
        'number.base': '性别必须是数字',
        'any.only': '性别只能是0(未知)、1(男)或2(女)'
    }),
    birthDate: Joi.date().iso().optional().messages({
        'date.base': '出生日期必须是有效的日期',
        'date.format': '出生日期必须是ISO格式(YYYY-MM-DD)'
    }),
    idCardNo: Joi.string().max(18).allow('', null).optional().messages({
        'string.base': '身份证号必须是字符串',
        'string.max': '身份证号最多18个字符'
    }),
    householdAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '户籍地址必须是字符串',
        'string.max': '户籍地址最多200个字符'
    }),
    currentAddress: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '现居地址必须是字符串',
        'string.max': '现居地址最多200个字符'
    }),
    bloodType: Joi.string().max(10).allow('', null).optional().messages({
        'string.base': '血型必须是字符串',
        'string.max': '血型最多10个字符'
    }),
    nationality: Joi.string().max(50).allow('', null).optional().messages({
        'string.base': '民族必须是字符串',
        'string.max': '民族最多50个字符'
    }),
    enrollmentDate: Joi.date().iso().optional().messages({
        'date.base': '入园日期必须是有效的日期',
        'date.format': '入园日期必须是ISO格式(YYYY-MM-DD)'
    }),
    graduationDate: Joi.date().iso().allow('', null).optional().messages({
        'date.base': '毕业日期必须是有效的日期',
        'date.format': '毕业日期必须是ISO格式(YYYY-MM-DD)'
    }),
    healthCondition: Joi.string().allow('', null).optional().messages({
        'string.base': '健康状况必须是字符串'
    }),
    allergyHistory: Joi.string().allow('', null).optional().messages({
        'string.base': '过敏史必须是字符串'
    }),
    specialNeeds: Joi.string().allow('', null).optional().messages({
        'string.base': '特殊需求必须是字符串'
    }),
    photoUrl: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '照片URL必须是字符串',
        'string.max': '照片URL最多200个字符'
    }),
    interests: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '兴趣爱好必须是字符串',
        'string.max': '兴趣爱好最多500个字符'
    }),
    tags: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '标签必须是字符串',
        'string.max': '标签最多500个字符'
    }),
    status: Joi.number().valid(0, 1, 2).optional().messages({
        'number.base': '状态必须是数字',
        'any.only': '状态只能是0(离园)、1(在读)或2(休学)'
    }),
    remark: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '备注必须是字符串',
        'string.max': '备注最多500个字符'
    })
});
/**
 * 学生档案管理验证规则
 */
exports.updateStudentProfileSchema = Joi.object({
    healthCondition: Joi.string().allow('', null).optional().messages({
        'string.base': '健康状况必须是字符串'
    }),
    allergyHistory: Joi.string().allow('', null).optional().messages({
        'string.base': '过敏史必须是字符串'
    }),
    specialNeeds: Joi.string().allow('', null).optional().messages({
        'string.base': '特殊需求必须是字符串'
    }),
    interests: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '兴趣爱好必须是字符串',
        'string.max': '兴趣爱好最多500个字符'
    }),
    tags: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '标签必须是字符串',
        'string.max': '标签最多500个字符'
    }),
    photoUrl: Joi.string().max(200).allow('', null).optional().messages({
        'string.base': '照片URL必须是字符串',
        'string.max': '照片URL最多200个字符'
    }),
    remark: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '备注必须是字符串',
        'string.max': '备注最多500个字符'
    })
});
/**
 * 班级分配验证规则
 */
exports.assignClassSchema = Joi.object({
    studentId: Joi.number().integer().positive().required().messages({
        'number.base': '学生ID必须是数字',
        'number.integer': '学生ID必须是整数',
        'number.positive': '学生ID必须是正数',
        'any.required': '学生ID是必填项'
    }),
    classId: Joi.number().integer().positive().required().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数',
        'any.required': '班级ID是必填项'
    })
});
/**
 * 批量班级分配验证规则
 */
exports.batchAssignClassSchema = Joi.object({
    studentIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        'array.base': '学生ID列表必须是数组',
        'array.min': '学生ID列表至少需要一个学生ID',
        'any.required': '学生ID列表是必填项'
    }),
    classId: Joi.number().integer().positive().required().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数',
        'any.required': '班级ID是必填项'
    })
});
/**
 * 学生状态更新验证规则
 */
exports.updateStudentStatusSchema = Joi.object({
    studentId: Joi.number().integer().positive().required().messages({
        'number.base': '学生ID必须是数字',
        'number.integer': '学生ID必须是整数',
        'number.positive': '学生ID必须是正数',
        'any.required': '学生ID是必填项'
    }),
    status: Joi.number().valid(0, 1, 2).required().messages({
        'number.base': '状态必须是数字',
        'any.only': '状态只能是0(离园)、1(在读)或2(休学)',
        'any.required': '状态是必填项'
    }),
    reason: Joi.string().max(500).allow('', null).optional().messages({
        'string.base': '原因必须是字符串',
        'string.max': '原因最多500个字符'
    })
});
/**
 * 学生查询过滤验证规则
 */
exports.studentFilterSchema = Joi.object({
    page: Joi.number().integer().min(1)["default"](1).optional().messages({
        'number.base': '页码必须是数字',
        'number.integer': '页码必须是整数',
        'number.min': '页码最小为1'
    }),
    pageSize: Joi.number().integer().min(1).max(100)["default"](10).optional().messages({
        'number.base': '每页数量必须是数字',
        'number.integer': '每页数量必须是整数',
        'number.min': '每页数量最小为1',
        'number.max': '每页数量最大为100'
    }),
    keyword: Joi.string().allow('', null).optional().messages({
        'string.base': '关键词必须是字符串'
    }),
    kindergartenId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': '幼儿园ID必须是数字',
        'number.integer': '幼儿园ID必须是整数',
        'number.positive': '幼儿园ID必须是正数'
    }),
    classId: Joi.number().integer().positive().allow(null).optional().messages({
        'number.base': '班级ID必须是数字',
        'number.integer': '班级ID必须是整数',
        'number.positive': '班级ID必须是正数'
    }),
    status: Joi.number().valid(0, 1, 2).allow(null).optional().messages({
        'number.base': '状态必须是数字',
        'any.only': '状态只能是0(离园)、1(在读)或2(休学)'
    }),
    gender: Joi.number().valid(0, 1, 2).allow(null).optional().messages({
        'number.base': '性别必须是数字',
        'any.only': '性别只能是0(未知)、1(男)或2(女)'
    }),
    ageStart: Joi.number().integer().min(0).allow(null).optional().messages({
        'number.base': '起始年龄必须是数字',
        'number.integer': '起始年龄必须是整数',
        'number.min': '起始年龄不能小于0'
    }),
    ageEnd: Joi.number().integer().min(0).allow(null).optional().messages({
        'number.base': '结束年龄必须是数字',
        'number.integer': '结束年龄必须是整数',
        'number.min': '结束年龄不能小于0'
    }),
    enrollmentDateStart: Joi.date().iso().allow(null).optional().messages({
        'date.base': '入园开始日期必须是有效的日期',
        'date.format': '入园开始日期必须是ISO格式(YYYY-MM-DD)'
    }),
    enrollmentDateEnd: Joi.date().iso().allow(null).optional().messages({
        'date.base': '入园结束日期必须是有效的日期',
        'date.format': '入园结束日期必须是ISO格式(YYYY-MM-DD)'
    }),
    tags: Joi.string().allow('', null).optional().messages({
        'string.base': '标签必须是字符串'
    }),
    sortBy: Joi.string().valid('created_at', 'name', 'studentNo', 'birthDate', 'enrollmentDate')["default"]('created_at').optional().messages({
        'string.base': '排序字段必须是字符串',
        'any.only': '排序字段只能是createdAt、name、studentNo、birthDate或enrollmentDate'
    }),
    sortOrder: Joi.string().valid('ASC', 'DESC')["default"]('DESC').optional().messages({
        'string.base': '排序方向必须是字符串',
        'any.only': '排序方向只能是ASC或DESC'
    })
});
var ApiError = require('../utils/apiError').ApiError;
/**
 * 验证创建学生数据
 */
var validateCreateStudent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = exports.createStudentSchema.validate(req.body), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateCreateStudent = validateCreateStudent;
/**
 * 验证更新学生数据
 */
var validateUpdateStudent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = exports.updateStudentSchema.validate(req.body), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateUpdateStudent = validateUpdateStudent;
/**
 * 验证班级分配数据
 */
var validateAssignToClass = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = exports.assignClassSchema.validate(req.body), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateAssignToClass = validateAssignToClass;
/**
 * 验证添加家长关系数据
 */
var validateAddParentRelation = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var addParentRelationSchema, _a, error, value;
    return __generator(this, function (_b) {
        try {
            addParentRelationSchema = Joi.object({
                parentId: Joi.number().integer().positive().required().messages({
                    'number.base': '家长ID必须是数字',
                    'number.integer': '家长ID必须是整数',
                    'number.positive': '家长ID必须是正数',
                    'any.required': '家长ID是必填项'
                }),
                relationshipType: Joi.string().valid('father', 'mother', 'guardian', 'grandparent', 'other').required().messages({
                    'string.base': '关系类型必须是字符串',
                    'any.only': '关系类型只能是father、mother、guardian、grandparent或other',
                    'any.required': '关系类型是必填项'
                })
            });
            _a = addParentRelationSchema.validate(req.body), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateAddParentRelation = validateAddParentRelation;
/**
 * 验证学生查询参数
 */
var validateStudentQuery = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = exports.studentFilterSchema.validate(req.query), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.query = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateStudentQuery = validateStudentQuery;
/**
 * 验证学生ID
 */
var validateStudentId = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = Joi.object({
                id: Joi.number().integer().positive().required().messages({
                    'number.base': '学生ID必须是数字',
                    'number.integer': '学生ID必须是整数',
                    'number.positive': '学生ID必须是正数',
                    'any.required': '学生ID是必填项'
                })
            }).validate({ id: req.params.id }), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.params.id = value.id;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateStudentId = validateStudentId;
/**
 * 验证更新学生状态数据
 */
var validateUpdateStudentStatus = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, error, value;
    return __generator(this, function (_b) {
        try {
            _a = exports.updateStudentStatusSchema.validate(req.body), error = _a.error, value = _a.value;
            if (error) {
                return [2 /*return*/, next(new ApiError(400, error.details[0].message))];
            }
            req.body = value;
            next();
        }
        catch (err) {
            next(new ApiError(500, '验证过程中发生错误'));
        }
        return [2 /*return*/];
    });
}); };
exports.validateUpdateStudentStatus = validateUpdateStudentStatus;
