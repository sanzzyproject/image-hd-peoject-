document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    // Trigger buttons (bisa ada banyak di halaman)
    const triggerButtons = document.querySelectorAll('.trigger-upload-btn');
    const fileInput = document.getElementById('fileInput');
    
    // Overlay & Modal elements
    const uploadOverlay = document.getElementById('uploadOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const uploadForm = document.getElementById('uploadForm');
    
    // Inside Modal elements
    const previewArea = document.getElementById('previewArea');
    const imagePreview = document.getElementById('imagePreview');
    const controlsArea = document.getElementById('controlsArea');
    const submitBtn = document.getElementById('submitBtn');
    
    // States elements
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const resultImage = document.getElementById('resultImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const errorMsg = document.getElementById('errorMsg');

    // --- Event Listeners ---

    // 1. Activate hidden file input when any "Unggah gambar" button is clicked
    triggerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            fileInput.click();
        });
    });

    // 2. Handle File Selection
    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Harap upload file gambar (JPG, PNG, HEIC).');
            return;
        }

        // Reset previous states
        resetModalState();

        const reader = new FileReader();
        reader.onload = (e) => {
            // Show preview
            imagePreview.src = e.target.result;
            previewArea.style.display = 'block';
            controlsArea.style.display = 'block';
            // Open the overlay modal
            uploadOverlay.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Close Overlay
    closeOverlayBtn.addEventListener('click', () => {
        uploadOverlay.classList.add('hidden');
        fileInput.value = ''; // Clear input
    });

    // Reset Button (Upload Lainnya)
    resetBtn.addEventListener('click', () => {
        resetModalState();
        fileInput.click();
    });


    function resetModalState() {
        previewArea.style.display = 'none';
        controlsArea.style.display = 'none';
        loading.classList.add('hidden');
        resultDiv.classList.add('hidden');
        errorMsg.classList.add('hidden');
        submitBtn.disabled = false;
    }

    // --- Handle Form Submit (Backend Interaction - Core Logic Unchanged) ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('scale', document.getElementById('scale').value);

        // UI Updates during process
        submitBtn.disabled = true;
        controlsArea.style.display = 'none'; // Hide controls during processing
        loading.classList.remove('hidden');
        errorMsg.classList.add('hidden');

        try {
            // Call existing backend API
            const response = await fetch('/api/upscale', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Gagal memproses gambar.');

            // Show Success Result
            resultImage.src = data.url;
            downloadBtn.href = data.url;
            resultDiv.classList.remove('hidden');

        } catch (error) {
            // Show Error
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
            controlsArea.style.display = 'block'; // Show controls again to retry
        } finally {
            loading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
});
