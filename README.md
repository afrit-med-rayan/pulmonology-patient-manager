# Patient Management System

A comprehensive local patient management web application designed specifically for Dr. S. Sahboub's pulmonology practice. The application provides secure, offline functionality for managing patient records with complete data privacy.

## 🏥 Features

### Core Functionality

- **Patient Record Management**: Create, view, edit, and delete patient records
- **Visit Tracking**: Manage multiple visits per patient with detailed medical information
- **Advanced Search**: Search patients by name, residence, or other criteria
- **Data Persistence**: All data stored locally for complete privacy
- **Intelligent Logout**: Prevents data loss with unsaved changes detection

### Security & Privacy

- **Local Storage Only**: No data transmitted over the internet
- **Secure Authentication**: Password-protected access
- **Session Management**: Automatic logout for security
- **Data Validation**: Comprehensive input validation and sanitization

### User Experience

- **Professional Medical Interface**: Clean, intuitive design for healthcare professionals
- **Responsive Design**: Works on desktop and tablet devices
- **Logo Integration**: Custom branding with Dr. S. Sahboub's logo
- **Error Handling**: User-friendly error messages and recovery options
- **Performance Optimized**: Fast loading and responsive interactions

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Local web server (Python, Node.js, or similar)

### Installation

1. **Download the Application**

   ```bash
   # Clone or download the application files
   git clone [repository-url]
   cd patient-management-system
   ```

2. **Start Local Web Server**

   **Option A: Python (if installed)**

   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Node.js (if installed)**

   ```bash
   npx serve .
   ```

   **Option C: PHP (if installed)**

   ```bash
   php -S localhost:8000
   ```

3. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:8000`
   - Login with the default credentials (see Authentication section)

### Default Login Credentials

- **Username**: `dr.sahboub`
- **Password**: `pneumo2024`

> ⚠️ **Important**: Change the default password after first login for security.

## 📁 Project Structure

```
patient-management-system/
├── index.html                 # Main application entry point
├── css/                      # Stylesheets
│   ├── reset.css            # CSS reset
│   ├── base.css             # Base styles and variables
│   ├── components.css       # UI component styles
│   └── layout.css           # Layout and responsive design
├── js/                      # JavaScript files
│   ├── app.js              # Main application logic
│   ├── components/         # Application components
│   │   ├── AuthenticationManager.js
│   │   ├── PatientManager.js
│   │   ├── DataStorageManager.js
│   │   ├── FormManager.js
│   │   ├── UIRouter.js
│   │   └── ...
│   ├── models/             # Data models
│   │   ├── Patient.js
│   │   └── Session.js
│   ├── utils/              # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validation.js
│   └── tests/              # Test files
├── assets/                 # Application assets
│   ├── logo.svg           # Primary logo (SVG format)
│   ├── logo.png           # Fallback logo (PNG format)
│   └── logo-fallback.svg  # Text-based logo fallback
└── data/                  # Local data storage (created automatically)
```

## 🔧 Configuration

### Logo Customization

1. Replace `assets/logo.svg` with your custom logo (SVG format recommended)
2. Replace `assets/logo.png` with PNG version for fallback
3. Logos should be optimized for web use (max 200px width recommended)

### Authentication Settings

- Default credentials are set in `js/components/AuthenticationManager.js`
- To change credentials, modify the authentication logic in the component
- Consider implementing more secure authentication for production use

### Data Storage Location

- Patient data is stored in browser's localStorage
- Backup files are created in the `data/` directory
- Data persists across browser sessions but not across different browsers

## 📖 User Guide

### Getting Started

1. **Login**: Use the provided credentials to access the system
2. **Dashboard**: Overview of system functions and quick statistics
3. **Create Patient**: Add new patient records with comprehensive information
4. **Search Patients**: Find existing patients by name or other criteria
5. **Manage Records**: View, edit, or delete patient information as needed

### Patient Record Management

#### Creating a New Patient

1. Click "Create New Patient" from the dashboard
2. Fill in required information:
   - First Name and Last Name (required)
   - Date of Birth (required)
   - Place of Residence (required)
   - Gender (required)
3. Add visit information:
   - Visit Date
   - Medications Prescribed
   - Observations and Notes
   - Additional Comments
4. Click "Save Patient" to store the record

#### Searching for Patients

1. Use the search bar on the main page
2. Search by:
   - First name or last name
   - Partial names (e.g., "John" will find "Johnson")
   - Place of residence
3. Results appear in real-time as you type
4. Click on any result to view full patient details

#### Editing Patient Records

1. Find and select the patient record
2. Click "Edit" button
3. Modify any information as needed
4. Add new visits or update existing ones
5. Click "Save Changes" to update the record

#### Managing Visits

- Each patient can have multiple visits recorded
- Visits are displayed chronologically (newest first)
- Each visit includes:
  - Visit date
  - Medications prescribed
  - Clinical observations
  - Additional comments or notes

### Data Management

#### Backup and Recovery

- The system automatically creates backups of patient data
- Manual backup can be triggered from the settings menu
- Backup files are stored locally and can be used for data recovery

#### Data Export

- Patient data can be exported for external use
- Export formats include JSON for technical use
- Individual patient records can be printed or saved as PDF

## 🔒 Security Features

### Data Privacy

- **Local Storage Only**: No patient data is transmitted over the internet
- **No Cloud Storage**: All data remains on the local computer
- **Secure Sessions**: Automatic logout after inactivity
- **Input Validation**: All user inputs are validated and sanitized

### Access Control

- **Password Protection**: Secure login required for access
- **Session Management**: Automatic logout for security
- **Change Detection**: Prevents accidental data loss during logout

### Data Integrity

- **Validation**: Comprehensive data validation on all inputs
- **Error Handling**: Graceful handling of data corruption or errors
- **Backup System**: Automatic and manual backup capabilities

## 🛠️ Development

### Development Setup

1. Clone the repository
2. Install development dependencies (if any)
3. Start a local development server
4. Make changes and test locally

### Testing

- Manual testing checklist available in `js/tests/manual-testing-checklist.md`
- Integration tests can be run using `js/integration-test.js`
- Cross-browser testing recommended before deployment

### Building for Production

1. Run the optimization script:
   ```bash
   node optimize-for-production.js
   ```
2. Deploy the `dist/` directory to your web server
3. Configure web server for optimal performance

## 🌐 Browser Compatibility

### Supported Browsers

- **Google Chrome**: Version 80 and later
- **Mozilla Firefox**: Version 75 and later
- **Microsoft Edge**: Version 80 and later
- **Safari**: Version 13 and later

### Required Features

- ES6+ JavaScript support
- CSS Grid and Flexbox
- Local Storage API
- File System Access API (for advanced features)

## 📱 Mobile Support

While primarily designed for desktop use, the application includes responsive design features:

- Tablet compatibility (iPad and similar devices)
- Touch-friendly interface elements
- Responsive layouts for smaller screens
- Mobile-optimized forms and navigation

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Load

- **Check Browser Compatibility**: Ensure you're using a supported browser
- **Clear Browser Cache**: Clear cache and cookies, then reload
- **Check Console**: Open browser developer tools and check for errors
- **Verify Server**: Ensure the local web server is running

#### Login Issues

- **Check Credentials**: Verify username and password are correct
- **Clear Storage**: Clear browser localStorage and try again
- **Check Console**: Look for authentication errors in browser console

#### Data Not Saving

- **Storage Quota**: Check if browser storage quota is exceeded
- **Permissions**: Ensure browser allows local storage
- **JavaScript Errors**: Check browser console for JavaScript errors

#### Performance Issues

- **Large Dataset**: Performance may degrade with very large numbers of patients
- **Browser Memory**: Close other browser tabs to free up memory
- **Clear Cache**: Clear browser cache to improve performance

### Getting Help

1. Check the browser console for error messages
2. Review the manual testing checklist for known issues
3. Verify all files are properly loaded and accessible
4. Check network tab in developer tools for failed requests

## 📋 System Requirements

### Minimum Requirements

- **Operating System**: Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 100MB free space for application and data
- **Browser**: Modern browser with JavaScript enabled

### Recommended Setup

- **Operating System**: Latest version of Windows, macOS, or Linux
- **RAM**: 8GB or more
- **Storage**: 1GB free space for large patient databases
- **Browser**: Latest version of Chrome, Firefox, or Edge
- **Display**: 1920x1080 resolution or higher

## 🔄 Updates and Maintenance

### Regular Maintenance

- **Backup Data**: Regularly backup patient data
- **Clear Cache**: Periodically clear browser cache
- **Update Browser**: Keep browser updated to latest version
- **Monitor Storage**: Check available storage space

### Version Updates

- New versions will include bug fixes and feature improvements
- Always backup data before updating
- Test new versions in a separate environment first
- Review changelog for breaking changes

## 📄 License

This software is proprietary and designed specifically for Dr. S. Sahboub's medical practice. Unauthorized distribution or use is prohibited.

## 📞 Support

For technical support or questions about the Patient Management System:

- **Email**: [support-email]
- **Phone**: [support-phone]
- **Documentation**: Refer to this README and inline help text
- **Emergency**: For critical issues affecting patient care, contact immediately

---

**Patient Management System v1.0**  
_Designed for Dr. S. Sahboub - Pulmonology Practice_  
_Last Updated: January 2024_
