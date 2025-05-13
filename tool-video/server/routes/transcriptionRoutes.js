const express = require('express');
const router = express.Router();
const transcriptionController = require('../controllers/transcriptionController');

/**
 * 转录相关路由
 */

// 从YouTube视频URL创建转录任务
router.post('/', transcriptionController.transcribeVideo);

// 从媒体URL直接创建转录任务
router.post('/url', transcriptionController.transcribeFromUrl);

// 获取转录任务状态
router.get('/status/:id', transcriptionController.getTranscriptionStatus);

// 获取所有转录任务
router.get('/all', transcriptionController.getAllTranscriptions);

// 获取支持的语言列表
router.get('/languages', transcriptionController.getSupportedLanguages);

module.exports = router; 