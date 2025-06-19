# Spray - Modern Flask Web Application

A beautiful and modern web application built with Python Flask, featuring a responsive design and interactive user interface.

## 🤖 Built with AI - Cursor Development Showcase

This entire application was built using **Cursor AI** with natural language instructions - demonstrating the power of AI-assisted development without traditional coding. Here are some real examples of user requests that built this app:

### 🗣️ Natural Language Commands Used:

**Initial Setup:**
- *"Create a Flask web application for tracking tongue spray medication"*
- *"Add a medical-style interface with tongue diagram showing spray locations"*
- *"Make it a PWA that works offline on mobile devices"*

**Feature Development:**
- *"Add schedule alerts that fire both offline and online when spray schedules are due"*
- *"The color of the text for the links to history and schedule etc at the top of the page are a little hard to see. Can we change the color and make it a little brighter"*
- *"Add keyboard shortcuts so users can press 1, 2, or 3 to quickly record sprays"*

**Bug Fixes:**
- *"There's a problem with the scheduler where editing interval hours doesn't reflect in UI and incorrectly shows 'spray was logged' message"*
- *"The PWA app on the iPhone does not refresh its cached HTML. How can we force this?"*

**UI Improvements:**
- *"The blue blends into the background color - there needs to be greater contrast"*
- *"Once selected the button color makes the text unreadable"*

### 📈 Development Results:

- **🏗️ Complete Application**: Full-featured medical tracking app with PWA capabilities
- **⚡ Rapid Development**: Built in hours, not days or weeks
- **🎨 Professional UI**: Modern, responsive design with accessibility features
- **📱 Cross-Platform**: Works on desktop, mobile, and as a PWA
- **🔧 Complex Features**: Service workers, offline functionality, push notifications, keyboard shortcuts
- **🐛 Bug Resolution**: Real-time debugging and fixes through natural language

### 💡 Key Takeaways:

1. **No Coding Required**: Complex features implemented through conversational instructions
2. **Iterative Improvement**: Easy refinements and bug fixes through natural feedback
3. **Professional Quality**: Production-ready code with proper error handling and best practices
4. **Rapid Prototyping**: From concept to working application in minimal time
5. **Domain Expertise**: AI understood medical app requirements and implemented appropriate solutions

This project demonstrates how **Cursor AI transforms software development**, making it accessible to anyone who can describe what they want to build.

## 🚀 Features

### 💊 Medical Tracking
- **Tongue Spray Tracker**: Visual tongue diagram with 4 spray locations
- **Medication Scheduling**: Customizable spray intervals and timing
- **Usage History**: Complete log of all spray applications with timestamps
- **Cycle Tracking**: Automatic progression through spray locations

### 📱 Progressive Web App (PWA)
- **Offline Functionality**: Works completely offline with local data storage
- **Mobile Optimized**: Install as native app on iOS/Android
- **Push Notifications**: Schedule alerts and reminders
- **Background Sync**: Data synchronization when connection restored

### 🔔 Smart Alerts
- **Schedule Reminders**: Notifications 5 minutes before spray time
- **Overdue Alerts**: Visual and audio alerts for missed doses
- **Multiple Alert Types**: Browser notifications, visual overlays, toast messages
- **Snooze Functionality**: 5-minute snooze option for reminders

### ⌨️ User Experience
- **Keyboard Shortcuts**: Press 1, 2, or 3 to quickly record sprays
- **Touch-Friendly**: Large buttons optimized for mobile use
- **Visual Feedback**: Clear indication of next spray location
- **Accessibility**: Screen reader compatible with proper ARIA labels

### 🛠️ Technical Features
- **Service Worker**: Advanced caching and offline capabilities
- **Responsive Design**: Bootstrap 5 with custom medical styling
- **Data Persistence**: JSON-based data storage with automatic backups
- **Cross-Platform**: Works on desktop, mobile, and as installed PWA

## 📁 Project Structure

