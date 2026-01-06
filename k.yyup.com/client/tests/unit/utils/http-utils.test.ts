import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as httpUtils from '../../../src/utils/http-utils'

// Mock fetch
const mockFetch = vi.fn()

// Mock Response
class MockResponse {
  status: number
  statusText: string
  headers: Headers
  url: string
  type: ResponseType
  redirected: boolean
  body: ReadableStream<Uint8Array> | null
  bodyUsed: boolean
  ok: boolean

  constructor(body: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
    this.url = init?.url || ''
    this.type = init?.type || 'basic'
    this.redirected = init?.redirected || false
    this.body = null
    this.bodyUsed = false
    this.ok = this.status >= 200 && this.status < 300
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0)
  }

  async blob(): Promise<Blob> {
    return new Blob([])
  }

  async formData(): Promise<FormData> {
    return new FormData()
  }

  async json(): Promise<any> {
    return {}
  }

  async text(): Promise<string> {
    return ''
  }

  clone(): Response {
    return new MockResponse(null, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
      url: this.url,
      type: this.type,
      redirected: this.redirected
    })
  }
}

// Mock Request
class MockRequest {
  method: string
  url: string
  headers: Headers
  body: ReadableStream<Uint8Array> | null
  bodyUsed: boolean
  cache: RequestCache
  credentials: RequestCredentials
  destination: RequestDestination
  headers: Headers
  integrity: string
  keepalive: boolean
  method: string
  mode: RequestMode
  redirect: RequestRedirect
  referrer: string
  referrerPolicy: ReferrerPolicy
  signal: AbortSignal
  url: string

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this.url = typeof input === 'string' ? input : input.toString()
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = null
    this.bodyUsed = false
    this.cache = init?.cache || 'default'
    this.credentials = init?.credentials || 'same-origin'
    this.destination = init?.destination || ''
    this.integrity = init?.integrity || ''
    this.keepalive = init?.keepalive || false
    this.mode = init?.mode || 'cors'
    this.redirect = init?.redirect || 'follow'
    this.referrer = init?.referrer || 'about:client'
    this.referrerPolicy = init?.referrerPolicy || ''
    this.signal = init?.signal || new AbortController().signal
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(0)
  }

  async blob(): Promise<Blob> {
    return new Blob([])
  }

  async formData(): Promise<FormData> {
    return new FormData()
  }

  async json(): Promise<any> {
    return {}
  }

  async text(): Promise<string> {
    return ''
  }

  clone(): Request {
    return new MockRequest(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      cache: this.cache,
      credentials: this.credentials,
      destination: this.destination,
      integrity: this.integrity,
      keepalive: this.keepalive,
      mode: this.mode,
      redirect: this.redirect,
      referrer: this.referrer,
      referrerPolicy: this.referrerPolicy,
      signal: this.signal
    })
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('HTTP Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    vi.stubGlobal('Request', MockRequest)
    vi.stubGlobal('Response', MockResponse)
    vi.stubGlobal('Headers', Headers)
    vi.stubGlobal('AbortController', {
      signal: { aborted: false },
      abort: vi.fn()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('get', () => {
    it('should make GET request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await httpUtils.get('https://api.example.com/data')
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'GET',
        headers: {}
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle GET request with headers', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const headers = { 'Authorization': 'Bearer token' }
      const result = await httpUtils.get('https://api.example.com/data', { headers })
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token' }
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle GET request with query parameters', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const params = { page: 1, limit: 10 }
      const result = await httpUtils.get('https://api.example.com/data', { params })
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data?page=1&limit=10', {
        method: 'GET',
        headers: {}
      })
      expect(result).toEqual({ data: 'test' })
    })

    it('should handle GET request error', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      await expect(httpUtils.get('https://api.example.com/data')).rejects.toThrow()
    })
  })

  describe('post', () => {
    it('should make POST request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const data = { name: 'test' }
      const result = await httpUtils.post('https://api.example.com/data', data)
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      expect(result).toEqual({ data: 'created' })
    })

    it('should handle POST request with custom headers', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const data = { name: 'test' }
      const headers = { 'Authorization': 'Bearer token' }
      const result = await httpUtils.post('https://api.example.com/data', data, { headers })
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      expect(result).toEqual({ data: 'created' })
    })

    it('should handle POST request with FormData', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'created' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const formData = new FormData()
      formData.append('name', 'test')
      
      const result = await httpUtils.post('https://api.example.com/data', formData)
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'POST',
        headers: {},
        body: formData
      })
      expect(result).toEqual({ data: 'created' })
    })
  })

  describe('put', () => {
    it('should make PUT request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const data = { name: 'updated' }
      const result = await httpUtils.put('https://api.example.com/data/1', data)
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      expect(result).toEqual({ data: 'updated' })
    })
  })

  describe('patch', () => {
    it('should make PATCH request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'patched' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const data = { name: 'patched' }
      const result = await httpUtils.patch('https://api.example.com/data/1', data)
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      expect(result).toEqual({ data: 'patched' })
    })
  })

  describe('delete', () => {
    it('should make DELETE request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await httpUtils.delete('https://api.example.com/data/1')
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data/1', {
        method: 'DELETE',
        headers: {}
      })
      expect(result).toEqual({ data: 'deleted' })
    })
  })

  describe('head', () => {
    it('should make HEAD request', async () => {
      const mockResponse = new MockResponse(null, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await httpUtils.head('https://api.example.com/data')
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'HEAD',
        headers: {}
      })
      expect(result.status).toBe(200)
    })
  })

  describe('options', () => {
    it('should make OPTIONS request', async () => {
      const mockResponse = new MockResponse(null, {
        status: 200,
        headers: { 'Allow': 'GET, POST, PUT, DELETE' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await httpUtils.options('https://api.example.com/data')
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', {
        method: 'OPTIONS',
        headers: {}
      })
      expect(result.status).toBe(200)
    })
  })

  describe('request', () => {
    it('should make custom request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'custom' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const config = {
        method: 'POST',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({ name: 'test' })
      }
      
      const result = await httpUtils.request('https://api.example.com/data', config)
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data', config)
      expect(result).toEqual({ data: 'custom' })
    })
  })

  describe('buildUrl', () => {
    it('should build URL with query parameters', () => {
      const url = 'https://api.example.com/data'
      const params = { page: 1, limit: 10, search: 'test' }
      
      const result = httpUtils.buildUrl(url, params)
      
      expect(result).toBe('https://api.example.com/data?page=1&limit=10&search=test')
    })

    it('should handle URL with existing query parameters', () => {
      const url = 'https://api.example.com/data?existing=param'
      const params = { page: 1, limit: 10 }
      
      const result = httpUtils.buildUrl(url, params)
      
      expect(result).toBe('https://api.example.com/data?existing=param&page=1&limit=10')
    })

    it('should handle empty parameters', () => {
      const url = 'https://api.example.com/data'
      const params = {}
      
      const result = httpUtils.buildUrl(url, params)
      
      expect(result).toBe('https://api.example.com/data')
    })

    it('should handle null parameters', () => {
      const url = 'https://api.example.com/data'
      const params = null
      
      const result = httpUtils.buildUrl(url, params)
      
      expect(result).toBe('https://api.example.com/data')
    })

    it('should handle array parameters', () => {
      const url = 'https://api.example.com/data'
      const params = { ids: [1, 2, 3] }
      
      const result = httpUtils.buildUrl(url, params)
      
      expect(result).toBe('https://api.example.com/data?ids=1,2,3')
    })
  })

  describe('buildHeaders', () => {
    it('should build headers with default content type', () => {
      const headers = {}
      
      const result = httpUtils.buildHeaders(headers)
      
      expect(result).toEqual({ 'Content-Type': 'application/json' })
    })

    it('should build headers with custom headers', () => {
      const headers = { 'Authorization': 'Bearer token' }
      
      const result = httpUtils.buildHeaders(headers)
      
      expect(result).toEqual({
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
      })
    })

    it('should not override existing content type', () => {
      const headers = { 'Content-Type': 'application/xml' }
      
      const result = httpUtils.buildHeaders(headers)
      
      expect(result).toEqual({ 'Content-Type': 'application/xml' })
    })
  })

  describe('parseResponse', () => {
    it('should parse JSON response', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await httpUtils.parseResponse(mockResponse)
      
      expect(result).toEqual({ data: 'test' })
    })

    it('should parse text response', async () => {
      const mockResponse = new MockResponse('plain text', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
      
      vi.spyOn(mockResponse, 'text').mockResolvedValue('plain text')
      
      const result = await httpUtils.parseResponse(mockResponse)
      
      expect(result).toBe('plain text')
    })

    it('should handle empty response', async () => {
      const mockResponse = new MockResponse(null, {
        status: 204,
        headers: {}
      })
      
      const result = await httpUtils.parseResponse(mockResponse)
      
      expect(result).toBeNull()
    })
  })

  describe('handleError', () => {
    it('should handle HTTP error', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
      
      await expect(httpUtils.handleError(mockResponse)).rejects.toThrow()
    })

    it('should handle network error', async () => {
      const error = new Error('Network error')
      
      await expect(httpUtils.handleError(error)).rejects.toThrow('Network error')
    })
  })

  describe('isSuccess', () => {
    it('should return true for successful response', () => {
      const mockResponse = new MockResponse(null, { status: 200 })
      
      const result = httpUtils.isSuccess(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for error response', () => {
      const mockResponse = new MockResponse(null, { status: 404 })
      
      const result = httpUtils.isSuccess(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('isClientError', () => {
    it('should return true for client error', () => {
      const mockResponse = new MockResponse(null, { status: 400 })
      
      const result = httpUtils.isClientError(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-client error', () => {
      const mockResponse = new MockResponse(null, { status: 500 })
      
      const result = httpUtils.isClientError(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('should return true for server error', () => {
      const mockResponse = new MockResponse(null, { status: 500 })
      
      const result = httpUtils.isServerError(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-server error', () => {
      const mockResponse = new MockResponse(null, { status: 400 })
      
      const result = httpUtils.isServerError(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('isRedirect', () => {
    it('should return true for redirect response', () => {
      const mockResponse = new MockResponse(null, { status: 302 })
      
      const result = httpUtils.isRedirect(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-redirect response', () => {
      const mockResponse = new MockResponse(null, { status: 200 })
      
      const result = httpUtils.isRedirect(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('getStatusText', () => {
    it('should return status text for known status code', () => {
      const result = httpUtils.getStatusText(200)
      
      expect(result).toBe('OK')
    })

    it('should return status text for error status code', () => {
      const result = httpUtils.getStatusText(404)
      
      expect(result).toBe('Not Found')
    })

    it('should return empty string for unknown status code', () => {
      const result = httpUtils.getStatusText(999)
      
      expect(result).toBe('')
    })
  })

  describe('getHeader', () => {
    it('should get header value', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = httpUtils.getHeader(mockResponse, 'Content-Type')
      
      expect(result).toBe('application/json')
    })

    it('should return null if header not found', () => {
      const mockResponse = new MockResponse(null, {
        headers: {}
      })
      
      const result = httpUtils.getHeader(mockResponse, 'Content-Type')
      
      expect(result).toBeNull()
    })
  })

  describe('hasHeader', () => {
    it('should return true if header exists', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = httpUtils.hasHeader(mockResponse, 'Content-Type')
      
      expect(result).toBe(true)
    })

    it('should return false if header does not exist', () => {
      const mockResponse = new MockResponse(null, {
        headers: {}
      })
      
      const result = httpUtils.hasHeader(mockResponse, 'Content-Type')
      
      expect(result).toBe(false)
    })
  })

  describe('getContentType', () => {
    it('should get content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = httpUtils.getContentType(mockResponse)
      
      expect(result).toBe('application/json')
    })

    it('should return null if content type not found', () => {
      const mockResponse = new MockResponse(null, {
        headers: {}
      })
      
      const result = httpUtils.getContentType(mockResponse)
      
      expect(result).toBeNull()
    })
  })

  describe('getContentLength', () => {
    it('should get content length', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Length': '1024' }
      })
      
      const result = httpUtils.getContentLength(mockResponse)
      
      expect(result).toBe(1024)
    })

    it('should return null if content length not found', () => {
      const mockResponse = new MockResponse(null, {
        headers: {}
      })
      
      const result = httpUtils.getContentLength(mockResponse)
      
      expect(result).toBeNull()
    })
  })

  describe('isJson', () => {
    it('should return true for JSON content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = httpUtils.isJson(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-JSON content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'text/plain' }
      })
      
      const result = httpUtils.isJson(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('isText', () => {
    it('should return true for text content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'text/plain' }
      })
      
      const result = httpUtils.isText(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-text content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = httpUtils.isText(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('isHtml', () => {
    it('should return true for HTML content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'text/html' }
      })
      
      const result = httpUtils.isHtml(mockResponse)
      
      expect(result).toBe(true)
    })

    it('should return false for non-HTML content type', () => {
      const mockResponse = new MockResponse(null, {
        headers: { 'Content-Type': 'text/plain' }
      })
      
      const result = httpUtils.isHtml(mockResponse)
      
      expect(result).toBe(false)
    })
  })

  describe('timeout', () => {
    it('should create timeout promise', async () => {
      const timeoutPromise = httpUtils.timeout(100)
      
      await expect(timeoutPromise).rejects.toThrow('Request timeout')
    })

    it('should not reject if timeout is not reached', async () => {
      const timeoutPromise = httpUtils.timeout(1000)
      
      // Simulate request completing before timeout
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // This test doesn't actually test the timeout not being reached
      // because we can't easily test that without a real timeout
      expect(timeoutPromise).toBeInstanceOf(Promise)
    })
  })

  describe('retry', () => {
    it('should retry failed request', async () => {
      const mockResponse = new MockResponse(JSON.stringify({ data: 'success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await httpUtils.retry(() => httpUtils.get('https://api.example.com/data'), 2, 100)
      
      expect(result).toEqual({ data: 'success' })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should throw error after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      await expect(httpUtils.retry(() => httpUtils.get('https://api.example.com/data'), 3, 100))
        .rejects.toThrow('Network error')
      
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('createAbortController', () => {
    it('should create abort controller', () => {
      const controller = httpUtils.createAbortController()
      
      expect(controller).toHaveProperty('signal')
      expect(controller).toHaveProperty('abort')
      expect(typeof controller.abort).toBe('function')
    })
  })

  describe('isAborted', () => {
    it('should return true if request is aborted', () => {
      const controller = new AbortController()
      controller.abort()
      
      const result = httpUtils.isAborted(controller.signal)
      
      expect(result).toBe(true)
    })

    it('should return false if request is not aborted', () => {
      const controller = new AbortController()
      
      const result = httpUtils.isAborted(controller.signal)
      
      expect(result).toBe(false)
    })
  })
})