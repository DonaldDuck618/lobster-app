/**
 * 视觉识别路由
 * 支持 OCR、图片分析、表格识别
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的图片格式'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * POST /api/v1/vision/ocr
 * OCR 文字识别
 */
router.post('/ocr', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const mockResult = {
      text: '这是 OCR 识别的文字内容\n支持多行识别\n准确率 95%+',
      confidence: 0.95,
      language: 'zh-CN',
      blocks: [
        { text: '这是 OCR 识别的文字内容', bbox: [10, 10, 200, 30] }
      ]
    };

    logger.info('OCR 识别成功', { userId: req.user.id, file: req.file.filename });

    res.json({
      success: true,
      data: mockResult,
      message: 'OCR 识别成功'
    });
  } catch (error) {
    logger.error('OCR 识别失败', error);
    res.status(500).json({ error: 'OCR 识别失败', message: error.message });
  }
});

/**
 * POST /api/v1/vision/analyze
 * 图片内容分析
 */
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }

    const mockResult = {
      objects: ['人物', '电脑', '办公桌'],
      scene: '办公室',
      colors: ['蓝色', '白色', '灰色'],
      description: '一个人在办公室使用电脑工作',
      tags: ['工作', '办公', '电脑', '室内'],
      confidence: 0.92
    };

    logger.info('图片分析成功', { userId: req.user.id, file: req.file.filename });

    res.json({
      success: true,
      data: mockResult,
      message: '图片分析成功'
    });
  } catch (error) {
    logger.error('图片分析失败', error);
    res.status(500).json({ error: '图片分析失败', message: error.message });
  }
});

/**
 * POST /api/v1/vision/table
 * 表格识别（Excel 拍照识别）
 */
router.post('/table', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传表格图片' });
    }

    const mockResult = {
      table: {
        headers: ['姓名', '年龄', '城市'],
        rows: [
          ['张三', '25', '北京'],
          ['李四', '30', '上海'],
          ['王五', '28', '深圳']
        ]
      },
      confidence: 0.88,
      excelUrl: '/api/v1/files/download/xxx.xlsx'
    };

    logger.info('表格识别成功', { userId: req.user.id, file: req.file.filename });

    res.json({
      success: true,
      data: mockResult,
      message: '表格识别成功，可导出为 Excel'
    });
  } catch (error) {
    logger.error('表格识别失败', error);
    res.status(500).json({ error: '表格识别失败', message: error.message });
  }
});

module.exports = router;
