"use strict";
/**
 * 搜索工具类
 * 提供统一的搜索功能和查询构建
 */
exports.__esModule = true;
exports.PaginationHelper = exports.SearchHelper = void 0;
var sequelize_1 = require("sequelize");
/**
 * 搜索工具类
 */
var SearchHelper = /** @class */ (function () {
    function SearchHelper() {
    }
    /**
     * 构建搜索查询条件
     * @param params 搜索参数
     * @param config 搜索配置
     * @param tableAlias 表别名
     * @returns 查询构建结果
     */
    SearchHelper.buildSearchQuery = function (params, config, tableAlias) {
        var _a, _b, _c, _d;
        if (tableAlias === void 0) { tableAlias = 't'; }
        var whereConditions = [];
        var replacements = {};
        // 处理关键词搜索
        if (params.keyword && config.searchFields.length > 0) {
            var keywordConditions = config.searchFields.map(function (field) {
                var sqlField = field.includes('.') ? field : "".concat(tableAlias, ".").concat(field);
                return "".concat(sqlField, " LIKE :keyword");
            });
            whereConditions.push("(".concat(keywordConditions.join(' OR '), ")"));
            replacements.keyword = "%".concat(params.keyword, "%");
        }
        // 处理过滤条件
        if (config.filterFields) {
            for (var _i = 0, _e = config.filterFields; _i < _e.length; _i++) {
                var filterConfig = _e[_i];
                var paramValue = params[filterConfig.field];
                if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
                    // 验证参数
                    if (filterConfig.validator && !filterConfig.validator(paramValue)) {
                        continue;
                    }
                    // 转换参数值
                    var value = filterConfig.transformer
                        ? filterConfig.transformer(paramValue)
                        : paramValue;
                    var sqlField = filterConfig.sqlField || "".concat(tableAlias, ".").concat(filterConfig.field);
                    var paramKey = filterConfig.field;
                    switch (filterConfig.type) {
                        case 'exact':
                            whereConditions.push("".concat(sqlField, " = :").concat(paramKey));
                            replacements[paramKey] = value;
                            break;
                        case 'like':
                            whereConditions.push("".concat(sqlField, " LIKE :").concat(paramKey));
                            replacements[paramKey] = "%".concat(value, "%");
                            break;
                        case 'in':
                            if (Array.isArray(value) && value.length > 0) {
                                whereConditions.push("".concat(sqlField, " IN (:").concat(paramKey, ")"));
                                replacements[paramKey] = value;
                            }
                            break;
                        case 'range':
                            if (typeof value === 'object' && value.min !== undefined) {
                                whereConditions.push("".concat(sqlField, " >= :").concat(paramKey, "_min"));
                                replacements["".concat(paramKey, "_min")] = value.min;
                            }
                            if (typeof value === 'object' && value.max !== undefined) {
                                whereConditions.push("".concat(sqlField, " <= :").concat(paramKey, "_max"));
                                replacements["".concat(paramKey, "_max")] = value.max;
                            }
                            break;
                        case 'date_range':
                            if (typeof value === 'object') {
                                if (value.startDate) {
                                    whereConditions.push("".concat(sqlField, " >= :").concat(paramKey, "_start"));
                                    replacements["".concat(paramKey, "_start")] = value.startDate;
                                }
                                if (value.endDate) {
                                    whereConditions.push("".concat(sqlField, " <= :").concat(paramKey, "_end"));
                                    replacements["".concat(paramKey, "_end")] = value.endDate;
                                }
                            }
                            break;
                    }
                }
            }
        }
        // 构建WHERE子句
        var whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';
        // 调试日志
        console.log('SearchHelper调试:', {
            whereConditions: whereConditions,
            whereClause: whereClause,
            replacements: replacements
        });
        // 构建ORDER BY子句
        var orderBy = '';
        if (params.sortBy && ((_a = config.sortFields) === null || _a === void 0 ? void 0 : _a.includes(params.sortBy))) {
            var sortField = params.sortBy.includes('.') ? params.sortBy : "".concat(tableAlias, ".").concat(params.sortBy);
            var sortOrder = ((_b = params.sortOrder) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === 'DESC' ? 'DESC' : 'ASC';
            orderBy = "ORDER BY ".concat(sortField, " ").concat(sortOrder);
        }
        else if (config.defaultSort) {
            var defaultField = config.defaultSort.field.includes('.')
                ? config.defaultSort.field
                : "".concat(tableAlias, ".").concat(config.defaultSort.field);
            orderBy = "ORDER BY ".concat(defaultField, " ").concat(config.defaultSort.order);
        }
        // 更多调试日志
        console.log('SearchHelper ORDER BY调试:', {
            orderBy: orderBy,
            configDefaultSort: config.defaultSort,
            sortFields: config.sortFields
        });
        // 计算分页
        var page = Math.max(1, parseInt(((_c = params.page) === null || _c === void 0 ? void 0 : _c.toString()) || '1'));
        var pageSize = Math.min(100, Math.max(1, parseInt(((_d = params.pageSize) === null || _d === void 0 ? void 0 : _d.toString()) || '10')));
        var offset = (page - 1) * pageSize;
        return {
            whereClause: whereClause,
            replacements: replacements,
            orderBy: orderBy,
            limit: pageSize,
            offset: offset
        };
    };
    /**
     * 构建Sequelize WHERE条件
     * @param params 搜索参数
     * @param config 搜索配置
     * @returns Sequelize WHERE条件对象
     */
    SearchHelper.buildSequelizeWhere = function (params, config) {
        var _a, _b;
        var whereConditions = {};
        // 处理关键词搜索
        if (params.keyword && config.searchFields.length > 0) {
            var keywordConditions = config.searchFields.map(function (field) {
                var _a, _b;
                return (_a = {},
                    _a[field] = (_b = {}, _b[sequelize_1.Op.like] = "%".concat(params.keyword, "%"), _b),
                    _a);
            });
            whereConditions[sequelize_1.Op.or] = keywordConditions;
        }
        // 处理过滤条件
        if (config.filterFields) {
            for (var _i = 0, _c = config.filterFields; _i < _c.length; _i++) {
                var filterConfig = _c[_i];
                var paramValue = params[filterConfig.field];
                if (paramValue !== undefined && paramValue !== null && paramValue !== '') {
                    // 验证参数
                    if (filterConfig.validator && !filterConfig.validator(paramValue)) {
                        continue;
                    }
                    // 转换参数值
                    var value = filterConfig.transformer
                        ? filterConfig.transformer(paramValue)
                        : paramValue;
                    var fieldName = filterConfig.sqlField || filterConfig.field;
                    switch (filterConfig.type) {
                        case 'exact':
                            whereConditions[fieldName] = value;
                            break;
                        case 'like':
                            whereConditions[fieldName] = (_a = {}, _a[sequelize_1.Op.like] = "%".concat(value, "%"), _a);
                            break;
                        case 'in':
                            if (Array.isArray(value) && value.length > 0) {
                                whereConditions[fieldName] = (_b = {}, _b[sequelize_1.Op["in"]] = value, _b);
                            }
                            break;
                        case 'range':
                            if (typeof value === 'object') {
                                var rangeCondition = {};
                                if (value.min !== undefined)
                                    rangeCondition[sequelize_1.Op.gte] = value.min;
                                if (value.max !== undefined)
                                    rangeCondition[sequelize_1.Op.lte] = value.max;
                                if (Object.keys(rangeCondition).length > 0) {
                                    whereConditions[fieldName] = rangeCondition;
                                }
                            }
                            break;
                        case 'date_range':
                            if (typeof value === 'object') {
                                var dateCondition = {};
                                if (value.startDate)
                                    dateCondition[sequelize_1.Op.gte] = value.startDate;
                                if (value.endDate)
                                    dateCondition[sequelize_1.Op.lte] = value.endDate;
                                if (Object.keys(dateCondition).length > 0) {
                                    whereConditions[fieldName] = dateCondition;
                                }
                            }
                            break;
                    }
                }
            }
        }
        return whereConditions;
    };
    /**
     * 创建通用的搜索配置
     * @param searchFields 搜索字段
     * @param filterFields 过滤字段配置
     * @returns 搜索配置
     */
    SearchHelper.createConfig = function (searchFields, filterFields) {
        if (filterFields === void 0) { filterFields = []; }
        return {
            searchFields: searchFields,
            filterFields: filterFields,
            sortFields: ['created_at', 'updated_at', 'id'],
            defaultSort: { field: 'created_at', order: 'DESC' }
        };
    };
    /**
     * 预定义的搜索配置
     */
    SearchHelper.configs = {
        // 用户搜索配置
        user: SearchHelper.createConfig(['u.real_name', 'u.username', 'u.phone', 'u.email'], [
            { field: 'status', type: 'exact' },
            { field: 'role', type: 'exact' },
            { field: 'kindergartenId', type: 'exact', sqlField: 'u.kindergarten_id' }
        ]),
        // 教师搜索配置
        teacher: SearchHelper.createConfig(['u.real_name', 'u.phone', 'u.email', 't.teacher_no'], [
            { field: 'status', type: 'exact', sqlField: 't.status' },
            { field: 'kindergartenId', type: 'exact', sqlField: 't.kindergarten_id' },
            { field: 'position', type: 'exact', sqlField: 't.position' }
        ]),
        // 学生搜索配置
        student: SearchHelper.createConfig(['s.name', 's.student_no', 'p.phone'], [
            { field: 'status', type: 'exact', sqlField: 's.status' },
            { field: 'classId', type: 'exact', sqlField: 's.class_id' },
            { field: 'grade', type: 'exact', sqlField: 's.grade' }
        ]),
        // 班级搜索配置
        "class": SearchHelper.createConfig(['c.name', 'c.description'], [
            { field: 'status', type: 'exact', sqlField: 'c.status' },
            { field: 'grade', type: 'exact', sqlField: 'c.grade' },
            { field: 'kindergartenId', type: 'exact', sqlField: 'c.kindergarten_id' }
        ]),
        // 申请搜索配置
        application: SearchHelper.createConfig(['ea.student_name', 'u.real_name', 'u.phone'], [
            { field: 'status', type: 'exact', sqlField: 'ea.status' },
            { field: 'planId', type: 'exact', sqlField: 'ea.plan_id' },
            {
                field: 'dateRange',
                type: 'date_range',
                sqlField: 'ea.apply_date',
                transformer: function (value) {
                    if (Array.isArray(value) && value.length === 2) {
                        return { startDate: value[0], endDate: value[1] };
                    }
                    return value;
                }
            }
        ])
    };
    return SearchHelper;
}());
exports.SearchHelper = SearchHelper;
/**
 * 分页辅助函数
 */
var PaginationHelper = /** @class */ (function () {
    function PaginationHelper() {
    }
    /**
     * 获取分页参数
     */
    PaginationHelper.getParams = function (page, pageSize) {
        var validPage = Math.max(1, parseInt((page === null || page === void 0 ? void 0 : page.toString()) || '1'));
        var validPageSize = Math.min(100, Math.max(1, parseInt((pageSize === null || pageSize === void 0 ? void 0 : pageSize.toString()) || '10')));
        var offset = (validPage - 1) * validPageSize;
        return {
            page: validPage,
            pageSize: validPageSize,
            offset: offset,
            limit: validPageSize
        };
    };
    /**
     * 构建分页响应
     */
    PaginationHelper.buildResponse = function (items, total, page, pageSize) {
        var totalPages = Math.ceil(total / pageSize);
        return {
            items: items,
            total: total,
            page: page,
            pageSize: pageSize,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    };
    return PaginationHelper;
}());
exports.PaginationHelper = PaginationHelper;
