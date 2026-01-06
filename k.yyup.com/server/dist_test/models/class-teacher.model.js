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
exports.__esModule = true;
exports.initClassTeacherAssociations = exports.initClassTeacher = exports.ClassTeacher = exports.ClassTeacherStatus = exports.ClassTeacherRole = void 0;
var sequelize_1 = require("sequelize");
var class_model_1 = require("./class.model");
var teacher_model_1 = require("./teacher.model");
var user_model_1 = require("./user.model");
/**
 * 班级内教师角色
 */
var ClassTeacherRole;
(function (ClassTeacherRole) {
    ClassTeacherRole[ClassTeacherRole["HEAD_TEACHER"] = 1] = "HEAD_TEACHER";
    ClassTeacherRole[ClassTeacherRole["DEPUTY_HEAD_TEACHER"] = 2] = "DEPUTY_HEAD_TEACHER";
    ClassTeacherRole[ClassTeacherRole["SUPPORT_TEACHER"] = 3] = "SUPPORT_TEACHER";
    ClassTeacherRole[ClassTeacherRole["SUBJECT_TEACHER"] = 4] = "SUBJECT_TEACHER";
})(ClassTeacherRole = exports.ClassTeacherRole || (exports.ClassTeacherRole = {}));
/**
 * 班级教师关系状态
 */
var ClassTeacherStatus;
(function (ClassTeacherStatus) {
    ClassTeacherStatus[ClassTeacherStatus["INACTIVE"] = 0] = "INACTIVE";
    ClassTeacherStatus[ClassTeacherStatus["ACTIVE"] = 1] = "ACTIVE";
})(ClassTeacherStatus = exports.ClassTeacherStatus || (exports.ClassTeacherStatus = {}));
var ClassTeacher = /** @class */ (function (_super) {
    __extends(ClassTeacher, _super);
    function ClassTeacher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ClassTeacher;
}(sequelize_1.Model));
exports.ClassTeacher = ClassTeacher;
var initClassTeacher = function (sequelize) {
    console.log('初始化 ClassTeacher 模型...');
    ClassTeacher.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键ID'
        },
        classId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '班级ID - 外键关联班级表'
        },
        teacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '教师ID - 外键关联教师表'
        },
        role: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '教师角色 - 1:班主任 2:副班主任 3:配班老师 4:专科老师'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '开始日期'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '结束日期'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ClassTeacherStatus.ACTIVE,
            comment: '状态 - 0:停用 1:正常'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '更新人ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize: sequelize,
        tableName: 'class_teachers',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ClassTeacher;
};
exports.initClassTeacher = initClassTeacher;
var initClassTeacherAssociations = function () {
    ClassTeacher.belongsTo(class_model_1.Class, {
        foreignKey: 'classId',
        as: 'class'
    });
    ClassTeacher.belongsTo(teacher_model_1.Teacher, {
        foreignKey: 'teacherId',
        as: 'teacher'
    });
    ClassTeacher.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ClassTeacher.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initClassTeacherAssociations = initClassTeacherAssociations;
