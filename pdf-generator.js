// PDF Generator for MAXCOOP Subscription Form
// ============================================
// This file contains all PDF generation code
// You can customize colors, fonts, backgrounds, and layout here

async function generatePDF(data, passportImageData, idDocuments) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ========================================
    // CUSTOMIZE COLORS HERE
    // ========================================
    const colors = {
        primaryBlue: [30, 58, 138],        // Dark Blue
        lightBlue: [59, 130, 246],          // Light Blue
        accentGold: [251, 191, 36],         // Gold/Yellow
        primaryRed: [220, 38, 38],          // Red
        darkRed: [185, 28, 28],             // Dark Red
        darkGray: [51, 51, 51],             // Text Gray
        lightGray: [156, 163, 175],         // Light Gray
        white: [255, 255, 255],             // White
        background: [240, 249, 255]         // Light Blue Background
    };

    // ========================================
    // PAGE SETUP
    // ========================================
    let yPos = 20;

    // ========================================
    // HEADER SECTION (with gradient)
    // ========================================
    
    // Gradient background (simulated with rectangles)
    for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = colors.primaryBlue[0] + (colors.lightBlue[0] - colors.primaryBlue[0]) * ratio;
        const g = colors.primaryBlue[1] + (colors.lightBlue[1] - colors.primaryBlue[1]) * ratio;
        const b = colors.primaryBlue[2] + (colors.lightBlue[2] - colors.primaryBlue[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 210, 1, 'F');
    }

    // Add decorative border
    doc.setDrawColor(...colors.accentGold);
    doc.setLineWidth(2);
    doc.rect(5, 5, 200, 35, 'S');

    // Company Name
    doc.setFontSize(26);
    doc.setTextColor(...colors.white);
    doc.setFont(undefined, 'bold');
    doc.text('MAXCOOP', 105, 18, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(20);
    doc.text('COOP CITY, ANAMBRA', 105, 28, { align: 'center' });
    
    // Form Title
    doc.setFontSize(14);
    doc.setTextColor(...colors.accentGold);
    doc.text('SUBSCRIPTION FORM', 105, 36, { align: 'center' });

    // Add passport photo if available
    if (passportImageData) {
        try {
            doc.addImage(passportImageData, 'JPEG', 175, 8, 25, 30);
            doc.setDrawColor(...colors.white);
            doc.setLineWidth(0.5);
            doc.rect(175, 8, 25, 30, 'S');
        } catch (error) {
            console.log('Could not add passport photo to PDF');
        }
    }

    yPos = 50;

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function addSectionHeader(title) {
        // Add some spacing before section
        yPos += 3;
        
        // Gradient header background
        doc.setFillColor(...colors.primaryRed);
        doc.rect(10, yPos, 190, 12, 'F');
        
        // Add decorative line on left
        doc.setFillColor(...colors.accentGold);
        doc.rect(10, yPos, 3, 12, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(...colors.white);
        doc.setFont(undefined, 'bold');
        doc.text(title, 18, yPos + 8);
        
        yPos += 17;
        doc.setTextColor(...colors.darkGray);
    }

    function addField(label, value, fullWidth = false) {
        // Check if we need a new page
        if (yPos > 265) {
            doc.addPage();
            yPos = 20;
            
            // Add light background to new page
            doc.setFillColor(...colors.background);
            doc.rect(0, 0, 210, 297, 'F');
        }

        // Alternate background for rows
        const rowHeight = fullWidth ? 12 : 7;
        if (Math.floor((yPos - 50) / 7) % 2 === 0) {
            doc.setFillColor(...colors.background);
            doc.rect(10, yPos - 4, 190, rowHeight, 'F');
        }

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryBlue);
        doc.text(label + ':', 15, yPos);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.darkGray);
        const valueText = String(value || 'N/A');
        
        if (fullWidth) {
            const splitText = doc.splitTextToSize(valueText, 170);
            doc.text(splitText, 15, yPos + 5);
            yPos += 5 + (splitText.length * 5);
        } else {
            // Truncate if too long
            const maxWidth = 110;
            const truncated = doc.splitTextToSize(valueText, maxWidth);
            doc.text(truncated[0], 80, yPos);
            yPos += 7;
        }
    }

    function addCheckmark(isChecked) {
        if (isChecked) {
            doc.setTextColor(...colors.primaryRed);
            return '✓ Yes';
        }
        return 'No';
    }

    // ========================================
    // SECTION 1: SUBSCRIBER'S DETAILS
    // ========================================
    addSectionHeader('SECTION 1: SUBSCRIBER\'S DETAILS');
    
    addField('Full Name', data.subscriber.fullName);
    addField('Spouse Name', data.subscriber.spouseName);
    addField('Address', data.subscriber.address, true);
    addField('Date of Birth', data.subscriber.dob);
    addField('Gender', data.subscriber.gender);
    addField('Marital Status', data.subscriber.maritalStatus);
    addField('Nationality', data.subscriber.nationality);
    addField('Occupation', data.subscriber.occupation);
    addField('Employer\'s Name', data.subscriber.employerName);
    addField('Nature of Business', data.subscriber.businessNature);
    addField('Years of Employment', data.subscriber.yearsOfEmployment);
    addField('Country of Residence', data.subscriber.countryOfResidence);
    addField('Language Spoken', data.subscriber.languageSpoken);
    addField('Email Address', data.subscriber.email);
    addField('Mobile Number', data.subscriber.mobileNumber);
    addField('Other Income Source', data.subscriber.otherIncome);
    addField('ID Type', data.subscriber.idType);
    addField('Politically Exposed', data.subscriber.pep);
    addField('PEP Category', data.subscriber.pepCategory);

    yPos += 5;

    // ========================================
    // ID DOCUMENTS SECTION
    // ========================================
    if (data.subscriber.idType && data.subscriber.idType !== 'N/A') {
        addSectionHeader('IDENTIFICATION DOCUMENTS');
        
        addField('ID Type', data.subscriber.idType);
        
        // Add ID images if available
        const idTypes = data.subscriber.idType.split(', ');
        
        for (const idType of idTypes) {
            const idKey = idType.replace(/\s+/g, '_').toUpperCase();
            
            if (idDocuments && idDocuments[idKey] && idDocuments[idKey].data) {
                try {
                    yPos += 5;
                    
                    // Check if we need a new page
                    if (yPos > 200) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    // Add ID document label
                    doc.setFontSize(9);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(...colors.primaryBlue);
                    doc.text(idType + ' Document:', 15, yPos);
                    yPos += 5;
                    
                    // Add the image
                    if (idDocuments[idKey].type.startsWith('image/')) {
                        doc.addImage(idDocuments[idKey].data, 'JPEG', 15, yPos, 180, 100);
                        doc.setDrawColor(...colors.lightGray);
                        doc.setLineWidth(0.5);
                        doc.rect(15, yPos, 180, 100, 'S');
                        yPos += 105;
                    } else {
                        // For PDF files
                        doc.setFont(undefined, 'normal');
                        doc.setTextColor(...colors.darkGray);
                        doc.text('PDF Document: ' + idDocuments[idKey].name, 15, yPos);
                        yPos += 10;
                    }
                    
                } catch (error) {
                    console.log('Could not add ID document to PDF:', error);
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(...colors.darkGray);
                    doc.text('Document attached: ' + idDocuments[idKey].name, 15, yPos);
                    yPos += 7;
                }
            }
        }
        
        yPos += 5;
    }

    // ========================================
    // SECTION 2: NEXT OF KIN
    // ========================================
    addSectionHeader('SECTION 2: NEXT OF KIN');
    
    addField('Name', data.nextOfKin.name);
    addField('Phone Number', data.nextOfKin.phone);
    addField('Email Address', data.nextOfKin.email);
    addField('Address', data.nextOfKin.address, true);

    yPos += 5;

    // ========================================
    // SECTION 3: SUBSCRIBER'S DECLARATION
    // ========================================
    addSectionHeader('SECTION 3: SUBSCRIBER\'S DECLARATION');
    
    // Affirmation text with name
    doc.setFontSize(9);
    doc.setTextColor(...colors.darkGray);
    const affirmText = `I, ${data.declaration.affirmationName}, hereby affirm that all information provided is true and accurate.`;
    const splitAffirm = doc.splitTextToSize(affirmText, 180);
    doc.text(splitAffirm, 15, yPos);
    yPos += 5 + (splitAffirm.length * 5);
    
    // Agreement checkbox
    addField('Terms Agreement', addCheckmark(data.declaration.agreeToTerms));
    
    yPos += 3;
    
    addField('Type of Plot', data.declaration.plotType);
    addField('Number of Plots', data.declaration.numberOfPlots);
    addField('Plot Size', data.declaration.plotSize);
    addField('Corner Piece', data.declaration.cornerPiece);
    addField('Payment Plan', data.declaration.paymentPlan);
    addField('Signature', data.declaration.signature);
    addField('Date', data.declaration.date);

    yPos += 5;

    // ========================================
    // REFERRAL DETAILS
    // ========================================
    if (data.referral.name !== 'N/A') {
        addSectionHeader('REFERRAL DETAILS');
        addField('Referral Name', data.referral.name);
        addField('Referral Phone', data.referral.phone);
        addField('Referral Email', data.referral.email);
        addField('Referral Date', data.referral.date);
    }

    // ========================================
    // FOOTER WITH DECORATIVE BORDER
    // ========================================
    doc.setFillColor(...colors.primaryBlue);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text('Submitted on: ' + data.submissionDate, 105, 286, { align: 'center' });
    
    doc.setTextColor(...colors.accentGold);
    doc.setFont(undefined, 'bold');
    doc.text('MAX CONSTRUCTION HOUSING COOP | 5402057281', 105, 292, { align: 'center' });

    // Convert to blob
    return doc.output('blob');
}

// Export for use in main script
window.generatePDF = generatePDF;
