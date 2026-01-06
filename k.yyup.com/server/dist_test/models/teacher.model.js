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
exports.initTeacherAssociations = exports.initTeacher = exports.Teacher = exports.TeacherStatus = exports.TeacherEducation = exports.TeacherPosition = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
var class_model_1 = require("./class.model");
var class_teacher_model_1 = require("./class-teacher.model");
var enrollment_task_model_1 = require("./enrollment-task.model");
var activity_evaluation_model_1 = require("./activity-evaluation.model");
/**
 * 教师职位
 */
var TeacherPosition;
(function (TeacherPosition) {
    TeacherPosition[TeacherPosition["PRINCIPAL"] = 1] = "PRINCIPAL";
    TeacherPosition[TeacherPosition["VICE_PRINCIPAL"] = 2] = "VICE_PRINCIPAL";
    TeacherPosition[TeacherPosition["RESEARCH_DIRECTOR"] = 3] = "RESEARCH_DIRECTOR";
    TeacherPosition[TeacherPosition["HEAD_TEACHER"] = 4] = "HEAD_TEACHER";
    TeacherPosition[TeacherPosition["REGULAR_TEACHER"] = 5] = "REGULAR_TEACHER";
    TeacherPosition[TeacherPosition["ASSISTANT_TEACHER"] = 6] = "ASSISTANT_TEACHER";
})(TeacherPosition = exports.TeacherPosition || (exports.TeacherPosition = {}));
/**
 * 教师学历
 */
var TeacherEducation;
(function (TeacherEducation) {
    TeacherEducation[TeacherEducation["HIGH_SCHOOL"] = 1] = "HIGH_SCHOOL";
    TeacherEducation[TeacherEducation["COLLEGE"] = 2] = "COLLEGE";
    TeacherEducation[TeacherEducation["BACHELOR"] = 3] = "BACHELOR";
    TeacherEducation[TeacherEducation["MASTER"] = 4] = "MASTER";
    TeacherEducation[TeacherEducation["DOCTOR"] = 5] = "DOCTOR";
})(TeacherEducation = exports.TeacherEducation || (exports.TeacherEducation = {}));
/**
 * 教师状态
 */
var TeacherStatus;
(function (TeacherStatus) {
    TeacherStatus[TeacherStatus["RESIGNED"] = 0] = "RESIGNED";
    TeacherStatus[TeacherStatus["ACTIVE"] = 1] = "ACTIVE";
    TeacherStatus[TeacherStatus["ON_LEAVE"] = 2] = "ON_LEAVE";
    TeacherStatus[TeacherStatus["PROBATION"] = 3] = "PROBATION";
})(TeacherStatus = exports.TeacherStatus || (exports.TeacherStatus = {}));
var Teacher = /** @class */ (function (_super) {
    __extends(Teacher, _super);
    function Teacher() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Teacher;
}(sequelize_1.Model));
exports.Teacher = Teacher;
var initTeacher = function (sequelize) {
    Teacher.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '教师ID - 主键'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID - 外键关联用户表',
            references: {
                model: 'users',
                key: 'id'
            }
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
        groupId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'group_id',
            comment: '所属集团ID - 外键关联集团表',
            references: {
                model: 'groups',
                key: 'id'
            }
        },
        teacherNo: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '教师工号'
        },
        position: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: TeacherPosition.REGULAR_TEACHER,
            comment: '职位 - 1:园长 2:副园长 3:教研主任 4:班主任 5:普通教师 6:助教'
        },
        hireDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '入职日期'
        },
        education: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            comment: '学历 - 1:高中/中专 2:大专 3:本科 4:硕士 5:博士'
        },
        school: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '毕业学校'
        },
        major: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '专业'
        },
        teachingAge: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '教龄(年)'
        },
        professionalSkills: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '专业技能'
        },
        certifications: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '资质证书'
        },
        emergencyContact: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '紧急联系人'
        },
        emergencyPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '紧急联系电话'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: TeacherStatus.ACTIVE,
            comment: '教师状态 - 0:离职 1:在职 2:请假中 3:见习期'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注'
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
        tableName: 'teachers',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Teacher;
};
exports.initTeacher = initTeacher;
var initTeacherAssociations = function () {
    // 注意：Teacher模型使用了underscored: true，所以数据库字段名是user_id
    // 但在代码中仍然使用驼峰命名userId，Sequelize会自动转换
    Teacher.belongsTo(user_model_1.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    Teacher.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    Teacher.belongsToMany(class_model_1.Class, {
        through: class_teacher_model_1.ClassTeacher,
        foreignKey: 'teacherId',
        otherKey: 'classId',
        as: 'classes'
    });
    Teacher.hasMany(enrollment_task_model_1.EnrollmentTask, {
        foreignKey: 'teacherId',
        as: 'enrollmentTasks'
    });
    Teacher.hasMany(activity_evaluation_model_1.ActivityEvaluation, {
        foreignKey: 'teacherId',
        as: 'activityEvaluations'
    });
    Teacher.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Teacher.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initTeacherAssociations = initTeacherAssociations;
