# Spray - Modern Flask Web Application

A beautiful and modern web application built with Python Flask, featuring a responsive design and interactive user interface.

## 🚀 Features

- **Modern Design**: Clean, professional interface with gradient backgrounds and smooth animations
- **Responsive Layout**: Optimized for all devices (desktop, tablet, mobile)
- **Interactive Elements**: Smooth scrolling, hover effects, and engaging animations
- **Bootstrap Integration**: Utilizing Bootstrap 5 for consistent and responsive design
- **Font Awesome Icons**: Beautiful icons throughout the application
- **Flask Backend**: Lightweight and efficient Python web framework

## 📁 Project Structure

```
spray/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── templates/            # HTML templates
│   ├── base.html         # Base template with navigation and footer
│   ├── index.html        # Landing page
│   └── about.html        # About page
└── static/               # Static files
    ├── css/
    │   └── style.css     # Custom CSS styles
    └── js/
        └── main.js       # JavaScript functionality
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
   Navigate to `http://localhost:5000` to view the application

## 🎨 Design Features

### Landing Page
- **Hero Section**: Eye-catching gradient background with call-to-action buttons
- **Features Section**: Highlighting key application features with icons
- **Call-to-Action**: Encouraging user engagement
- **Contact Section**: Easy-to-find contact information

### About Page
- **Company Story**: Information about the application and its purpose
- **Statistics**: Key metrics and achievements
- **Technology Stack**: Technologies used in the application

### Interactive Elements
- **Smooth Scrolling**: Seamless navigation between sections
- **Hover Effects**: Interactive cards and buttons
- **Animations**: Fade-in animations for content sections
- **Responsive Navigation**: Mobile-friendly navigation menu

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