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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PosterCategory = void 0;
var sequelize_1 = require("sequelize");
var PosterCategory = /** @class */ (function (_super) {
    __extends(PosterCategory, _super);
    function PosterCategory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PosterCategory.initModel = function (sequelize) {
        PosterCategory.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                comment: '分类名称'
            },
            code: {
                type: sequelize_1.DataTypes.STRING(30),
                allowNull: false,
                unique: true,
                comment: '分类代码'
            },
            description: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: true,
                comment: '分类描述'
            },
            icon: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                comment: '分类图标'
            },
            color: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: true,
                comment: '分类颜色'
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: '排序',
                field: 'sort_order'
            },
            status: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '状态：0-禁用，1-启用'
            },
            parentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: '父分类ID',
                field: 'parent_id'
            },
            level: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '分类层级'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                field: 'updated_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'poster_categories',
            timestamps: true,
            underscored: true
        });
    };
    PosterCategory.initAssociations = function () {
        // 自关联：父子分类关系
        this.hasMany(this, {
            foreignKey: 'parentId',
            as: 'children'
        });
        this.belongsTo(this, {
            foreignKey: 'parentId',
            as: 'parent'
        });
    };
    /**
     * 获取树形结构的分类数据
     */
    PosterCategory.getCategoryTree = function () {
        return __awaiter(this, void 0, void 0, function () {
            var categories, rootCategories;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findAll({
                            where: { status: 1 },
                            order: [['level', 'ASC'], ['sortOrder', 'ASC']],
                            include: [{
                                    model: this,
                                    as: 'children',
                                    where: { status: 1 },
                                    required: false,
                                    order: [['sortOrder', 'ASC']]
                                }]
                        })];
                    case 1:
                        categories = _a.sent();
                        rootCategories = categories.filter(function (cat) { return cat.level === 1; });
                        return [2 /*return*/, rootCategories];
                }
            });
        });
    };
    /**
     * 获取指定父分类下的子分类
     */
    PosterCategory.getChildCategories = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findAll({
                        where: {
                            parentId: parentId,
                            status: 1
                        },
                        order: [['sortOrder', 'ASC']]
                    })];
            });
        });
    };
    /**
     * 根据代码获取分类
     */
    PosterCategory.getCategoryByCode = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.findOne({
                        where: {
                            code: code,
                            status: 1
                        }
                    })];
            });
        });
    };
    return PosterCategory;
}(sequelize_1.Model));
exports.PosterCategory = PosterCategory;
exports["default"] = PosterCategory;
