/**
 * 分享链接生成工具
 */

/**
 * 生成活动分享链接
 * @param activityId 活动ID
 * @param shareBy 分享者ID（老师或园长的用户ID）
 * @param shareType 分享类型 (teacher/principal/wechat/qrcode)
 * @returns 完整的分享链接
 */
export function generateActivityShareLink(
  activityId: number | string,
  shareBy: number | string,
  shareType: 'teacher' | 'principal' | 'wechat' | 'qrcode' = 'teacher'
): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/mobile/activity/${activityId}?shareBy=${shareBy}&shareType=${shareType}`
}

/**
 * 生成活动报名链接（PC端）
 * @param activityId 活动ID
 * @param shareBy 分享者ID
 * @param shareType 分享类型
 * @returns 完整的报名链接
 */
export function generateActivityRegisterLink(
  activityId: number | string,
  shareBy: number | string,
  shareType: 'teacher' | 'principal' | 'wechat' | 'qrcode' = 'teacher'
): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/activity/register/${activityId}?shareBy=${shareBy}&shareType=${shareType}`
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      textArea.remove()
      return successful
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 分享类型选项
 */
export const shareTypeOptions = [
  { label: '老师分享', value: 'teacher' },
  { label: '园长分享', value: 'principal' },
  { label: '微信分享', value: 'wechat' },
  { label: '二维码', value: 'qrcode' }
]

/**
 * 获取分享类型的中文名称
 * @param shareType 分享类型
 * @returns 中文名称
 */
export function getShareTypeName(shareType: string): string {
  const option = shareTypeOptions.find(opt => opt.value === shareType)
  return option ? option.label : shareType
}

