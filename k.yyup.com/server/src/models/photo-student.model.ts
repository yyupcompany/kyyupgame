import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 人脸坐标
 */
export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 照片-学生关联Model
 */
export class PhotoStudent extends Model<
  InferAttributes<PhotoStudent>,
  InferCreationAttributes<PhotoStudent>
> {
  declare id: CreationOptional<number>;
  declare photoId: number;
  declare studentId: number;

  // 人脸识别信息
  declare confidence: CreationOptional<number>;
  declare faceBox: FaceBox | null;
  declare faceToken: string | null;

  // 确认信息
  declare confirmedBy: number | null;
  declare confirmedAt: Date | null;
  declare isAutoTagged: CreationOptional<boolean>;
  declare isPrimary: CreationOptional<boolean>;

  // 家长操作
  declare isFavorited: CreationOptional<boolean>;
  declare parentNote: string | null;

  // 时间戳
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  public static initModel(sequelize: Sequelize): typeof PhotoStudent {
    PhotoStudent.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        photoId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          field: 'photo_id',
          comment: '照片ID',
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'student_id',
          comment: '学生ID',
        },
        confidence: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0,
          comment: '识别置信度(0-1)',
        },
        faceBox: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'face_box',
          comment: '人脸坐标{x,y,w,h}',
        },
        faceToken: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'face_token',
          comment: '百度AI人脸Token',
        },
        confirmedBy: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          field: 'confirmed_by',
          comment: '确认老师ID',
        },
        confirmedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'confirmed_at',
          comment: '确认时间',
        },
        isAutoTagged: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_auto_tagged',
          comment: '是否AI自动标记',
        },
        isPrimary: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_primary',
          comment: '是否主角',
        },
        isFavorited: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_favorited',
          comment: '是否被家长收藏',
        },
        parentNote: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'parent_note',
          comment: '家长备注',
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
        tableName: 'photo_students',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
      }
    );

    return PhotoStudent;
  }
}





