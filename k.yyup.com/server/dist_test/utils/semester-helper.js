"use strict";
/**
 * 学期辅助工具
 * 用于动态获取当前学期和学年
 */
exports.__esModule = true;
exports.getNextSemester = exports.getPreviousSemester = exports.formatSemesterName = exports.getSemesterDateRange = exports.parseSemester = exports.getCurrentSemester = void 0;
/**
 * 获取当前学期信息
 * 根据当前日期自动判断学期
 *
 * 学期划分规则：
 * - 第一学期：9月1日 - 1月31日 (例如：2024-2025-1)
 * - 第二学期：2月1日 - 8月31日 (例如：2024-2025-2)
 */
function getCurrentSemester() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1; // 0-11 -> 1-12
    var semester;
    var academicYear;
    // 判断学期
    if (month >= 9 && month <= 12) {
        // 9月-12月：第一学期，学年是当前年-下一年
        semester = "".concat(year, "-").concat(year + 1, "-1");
        academicYear = "".concat(year, "-").concat(year + 1);
    }
    else if (month >= 1 && month <= 1) {
        // 1月：第一学期，学年是上一年-当前年
        semester = "".concat(year - 1, "-").concat(year, "-1");
        academicYear = "".concat(year - 1, "-").concat(year);
    }
    else if (month >= 2 && month <= 8) {
        // 2月-8月：第二学期，学年是上一年-当前年
        semester = "".concat(year - 1, "-").concat(year, "-2");
        academicYear = "".concat(year - 1, "-").concat(year);
    }
    else {
        // 默认值（不应该到达这里）
        semester = "".concat(year, "-").concat(year + 1, "-1");
        academicYear = "".concat(year, "-").concat(year + 1);
    }
    return { semester: semester, academicYear: academicYear };
}
exports.getCurrentSemester = getCurrentSemester;
/**
 * 解析学期字符串
 * @param semesterStr 学期字符串，例如 "2024-2025-1"
 * @returns 解析后的学期信息
 */
function parseSemester(semesterStr) {
    var match = semesterStr.match(/^(\d{4})-(\d{4})-([12])$/);
    if (!match) {
        return null;
    }
    return {
        startYear: parseInt(match[1]),
        endYear: parseInt(match[2]),
        semesterNumber: parseInt(match[3])
    };
}
exports.parseSemester = parseSemester;
/**
 * 获取学期的开始和结束日期
 * @param semester 学期字符串，例如 "2024-2025-1"
 * @returns 学期的开始和结束日期
 */
function getSemesterDateRange(semester) {
    var parsed = parseSemester(semester);
    if (!parsed) {
        return null;
    }
    var startYear = parsed.startYear, endYear = parsed.endYear, semesterNumber = parsed.semesterNumber;
    if (semesterNumber === 1) {
        // 第一学期：9月1日 - 1月31日
        return {
            startDate: new Date(startYear, 8, 1),
            endDate: new Date(endYear, 0, 31, 23, 59, 59) // 1月31日
        };
    }
    else {
        // 第二学期：2月1日 - 8月31日
        return {
            startDate: new Date(endYear, 1, 1),
            endDate: new Date(endYear, 7, 31, 23, 59, 59) // 8月31日
        };
    }
}
exports.getSemesterDateRange = getSemesterDateRange;
/**
 * 格式化学期显示名称
 * @param semester 学期字符串，例如 "2024-2025-1"
 * @returns 格式化后的显示名称，例如 "2024-2025学年第一学期"
 */
function formatSemesterName(semester) {
    var parsed = parseSemester(semester);
    if (!parsed) {
        return semester;
    }
    var startYear = parsed.startYear, endYear = parsed.endYear, semesterNumber = parsed.semesterNumber;
    var semesterText = semesterNumber === 1 ? '第一学期' : '第二学期';
    return "".concat(startYear, "-").concat(endYear, "\u5B66\u5E74").concat(semesterText);
}
exports.formatSemesterName = formatSemesterName;
/**
 * 获取上一个学期
 * @param semester 当前学期字符串，例如 "2024-2025-1"
 * @returns 上一个学期字符串
 */
function getPreviousSemester(semester) {
    var parsed = parseSemester(semester);
    if (!parsed) {
        return null;
    }
    var startYear = parsed.startYear, endYear = parsed.endYear, semesterNumber = parsed.semesterNumber;
    if (semesterNumber === 1) {
        // 第一学期的上一个学期是上一学年的第二学期
        return "".concat(startYear - 1, "-").concat(endYear - 1, "-2");
    }
    else {
        // 第二学期的上一个学期是本学年的第一学期
        return "".concat(startYear, "-").concat(endYear, "-1");
    }
}
exports.getPreviousSemester = getPreviousSemester;
/**
 * 获取下一个学期
 * @param semester 当前学期字符串，例如 "2024-2025-1"
 * @returns 下一个学期字符串
 */
function getNextSemester(semester) {
    var parsed = parseSemester(semester);
    if (!parsed) {
        return null;
    }
    var startYear = parsed.startYear, endYear = parsed.endYear, semesterNumber = parsed.semesterNumber;
    if (semesterNumber === 1) {
        // 第一学期的下一个学期是本学年的第二学期
        return "".concat(startYear, "-").concat(endYear, "-2");
    }
    else {
        // 第二学期的下一个学期是下一学年的第一学期
        return "".concat(startYear + 1, "-").concat(endYear + 1, "-1");
    }
}
exports.getNextSemester = getNextSemester;
