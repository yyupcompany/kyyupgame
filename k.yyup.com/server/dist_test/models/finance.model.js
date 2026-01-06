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
exports.initFinanceModels = exports.FinancialReport = exports.PaymentRecord = exports.PaymentBill = exports.FeePackageTemplate = exports.FeeItem = void 0;
var sequelize_1 = require("sequelize");
/**
 * 收费项目模型
 */
var FeeItem = /** @class */ (function (_super) {
    __extends(FeeItem, _super);
    function FeeItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FeeItem;
}(sequelize_1.Model));
exports.FeeItem = FeeItem;
/**
 * 费用套餐模板模型
 */
var FeePackageTemplate = /** @class */ (function (_super) {
    __extends(FeePackageTemplate, _super);
    function FeePackageTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FeePackageTemplate;
}(sequelize_1.Model));
exports.FeePackageTemplate = FeePackageTemplate;
/**
 * 缴费单模型
 */
var PaymentBill = /** @class */ (function (_super) {
    __extends(PaymentBill, _super);
    function PaymentBill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PaymentBill;
}(sequelize_1.Model));
exports.PaymentBill = PaymentBill;
/**
 * 缴费记录模型
 */
var PaymentRecord = /** @class */ (function (_super) {
    __extends(PaymentRecord, _super);
    function PaymentRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PaymentRecord;
}(sequelize_1.Model));
exports.PaymentRecord = PaymentRecord;
/**
 * 财务报表模型
 */
var FinancialReport = /** @class */ (function (_super) {
    __extends(FinancialReport, _super);
    function FinancialReport() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FinancialReport;
}(sequelize_1.Model));
exports.FinancialReport = FinancialReport;
/**
 * 初始化财务模型
 */
var initFinanceModels = function (sequelize) {
    console.log('🏦 开始初始化财务模型...');
    // 初始化收费项目模型
    console.log('初始化 FeeItem 模型...');
    FeeItem.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '收费项目名称'
        },
        category: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '费用类别'
        },
        amount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '收费金额'
        },
        period: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: false,
            defaultValue: '月',
            comment: '收费周期'
        },
        isRequired: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: '是否必需',
            field: 'is_required'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '项目描述'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
            comment: '状态'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '幼儿园ID',
            field: 'kindergarten_id'
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
        tableName: 'fee_items',
        timestamps: true,
        underscored: true,
        comment: '收费项目表'
    });
    // 初始化费用套餐模板模型
    FeePackageTemplate.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '套餐名称'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '套餐描述'
        },
        items: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            comment: '包含的收费项目'
        },
        totalAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '套餐总金额',
            field: 'total_amount'
        },
        discountRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0,
            comment: '折扣率',
            field: 'discount_rate'
        },
        finalAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '最终金额',
            field: 'final_amount'
        },
        validPeriod: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '有效期',
            field: 'valid_period'
        },
        targetGrade: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '适用年级',
            field: 'target_grade'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
            comment: '状态'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '幼儿园ID',
            field: 'kindergarten_id'
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
        tableName: 'fee_package_templates',
        timestamps: true,
        underscored: true,
        comment: '费用套餐模板表'
    });
    // 初始化缴费单模型
    PaymentBill.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        billNo: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: '缴费单号',
            field: 'bill_no'
        },
        studentId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '学生ID',
            field: 'student_id'
        },
        studentName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '学生姓名',
            field: 'student_name'
        },
        className: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '班级名称',
            field: 'class_name'
        },
        templateId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '费用模板ID',
            field: 'template_id'
        },
        items: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            comment: '缴费项目详情'
        },
        totalAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '总金额',
            field: 'total_amount'
        },
        paidAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '已缴金额',
            field: 'paid_amount'
        },
        remainingAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '剩余金额',
            field: 'remaining_amount'
        },
        dueDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '到期日期',
            field: 'due_date'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
            comment: '缴费状态'
        },
        paymentMethod: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '支付方式',
            field: 'payment_method'
        },
        remarks: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '幼儿园ID',
            field: 'kindergarten_id'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人',
            field: 'created_by'
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
        tableName: 'payment_bills',
        timestamps: true,
        underscored: true,
        comment: '缴费单表'
    });
    // 初始化缴费记录模型
    PaymentRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        billId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '缴费单ID',
            field: 'bill_id'
        },
        paymentAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: '缴费金额',
            field: 'payment_amount'
        },
        paymentMethod: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '支付方式',
            field: 'payment_method'
        },
        paymentDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '缴费日期',
            field: 'payment_date'
        },
        transactionNo: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '交易流水号',
            field: 'transaction_no'
        },
        receiptNo: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: '收据号',
            field: 'receipt_no'
        },
        payerName: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: '缴费人姓名',
            field: 'payer_name'
        },
        payerPhone: {
            type: sequelize_1.DataTypes.STRING(20),
            allowNull: true,
            comment: '缴费人电话',
            field: 'payer_phone'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'success',
            comment: '支付状态'
        },
        remarks: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '备注'
        },
        confirmedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '确认人',
            field: 'confirmed_by'
        },
        confirmedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: '确认时间',
            field: 'confirmed_at'
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
        tableName: 'payment_records',
        timestamps: true,
        underscored: true,
        comment: '缴费记录表'
    });
    // 初始化财务报表模型
    FinancialReport.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(200),
            allowNull: false,
            comment: '报表名称'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('income-expense', 'profit', 'cashflow', 'balance', 'budget', 'custom'),
            allowNull: false,
            comment: '报表类型'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: '报表描述'
        },
        periodStart: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '报表开始时间',
            field: 'period_start'
        },
        periodEnd: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            comment: '报表结束时间',
            field: 'period_end'
        },
        data: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
            comment: '报表数据'
        },
        filePath: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '报表文件路径',
            field: 'file_path'
        },
        fileSize: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '文件大小(字节)',
            field: 'file_size'
        },
        format: {
            type: sequelize_1.DataTypes.ENUM('pdf', 'excel', 'csv'),
            allowNull: false,
            defaultValue: 'pdf',
            comment: '报表格式'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('generating', 'completed', 'failed'),
            allowNull: false,
            defaultValue: 'generating',
            comment: '生成状态'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '幼儿园ID',
            field: 'kindergarten_id'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '创建人',
            field: 'created_by'
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
        tableName: 'financial_reports',
        timestamps: true,
        underscored: true,
        comment: '财务报表表'
    });
    console.log('✅ 财务模型初始化完成');
    console.log('🔗 设置财务模型关联...');
    // 设置模型关联
    PaymentRecord.belongsTo(PaymentBill, { foreignKey: 'billId', as: 'bill' });
    PaymentBill.hasMany(PaymentRecord, { foreignKey: 'billId', as: 'records' });
    PaymentBill.belongsTo(FeePackageTemplate, { foreignKey: 'templateId', as: 'template' });
    FeePackageTemplate.hasMany(PaymentBill, { foreignKey: 'templateId', as: 'bills' });
    console.log('✅ 财务模型关联设置完成');
    return {
        FeeItem: FeeItem,
        FeePackageTemplate: FeePackageTemplate,
        PaymentBill: PaymentBill,
        PaymentRecord: PaymentRecord,
        FinancialReport: FinancialReport
    };
};
exports.initFinanceModels = initFinanceModels;
