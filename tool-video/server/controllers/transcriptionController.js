const transcriptionService = require('../services/transcriptionService');
const logger = require('../utils/logger');

/**
 * 转录控制器
 */
class TranscriptionController {
    /**
     * 从YouTube视频URL创建转录任务
     * @param {object} req - 请求对象
     * @param {object} res - 响应对象
     */
    async transcribeVideo(req, res) {
        try {
            const { url, language = 'auto', fastMode = false } = req.body;

            if (!url) {
                return res.status(400).json({ 
                    success: false, 
                    message: '请提供视频URL' 
                });
            }

            logger.info(`收到转录请求: ${url}, 语言: ${language}, 快速模式: ${fastMode}`);

            // 创建转录任务
            const result = await transcriptionService.transcribeFromYouTube(url, language, fastMode);

            res.json({
                success: true,
                id: result.id,
                title: result.title,
                status: result.status
            });
        } catch (error) {
            logger.error(`转录请求失败: ${error.message}`);
            res.status(500).json({ 
                success: false, 
                message: `转录请求失败: ${error.message}` 
            });
        }
    }

    /**
     * 从媒体URL直接创建转录任务
     * @param {object} req - 请求对象
     * @param {object} res - 响应对象
     */
    async transcribeFromUrl(req, res) {
        try {
            const { url, language = 'auto' } = req.body;

            if (!url) {
                return res.status(400).json({ 
                    success: false, 
                    message: '请提供媒体URL' 
                });
            }

            logger.info(`收到URL转录请求: ${url}, 语言: ${language}`);

            // 创建转录任务
            const result = await transcriptionService.transcribeFromMediaUrl(url, language);

            res.json({
                success: true,
                id: result.id,
                status: result.status
            });
        } catch (error) {
            logger.error(`URL转录请求失败: ${error.message}`);
            res.status(500).json({ 
                success: false, 
                message: `转录请求失败: ${error.message}` 
            });
        }
    }

    /**
     * 获取转录任务状态
     * @param {object} req - 请求对象
     * @param {object} res - 响应对象
     */
    async getTranscriptionStatus(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ 
                    success: false, 
                    message: '请提供任务ID' 
                });
            }

            // 获取转录任务状态
            const task = transcriptionService.getTranscriptionStatus(id);

            if (!task) {
                return res.status(404).json({ 
                    success: false, 
                    message: '找不到指定的转录任务' 
                });
            }

            // 返回状态信息
            res.json({
                success: true,
                id: task.id,
                title: task.title,
                status: task.status,
                progress: task.progress,
                message: task.message,
                language: task.language,
                created: task.created,
                updated: task.updated,
                completed: task.completed,
                text: task.text,
                error: task.error
            });
        } catch (error) {
            logger.error(`获取转录状态失败: ${error.message}`);
            res.status(500).json({ 
                success: false, 
                message: `获取转录状态失败: ${error.message}` 
            });
        }
    }

    /**
     * 获取所有转录任务
     * @param {object} req - 请求对象
     * @param {object} res - 响应对象
     */
    async getAllTranscriptions(req, res) {
        try {
            // 获取所有转录任务
            const tasks = transcriptionService.getAllTranscriptions();

            res.json({
                success: true,
                count: tasks.length,
                tasks
            });
        } catch (error) {
            logger.error(`获取所有转录任务失败: ${error.message}`);
            res.status(500).json({ 
                success: false, 
                message: `获取所有转录任务失败: ${error.message}` 
            });
        }
    }

    /**
     * 获取支持的语言列表
     * @param {object} req - 请求对象
     * @param {object} res - 响应对象
     */
    async getSupportedLanguages(req, res) {
        try {
            // 获取支持的语言列表
            const languages = transcriptionService.getSupportedLanguages();

            res.json({
                success: true,
                languages
            });
        } catch (error) {
            logger.error(`获取支持语言失败: ${error.message}`);
            res.status(500).json({ 
                success: false, 
                message: `获取支持语言失败: ${error.message}` 
            });
        }
    }
}

module.exports = new TranscriptionController(); 