const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

// 初始化Replicate客户端
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '', // 需要设置环境变量
});

/**
 * 转录视频/音频文件
 * @param {string} filePath - 文件路径
 * @param {string} language - 语言代码(可选)
 * @returns {Promise<Object>} 转录结果
 */
async function transcribeFile(filePath, language = 'auto') {
  try {
    logger.info(`开始转录文件: ${filePath}, 语言: ${language}`);
    
    // 文件存在性检查
    if (!fs.existsSync(filePath)) {
      throw new Error('转录文件不存在');
    }
    
    // 读取文件内容作为base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    // 调用Replicate API (使用Whisper模型)
    const output = await replicate.run(
      "openai/whisper:91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
      {
        input: {
          audio: `data:audio/mp3;base64,${base64File}`,
          model: "large-v3", // 可选: tiny, base, small, medium, large-v1, large-v2, large-v3
          transcription: "plain text", 
          translate: false,
          language: language === 'auto' ? null : language,
          temperature: 0,
          suppress_tokens: "-1",
          condition_on_previous_text: true,
          compression_ratio_threshold: 2.4
        }
      }
    );
    
    logger.info(`文件转录完成: ${filePath}`);
    
    return {
      success: true,
      data: {
        text: output.text || '',
        segments: output.segments || [],
        language: output.language || language
      }
    };
  } catch (error) {
    logger.error(`文件转录失败: ${error.message}`);
    return {
      success: false,
      message: `转录失败: ${error.message}`
    };
  }
}

/**
 * 使用Faster Whisper模型转录
 * 相比标准Whisper速度更快
 * @param {string} filePath - 文件路径
 * @param {string} language - 语言代码(可选)
 * @returns {Promise<Object>} 转录结果
 */
async function fastTranscribeFile(filePath, language = 'auto') {
  try {
    logger.info(`开始快速转录文件: ${filePath}, 语言: ${language}`);
    
    // 文件存在性检查
    if (!fs.existsSync(filePath)) {
      throw new Error('转录文件不存在');
    }
    
    // 读取文件内容作为base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    
    // 调用Replicate API (使用Faster Whisper模型)
    const output = await replicate.run(
      "vaibhavs10/faster-whisper:3ba2dab05e97f6a50a7f78e51f901aa89a14a18a3fd4f196ec869382cab0157d",
      {
        input: {
          audio: `data:audio/mp3;base64,${base64File}`,
          model_size: "large-v3", // 可选: tiny, small, medium, large-v1, large-v2, large-v3
          language: language === 'auto' ? null : language,
          transcription: "plain",
          translate: false,
          temperature: 0,
          patience: 1,
          suppress_tokens: "-1",
          condition_on_previous_text: true,
          vad_filter: true,
          vad_parameters: {
            threshold: 0.5
          }
        }
      }
    );
    
    logger.info(`快速转录完成: ${filePath}`);
    
    return {
      success: true,
      data: {
        text: output.text || '',
        segments: output.segments || [],
        language: output.detected_language || language
      }
    };
  } catch (error) {
    logger.error(`快速转录失败: ${error.message}`);
    return {
      success: false,
      message: `快速转录失败: ${error.message}`
    };
  }
}

/**
 * 获取转录进度
 * @param {string} predictionId - 转录任务ID
 * @returns {Promise<Object>} 转录进度
 */
async function getTranscriptionProgress(predictionId) {
  try {
    logger.info(`获取转录进度: ${predictionId}`);
    
    const prediction = await replicate.predictions.get(predictionId);
    
    return {
      success: true,
      data: {
        status: prediction.status,
        progress: prediction.progress || 0,
        output: prediction.output || null
      }
    };
  } catch (error) {
    logger.error(`获取转录进度失败: ${error.message}`);
    return {
      success: false,
      message: `获取转录进度失败: ${error.message}`
    };
  }
}

/**
 * 直接从URL转录
 * 不需要下载文件，直接使用URL转录(但需要公开可访问的URL)
 * @param {string} audioUrl - 音频URL
 * @param {string} language - 语言代码(可选)
 * @returns {Promise<Object>} 转录结果
 */
async function transcribeFromUrl(audioUrl, language = 'auto') {
  try {
    logger.info(`从URL开始转录: ${audioUrl}, 语言: ${language}`);
    
    // 调用Replicate API
    const output = await replicate.run(
      "openai/whisper:91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
      {
        input: {
          audio: audioUrl,
          model: "large-v3",
          transcription: "plain text",
          translate: false,
          language: language === 'auto' ? null : language,
          temperature: 0
        }
      }
    );
    
    logger.info(`URL转录完成: ${audioUrl}`);
    
    return {
      success: true,
      data: {
        text: output.text || '',
        segments: output.segments || [],
        language: output.language || language
      }
    };
  } catch (error) {
    logger.error(`URL转录失败: ${error.message}`);
    return {
      success: false,
      message: `URL转录失败: ${error.message}`
    };
  }
}

module.exports = {
  transcribeFile,
  fastTranscribeFile,
  getTranscriptionProgress,
  transcribeFromUrl
}; 