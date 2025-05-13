const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const config = require('../config/config');
const logger = require('./logger');

// 设置ffmpeg路径
ffmpeg.setFfmpegPath(ffmpegPath);

// 创建临时目录
if (!fs.existsSync(config.tempDir)) {
  fs.mkdirSync(config.tempDir, { recursive: true });
}

/**
 * 获取视频信息
 * @param {string} url YouTube视频URL
 * @returns {Promise<Object>} 视频信息
 */
async function getVideoInfo(url) {
  try {
    logger.info(`获取视频信息: ${url}`);
    
    // 验证URL
    if (!ytdl.validateURL(url)) {
      throw new Error('无效的YouTube URL');
    }
    
    // 获取视频信息
    const info = await ytdl.getInfo(url);
    
    // 提取基本信息
    const basicInfo = {
      videoId: info.videoDetails.videoId,
      title: info.videoDetails.title,
      author: {
        name: info.videoDetails.author.name,
        id: info.videoDetails.author.id,
        avatar: info.videoDetails.author.thumbnails?.[0]?.url || ''
      },
      lengthSeconds: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount,
      thumbnailUrl: info.videoDetails.thumbnails[0]?.url || '',
    };
    
    // 提取可用的视频格式
    const formats = info.formats.filter(format => {
      // 只选择有视频或音频的格式
      return (format.hasVideo || format.hasAudio) && format.url;
    }).map(format => {
      return {
        itag: format.itag,
        mimeType: format.mimeType,
        quality: format.qualityLabel || format.audioQuality || 'unknown',
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        container: format.container,
        codecs: format.codecs,
        contentLength: format.contentLength,
        bitrate: format.bitrate,
      };
    });
    
    // 组织视频和音频格式
    const videoFormats = formats.filter(format => format.hasVideo)
      .sort((a, b) => b.bitrate - a.bitrate);
    
    const audioFormats = formats.filter(format => format.hasAudio && !format.hasVideo)
      .sort((a, b) => b.bitrate - a.bitrate);
    
    return {
      ...basicInfo,
      videoFormats,
      audioFormats
    };
  } catch (error) {
    logger.error(`获取视频信息失败: ${error.message}`);
    throw error;
  }
}

/**
 * 下载视频
 * @param {string} url YouTube视频URL
 * @param {string} format 格式 (mp4, mp3等)
 * @param {number} quality 质量 (可选)
 * @returns {Promise<Object>} 下载信息
 */
async function downloadVideo(url, format, quality) {
  try {
    logger.info(`开始下载视频: ${url}, 格式: ${format}, 质量: ${quality || 'best'}`);
    
    // 生成唯一文件名
    const fileName = `${uuidv4()}.${format}`;
    const filePath = path.join(config.tempDir, fileName);
    
    // 获取视频信息
    const info = await ytdl.getInfo(url);
    
    // 保存视频元数据
    const metadata = {
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      url: url,
      format: format,
      quality: quality || 'best',
      fileSize: 0,
      filePath: filePath,
      fileName: fileName,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + config.fileExpiryTime)
    };
    
    // 根据请求格式选择下载选项
    if (format === 'mp3') {
      // 下载音频
      return await downloadAudio(url, filePath, metadata);
    } else {
      // 下载视频
      return await downloadVideoFormat(url, filePath, format, quality, metadata);
    }
  } catch (error) {
    logger.error(`视频下载失败: ${error.message}`);
    throw error;
  }
}

/**
 * 下载音频(MP3)
 * @param {string} url 视频URL
 * @param {string} outputPath 输出路径
 * @param {Object} metadata 元数据
 * @returns {Promise<Object>} 下载信息
 */
async function downloadAudio(url, outputPath, metadata) {
  return new Promise((resolve, reject) => {
    const audio = ytdl(url, { quality: 'highestaudio' });
    
    // 转换为MP3
    ffmpeg(audio)
      .audioBitrate(320)
      .toFormat('mp3')
      .on('error', error => {
        logger.error(`音频转换失败: ${error.message}`);
        reject(error);
      })
      .on('progress', progress => {
        logger.debug(`音频转换进度: ${progress.percent?.toFixed(2)}%`);
      })
      .on('end', () => {
        const stats = fs.statSync(outputPath);
        metadata.fileSize = stats.size;
        logger.info(`音频下载完成: ${outputPath}, 大小: ${stats.size} bytes`);
        resolve({
          ...metadata,
          downloadUrl: `/api/download/${metadata.fileName}`
        });
      })
      .save(outputPath);
  });
}

/**
 * 下载视频
 * @param {string} url 视频URL
 * @param {string} outputPath 输出路径
 * @param {string} format 格式
 * @param {string} quality 质量
 * @param {Object} metadata 元数据
 * @returns {Promise<Object>} 下载信息
 */
async function downloadVideoFormat(url, outputPath, format, quality, metadata) {
  return new Promise((resolve, reject) => {
    // 选择质量
    let qualityOption = 'highest';
    if (quality) {
      // 如果指定了质量，尝试找到匹配的格式
      qualityOption = quality;
    }
    
    const video = ytdl(url, { 
      quality: qualityOption,
      filter: format === 'mp4' ? 'videoandaudio' : null
    });
    
    // 创建写入流
    const writeStream = fs.createWriteStream(outputPath);
    
    // 流事件处理
    video.pipe(writeStream);
    
    video.on('progress', (chunkLength, downloaded, total) => {
      const percent = (downloaded / total * 100).toFixed(2);
      logger.debug(`下载进度: ${percent}%, 已下载: ${downloaded} bytes, 总大小: ${total} bytes`);
    });
    
    video.on('error', error => {
      logger.error(`视频下载失败: ${error.message}`);
      reject(error);
    });
    
    writeStream.on('finish', () => {
      const stats = fs.statSync(outputPath);
      metadata.fileSize = stats.size;
      logger.info(`视频下载完成: ${outputPath}, 大小: ${stats.size} bytes`);
      resolve({
        ...metadata,
        downloadUrl: `/api/download/${metadata.fileName}`
      });
    });
    
    writeStream.on('error', error => {
      logger.error(`文件写入失败: ${error.message}`);
      reject(error);
    });
  });
}

/**
 * 根据ID获取下载文件
 * @param {string} fileName 文件名
 * @returns {string|null} 文件路径或null
 */
function getDownloadFilePath(fileName) {
  const filePath = path.join(config.tempDir, fileName);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  return null;
}

module.exports = {
  getVideoInfo,
  downloadVideo,
  getDownloadFilePath
}; 