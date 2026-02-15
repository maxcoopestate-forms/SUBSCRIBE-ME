# ID Document Upload Feature - Quick Guide

## 🆔 HOW IT WORKS

When users fill the form:

### **Step 1: Select ID Type**
User checks one of:
- National ID Card
- Driver's Licence  
- International Passport
- NIN

### **Step 2: Upload Section Appears**
As soon as they check an ID type, an upload section appears below asking them to upload that specific ID.

### **Step 3: Upload the Document**
User clicks "📎 Upload [ID Type]" button and selects:
- Image file (JPG, PNG, etc.)
- OR PDF file

### **Step 4: Preview Shows**
After upload:
- ✓ Green checkmark shows file name
- Image preview appears (if image file)
- "Remove" button to delete if wrong file

### **Step 5: Included in PDF**
When form is submitted:
- PDF is generated
- Passport photo appears in top right
- ID documents appear in separate section
- Each ID is clearly labeled
- Images shown full-size in PDF

---

## 📧 WHAT USER SENDS VIA EMAIL

When Gmail opens, the user will have:

1. **Main PDF** - Contains:
   - Passport photo
   - All form data
   - ID document images embedded

2. **User needs to manually attach** (if they want separate files):
   - They can attach the ID files separately
   - Or just send the PDF (IDs are already in it!)

---

## ✨ FEATURES

**Multiple IDs Supported:**
- User can select multiple ID types
- Each gets its own upload section
- All appear in the PDF

**Smart Upload:**
- Can't submit without uploading if ID type is selected
- Preview before submission
- Easy to remove and re-upload

**Professional PDF:**
- IDs displayed full-width
- Clear labels for each document
- High-quality image rendering
- Bordered for clarity

---

## 🎯 USER EXPERIENCE

### On Mobile:
1. Check ID type → Upload section appears
2. Click upload → Camera/Gallery opens
3. Take photo or select image
4. See preview immediately
5. Submit form → PDF includes everything

### On Desktop:
1. Check ID type → Upload section appears
2. Click upload → File browser opens
3. Select ID scan/photo
4. See preview immediately
5. Submit form → PDF includes everything

---

## 📋 VALIDATION

**Automatic Checks:**
- If ID type is selected, upload is required
- Can't submit without uploading the ID
- Clear error messages if missing

**What's Accepted:**
- Images: JPG, PNG, GIF, WEBP
- Documents: PDF
- Both front and back can be in one file

---

## 🎨 CUSTOMIZATION

### Make ID Upload Optional

In `maxcoop-form.html`, find the upload sections and remove the `*` from labels:

```html
<label>UPLOAD NATIONAL ID CARD</label>  <!-- No * = Optional -->
```

### Change Upload Button Text

In `maxcoop-form.html`, change button text:

```html
<button ... >📎 Choose File</button>
```

### Change Upload Button Color

In `maxcoop-form.css`, find `.upload-btn-secondary` and change:

```css
.upload-btn-secondary {
    background-color: #059669;  /* Green instead of blue */
}
```

---

## 🔧 TECHNICAL DETAILS

**How Documents Are Stored:**
- Converted to base64 encoding
- Stored in browser memory
- Embedded directly in PDF
- No server uploads needed

**File Size Limits:**
- Recommended: Under 2MB per file
- PDF generation handles up to 5MB total
- Larger files may slow down PDF creation

**Browser Compatibility:**
- Works on all modern browsers
- Mobile camera access supported
- PDF generation works client-side

---

## 📱 EXAMPLE USER FLOW

**Scenario: User has National ID**

1. User fills form
2. Checks "National ID Card"
3. "Upload National ID Card" section appears
4. User clicks "📎 Upload National ID"
5. Selects ID photo from phone
6. Preview shows: "✓ national_id.jpg uploaded"
7. Completes rest of form
8. Clicks "GENERATE PDF & SEND"
9. PDF created with:
   - Passport photo in corner
   - All form details
   - Full National ID image in separate section
10. Gmail opens with PDF ready to send

**Simple! Fast! Professional!** ✨

---

## 🆘 TROUBLESHOOTING

**ID section not appearing?**
- Make sure you checked the ID type checkbox
- Try unchecking and checking again

**Upload button not working?**
- Check browser permissions for file access
- Try refreshing the page

**Image not showing in PDF?**
- Make sure image file is valid
- Try with smaller file size (< 2MB)
- Use JPG or PNG format

**PDF too large?**
- Reduce image quality before upload
- Use JPG instead of PNG
- Compress images before upload

---

## ✅ TESTING CHECKLIST

Before going live:

- [ ] Select each ID type - upload section appears
- [ ] Upload image - preview shows
- [ ] Upload PDF - file name shows
- [ ] Remove uploaded file - preview clears
- [ ] Select multiple IDs - multiple uploads work
- [ ] Submit form - PDF generates
- [ ] Open PDF - passport photo visible
- [ ] Open PDF - ID documents visible
- [ ] Open PDF - all images clear
- [ ] Test on mobile phone
- [ ] Test on desktop computer

---

**Your form now has professional ID verification! 🎉**

Users can submit complete applications with all required documents in ONE PDF!
