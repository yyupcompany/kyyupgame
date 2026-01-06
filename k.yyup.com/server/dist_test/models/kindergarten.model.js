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
exports.initKindergartenAssociations = exports.initKindergarten = exports.Kindergarten = exports.KindergartenStatus = exports.KindergartenLevel = exports.KindergartenType = void 0;
var sequelize_1 = require("sequelize");
var class_model_1 = require("./class.model");
var user_model_1 = require("./user.model");
var enrollment_plan_model_1 = require("./enrollment-plan.model");
var teacher_model_1 = require("./teacher.model");
var student_model_1 = require("./student.model");
var activity_model_1 = require("./activity.model");
var marketing_campaign_model_1 = require("./marketing-campaign.model");
/**
 * 幼儿园类型
 */
var KindergartenType;
(function (KindergartenType) {
    KindergartenType[KindergartenType["PUBLIC"] = 1] = "PUBLIC";
    KindergartenType[KindergartenType["PRIVATE"] = 2] = "PRIVATE";
    KindergartenType[KindergartenType["INCLUSIVE"] = 3] = "INCLUSIVE";
})(KindergartenType = exports.KindergartenType || (exports.KindergartenType = {}));
/**
 * 幼儿园等级
 */
var KindergartenLevel;
(function (KindergartenLevel) {
    KindergartenLevel[KindergartenLevel["LEVEL_1"] = 1] = "LEVEL_1";
    KindergartenLevel[KindergartenLevel["LEVEL_2"] = 2] = "LEVEL_2";
    KindergartenLevel[KindergartenLevel["LEVEL_3"] = 3] = "LEVEL_3";
})(KindergartenLevel = exports.KindergartenLevel || (exports.KindergartenLevel = {}));
/**
 * 幼儿园状态
 */
