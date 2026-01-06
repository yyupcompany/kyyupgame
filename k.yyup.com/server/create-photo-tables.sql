-- 创建 photos 表
CREATE TABLE IF NOT EXISTS `photos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `fileUrl` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `thumbnailUrl` VARCHAR(500) COMMENT '缩略图URL',
  `originalName` VARCHAR(255) COMMENT '原始文件名',
  `fileSize` BIGINT DEFAULT 0 COMMENT '文件大小',
  `width` INT DEFAULT 0 COMMENT '图片宽度',
  `height` INT DEFAULT 0 COMMENT '图片高度',
  `uploadUserId` INT NOT NULL COMMENT '上传用户ID',
  `uploadTime` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `kindergartenId` INT COMMENT '幼儿园ID',
  `classId` INT COMMENT '班级ID',
  `activityType` VARCHAR(100) COMMENT '活动类型',
  `activityName` VARCHAR(255) COMMENT '活动名称',
  `shootDate` DATETIME COMMENT '拍摄日期',
  `description` TEXT COMMENT '描述',
  `category` VARCHAR(100) COMMENT '分类',
  `tags` JSON COMMENT '标签',
  `caption` VARCHAR(500) COMMENT '标题',
  `faceCount` INT DEFAULT 0 COMMENT '人脸数量',
  `aiProcessed` BOOLEAN DEFAULT FALSE COMMENT 'AI是否已处理',
  `qualityScore` FLOAT DEFAULT 0 COMMENT '质量评分',
  `visibility` ENUM('public', 'class', 'private') DEFAULT 'private' COMMENT '可见性',
  `status` ENUM('pending', 'tagged', 'published', 'archived') DEFAULT 'pending' COMMENT '状态',
  `isRecommended` BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
  `recommendedBy` INT COMMENT '推荐者ID',
  `recommendedAt` DATETIME COMMENT '推荐时间',
  `viewCount` INT DEFAULT 0 COMMENT '浏览次数',
  `downloadCount` INT DEFAULT 0 COMMENT '下载次数',
  `likeCount` INT DEFAULT 0 COMMENT '点赞次数',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME,
  KEY `idx_uploadUserId` (`uploadUserId`),
  KEY `idx_kindergartenId` (`kindergartenId`),
  KEY `idx_classId` (`classId`),
  KEY `idx_status` (`status`),
  KEY `idx_visibility` (`visibility`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 photo_albums 表
CREATE TABLE IF NOT EXISTS `photo_albums` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT '相册名称',
  `description` TEXT COMMENT '相册描述',
  `coverPhotoId` INT COMMENT '封面照片ID',
  `ownerId` INT NOT NULL COMMENT '所有者ID',
  `kindergartenId` INT COMMENT '幼儿园ID',
  `classId` INT COMMENT '班级ID',
  `visibility` ENUM('public', 'class', 'private') DEFAULT 'private',
  `itemCount` INT DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME,
  KEY `idx_ownerId` (`ownerId`),
  KEY `idx_kindergartenId` (`kindergartenId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 photo_album_items 表
CREATE TABLE IF NOT EXISTS `photo_album_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `albumId` INT NOT NULL,
  `photoId` INT NOT NULL,
  `sortOrder` INT DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_albumId` (`albumId`),
  KEY `idx_photoId` (`photoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 photo_students 表
CREATE TABLE IF NOT EXISTS `photo_students` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `photoId` INT NOT NULL,
  `studentId` INT NOT NULL,
  `confidence` FLOAT DEFAULT 0 COMMENT '置信度',
  `isManualTag` BOOLEAN DEFAULT FALSE COMMENT '是否手动标记',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_photoId` (`photoId`),
  KEY `idx_studentId` (`studentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 photo_videos 表
CREATE TABLE IF NOT EXISTS `photo_videos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `photoId` INT NOT NULL,
  `videoUrl` VARCHAR(500) NOT NULL,
  `duration` INT DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_photoId` (`photoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建 student_face_libraries 表
CREATE TABLE IF NOT EXISTS `student_face_libraries` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `studentId` INT NOT NULL,
  `faceId` VARCHAR(255) NOT NULL COMMENT '阿里云人脸ID',
  `photoId` INT COMMENT '照片ID',
  `quality` FLOAT DEFAULT 0 COMMENT '人脸质量评分',
  `isActive` BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_studentId` (`studentId`),
  KEY `idx_faceId` (`faceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
