# Patient Management System - Setup Guide

## 🏥 Simple Setup Instructions for Dr. S. Sahboub

This guide will help you set up and start using your Patient Management System in just a few minutes.

## 📋 What You Need

- A computer with Windows, Mac, or Linux
- An internet browser (Chrome, Firefox, Safari, or Edge)
- The Patient Management System files (provided)

## 🚀 Step-by-Step Setup

### Step 1: Prepare Your Computer

1. **Create a folder** on your desktop called "Patient Management"
2. **Extract all files** from the provided zip file into this folder
3. **Make sure** you can see files like `index.html`, folders named `css`, `js`, `assets`

### Step 2: Start the Application

#### Option A: Using Python (Recommended)

Most computers have Python installed. Here's how to check and use it:

1. **Open Command Prompt** (Windows) or **Terminal** (Mac/Linux):

   - Windows: Press `Windows key + R`, type `cmd`, press Enter
   - Mac: Press `Cmd + Space`, type `terminal`, press Enter
   - Linux: Press `Ctrl + Alt + T`

2. **Navigate to your folder**:

   ```
   cd Desktop/Patient Management
   ```

3. **Start the server**:

   ```
   python -m http.server 8000
   ```

   If that doesn't work, try:

   ```
   python3 -m http.server 8000
   ```

4. **You should see**: "Serving HTTP on 0.0.0.0 port 8000"

#### Option B: Using a Simple Web Server

If Python doesn't work, you can download a simple web server:

1. **Download** a simple HTTP server program like "HTTP File Server" or "Mongoose"
2. **Install and run** the program
3. **Point it** to your "Patient Management" folder
4. **Start** the server

### Step 3: Open the Application

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)
2. **Type this address**: `http://localhost:8000`
3. **Press Enter**

You should see the Patient Management System login page!

### Step 4: First Login

1. **Username**: `dr.sahboub`
2. **Password**: `pneumo2024`
3. **Click "Login"**

🎉 **Congratulations!** You're now in your Patient Management System!

## 🔧 Quick Start Guide

### Your First Patient

1. **Click "Create New Patient"** on the main page
2. **Fill in the patient information**:
   - First Name: John
   - Last Name: Doe
   - Date of Birth: 01/01/1980
   - Place of Residence: New York
   - Gender: Male
3. **Add a visit**:
   - Visit Date: Today's date
   - Medications: Any medications prescribed
   - Observations: Your medical observations
   - Comments: Any additional notes
4. **Click "Save Patient"**

### Finding a Patient

1. **Use the search bar** on the main page
2. **Type** the patient's first or last name
3. **Click** on the patient from the results
4. **View** all their information and visit history

### Editing a Patient

1. **Find the patient** using search
2. **Click "Edit"** button
3. **Make your changes**
4. **Click "Save Changes"**

## 🔒 Important Security Notes

### Keep Your Data Safe

- **Your patient data** is stored only on your computer
- **No information** is sent over the internet
- **Always backup** your data regularly
- **Keep your computer secure** with antivirus software

### Changing Your Password

For security, you should change the default password:

1. **Contact your IT support** to help change the password
2. **Or** ask someone technical to modify the authentication settings
3. **Use a strong password** that you can remember

## 💾 Backing Up Your Data

### Automatic Backups

The system creates automatic backups, but you should also:

1. **Copy the entire "Patient Management" folder** to a USB drive weekly
2. **Store the backup** in a secure location
3. **Test the backup** occasionally by opening it on another computer

### Manual Backup

1. **Copy the "data" folder** from your Patient Management directory
2. **Save it** with today's date (e.g., "data-backup-2024-01-15")
3. **Store it safely** on a USB drive or external hard drive

## 🆘 Troubleshooting

### The Application Won't Open

**Problem**: Browser shows "This site can't be reached"
**Solution**:

- Make sure the server is still running in your command prompt/terminal
- Check that you typed `http://localhost:8000` correctly
- Try closing and reopening your browser

**Problem**: Login page doesn't appear
**Solution**:

- Check that all files are in the correct folder
- Make sure you extracted all files from the zip
- Try a different browser (Chrome is recommended)

### Can't Login

**Problem**: "Invalid credentials" error
**Solution**:

- Double-check username: `dr.sahboub`
- Double-check password: `pneumo2024`
- Make sure Caps Lock is off
- Try typing the password manually instead of copying/pasting

### Data Not Saving

**Problem**: Patient information disappears
**Solution**:

- Make sure you clicked "Save Patient" or "Save Changes"
- Check that your browser allows local storage
- Try clearing your browser cache and restarting

### Application Runs Slowly

**Problem**: Pages load slowly or freeze
**Solution**:

- Close other browser tabs
- Restart your browser
- Restart your computer
- Make sure you have enough free disk space

## 📞 Getting Help

### When You Need Assistance

1. **Write down** exactly what you were doing when the problem occurred
2. **Take a screenshot** if you see an error message
3. **Note** which browser you're using (Chrome, Firefox, etc.)
4. **Contact** your IT support person with this information

### Emergency Situations

If you cannot access patient data during a medical emergency:

1. **Don't panic** - your data is still safe on your computer
2. **Try restarting** the browser and server
3. **Use your backup** if the main system isn't working
4. **Contact IT support** immediately for urgent assistance

## 📱 Using on Different Devices

### Desktop Computer (Recommended)

- **Best experience** with full keyboard and large screen
- **All features** work perfectly
- **Fastest performance**

### Laptop

- **Works great** for mobile use
- **Same features** as desktop
- **Good for home visits** if needed

### Tablet (iPad, Android)

- **Basic functionality** works
- **Touch-friendly** interface
- **Good for viewing** patient information
- **Limited editing** capabilities

### Smartphone

- **Not recommended** for regular use
- **Emergency viewing** only
- **Very limited** functionality

## 🔄 Regular Maintenance

### Weekly Tasks

- [ ] **Backup your data** to USB drive
- [ ] **Check** that the system is working properly
- [ ] **Clear browser cache** if running slowly

### Monthly Tasks

- [ ] **Update your browser** to the latest version
- [ ] **Check available disk space** on your computer
- [ ] **Test your backup** by opening it

### As Needed

- [ ] **Change password** if security is compromised
- [ ] **Update the application** when new versions are available
- [ ] **Contact IT support** for any technical issues

## ✅ Success Checklist

After setup, you should be able to:

- [ ] Open the application in your browser
- [ ] Login with your credentials
- [ ] Create a new patient record
- [ ] Search for existing patients
- [ ] Edit patient information
- [ ] Add visits to patient records
- [ ] Logout safely
- [ ] Restart the application and see your data

If you can do all of these things, your setup is complete and working correctly!

---

**Need Help?** Contact your IT support person or the system administrator.

**Remember**: Your patient data is private and secure - it never leaves your computer!
