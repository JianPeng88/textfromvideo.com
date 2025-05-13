const videoProcessor = require('../utils/videoProcessor');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

/**
 * 解析视频信息
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function parseVideo(req, res) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供YouTube视频URL' 
      });
    }
    
    logger.info(`收到视频解析请求: ${url}`);
    
    // 获取视频信息
    const videoInfo = await videoProcessor.getVideoInfo(url);
    
    return res.status(200).json({
      success: true,
      data: videoInfo
    });
  } catch (error) {
    logger.error(`解析视频失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `解析失败: ${error.message}`
    });
  }
}

/**
 * 下载视频
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function downloadVideo(req, res) {
  try {
    const { url, format, quality } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供YouTube视频URL' 
      });
    }
    
    if (!format || !config.allowedFormats.video.includes(format) && !config.allowedFormats.audio.includes(format)) {
      return res.status(400).json({ 
        success: false, 
        message: `不支持的格式: ${format}` 
      });
    }
    
    logger.info(`收到视频下载请求: ${url}, 格式: ${format}, 质量: ${quality || '最佳'}`);
    
    // 下载视频
    const downloadInfo = await videoProcessor.downloadVideo(url, format, quality);
    
    return res.status(200).json({
      success: true,
      message: '下载成功',
      data: downloadInfo
    });
  } catch (error) {
    logger.error(`下载视频失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `下载失败: ${error.message}`
    });
  }
}

/**
 * 获取下载文件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
function getDownloadFile(req, res) {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供文件名' 
      });
    }
    
    logger.info(`获取下载文件: ${fileName}`);
    
    // 获取文件路径
    const filePath = videoProcessor.getDownloadFilePath(fileName);
    
    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        message: '文件不存在或已过期' 
      });
    }
    
    // 获取文件信息
    const stats = fs.statSync(filePath);
    
    // 设置响应头
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    
    // 发送文件
    return res.sendFile(filePath);
  } catch (error) {
    logger.error(`获取下载文件失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `获取文件失败: ${error.message}`
    });
  }
}

/**
 * 获取支持的格式
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
function getSupportedFormats(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        videoFormats: config.allowedFormats.video,
        audioFormats: config.allowedFormats.audio,
        videoQualities: config.videoQualities
      }
    });
  } catch (error) {
    logger.error(`获取支持的格式失败: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `获取格式失败: ${error.message}`
    });
  }
}

module.exports = {
  parseVideo,
  downloadVideo,
  getDownloadFile,
  getSupportedFormats
}; 