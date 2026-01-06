/**
 * 文件管理相关API端点
 */
import { API_PREFIX } from './base';

// 文件上传接口
export const FILE_UPLOAD_ENDPOINTS = {
  BASE: `${API_PREFIX}files`,
  UPLOAD: `${API_PREFIX}files/upload`,
  UPLOAD_MULTIPLE: `${API_PREFIX}files/upload-multiple`,
  UPLOAD_CHUNK: `${API_PREFIX}files/upload-chunk`,
  UPLOAD_AVATAR: `${API_PREFIX}files/upload-avatar`,
  UPLOAD_DOCUMENT: `${API_PREFIX}files/upload-document`,
  UPLOAD_IMAGE: `${API_PREFIX}files/upload-image`,
  UPLOAD_VIDEO: `${API_PREFIX}files/upload-video`,
  UPLOAD_AUDIO: `${API_PREFIX}files/upload-audio`,
  UPLOAD_POSTER: `${API_PREFIX}files/upload-poster`,
  UPLOAD_CERTIFICATE: `${API_PREFIX}files/upload-certificate`,
} as const;

// 文件管理接口
export const FILE_MANAGEMENT_ENDPOINTS = {
  BASE: `${API_PREFIX}files`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}files/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}files/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}files/${id}`,
  DOWNLOAD: (id: number | string) => `${API_PREFIX}files/${id}/download`,
  PREVIEW: (id: number | string) => `${API_PREFIX}files/${id}/preview`,
  INFO: (id: number | string) => `${API_PREFIX}files/${id}/info`,
  RENAME: (id: number | string) => `${API_PREFIX}files/${id}/rename`,
  MOVE: (id: number | string) => `${API_PREFIX}files/${id}/move`,
  COPY: (id: number | string) => `${API_PREFIX}files/${id}/copy`,
  SHARE: (id: number | string) => `${API_PREFIX}files/${id}/share`,
  PERMISSIONS: (id: number | string) => `${API_PREFIX}files/${id}/permissions`,
  BATCH_DELETE: `${API_PREFIX}files/batch-delete`,
  BATCH_MOVE: `${API_PREFIX}files/batch-move`,
  BATCH_COPY: `${API_PREFIX}files/batch-copy`,
  SEARCH: `${API_PREFIX}files/search`,
  RECENT: `${API_PREFIX}files/recent`,
  FAVORITES: `${API_PREFIX}files/favorites`,
  TRASH: `${API_PREFIX}files/trash`,
  RESTORE: (id: number | string) => `${API_PREFIX}files/${id}/restore`,
  PERMANENT_DELETE: (id: number | string) => `${API_PREFIX}files/${id}/permanent-delete`,
} as const;

// 文件夹管理接口
export const FOLDER_ENDPOINTS = {
  BASE: `${API_PREFIX}folders`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}folders/${id}`,
  CREATE: `${API_PREFIX}folders/create`,
  UPDATE: (id: number | string) => `${API_PREFIX}folders/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}folders/${id}`,
  RENAME: (id: number | string) => `${API_PREFIX}folders/${id}/rename`,
  MOVE: (id: number | string) => `${API_PREFIX}folders/${id}/move`,
  COPY: (id: number | string) => `${API_PREFIX}folders/${id}/copy`,
  CONTENTS: (id: number | string) => `${API_PREFIX}folders/${id}/contents`,
  TREE: `${API_PREFIX}folders/tree`,
  BREADCRUMB: (id: number | string) => `${API_PREFIX}folders/${id}/breadcrumb`,
  PERMISSIONS: (id: number | string) => `${API_PREFIX}folders/${id}/permissions`,
  SHARE: (id: number | string) => `${API_PREFIX}folders/${id}/share`,
  ZIP: (id: number | string) => `${API_PREFIX}folders/${id}/zip`,
  STATISTICS: (id: number | string) => `${API_PREFIX}folders/${id}/statistics`,
} as const;

// 文件存储接口
export const STORAGE_ENDPOINTS = {
  BASE: `${API_PREFIX}storage`,
  USAGE: `${API_PREFIX}storage/usage`,
  QUOTA: `${API_PREFIX}storage/quota`,
  STATISTICS: `${API_PREFIX}storage/statistics`,
  CLEANUP: `${API_PREFIX}storage/cleanup`,
  OPTIMIZE: `${API_PREFIX}storage/optimize`,
  BACKUP: `${API_PREFIX}storage/backup`,
  RESTORE: `${API_PREFIX}storage/restore`,
  SETTINGS: `${API_PREFIX}storage/settings`,
  PROVIDERS: `${API_PREFIX}storage/providers`,
  MIGRATE: `${API_PREFIX}storage/migrate`,
  HEALTH: `${API_PREFIX}storage/health`,
} as const;

// 图片处理接口
export const IMAGE_PROCESSING_ENDPOINTS = {
  BASE: `${API_PREFIX}images`,
  RESIZE: `${API_PREFIX}images/resize`,
  CROP: `${API_PREFIX}images/crop`,
  ROTATE: `${API_PREFIX}images/rotate`,
  WATERMARK: `${API_PREFIX}images/watermark`,
  COMPRESS: `${API_PREFIX}images/compress`,
  CONVERT: `${API_PREFIX}images/convert`,
  THUMBNAIL: `${API_PREFIX}images/thumbnail`,
  BATCH_PROCESS: `${API_PREFIX}images/batch-process`,
  FILTERS: `${API_PREFIX}images/filters`,
  EFFECTS: `${API_PREFIX}images/effects`,
  OPTIMIZATION: `${API_PREFIX}images/optimization`,
} as const;

// 文档处理接口
export const DOCUMENT_PROCESSING_ENDPOINTS = {
  BASE: `${API_PREFIX}documents`,
  CONVERT: `${API_PREFIX}documents/convert`,
  MERGE: `${API_PREFIX}documents/merge`,
  SPLIT: `${API_PREFIX}documents/split`,
  EXTRACT_TEXT: `${API_PREFIX}documents/extract-text`,
  EXTRACT_IMAGES: `${API_PREFIX}documents/extract-images`,
  WATERMARK: `${API_PREFIX}documents/watermark`,
  COMPRESS: `${API_PREFIX}documents/compress`,
  SIGN: `${API_PREFIX}documents/sign`,
  PROTECT: `${API_PREFIX}documents/protect`,
  BATCH_PROCESS: `${API_PREFIX}documents/batch-process`,
} as const;