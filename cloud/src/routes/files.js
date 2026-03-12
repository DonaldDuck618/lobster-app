/**
 * 文件上传路由
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');
const config = require('../config');

// 配置 multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.id);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'application/pdf', // .pdf
    'image/jpeg', // .jpg
    'image/png', // .png
    'image/gif' // .gif
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize
  }
});

// 所有文件接口需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/files/upload
 * 上传文件
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '未选择文件'
      });
    }

    const userId = req.user.id;
    const file = req.file;

    // TODO: 保存到数据库
    // const fileRecord = await FileModel.create({
    //   userId,
    //   filename: file.filename,
    //   originalName: file.originalname,
    //   mimeType: file.mimetype,
    //   size: file.size,
    //   storagePath: file.path
    // });

    logger.info('文件上传成功', {
      userId,
      filename: file.filename,
      size: file.size
    });

    res.json({
      success: true,
      data: {
        fileId: file.filename, // 临时用文件名作为 ID
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString(),
        downloadUrl: `/api/v1/files/${file.filename}`
      }
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Bad Request',
          message: `文件过大，最大支持 ${config.upload.maxSize / 1024 / 1024}MB`
        });
      }
    }
    next(error);
  }
});

/**
 * GET /api/v1/files/:fileId
 * 获取文件信息
 */
router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // TODO: 从数据库查询文件信息
    // const file = await FileModel.findOne({ where: { id: fileId, userId } });

    // 临时实现：检查文件是否存在
    const filePath = path.join(process.cwd(), 'uploads', userId, fileId);
    
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        error: 'Not Found',
        message: '文件不存在'
      });
    }

    res.json({
      success: true,
      data: {
        fileId,
        downloadUrl: `/api/v1/files/${fileId}/download`
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/files/:fileId/download
 * 下载文件
 */
router.get('/:fileId/download', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const filePath = path.join(process.cwd(), 'uploads', userId, fileId);
    
    // 检查文件是否存在
    await fs.access(filePath);

    // 发送文件
    res.download(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        error: 'Not Found',
        message: '文件不存在'
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/v1/files/:fileId
 * 删除文件
 */
router.delete('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const filePath = path.join(process.cwd(), 'uploads', userId, fileId);
    
    // 删除文件
    await fs.unlink(filePath);

    // TODO: 从数据库删除记录
    // await FileModel.destroy({ where: { id: fileId, userId } });

    logger.info('文件删除成功', { userId, fileId });

    res.json({
      success: true,
      message: '文件已删除'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        error: 'Not Found',
        message: '文件不存在'
      });
    }
    next(error);
  }
});

/**
 * GET /api/v1/files
 * 获取文件列表
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const uploadDir = path.join(process.cwd(), 'uploads', userId);
    
    let files = [];
    try {
      const entries = await fs.readdir(uploadDir, { withFileTypes: true });
      files = entries
        .filter(f => f.isFile())
        .map(f => ({
          fileId: f.name,
          filename: f.name,
          uploadedAt: new Date().toISOString()
        }));
    } catch {
      // 目录不存在，返回空列表
    }

    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedFiles = files.slice(start, end);

    res.json({
      success: true,
      data: {
        files: paginatedFiles,
        total: files.length,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
