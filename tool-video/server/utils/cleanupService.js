const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

/**
 * 清理服务类
 * 负责定期清理临时文件夹中的过期文件
 */
class CleanupService {
  constructor() {
    this.interval = null;
    this.tempDir = config.tempDir;
    this.expiryTime = config.fileExpiryTime;
  }
  
  /**
   * 启动清理服务
   */
  start() {
    logger.info('启动文件清理服务');
    
    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    // 立即执行一次清理
    this.cleanup();
    
    // 设置定期清理
    this.interval = setInterval(() => {
      this.cleanup();
    }, config.cleanupInterval);
  }
  
  /**
   * 停止清理服务
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('停止文件清理服务');
    }
  }
  
  /**
   * 清理过期文件
   */
  cleanup() {
    try {
      logger.info('开始清理过期文件');
      
      const now = Date.now();
      const files = fs.readdirSync(this.tempDir);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        
        // 获取文件信息
        const stats = fs.statSync(filePath);
        
        // 检查文件是否过期
        const fileAgeMs = now - stats.mtimeMs;
        if (fileAgeMs > this.expiryTime) {
          // 删除过期文件
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.debug(`删除过期文件: ${file}, 年龄: ${Math.round(fileAgeMs / 1000 / 60)} 分钟`);
        }
      }
      
      logger.info(`清理完成，共删除 ${deletedCount} 个过期文件`);
    } catch (error) {
      logger.error(`清理过期文件时出错: ${error.message}`);
    }
  }
}

// 导出单例
module.exports = new CleanupService(); 