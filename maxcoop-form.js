// MAXCOOP Subscription Form - With PDF Generation and Gmail Integration
// ========================================================================

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

    // Handle passport photo upload
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

    // Make toggleIdUpload and handleIdUpload globally accessible
    window.toggleIdUpload = function(idType) {
        const checkbox = document.querySelector(`input[name="idType"][value="${idType}"]`);
        const uploadSection = document.getElementById(`upload_${idType}`);
        
        if (checkbox.checked) {
            uploadSection.style.display = 'block';
        } else {
            uploadSection.style.display = 'none';
            // Clear the uploaded file
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

    window.handleIdUpload = function(idType) {
        const fileInput = document.getElementById(`file_${idType}`);
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

            // Show preview
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
    };

    window.removeIdUpload = function(idType) {
        const fileInput = document.getElementById(`file_${idType}`);
        const preview = document.getElementById(`preview_${idType}`);
        
        fileInput.value = '';
        preview.classList.remove('active');
        preview.innerHTML = '';
        idDocuments[idType] = null;
    };

    // Auto-set today's date for declaration
    const today = new Date().toISOString().split('T')[0];
    if (form.declarationDate && !form.declarationDate.value) {
        form.declarationDate.value = today;
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading indicator
        loadingIndicator.style.display = 'flex';

        try {
            // Collect form data
            const formData = collectFormData();

            // Generate PDF with passport photo and ID documents
            const pdfBlob = await generatePDF(formData, passportImageData, idDocuments);
            const fileName = `MAXCOOP_${formData.subscriber.surname}_${Date.now()}.pdf`;

            // Hide loading
            loadingIndicator.style.display = 'none';

            // Try to share via mobile (best option)
            if (navigator.share && navigator.canShare) {
                try {
                    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: 'MAXCOOP Subscription Form',
                            text: 'Please send this subscription form to maxcoopforms@gmail.com',
                            files: [file]
                        });
                        
                        // Show success message after sharing
                        alert('✅ PDF Generated!\n\nPlease:\n1. Select Gmail from the share menu\n2. Add recipient: maxcoopforms@gmail.com\n3. Click Send\n\nThank you!');
                        return;
                    }
                } catch (shareError) {
                    console.log('Share failed, falling back to download:', shareError);
                }
            }

            // Fallback: Download PDF and open Gmail compose
            downloadPDF(pdfBlob, fileName);
            
            // Wait a moment for download to start
            setTimeout(() => {
                openGmailCompose(formData.subscriber.fullName);
                
                // Show instructions
                showInstructions(fileName);
            }, 500);

        } catch (error) {
            console.error('Submission error:', error);
            loadingIndicator.style.display = 'none';
            alert('❌ Error generating PDF.\n\nPlease try again or contact: 5402057281\n\nError: ' + error.message);
        }
    });

    // Download PDF
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

    // Open Gmail compose window
    function openGmailCompose(subscriberName) {
        const subject = encodeURIComponent(`MAXCOOP Subscription - ${subscriberName}`);
        const body = encodeURIComponent(
            `Dear MAXCOOP Admin,\n\n` +
            `Please find attached my subscription form for Coop City, Anambra.\n\n` +
            `Name: ${subscriberName}\n\n` +
            `Thank you!\n`
        );
        
        // Try Gmail web first (better for mobile)
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
        window.open(gmailUrl, '_blank');
    }

    // Show clear instructions
    function showInstructions(filename) {
        const instructions = `
📧 NEXT STEPS:

1. ✅ Your PDF has been downloaded: "${filename}"

2. 📱 Gmail should open in a new tab/window

3. ✉️ In Gmail:
   • TO: maxcoopforms@gmail.com
   • Click the 📎 attachment icon
   • Select the downloaded PDF
   • Click SEND

That's it! Thank you for choosing MAXCOOP! 🏡
        `.trim();

        alert(instructions);
    }

    // Validate form
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            // Check for radio buttons and checkboxes
            if (field.type === 'radio') {
                const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.parentElement.parentElement.style.borderLeft = '3px solid #dc2626';
                } else {
                    field.parentElement.parentElement.style.borderLeft = 'none';
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = form.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(cb => cb.checked);
                
                if (!isChecked) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.parentElement.style.borderLeft = '3px solid #dc2626';
                } else {
                    field.parentElement.style.borderLeft = 'none';
                }
            } else {
                // Regular inputs
                if (!field.value.trim()) {
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#cbd5e1';
                }
            }
        });

        if (!isValid) {
            alert('⚠️ Please fill in all required fields marked with (*)\n\nScroll up to see highlighted fields.');
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    // Collect all form data
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
                idType: getCheckedValues('idType').join(', ') || 'N/A',
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

    // Helper function to get checked radio value
    function getCheckedValue(name) {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : '';
    }

    // Helper function to get all checked checkbox values
    function getCheckedValues(name) {
        const checked = form.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(cb => cb.value);
    }

    // Single checkbox selection for certain groups
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

    // Apply single selection to these checkbox groups
    setupSingleCheckbox('title');
    setupSingleCheckbox('plotType');
    setupSingleCheckbox('plotSize');
    setupSingleCheckbox('paymentPlan');

    // Auto-format phone numbers
    const phoneInputs = form.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.slice(0, 11);
            }
            e.target.value = value;
        });
    });

    // Prevent spaces in email fields
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\s/g, '');
        });
    });
});
