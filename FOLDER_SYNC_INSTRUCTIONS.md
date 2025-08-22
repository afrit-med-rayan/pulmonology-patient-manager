# Folder-Based Cross-Browser Sync Instructions

## Automatic Sync with Shared Folder (Chrome/Edge)

### Step 1: Setup Shared Folder (One-Time Setup)

1. Open the Patient Management System in **Chrome or Edge**
2. Wait for sync buttons to appear (bottom-right corner)
3. Click **"📁 Setup Shared Folder"**
4. Choose or create a folder (e.g., "PatientData" on Desktop)
5. Click "Select Folder" to grant access

### Step 2: Automatic Sync is Now Active! 🎉

- All patient data is automatically saved as individual files in your chosen folder
- Each patient gets their own file: `patient_12345.json`
- When you create/edit/delete patients, the files are updated instantly
- All browsers reading from the same folder see changes automatically

### Step 3: Use in Other Browsers

1. Open the Patient Management System in **Firefox** (or any browser)
2. Click **"📁 Setup Shared Folder"**
3. Select the **same folder** you chose in Step 1
4. All your patients will appear instantly!

## How It Works:

- **Create Patient**: New file created in shared folder → Visible in all browsers
- **Edit Patient**: File updated in shared folder → Changes sync automatically
- **Delete Patient**: File removed from shared folder → Deleted in all browsers
- **Real-time Sync**: Changes appear within 3 seconds in other browsers

## Manual Sync (All Browsers)

If your browser doesn't support folder access:

### Export Data:

1. Click **"Export"** button
2. Save the `patient-data.json` file

### Import Data:

1. Click **"Import"** button
2. Select the `patient-data.json` file
3. All patients will be imported

## Example Workflow:

### Chrome:

1. Setup folder: `C:\Users\YourName\Desktop\PatientData`
2. Create patient: "John Doe" → File `patient_123.json` created
3. Folder now contains: `patient_123.json`

### Firefox:

1. Setup same folder: `C:\Users\YourName\Desktop\PatientData`
2. Open patient list → "John Doe" appears automatically!
3. Create patient: "Jane Smith" → File `patient_456.json` created

### Back to Chrome:

1. Refresh or wait 3 seconds
2. "Jane Smith" appears automatically!

## Benefits:

- ✅ **True Cross-Browser Sync** - Works between any browsers
- ✅ **Real-time Updates** - Changes appear within seconds
- ✅ **Individual Files** - Each patient is a separate file
- ✅ **Easy Backup** - Just copy the folder
- ✅ **No Server Needed** - Everything stays on your PC
- ✅ **Persistent** - Folder location is remembered

## Troubleshooting:

**Folder access not working?**

- Make sure you're using Chrome or Edge (latest version)
- Try selecting a different folder location
- Check folder permissions

**Changes not syncing?**

- Wait up to 3 seconds for auto-sync
- Make sure all browsers are pointing to the same folder
- Check that the folder contains `.json` files

**Want to change folder location?**

- Clear browser data or use incognito mode
- Click "Setup Shared Folder" again to choose new location
