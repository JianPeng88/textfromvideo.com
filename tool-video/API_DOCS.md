# YouTube视频下载工具 API文档

本文档描述了YouTube视频下载工具的API接口，用于前端与后端的对接。

## 基础URL

所有API接口的基础URL为：`http://localhost:3000/api`

## API概览

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 健康检查 | GET | /health | 检查API服务是否正常运行 |
| 解析视频 | POST | /parse | 解析YouTube视频URL，获取视频信息 |
| 下载视频 | POST | /download | 开始下载视频 |
| 获取文件 | GET | /download/:fileName | 获取已下载的文件 |
| 获取支持格式 | GET | /formats | 获取支持的视频格式和质量 |

## 详细接口说明

### 1. 健康检查

**请求**：
```
GET /api/health
```

**响应**：
```json
{
  "success": true,
  "message": "API服务正常运行",
  "timestamp": "2023-05-20T12:00:00.000Z"
}
```

### 2. 解析视频

**请求**：
```
POST /api/parse
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "videoId": "XXXXXXXXXXX",
    "title": "视频标题",
    "author": {
      "name": "作者名称",
      "id": "作者ID",
      "avatar": "作者头像URL"
    },
    "lengthSeconds": 120,
    "viewCount": "1000",
    "thumbnailUrl": "缩略图URL",
    "videoFormats": [
      {
        "itag": 22,
        "mimeType": "video/mp4",
        "quality": "720p",
        "hasVideo": true,
        "hasAudio": true,
        "container": "mp4",
        "codecs": "avc1.64001F, mp4a.40.2",
        "contentLength": "10000000",
        "bitrate": 1500000
      }
    ],
    "audioFormats": [
      {
        "itag": 140,
        "mimeType": "audio/mp4",
        "quality": "medium",
        "hasVideo": false,
        "hasAudio": true,
        "container": "mp4",
        "codecs": "mp4a.40.2",
        "contentLength": "2000000",
        "bitrate": 128000
      }
    ]
  }
}
```

### 3. 下载视频

**请求**：
```
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "format": "mp4", // 或 "mp3"
  "quality": "720" // 可选，不指定则选择最高质量
}
```

**响应**：
```json
{
  "success": true,
  "message": "下载成功",
  "data": {
    "id": "XXXXXXXXXXX",
    "title": "视频标题",
    "author": "作者名称",
    "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "format": "mp4",
    "quality": "720",
    "fileSize": 10000000,
    "filePath": "/path/to/file.mp4",
    "fileName": "12345678-1234-1234-1234-123456789012.mp4",
    "createdAt": "2023-05-20T12:00:00.000Z",
    "expiresAt": "2023-05-20T12:30:00.000Z",
    "downloadUrl": "/api/download/12345678-1234-1234-1234-123456789012.mp4"
  }
}
```

### 4. 获取文件

**请求**：
```
GET /api/download/12345678-1234-1234-1234-123456789012.mp4
```

**响应**：
- 成功：文件内容（视频或音频）
- 失败：
```json
{
  "success": false,
  "message": "文件不存在或已过期"
}
```

### 5. 获取支持格式

**请求**：
```
GET /api/formats
```

**响应**：
```json
{
  "success": true,
  "data": {
    "videoFormats": ["mp4", "webm"],
    "audioFormats": ["mp3", "m4a"],
    "videoQualities": [
      { "name": "1080p", "value": "1080" },
      { "name": "720p", "value": "720" },
      { "name": "480p", "value": "480" },
      { "name": "360p", "value": "360" },
      { "name": "240p", "value": "240" },
      { "name": "144p", "value": "144" }
    ]
  }
}
```

## 错误处理

所有API错误都会返回一个包含`success`和`message`字段的JSON响应：

```json
{
  "success": false,
  "message": "错误描述"
}
```

常见错误代码：
- 400：请求参数错误
- 404：资源不存在
- 429：请求过多，超出限制
- 500：服务器内部错误

## 前后端对接

要将前端与后端对接，需要修改前端代码中的API调用部分：

1. 在前端创建一个API服务文件，例如`apiService.js`：

```javascript
const API_BASE_URL = 'http://localhost:3000/api';

// 解析视频
async function parseVideo(url) {
  const response = await fetch(`${API_BASE_URL}/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  return await response.json();
}

// 下载视频
async function downloadVideo(url, format, quality) {
  const response = await fetch(`${API_BASE_URL}/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, format, quality })
  });
  return await response.json();
}

// 获取支持的格式
async function getSupportedFormats() {
  const response = await fetch(`${API_BASE_URL}/formats`);
  return await response.json();
}

export {
  parseVideo,
  downloadVideo,
  getSupportedFormats
};
```

2. 然后在前端的交互代码中使用这些函数：

```javascript
import { parseVideo, downloadVideo, getSupportedFormats } from './apiService';

// 在下载按钮点击时
downloadBtn.addEventListener('click', async function() {
  try {
    // 显示加载状态
    progressSection.style.display = 'block';
    
    // 解析视频
    const parseResult = await parseVideo(videoUrlInput.value);
    
    if (!parseResult.success) {
      throw new Error(parseResult.message);
    }
    
    // 获取选中的格式
    const format = document.querySelector('input[name="format"]:checked').value;
    
    // 下载视频
    const downloadResult = await downloadVideo(videoUrlInput.value, format);
    
    if (!downloadResult.success) {
      throw new Error(downloadResult.message);
    }
    
    // 显示下载选项
    progressSection.style.display = 'none';
    
    // 显示视频信息和下载链接
    showResults(downloadResult.data);
  } catch (error) {
    alert(`下载失败: ${error.message}`);
    progressSection.style.display = 'none';
  }
});
```

通过以上步骤，就可以将前端与后端成功对接，实现完整的YouTube视频下载功能。 