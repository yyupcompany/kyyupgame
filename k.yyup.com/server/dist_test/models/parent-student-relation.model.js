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
exports.initParentStudentRelationAssociations = exports.initParentStudentRelation = exports.ParentStudentRelation = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var student_model_1 = require("./student.model");
var ParentStudentRelation = /** @class */ (function (_super) {
    __extends(ParentStudentRelation, _super);
    function ParentStudentRelation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParentStudentRelation;
}(sequelize_1.Model));
exports.ParentStudentRelation = ParentStudentRelation;
var initParentStudentRelation = function (sequelize) {
    ParentStudentRelation.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '关系ID - 主键'
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
        studentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '学生ID - 外键关联学生表',
            references: {
                model: 'students',
                key: 'id'
            }
        },
        relationship: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '与学生关系 - 如：父亲、母亲、爷爷、奶奶等'
        },
        isPrimaryContact: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '是否主要联系人 - 0:否 1:是'
        },
        isLegalGuardian: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            comment: '是否法定监护人 - 0:否 1:是'
        },
        idCardNo: {
            type: sequelize_1.DataTypes.STRING(18),
            allowNull: true,
            comment: '身份证号'
        },
        workUnit: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '工作单位'
        },
        occupation: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '职业'
        },
        education: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '学历'
        },
        address: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '居住地址'
        },
        remark: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '备注信息'
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
        tableName: 'parent_student_relations',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return ParentStudentRelation;
};
exports.initParentStudentRelation = initParentStudentRelation;
var initParentStudentRelationAssociations = function () {
    ParentStudentRelation.belongsTo(user_model_1.User, { foreignKey: 'userId', as: 'user' });
    ParentStudentRelation.belongsTo(student_model_1.Student, {
        foreignKey: 'studentId',
        as: 'student'
    });
    ParentStudentRelation.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    ParentStudentRelation.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    // ParentStudentRelation.hasMany(ActivityRegistration, {
    //     foreignKey: 'parentId',
    //     as: 'activityRegistrations'
    // });
    // ParentStudentRelation.hasMany(ActivityEvaluation, {
    //     foreignKey: 'parentId',
    //     as: 'activityEvaluations'
    // });
    // ParentStudentRelation.hasMany(AdmissionResult, {
    //     foreignKey: 'parentId',
    //     as: 'admissionResults'
    // });
    // ParentStudentRelation.hasMany(AdmissionNotification, {
    //     foreignKey: 'parentId',
    //     as: 'admissionNotifications'
    // });
};
exports.initParentStudentRelationAssociations = initParentStudentRelationAssociations;