```
spray/
├── app.py                    # Main Flask application with medical tracking logic
├── requirements.txt          # Python dependencies
├── README.md                # Project documentation
├── MOBILE_DEPLOYMENT.md     # Mobile PWA deployment guide
├── OFFLINE_DEPLOYMENT.md    # Offline deployment instructions
├── offline.html             # Standalone offline version
├── templates/               # HTML templates
│   ├── base.html           # Base template with navigation
│   ├── dashboard.html      # Main tracking interface with tongue diagram
│   ├── history.html        # Spray usage history
│   └── schedule.html       # Medication scheduling interface
└── static/                 # Static files
    ├── css/
    │   ├── style.css       # Original CSS (legacy)
    │   └── medical-style.css # Medical app styling
    ├── js/
    │   ├── main.js         # Original JavaScript (legacy)
    │   ├── medical-app.js  # Medical tracking functionality
    │   └── offline-app.js  # Offline version functionality
    ├── manifest.json       # PWA manifest
    └── service-worker.js   # Service worker for offline functionality
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation Steps

1. **Clone or download the project files**
   ```bash
   # If you have the files, navigate to the project directory
   cd spray
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:8000` to view the application
   
   **Available Routes:**
   - `http://localhost:8000/` - Main medical tracking dashboard
   - `http://localhost:8000/history` - View spray usage history
   - `http://localhost:8000/schedule` - Configure medication schedule
   - `http://localhost:8000/offline` - Offline-capable version

6. **Install as PWA (Optional)**
   - On mobile devices, use "Add to Home Screen" option
   - On desktop, look for the install icon in the address bar

## 🎨 Design Features

### Dashboard Interface
- **Tongue Diagram**: Interactive SVG showing 4 spray locations with visual indicators
- **Next Location Highlight**: Clear indication of where to spray next
- **Quick Actions**: Large, touch-friendly buttons for spray recording
- **Status Display**: Current cycle, total sprays, and schedule information

### Medical Styling
- **Professional Theme**: Clean, medical-grade interface design
- **High Contrast**: Accessible color scheme for visibility
- **Icon Integration**: Medical and UI icons from Font Awesome
- **Responsive Layout**: Optimized for both desktop and mobile medical use

### Interactive Elements
- **Visual Feedback**: Immediate confirmation of spray recordings
- **Hover Effects**: Subtle animations for better user experience
- **Alert Overlays**: Non-intrusive notification system
- **Touch Optimization**: Finger-friendly interface for mobile devices

### Progressive Web App Features
- **Offline Indicators**: Clear status of online/offline mode
- **Installation Prompts**: Guided PWA installation process
- **Native Feel**: App-like experience when installed
- **Background Updates**: Seamless content updates via service worker

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `static/css/style.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    /* Add your custom colors here */
}
```

### Adding New Pages
1. Create a new HTML template in the `templates/` folder
2. Add a new route in `app.py`:
```python
@app.route('/new-page')
def new_page():
    return render_template('new-page.html')
```

### Modifying Content
- Edit the HTML files in the `templates/` folder
- Update text, images, and links as needed
- Add new sections following the existing structure

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Local Development
The application runs in debug mode by default for development.

### Production Deployment
For production deployment, consider:
- Setting `debug=False` in `app.py`
- Using a production WSGI server like Gunicorn
- Setting up environment variables for configuration
- Using a reverse proxy like Nginx

Example with Gunicorn:
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 app:app
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process using port 5000
sudo lsof -t -i tcp:5000 | xargs kill -9
```

**Module not found errors**
```bash
# Ensure you're in the virtual environment and dependencies are installed
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

**Template not found**
- Ensure the `templates/` folder exists in the same directory as `app.py`
- Check that template file names match the ones referenced in `app.py`

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the Flask documentation: https://flask.palletsprojects.com/
3. Open an issue in the project repository

---

**Built with ❤️ using Flask and modern web technologies** 