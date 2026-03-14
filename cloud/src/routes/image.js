/**
 * 图像生成路由
 * 支持文生图、图生图
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');
const ImageGenService = require('../services/image-gen');

// 配置上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.id, 'images');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).slice(-6) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的图片格式'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * POST /api/v1/image/generate
 * 文生图
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, style, size, count } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '请提供描述文字' });
    }

    logger.info('收到文生图请求', { 
      userId: req.user.id, 
      prompt: prompt.slice(0, 50),
      style,
      size 
    });

    // 调用图像生成服务
    const result = await ImageGenService.textToImage(prompt, {
      style: style || 'photographic',
      size: size || '1024*1024',
      count: count || 1
    });

    logger.info('文生图完成', { 
      userId: req.user.id,
      success: result.success,
      images: result.images?.length || 0
    });

    res.json(result);
  } catch (error) {
    logger.error('文生图失败', error);
    res.status(500).json({ error: '图像生成失败', message: error.message });
  }
});

/**
 * POST /api/v1/image/edit
 * 图生图
 */
router.post('/edit', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const { prompt, style, strength } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '请提供描述文字' });
    }

    // 上传图片到临时 URL（实际应该上传到 OSS）
    const imageUrl = `/api/v1/files/${req.file.filename}`;

    logger.info('收到图生图请求', { 
      userId: req.user.id,
      imageUrl,
      prompt: prompt.slice(0, 50)
    });

    // 调用图生图服务
    const result = await ImageGenService.imageToImage(imageUrl, prompt, {
      style: style || 'photographic',
      strength: strength || 0.5
    });

    logger.info('图生图完成', { 
      userId: req.user.id,
      success: result.success,
      images: result.images?.length || 0
    });

    res.json(result);
  } catch (error) {
    logger.error('图生图失败', error);
    res.status(500).json({ error: '图像生成失败', message: error.message });
  }
});

/**
 * GET /api/v1/image/styles
 * 获取支持的样式列表
 */
router.get('/styles', async (req, res) => {
  try {
    const styles = ImageGenService.getSupportedStyles();
    res.json({ success: true, data: styles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/image/sizes
 * 获取支持的尺寸列表
 */
router.get('/sizes', async (req, res) => {
  try {
    const sizes = ImageGenService.getSupportedSizes();
    res.json({ success: true, data: sizes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
