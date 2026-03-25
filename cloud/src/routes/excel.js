/**
 * Excel 分析路由
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const ExcelAnalysisService = require('../services/excel-analysis');
const logger = require('../utils/logger');

// 配置文件上传 - 使用 __dirname 而不是 process.cwd()
const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userDir = path.join(uploadDir, req.user.userId);
    await fs.mkdir(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + path.basename(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 Excel 文件 (.xls, .xlsx)'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.use(authMiddleware);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: '请上传 Excel 文件' });
    }
    const userId = req.user.userId;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    logger.info('Excel 文件上传成功', { userId, fileName, size: req.file.size });
    const parsedData = await ExcelAnalysisService.parseExcel(filePath);
    let analysisResult = null;
    if (parsedData.sheets.length > 0 && parsedData.sheets[0].rows.length > 0) {
      const firstSheet = parsedData.sheets[0];
      analysisResult = await ExcelAnalysisService.analyzeData(firstSheet.rows, firstSheet.headers);
    }
    res.json({
      success: true,
      data: {
        fileId: path.basename(req.file.path),
        fileName,
        size: req.file.size,
        analysis: analysisResult
      }
    });
  } catch (error) {
    logger.error('Excel 上传失败', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

module.exports = router;
