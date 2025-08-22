# Simple Cross-Browser Sync Instructions

## How to Share Data Between Browsers (Firefox, Chrome, Edge, etc.)

### Step 1: Create Data in First Browser

1. Open the Patient Management System in **Firefox**
2. Create a new patient (e.g., "John Doe, Age 30, Male, New York")
3. You'll see sync buttons appear in the bottom-right corner after a few seconds

### Step 2: Export Data

1. Click the **"Export Data"** button (blue button in bottom-right)
2. A file called `patient-data.json` will be downloaded to your Downloads folder
3. You'll see a notification confirming the export

### Step 3: Import in Another Browser

1. Open the Patient Management System in **Chrome** (or any other browser)
2. Click the **"Import Data"** button (green button in bottom-right)
3. Select the `patient-data.json` file you downloaded
4. The page will refresh and show all the patients from Firefox!

## That's It! 🎉

Now you have the same patient data in both browsers. You can repeat this process anytime:

- Add patients in Chrome → Export → Import in Firefox
- Add patients in Firefox → Export → Import in Chrome

## Quick Tips:

- The sync buttons appear automatically after 3 seconds
- You can close the sync buttons by clicking the "×"
- The system shows notifications for all sync operations
- Data includes both patients and your login session

## Example Workflow:

1. **Firefox**: Create "Jane Smith" → Export Data
2. **Chrome**: Import Data → Now has both "John Doe" and "Jane Smith"
3. **Chrome**: Create "Bob Wilson" → Export Data
4. **Firefox**: Import Data → Now has all three patients

This simple system lets you work with the same patient database across any browser on your PC!
