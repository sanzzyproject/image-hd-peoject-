document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
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

    // --- Event Listeners (CORE LOGIC) ---

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
        // Hapus atribut download saat reset agar bersih
        downloadBtn.removeAttribute('download');
    }

    // --- Handle Form Submit (BACKEND RESTORED + AUTO DOWNLOAD ADDED) ---
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
            // --- KODE BACKEND ASLI (RESTORED) ---
            const response = await fetch('/api/upscale', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Gagal memproses gambar.');

            // Show Success Result
            resultImage.src = data.url;
            downloadBtn.href = data.url;

            // --- UPDATE: AUTO DOWNLOAD LOGIC ---
            // Menambahkan atribut 'download' agar browser otomatis mengunduh saat diklik
            // Nama file diberi timestamp agar unik
            const fileName = `pixelcut-hd-${new Date().getTime()}.png`;
            downloadBtn.setAttribute('download', fileName);
            
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


    // --- 3. COMPARISON SLIDER LOGIC (FITUR VISUAL BARU) ---
    // Logika ini untuk menggeser garis before-after pada halaman utama
    
    const sliderContainer = document.getElementById('comparisonSlider');
    const beforeWrapper = document.getElementById('beforeWrapper');
    const handle = document.getElementById('scrollerHandle');
    
    if(sliderContainer && beforeWrapper && handle) {
        let isDragging = false;

        const moveSlider = (xPosition) => {
            let containerRect = sliderContainer.getBoundingClientRect();
            let offsetX = xPosition - containerRect.left;
            
            if (offsetX < 0) offsetX = 0;
            if (offsetX > containerRect.width) offsetX = containerRect.width;

            const percentage = (offsetX / containerRect.width) * 100;

            beforeWrapper.style.width = percentage + "%";
            handle.style.left = percentage + "%";
        };

        // Mouse Events
        sliderContainer.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            moveSlider(e.clientX);
        });

        // Touch Events (Mobile)
        sliderContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            moveSlider(e.touches[0].clientX);
        }, {passive: true});

        window.addEventListener('touchend', () => isDragging = false);
        
        sliderContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            moveSlider(e.touches[0].clientX);
        }, {passive: false});
    }
});
