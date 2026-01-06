import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { EnrollmentApplication } from './enrollment-application.model';
import { User } from './user.model';

/**
 * 材料状态枚举
 */
export enum MaterialStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

/**
 * 招生申请材料模型
 * 记录学生申请时提交的各类材料。
 */
export class EnrollmentApplicationMaterial extends Model<
  InferAttributes<EnrollmentApplicationMaterial>,
  InferCreationAttributes<EnrollmentApplicationMaterial>
> {
  declare id: CreationOptional<number>;
  declare applicationId: ForeignKey<EnrollmentApplication['id']>;
  declare materialType: number;
  declare materialName: string;
  declare fileUrl: string;
  declare fileSize: number | null;
  declare fileType: string | null;
  declare status: CreationOptional<MaterialStatus>;
  declare uploadDate: Date;
  declare uploaderId: ForeignKey<User['id']>;
  declare isVerified: CreationOptional<boolean>;
  declare verifierId: ForeignKey<User['id']> | null;
  declare verificationTime: Date | null;
  declare verificationComment: string | null;
  declare createdBy: ForeignKey<User['id']>;
  declare updatedBy: ForeignKey<User['id']> | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly application?: EnrollmentApplication;
  public readonly verifier?: User;
  public readonly uploader?: User;
}

export const initEnrollmentApplicationMaterial = (sequelize: Sequelize) => {
  EnrollmentApplicationMaterial.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '申请ID',
        references: {
          model: 'enrollment_applications',
          key: 'id',
        },
      },
      materialType: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '材料类型 - 1:身份证 2:户口本 3:出生证明 4:体检报告 5:照片 6:其他',
      },
      materialName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '材料名称',
      },
      fileUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '文件URL',
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '文件大小(字节)',
      },
      fileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '文件类型(MIME类型)',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(MaterialStatus)),
        defaultValue: MaterialStatus.PENDING,
        allowNull: false,
        comment: '材料状态',
      },
      uploadDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '上传日期',
      },
      uploaderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '上传者ID',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已验证',
      },
      verifierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '验证人ID',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      verificationTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '验证时间',
      },
      verificationComment: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '验证备注',
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '创建者ID',
      },
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新者ID',
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      tableName: 'enrollment_application_materials',
      timestamps: true,
      paranoid: true,
      underscored: true,
      comment: '招生申请提交的材料表',
      indexes: [{ fields: ['application_id'] }, { fields: ['material_type'] }],
    }
  );
  return EnrollmentApplicationMaterial;
};

export const initEnrollmentApplicationMaterialAssociations = () => {
  EnrollmentApplicationMaterial.belongsTo(EnrollmentApplication, {
    foreignKey: 'applicationId',
    as: 'application',
  });
  EnrollmentApplicationMaterial.belongsTo(User, {
    foreignKey: 'verifierId',
    as: 'verifier',
  });
  EnrollmentApplicationMaterial.belongsTo(User, {
    foreignKey: 'uploaderId',
    as: 'uploader',
  });
  EnrollmentApplicationMaterial.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  EnrollmentApplicationMaterial.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater',
  });
};
