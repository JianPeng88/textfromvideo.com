const path = require('path');

module.exports = {
  // 服务器配置
  port: process.env.PORT || 3000,
  
  // 临时文件配置
  tempDir: path.join(__dirname, '../temp'),
  
  // 文件保存时间(毫秒)
  fileExpiryTime: 30 * 60 * 1000, // 30分钟
  
  // 清理服务配置
  cleanupInterval: 5 * 60 * 1000, // 每5分钟执行一次清理
  
  // API速率限制
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100 // 每IP最多100次请求
  },
  
  // 允许的视频格式
  allowedFormats: {
    video: ['mp4', 'webm'],
    audio: ['mp3', 'm4a']
  },
  
  // 视频清晰度选项
  videoQualities: [
    { name: '1080p', value: '1080' },
    { name: '720p', value: '720' },
    { name: '480p', value: '480' },
    { name: '360p', value: '360' },
    { name: '240p', value: '240' },
    { name: '144p', value: '144' }
  ],
  
  // 允许的来源域名(CORS)
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5500'
  ],
  
  // 转录相关配置
  transcription: {
    // 默认模型配置
    defaultModel: 'openai/whisper',
    fasterModel: 'vaibhavs10/faster-whisper',
    defaultLanguage: 'auto',
    
    // 支持的转录语言
    supportedLanguages: [
      { code: 'auto', name: '自动检测' },
      { code: 'zh', name: '中文' },
      { code: 'en', name: '英文' },
      { code: 'ja', name: '日语' },
      { code: 'ko', name: '韩语' },
      { code: 'fr', name: '法语' },
      { code: 'de', name: '德语' },
      { code: 'es', name: '西班牙语' },
      { code: 'ru', name: '俄语' },
      { code: 'pt', name: '葡萄牙语' },
      { code: 'ar', name: '阿拉伯语' }
    ],
    
    // 模型选项
    modelOptions: [
      { name: 'Large v3 (高精度)', value: 'large-v3' },
      { name: 'Medium (平衡)', value: 'medium' },
      { name: 'Small (快速)', value: 'small' },
      { name: 'Tiny (超快)', value: 'tiny' }
    ],
    
    // 最大文件大小(字节)
    maxFileSize: 100 * 1024 * 1024 // 100MB
  }
}; 