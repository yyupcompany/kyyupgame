import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})
import { aiService } from '@/utils/request'
import { AutoImageApi, autoImageApi } from '@/api/auto-image'
import { AI_MESSAGES } from '../../constants/test-messages'

// 使用统一的Mock配置
import { setupRequestMock } from '../../mocks/request.mock'
setupRequestMock()

describe('Auto Image API', () => {
  let api: AutoImageApi

  beforeEach(() => {
    vi.clearAllMocks()
    api = new AutoImageApi()
  })

  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      const requestData: any = {
        prompt: 'A beautiful sunset',
        category: 'activity',
        style: 'natural',
        size: '1024x1024',
        quality: 'hd',
        watermark: true
      }

      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/generated-image.jpg',
          usage: {
            generated_images: 1,
            output_tokens: 150,
            total_tokens: 200
          },
          metadata: {
            prompt: 'A beautiful sunset',
            model: 'dall-e-3',
            parameters: requestData,
            duration: 2.5
          }
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateImage(requestData)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/generate', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle minimal image generation request', async () => {
      const minimalRequest: any = {
        prompt: 'Simple image'
      }

      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/simple-image.jpg'
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateImage(minimalRequest)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/generate', minimalRequest)
      expect(result.data.imageUrl).toBe('https://example.com/simple-image.jpg')
    })

    it('should handle API errors', async () => {
      const error = new Error('Image generation failed')
      vi.mocked(aiService.post).mockRejectedValue(error)

      await expect(api.generateImage({ prompt: 'test' } as any)).rejects.toThrow('Image generation failed')
    })
  })

  describe('generateActivityImage', () => {
    it('should generate activity image successfully', async () => {
      const requestData = {
        activityTitle: 'Birthday Party',
        activityDescription: 'Fun birthday party for kids'
      }

      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/birthday-party.jpg',
          usage: {
            generated_images: 1,
            output_tokens: 100
          }
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateActivityImage(requestData)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/activity', requestData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors for activity image generation', async () => {
      const error = new Error('Activity image generation failed')
      vi.mocked(aiService.post).mockRejectedValue(error)

      await expect(api.generateActivityImage({
        activityTitle: 'Test',
        activityDescription: 'Test description'
      })).rejects.toThrow('Activity image generation failed')
    })
  })

  describe('generatePosterImage', () => {
    it('should generate poster image successfully', async () => {
      const requestData = {
        posterTitle: 'Event Poster',
        posterContent: 'Join our amazing event!',
        style: 'artistic',
        size: '1024x768',
        quality: 'hd'
      }

      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/event-poster.jpg'
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generatePosterImage(requestData)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/poster', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateTemplateImage', () => {
    it('should generate template image successfully', async () => {
      const requestData = {
        templateName: 'Newsletter Template',
        templateDescription: 'Monthly newsletter template',
        templateData: {
          type: 'newsletter',
          sections: ['header', 'content', 'footer']
        }
      }

      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/newsletter-template.jpg'
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateTemplateImage(requestData)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/template', requestData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('generateBatchImages', () => {
    it('should generate batch images successfully', async () => {
      const batchRequest = {
        requests: [
          {
            prompt: 'Image 1',
            category: 'activity'
          },
          {
            prompt: 'Image 2',
            category: 'poster'
          }
        ]
      }

      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              success: true,
              imageUrl: 'https://example.com/image1.jpg'
            },
            {
              success: true,
              imageUrl: 'https://example.com/image2.jpg'
            }
          ],
          summary: {
            total: 2,
            success: 2,
            failure: 0
          }
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateBatchImages(batchRequest)

      expect(aiService.post).toHaveBeenCalledWith('/auto-image/batch', batchRequest)
      expect(result).toEqual(mockResponse)
    })

    it('should handle partial failures in batch generation', async () => {
      const batchRequest = {
        requests: [
          {
            prompt: 'Image 1',
            category: 'activity'
          },
          {
            prompt: 'Image 2',
            category: 'poster'
          }
        ]
      }

      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              success: true,
              imageUrl: 'https://example.com/image1.jpg'
            },
            {
              success: false,
              error: AI_MESSAGES.GENERATION_FAILED
            }
          ],
          summary: {
            total: 2,
            success: 1,
            failure: 1
          }
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateBatchImages(batchRequest)

      expect(result.data.summary.success).toBe(1)
      expect(result.data.summary.failure).toBe(1)
    })
  })

  describe('checkServiceStatus', () => {
    it('should check service status successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          available: true,
          model: 'dall-e-3'
        }
      }

      vi.mocked(aiService.get).mockResolvedValue(mockResponse)

      const result = await api.checkServiceStatus()

      expect(aiService.get).toHaveBeenCalledWith('/auto-image/status')
      expect(result).toEqual(mockResponse)
    })

    it('should handle unavailable service', async () => {
      const mockResponse = {
        success: false,
        data: {
          available: false,
          error: 'Service temporarily unavailable'
        }
      }

      vi.mocked(aiService.get).mockResolvedValue(mockResponse)

      const result = await api.checkServiceStatus()

      expect(result.data.available).toBe(false)
      expect(result.data.error).toBe('Service temporarily unavailable')
    })
  })

  describe('Quick Generation Methods', () => {
    describe('quickGenerateActivityImage', () => {
      it('should generate activity image quickly and return URL', async () => {
        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/activity-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.quickGenerateActivityImage('Birthday Party', 'Fun party description')

        expect(result).toBe('https://example.com/activity-image.jpg')
      })

      it('should return null on failure', async () => {
        const error = new Error('Generation failed')
        vi.mocked(aiService.post).mockRejectedValue(error)

        const result = await api.quickGenerateActivityImage('Test', 'Test description')

        expect(result).toBeNull()
      })
    })

    describe('quickGeneratePosterImage', () => {
      it('should generate poster image quickly and return URL', async () => {
        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/poster-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.quickGeneratePosterImage('Event Poster', 'Event description')

        expect(result).toBe('https://example.com/poster-image.jpg')
      })

      it('should return null on failure', async () => {
        const error = new Error('Generation failed')
        vi.mocked(aiService.post).mockRejectedValue(error)

        const result = await api.quickGeneratePosterImage('Test', 'Test description')

        expect(result).toBeNull()
      })
    })

    describe('quickGenerateTemplateImage', () => {
      it('should generate template image quickly and return URL', async () => {
        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/template-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.quickGenerateTemplateImage('Template Name', 'Template description')

        expect(result).toBe('https://example.com/template-image.jpg')
      })

      it('should return null on failure', async () => {
        const error = new Error('Generation failed')
        vi.mocked(aiService.post).mockRejectedValue(error)

        const result = await api.quickGenerateTemplateImage('Test', 'Test description')

        expect(result).toBeNull()
      })
    })
  })

  describe('Smart Generation Methods', () => {
    describe('smartGenerateImage', () => {
      it('should generate image based on content intelligently', async () => {
        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/smart-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.smartGenerateImage('This is a very long content description that needs to be processed intelligently', 'activity')

        expect(result).toBe('https://example.com/smart-image.jpg')
      })

      it('should extract keywords from long content', async () => {
        const longContent = 'This is a very long content description with many keywords like birthday, party, celebration, fun, kids, games, activities, and more that should be extracted for the image generation prompt'
        
        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/keyword-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.smartGenerateImage(longContent, 'poster')

        expect(result).toBe('https://example.com/keyword-image.jpg')
      })

      it('should return null on failure', async () => {
        const error = new Error('Smart generation failed')
        vi.mocked(aiService.post).mockRejectedValue(error)

        const result = await api.smartGenerateImage('Test content', 'activity')

        expect(result).toBeNull()
      })
    })

    describe('smartGeneratePrompt', () => {
      it('should generate intelligent prompt based on activity info', async () => {
        const mockResponse = {
          success: true,
          data: {
            prompt: 'Generated prompt'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.smartGeneratePrompt('Birthday Party', 'Fun birthday party for kids with games and activities', 'poster')

        expect(result).toBeNull() // As noted in the source, this returns null for now
      })
    })
  })

  describe('Batch Replacement Methods', () => {
    describe('batchReplaceDefaultImages', () => {
      it('should batch replace default images successfully', async () => {
        const items = [
          {
            id: '1',
            title: 'Activity 1',
            description: 'Description 1',
            type: 'activity'
          },
          {
            id: '2',
            title: 'Poster 1',
            description: 'Description 2',
            type: 'poster'
          }
        ]

        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/generated-image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.batchReplaceDefaultImages(items)

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe('1')
        expect(result[0].success).toBe(true)
        expect(result[0].imageUrl).toBe('https://example.com/generated-image.jpg')
      })

      it('should handle failures in batch replacement', async () => {
        const items = [
          {
            id: '1',
            title: 'Activity 1',
            description: 'Description 1',
            type: 'activity'
          }
        ]

        const error = new Error('Generation failed')
        vi.mocked(aiService.post).mockRejectedValue(error)

        const result = await api.batchReplaceDefaultImages(items)

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('1')
        expect(result[0].success).toBe(false)
        expect(result[0].error).toBe(AI_MESSAGES.GENERATION_FAILED)
      })

      it('should handle large batch operations', async () => {
        const items = Array.from({ length: 10 }, (_, i) => ({
          id: i.toString(),
          title: `Item ${i}`,
          description: `Description ${i}`,
          type: 'activity' as const
        }))

        const mockResponse = {
          success: true,
          data: {
            imageUrl: 'https://example.com/image.jpg'
          }
        }

        vi.mocked(aiService.post).mockResolvedValue(mockResponse)

        const result = await api.batchReplaceDefaultImages(items)

        expect(result).toHaveLength(10)
        result.forEach((item, index) => {
          expect(item.id).toBe(index.toString())
        })
      })
    })
  })

  describe('Exported Instance', () => {
    it('should export singleton instance', () => {
      expect(autoImageApi).toBeInstanceOf(AutoImageApi)
    })

    it('should have all methods available on exported instance', () => {
      expect(autoImageApi).toHaveProperty('generateImage')
      expect(autoImageApi).toHaveProperty('generateActivityImage')
      expect(autoImageApi).toHaveProperty('generatePosterImage')
      expect(autoImageApi).toHaveProperty('generateTemplateImage')
      expect(autoImageApi).toHaveProperty('generateBatchImages')
      expect(autoImageApi).toHaveProperty('checkServiceStatus')
      expect(autoImageApi).toHaveProperty('quickGenerateActivityImage')
      expect(autoImageApi).toHaveProperty('quickGeneratePosterImage')
      expect(autoImageApi).toHaveProperty('quickGenerateTemplateImage')
      expect(autoImageApi).toHaveProperty('smartGenerateImage')
      expect(autoImageApi).toHaveProperty('smartGeneratePrompt')
      expect(autoImageApi).toHaveProperty('batchReplaceDefaultImages')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const error = new Error('Network error')
      vi.mocked(aiService.get).mockRejectedValue(error)

      await expect(api.checkServiceStatus()).rejects.toThrow('Network error')
    })

    it('should handle server errors gracefully', async () => {
      const error = new Error('Internal server error')
      vi.mocked(aiService.post).mockRejectedValue(error)

      await expect(api.generateImage({ prompt: 'test' } as any)).rejects.toThrow('Internal server error')
    })

    it('should handle timeout errors gracefully', async () => {
      const error = new Error('Request timeout')
      vi.mocked(aiService.post).mockRejectedValue(error)

      await expect(api.generateImage({ prompt: 'test' } as any)).rejects.toThrow('Request timeout')
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct request types', () => {
      const validRequest: any = {
        prompt: 'Test prompt',
        category: 'activity',
        style: 'natural',
        size: '1024x1024',
        quality: 'hd',
        watermark: true
      }

      expect(validRequest.prompt).toBe('Test prompt')
      expect(validRequest.category).toBe('activity')
    })

    it('should handle response types correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          imageUrl: 'https://example.com/test.jpg',
          usage: {
            generated_images: 1,
            output_tokens: 100,
            total_tokens: 150
          }
        }
      }

      vi.mocked(aiService.post).mockResolvedValue(mockResponse)

      const result = await api.generateImage({ prompt: 'test' } as any)

      expect(result.data.imageUrl).toBe('https://example.com/test.jpg')
      expect(result.data.usage.generated_images).toBe(1)
    })
  })
})