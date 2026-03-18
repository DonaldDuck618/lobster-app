/**
 * OCR 图片识别路由
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const OCRService = require('../services/ocr');
const logger = require('../utils/logger');

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.userId);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (JPG, PNG, GIF, BMP)'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 所有接口需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/ocr/text
 * 通用文字识别
 */
router.post('/text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const userId = req.user.userId;
    const filePath = req.file.path;

    logger.info('OCR 文字识别请求', {
      userId,
      fileName: req.file.originalname,
      size: req.file.size
    });

    // 执行 OCR 识别
    const result = await OCRService.recognizeText(filePath);

    res.json({
      success: true,
      data: {
        fileId: req.file.filename,
        fileName: req.file.originalname,
        recognizedText: result.text,
        confidence: result.confidence,
        wordCount: result.words ? result.words.length : 0,
        lineCount: result.lines ? result.lines.length : 0,
        words: result.words,
        lines: result.lines
      }
    });

  } catch (error) {
    logger.error('OCR 文字识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || 'OCR 识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/table
 * 表格识别
 */
router.post('/table', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const result = await OCRService.recognizeTable(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('表格识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '表格识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/business-card
 * 名片识别
 */
router.post('/business-card', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const result = await OCRService.recognizeBusinessCard(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('名片识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '名片识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/id-card
 * 身份证识别
 */
router.post('/id-card', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const side = req.body.side || 'front';
    const result = await OCRService.recognizeIDCard(req.file.path, side);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('身份证识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '身份证识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/bank-card
 * 银行卡识别
 */
router.post('/bank-card', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const result = await OCRService.recognizeBankCard(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('银行卡识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '银行卡识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/invoice
 * 发票识别
 */
router.post('/invoice', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const result = await OCRService.recognizeInvoice(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('发票识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '发票识别失败'
    });
  }
});

/**
 * POST /api/v1/ocr/vehicle-license
 * 行驶证识别
 */
router.post('/vehicle-license', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传图片文件'
      });
    }

    const result = await OCRService.recognizeVehicleLicense(req.file.path);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('行驶证识别失败', error);
    res.status(error.status || 500).json({
      error: error.message || '行驶证识别失败'
    });
  }
});

module.exports = router;
