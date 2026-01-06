import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';

export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

export class UserProfile extends Model<
  InferAttributes<UserProfile>,
  InferCreationAttributes<UserProfile>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare avatar: string | null;
  declare gender: Gender | null;
  declare birthday: Date | null;
  declare address: string | null;
  declare education: string | null;
  declare introduction: string | null;
  declare tags: string | null; // JSON string
  declare contactInfo: string | null; // JSON string
  declare extendedInfo: string | null; // JSON string

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  declare readonly user?: User;

  static initModel(sequelize: Sequelize): void {
    UserProfile.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '用户资料ID',
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          comment: '用户ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        avatar: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '用户头像URL',
        },
        gender: {
          type: DataTypes.TINYINT,
          allowNull: true,
          comment: '性别 0:未知 1:男 2:女',
        },
        birthday: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          comment: '生日',
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: '地址',
        },
        education: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '学历',
        },
        introduction: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '个人介绍',
        },
        tags: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '用户标签，JSON字符串存储',
        },
        contactInfo: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '联系信息，JSON字符串存储',
        },
        extendedInfo: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '扩展信息，JSON字符串存储',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'user_profiles',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    UserProfile.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}
