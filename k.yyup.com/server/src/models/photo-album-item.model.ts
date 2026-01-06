import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';

/**
 * 相册照片关联Model
 */
export class PhotoAlbumItem extends Model<
  InferAttributes<PhotoAlbumItem>,
  InferCreationAttributes<PhotoAlbumItem>
> {
  declare id: CreationOptional<number>;
  declare albumId: number;
  declare photoId: number;
  declare sortOrder: CreationOptional<number>;
  declare readonly addedAt: CreationOptional<Date>;

  public static initModel(sequelize: Sequelize): typeof PhotoAlbumItem {
    PhotoAlbumItem.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        albumId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          field: 'album_id',
          comment: '相册ID',
        },
        photoId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          field: 'photo_id',
          comment: '照片ID',
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'sort_order',
          comment: '排序',
        },
        addedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'added_at',
        },
      },
      {
        sequelize,
        tableName: 'photo_album_items',
        timestamps: false,
        underscored: true,
      }
    );

    return PhotoAlbumItem;
  }
}





