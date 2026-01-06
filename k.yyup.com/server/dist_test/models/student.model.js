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
exports.initStudentAssociations = exports.initStudent = exports.Student = exports.StudentStatus = exports.StudentGender = void 0;
var sequelize_1 = require("sequelize");
var kindergarten_model_1 = require("./kindergarten.model");
var class_model_1 = require("./class.model");
var user_model_1 = require("./user.model");
var parent_student_relation_model_1 = require("./parent-student-relation.model");
var activity_registration_model_1 = require("./activity-registration.model");
var admission_result_model_1 = require("./admission-result.model");
/**
 * 学生性别
 */
var StudentGender;
(function (StudentGender) {
    StudentGender[StudentGender["MALE"] = 1] = "MALE";
    StudentGender[StudentGender["FEMALE"] = 2] = "FEMALE";
})(StudentGender = exports.StudentGender || (exports.StudentGender = {}));
/**
 * 学生状态
 */
var StudentStatus;
(function (StudentStatus) {
    StudentStatus[StudentStatus["DROPPED_OUT"] = 0] = "DROPPED_OUT";
    StudentStatus[StudentStatus["STUDYING"] = 1] = "STUDYING";
    StudentStatus[StudentStatus["ON_LEAVE"] = 2] = "ON_LEAVE";
    StudentStatus[StudentStatus["GRADUATED"] = 3] = "GRADUATED";
    StudentStatus[StudentStatus["PRE_ADMISSION"] = 4] = "PRE_ADMISSION";
})(StudentStatus = exports.StudentStatus || (exports.StudentStatus = {}));
var Student = /** @class */ (function (_super) {
    __extends(Student, _super);
    function Student() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Student;
}(sequelize_1.Model));
exports.Student = Student;
var initStudent = function (sequelize) {
    Student.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '学生ID - 主键'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '学生姓名'
        },
        studentNo: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '学号'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID - 外键关联幼儿园表'
        },
        classId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '班级ID - 外键关联班级表'
        },
        gender: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '性别 - 1:男 2:女'
        },
        birthDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '出生日期'
        },
        idCardNo: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '身份证号'
        },
        householdAddress: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '户籍地址'
        },
        currentAddress: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '当前居住地址'
        },
        bloodType: {
            type: sequelize_1.DataTypes.STRING(10),
            allowNull: true,
            comment: '血型'
        },
        nationality: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '民族'
        },
        enrollmentDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            comment: '入学日期'
        },
        graduationDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '毕业日期'
        },
        healthCondition: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '健康状况'
        },
        allergyHistory: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '过敏史'
        },
        specialNeeds: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '特殊需求'
        },
        photoUrl: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '照片URL'
        },
        interests: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '兴趣爱好'
        },
        tags: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '标签，多个用逗号分隔'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: StudentStatus.STUDYING,
            comment: '学生状态 - 0:退学 1:在读 2:请假 3:毕业 4:预录取'
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
        tableName: 'students',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Student;
};
exports.initStudent = initStudent;
var initStudentAssociations = function () {
    Student.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    Student.belongsTo(class_model_1.Class, {
        foreignKey: 'classId',
        as: 'class'
    });
    Student.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Student.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    Student.hasMany(parent_student_relation_model_1.ParentStudentRelation, {
        foreignKey: 'studentId',
        as: 'parents'
    });
    Student.hasMany(activity_registration_model_1.ActivityRegistration, {
        foreignKey: 'studentId',
        as: 'activityRegistrations'
    });
    Student.hasOne(admission_result_model_1.AdmissionResult, {
        foreignKey: 'studentId',
        as: 'admissionResult'
    });
};
exports.initStudentAssociations = initStudentAssociations;
