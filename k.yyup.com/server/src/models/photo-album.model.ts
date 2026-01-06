import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 相册类型
 */
export enum AlbumType {
  ACTIVITY = 'activity', // 活动相册
  MONTHLY = 'monthly',   // 月度相册
  YEARLY = 'yearly',     // 年度相册
  CUSTOM = 'custom',     // 自定义相册
}

/**
 * 相册Model
 */
export class PhotoAlbum extends Model<
  InferAttributes<PhotoAlbum>,
  InferCreationAttributes<PhotoAlbum>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare type: CreationOptional<AlbumType>;
  declare coverPhotoId: number | null;

  // 归属信息
  declare classId: number | null;
  declare kindergartenId: number | null;
  declare createdBy: number;

  // 相册信息
  declare description: string | null;
  declare photoCount: CreationOptional<number>;
  declare startDate: Date | null;
  declare endDate: Date | null;

  // 权限
  declare isPublic: CreationOptional<boolean>;
  declare sortOrder: CreationOptional<number>;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  public static initModel(sequelize: Sequelize): typeof PhotoAlbum {
    PhotoAlbum.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '相册名称',
        },
        type: {
          type: DataTypes.ENUM('activity', 'monthly', 'yearly', 'custom'),
          allowNull: false,
          defaultValue: 'activity',
          comment: '相册类型',
        },
        coverPhotoId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'cover_photo_id',
          comment: '封面照片ID',
        },
        classId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'class_id',
          comment: '班级ID',
        },
        kindergartenId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'kindergarten_id',
          comment: '幼儿园ID',
        },
        createdBy: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          field: 'created_by',
          comment: '创建人ID',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '相册描述',
        },
        photoCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'photo_count',
          comment: '照片数量',
        },
        startDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'start_date',
          comment: '开始日期',
        },
        endDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'end_date',
          comment: '结束日期',
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_public',
          comment: '是否公开',
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'sort_order',
          comment: '排序',
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
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'photo_albums',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored: true,
      }
    );

    return PhotoAlbum;
  }
}





