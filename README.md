# Video to Text Website Project

## Project Overview
This is a video-to-text conversion website, similar to yt1d.com and turboscribe.ai. Users can upload videos or provide video links, and the website will automatically convert speech in the videos to text, with download functionality.

## Functional Requirements
1. **Video Upload/Link Provision**: Users can upload local video files or provide video links from platforms like YouTube
2. **Video to Text Conversion**: Using API to convert speech in videos to text
3. **Text Editing**: Users can preview and edit the converted text before downloading
4. **Text Download**: Support downloading converted text in multiple formats (TXT, PDF, DOCX, etc.)
5. **History Records**: Users can view their conversion history (optional, requires user registration)

## Page Structure

### 1. Home Page (index.html)
- Top navigation bar: logo, main feature links, login/register buttons
- Banner area: showcasing the main features and value proposition
- Video input area: form for uploading files or entering links
- Feature introduction area: explaining steps and main functions
- User reviews/usage data area: displaying user testimonials and usage statistics
- Footer area: website information, contact details, terms, etc.

### 2. Conversion Page (convert.html)
- Conversion progress display
- Cancel button
- Loading animation

### 3. Edit Page (edit.html)
- Text editor
- Timestamp markers
- Download options
- Save button

### 4. User Center (user.html, optional)
- User information
- History records
- Account settings

## Technology Stack

### Frontend Technology
- HTML5: Building the webpage structure
- CSS3: Designing responsive interfaces using Flexbox and Grid layouts
- JavaScript: Implementing interactive functions
- Using Fetch API for AJAX requests

### Backend Technology (assuming third-party API calls from frontend code)
- Using third-party speech recognition APIs (like Google Speech-to-Text, Azure Speech Services, etc.)

## Design Style
- Modern minimalist style
- Main color scheme: Blue series (#3498db, #2980b9)
- Secondary colors: White, light gray
- Font: System default sans-serif font, ensuring cross-platform consistency
- Responsive design, adaptive to desktop and mobile devices

## Project Structure
```
/
├── index.html          # Home page
├── convert.html        # Conversion page
├── edit.html           # Edit page
├── user.html           # User center (optional)
├── css/
│   ├── style.css       # Main stylesheet
│   ├── responsive.css  # Responsive styles
│   └── animations.css  # Animation effects
├── js/
│   ├── main.js         # Main JavaScript functions
│   ├── converter.js    # Conversion related functions
│   ├── editor.js       # Editor functions
│   └── api.js          # API interaction functions
└── assets/
    ├── images/         # Image resources
    ├── icons/          # Icon resources
    └── fonts/          # Font resources (if needed)
```

## Development Phases
1. **Phase One**: Page structure and style development
2. **Phase Two**: Basic interactive function implementation
3. **Phase Three**: API integration, implementing conversion functionality
4. **Phase Four**: User experience refinement and detail optimization

## Notes
- Ensure the website has a good user experience
- Focus on page loading speed and performance optimization
- Consider data security and privacy protection
- Compatible with mainstream browsers (Chrome, Firefox, Safari, Edge) 
