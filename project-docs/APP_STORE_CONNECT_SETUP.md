# App Store Connect Setup Guide

## Prerequisites

Before starting, ensure you have:
- [x] Apple Developer Account (active subscription)
- [x] EAS account configured (✓ already done - logged in as 'avocat')
- [x] App bundle ID: `com.cmkchecklist.app` (✓ configured in app.json)
- [x] Privacy Policy document (✓ created)
- [x] App Store metadata prepared (✓ created)

## Step 1: Create App in App Store Connect

### 1.1 Access App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Click "My Apps"
4. Click the "+" button and select "New App"

### 1.2 App Information
Fill in the required fields:

**Platforms:** iOS  
**Name:** CMK Checklist  
**Primary Language:** Turkish (Turkey)  
**Bundle ID:** Select `com.cmkchecklist.app` from dropdown  
**SKU:** cmk-checklist-2024 (unique identifier for your records)  
**User Access:** Full Access

## Step 2: App Information Configuration

### 2.1 General Information
- **Name:** CMK Checklist
- **Subtitle:** Zorunlu Müdafilik Kontrol Listesi
- **Category:** 
  - Primary: Productivity
  - Secondary: Business

### 2.2 Age Rating
Navigate to Age Rating and select:
- **Age Rating:** 4+
- All content descriptor questions: Select "No"
- This app does not contain any objectionable content

### 2.3 Privacy Policy
- **Privacy Policy URL:** [You'll need to host your PRIVACY_POLICY.md online]
- Temporary hosting options:
  - GitHub Pages: Create a simple HTML version
  - Personal website
  - Free hosting service

## Step 3: Version Information

### 3.1 Version 1.0.0 Setup
Create your first version:

**Version Number:** 1.0.0  
**Copyright:** 2024 Emre Terzi  
**Primary Language:** Turkish (Turkey)

### 3.2 App Description
Use the description from APP_STORE_METADATA.md:

```
Turkish Legal Defense Checklist - Professional Case Management

CMK Checklist, zorunlu müdafilikte hiçbir kritik adımın atlanmamasını sağlayan, avukatlar için özel geliştirilmiş profesyonel bir mobil uygulamadır.

[Include full description from metadata file]
```

### 3.3 Keywords
```
cmk,avukat,checklist,zorunlu müdafii,ceza hukuku,prosedür,hukuk,adalet,kontrol listesi,hukuki
```

### 3.4 Support URLs
- **App Support URL:** https://www.linkedin.com/in/emreterzi/
- **Marketing URL:** [Leave blank initially]

## Step 4: Pricing and Availability

### 4.1 Price Schedule
- **Price:** Free
- **Availability:** All countries/regions
- **App Distribution:** Available on App Store

### 4.2 App Store Distribution
- **Make this app available on the App Store:** Yes
- **Automatically release this version:** Yes (for first release)

## Step 5: App Privacy Configuration

Apple requires detailed privacy information. Based on your app:

### 5.1 Data Collection
**Do you or your third-party partners collect data from this app?** 
- Answer: **No**

Since your app stores all data locally and doesn't transmit anything, you can confidently select "No" for all data collection questions.

### 5.2 Privacy Nutrition Labels
If asked for specific data types:
- Contact Info: No
- Health & Fitness: No  
- Financial Info: No
- Location: No
- Sensitive Info: No
- Contacts: No
- User Content: No
- Browsing History: No
- Search History: No
- Identifiers: No
- Usage Data: No
- Diagnostics: No

## Step 6: Screenshots Upload

### 6.1 Required Sizes
Upload screenshots you create following the Screenshots Guide:

**iPhone 6.7" Display**
- 5 screenshots (1290 × 2796 pixels)

**iPhone 6.5" Display** 
- 5 screenshots (1284 × 2778 pixels)

**iPhone 5.5" Display**
- 5 screenshots (1242 × 2208 pixels)

### 6.2 App Preview Videos (Optional)
Consider creating a 30-second demo video showing:
1. Opening the app
2. Creating a new case
3. Using the checklist
4. Accessing legal references
5. Taking notes

## Step 7: Build Upload Process

### 7.1 Production Build Creation
Once everything is configured, create your production build:

```bash
# In your project directory
eas build --platform ios --profile production
```

### 7.2 Build Upload
The EAS build will automatically upload to App Store Connect when complete.

### 7.3 Build Selection
1. In App Store Connect, go to your app version
2. Navigate to "Build" section
3. Select the build that was uploaded from EAS
4. Add export compliance information if prompted

## Step 8: Pre-Submission Checklist

Before submitting for review:

### 8.1 Required Information
- [x] App metadata completed
- [ ] Screenshots uploaded (all required sizes)
- [ ] Privacy Policy URL added
- [ ] Age rating configured
- [ ] Build selected and configured
- [ ] App pricing set

### 8.2 Review Information
**Review Notes for Apple:**
```
CMK Checklist is a professional tool for Turkish criminal defense attorneys. 

Key features to test:
1. Create new case from home screen
2. Navigate through checklist phases
3. Tap on legal references (e.g., "{CMK 90}") to view popup
4. Add notes to individual items
5. Add general notes to cases

The app is completely offline - no internet connection required.
All data is stored locally using AsyncStorage.

Test account: Not required (no user accounts)
Demo data: App includes sample checklist data
```

**App Review Contact:**
- First Name: Emre
- Last Name: Terzi  
- Phone: [Your phone number]
- Email: [Your email]

## Step 9: Submission

### 9.1 Final Review
1. Review all entered information for accuracy
2. Ensure all sections show "Complete" status
3. Preview your app listing as users will see it

### 9.2 Submit for Review
1. Click "Add for Review" 
2. Complete export compliance questionnaire:
   - Does your app use encryption? **No**
   - Select: "Your app is not subject to export compliance requirements"
3. Click "Submit to App Review"

## Step 10: Post-Submission

### 10.1 Review Timeline
- Normal review time: 24-48 hours
- Holiday periods may be longer
- First-time developers sometimes get longer review

### 10.2 Possible Outcomes
1. **Approved:** App goes live automatically
2. **Rejected:** Address feedback and resubmit
3. **Metadata Rejected:** Fix app information and resubmit

### 10.3 Common Rejection Reasons to Avoid
- Incomplete app information
- Missing privacy policy
- Screenshots don't match app functionality  
- App crashes or doesn't work as described

## Step 11: Launch Preparation

### 11.1 Marketing Materials
Prepare for launch:
- Social media announcements
- LinkedIn professional post
- Email to legal community
- Bar association outreach

### 11.2 Success Metrics
Track initial performance:
- Download numbers
- User ratings and reviews
- Feedback from legal community

## Support and Troubleshooting

### Common Issues:
1. **Bundle ID not available:** Already registered - this is expected
2. **Privacy Policy URL required:** Must host online before submission
3. **Screenshot rejection:** Ensure exact pixel dimensions
4. **Build not appearing:** Wait 15-30 minutes after EAS build completion

### Help Resources:
- Apple Developer Documentation
- App Store Connect Help
- EAS Build Documentation
- Your existing CLAUDE.md has excellent build commands

---

This setup process typically takes 2-4 hours to complete thoroughly. Take your time with each section to ensure accuracy and compliance with Apple's guidelines.