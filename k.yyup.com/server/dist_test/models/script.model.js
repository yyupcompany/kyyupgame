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
exports.defineScriptAssociations = exports.initScriptUsage = exports.initScript = exports.initScriptCategory = exports.ScriptUsage = exports.Script = exports.ScriptCategory = exports.ScriptType = exports.ScriptStatus = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
/**
 * 话术状态枚举
 */
var ScriptStatus;
(function (ScriptStatus) {
    ScriptStatus["ACTIVE"] = "active";
    ScriptStatus["INACTIVE"] = "inactive";
    ScriptStatus["DRAFT"] = "draft";
})(ScriptStatus = exports.ScriptStatus || (exports.ScriptStatus = {}));
/**
 * 话术类型枚举
 */
var ScriptType;
(function (ScriptType) {
    ScriptType["ENROLLMENT"] = "enrollment";
    ScriptType["PHONE"] = "phone";
    ScriptType["RECEPTION"] = "reception";
    ScriptType["FOLLOWUP"] = "followup";
    ScriptType["CONSULTATION"] = "consultation";
    ScriptType["OBJECTION"] = "objection"; // 异议处理话术
})(ScriptType = exports.ScriptType || (exports.ScriptType = {}));
/**
 * 话术分类模型
 */
var ScriptCategory = /** @class */ (function (_super) {
    __extends(ScriptCategory, _super);
    function ScriptCategory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ScriptCategory;
}(sequelize_1.Model));
exports.ScriptCategory = ScriptCategory;
/**
 * 话术模板模型
 */
var Script = /** @class */ (function (_super) {
    __extends(Script, _super);
    function Script() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Script;
}(sequelize_1.Model));
exports.Script = Script;
/**
 * 话术使用记录模型
 */
var ScriptUsage = /** @class */ (function (_super) {
    __extends(ScriptUsage, _super);
    function ScriptUsage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ScriptUsage;
}(sequelize_1.Model));
exports.ScriptUsage = ScriptUsage;
/**
 * 初始化话术分类模型
 */
var initScriptCategory = function (sequelize) {
    ScriptCategory.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '分类ID'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '分类名称'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '分类描述'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScriptType)),
            allowNull: false,
            comment: '话术类型'
        },
        color: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '分类颜色'
        },
        icon: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '分类图标'
        },
        sort: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '排序'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScriptStatus)),
            allowNull: false,
            defaultValue: ScriptStatus.ACTIVE,
            comment: '状态'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '创建者ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'script_categories',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'script_categories_type_idx',
                fields: ['type']
            },
            {
                name: 'script_categories_status_idx',
                fields: ['status']
            },
            {
                name: 'script_categories_sort_idx',
                fields: ['sort']
            }
        ],
        comment: '话术分类表'
    });
};
exports.initScriptCategory = initScriptCategory;
/**
 * 初始化话术模板模型
 */
var initScript = function (sequelize) {
    Script.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '话术ID'
        },
        title: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '话术标题'
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '话术内容'
        },
        categoryId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '分类ID'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScriptType)),
            allowNull: false,
            comment: '话术类型'
        },
        tags: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: '[]',
            comment: '标签'
        },
        keywords: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            defaultValue: '[]',
            comment: '关键词'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '话术描述'
        },
        usageCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '使用次数'
        },
        effectiveScore: {
            type: sequelize_1.DataTypes.DECIMAL(3, 2),
            allowNull: true,
            comment: '效果评分'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(ScriptStatus)),
            allowNull: false,
            defaultValue: ScriptStatus.ACTIVE,
            comment: '状态'
        },
        isTemplate: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否为模板'
        },
        variables: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '变量配置'
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '创建者ID'
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            comment: '更新者ID'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'scripts',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'scripts_category_id_idx',
                fields: ['category_id']
            },
            {
                name: 'scripts_type_idx',
                fields: ['type']
            },
            {
                name: 'scripts_status_idx',
                fields: ['status']
            },
            {
                name: 'scripts_usage_count_idx',
                fields: ['usage_count']
            },
            {
                name: 'scripts_effective_score_idx',
                fields: ['effective_score']
            }
        ],
        comment: '话术模板表'
    });
};
exports.initScript = initScript;
/**
 * 初始化话术使用记录模型
 */
var initScriptUsage = function (sequelize) {
    ScriptUsage.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            comment: '使用记录ID'
        },
        scriptId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '话术ID'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            comment: '用户ID'
        },
        usageContext: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: true,
            comment: '使用场景'
        },
        effectiveRating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            },
            comment: '效果评分 1-5'
        },
        feedback: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '使用反馈'
        },
        usageDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '使用时间'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'script_usages',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                name: 'script_usages_script_id_idx',
                fields: ['script_id']
            },
            {
                name: 'script_usages_user_id_idx',
                fields: ['user_id']
            },
            {
                name: 'script_usages_usage_date_idx',
                fields: ['usage_date']
            },
            {
                name: 'script_usages_effective_rating_idx',
                fields: ['effective_rating']
            }
        ],
        comment: '话术使用记录表'
    });
};
exports.initScriptUsage = initScriptUsage;
/**
 * 定义模型关联关系
 */
var defineScriptAssociations = function () {
    // 话术分类与话术的关联
    ScriptCategory.hasMany(Script, {
        foreignKey: 'categoryId',
        as: 'scripts'
    });
    Script.belongsTo(ScriptCategory, {
        foreignKey: 'categoryId',
        as: 'category'
    });
    // 话术与使用记录的关联
    Script.hasMany(ScriptUsage, {
        foreignKey: 'scriptId',
        as: 'usages'
    });
    ScriptUsage.belongsTo(Script, {
        foreignKey: 'scriptId',
        as: 'script'
    });
    // 用户与话术的关联
    Script.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    Script.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
    ScriptUsage.belongsTo(user_model_1.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};
exports.defineScriptAssociations = defineScriptAssociations;
