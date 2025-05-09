/**
 * Video to Text Website Main JavaScript
 */

// 全局配置
const CONFIG = {
    // 替换为您的Worker URL
    workerUrl: "https://video-to-text-worker.staf2866.workers.dev"
};

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initTabs();
    initFileUpload();
    initForms();
    initFAQAccordion();
    initScrollAnimations();
    initVideoLinkConverter();
    
    // 修复重复元素
    const converterOptions = document.querySelector('.convert-options');
    if (converterOptions) {
        converterOptions.style.display = 'none';
    }
    
    // 添加占位用户头像
    const userAvatars = document.querySelectorAll('.testimonial-author img');
    userAvatars.forEach(img => {
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill="%23ddd"/><circle cx="25" cy="20" r="8" fill="%23fff"/><path d="M40,45 C40,34 10,34 10,45" fill="%23fff"/></svg>';
    });

    // 添加视频转文本功能
    initVideoConverters();
});

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.mobile-menu-toggle') && 
            !event.target.closest('.main-nav') && 
            mainNav && mainNav.classList.contains('active')) {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        }
    });
    
    // Close menu when clicking on nav links
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (menuToggle && mainNav) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            }
        });
    });
}

/**
 * Initialize tab switching
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

/**
 * Initialize file upload functionality
 */
function initFileUpload() {
    const fileInput = document.getElementById('video-file');
    const uploadLabel = document.querySelector('.file-upload-area label');
    const uploadForm = document.querySelector('.upload-form');
    
    if (fileInput && uploadLabel) {
        // Handle drag and drop
        ['dragover', 'dragenter'].forEach(eventType => {
            uploadLabel.addEventListener(eventType, function(e) {
                e.preventDefault();
                uploadLabel.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'dragend', 'drop'].forEach(eventType => {
            uploadLabel.addEventListener(eventType, function(e) {
                e.preventDefault();
                uploadLabel.classList.remove('drag-over');
            });
        });
        
        // Handle file drop
        uploadLabel.addEventListener('drop', function(e) {
            fileInput.files = e.dataTransfer.files;
            updateFileName(fileInput);
        });
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            updateFileName(this);
        });
        
        // Update filename display
        function updateFileName(input) {
            if (input.files && input.files[0]) {
                const fileName = input.files[0].name;
                const fileInfo = `<i class="fas fa-check-circle"></i> Selected: <strong>${fileName}</strong>`;
                
                // Check if file is a valid video format
                const fileExt = fileName.split('.').pop().toLowerCase();
                const validFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
                
                if (validFormats.includes(fileExt)) {
                    uploadLabel.innerHTML = fileInfo;
                    uploadLabel.classList.add('file-selected');
                } else {
                    uploadLabel.innerHTML = `<i class="fas fa-times-circle"></i> Invalid file format. Please select a video file.
                    <span class="file-types">Supported formats: MP4, AVI, MOV (max 100MB)</span>`;
                    uploadLabel.classList.add('file-error');
                    setTimeout(() => {
                        resetUploadArea();
                    }, 3000);
                }
            }
        }
    }
    
    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fileInput = document.getElementById('video-file');
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Please select a video file first');
                return;
            }
            
            // For now, we'll just show a notification since file upload is more complex
            alert("Currently only YouTube video links are supported. Please use the video link option instead.");
        });
    }
    
    // Function to reset upload area
    function resetUploadArea() {
        if (uploadLabel) {
            uploadLabel.innerHTML = `<i class="fas fa-cloud-upload-alt"></i>
            <span>Click to upload or drag and drop video file</span>
            <span class="file-types">Supported formats: MP4, AVI, MOV (max 100MB)</span>`;
            uploadLabel.classList.remove('file-selected', 'file-error');
        }
    }
}

/**
 * Initialize form submissions
 */
