/**
 * 定时任务路由 (临时占位)
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: '定时任务功能开发中' });
});

module.exports = router;
