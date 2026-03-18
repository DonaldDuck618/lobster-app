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
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// 所有接口需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/excel/upload
 * 上传并分析 Excel 文件
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请上传 Excel 文件'
      });
    }

    const userId = req.user.userId;
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    logger.info('Excel 文件上传成功', {
      userId,
      fileName,
      size: req.file.size
    });

    // 解析 Excel
    const parsedData = await ExcelAnalysisService.parseExcel(filePath);

    // 如果有数据，进行分析
    let analysisResult = null;
    if (parsedData.sheets.length > 0 && parsedData.sheets[0].rows.length > 0) {
      const firstSheet = parsedData.sheets[0];
      analysisResult = await ExcelAnalysisService.analyzeData(
        firstSheet.rows,
        firstSheet.headers
      );
    }

    // 生成报告
    const report = analysisResult 
      ? ExcelAnalysisService.generateReport(analysisResult, fileName)
      : null;

    res.json({
      success: true,
      data: {
        fileId: req.file.filename,
        fileName: fileName,
        fileSize: req.file.size,
        parsedData: {
          sheets: parsedData.sheets.map(s => ({
            name: s.name,
            rowCount: s.rowCount,
            columnCount: s.columnCount
          })),
          totalRows: parsedData.totalRows,
          totalColumns: parsedData.totalColumns
        },
        analysis: analysisResult,
        report: report,
        downloadUrl: `/api/v1/files/${req.file.filename}`
      }
    });

  } catch (error) {
    logger.error('Excel 文件处理失败', error);
    res.status(error.status || 500).json({
      error: error.message || 'Excel 文件处理失败'
    });
  }
});

/**
 * POST /api/v1/excel/analyze
 * 分析已上传的 Excel 文件
 */
router.post('/analyze', async (req, res) => {
  try {
    const { fileId } = req.body;
    const userId = req.user.userId;

    if (!fileId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请提供文件 ID'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', userId, fileId);
    
    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        error: 'Not Found',
        message: '文件不存在'
      });
    }

    // 解析并分析
    const parsedData = await ExcelAnalysisService.parseExcel(filePath);
    
    let analysisResult = null;
    if (parsedData.sheets.length > 0 && parsedData.sheets[0].rows.length > 0) {
      const firstSheet = parsedData.sheets[0];
      analysisResult = await ExcelAnalysisService.analyzeData(
        firstSheet.rows,
        firstSheet.headers
      );
    }

    const report = analysisResult 
      ? ExcelAnalysisService.generateReport(analysisResult, fileId)
      : null;

    res.json({
      success: true,
      data: {
        analysis: analysisResult,
        report: report
      }
    });

  } catch (error) {
    logger.error('Excel 分析失败', error);
    res.status(error.status || 500).json({
      error: error.message || 'Excel 分析失败'
    });
  }
});

module.exports = router;
