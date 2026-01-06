import { showToast } from 'vant'
import { childGrowthApi } from '@/api/modules/child-growth'

/**
 * 导出成长报告
 */
export const exportGrowthReport = async (childId: number, format: 'pdf' | 'excel' = 'pdf') => {
  try {
    showToast({ message: '生成报告中...', forbidClick: true })

    const params = {
      format,
      dateFrom: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    }

    const response = await childGrowthApi.exportGrowthReport(childId, params)

    // 创建下载链接
    const blob = new Blob([response], {
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `成长报告_${new Date().toLocaleDateString('zh-CN')}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    showToast('报告下载成功')
  } catch (error) {
    console.error('导出报告失败:', error)
    showToast('导出失败，请重试')
  }
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 压缩图片
 */
export const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // 计算压缩尺寸
      const maxWidth = 1200
      const maxHeight = 1200
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 生成成长趋势分析数据
 */
export const generateGrowthTrend = async (childId: number) => {
  try {
    const trends = await Promise.all([
      childGrowthApi.getGrowthTrend(childId, { type: 'height', period: 'month' }),
      childGrowthApi.getGrowthTrend(childId, { type: 'weight', period: 'month' }),
      childGrowthApi.getGrowthTrend(childId, { type: 'skills', period: 'month' })
    ])

    return {
      height: trends[0].data || [],
      weight: trends[1].data || [],
      skills: trends[2].data || []
    }
  } catch (error) {
    console.error('获取成长趋势数据失败:', error)
    return {
      height: [],
      weight: [],
      skills: []
    }
  }
}

/**
 * 生成智能成长建议
 */
export const getGrowthSuggestions = async (childId: number) => {
  try {
    const response = await childGrowthApi.getGrowthSuggestions(childId)
    return response.data || []
  } catch (error) {
    console.error('获取成长建议失败:', error)
    return [
      '建议多进行户外活动，增强体质',
      '培养良好的阅读习惯',
      '注重社交能力的培养',
      '保持规律的作息时间'
    ]
  }
}