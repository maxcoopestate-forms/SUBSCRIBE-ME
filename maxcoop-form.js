// MAXCOOP Subscription Form - Form Logic
// ========================================
// This file contains ONLY the form handling code
// pdf-generator.js must be loaded BEFORE this file

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('maxcoopForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const passportUpload = document.getElementById('passportUpload');
    const passportImage = document.getElementById('passportImage');
    const photoPreview = document.getElementById('photoPreview');
    let passportImageData = null;

    // Store uploaded ID documents
    const idDocuments = {
        NATIONAL_ID: null,
        DRIVERS_LICENCE: null,
        INTERNATIONAL_PASSPORT: null,
        NIN: null
    };

    // ========================================
    // PASSPORT PHOTO UPLOAD
    // ========================================
    passportUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                passportImageData = event.target.result;
                passportImage.src = passportImageData;
                passportImage.style.display = 'block';
                photoPreview.querySelector('.photo-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // ========================================
    // ID UPLOAD TOGGLE
    // ========================================
    window.toggleIdUpload = function(idType) {
        const uploadSection = document.getElementById(`upload_${idType}`);
        if (!uploadSection) return;

        const checkbox = document.querySelector(`input[name="idType"][value="${idType}"]`);

        if (checkbox && checkbox.checked) {
            uploadSection.style.display = 'block';
        } else {
            uploadSection.style.display = 'none';
            const fileInput = document.getElementById(`file_${idType}`);
            const preview = document.getElementById(`preview_${idType}`);
            if (fileInput) fileInput.value = '';
            if (preview) {
                preview.classList.remove('active');
                preview.innerHTML = '';
            }
            idDocuments[idType] = null;
        }
    };

    // ========================================
    // FILE INPUT EVENT LISTENERS
    // ========================================
    const fileInputs = ['NATIONAL_ID', 'DRIVERS_LICENCE', 'INTERNATIONAL_PASSPORT', 'NIN'];
    fileInputs.forEach(idType => {
        const fileInput = document.getElementById(`file_${idType}`);
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                handleIdUploadEvent(idType, this);
            });
        }
    });

    function handleIdUploadEvent(idType, fileInput) {
        const preview = document.getElementById(`preview_${idType}`);
        const file = fileInput.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            idDocuments[idType] = {
                name: file.name,
                type: file.type,
                data: e.target.result
            };

            console.log('✅ ID Uploaded:', idType, file.name);

            if (!preview) return;

            preview.classList.add('active');

            if (file.type.startsWith('image/')) {
                preview.innerHTML = `
                    <div class="file-info">
                        <p>✓ ${file.name} uploaded</p>
                        <button type="button" class="remove-btn" onclick="removeIdUpload('${idType}')">Remove</button>
                    </div>
                    <img src="${e.target.result}" alt="ID Preview">
                `;
            } else {
                preview.innerHTML = `
                    <div class="file-info">
                        <p>✓ ${file.name} uploaded (PDF)</p>
                        <button type="button" class="remove-btn" onclick="removeIdUpload('${idType}')">Remove</button>
                    </div>
                `;
            }
        };
        reader.readAsDataURL(file);
    }

    window.removeIdUpload = function(idType) {
        const fileInput = document.getElementById(`file_${idType}`);
        const preview = document.getElementById(`preview_${idType}`);
        if (fileInput) fileInput.value = '';
        if (preview) {
            preview.classList.remove('active');
            preview.innerHTML = '';
        }
        idDocuments[idType] = null;
    };

    // Auto-set today's date
    const today = new Date().toISOString().split('T')[0];
    if (form.declarationDate && !form.declarationDate.value) {
        form.declarationDate.value = today;
    }

    // ========================================
    // FORM SUBMISSION
    // ========================================
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        loadingIndicator.style.display = 'flex';

        try {
            const formData = collectFormData();
            
            console.log('📦 Submitting with:', {
                passport: passportImageData ? 'Yes' : 'No',
                ids: Object.keys(idDocuments).filter(k => idDocuments[k])
            });

            // Generate PDF (function from pdf-generator.js)
            const pdfBlob = await generatePDF(formData, passportImageData, idDocuments);
            const fileName = `MAXCOOP_${formData.subscriber.surname}_${Date.now()}.pdf`;

            loadingIndicator.style.display = 'none';

            // Try to share (mobile)
            if (navigator.share && navigator.canShare) {
                try {
                    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: 'MAXCOOP Subscription Form',
                            text: 'Please send to maxcoopforms@gmail.com',
                            files: [file]
                        });
                        alert('✅ PDF Generated!\n\nSelect Gmail and send to:\nmaxcoopforms@gmail.com');
                        return;
                    }
                } catch (shareError) {
                    console.log('Share failed, downloading instead');
                }
            }

            // Fallback: Download
            downloadPDF(pdfBlob, fileName);
            
            setTimeout(() => {
                openGmailCompose(formData.subscriber.fullName);
                showInstructions(fileName);
            }, 500);

        } catch (error) {
            console.error('❌ Error:', error);
            loadingIndicator.style.display = 'none';
            alert('Error generating PDF: ' + error.message);
        }
    });

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function downloadPDF(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function openGmailCompose(subscriberName) {
        const subject = encodeURIComponent(`MAXCOOP Subscription - ${subscriberName}`);
        const body = encodeURIComponent(
            `Dear MAXCOOP Admin,\n\n` +
            `Please find attached my subscription form.\n\n` +
            `Name: ${subscriberName}\n\n` +
            `Thank you!`
        );
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    }

    function showInstructions(filename) {
        alert(`📧 NEXT STEPS:\n\n` +
            `1. PDF downloaded: ${filename}\n\n` +
            `2. Gmail opening in new tab\n\n` +
            `3. In Gmail:\n` +
            `   • TO: maxcoopforms@gmail.com\n` +
            `   • Attach the PDF\n` +
            `   • Send!\n\n` +
            `Thank you for choosing MAXCOOP!`);
    }

    // ========================================
    // VALIDATION
    // ========================================
    function validateForm() {
        // Check ID uploads
        const idCheckboxes = form.querySelectorAll('input[name="idType"]:checked');
        if (idCheckboxes.length > 0) {
            for (let checkbox of idCheckboxes) {
                const idType = checkbox.value;
                if (!idDocuments[idType] || !idDocuments[idType].data) {
                    alert(`⚠️ Please upload your ${idType.replace(/_/g, ' ')}`);
                    return false;
                }
            }
        }

        // Check required fields
        const requiredFields = form.querySelectorAll('[required]');
        for (let field of requiredFields) {
            if (field.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    alert('⚠️ Please fill all required fields');
                    field.focus();
                    return false;
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(cb => cb.checked);
                if (!isChecked) {
                    alert('⚠️ Please fill all required fields');
                    field.focus();
                    return false;
                }
            } else {
                if (!field.value.trim()) {
                    alert('⚠️ Please fill all required fields');
                    field.focus();
                    return false;
                }
            }
        }

        return true;
    }

    // ========================================
    // COLLECT FORM DATA
    // ========================================
    function collectFormData() {
        return {
            subscriber: {
                title: getCheckedValue('title'),
                surname: form.surname.value,
                otherNames: form.otherNames.value,
                fullName: `${getCheckedValue('title')} ${form.surname.value} ${form.otherNames.value}`,
                spouseName: form.spouseSurname.value && form.spouseOtherNames.value 
                    ? `${form.spouseSurname.value} ${form.spouseOtherNames.value}` 
                    : 'N/A',
                address: form.address.value,
                dob: form.dob.value,
                gender: form.gender.value,
                maritalStatus: form.maritalStatus.value,
                nationality: form.nationality.value,
                occupation: form.occupation.value || 'N/A',
                employerName: form.employerName.value || 'N/A',
                businessNature: form.businessNature.value || 'N/A',
                yearsOfEmployment: form.yearsOfEmployment.value || 'N/A',
                countryOfResidence: form.countryOfResidence.value,
                languageSpoken: form.languageSpoken.value || 'N/A',
                email: form.email.value,
                otherIncome: form.otherIncome.value || 'N/A',
                mobileNumber: form.mobileNumber.value,
                idType: getCheckedValues('idType').join(',') || 'N/A',
                pep: form.pep.value,
                pepCategory: form.pepCategory.value || 'N/A'
            },
            nextOfKin: {
                name: form.nokName.value,
                phone: form.nokPhone.value,
                email: form.nokEmail.value || 'N/A',
                address: form.nokAddress.value
            },
            declaration: {
                affirmationName: form.affirmationName.value,
                agreeToTerms: form.agreeToTerms.checked,
                plotType: getCheckedValue('plotType'),
                numberOfPlots: form.numberOfPlots.value,
                plotSize: getCheckedValue('plotSize'),
                cornerPiece: getCheckedValue('cornerPiece') || 'No',
                paymentPlan: getCheckedValue('paymentPlan'),
                signature: form.signature.value,
                date: form.declarationDate.value
            },
            referral: {
                name: form.referralName.value || 'N/A',
                phone: form.referralPhone.value || 'N/A',
                email: form.referralEmail.value || 'N/A',
                date: form.referralDate.value || 'N/A'
            },
            submissionDate: new Date().toLocaleString()
        };
    }

    function getCheckedValue(name) {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    function getCheckedValues(name) {
        const checked = form.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(cb => cb.value);
    }

    // ========================================
    // SINGLE CHECKBOX SELECTION
    // ========================================
    function setupSingleCheckbox(name) {
        const checkboxes = form.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(cb => {
                        if (cb !== this) cb.checked = false;
                    });
                }
            });
        });
    }

    setupSingleCheckbox('title');
    setupSingleCheckbox('plotType');
    setupSingleCheckbox('plotSize');
    setupSingleCheckbox('paymentPlan');

    // ========================================
    // AUTO-FORMAT PHONE NUMBERS
    // ========================================
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            e.target.value = value;
        });
    });

    // ========================================
    // PREVENT SPACES IN EMAIL
    // ========================================
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\s/g, '');
        });
    });
});
