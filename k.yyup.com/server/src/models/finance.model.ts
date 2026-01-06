import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Op
} from 'sequelize';

/**
 * 收费项目模型
 */
export class FeeItem extends Model<
  InferAttributes<FeeItem>,
  InferCreationAttributes<FeeItem>
> {
  declare id: number | undefined;
  declare name: string;
  declare category: string;
  declare amount: number;
  declare period: string;
  declare isRequired: boolean;
  declare description: string | null;
  declare status: 'active' | 'inactive';
  declare kindergartenId: number | null;
  
  declare readonly createdAt: Date | undefined;
  declare readonly updatedAt: Date | undefined;
}

/**
 * 费用套餐模板模型
 */
export class FeePackageTemplate extends Model<
  InferAttributes<FeePackageTemplate>,
  InferCreationAttributes<FeePackageTemplate>
> {
  declare id: number | undefined;
  declare name: string;
  declare description: string | null;
  declare items: any; // JSON
  declare totalAmount: number;
  declare discountRate: number | null;
  declare finalAmount: number;
  declare validPeriod: string;
  declare targetGrade: string | null;
  declare status: 'active' | 'inactive';
  declare kindergartenId: number | null;
  
  declare readonly createdAt: Date | undefined;
  declare readonly updatedAt: Date | undefined;
}

/**
 * 缴费单模型
 */
export class PaymentBill extends Model<
  InferAttributes<PaymentBill>,
  InferCreationAttributes<PaymentBill>
> {
  declare id: number | undefined;
  declare billNo: string;
  declare studentId: number | null;
  declare studentName: string;
  declare className: string | null;
  declare templateId: number | null;
  declare items: any; // JSON
  declare totalAmount: number;
  declare paidAmount: number;
  declare remainingAmount: number;
  declare dueDate: Date;
  declare status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  declare paymentMethod: string | null;
  declare remarks: string | null;
  declare kindergartenId: number | null;
  declare createdBy: number | null;
  
  declare readonly createdAt: Date | undefined;
  declare readonly updatedAt: Date | undefined;
}

/**
 * 缴费记录模型
 */
export class PaymentRecord extends Model<
  InferAttributes<PaymentRecord>,
  InferCreationAttributes<PaymentRecord>
> {
  declare id: number | undefined;
  declare billId: number;
  declare paymentAmount: number;
  declare paymentMethod: string;
  declare paymentDate: Date;
  declare transactionNo: string | null;
  declare receiptNo: string | null;
  declare payerName: string | null;
  declare payerPhone: string | null;
  declare status: 'pending' | 'success' | 'failed' | 'refunded';
  declare remarks: string | null;
  declare confirmedBy: number | null;
  declare confirmedAt: Date | null;
  
  declare readonly createdAt: Date | undefined;
  declare readonly updatedAt: Date | undefined;
}

/**
 * 财务报表模型
 */
export class FinancialReport extends Model<
  InferAttributes<FinancialReport>,
  InferCreationAttributes<FinancialReport>
> {
  declare id: number | undefined;
  declare name: string;
  declare type: 'income-expense' | 'profit' | 'cashflow' | 'balance' | 'budget' | 'custom';
  declare description: string | null;
  declare periodStart: Date;
  declare periodEnd: Date;
  declare data: any | null; // JSON
  declare filePath: string | null;
  declare fileSize: number | null;
  declare format: 'pdf' | 'excel' | 'csv';
  declare status: 'generating' | 'completed' | 'failed';
  declare kindergartenId: number | null;
  declare createdBy: number | null;
  
  declare readonly createdAt: Date | undefined;
  declare readonly updatedAt: Date | undefined;
}

/**
 * 初始化财务模型
 */