function initForms() {
    const linkForm = document.querySelector('.link-form');
    
    if (linkForm) {
        linkForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const linkInput = this.querySelector('input[type="url"]');
            const videoUrl = linkInput.value.trim();
            
            if (!videoUrl) {
                alert('Please enter a video link');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            
            // Process video URL
            processVideoUrl(videoUrl).finally(() => {
                // Reset button state if there's an error
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Start Converting';
            });
        });
    }
    
    // Handle newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (emailInput.value.trim() === '') {
                alert('Please enter your email address');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            
            // Simulate API call
            setTimeout(() => {
                alert('Thank you for subscribing!');
                emailInput.value = '';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1000);
        });
    }
}

/**
 * Initialize FAQ accordion
 */
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
            
            // Close other items
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });
        });
    });
    
    // Open first FAQ by default
    const firstFaqItem = document.querySelector('.faq-item');
    if (firstFaqItem) {
        firstFaqItem.classList.add('active');
    }
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize video link converter
 */
function initVideoLinkConverter() {
    const convertBtn = document.querySelector('.video-link-converter .convert-btn');
    const linkInput = document.querySelector('.video-link-converter .link-input');
    
    if (convertBtn && linkInput) {
        convertBtn.addEventListener('click', function() {
            const videoUrl = linkInput.value.trim();
            if (!videoUrl) {
                alert('Please enter a YouTube or TikTok video link');
                return;
            }
            
            // 显示加载状态
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            convertBtn.disabled = true;
            
            // 处理视频URL
            processVideoUrl(videoUrl).finally(() => {
                // 如果失败，重置按钮状态
                convertBtn.innerHTML = '<i class="fas fa-bolt"></i> Convert';
                convertBtn.disabled = false;
            });
        });
        
        // Add enter key support
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                convertBtn.click();
            }
        });
    }
}

/**
 * 处理视频转文本功能
 */
function initVideoConverters() {
    // 已在其他函数中处理，这里只是为了保持代码结构清晰
}

/**
 * 处理视频URL转文本
 * @param {string} videoUrl - 视频URL
 */
async function processVideoUrl(videoUrl) {
    try {
        // 显示加载状态
        showLoading(true, 'Starting transcription...');
        
        // 支持的视频网站
        const supportedPlatforms = [
            { name: 'YouTube', pattern: /youtube\.com|youtu\.be/ },
            { name: 'TikTok', pattern: /tiktok\.com/ },
            { name: 'Vimeo', pattern: /vimeo\.com/ },
            { name: 'Facebook', pattern: /facebook\.com|fb\.com/ },
            { name: 'Twitter', pattern: /twitter\.com|x\.com/ },
            { name: 'Instagram', pattern: /instagram\.com/ }
        ];
        
        // 检测平台
        const platform = supportedPlatforms.find(p => p.pattern.test(videoUrl)) || { name: 'Unknown' };
        
        // 向Worker发送请求
        const response = await fetch(`${CONFIG.workerUrl}/api/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl })
        });
        
        if (!response.ok) {
            throw new Error('Failed to start transcription');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
        }
        
        // 转到处理页面
        window.location.href = `convert.html?id=${data.id}&platform=${platform.name}&url=${encodeURIComponent(videoUrl)}`;
    } catch (error) {
        console.error('Error processing video URL:', error);
        showLoading(false);
        alert(`Error: ${error.message}`);
        
        // 确保函数返回一个rejected promise，以便调用者知道处理失败
        return Promise.reject(error);
    }
}

/**
 * 显示/隐藏加载状态
 * @param {boolean} show - 是否显示
 * @param {string} message - 加载消息
 */
function showLoading(show, message = 'Loading...') {
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
        spinner.style.marginBottom = '20px';
        
        const messageEl = document.createElement('div');
        messageEl.id = 'loading-message';
        messageEl.textContent = message;
        
        overlay.appendChild(spinner);
        overlay.appendChild(messageEl);
        document.body.appendChild(overlay);
        
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

// 将CONFIG暴露为全局变量，以便其他页面使用
window.CONFIG = CONFIG; 