var KindergartenStatus;
(function (KindergartenStatus) {
    KindergartenStatus[KindergartenStatus["DISABLED"] = 0] = "DISABLED";
    KindergartenStatus[KindergartenStatus["NORMAL"] = 1] = "NORMAL";
})(KindergartenStatus = exports.KindergartenStatus || (exports.KindergartenStatus = {}));
var Kindergarten = /** @class */ (function (_super) {
    __extends(Kindergarten, _super);
    function Kindergarten() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Kindergarten;
}(sequelize_1.Model));
exports.Kindergarten = Kindergarten;
var initKindergarten = function (sequelize) {
    Kindergarten.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '幼儿园ID - 主键'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '幼儿园名称 - 幼儿园的正式名称'
        },
        code: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '幼儿园编码 - 标识符'
        },
        type: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '幼儿园类型 - 1:公办 2:民办 3:普惠'
        },
        level: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            comment: '幼儿园等级 - 1:一级 2:二级 3:三级'
        },
        address: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '幼儿园地址 - 详细地址'
        },
        longitude: {
            type: sequelize_1.DataTypes.DECIMAL(10, 6),
            allowNull: false,
            comment: '经度 - 地理位置经度'
        },
        latitude: {
            type: sequelize_1.DataTypes.DECIMAL(10, 6),
            allowNull: false,
            comment: '纬度 - 地理位置纬度'
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            comment: '联系电话 - 幼儿园联系电话'
        },
        email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '电子邮箱 - 幼儿园联系邮箱'
        },
        principal: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '园长姓名 - 幼儿园负责人'
        },
        establishedDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
            field: 'established_date',
            comment: '成立时间 - 幼儿园成立日期'
        },
        area: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'area',
            comment: '占地面积 - 单位：平方米'
        },
        buildingArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            field: 'building_area',
            comment: '建筑面积 - 单位：平方米'
        },
        classCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'class_count',
            comment: '班级数量 - 幼儿园班级总数'
        },
        teacherCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'teacher_count',
            comment: '教师数量 - 幼儿园教师总数'
        },
        studentCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'student_count',
            comment: '学生数量 - 幼儿园学生总数'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '幼儿园简介 - 详细介绍'
        },
        features: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '特色课程 - 幼儿园特色课程介绍'
        },
        philosophy: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '办学理念 - 幼儿园教育理念'
        },
        feeDescription: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'fee_description',
            comment: '收费标准 - 学费标准说明'
        },
        status: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: KindergartenStatus.NORMAL,
            field: 'status',
            comment: '状态 - 0:禁用 1:正常'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'creator_id',
            comment: '创建人ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'updater_id',
            comment: '更新人ID'
        },
        logoUrl: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'logo_url',
            comment: '幼儿园logo图片URL'
        },
        coverImages: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'cover_images',
            comment: '园区配图URLs，JSON格式存储多张图片'
        },
        contactPerson: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            field: 'contact_person',
            comment: '联系人姓名'
        },
        consultationPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            field: 'consultation_phone',
            comment: '咨询电话'
        },
        // 检查中心扩展字段 - 证照信息
        licenseNumber: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '办学许可证号'
        },
        licenseIssueDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '许可证发证日期'
        },
        licenseExpiryDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '许可证有效期'
        },
        businessLicenseNumber: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '营业执照号（民办园）'
        },
        organizationCode: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '组织机构代码'
        },
        taxNumber: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '税务登记号'
        },
        // 检查中心扩展字段 - 办园条件
        outdoorArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '户外活动面积（平方米）'
        },
        indoorArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '室内活动面积（平方米）'
        },
        greenArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '绿化面积（平方米）'
        },
        playgroundArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '运动场地面积（平方米）'
        },
        // 检查中心扩展字段 - 设施设备
        classroomCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '教室数量'
        },
        activityRoomCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '活动室数量'
        },
        dormitoryCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '寝室数量'
        },
        kitchenArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '厨房面积（平方米）'
        },
        medicalRoomArea: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '保健室面积（平方米）'
        },
        // 检查中心扩展字段 - 人员配置
        principalQualification: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '园长资格证号'
        },
        principalEducation: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '园长学历'
        },
        principalWorkYears: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '园长工作年限'
        },
        qualifiedTeacherCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '持证教师数'
        },
        bachelorTeacherCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '本科学历教师数'
        },
        nurseCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '保育员数'
        },
        cookCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '厨师数'
        },
        securityCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '保安数'
        },
        doctorCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '保健医生数'
        },
        // 检查中心扩展字段 - 财务信息
        registeredCapital: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: '注册资金（元）'
        },
        annualRevenue: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: '年度收入（元）'
        },
        annualExpenditure: {
            type: sequelize_1.DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: '年度支出（元）'
        },
        tuitionFee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '保教费标准（元/月）'
        },
        boardingFee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '住宿费标准（元/月）'
        },
        mealFee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '伙食费标准（元/月）'
        },
        // 检查中心扩展字段 - 安全管理
        fireControlCertified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: '消防验收合格'
        },
        foodLicenseNumber: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '食品经营许可证号'
        },
        foodLicenseExpiryDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '食品许可证有效期'
        },
        hasSchoolBus: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: '是否有校车'
        },
        schoolBusCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '校车数量'
        },
        // 检查中心扩展字段 - 行政信息
        cityLevel: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '城市级别：tier1/tier2/tier3/county/township'
        },
        educationBureau: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '主管教育局'
        },
        supervisorName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '责任督学姓名'
        },
        supervisorPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '责任督学电话'
        },
        // 检查中心扩展字段 - 其他信息
        isPuhuiKindergarten: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            comment: '是否普惠园'
        },
        puhuiRecognitionDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '普惠认定日期'
        },
        lastInspectionDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '上次年检日期'
        },
        lastInspectionResult: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '上次年检结果'
        },
        currentGrade: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '当前等级：一级/二级/三级'
        },
        gradeEvaluationDate: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: '等级评定日期'
        },
        // 检查中心扩展字段 - 完善度标记
        infoCompleteness: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: '信息完整度（0-100）'
        },
        infoLastUpdatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '信息最后更新时间'
        },
        // 集团管理扩展字段
        groupId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'group_id',
            comment: '所属集团ID'
        },
        isGroupHeadquarters: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
            field: 'is_group_headquarters',
            comment: '是否为集团总部: 0-否 1-是'
        },
        groupRole: {
            type: sequelize_1.DataTypes.TINYINT,
            allowNull: true,
            field: 'group_role',
            comment: '集团角色: 1-总部 2-旗舰园 3-标准园 4-加盟园'
        },
        joinGroupDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'join_group_date',
            comment: '加入集团日期'
        },
        leaveGroupDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'leave_group_date',
            comment: '退出集团日期'
        },
        groupJoinReason: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            field: 'group_join_reason',
            comment: '加入集团原因'
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
        tableName: 'kindergartens',
        timestamps: true,
        paranoid: true,
        underscored: true
    });
    return Kindergarten;
};
exports.initKindergarten = initKindergarten;
var initKindergartenAssociations = function () {
    Kindergarten.hasMany(class_model_1.Class, {
        foreignKey: 'kindergartenId',
        as: 'classes'
    });
    Kindergarten.hasMany(teacher_model_1.Teacher, {
        foreignKey: 'kindergartenId',
        as: 'teachers'
    });
    Kindergarten.hasMany(student_model_1.Student, {
        foreignKey: 'kindergartenId',
        as: 'allStudents'
    });
    Kindergarten.hasMany(enrollment_plan_model_1.EnrollmentPlan, {
        foreignKey: 'kindergartenId',
        as: 'enrollmentPlans'
    });
    Kindergarten.hasMany(activity_model_1.Activity, {
        foreignKey: 'kindergartenId',
        as: 'activities'
    });
    Kindergarten.hasMany(marketing_campaign_model_1.MarketingCampaign, {
        foreignKey: 'kindergartenId',
        as: 'marketingCampaigns'
    });
    Kindergarten.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Kindergarten.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
};
exports.initKindergartenAssociations = initKindergartenAssociations;
