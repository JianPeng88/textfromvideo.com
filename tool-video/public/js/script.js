document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const urlInput = document.getElementById('video-url');
    const parseBtn = document.getElementById('parse-btn');
    const clearBtn = document.getElementById('clear-btn');
    const charCount = document.getElementById('char-count');
    const charLimit = document.getElementById('char-limit');
    const pasteBtn = document.getElementById('paste-btn');
    const advancedBtn = document.getElementById('advanced-btn');
    const advancedPanel = document.getElementById('advanced-panel');
    const downloadBtn = document.getElementById('download-btn');
    const resultSection = document.getElementById('result-section');
    const progressSection = document.getElementById('progress-section');
    const progressBar = document.getElementById('progress-bar');
    const progressStatus = document.getElementById('progress-status');
    const videoInfoTitle = document.getElementById('video-info-title');
    const videoInfoAuthor = document.getElementById('video-info-author');
    const videoInfoViews = document.getElementById('video-info-views');
    const videoPreview = document.getElementById('video-preview');
    const downloadOptions = document.getElementById('download-options');
    
    // 转录相关DOM元素
    const enableTranscription = document.getElementById('enableTranscription');
    const transcriptionSettings = document.getElementById('transcriptionSettings');
    const transcriptionLanguage = document.getElementById('transcriptionLanguage');
    const fastTranscription = document.getElementById('fastTranscription');
    const transcriptionSection = document.getElementById('transcriptionSection');
    const transcriptionStatus = document.getElementById('transcriptionStatus');
    const transcriptionProgressBar = document.getElementById('transcriptionProgressBar');
    const transcriptionProgressPercent = document.getElementById('transcriptionProgressPercent');
    const transcriptionContent = document.getElementById('transcriptionContent');
    const copyTranscriptionBtn = document.getElementById('copyTranscriptionBtn');
    const downloadTranscriptionBtn = document.getElementById('downloadTranscriptionBtn');

    // 存储全局变量
    let currentVideoId = '';
    let currentVideoTitle = '';
    let currentTranscriptionId = '';
    let transcriptionCheckInterval = null;

    // 初始化
    const MAX_CHARS = 500;
    charLimit.textContent = MAX_CHARS;

    // URL输入框字符计数
    urlInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > MAX_CHARS) {
            this.value = this.value.substring(0, MAX_CHARS);
            charCount.textContent = MAX_CHARS;
        }
    });

    // 清除按钮
    clearBtn.addEventListener('click', function() {
        urlInput.value = '';
        charCount.textContent = '0';
        resultSection.style.display = 'none';
        transcriptionSection.style.display = 'none';
    });

    // 粘贴按钮
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text.substring(0, MAX_CHARS);
            charCount.textContent = urlInput.value.length;
        } catch(err) {
            alert('无法访问剪贴板，请手动粘贴链接');
            console.error('无法访问剪贴板:', err);
        }
    });

    // 高级设置按钮
    advancedBtn.addEventListener('click', function() {
        if (advancedPanel.style.display === 'none' || advancedPanel.style.display === '') {
            advancedPanel.style.display = 'block';
            advancedBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> 隐藏设置';
        } else {
            advancedPanel.style.display = 'none';
            advancedBtn.innerHTML = '<i class="fas fa-cog"></i> 高级设置';
        }
    });

    // 转录功能开关
    enableTranscription.addEventListener('change', function() {
        if (this.checked) {
            transcriptionSettings.style.display = 'block';
        } else {
            transcriptionSettings.style.display = 'none';
        }
    });

    // 复制转录内容
    copyTranscriptionBtn.addEventListener('click', function() {
        const textToCopy = transcriptionContent.textContent;
        if (textToCopy.trim() !== '') {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // 显示复制成功提示
                    this.innerHTML = '<i class="fas fa-check"></i> 已复制';
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-copy"></i> 复制文本';
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    alert('复制失败，请手动选择文本并复制');
                });
        }
    });

    // 下载转录文本
    downloadTranscriptionBtn.addEventListener('click', function() {
        const textToDownload = transcriptionContent.textContent;
        if (textToDownload.trim() !== '') {
            const blob = new Blob([textToDownload], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentVideoTitle || 'transcription'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // 解析视频信息
    parseBtn.addEventListener('click', function() {
        const url = urlInput.value.trim();
        if (!url) {
            alert('请输入有效的YouTube视频链接');
            return;
        }

        // 显示进度条
        progressSection.style.display = 'block';
        resultSection.style.display = 'none';
        transcriptionSection.style.display = 'none';
        progressBar.style.width = '0%';
        progressStatus.textContent = '正在解析视频信息...';

        // 动画进度条
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += 5;
                progressBar.style.width = `${progress}%`;
            }
        }, 300);

        // 获取视频信息
        apiService.getVideoInfo(url)
            .then(data => {
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressStatus.textContent = '解析完成!';
                
                // 存储视频ID和标题
                currentVideoId = data.videoId;
                currentVideoTitle = data.title;

                // 显示视频信息
                videoInfoTitle.textContent = data.title;
                videoInfoAuthor.textContent = data.author;
                videoInfoViews.textContent = formatViews(data.views);
                
                // 设置视频预览
                if (data.previewUrl) {
                    videoPreview.innerHTML = `<video controls><source src="${data.previewUrl}" type="video/mp4"></video>`;
                } else {
                    videoPreview.innerHTML = `<img src="${data.thumbnailUrl}" alt="${data.title}">`;
                }
                
                // 生成下载选项
                generateDownloadOptions(data.formats);
                
                // 显示结果区域
                resultSection.style.display = 'block';

                // 如果启用了转录，启动转录流程
                if (enableTranscription.checked) {
                    startTranscription(url);
                }
            })
            .catch(error => {
                clearInterval(progressInterval);
                progressBar.style.width = '100%';
                progressStatus.textContent = '解析失败!';
                alert(`获取视频信息失败: ${error.message}`);
                console.error('获取视频信息失败:', error);
            });
    });

    // 启动转录流程
    function startTranscription(url) {
        // 显示转录区域和进度条
        transcriptionSection.style.display = 'block';
        transcriptionProgressBar.style.width = '0%';
        transcriptionProgressPercent.textContent = '0';
        transcriptionContent.innerHTML = '<p class="text-muted">准备开始转录...</p>';

        // 获取转录设置
        const language = transcriptionLanguage.value;
        const fastMode = fastTranscription.checked;

        // 调用转录API
        apiService.transcribeVideo(url, language, fastMode)
            .then(data => {
                currentTranscriptionId = data.id;
                
                // 开始定期检查转录状态
                checkTranscriptionStatus();
            })
            .catch(error => {
                transcriptionContent.innerHTML = `<p class="text-danger">启动转录失败: ${error.message}</p>`;
                console.error('启动转录失败:', error);
            });
    }

    // 检查转录状态
    function checkTranscriptionStatus() {
        if (!currentTranscriptionId) return;
        
        // 清除之前的检查间隔
        if (transcriptionCheckInterval) {
            clearInterval(transcriptionCheckInterval);
        }

        // 设置定期检查
        transcriptionCheckInterval = setInterval(() => {
            apiService.getTranscriptionStatus(currentTranscriptionId)
                .then(data => {
                    // 更新进度条
                    const progress = data.progress || 0;
                    transcriptionProgressBar.style.width = `${progress}%`;
                    transcriptionProgressPercent.textContent = Math.round(progress);

                    // 检查状态
                    if (data.status === 'completed') {
                        // 转录完成
                        clearInterval(transcriptionCheckInterval);
                        transcriptionProgressBar.style.width = '100%';
                        transcriptionProgressPercent.textContent = '100';
                        
                        // 显示转录内容
                        if (data.text) {
                            transcriptionContent.textContent = data.text;
                        } else {
                            transcriptionContent.innerHTML = '<p>未找到转录内容。</p>';
                        }
                    } else if (data.status === 'failed') {
                        // 转录失败
                        clearInterval(transcriptionCheckInterval);
                        transcriptionContent.innerHTML = `<p class="text-danger">转录失败: ${data.error || '未知错误'}</p>`;
                    }
                })
                .catch(error => {
                    console.error('检查转录状态失败:', error);
                    // 不终止检查，可能是临时网络问题
                });
        }, 5000); // 每5秒检查一次
    }

    // 格式化观看次数
    function formatViews(views) {
        if (!views) return '未知';
        
        if (views >= 1000000) {
            return `${(views / 1000000).toFixed(1)}百万 次观看`;
        } else if (views >= 1000) {
            return `${(views / 1000).toFixed(1)}千 次观看`;
        } else {
            return `${views} 次观看`;
        }
    }

    // 生成下载选项
    function generateDownloadOptions(formats) {
        if (!formats || formats.length === 0) {
            downloadOptions.innerHTML = '<p>无可用下载选项</p>';
            return;
        }
        
        downloadOptions.innerHTML = '';
        
        // 过滤和排序格式
        const videoFormats = formats.filter(f => f.hasVideo).sort((a, b) => b.quality - a.quality);
        const audioFormats = formats.filter(f => !f.hasVideo).sort((a, b) => b.bitrate - a.bitrate);
        
        // 添加视频格式
        videoFormats.forEach(format => {
            const option = document.createElement('button');
            option.className = 'download-option';
            option.innerHTML = `
                <i class="fas fa-film"></i> 
                ${format.qualityLabel || '未知'} 
                ${format.container || ''} 
                ${format.hasAudio ? '(有声音)' : '(无声音)'}
            `;
            option.addEventListener('click', () => {
                downloadFormat(format.url, `${currentVideoTitle}.${format.container}`);
            });
            downloadOptions.appendChild(option);
        });
        
        // 添加音频格式
        audioFormats.forEach(format => {
            const option = document.createElement('button');
            option.className = 'download-option';
            option.innerHTML = `
                <i class="fas fa-music"></i> 
                音频 ${format.container || ''} 
                ${format.audioBitrate ? `${format.audioBitrate}kbps` : ''}
            `;
            option.addEventListener('click', () => {
                downloadFormat(format.url, `${currentVideoTitle}.${format.container}`);
            });
            downloadOptions.appendChild(option);
        });
    }

    // 下载指定格式
    function downloadFormat(url, filename) {
        // 通知用户开始下载
        alert('开始下载文件，请在浏览器下载管理器中查看进度');
        
        // 创建一个临时链接并点击它来启动下载
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}); 