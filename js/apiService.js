/**
 * YouTube视频下载工具API服务
 * 用于前端与后端API通信
 */

const API_BASE_URL = 'https://xyz86.top/aitool/api';

/**
 * 下载YouTube视频
 * @param {string} url - YouTube视频URL
 * @param {string} format - 下载格式(mp4, mp3等)
 * @param {string} quality - 视频质量(可选)
 * @returns {Promise<Object>} - 下载结果
 */
async function videoToText(url) {
	try {
		const response = await fetch(`${API_BASE_URL}/aiassist/aitool/videototext?videoUrl=` + url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				// body: JSON.stringify(requestBody)
			});

		return await response.json();
	} catch (error) {
		console.error('下载视频失败:', error);
		return {
			success: false,
			message: `下载失败: ${error.message}`
		};
	}
}


