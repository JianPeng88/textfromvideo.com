/**
 * 修复的视频链接转换功能
 * 保存为 js/videoConverter.js
 */

// 全局配置
const VIDEO_CONVERTER = {
    // 是否使用模拟数据（适合没有真实API时测试使用）
    useMockData: true,
    
    // 模拟处理时间（毫秒）
    mockProcessingTime: 3000,
    
    // 初始化函数
    init: function() {
        console.log('视频转换器初始化...');
        this.setupEventListeners();
    },
    
    // 设置事件监听
    setupEventListeners: function() {
        // 首页的链接转换按钮
        const convertBtns = document.querySelectorAll('.convert-btn');
        
        convertBtns.forEach(btn => {
            btn.addEventListener('click', this.handleConvertButtonClick.bind(this));
        });
        
        // 首页链接输入框的回车键处理
        const linkInputs = document.querySelectorAll('.link-input');
        linkInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    // 找到相关的转换按钮并触发点击
                    const parentContainer = input.closest('.link-input-container, .video-link-converter');
                    if (parentContainer) {
                        const convertBtn = parentContainer.querySelector('.convert-btn');
                        if (convertBtn) convertBtn.click();
                    }
                }
            });
        });
        
        // 检查当前页面的功能
        this.checkCurrentPageFunctions();
    },
    
    // 检查当前页面并初始化相关功能
    checkCurrentPageFunctions: function() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('convert.html')) {
            // 在转换页面，启动转换状态监控
            this.startConversionMonitoring();
        } else if (currentPath.includes('edit.html')) {
            // 在编辑页面，检查是否有来自URL的视频链接
            const urlParams = new URLSearchParams(window.location.search);
            const videoSource = urlParams.get('source');
            
            if (videoSource) {
                // 如果有source参数但没有已有的转录结果，则生成模拟数据
                if (!sessionStorage.getItem('transcription_result')) {
                    this.generateMockTranscription(videoSource);
                }
            }
        }
    },
    
    // 处理转换按钮点击
    handleConvertButtonClick: function(event) {
        // 获取相关元素
        const btn = event.currentTarget;
        const parentContainer = btn.closest('.link-input-container, .video-link-converter');
        let linkInput;
        
        if (parentContainer) {
            linkInput = parentContainer.querySelector('.link-input');
        }
        
        if (!linkInput) {
            console.error('找不到链接输入框');
            return;
        }
        
        const videoUrl = linkInput.value.trim();
        
        // 验证链接
        if (!videoUrl) {
            alert('请输入YouTube或TikTok视频链接');
            return;
        }
        
        // 视频链接格式简单验证
        if (!videoUrl.includes('youtube') && 
            !videoUrl.includes('youtu.be') && 
            !videoUrl.includes('tiktok')) {
            
            // 简单验证，允许继续但显示警告
            if (!confirm('链接似乎不是YouTube或TikTok链接。是否继续？')) {
                return;
            }
        }
        
        // 更新按钮状态
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 转换中...';
        btn.disabled = true;
        
        // 处理视频URL
        this.processVideoLink(videoUrl)
            .then(result => {
                console.log('处理成功:', result);
                
                // 根据result决定跳转
                if (result.directToEdit) {
                    // 直接跳到编辑页面
                    window.location.href = 'edit.html';
                } else {
                    // 跳到转换页面
                    window.location.href = `convert.html?id=${result.id}&platform=${result.platform}&url=${encodeURIComponent(videoUrl)}`;
                }
            })
            .catch(error => {
                console.error('处理失败:', error);
                alert('转换失败: ' + error.message);
                
                // 恢复按钮状态
                btn.innerHTML = '<i class="fas fa-bolt"></i> 转换';
                btn.disabled = false;
            });
    },
    
    // 处理视频链接
    processVideoLink: function(videoUrl) {
        return new Promise((resolve, reject) => {
            // 显示加载状态
            this.showLoading(true, '准备转换...');
            
            // 如果使用模拟数据，则不需要真实API调用
            if (this.useMockData) {
                console.log('使用模拟数据...');
                
                // 检测平台
                let platform = 'Video';
                if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
                    platform = 'YouTube';
                } else if (videoUrl.includes('tiktok')) {
                    platform = 'TikTok';
                }
                
                // 生成随机ID
                const randomId = 'mock-' + Math.random().toString(36).substring(2, 10);
                
                // 模拟API调用延迟
                setTimeout(() => {
                    // 生成并保存模拟数据
                    this.generateMockTranscription(videoUrl);
                    
                    // 隐藏加载状态
                    this.showLoading(false);
                    
                    // 解析为成功
                    resolve({
                        success: true,
                        id: randomId,
                        platform: platform,
                        directToEdit: false // 设置为true会直接跳到编辑页面，false会先显示转换过程
                    });
                }, 1500);
                
                return;
            }
            
            // 如果不使用模拟数据，这里应该进行真实的API调用
            // 这部分代码在有真实API时实现
            reject(new Error('真实API尚未实现，请设置useMockData为true'));
        });
    },
    
    // 生成模拟转录结果
    generateMockTranscription: function(videoUrl) {
        console.log('生成模拟转录数据...');
        
        // 根据URL识别平台
        let platform = 'Video';
        if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
            platform = 'YouTube';
        } else if (videoUrl.includes('tiktok')) {
            platform = 'TikTok';
        }
        
        // 创建转录模拟数据
        const mockResult = {
            text: `这是一段来自${platform}视频的模拟转录文本。\n\n该视频链接为：${videoUrl}\n\n转录系统会自动识别视频中的语音内容并转换为文本。您可以在编辑区域修改这些文本，添加标点符号，或进行其他编辑。\n\n完成编辑后，您可以将文本下载为各种格式，包括TXT、DOCX或PDF。`,
            segments: [
                { start: 0, text: `这是一段来自${platform}视频的模拟转录文本。` },
                { start: 5, text: `该视频链接为：${videoUrl}` },
                { start: 10, text: "转录系统会自动识别视频中的语音内容并转换为文本。" },
                { start: 15, text: "您可以在编辑区域修改这些文本，添加标点符号，或进行其他编辑。" },
                { start: 20, text: "完成编辑后，您可以将文本下载为各种格式，包括TXT、DOCX或PDF。" }
            ],
            language: "zh-CN",
            source: videoUrl,
            platform: platform
        };
        
        // 保存到会话存储
        sessionStorage.setItem('transcription_result', JSON.stringify(mockResult));
        console.log('模拟数据已保存到sessionStorage');
    },
    
    // 开始转换监控
    startConversionMonitoring: function() {
        console.log('开始监控转换进度...');
        
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        const predictionId = urlParams.get('id');
        const platform = urlParams.get('platform') || 'Video';
        const videoUrl = urlParams.get('url') || '';
        
        if (!predictionId) {
            console.error('缺少转录ID参数');
            alert('缺少必要参数，将返回首页');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('转录ID:', predictionId);
        console.log('平台:', platform);
        console.log('视频URL:', videoUrl);
        
        // 更新页面信息
        this.updateConversionPageInfo(predictionId, platform, videoUrl);
        
        // 模拟转换进度
        this.simulateConversion(predictionId, videoUrl, platform);
    },
    
    // 更新转换页面信息
    updateConversionPageInfo: function(id, platform, url) {
        const fileNameElement = document.getElementById('file-name');
        if (fileNameElement) {
            fileNameElement.textContent = decodeURIComponent(url);
        }
        
        const fileSizeElement = document.getElementById('file-size');
        if (fileSizeElement) {
            fileSizeElement.textContent = platform + ' Video';
        }
        
        const currentStepElement = document.getElementById('current-step');
        if (currentStepElement) {
            currentStepElement.textContent = '准备转换...';
        }
    },
    
    // 模拟转换进度
    simulateConversion: function(id, url, platform) {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const currentStep = document.getElementById('current-step');
        const processedTime = document.getElementById('processed-time');
        const totalTime = document.getElementById('total-time');
        const estimatedTime = document.getElementById('estimated-time');
        
        // 设置随机总时间（模拟）
        const totalSeconds = Math.floor(Math.random() * (300 - 60 + 1)) + 60;
        if (totalTime) totalTime.textContent = this.formatTime(totalSeconds);
        
        // 模拟进度
        let progress = 0;
        let step = 1;
        
        // 步骤文本
        const steps = [
            '连接视频源...',
            '提取音频...',
            '分析语音内容...',
            '转换为文本...',
            '格式化文本...',
            '完成转换!'
        ];
        
        // 更新步骤文本
        if (currentStep) currentStep.textContent = steps[0];
        
        const interval = setInterval(() => {
            // 增加进度
            progress += Math.random() * 3 + 1; // 随机增加1-4%
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // 生成模拟转录结果
                this.generateMockTranscription(url);
                
                // 显示完成状态
                this.showCompletionState();
            }
            
            // 更新进度显示
            if (progressBar) progressBar.style.width = progress + '%';
            if (progressPercentage) progressPercentage.textContent = Math.floor(progress) + '%';
            
            // 更新时间显示
            this.updateTimeDisplays(progress, totalSeconds, processedTime, estimatedTime);
            
            // 更新步骤
            const currentStepIndex = Math.min(Math.floor(progress / (100 / (steps.length - 1))), steps.length - 1);
            if (currentStep && currentStepIndex != step) {
                step = currentStepIndex;
                currentStep.textContent = steps[currentStepIndex];
            }
        }, 500);
    },
    
    // 更新时间显示
    updateTimeDisplays: function(progress, totalSeconds, processedTimeElement, estimatedTimeElement) {
        if (processedTimeElement) {
            const processedSeconds = Math.floor((progress / 100) * totalSeconds);
            processedTimeElement.textContent = this.formatTime(processedSeconds);
        }
        
        if (estimatedTimeElement) {
            const remainingSeconds = totalSeconds - Math.floor((progress / 100) * totalSeconds);
            estimatedTimeElement.textContent = this.formatTime(remainingSeconds);
        }
    },
    
    // 格式化时间（秒 -> MM:SS）
    formatTime: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    // 显示完成状态
    showCompletionState: function() {
        // 隐藏进度相关元素
        const loadingAnimation = document.querySelector('.loading-animation');
        const progressContainer = document.querySelector('.progress-container');
        const conversionStats = document.querySelector('.conversion-stats');
        const videoInfo = document.querySelector('.video-info');
        const cancelBtn = document.getElementById('cancel-btn');
        
        if (loadingAnimation) loadingAnimation.style.display = 'none';
        if (progressContainer) progressContainer.style.display = 'none';
        if (conversionStats) conversionStats.style.display = 'none';
        if (videoInfo) videoInfo.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        
        // 显示完成状态
        const completionState = document.querySelector('.conversion-complete');
        if (completionState) completionState.style.display = 'block';
        
        // 更新状态文本
        const statusTitle = document.querySelector('.convert-status h1');
        const statusText = document.querySelector('.convert-status p');
        
        if (statusTitle) statusTitle.textContent = '处理完成';
        if (statusText) statusText.textContent = '您的视频已成功转换为文本';
        
        // 继续按钮显示
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.style.display = 'block';
            
            // 确保继续按钮跳转到编辑页面
            continueBtn.addEventListener('click', function() {
                window.location.href = 'edit.html';
            });
        }
    },
    
    // 显示/隐藏加载状态
    showLoading: function(show, message = '加载中...') {
        let loadingElement = document.getElementById('loading-overlay');
        
        if (!loadingElement) {
            // 创建加载元素
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-size: 1.2rem;
            `;
            
            const spinner = document.createElement('div');
            spinner.className = 'loading-circle';
            spinner.style.cssText = `
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 1s infinite linear;
                margin-bottom: 20px;
            `;
            
            const messageEl = document.createElement('div');
            messageEl.id = 'loading-message';
            messageEl.textContent = message;
            
            overlay.appendChild(spinner);
            overlay.appendChild(messageEl);
            document.body.appendChild(overlay);
            
            // 添加动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            loadingElement = overlay;
        } else {
            const messageEl = document.getElementById('loading-message');
            if (messageEl) messageEl.textContent = message;
        }
        
        if (show) {
            loadingElement.style.display = 'flex';
        } else {
            loadingElement.style.display = 'none';
        }
    }
};

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    VIDEO_CONVERTER.init();
});