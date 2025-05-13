// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const logger = require('./utils/logger');
const cleanupService = require('./utils/cleanupService');
const apiRoutes = require('./routes/api');
const videoRoutes = require('./routes/videoRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const transcriptionService = require('./services/transcriptionService');

// 创建Express应用
const app = express();

// 创建必要的目录
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}

if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

// 配置中间件
app.use(helmet()); // 安全头部
app.use(morgan('combined')); // 日志
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 配置CORS
app.use(cors({
  origin: function(origin, callback) {
    // 允许无来源请求(如移动应用)
    if (!origin) return callback(null, true);
    
    // 检查来源是否在允许列表中
    if (config.allowedOrigins.indexOf(origin) === -1) {
      const msg = '此源站不允许访问API';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// 使用API路由
app.use('/api', apiRoutes);
app.use('/api/video-info', videoRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/transcribe', transcriptionRoutes);

// 前端静态文件服务
if (fs.existsSync(path.join(__dirname, '../public'))) {
  app.use(express.static(path.join(__dirname, '../public')));
  
  // 如果请求的不是API路由，则返回前端应用
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
  
  logger.info('已配置静态文件服务');
}

// 健康检查
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(`服务器错误: ${err.message}`);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 检查Replicate API配置
if (!process.env.REPLICATE_API_TOKEN) {
  logger.warn('警告: 未设置REPLICATE_API_TOKEN环境变量，转录功能将无法正常工作');
}

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`服务器启动在端口 ${PORT}`);
  
  // 启动清理服务
  cleanupService.start();
  
  // 启动定期清理过期转录任务 (每12小时运行一次)
  setInterval(() => {
    const deletedCount = transcriptionService.cleanupOldTasks(24);
    if (deletedCount > 0) {
      logger.info(`定期清理已删除 ${deletedCount} 个过期转录任务`);
    }
  }, 12 * 60 * 60 * 1000);
  
  logger.info('YouTube视频下载和转录服务已就绪');
});

// 优雅关闭
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  logger.info('收到关闭信号，正在关闭服务器...');
  
  // 停止清理服务
  cleanupService.stop();
  
  // 执行最终清理
  cleanupService.cleanup();
  
  logger.info('服务器已安全关闭');
  process.exit(0);
} 