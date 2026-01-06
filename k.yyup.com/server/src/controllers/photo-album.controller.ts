import { Request, Response } from 'express';
import { PhotoAlbum } from '../models/photo-album.model';
import { PhotoAlbumItem } from '../models/photo-album-item.model';
import { Photo } from '../models/photo.model';
import { tenantOSS } from '../services/tenant-oss-router.service';
import { Op } from 'sequelize';

/**
 * 相册控制器
 */
export class PhotoAlbumController {
  /**
   * 获取相册列表（家长端）
   */
  static async getAlbums(req: Request, res: Response): Promise<void> {
    try {
      console.log('[PhotoAlbum] 开始获取相册列表');
      const userId = (req as any).user?.id;
      const kindergartenId = (req as any).user?.kindergartenId;
      const { page = 1, pageSize = 10, type } = req.query;

      console.log('[PhotoAlbum] 用户信息:', { userId, kindergartenId, page, pageSize, type });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const whereClause: any = {
        [Op.or]: [
          { isPublic: true },
          { kindergartenId: kindergartenId || null }
        ]
      };

      if (type) {
        whereClause.type = type;
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      console.log('[PhotoAlbum] 查询条件:', whereClause);
      const { count, rows: albums } = await PhotoAlbum.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      console.log('[PhotoAlbum] 查询到相册数量:', count, '本页:', albums.length);

      console.log('[PhotoAlbum] 使用统一租户OSS服务');
      // 获取所有相册的封面照片
      const coverPhotoIds = albums
        .filter(a => a.coverPhotoId)
        .map(a => a.coverPhotoId)
        .filter(Boolean) as number[];

      console.log('[PhotoAlbum] 封面照片IDs:', coverPhotoIds);
      
      let coverPhotos: Photo[] = [];
      if (coverPhotoIds.length > 0) {
        try {
          coverPhotos = await Photo.findAll({
            where: {
              id: {
                [Op.in]: coverPhotoIds
              }
            },
            attributes: ['id', 'fileUrl', 'thumbnailUrl']
          });
          console.log('[PhotoAlbum] 查询到封面照片数量:', coverPhotos.length);
        } catch (photoError: any) {
          console.error('[PhotoAlbum] 查询封面照片失败:', photoError.message);
          // 如果查询照片失败，继续处理但不设置封面
        }
      }

      const coverPhotoMap = new Map(coverPhotos.map(p => [p.id, p]));

      const albumsWithUrls = albums.map(album => {
        const albumData = album.toJSON();
        
        // 获取封面图片URL
        let coverImage = null;
        if (albumData.coverPhotoId) {
          const coverPhoto = coverPhotoMap.get(albumData.coverPhotoId);
          if (coverPhoto) {
            const photo = coverPhoto.toJSON() as any;
            if (photo.thumbnailUrl) {
              const ossPath = photo.thumbnailUrl.replace(/^https?:\/\/[^\/]+\//, '');
              coverImage = tenantOSS.getTenantFileUrl(req, ossPath, 60) || photo.thumbnailUrl;
            } else if (photo.fileUrl) {
              const ossPath = photo.fileUrl.replace(/^https?:\/\/[^\/]+\//, '');
              coverImage = tenantOSS.getTenantFileUrl(req, ossPath, 60) || photo.fileUrl;
            }
          }
        }

        return {
          id: albumData.id,
          title: albumData.name,
          description: albumData.description,
          type: albumData.type,
          photoCount: albumData.photoCount || 0,
          coverImage: coverImage || 'https://faceshanghaikarden.oss-cn-shanghai.aliyuncs.com/kindergarten/defaults/default-album.png',
          createdAt: albumData.createdAt,
          startDate: albumData.startDate,
          endDate: albumData.endDate
        };
      });

      res.json({
        success: true,
        data: {
          items: albumsWithUrls,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error: any) {
      console.error('[PhotoAlbum] 获取相册列表失败:', error);
      console.error('[PhotoAlbum] 错误堆栈:', error.stack);
      res.status(500).json({
        success: false,
        message: '获取相册列表失败',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * 获取相册详情
   */
  static async getAlbumDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const album = await PhotoAlbum.findByPk(id, {
        include: [
          {
            model: PhotoAlbumItem,
            as: 'items',
            order: [['sortOrder', 'ASC'], ['addedAt', 'ASC']]
          }
        ]
      });

      if (!album) {
        res.status(404).json({
          success: false,
          message: '相册不存在'
        });
        return;
      }

      const albumData = album.toJSON() as any;

      // 获取所有照片
      const photoIds = (albumData.items || []).map((item: any) => item.photoId).filter(Boolean);
      const photosData = await Photo.findAll({
        where: {
          id: {
            [Op.in]: photoIds
          }
        },
        attributes: ['id', 'fileUrl', 'thumbnailUrl', 'description', 'shootDate']
      });

      const photoMap = new Map(photosData.map(p => [p.id, p]));

      // 处理照片URL
      const photos = (albumData.items || []).map((item: any) => {
        const photo = photoMap.get(item.photoId);
        if (!photo) return null;

        const photoData = photo.toJSON() as any;
        const fileUrl = photoData.fileUrl;
        const thumbnailUrl = photoData.thumbnailUrl || fileUrl;

        // 提取OSS路径（移除完整URL前缀）
        const fileOssPath = fileUrl.replace(/^https?:\/\/[^\/]+\//, '');
        const thumbOssPath = thumbnailUrl.replace(/^https?:\/\/[^\/]+\//, '');

        return {
          id: photoData.id,
          url: tenantOSS.getTenantFileUrl(req, fileOssPath, 60) || fileUrl,
          thumbnailUrl: tenantOSS.getTenantFileUrl(req, thumbOssPath, 60) || thumbnailUrl,
          description: photoData.description,
          shootDate: photoData.shootDate
        };
      }).filter(Boolean);

      res.json({
        success: true,
        data: {
          id: albumData.id,
          title: albumData.name,
          description: albumData.description,
          type: albumData.type,
          photoCount: albumData.photoCount || photos.length,
          photos,
          createdAt: albumData.createdAt,
          startDate: albumData.startDate,
          endDate: albumData.endDate
        }
      });
    } catch (error: any) {
      console.error('获取相册详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取相册详情失败',
        error: error.message
      });
    }
  }

  /**
   * 获取相册统计信息
   */
  static async getAlbumStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('[PhotoAlbum] 开始获取统计信息');
      const userId = (req as any).user?.id;
      const kindergartenId = (req as any).user?.kindergartenId;

      console.log('[PhotoAlbum] 统计用户信息:', { userId, kindergartenId });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      const whereClause: any = {
        [Op.or]: [
          { isPublic: true },
          { kindergartenId: kindergartenId || null }
        ]
      };

      console.log('[PhotoAlbum] 统计查询条件:', whereClause);
      
      const totalAlbums = await PhotoAlbum.count({ where: whereClause });
      console.log('[PhotoAlbum] 总相册数:', totalAlbums);
      
      // 计算总照片数：只统计已发布的照片，使用原始SQL查询
      // 修复：移除硬编码的album_id，统计用户有权访问的所有相册的照片
      let totalPhotos = 0; // 初始化为0
      try {
        // 获取用户有权访问的相册ID列表
        const accessibleAlbums = await PhotoAlbum.findAll({
          where: whereClause,
          attributes: ['id']
        });
        const albumIds = accessibleAlbums.map(album => album.id);

        if (albumIds.length === 0) {
          // 如果没有可访问的相册，照片数为0
          console.log('[PhotoAlbum] 用户没有可访问的相册，照片总数为0');
        } else {
          // 构建SQL查询，统计可访问相册中的照片
          const [photoStats] = await Photo.sequelize.query(`
            SELECT COUNT(DISTINCT p.id) as totalPhotos
            FROM photo_album_items pai
            INNER JOIN photos p ON p.id = pai.photo_id
            WHERE p.status = 'published'
            AND pai.album_id IN (${albumIds.join(',')})
          `);
          totalPhotos = (photoStats[0] as any)?.totalPhotos || 0;
          console.log('[PhotoAlbum] 统计已发布照片总数:', totalPhotos, '相册数:', albumIds.length);
        }
      } catch (sqlError: any) {
        console.error('[PhotoAlbum] 查询照片数量失败:', sqlError.message);
        // 如果SQL查询失败，保持totalPhotos为0
        totalPhotos = 0;
      }
      
      const favoritePhotos = 0; // TODO: 实现收藏功能

      res.json({
        success: true,
        data: {
          totalPhotos,
          totalAlbums,
          favoritePhotos
        }
      });
    } catch (error: any) {
      console.error('[PhotoAlbum] 获取相册统计失败:', error);
      console.error('[PhotoAlbum] 错误堆栈:', error.stack);
      res.status(500).json({
        success: false,
        message: '获取相册统计失败',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * 获取照片列表（时间轴视图）
   */
  static async getPhotos(req: Request, res: Response): Promise<void> {
    try {
      console.log('[PhotoAlbum] 开始获取照片列表');
      const userId = (req as any).user?.id;
      const kindergartenId = (req as any).user?.kindergartenId;
      const { page = 1, pageSize = 100, albumId } = req.query;

      console.log('[PhotoAlbum] 照片查询参数:', { userId, kindergartenId, page, pageSize, albumId });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '未授权访问'
        });
        return;
      }

      // 构建查询条件
      const whereClause: any = {
        kindergartenId: kindergartenId || null,
        status: 'published' // 只获取已发布的照片
      };

      // 如果指定了相册ID，需要关联查询
      let photoIds: number[] = [];
      if (albumId) {
        console.log('[PhotoAlbum] 查询指定相册的照片:', albumId);
        const albumItems = await PhotoAlbumItem.findAll({
          where: { albumId: Number(albumId) },
          attributes: ['photoId']
        });
        photoIds = albumItems.map(item => item.photoId).filter(Boolean) as number[];
        console.log('[PhotoAlbum] 相册中的照片IDs:', photoIds);
        
        if (photoIds.length > 0) {
          whereClause.id = {
            [Op.in]: photoIds
          };
        } else {
          // 如果相册中没有照片，返回空数组
          res.json({
            success: true,
            data: {
              items: [],
              total: 0,
              page: Number(page),
              pageSize: Number(pageSize)
            }
          });
          return;
        }
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      console.log('[PhotoAlbum] 照片查询条件:', JSON.stringify(whereClause));
      
      const { count, rows: photos } = await Photo.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['shootDate', 'DESC'], ['uploadTime', 'DESC'], ['createdAt', 'DESC']],
        attributes: [
          'id', 'fileUrl', 'thumbnailUrl', 'originalName', 
          'caption', 'description', 'shootDate', 'uploadTime',
          'activityName', 'activityType', 'category', 'createdAt'
        ]
      });

      console.log('[PhotoAlbum] 查询到照片数量:', count, '本页:', photos.length);

      console.log('[PhotoAlbum] 使用统一租户OSS服务');

      // 如果需要获取相册名称，查询照片所属的相册
      const photoAlbumMap = new Map<number, string>();
      if (!albumId && photos.length > 0) {
        const albumItems = await PhotoAlbumItem.findAll({
          where: {
            photoId: {
              [Op.in]: photos.map(p => p.id)
            }
          },
          attributes: ['photoId', 'albumId'],
          include: [{
            model: PhotoAlbum,
            as: 'album',
            attributes: ['name']
          }]
        });
        
        albumItems.forEach(item => {
          const itemData = item.toJSON() as any;
          if (itemData.album) {
            photoAlbumMap.set(itemData.photoId, itemData.album.name);
          }
        });
        console.log('[PhotoAlbum] 查询到照片相册关联:', photoAlbumMap.size);
      }

      // 处理照片URL和数据
      const photosWithUrls = photos.map(photo => {
        const photoData = photo.toJSON() as any;
        
        // 获取文件URL和缩略图URL
        let fileUrl = photoData.fileUrl;
        let thumbnailUrl = photoData.thumbnailUrl || fileUrl;

        // 处理OSS签名URL
        if (fileUrl) {
          const fileOssPath = fileUrl.replace(/^https?:\/\/[^\/]+\//, '');
          fileUrl = tenantOSS.getTenantFileUrl(req, fileOssPath, 60) || fileUrl;
        }

        if (thumbnailUrl) {
          const thumbOssPath = thumbnailUrl.replace(/^https?:\/\/[^\/]+\//, '');
          thumbnailUrl = tenantOSS.getTenantFileUrl(req, thumbOssPath, 60) || thumbnailUrl;
        }

        return {
          id: photoData.id,
          url: fileUrl || '/default-photo.png',
          thumbnailUrl: thumbnailUrl || '/default-photo.png',
          caption: photoData.caption || photoData.activityName || photoData.originalName,
          description: photoData.description,
          shootDate: photoData.shootDate || photoData.uploadTime || photoData.createdAt,
          uploadTime: photoData.uploadTime || photoData.createdAt,
          albumId: photoIds.length > 0 ? Number(albumId) : null,
          albumName: photoAlbumMap.get(photoData.id) || '未分类',
          activityName: photoData.activityName,
          activityType: photoData.activityType,
          category: photoData.category
        };
      });

      console.log('[PhotoAlbum] 返回照片数据示例:', photosWithUrls.length > 0 ? photosWithUrls[0] : 'empty');

      res.json({
        success: true,
        data: {
          items: photosWithUrls,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize)
        }
      });
    } catch (error: any) {
      console.error('[PhotoAlbum] 获取照片列表失败:', error);
      console.error('[PhotoAlbum] 错误堆栈:', error.stack);
      res.status(500).json({
        success: false,
        message: '获取照片列表失败',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

