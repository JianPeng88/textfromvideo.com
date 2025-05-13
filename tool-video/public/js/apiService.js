/**
 * YouTube视频下载工具API服务
 * 用于前端与后端API通信
 */

const API_BASE_URL = 'https://xyz86.top/aitool/api';

/**
 * 解析YouTube视频链接
 * @param {string} url - YouTube视频URL
 * @returns {Promise<Object>} - 解析结果
 */
async function parseVideo(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    return await response.json();
  } catch (error) {
    console.error('解析视频失败:', error);
    return {
      success: false,
      message: `解析失败: ${error.message}`
    };
  }
}

/**
 * 下载YouTube视频
 * @param {string} url - YouTube视频URL
 * @param {string} format - 下载格式(mp4, mp3等)
 * @param {string} quality - 视频质量(可选)
 * @returns {Promise<Object>} - 下载结果
 */
async function downloadVideo(url, format, quality = null) {
	console.log('downloadVideo - url', url)
  try {
    // const requestBody = { url, format };
    
    // 如果指定了质量，添加到请求中
    if (quality) {
      requestBody.quality = quality;
    }
    
    const response = await fetch(`${API_BASE_URL}/aiassist/aitool/downloadvideo?videoUrl=`+url+'&onlyAudio=false', {
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

/**
 * 获取支持的格式和质量
 * @returns {Promise<Object>} - 支持的格式和质量
 */
async function getSupportedFormats() {
  try {
    const response = await fetch(`${API_BASE_URL}/formats`);
    return await response.json();
  } catch (error) {
    console.error('获取支持格式失败:', error);
    return {
      success: false,
      message: `获取格式失败: ${error.message}`
    };
  }
}

/**
 * 检查API服务健康状态
 * @returns {Promise<boolean>} - 是否正常
 */
async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('API健康检查失败:', error);
    return false;
  }
}

/**
 * 转录YouTube视频
 * @param {string} url - YouTube视频URL
 * @param {string} language - 语言代码(可选)
 * @param {boolean} fastMode - 是否使用快速模式(可选)
 * @returns {Promise<Object>} - 转录结果
 */
async function transcribeVideo(url, language = 'auto', fastMode = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, language, fastMode })
    });
    
    return await response.json();
  } catch (error) {
    console.error('视频转录失败:', error);
    return {
      success: false,
      message: `转录失败: ${error.message}`
    };
  }
}

/**
 * 从媒体URL转录
 * @param {string} mediaUrl - 媒体URL
 * @param {string} language - 语言代码(可选)
 * @returns {Promise<Object>} - 转录结果
 */
async function transcribeFromUrl(mediaUrl, language = 'auto') {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mediaUrl, language })
    });
    
    return await response.json();
  } catch (error) {
    console.error('URL转录失败:', error);
    return {
      success: false,
      message: `URL转录失败: ${error.message}`
    };
  }
}

/**
 * 获取支持的转录语言
 * @returns {Promise<Object>} - 支持的语言列表
 */
async function getSupportedLanguages() {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe/languages`);
    return await response.json();
  } catch (error) {
    console.error('获取支持语言失败:', error);
    return {
      success: false,
      message: `获取语言失败: ${error.message}`
    };
  }
}

const apiService = {
    /**
     * 获取视频信息
     * @param {string} url - 视频URL
     * @returns {Promise<Object>} - 视频信息对象
     */
    getVideoInfo: function(url) {
        return fetch('/api/video-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '获取视频信息失败');
                });
            }
            return response.json();
        });
    },

    /**
     * 获取下载链接
     * @param {string} url - 视频URL
     * @param {Object} options - 下载选项
     * @returns {Promise<Object>} - 下载信息对象
     */
    getDownloadLink: function(url, options = {}) {
        return fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                url,
                format: options.format || 'mp4',
                quality: options.quality || 'highest'
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '获取下载链接失败');
                });
            }
            return response.json();
        });
    },

    /**
     * 转录视频内容
     * @param {string} url - YouTube视频URL
     * @param {string} language - 转录语言，默认为'auto'自动检测
     * @param {boolean} fastMode - 是否使用快速模式，默认为false
     * @returns {Promise<Object>} - 转录任务信息对象
     */
    transcribeVideo: function(url, language = 'auto', fastMode = false) {
        return fetch('/api/transcribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                url,
                language,
                fastMode
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '启动转录失败');
                });
            }
            return response.json();
        });
    },

    /**
     * 从媒体URL直接转录
     * @param {string} mediaUrl - 媒体文件URL
     * @param {string} language - 转录语言，默认为'auto'自动检测
     * @returns {Promise<Object>} - 转录任务信息对象
     */
    transcribeFromUrl: function(mediaUrl, language = 'auto') {
        return fetch('/api/transcribe-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                url: mediaUrl,
                language
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '启动转录失败');
                });
            }
            return response.json();
        });
    },

    /**
     * 获取转录状态
     * @param {string} id - 转录任务ID
     * @returns {Promise<Object>} - 转录状态对象
     */
    getTranscriptionStatus: function(id) {
        return fetch(`/api/transcribe/status/${id}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '获取转录状态失败');
                });
            }
            return response.json();
        });
    },

    /**
     * 获取支持的转录语言列表
     * @returns {Promise<Array>} - 支持的语言列表
     */
    getSupportedLanguages: function() {
        return fetch('/api/transcribe/languages')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || '获取支持语言失败');
                });
            }
            return response.json();
        });
    }
}; 