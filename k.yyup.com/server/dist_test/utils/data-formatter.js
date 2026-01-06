"use strict";
/**
 * 数据格式化工具函数
 * 提供一组函数用于格式化API响应数据
 */
exports.__esModule = true;
exports.createPaginationResponseFromQuery = exports.convertKeysToCamelCase = exports.snakeToCamel = exports.removeNullValues = exports.handleNull = exports.formatPaginationResponse = exports.safelyGetArrayFromQuery = exports.ensureArray = void 0;
/**
 * 确保数据为数组
 * @param data 原始数据，可能是数组、对象或null
 * @returns 保证返回数组的数据
 */
function ensureArray(data) {
    if (data === null || data === undefined) {
        return [];
    }
    return Array.isArray(data) ? data : [data];
}
exports.ensureArray = ensureArray;
/**
 * 安全地从查询结果获取数组
 * 解决Sequelize查询返回单个对象而非数组的问题
 * @param queryResult 查询结果
 * @returns 数组格式的查询结果
 */
function safelyGetArrayFromQuery(queryResult) {
    return ensureArray(queryResult);
}
exports.safelyGetArrayFromQuery = safelyGetArrayFromQuery;
/**
 * 格式化分页响应
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页大小
 * @param list 数据列表
 * @returns 标准格式的分页响应
 */
function formatPaginationResponse(total, page, pageSize, list) {
    return {
        total: total,
        page: page,
        pageSize: pageSize,
        list: ensureArray(list) // 确保list始终是数组
    };
}
exports.formatPaginationResponse = formatPaginationResponse;
/**
 * 处理空值
 * @param value 原始值
 * @param defaultValue 默认值
 * @returns 处理后的值
 */
function handleNull(value, defaultValue) {
    return value === null || value === undefined ? defaultValue : value;
}
exports.handleNull = handleNull;
/**
 * 移除对象中的空值
 * @param obj 原始对象
 * @returns 移除空值后的对象
 */
function removeNullValues(obj) {
    var result = {};
    Object.keys(obj).forEach(function (key) {
        if (obj[key] !== null && obj[key] !== undefined) {
            result[key] = obj[key];
        }
    });
    return result;
}
exports.removeNullValues = removeNullValues;
/**
 * 将下划线命名转换为驼峰命名
 * @param str 下划线命名的字符串
 * @returns 驼峰命名的字符串
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, function (match, group) { return group.toUpperCase(); });
}
exports.snakeToCamel = snakeToCamel;
/**
 * 将对象的键从下划线命名转换为驼峰命名
 * @param obj 原始对象
 * @returns 转换后的对象
 */
function convertKeysToCamelCase(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return convertKeysToCamelCase(item); });
    }
    var result = {};
    Object.keys(obj).forEach(function (key) {
        var camelKey = snakeToCamel(key);
        var value = obj[key];
        if (typeof value === 'object' && value !== null) {
            result[camelKey] = convertKeysToCamelCase(value);
        }
        else {
            result[camelKey] = value;
        }
    });
    return result;
}
exports.convertKeysToCamelCase = convertKeysToCamelCase;
/**
 * 从数据库查询结果创建分页响应
 * 一步完成查询结果到分页响应的转换
 * @param queryResult Sequelize查询结果
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页记录数
 * @returns 格式化后的分页响应
 */
function createPaginationResponseFromQuery(queryResult, total, page, pageSize) {
    var list = safelyGetArrayFromQuery(queryResult);
    return formatPaginationResponse(total, page, pageSize, list);
}
exports.createPaginationResponseFromQuery = createPaginationResponseFromQuery;
