/**
 * Video to Text Website API Interaction File
 * Author: AI Assistant
 * Version: 1.0
 */

/**
 * API Configuration
 * Note: In a real project, this needs to be replaced with actual API endpoints and keys
 */
const API_CONFIG = {
    // Speech recognition service API endpoint
    baseUrl: 'https://api.example.com/speech-to-text',
    // API key
    apiKey: 'YOUR_API_KEY_HERE'
};

/**
 * Generic API request method
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request data
 * @param {string} method - Request method
 * @returns {Promise} - Returns Promise object
 */
async function apiRequest(endpoint, data = {}, method = 'POST') {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: method !== 'GET' ? JSON.stringify(data) : undefined
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

/**
 * Upload video file and start conversion
 * @param {File} videoFile - Video file object
 * @param {function} progressCallback - Progress callback function
 * @returns {Promise} - Returns conversion task ID
 */
async function uploadVideoAndConvert(videoFile, progressCallback) {
    // Create FormData object
    const formData = new FormData();
    formData.append('file', videoFile);
    
    // Upload progress monitoring
    const xhr = new XMLHttpRequest();
    
    // Return Promise
    return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                if (progressCallback) {
                    progressCallback('upload', progress);
                }
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.taskId);
                } catch (e) {
                    reject(new Error('Failed to parse response'));
                }
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Network error'));
        });
        
        xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
        });
        
        // Send request
        xhr.open('POST', `${API_CONFIG.baseUrl}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${API_CONFIG.apiKey}`);
        xhr.send(formData);
    });
}

/**
 * Process YouTube or other platform video link
 * @param {string} videoUrl - Video URL
 * @returns {Promise} - Returns conversion task ID
 */
async function processVideoUrl(videoUrl) {
    return apiRequest('/process-url', {
        url: videoUrl
    });
}

/**
 * Get conversion task status
 * @param {string} taskId - Task ID
 * @returns {Promise} - Returns task status
 */
async function getConversionStatus(taskId) {
    return apiRequest(`/status/${taskId}`, {}, 'GET');
}

/**
 * Get conversion result
 * @param {string} taskId - Task ID
 * @returns {Promise} - Returns conversion result
 */
async function getConversionResult(taskId) {
    return apiRequest(`/result/${taskId}`, {}, 'GET');
}

/**
 * Cancel conversion task
 * @param {string} taskId - Task ID
 * @returns {Promise} - Returns cancellation result
 */
async function cancelConversion(taskId) {
    return apiRequest(`/cancel/${taskId}`, {
        taskId: taskId
    });
}

/**
 * Download conversion result
 * @param {string} taskId - Task ID
 * @param {string} format - Download format (txt, docx, pdf, srt)
 * @param {object} options - Download options
 * @returns {Promise} - Returns download URL
 */
async function downloadResult(taskId, format, options = {}) {
    const response = await apiRequest('/download', {
        taskId: taskId,
        format: format,
        options: options
    });
    
    return response.downloadUrl;
}

/**
 * Save edited text
 * @param {string} taskId - Task ID
 * @param {string} text - Edited text
 * @returns {Promise} - Returns save result
 */
async function saveEditedText(taskId, text) {
    return apiRequest('/save', {
        taskId: taskId,
        text: text
    });
}

/**
 * Get user history
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Returns history records
 */
async function getUserHistory(page = 1, limit = 10) {
    return apiRequest(`/history?page=${page}&limit=${limit}`, {}, 'GET');
}

/**
 * Register/Login frontend API
 */
const authAPI = {
    // User registration
    register: async (userData) => {
        return apiRequest('/auth/register', userData);
    },
    
    // User login
    login: async (credentials) => {
        return apiRequest('/auth/login', credentials);
    },
    
    // Forgot password
    forgotPassword: async (email) => {
        return apiRequest('/auth/forgot-password', { email });
    }
};

// Export API functions
window.VideoTextAPI = {
    upload: uploadVideoAndConvert,
    processUrl: processVideoUrl,
    getStatus: getConversionStatus,
    getResult: getConversionResult,
    cancel: cancelConversion,
    download: downloadResult,
    saveText: saveEditedText,
    history: getUserHistory,
    auth: authAPI
};