// PDF Generator for MAXCOOP Subscription Form
// ============================================

async function generatePDF(data, passportImageData, idDocuments) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const colors = {
        primaryBlue: [30, 58, 138],
        lightBlue: [59, 130, 246],
        accentGold: [251, 191, 36],
        primaryRed: [220, 38, 38],
        darkGray: [51, 51, 51],
        lightGray: [156, 163, 175],
        white: [255, 255, 255],
        background: [240, 249, 255]
    };

    let yPos = 20;

    // ========================================
    // HEADER
    // ========================================
    for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = colors.primaryBlue[0] + (colors.lightBlue[0] - colors.primaryBlue[0]) * ratio;
        const g = colors.primaryBlue[1] + (colors.lightBlue[1] - colors.primaryBlue[1]) * ratio;
        const b = colors.primaryBlue[2] + (colors.lightBlue[2] - colors.primaryBlue[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 210, 1, 'F');
    }

    doc.setDrawColor(...colors.accentGold);
    doc.setLineWidth(2);
    doc.rect(5, 5, 200, 35, 'S');

    doc.setFontSize(26);
    doc.setTextColor(...colors.white);
    doc.setFont(undefined, 'bold');
    doc.text('MAXCOOP', 105, 18, { align: 'center' });

    doc.setFontSize(20);
    doc.text('COOP CITY, ANAMBRA', 105, 28, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(...colors.accentGold);
    doc.text('SUBSCRIPTION FORM', 105, 36, { align: 'center' });

    // ✅ FIXED PASSPORT IMAGE FORMAT
    if (passportImageData) {
        try {
            const format = passportImageData.includes('png') ? 'PNG' : 'JPEG';
            doc.addImage(passportImageData, format, 175, 8, 25, 30);
            doc.rect(175, 8, 25, 30);
        } catch (e) {
            console.log("Passport error:", e);
        }
    }

    yPos = 50;

    // ========================================
    // HELPERS
    // ========================================
    function addSectionHeader(title) {
        yPos += 3;
        doc.setFillColor(...colors.primaryRed);
        doc.rect(10, yPos, 190, 12, 'F');

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
        if (yPos > 265) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryBlue);
        doc.text(label + ':', 15, yPos);

        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.darkGray);

        const text = String(value || 'N/A');

        if (fullWidth) {
            const split = doc.splitTextToSize(text, 170);
            doc.text(split, 15, yPos + 5);
            yPos += 5 + (split.length * 5);
        } else {
            doc.text(text, 80, yPos);
            yPos += 7;
        }
    }

    function addCheckmark(val) {
        return val ? '✓ Yes' : 'No';
    }

    // ========================================
    // SECTION 1
    // ========================================
    addSectionHeader('SECTION 1: SUBSCRIBER DETAILS');

    addField('Full Name', data.subscriber.fullName);
    addField('Address', data.subscriber.address, true);
    addField('Email', data.subscriber.email);
    addField('Phone', data.subscriber.mobileNumber);
    addField('ID Type', data.subscriber.idType);

    // ========================================
    // ✅ FIXED ID DOCUMENT SECTION
    // ========================================
    if (data.subscriber.idType && data.subscriber.idType !== 'N/A') {
        addSectionHeader('IDENTIFICATION DOCUMENTS');

       const idTypes = data.subscriber.idType.split(',');

for (let rawKey of idTypes) {

    // ✅ FIX: clean spaces
    const idKey = rawKey.trim();

    console.log("🔍 Checking:", idKey);
    console.log("📦 Data:", idDocuments[idKey]);

    // ✅ FIX: FULL SAFETY CHECK
    if (
        idDocuments &&
        idDocuments[idKey] &&
        idDocuments[idKey].data
    ) {
        try {
            yPos += 5;

            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(idKey.replace(/_/g, ' '), 15, yPos);
            yPos += 5;

            const file = idDocuments[idKey];

            // ✅ DOUBLE SAFETY
            if (!file) {
                console.log("❌ File missing for:", idKey);
                continue;
            }

            if (file.type && file.type.startsWith('image/')) {

                const format = file.type.includes('png') ? 'PNG' : 'JPEG';

                doc.addImage(file.data, format, 15, yPos, 180, 100);
                doc.rect(15, yPos, 180, 100);

                yPos += 105;

            } else if (file.name) {

                doc.text("PDF: " + file.name, 15, yPos);
                yPos += 10;

            }

        } catch (err) {
            console.log("❌ ID ERROR:", err);
        }

    } else {
        console.log("⚠️ Skipped (no file):", idKey);
    }
}

    // ========================================
    // FOOTER
    // ========================================
    doc.setFillColor(...colors.primaryBlue);
    doc.rect(0, 280, 210, 17, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text('Submitted on: ' + new Date().toLocaleString(), 105, 286, { align: 'center' });

    doc.setTextColor(...colors.accentGold);
    doc.setFont(undefined, 'bold');
    doc.text('MAXCOOP | 5402057281', 105, 292, { align: 'center' });

    return doc.output('blob');
}

window.generatePDF = generatePDF;
