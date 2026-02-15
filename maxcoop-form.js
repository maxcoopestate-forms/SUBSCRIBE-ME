// MAXCOOP Subscription Form - With PDF Generation and Gmail Integration
// ========================================================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('maxcoopForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const passportUpload = document.getElementById('passportUpload');
    const passportImage = document.getElementById('passportImage');
    const photoPreview = document.getElementById('photoPreview');
    let passportImageData = null;

    // ✅ FIXED: Use consistent keys only
    const idDocuments = {
        NATIONAL_ID: null,
        DRIVERS_LICENCE: null,
        INTERNATIONAL_PASSPORT: null,
        NIN: null
    };

    // ========================================
    // PASSPORT UPLOAD
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
    // TOGGLE ID UPLOAD
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
    // FILE INPUT LISTENERS
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

    // ========================================
    // HANDLE ID UPLOAD
    // ========================================
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

            console.log('✅ Uploaded:', idType, idDocuments[idType]); // DEBUG

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

    // ========================================
    // REMOVE FILE
    // ========================================
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

    // ========================================
    // AUTO DATE
    // ========================================
    const today = new Date().toISOString().split('T')[0];
    if (form.declarationDate && !form.declarationDate.value) {
        form.declarationDate.value = today;
    }

    // ========================================
    // FORM SUBMIT
    // ========================================
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) return;

        loadingIndicator.style.display = 'flex';

        try {
            const formData = collectFormData();

            console.log('📦 FINAL ID DOCUMENTS:', idDocuments); // DEBUG

            const pdfBlob = await generatePDF(formData, passportImageData, idDocuments);
            const fileName = `MAXCOOP_${formData.subscriber.surname}_${Date.now()}.pdf`;

            loadingIndicator.style.display = 'none';

            downloadPDF(pdfBlob, fileName);

        } catch (error) {
            console.error('❌ ERROR:', error);
            loadingIndicator.style.display = 'none';
            alert('Error generating PDF: ' + error.message);
        }
    });

    // ========================================
    // DOWNLOAD
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

    // ========================================
    // VALIDATION (FIXED)
    // ========================================
    function validateForm() {
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

        return true;
    }

    // ========================================
    // COLLECT DATA (FIXED)
    // ========================================
    function collectFormData() {
        return {
            subscriber: {
                surname: form.surname.value,
                fullName: `${form.surname.value} ${form.otherNames.value}`,
                
                // ✅ IMPORTANT FIX: keep exact keys
                idType: getCheckedValues('idType').join(',') || 'N/A'
            }
        };
    }

    function getCheckedValues(name) {
        const checked = form.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checked).map(cb => cb.value);
    }
});
