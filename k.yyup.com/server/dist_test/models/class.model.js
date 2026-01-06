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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.initClassAssociations = exports.initClass = exports.Class = exports.ClassStatus = exports.ClassType = void 0;
var sequelize_1 = require("sequelize");
var kindergarten_model_1 = require("./kindergarten.model");
var teacher_model_1 = require("./teacher.model");
var student_model_1 = require("./student.model");
var user_model_1 = require("./user.model");
var class_teacher_model_1 = require("./class-teacher.model");
var outdoor_training_record_model_1 = __importDefault(require("./outdoor-training-record.model"));
var external_display_record_model_1 = __importDefault(require("./external-display-record.model"));
/**
 * 班级类型
 */
var ClassType;
(function (ClassType) {
    ClassType[ClassType["SMALL"] = 1] = "SMALL";
    ClassType[ClassType["MIDDLE"] = 2] = "MIDDLE";
    ClassType[ClassType["LARGE"] = 3] = "LARGE";
    ClassType[ClassType["MIXED"] = 4] = "MIXED";
})(ClassType = exports.ClassType || (exports.ClassType = {}));
/**
 * 班级状态
 */
var ClassStatus;
(function (ClassStatus) {
    ClassStatus[ClassStatus["DISABLED"] = 0] = "DISABLED";
    ClassStatus[ClassStatus["NORMAL"] = 1] = "NORMAL";
    ClassStatus[ClassStatus["GRADUATED"] = 2] = "GRADUATED";
})(ClassStatus = exports.ClassStatus || (exports.ClassStatus = {}));
var Class = /** @class */ (function (_super) {
    __extends(Class, _super);
    function Class() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Class;
}(sequelize_1.Model));
exports.Class = Class;
var initClass = function (sequelize) {
    Class.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '主键ID'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '班级名称'
        },
        code: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '班级编码 - 用于唯一标识'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID - 外键关联幼儿园表',
            references: {
                model: 'kindergartens',
                key: 'id'
            }
        },
        type: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '班级类型 - 1:小班 2:中班 3:大班 4:混龄班'
        },
        grade: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '年级'
        },
        headTeacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '班主任ID - 关联教师表'
        },
        assistantTeacherId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '助教ID - 关联教师表'
        },
        capacity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30,
            comment: '班级容量 - 最大学生数'
        },
        currentStudentCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '当前学生数'
        },
        classroom: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '班级教室'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '班级描述'
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '班级图片URL'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: ClassStatus.NORMAL,
            comment: '班级状态 - 0:禁用 1:正常 2:已毕业'
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
        isSystem: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '是否系统数据 - 0:否 1:是'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '创建时间'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '更新时间'
        },
        deletedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '删除时间（软删除）'
        }
    }, {
        sequelize: sequelize,
        tableName: 'classes',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Class;
};
exports.initClass = initClass;
var initClassAssociations = function () {
    Class.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    Class.belongsTo(teacher_model_1.Teacher, {
        foreignKey: 'headTeacherId',
        as: 'headTeacher'
    });
    Class.belongsTo(teacher_model_1.Teacher, {
        foreignKey: 'assistantTeacherId',
        as: 'assistantTeacher'
    });
    Class.hasMany(student_model_1.Student, {
        foreignKey: 'classId',
        as: 'students'
    });
    Class.belongsToMany(teacher_model_1.Teacher, {
        through: class_teacher_model_1.ClassTeacher,
        foreignKey: 'classId',
        otherKey: 'teacherId',
        as: 'teachers'
    });
    Class.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Class.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    // 教学中心关联
    Class.hasMany(outdoor_training_record_model_1["default"], {
        foreignKey: 'class_id',
        as: 'outdoorTrainingRecords'
    });
    Class.hasMany(external_display_record_model_1["default"], {
        foreignKey: 'class_id',
        as: 'externalDisplayRecords'
    });
};
exports.initClassAssociations = initClassAssociations;
