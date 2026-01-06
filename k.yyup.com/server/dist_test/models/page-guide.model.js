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
exports.PageGuideSection = exports.PageGuide = exports.initPageGuideAssociations = exports.initPageGuideSection = exports.initPageGuide = void 0;
var sequelize_1 = require("sequelize");
/**
 * 页面说明文档模型
 */
var PageGuide = /** @class */ (function (_super) {
    __extends(PageGuide, _super);
    function PageGuide() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PageGuide;
}(sequelize_1.Model));
exports.PageGuide = PageGuide;
/**
 * 页面功能板块模型
 */
var PageGuideSection = /** @class */ (function (_super) {
    __extends(PageGuideSection, _super);
    function PageGuideSection() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PageGuideSection;
}(sequelize_1.Model));
exports.PageGuideSection = PageGuideSection;
/**
 * 初始化页面说明文档模型
 */
function initPageGuide(sequelize) {
    PageGuide.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pagePath: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: '页面路径，如 /centers/activity',
            field: 'page_path'
        },
        pageName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '页面名称，如 活动中心',
            field: 'page_name'
        },
        pageDescription: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '页面详细描述',
            field: 'page_description'
        },
        category: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '页面分类，如 中心页面、管理页面等'
        },
        importance: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            comment: '页面重要性，1-10，影响AI介绍的详细程度'
        },
        relatedTables: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: '页面相关的数据库表名列表',
            field: 'related_tables'
        },
        contextPrompt: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '发送给AI的上下文提示词',
            field: 'context_prompt'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否启用',
            field: 'is_active'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        sequelize: sequelize,
        tableName: 'page_guides',
        timestamps: true,
        comment: '页面说明文档表',
        indexes: [
            {
                fields: ['pagePath'],
                unique: true
            },
            {
                fields: ['category']
            },
            {
                fields: ['isActive']
            },
        ]
    });
}
exports.initPageGuide = initPageGuide;
/**
 * 初始化页面功能板块模型
 */
function initPageGuideSection(sequelize) {
    PageGuideSection.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pageGuideId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: PageGuide,
                key: 'id'
            },
            onDelete: 'CASCADE',
            comment: '关联的页面说明文档ID',
            field: 'page_guide_id'
        },
        sectionName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '功能板块名称',
            field: 'section_name'
        },
        sectionDescription: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '功能板块描述',
            field: 'section_description'
        },
        sectionPath: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: '功能板块对应的路径（如果有）',
            field: 'section_path'
        },
        features: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            comment: '功能特性列表'
        },
        sortOrder: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '排序顺序',
            field: 'sort_order'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否启用',
            field: 'is_active'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        sequelize: sequelize,
        tableName: 'page_guide_sections',
        timestamps: true,
        comment: '页面功能板块表',
        indexes: [
            {
                fields: ['pageGuideId']
            },
            {
                fields: ['sortOrder']
            },
            {
                fields: ['isActive']
            },
        ]
    });
}
exports.initPageGuideSection = initPageGuideSection;
/**
 * 初始化页面说明文档模型关联
 */
function initPageGuideAssociations() {
    // 建立关联关系
    PageGuide.hasMany(PageGuideSection, {
        foreignKey: 'pageGuideId',
        as: 'sections',
        onDelete: 'CASCADE'
    });
    PageGuideSection.belongsTo(PageGuide, {
        foreignKey: 'pageGuideId',
        as: 'pageGuide'
    });
}
exports.initPageGuideAssociations = initPageGuideAssociations;
