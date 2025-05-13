const fetch = require('node-fetch');
const logger = require('../utils/logger');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 存储转录任务状态
const transcriptionTasks = new Map();

/**
 * 转录服务
 */
class TranscriptionService {
    /**
     * 从YouTube视频URL创建转录任务
     * @param {string} url - YouTube视频URL
     * @param {string} language - 转录语言 (auto为自动检测)
     * @param {boolean} fastMode - 是否使用快速模式 (速度快但准确率较低)
     * @returns {Promise<object>} - 转录任务信息
     */
    async transcribeFromYouTube(url, language = 'auto', fastMode = false) {
        try {
            logger.info(`开始从YouTube转录, URL: ${url}, 语言: ${language}, 快速模式: ${fastMode}`);

            // 验证YouTube URL
            if (!ytdl.validateURL(url)) {
                throw new Error('无效的YouTube URL');
            }

            // 获取视频信息
            const videoInfo = await ytdl.getInfo(url);
            const videoTitle = videoInfo.videoDetails.title;
            
            // 获取音频格式URL
            const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');
            if (!audioFormats || audioFormats.length === 0) {
                throw new Error('无法找到适合转录的音频格式');
            }

            // 选择最佳音频格式
            const audioFormat = audioFormats
                .sort((a, b) => b.audioBitrate - a.audioBitrate)
                .find(format => format.audioBitrate); // 选择比特率最高的
            
            if (!audioFormat) {
                throw new Error('无法找到适合转录的音频格式');
            }

            // 创建任务ID和状态
            const taskId = uuidv4();
            transcriptionTasks.set(taskId, {
                id: taskId,
                title: videoTitle,
                status: 'processing',
                progress: 0,
                language,
                created: new Date(),
                updated: new Date(),
                url: url
            });

            // 异步开始转录过程，不等待完成
            this._processTranscription(taskId, audioFormat.url, language, fastMode)
                .catch(error => {
                    logger.error(`转录处理错误 (taskId: ${taskId}): ${error.message}`);
                    
                    // 更新任务状态为失败
                    const task = transcriptionTasks.get(taskId);
                    if (task) {
                        task.status = 'failed';
                        task.error = error.message;
                        task.updated = new Date();
                        transcriptionTasks.set(taskId, task);
                    }
                });

            return {
                id: taskId,
                title: videoTitle,
                status: 'processing'
            };
        } catch (error) {
            logger.error(`从YouTube创建转录任务失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 从媒体URL直接创建转录任务
     * @param {string} mediaUrl - 媒体文件URL
     * @param {string} language - 转录语言
     * @returns {Promise<object>} - 转录任务信息
     */
    async transcribeFromMediaUrl(mediaUrl, language = 'auto') {
        try {
            logger.info(`开始从URL转录, URL: ${mediaUrl}, 语言: ${language}`);

            // 创建任务ID和状态
            const taskId = uuidv4();
            transcriptionTasks.set(taskId, {
                id: taskId,
                title: '从URL转录',
                status: 'processing',
                progress: 0,
                language,
                created: new Date(),
                updated: new Date(),
                url: mediaUrl
            });

            // 异步开始转录过程，不等待完成
            this._processTranscription(taskId, mediaUrl, language, false)
                .catch(error => {
                    logger.error(`转录处理错误 (taskId: ${taskId}): ${error.message}`);
                    
                    // 更新任务状态为失败
                    const task = transcriptionTasks.get(taskId);
                    if (task) {
                        task.status = 'failed';
                        task.error = error.message;
                        task.updated = new Date();
                        transcriptionTasks.set(taskId, task);
                    }
                });

            return {
                id: taskId,
                status: 'processing'
            };
        } catch (error) {
            logger.error(`从URL创建转录任务失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取转录任务状态
     * @param {string} taskId - 转录任务ID
     * @returns {object|null} - 转录任务状态信息
     */
    getTranscriptionStatus(taskId) {
        const task = transcriptionTasks.get(taskId);
        if (!task) {
            return null;
        }
        return { ...task };
    }

    /**
     * 获取所有转录任务
     * @returns {Array} - 所有转录任务列表
     */
    getAllTranscriptions() {
        return Array.from(transcriptionTasks.values());
    }

    /**
     * 获取支持的语言列表
     * @returns {Array} - 支持的语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'auto', name: '自动检测' },
            { code: 'zh', name: '中文' },
            { code: 'en', name: '英文' },
            { code: 'ja', name: '日语' },
            { code: 'ko', name: '韩语' },
            { code: 'fr', name: '法语' },
            { code: 'de', name: '德语' },
            { code: 'es', name: '西班牙语' },
            { code: 'ru', name: '俄语' }
        ];
    }

    /**
     * 处理转录过程 (内部方法)
     * @param {string} taskId - 转录任务ID
     * @param {string} audioUrl - 音频URL
     * @param {string} language - 转录语言
     * @param {boolean} fastMode - 是否使用快速模式
     * @returns {Promise<void>}
     * @private
     */
    async _processTranscription(taskId, audioUrl, language, fastMode) {
        try {
            // 更新任务进度
            this._updateTaskProgress(taskId, 10, '开始处理');

            // 选择转录模型和参数
            const model = fastMode ? 
                "openai/whisper-small" : 
                "openai/whisper-large-v3";

            // 调用Replicate API进行转录
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    version: model,
                    input: {
                        audio: audioUrl,
                        language: language === 'auto' ? null : language,
                        prompt: "转录以下音频内容",
                        temperature: 0,
                        suppress_tokens: "-1",
                        condition_on_previous_text: true,
                        temperature_increment_on_fallback: 0.2,
                        compression_ratio_threshold: 2.4
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Replicate API错误: ${error.detail || JSON.stringify(error)}`);
            }

            this._updateTaskProgress(taskId, 20, '任务已提交');

            const prediction = await response.json();
            const predictionId = prediction.id;
            logger.info(`转录任务已提交到Replicate，预测ID: ${predictionId}`);

            // 轮询检查转录状态
            let completed = false;
            let attempts = 0;
            const maxAttempts = 60; // 最多轮询60次 (约30分钟)

            while (!completed && attempts < maxAttempts) {
                // 等待30秒
                await new Promise(resolve => setTimeout(resolve, 30000));
                attempts++;

                // 检查状态
                const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                    headers: {
                        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`
                    }
                });

                if (!statusResponse.ok) {
                    throw new Error(`获取转录状态失败: ${statusResponse.statusText}`);
                }

                const result = await statusResponse.json();
                logger.debug(`转录状态 (${attempts}/${maxAttempts}): ${result.status}`);

                // 计算进度百分比 (20% 初始进度 + 最多到95%)
                const progressPercent = Math.min(95, 20 + Math.floor((attempts / maxAttempts) * 75));
                this._updateTaskProgress(taskId, progressPercent, `处理中 (${result.status})`);

                if (result.status === 'succeeded') {
                    // 转录完成，处理结果
                    const transcriptionText = result.output?.transcription || result.output;
                    logger.info(`转录任务完成，文本长度: ${transcriptionText?.length || 0}`);
                    
                    // 更新任务状态
                    const task = transcriptionTasks.get(taskId);
                    if (task) {
                        task.status = 'completed';
                        task.progress = 100;
                        task.text = transcriptionText;
                        task.completed = new Date();
                        task.updated = new Date();
                        transcriptionTasks.set(taskId, task);
                    }
                    completed = true;
                } else if (result.status === 'failed') {
                    // 转录失败
                    throw new Error(`转录失败: ${result.error || '未知错误'}`);
                }
            }

            if (!completed) {
                throw new Error('转录超时，请稍后再试');
            }
        } catch (error) {
            logger.error(`转录处理失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 更新任务进度 (内部方法)
     * @param {string} taskId - 转录任务ID
     * @param {number} progress - 进度百分比
     * @param {string} message - 进度消息
     * @private
     */
    _updateTaskProgress(taskId, progress, message) {
        const task = transcriptionTasks.get(taskId);
        if (task) {
            task.progress = progress;
            task.message = message;
            task.updated = new Date();
            transcriptionTasks.set(taskId, task);
            logger.debug(`任务${taskId}进度更新: ${progress}%, ${message}`);
        }
    }

    /**
     * 删除旧的转录任务 (清理工具)
     * @param {number} maxAgeHours - 最大保留时间(小时)
     * @returns {number} - 已删除的任务数量
     */
    cleanupOldTasks(maxAgeHours = 24) {
        const now = new Date();
        let deletedCount = 0;

        for (const [taskId, task] of transcriptionTasks.entries()) {
            const taskAge = (now - new Date(task.created)) / (1000 * 60 * 60);
            if (taskAge > maxAgeHours) {
                transcriptionTasks.delete(taskId);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            logger.info(`已清理 ${deletedCount} 个旧转录任务`);
        }
        
        return deletedCount;
    }
}

module.exports = new TranscriptionService(); 