import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as fileUtils from '../../../src/utils/file-utils'

// Mock File API
const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
const mockBlob = new Blob(['test content'], { type: 'text/plain' })

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

// Mock FileReader
class MockFileReader {
  static readonly EMPTY = 0
  static readonly LOADING = 1
  static readonly DONE = 2

  readyState = 0
  result: string | ArrayBuffer | null = null
  error: DOMException | null = null
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null

  readAsDataURL(blob: Blob): void {
    this.readyState = MockFileReader.LOADING
    setTimeout(() => {
      this.readyState = MockFileReader.DONE
      this.result = 'data:text/plain;base64,dGVzdCBjb250ZW50'
      if (this.onloadend) {
        this.onloadend(new ProgressEvent('loadend'))
      }
      if (this.onload) {
        this.onload(new ProgressEvent('load'))
      }
    }, 10)
  }

  readAsText(blob: Blob): void {
    this.readyState = MockFileReader.LOADING
    setTimeout(() => {
      this.readyState = MockFileReader.DONE
      this.result = 'test content'
      if (this.onloadend) {
        this.onloadend(new ProgressEvent('loadend'))
      }
      if (this.onload) {
        this.onload(new ProgressEvent('load'))
      }
    }, 10)
  }

  readAsArrayBuffer(blob: Blob): void {
    this.readyState = MockFileReader.LOADING
    setTimeout(() => {
      this.readyState = MockFileReader.DONE
      this.result = new TextEncoder().encode('test content').buffer
      if (this.onloadend) {
        this.onloadend(new ProgressEvent('loadend'))
      }
      if (this.onload) {
        this.onload(new ProgressEvent('load'))
      }
    }, 10)
  }

  abort(): void {
    this.readyState = MockFileReader.DONE
    if (this.onloadend) {
      this.onloadend(new ProgressEvent('abort'))
    }
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('File Utils', () => {
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
    vi.stubGlobal('File', File)
    vi.stubGlobal('Blob', Blob)
    vi.stubGlobal('FileReader', MockFileReader)
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockCreateObjectURL.mockReturnValue('blob:test-url')
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('getFileSize', () => {
    it('should return file size in bytes', () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileSize(file)).toBe(12)
    })

    it('should return 0 for empty file', () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' })
      expect(fileUtils.getFileSize(file)).toBe(0)
    })

    it('should handle large files correctly', () => {
      const largeContent = 'x'.repeat(1024 * 1024) // 1MB
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' })
      expect(fileUtils.getFileSize(file)).toBe(1024 * 1024)
    })
  })

