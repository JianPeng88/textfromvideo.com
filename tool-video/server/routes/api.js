const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');
const transcriptionController = require('../controllers/transcriptionController');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// 创建API速率限制器
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '请求过多，请稍后再试'
  }
});

// 创建转录API速率限制器(更严格)
const transcriptionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 20, // 每IP最多20次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '转录请求过多，请稍后再试'
  }
});

// 应用速率限制
router.use(apiLimiter);

// 健康检查
router.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'API服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 解析视频
router.post('/parse', youtubeController.parseVideo);

// 下载视频
router.post('/download', youtubeController.downloadVideo);

// 获取下载文件
router.get('/download/:fileName', youtubeController.getDownloadFile);

// 获取支持的格式
router.get('/formats', youtubeController.getSupportedFormats);

// 转录相关路由
// 转录视频
router.post('/transcribe', transcriptionLimiter, transcriptionController.transcribeVideo);

// 从URL转录
router.post('/transcribe-url', transcriptionLimiter, transcriptionController.transcribeFromUrl);

// 获取支持的转录语言
router.get('/transcribe/languages', transcriptionController.getSupportedLanguages);

module.exports = router; 