/**
 * 个人收款码支付路由
 * 适用于初期无营业执照场景
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
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.id, 'payments');
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('请上传图片格式（JPG/PNG）'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/**
 * POST /api/v1/payment/qr/submit
 * 提交个人收款码支付凭证
 */
router.post('/submit', authMiddleware, upload.single('screenshot'), async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    
    if (!orderId || !paymentMethod || !amount) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    logger.info('收到个人收款码支付提交', {
      userId: req.user.id,
      orderId,
      paymentMethod,
      amount
    });

    // TODO: 保存到数据库
    // await PaymentModel.create({
    //   orderId,
    //   userId: req.user.id,
    //   paymentMethod,
    //   amount,
    //   screenshot: req.file?.filename,
    //   status: 'pending_verify'
    // });

    logger.info('支付凭证已保存，等待审核', { orderId });

    res.json({
      success: true,
      message: '支付凭证已提交，将在 24 小时内审核',
      data: {
        orderId,
        status: 'pending_verify'
      }
    });
  } catch (error) {
    logger.error('提交支付凭证失败', error);
    res.status(500).json({ error: '提交失败', message: error.message });
  }
});

/**
 * GET /api/v1/payment/qr/status
 * 查询支付审核状态
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: '请提供订单 ID' });
    }

    // TODO: 从数据库查询
    // const payment = await PaymentModel.findOne({ orderId, userId: req.user.id });

    // 模拟查询结果
    const mockPayment = {
      orderId,
      status: 'pending_verify', // pending_verify, approved, rejected
      submittedAt: new Date().toISOString(),
      message: '正在审核中，请耐心等待'
    };

    res.json({
      success: true,
      data: mockPayment
    });
  } catch (error) {
    logger.error('查询支付状态失败', error);
    res.status(500).json({ error: '查询失败', message: error.message });
  }
});

/**
 * GET /api/v1/payment/qr/codes
 * 获取收款码（管理员）
 */
router.get('/codes', async (req, res) => {
  try {
    // TODO: 从配置读取
    const codes = {
      wechat: '/static/pay/wechat-qr.jpg',
      alipay: '/static/pay/alipay-qr.jpg'
    };

    res.json({
      success: true,
      data: codes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
