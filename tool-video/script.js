/**
 * YouTube视频下载工具
 * 实现功能：视频链接解析、进度显示、验证码生成、下载选项展示等
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
	// 获取DOM元素
	const videoUrlInput = document.getElementById('videoUrl');
	const remainingCharsElement = document.getElementById('remainingChars');
	const clearBtn = document.getElementById('clearBtn');
	const pasteBtn = document.getElementById('pasteBtn');
	const progressSection = document.getElementById('progressSection');
	const progressBar = document.getElementById('progressBar');
	const progressPercent = document.getElementById('progressPercent');
	const estimatedTime = document.getElementById('estimatedTime');
	const captchaInput = document.getElementById('captchaInput');
	const captchaText = document.getElementById('captchaText');
	const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
	const advancedBtn = document.getElementById('advancedBtn');
	const downloadBtn = document.getElementById('downloadBtn');
	const advancedPanel = document.getElementById('advancedPanel');
	const resultSection = document.getElementById('resultSection');
	const authorAvatar = document.getElementById('authorAvatar');
	const authorName = document.getElementById('authorName');
	const videoTitle = document.getElementById('videoTitle');
	const videoPreview = document.getElementById('videoPreview');
	const downloadOptions = document.getElementById('downloadOptions');
	const historyBtn = document.getElementById('historyBtn');

	// 当前验证码
	let currentCaptcha = captchaText.textContent;

	// 模拟的视频数据
	const sampleVideoData = {
		formats: [
		    { resolution: '1080x1920', size: '7.69M', url: '#', quality: 'HD' },
		    { resolution: '1080x1920', size: '4.21M', url: '#', quality: 'HD' },
		    { resolution: '1080x1920', size: '3.55M', url: '#', quality: 'HD' },
		    { resolution: '720x1280', size: '4.70M', url: '#', quality: 'HD' },
		    { resolution: '720x1280', size: '3.39M', url: '#', quality: 'HD' },
		    { resolution: '720x1280', size: '2.99M', url: '#', quality: 'HD' },
		    { resolution: '720x1280', size: '2.78M', url: '#', quality: 'HD' },
		    { resolution: '720x1280', size: '2.33M', url: '#', quality: 'HD' },
		    { resolution: '608x1080', size: '1.77M', url: '#', quality: 'SD' },
		    { resolution: '608x1080', size: '1.00M', url: '#', quality: 'SD' },
		    { resolution: '608x1080', size: '0.91M', url: '#', quality: 'SD' },
		    { resolution: '480x854', size: '1.18M', url: '#', quality: 'SD' },
		    { resolution: '480x854', size: '1.03M', url: '#', quality: 'SD' },
		    { resolution: '360x640', size: '1.40M', url: '#', quality: 'SD' },
		    { resolution: '360x640', size: '0.70M', url: '#', quality: 'SD' },
		    { resolution: '360x640', size: '0.63M', url: '#', quality: 'SD' },
		    { resolution: '360x640', size: '0.39M', url: '#', quality: 'SD' },
		    { resolution: '240x426', size: '0.38M', url: '#', quality: 'SD' },
		    { resolution: '240x426', size: '0.23M', url: '#', quality: 'SD' },
		    { resolution: '240x426', size: '0.22M', url: '#', quality: 'SD' },
		    { resolution: '144x256', size: '0.19M', url: '#', quality: 'SD' }
		],
		audioFormats: [
		    { quality: '高品质', size: '0.30M', url: '#' },
		    { quality: '高品质', size: '0.30M', url: '#' },
		    { quality: '高品质', size: '0.29M', url: '#' },
		    { quality: '中品质', size: '0.29M', url: '#' },
		    { quality: '中品质', size: '0.16M', url: '#' },
		    { quality: '中品质', size: '0.16M', url: '#' },
		    { quality: '低品质', size: '0.12M', url: '#' },
		    { quality: '低品质', size: '0.12M', url: '#' }
		],
		title: 'Makeup Magic 🎭',
		author: '@Sofiaelizalde46',
		authorImg: 'https://yt3.googleusercontent.com/ytc/APkrFKbL5WMN4AS8YlJ5n7RQHGAt8zcgmDLZQXs1FCpsMQ=s176-c-k-c0x00ffffff-no-rj',
		previewUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
	};

	// 字符计数器功能
	videoUrlInput.addEventListener('input', function() {
		const maxChars = 500;
		const remainingChars = maxChars - this.value.length;
		remainingCharsElement.textContent = remainingChars;
	});

	// 清空按钮功能
	clearBtn.addEventListener('click', function() {
		videoUrlInput.value = '';
		remainingCharsElement.textContent = '500';
	});

	// 粘贴按钮功能
	pasteBtn.addEventListener('click', async function() {
		try {
			const text = await navigator.clipboard.readText();
			videoUrlInput.value = text;
			// 更新字符计数
			const maxChars = 500;
			const remainingChars = maxChars - text.length;
			remainingCharsElement.textContent = remainingChars;
		} catch (err) {
			console.error('无法读取剪贴板内容: ', err);
			alert('无法访问剪贴板，请手动粘贴链接。');
		}
	});

	// 刷新验证码
	refreshCaptchaBtn.addEventListener('click', function() {
		// 生成4位随机数字
		currentCaptcha = Math.floor(1000 + Math.random() * 9000).toString();
		captchaText.textContent = currentCaptcha;
	});

	// 高级设置按钮
	advancedBtn.addEventListener('click', function() {
		advancedPanel.style.display = advancedPanel.style.display === 'none' ? 'block' : 'none';
	});

	// 下载按钮功能
	downloadBtn.addEventListener('click', async function() {
		// 检查URL是否为空
		if (!videoUrlInput.value.trim()) {
			alert('请输入YouTube视频链接');
			return;
		}

		// 验证码检查
		if (captchaInput.value !== currentCaptcha) {
			alert('验证码错误，请重新输入');
			return;
		}

		// 显示进度条
		progressSection.style.display = 'block';

		// 获取选中的格式
		const format = document.querySelector('input[name="format"]:checked').value;

		// 下载视频
		const downloadResult = await downloadVideo(videoUrlInput.value, format);

		sampleVideoData.previewUrl = downloadResult.data

		if (downloadResult.code !== 1) {
			throw new Error(downloadResult.msg);
		}

		// 模拟解析进度
		let progress = 0;
		const interval = setInterval(function() {
			progress += 2;
			progressBar.style.width = progress + '%';
			progressPercent.textContent = progress;

			if (progress >= 100) {
				clearInterval(interval);
				// 显示解析结果
				setTimeout(function() {
					progressSection.style.display = 'none';
					showResults(sampleVideoData);
				}, 500);
			}
		}, 100);
	});

	// 历史按钮功能
	historyBtn.addEventListener('click', function() {
		// 在真实应用中，这里应该跳转到历史记录页面或显示历史记录
		alert('历史记录功能在实际应用中将显示用户的下载历史');
	});

	// 显示解析结果
	function showResults(data) {
		// 显示结果区域
		resultSection.style.display = 'block';

		// 设置视频信息
		authorName.textContent = data.author;
		videoTitle.textContent = data.title;
		authorAvatar.src = data.authorImg;

		// 设置视频预览
		// 注意：真实应用中，这里应该设置为实际解析到的视频预览URL
		videoPreview.src = data.previewUrl;

		// 清空下载选项
		downloadOptions.innerHTML = '';

		// 获取选中的格式
		const selectedFormat = document.querySelector('input[name="format"]:checked').value;

		// 添加下载选项
		if (selectedFormat === 'mp4') { 
			// 添加视频下载选项
			data.formats.forEach(format => {
				const button = document.createElement('button');
				button.className = 'download-option';
				button.textContent = `Download [${format.resolution}] ${format.size}`;

				button.addEventListener('click', function() {
					alert(`正在下载 ${format.resolution} 格式的视频，大小：${format.size}`);
					
					// ✅ 真实下载逻辑开始
					const downloadFile = async () => {
						try {
							// 方案1：直接下载（适用于同源或CORS允许的静态文件）
							const link = document.createElement('a');
							link.href = data.previewUrl; // 使用接口返回的真实URL
							link.download = `video_${format.resolution}.mp4`; // 设置文件名
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						} catch (error) {
							console.error('下载失败:', error);
							alert(`下载失败: ${error.message}`);
						}
					};

					// 启动下载流程
					downloadFile();
				});
				downloadOptions.appendChild(button);
			});
		} else {
			// 添加音频下载选项
			data.audioFormats.forEach(format => {
				const button = document.createElement('button');
				button.className = 'download-option';
				button.innerHTML = `Download [<i class="fas fa-music"></i>mp3] ${format.size}`;
				button.addEventListener('click', function() {
					// 在实际应用中，这里应该触发真实的下载
					alert(`正在下载 ${format.quality} 品质的MP3，大小：${format.size}`);
					
					// ✅ 真实下载逻辑开始
					const downloadFile = async () => {
						try {
							// 方案1：直接下载（适用于同源或CORS允许的静态文件）
							const link = document.createElement('a');
							link.href = data.previewUrl; // 使用接口返回的真实URL
							link.download = `video_${format.resolution}.mp3`; // 设置文件名
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);
						} catch (error) {
							console.error('下载失败:', error);
							alert(`下载失败: ${error.message}`);
						}
					};
					
					// 启动下载流程
					downloadFile();
				});
				downloadOptions.appendChild(button);
			});
		}
	}

	// 生成初始验证码
	refreshCaptchaBtn.click();

	// 检测YouTube链接格式
	function isValidYouTubeUrl(url) {
		// 支持的YouTube链接格式
		const patterns = [
			/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
			/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})$/,
			/^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})$/,
			/^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})$/
		];

		return patterns.some(pattern => pattern.test(url));
	}
});