/**
 * 检查链接是否为外部链接
 * @param {string} path - 需要检查的路径
 * @returns {boolean} - 如果是外部链接返回true，否则返回false
 */
export function isExternal(path: string): boolean {
  if (!path || typeof path !== 'string') return false
  return /^(https?:|mailto:|tel:)/i.test(path)
}

/**
 * 验证URL是否合法
 * @param {string} url - 需要验证的URL
 * @returns {boolean} - URL合法返回true，否则返回false
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  // 检查长度限制，防止DoS攻击
  if (url.length > 2048) return false

  try {
    // 使用原生URL构造函数进行验证，更准确且支持更多边界情况
    const urlObj = new URL(url)

    // 只允许http和https协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }

    // 检查主机名是否有效
    if (!urlObj.hostname) return false

    // 检查主机名格式
    if (urlObj.hostname.startsWith('.') || urlObj.hostname.endsWith('.') ||
        urlObj.hostname.includes('..') || urlObj.hostname === '.') {
      return false
    }

    // 检查是否包含恶意协议
    const maliciousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:']
    if (maliciousProtocols.some(protocol => url.toLowerCase().startsWith(protocol))) {
      return false
    }

    // 检查原始URL中的无效字符（在URL构造函数编码之前）
    if (url.includes(' ') || url.includes('|') || url.includes('\\')) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * 验证邮箱格式
 * @param {string} email - 需要验证的邮箱
 * @returns {boolean} - 邮箱格式正确返回true，否则返回false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  // 检查长度限制
  if (email.length > 254) return false

  // 分割本地部分和域名部分（使用最后一个@符号）
  const lastAtIndex = email.lastIndexOf('@')
  if (lastAtIndex === -1) return false // 没有@符号

  const localPart = email.substring(0, lastAtIndex)
  const domainPart = email.substring(lastAtIndex + 1)

  // 检查@符号数量（引用的本地部分中可以包含@符号）
  const atCount = (email.match(/@/g) || []).length
  if (atCount === 0) return false

  // 如果不是引用的本地部分，则只能有一个@符号
  if (!(localPart.startsWith('"') && localPart.endsWith('"')) && atCount !== 1) {
    return false
  }

  // 检查本地部分和域名部分是否存在
  if (!localPart || !domainPart) return false

  // 检查本地部分长度
  if (localPart.length > 64) return false

  // 检查域名部分长度
  if (domainPart.length > 253) return false

  // 检查域名格式
  if (domainPart.startsWith('.') || domainPart.endsWith('.') ||
      domainPart.includes('..') || domainPart.startsWith('-') ||
      domainPart.endsWith('-')) {
    return false
  }

  // 检查域名是否包含至少一个点（localhost等特殊情况除外）
  if (!domainPart.includes('.') && domainPart !== 'localhost') return false

  // 处理引用的本地部分
  if (localPart.startsWith('"') && localPart.endsWith('"')) {
    // 引用的本地部分，允许更多字符
    const quotedContent = localPart.slice(1, -1)
    // 检查引用内容的基本规则 - 允许转义的引号
    if (quotedContent.includes('"')) {
      // 检查是否所有引号都被正确转义
      const unescapedQuotes = quotedContent.replace(/\\"/g, '').includes('"')
      if (unescapedQuotes) {
        return false
      }
    }
    // 引用的本地部分验证通过，继续验证域名
  } else {
    // 非引用的本地部分，使用严格验证

    // 检查本地部分是否包含无效字符
    if (localPart.includes(' ') || localPart.includes('|') ||
        localPart.includes('\\') || localPart.includes('/')) {
      return false
    }

    // 检查连续的点
    if (localPart.includes('..')) return false

    // 检查开头和结尾的点
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false

    // 更严格的本地部分正则表达式验证
    const localPartReg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/
    if (!localPartReg.test(localPart)) return false
  }

  // 域名部分验证
  const domainReg = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return domainReg.test(domainPart)
}

/**
 * 验证手机号格式（中国大陆手机号）
 * @param {string} phone - 需要验证的手机号
 * @returns {boolean} - 手机号格式正确返回true，否则返回false
 */
export function validatePhone(phone: string): boolean {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
} 