  describe('getFileType', () => {
    it('should return file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileType(file)).toBe('text/plain')
    })

    it('should return empty string for unknown type', () => {
      const file = new File(['test'], 'test.unknown', { type: '' })
      expect(fileUtils.getFileType(file)).toBe('')
    })

    it('should handle application/octet-stream type', () => {
      const file = new File(['test'], 'test.bin', { type: 'application/octet-stream' })
      expect(fileUtils.getFileType(file)).toBe('application/octet-stream')
    })
  })

  describe('getFileName', () => {
    it('should return file name', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileName(file)).toBe('test.txt')
    })

    it('should handle file name with path', () => {
      const file = new File(['test'], 'path/to/test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileName(file)).toBe('path/to/test.txt')
    })

    it('should handle empty file name', () => {
      const file = new File(['test'], '', { type: 'text/plain' })
      expect(fileUtils.getFileName(file)).toBe('')
    })
  })

  describe('getFileExtension', () => {
    it('should return file extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileExtension(file)).toBe('txt')
    })

    it('should return empty string for file without extension', () => {
      const file = new File(['test'], 'test', { type: 'text/plain' })
      expect(fileUtils.getFileExtension(file)).toBe('')
    })

    it('should handle multiple dots in filename', () => {
      const file = new File(['test'], 'test.v2.txt', { type: 'text/plain' })
      expect(fileUtils.getFileExtension(file)).toBe('txt')
    })

    it('should handle file starting with dot', () => {
      const file = new File(['test'], '.gitignore', { type: 'text/plain' })
      expect(fileUtils.getFileExtension(file)).toBe('gitignore')
    })
  })

  describe('isImageFile', () => {
    it('should return true for image files', () => {
      const imageFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      expect(fileUtils.isImageFile(imageFile)).toBe(true)
    })

    it('should return false for non-image files', () => {
      const textFile = new File(['test'], 'text.txt', { type: 'text/plain' })
      expect(fileUtils.isImageFile(textFile)).toBe(false)
    })

    it('should handle various image formats', () => {
      const formats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      formats.forEach(format => {
        const file = new File(['test'], `image.${format.split('/')[1]}`, { type: format })
        expect(fileUtils.isImageFile(file)).toBe(true)
      })
    })
  })

  describe('isVideoFile', () => {
    it('should return true for video files', () => {
      const videoFile = new File(['test'], 'video.mp4', { type: 'video/mp4' })
      expect(fileUtils.isVideoFile(videoFile)).toBe(true)
    })

    it('should return false for non-video files', () => {
      const textFile = new File(['test'], 'text.txt', { type: 'text/plain' })
      expect(fileUtils.isVideoFile(textFile)).toBe(false)
    })

    it('should handle various video formats', () => {
      const formats = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/ogg']
      formats.forEach(format => {
        const file = new File(['test'], `video.${format.split('/')[1]}`, { type: format })
        expect(fileUtils.isVideoFile(file)).toBe(true)
      })
    })
  })

  describe('isAudioFile', () => {
    it('should return true for audio files', () => {
      const audioFile = new File(['test'], 'audio.mp3', { type: 'audio/mpeg' })
      expect(fileUtils.isAudioFile(audioFile)).toBe(true)
    })

    it('should return false for non-audio files', () => {
      const textFile = new File(['test'], 'text.txt', { type: 'text/plain' })
      expect(fileUtils.isAudioFile(textFile)).toBe(false)
    })

    it('should handle various audio formats', () => {
      const formats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
      formats.forEach(format => {
        const file = new File(['test'], `audio.${format.split('/')[1]}`, { type: format })
        expect(fileUtils.isAudioFile(file)).toBe(true)
      })
    })
  })

  describe('isTextFile', () => {
    it('should return true for text files', () => {
      const textFile = new File(['test'], 'text.txt', { type: 'text/plain' })
      expect(fileUtils.isTextFile(textFile)).toBe(true)
    })

    it('should return false for non-text files', () => {
      const imageFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' })
      expect(fileUtils.isTextFile(imageFile)).toBe(false)
    })

    it('should handle various text formats', () => {
      const formats = ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json']
      formats.forEach(format => {
        const file = new File(['test'], `text.${format.split('/')[1]}`, { type: format })
        expect(fileUtils.isTextFile(file)).toBe(true)
      })
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(fileUtils.formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes correctly', () => {
      expect(fileUtils.formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes correctly', () => {
      expect(fileUtils.formatFileSize(1048576)).toBe('1 MB')
    })

    it('should format gigabytes correctly', () => {
      expect(fileUtils.formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should handle zero bytes', () => {
      expect(fileUtils.formatFileSize(0)).toBe('0 B')
    })

    it('should handle decimal precision', () => {
      expect(fileUtils.formatFileSize(1500)).toBe('1.46 KB')
    })

    it('should handle very large files', () => {
      expect(fileUtils.formatFileSize(1099511627776)).toBe('1 TB')
    })
  })

  describe('readFileAsDataURL', () => {
    it('should read file as data URL', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const result = await fileUtils.readFileAsDataURL(file)
      expect(result).toBe('data:text/plain;base64,dGVzdCBjb250ZW50')
    })

    it('should handle read errors', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      // Mock FileReader to throw error
      class ErrorFileReader extends MockFileReader {
        readAsDataURL(blob: Blob): void {
          this.readyState = MockFileReader.LOADING
          setTimeout(() => {
            this.readyState = MockFileReader.DONE
            this.error = new DOMException('Read failed', 'NotReadableError')
            if (this.onerror) {
              this.onerror(new ProgressEvent('error'))
            }
          }, 10)
        }
      }
      
      vi.stubGlobal('FileReader', ErrorFileReader)
      
      await expect(fileUtils.readFileAsDataURL(file)).rejects.toThrow('Read failed')
    })
  })

  describe('readFileAsText', () => {
    it('should read file as text', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const result = await fileUtils.readFileAsText(file)
      expect(result).toBe('test content')
    })

    it('should handle read errors', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      class ErrorFileReader extends MockFileReader {
        readAsText(blob: Blob): void {
          this.readyState = MockFileReader.LOADING
          setTimeout(() => {
            this.readyState = MockFileReader.DONE
            this.error = new DOMException('Read failed', 'NotReadableError')
            if (this.onerror) {
              this.onerror(new ProgressEvent('error'))
            }
          }, 10)
        }
      }
      
      vi.stubGlobal('FileReader', ErrorFileReader)
      
      await expect(fileUtils.readFileAsText(file)).rejects.toThrow('Read failed')
    })
  })

  describe('readFileAsArrayBuffer', () => {
    it('should read file as array buffer', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const result = await fileUtils.readFileAsArrayBuffer(file)
      expect(result).toBeInstanceOf(ArrayBuffer)
    })

    it('should handle read errors', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      class ErrorFileReader extends MockFileReader {
        readAsArrayBuffer(blob: Blob): void {
          this.readyState = MockFileReader.LOADING
          setTimeout(() => {
            this.readyState = MockFileReader.DONE
            this.error = new DOMException('Read failed', 'NotReadableError')
            if (this.onerror) {
              this.onerror(new ProgressEvent('error'))
            }
          }, 10)
        }
      }
      
      vi.stubGlobal('FileReader', ErrorFileReader)
      
      await expect(fileUtils.readFileAsArrayBuffer(file)).rejects.toThrow('Read failed')
    })
  })

  describe('createObjectURL', () => {
    it('should create object URL from file', () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const url = fileUtils.createObjectURL(file)
      expect(url).toBe('blob:test-url')
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
    })

    it('should create object URL from blob', () => {
      const blob = new Blob(['test content'], { type: 'text/plain' })
      const url = fileUtils.createObjectURL(blob)
      expect(url).toBe('blob:test-url')
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
    })
  })

  describe('revokeObjectURL', () => {
    it('should revoke object URL', () => {
      const url = 'blob:test-url'
      fileUtils.revokeObjectURL(url)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url)
    })
  })

  describe('downloadFile', () => {
    it('should download file with given name', () => {
      const content = 'test content'
      const filename = 'test.txt'
      const mimeType = 'text/plain'
      
      // Mock createElement and click
      const mockClick = vi.fn()
      const mockRemove = vi.fn()
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            style: { display: '' },
            click: mockClick,
            remove: mockRemove
          } as any
        }
        return document.createElement(tagName)
      })
      
      fileUtils.downloadFile(content, filename, mimeType)
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemove).toHaveBeenCalled()
      
      createElementSpy.mockRestore()
    })

    it('should handle download without mimeType', () => {
      const content = 'test content'
      const filename = 'test.txt'
      
      const mockClick = vi.fn()
      const mockRemove = vi.fn()
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            style: { display: '' },
            click: mockClick,
            remove: mockRemove
          } as any
        }
        return document.createElement(tagName)
      })
      
      fileUtils.downloadFile(content, filename)
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemove).toHaveBeenCalled()
      
      createElementSpy.mockRestore()
    })
  })

  describe('validateFileType', () => {
    it('should return true for valid file type', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(fileUtils.validateFileType(file, allowedTypes)).toBe(true)
    })

    it('should return false for invalid file type', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const allowedTypes = ['image/jpeg', 'image/png']
      expect(fileUtils.validateFileType(file, allowedTypes)).toBe(false)
    })

    it('should handle empty allowed types', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      expect(fileUtils.validateFileType(file, [])).toBe(false)
    })

    it('should handle wildcard mime types', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const allowedTypes = ['image/*']
      expect(fileUtils.validateFileType(file, allowedTypes)).toBe(true)
    })
  })

  describe('validateFileSize', () => {
    it('should return true for file within size limit', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const maxSize = 1024 // 1KB
      expect(fileUtils.validateFileSize(file, maxSize)).toBe(true)
    })

    it('should return false for file exceeding size limit', () => {
      const largeContent = 'x'.repeat(2048) // 2KB
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' })
      const maxSize = 1024 // 1KB
      expect(fileUtils.validateFileSize(file, maxSize)).toBe(false)
    })

    it('should handle zero size limit', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.validateFileSize(file, 0)).toBe(false)
    })
  })

  describe('getFileBaseName', () => {
    it('should return base name without extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      expect(fileUtils.getFileBaseName(file)).toBe('test')
    })

    it('should handle file without extension', () => {
      const file = new File(['test'], 'test', { type: 'text/plain' })
      expect(fileUtils.getFileBaseName(file)).toBe('test')
    })

    it('should handle file with multiple dots', () => {
      const file = new File(['test'], 'test.v2.txt', { type: 'text/plain' })
      expect(fileUtils.getFileBaseName(file)).toBe('test.v2')
    })

    it('should handle file starting with dot', () => {
      const file = new File(['test'], '.gitignore', { type: 'text/plain' })
      expect(fileUtils.getFileBaseName(file)).toBe('')
    })
  })

  describe('changeFileExtension', () => {
    it('should change file extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const newFile = fileUtils.changeFileExtension(file, 'jpg')
      expect(fileUtils.getFileName(newFile)).toBe('test.jpg')
    })

    it('should handle file without extension', () => {
      const file = new File(['test'], 'test', { type: 'text/plain' })
      const newFile = fileUtils.changeFileExtension(file, 'jpg')
      expect(fileUtils.getFileName(newFile)).toBe('test.jpg')
    })

    it('should handle empty new extension', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const newFile = fileUtils.changeFileExtension(file, '')
      expect(fileUtils.getFileName(newFile)).toBe('test')
    })
  })
})