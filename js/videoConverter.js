/**
 * 视频转文本功能实现
 * 集成Deepgram API进行语音识别
 */

// Deepgram API密钥 - 实际使用时请替换为您的密钥
const DEEPGRAM_API_KEY = 'YOUR_DEEPGRAM_API_KEY'; 

// 初始化全局变量
let videoSource = null;
let convertInProgress = false;

// 页面加载完成后初始化功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化首页视频链接转换
    initHomePageConverter();
    
    // 如果在转换页面，检查URL参数并开始转换
    if (window.location.pathname.includes('convert')) {
        initConversionPage();
    }
    
    // 如果在编辑页面，初始化编辑器功能
    if (window.location.pathname.includes('edit')) {
        initEditPage();
    }
});

/**
 * 初始化首页转换器功能
 */
function initHomePageConverter() {
    const convertBtn = document.querySelector('.convert-btn');
    const linkInput = document.querySelector('.link-input');
    
    if (convertBtn && linkInput) {
        convertBtn.addEventListener('click', function() {
            const videoUrl = linkInput.value.trim();
            if (!videoUrl) {
                alert('请输入YouTube或TikTok等视频链接');
                return;
            }
            
            // 验证链接格式
            // if (!isValidVideoUrl(videoUrl)) {
            //     alert('请输入有效的YouTube或TikTok视频链接');
            //     return;
            // }
            
            // 显示加载状态
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 转换中...';
            convertBtn.disabled = true;
            
            // 跳转到转换页面
            setTimeout(() => {
                window.location.href = 'convert.html?source=' + encodeURIComponent(videoUrl);
            }, 1000);
        });
    }
}

/**
 * 初始化转换页面
 */
function initConversionPage() {
    // 从URL获取视频源
    const urlParams = new URLSearchParams(window.location.search);
    videoSource = urlParams.get('source');
    
    if (!videoSource) {
        alert('未找到视频源，请返回首页重试');
        return;
    }
    
    // 更新页面显示信息
    updateConversionInfo(videoSource);
    
    // 开始转换流程
    startConversion(videoSource);
}

/**
 * 更新转换页面信息
 */
function updateConversionInfo(videoUrl) {
    // 更新文件名显示
    const fileNameElement = document.querySelector('#file-name');
    if (fileNameElement) {
        fileNameElement.textContent = videoUrl;
    }
    
    // 更新视频类型
    const fileTypeElement = document.querySelector('#file-size');
    if (fileTypeElement) {
        if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
            fileTypeElement.textContent = 'YouTube Video';
        } else if (videoUrl.includes('tiktok')) {
            fileTypeElement.textContent = 'TikTok Video';
        } else {
            fileTypeElement.textContent = 'Video Link';
        }
    }
}

/**
 * 开始转换流程
 */
async function startConversion(videoUrl) {
    if (convertInProgress) return;
    
    convertInProgress = true;
    
    // 更新当前步骤显示
    updateCurrentStep('下载视频中...');
	
	// 下载视频
	const videoToTextResult = await videoToText(videoUrl);
	
	if (videoToTextResult.code !== 1) {
		throw new Error(videoToTextResult.msg);
	}
	
	if(videoToTextResult.data) {
		// 模拟进度更新
		simulateProgressUpdate();
		
		// 这里使用setTimeout模拟整个过程
		setTimeout(() => {
		    // 模拟转换完成
		    convertInProgress = false;
		    
		    // 生成示例转录文本
		    const transcriptText = videoToTextResult.data;
		    
		    // 将转录结果保存到localStorage
		    localStorage.setItem('transcriptText', transcriptText);
		    
		    // 转到编辑页面
		    window.location.href = 'edit.html?source=' + encodeURIComponent(videoUrl);
		}, 8000); // 模拟8秒后完成
	}
    
    // 实际情况需要进行以下步骤：
    // 1. 使用服务器端代理下载视频
    // 2. 提取音频
    // 3. 发送到Deepgram API
    // 4. 处理响应结果
}

/**
 * 模拟进度更新
 */
