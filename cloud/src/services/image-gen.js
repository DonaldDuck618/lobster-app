/**
 * 图像生成服务
 * 支持阿里云百炼文生图、图生图
 */

const axios = require('axios');
const logger = require('../utils/logger');

// 阿里云百炼配置
const BAILIAN_CONFIG = {
  apiKey: process.env.BAILIAN_API_KEY || 'sk-cea10340d64a459fb785294982232ea7',
  baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
  
  // 文生图模型
  textToImage: {
    model: 'wanx-v1',  // 通义万相
    style: '<photographic>',  // 摄影写实
    size: '1024*1024'
  },
  
  // 图生图模型
  imageToImage: {
    model: 'wanx-v1',
    strength: 0.5  // 重绘强度 0-1
  }
};

class ImageGenService {
  /**
   * 文生图（Text to Image）
   */
  static async textToImage(prompt, options = {}) {
    const startTime = Date.now();
    
    logger.info('开始文生图', { prompt: prompt.slice(0, 50) });

    try {
      const response = await axios.post(
        `${BAILIAN_CONFIG.baseUrl}/services/aigc/text-generation/generation`,
        {
          model: BAILIAN_CONFIG.textToImage.model,
          input: {
            prompt: this.buildImagePrompt(prompt, options)
          },
          parameters: {
            style: options.style || BAILIAN_CONFIG.textToImage.style,
            size: options.size || BAILIAN_CONFIG.textToImage.size,
            n: options.count || 1,
            seed: options.seed || Math.floor(Math.random() * 1000000)
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      logger.info('文生图成功', {
        duration: `${duration}ms`,
        images: result.output?.results?.length || 0
      });

      return {
        success: true,
        images: result.output?.results?.map(r => r.url) || [],
        prompt: prompt,
        duration,
        model: BAILIAN_CONFIG.textToImage.model
      };
    } catch (error) {
      logger.error('文生图失败', error.response?.data || error.message);
      
      // 返回模拟结果（开发模式）
      return {
        success: false,
        error: '图像生成失败，请稍后重试',
        mockImages: [
          'https://via.placeholder.com/1024x1024.png?text=AI+Generated+Image+1',
          'https://via.placeholder.com/1024x1024.png?text=AI+Generated+Image+2'
        ]
      };
    }
  }

  /**
   * 图生图（Image to Image）
   */
  static async imageToImage(imageUrl, prompt, options = {}) {
    const startTime = Date.now();
    
    logger.info('开始图生图', { imageUrl, prompt: prompt.slice(0, 50) });

    try {
      const response = await axios.post(
        `${BAILIAN_CONFIG.baseUrl}/services/aigc/image-generation/generation`,
        {
          model: BAILIAN_CONFIG.imageToImage.model,
          input: {
            init_image: imageUrl,
            prompt: this.buildImagePrompt(prompt, options)
          },
          parameters: {
            strength: options.strength || BAILIAN_CONFIG.imageToImage.strength,
            style: options.style || '<photographic>',
            size: options.size || '1024*1024',
            seed: options.seed || Math.floor(Math.random() * 1000000)
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      logger.info('图生图成功', {
        duration: `${duration}ms`,
        images: result.output?.results?.length || 0
      });

      return {
        success: true,
        images: result.output?.results?.map(r => r.url) || [],
        prompt: prompt,
        duration,
        model: BAILIAN_CONFIG.imageToImage.model
      };
    } catch (error) {
      logger.error('图生图失败', error.response?.data || error.message);
      
      return {
        success: false,
        error: '图像生成失败，请稍后重试'
      };
    }
  }

  /**
   * 构建图像生成 Prompt
   */
  static buildImagePrompt(prompt, options = {}) {
    const stylePrompts = {
      'photographic': 'photorealistic, highly detailed, professional photography, 8k uhd',
      'digital-art': 'digital art, concept art, highly detailed, vibrant colors',
      'anime': 'anime style, manga style, highly detailed, vibrant',
      'oil-painting': 'oil painting, classical art, highly detailed, textured',
      'watercolor': 'watercolor painting, soft colors, artistic',
      'sketch': 'pencil sketch, black and white, detailed lines',
      '3d-render': '3d render, cgi, highly detailed, realistic lighting',
      'fantasy': 'fantasy art, magical, ethereal, highly detailed',
      'sci-fi': 'science fiction, futuristic, high tech, detailed',
      'portrait': 'portrait photography, professional lighting, detailed face'
    };

    const selectedStyle = stylePrompts[options.style] || stylePrompts.photographic;
    
    // 优化 prompt
    const enhancedPrompt = `${prompt}, ${selectedStyle}, masterpiece, best quality, ultra detailed`;
    
    // 添加负面 prompt
    const negativePrompt = options.negative || 'low quality, worst quality, blurry, distorted, deformed, ugly, bad anatomy, extra limbs, missing limbs, mutated, poorly drawn';
    
    return {
      positive: enhancedPrompt,
      negative: negativePrompt
    };
  }

  /**
   * 获取支持的样式列表
   */
  static getSupportedStyles() {
    return [
      { key: 'photographic', name: '摄影写实', desc: '照片级真实' },
      { key: 'digital-art', name: '数字艺术', desc: '概念艺术' },
      { key: 'anime', name: '动漫风格', desc: '日式动漫' },
      { key: 'oil-painting', name: '油画风格', desc: '古典油画' },
      { key: 'watercolor', name: '水彩画', desc: '水彩风格' },
      { key: 'sketch', name: '素描', desc: '铅笔素描' },
      { key: '3d-render', name: '3D 渲染', desc: '3D 渲染图' },
      { key: 'fantasy', name: '奇幻风格', desc: '魔幻风格' },
      { key: 'sci-fi', name: '科幻风格', desc: '未来科技' },
      { key: 'portrait', name: '人像摄影', desc: '专业人像' }
    ];
  }

  /**
   * 获取支持的尺寸
   */
  static getSupportedSizes() {
    return [
      { key: '512*512', name: '512x512', desc: '小图' },
      { key: '768*768', name: '768x768', desc: '中图' },
      { key: '1024*1024', name: '1024x1024', desc: '大图' },
      { key: '1024*768', name: '1024x768', desc: '横向' },
      { key: '768*1024', name: '768x1024', desc: '纵向' }
    ];
  }
}

module.exports = ImageGenService;
