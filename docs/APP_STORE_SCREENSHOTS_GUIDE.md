# App Store Screenshots Guide

## Required Screenshot Specifications

Apple requires specific screenshot sizes for different device types. You'll need to provide screenshots for iPhone.

### iPhone Screenshots Required

**6.7" Display (iPhone 14 Pro Max, 15 Pro Max, etc.)**
- Size: 1290 × 2796 pixels
- Format: PNG or JPEG
- Required: 3-10 screenshots

**6.5" Display (iPhone 14 Plus, 13 Pro Max, etc.)**  
- Size: 1284 × 2778 pixels
- Format: PNG or JPEG
- Required: 3-10 screenshots

**5.5" Display (iPhone 8 Plus, older models)**
- Size: 1242 × 2208 pixels  
- Format: PNG or JPEG
- Required: 3-10 screenshots

## Your Current Screenshots Analysis

You have these existing screenshots in `docs/images/`:
1. `homepage.png` - Case list screen
2. `checklistscreen.png` - Main checklist interface  
3. `add-new-cmk.png` - Adding new case
4. `adding-general-notes.png` - Note taking feature
5. `adding-notes-per-item.png` - Item-specific notes
6. `legal-reference-modal.png` - Legal reference popup

## Screenshot Creation Strategy

### Recommended App Store Screenshot Sequence

**Screenshot 1: Main Value Proposition**
- Show the homepage with multiple cases
- Add overlay text: "Zorunlu Müdafilikte Hiçbir Adımı Atlamayın"
- Subtitle: "Kapsamlı CMK Kontrol Listesi"

**Screenshot 2: Core Functionality** 
- Show the checklist screen with phases expanded
- Overlay text: "7 Ana Fase, 25+ Alt Kategori"
- Subtitle: "Sistematik Prosedür Takibi"

**Screenshot 3: Legal Integration**
- Show legal reference modal open
- Overlay text: "Etkileşimli Hukuki Referanslar"  
- Subtitle: "TCK, CMK, PVSK Maddelerine Anında Erişim"

**Screenshot 4: Note-Taking Features**
- Show note-taking interface
- Overlay text: "Akıllı Not Sistemi"
- Subtitle: "Genel ve Madde Bazında Notlar"

**Screenshot 5: Professional Security**
- Show app interface with privacy callouts
- Overlay text: "Tamamen Güvenli ve Çevrim Dışı"
- Subtitle: "Verileriniz Sadece Cihazınızda"

## How to Create Store-Ready Screenshots

### Method 1: iPhone Simulator (Recommended)
1. Open your app in iPhone Simulator
2. Select device type (iPhone 15 Pro Max for 6.7" screenshots)
3. Navigate to each screen you want to capture
4. Use Simulator menu: Device → Screenshot
5. Screenshots saved to Desktop automatically

### Method 2: Physical iPhone
1. Use iPhone 14 Pro Max or newer for best quality
2. Open your app via Expo Go or TestFlight
3. Take screenshots using iPhone's built-in screenshot feature
4. AirDrop or email screenshots to your Mac

### Method 3: Design Tool Enhancement
1. Import your current screenshots into design tool (Figma, Sketch, Canva)
2. Resize to exact App Store dimensions
3. Add professional overlay text and branding
4. Export in required format

## Screenshot Enhancement Tips

### Visual Improvements
- Add subtle drop shadows to make app pop
- Use consistent typography for overlay text  
- Include your app icon in corner for branding
- Ensure text is readable on light/dark backgrounds

### Text Overlays (Turkish)
Use compelling marketing copy:
- "Avukatlar İçin Vazgeçilmez Araç"
- "CMK Prosedürlerini Sistematik Takip Edin"
- "Hiçbir Kritik Adımı Atlamayın"
- "Tamamen Çevrim Dışı ve Güvenli"

### Professional Branding
- Use consistent color scheme matching your app
- Include subtle legal/justice themed elements (scales, gavel icons)
- Maintain professional, trustworthy appearance

## Screenshot Generation Script

Here's a template for batch processing your existing screenshots:

```bash
# Convert existing screenshots to App Store sizes
# (You'll need to run this manually or use a design tool)

# For 6.7" iPhone (1290 × 2796)
# For 6.5" iPhone (1284 × 2778)  
# For 5.5" iPhone (1242 × 2208)
```

## File Naming Convention

```
ios-6.7-inch-01-homepage.png
ios-6.7-inch-02-checklist.png
ios-6.7-inch-03-legal-reference.png
ios-6.7-inch-04-notes.png
ios-6.7-inch-05-security.png
```

## Quality Checklist

Before submitting screenshots:
- [ ] Correct dimensions for each device type
- [ ] No personal or confidential information visible
- [ ] UI elements are crisp and readable
- [ ] Consistent with your app's actual interface
- [ ] Marketing text is compelling and accurate
- [ ] File sizes under 10MB each
- [ ] No copyright violations in any imagery

## Next Steps

1. **Choose your method** (Simulator recommended for precision)
2. **Generate base screenshots** from your app
3. **Enhance with marketing overlays** using design tool
4. **Create versions for all required device sizes**
5. **Organize files** with proper naming convention
6. **Review for quality and compliance**

The screenshots you create will be the first impression potential users have of your app, so invest time in making them professional and compelling!