function simulateProgressUpdate() {
    let progress = 5;
    const progressBar = document.querySelector('.progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const totalDuration = document.querySelector('.total-duration');
    const processedDuration = document.querySelector('.processed-duration');
    const estimatedTime = document.querySelector('.estimated-time');
    
    // 更新总时长(模拟1分钟的视频)
    if (totalDuration) totalDuration.textContent = 'gettingIn...';
    
    const interval = setInterval(() => {
        progress += 5;
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (progressPercent) {
            progressPercent.textContent = progress + '%';
        }
        
        // 更新已处理时间
        if (processedDuration) {
            const processed = Math.floor((progress / 100) * 64);
            const minutes = Math.floor(processed / 60);
            const seconds = processed % 60;
            processedDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // 更新剩余时间
        if (estimatedTime) {
            const remaining = Math.floor(((100 - progress) / 100) * 64);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            estimatedTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // 更新当前步骤
        if (progress > 30 && progress < 60) {
            updateCurrentStep('分析语音内容...');
        } else if (progress >= 60 && progress < 90) {
            updateCurrentStep('生成文本转录...');
        } else if (progress >= 90) {
            updateCurrentStep('完成转换，准备跳转...');
        }
        
        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 1000);
}

/**
 * 更新当前步骤显示
 */
function updateCurrentStep(stepText) {
    const currentStepElement = document.querySelector('#current-step');
    if (currentStepElement) {
        currentStepElement.textContent = stepText;
    }
}

/**
 * 初始化编辑页面
 */
function initEditPage() {
    // 从localStorage获取转录文本
    const transcriptText = localStorage.getItem('transcriptText');
    
    // 获取编辑器元素
    const editorElement = document.querySelector('.transcript-editor');
    
    if (editorElement && transcriptText) {
        // 填充编辑器内容
        editorElement.innerHTML = transcriptText;
    }
    
    // 从URL获取视频源
    const urlParams = new URLSearchParams(window.location.search);
    const videoSource = urlParams.get('source');
    
    // 更新时间戳信息
    updateTimestamps(videoSource);
    
    // 初始化下载按钮
    initDownloadButton();
}

/**
 * 更新时间戳信息
 */
function updateTimestamps(videoUrl) {
	console.log(11111, videoUrl)
    const timestampsContainer = document.querySelector('.timestamps');
    if (!timestampsContainer) return;
    
    // 清空现有时间戳
    timestampsContainer.innerHTML = '';
    
    // 创建示例时间戳
    const timestamps = [
        { time: '该视频链接为: ', text: videoUrl },
    ];
    
    // 添加时间戳到容器
    timestamps.forEach(stamp => {
        const timestampItem = document.createElement('div');
        timestampItem.className = 'timestamp-item';
        timestampItem.innerHTML = `
            <div class="timestamp-time">${stamp.time}</div>
            <div class="timestamp-text">${stamp.text}</div>
        `;
        
        // 添加点击事件
        timestampItem.addEventListener('click', function() {
            // 在实际应用中，这里应该滚动到编辑器中对应的位置
            console.log('点击了时间戳:', stamp.time);
        });
        
        // 可以选择添加或不添加，具体取决于edit.html中是否已有时间戳
        timestampsContainer.appendChild(timestampItem);
    });
}

/**
 * 初始化下载按钮
 */
function initDownloadButton() {
    const downloadBtn = document.querySelector('.download-btn');
    if (!downloadBtn) return;
    
    downloadBtn.addEventListener('click', function() {
        const editorElement = document.querySelector('.transcript-editor');
        if (!editorElement) return;
        
        const text = editorElement.innerText || editorElement.textContent;
        
        // 创建Blob对象
        const blob = new Blob([text], { type: 'text/plain' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcript.txt';
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
}

/**
 * 生成示例转录文本
 */
function generateSampleTranscript() {
    // 在实际应用中，这应该是从Deepgram API返回的内容
    return `
        <p>这是一段示例的转录文本。在实际应用中，这里将显示从视频中提取的实际语音内容。</p>
        <p>Deepgram API提供了高质量的语音识别服务，可以准确地将语音转换为文本。</p>
        <p>您可以在此编辑器中自由编辑转录内容，添加标点符号，修正错误，或进行其他必要的调整。</p>
        <p>完成编辑后，您可以下载文本或将其保存到您的账户中。</p>
    `;
}

/**
 * 调用Deepgram API进行语音识别(实际实现)
 */
async function transcribeWithDeepgram(audioBuffer) {
    try {
        // 初始化Deepgram
        const deepgram = new Deepgram.Deepgram(DEEPGRAM_API_KEY);
        
        // 设置转录选项
        const options = {
            punctuate: true,
            language: 'zh-CN',
            model: 'general',
            tier: 'enhanced'
        };
        
        // 发送请求
        const response = await deepgram.transcription.preRecorded(
            { buffer: audioBuffer },
            options
        );
        
        // 处理结果
        if (response && response.results && response.results.channels) {
            const transcript = response.results.channels[0].alternatives[0].transcript;
            return transcript;
        } else {
            throw new Error('转录结果格式不正确');
        }
    } catch (error) {
        console.error('Deepgram API错误:', error);
        return '转录失败。请稍后重试。';
    }
}

/**
 * 验证视频URL是否有效
 */
function isValidVideoUrl(url) {
    // 简单验证是否为YouTube或TikTok链接
    return /youtube\.com|youtu\.be|tiktok\.com/.test(url);
}