export const initFinanceModels = (sequelize: Sequelize) => {
  console.log('🏦 开始初始化财务模型...');

  // 初始化收费项目模型
  console.log('初始化 FeeItem 模型...');
  FeeItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '收费项目名称',
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '费用类别',
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '收费金额',
      },
      period: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: '月',
        comment: '收费周期',
      },
      isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '是否必需',
        field: 'is_required',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '项目描述',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '幼儿园ID',
        field: 'kindergarten_id',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'fee_items',
      timestamps: true,
      underscored: true,
      comment: '收费项目表',
    }
  );

  // 初始化费用套餐模板模型
  FeePackageTemplate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '套餐名称',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '套餐描述',
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '包含的收费项目',
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '套餐总金额',
        field: 'total_amount',
      },
      discountRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '折扣率',
        field: 'discount_rate',
      },
      finalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '最终金额',
        field: 'final_amount',
      },
      validPeriod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '有效期',
        field: 'valid_period',
      },
      targetGrade: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '适用年级',
        field: 'target_grade',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
        comment: '状态',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '幼儿园ID',
        field: 'kindergarten_id',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'fee_package_templates',
      timestamps: true,
      underscored: true,
      comment: '费用套餐模板表',
    }
  );

  // 初始化缴费单模型
  PaymentBill.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      billNo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '缴费单号',
        field: 'bill_no',
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '学生ID',
        field: 'student_id',
      },
      studentName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '学生姓名',
        field: 'student_name',
      },
      className: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '班级名称',
        field: 'class_name',
      },
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '费用模板ID',
        field: 'template_id',
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: '缴费项目详情',
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '总金额',
        field: 'total_amount',
      },
      paidAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '已缴金额',
        field: 'paid_amount',
      },
      remainingAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '剩余金额',
        field: 'remaining_amount',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '到期日期',
        field: 'due_date',
      },
      status: {
        type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        comment: '缴费状态',
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '支付方式',
        field: 'payment_method',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '幼儿园ID',
        field: 'kindergarten_id',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人',
        field: 'created_by',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'payment_bills',
      timestamps: true,
      underscored: true,
      comment: '缴费单表',
    }
  );

  // 初始化缴费记录模型
  PaymentRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      billId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '缴费单ID',
        field: 'bill_id',
      },
      paymentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '缴费金额',
        field: 'payment_amount',
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '支付方式',
        field: 'payment_method',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '缴费日期',
        field: 'payment_date',
      },
      transactionNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '交易流水号',
        field: 'transaction_no',
      },
      receiptNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '收据号',
        field: 'receipt_no',
      },
      payerName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '缴费人姓名',
        field: 'payer_name',
      },
      payerPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '缴费人电话',
        field: 'payer_phone',
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'success',
        comment: '支付状态',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      confirmedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '确认人',
        field: 'confirmed_by',
      },
      confirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '确认时间',
        field: 'confirmed_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'payment_records',
      timestamps: true,
      underscored: true,
      comment: '缴费记录表',
    }
  );

  // 初始化财务报表模型
  FinancialReport.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '报表名称',
      },
      type: {
        type: DataTypes.ENUM('income-expense', 'profit', 'cashflow', 'balance', 'budget', 'custom'),
        allowNull: false,
        comment: '报表类型',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '报表描述',
      },
      periodStart: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报表开始时间',
        field: 'period_start',
      },
      periodEnd: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: '报表结束时间',
        field: 'period_end',
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '报表数据',
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: '报表文件路径',
        field: 'file_path',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '文件大小(字节)',
        field: 'file_size',
      },
      format: {
        type: DataTypes.ENUM('pdf', 'excel', 'csv'),
        allowNull: false,
        defaultValue: 'pdf',
        comment: '报表格式',
      },
      status: {
        type: DataTypes.ENUM('generating', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'generating',
        comment: '生成状态',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '幼儿园ID',
        field: 'kindergarten_id',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人',
        field: 'created_by',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'financial_reports',
      timestamps: true,
      underscored: true,
      comment: '财务报表表',
    }
  );

  console.log('✅ 财务模型初始化完成');
  console.log('🔗 设置财务模型关联...');

  // 设置模型关联
  PaymentRecord.belongsTo(PaymentBill, { foreignKey: 'billId', as: 'bill' });
  PaymentBill.hasMany(PaymentRecord, { foreignKey: 'billId', as: 'records' });

  PaymentBill.belongsTo(FeePackageTemplate, { foreignKey: 'templateId', as: 'template' });
  FeePackageTemplate.hasMany(PaymentBill, { foreignKey: 'templateId', as: 'bills' });

  console.log('✅ 财务模型关联设置完成');

  return {
    FeeItem,
    FeePackageTemplate,
    PaymentBill,
    PaymentRecord,
    FinancialReport,
  };
};
