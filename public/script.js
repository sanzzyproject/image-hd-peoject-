document.addEventListener('DOMContentLoaded', () => {
    // --- Elements for Upload Functionality ---
    const triggerButtons = document.querySelectorAll('.trigger-upload-btn');
    const fileInput = document.getElementById('fileInput');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const uploadForm = document.getElementById('uploadForm');
    
    // Modal elements
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

    // --- 1. UPLOAD LOGIC (Existing Code) ---

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            fileInput.click();
        });
    });

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
        resetModalState();
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewArea.style.display = 'block';
            controlsArea.style.display = 'block';
            uploadOverlay.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    closeOverlayBtn.addEventListener('click', () => {
        uploadOverlay.classList.add('hidden');
        fileInput.value = ''; 
    });

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

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('scale', document.getElementById('scale').value);

        submitBtn.disabled = true;
        controlsArea.style.display = 'none';
        loading.classList.remove('hidden');
        errorMsg.classList.add('hidden');

        try {
            // Simulated Backend Call (Replace with real Fetch)
            // const response = await fetch('/api/upscale', { method: 'POST', body: formData });
            // const data = await response.json();
            
            // Simulation for Demo purposes:
            await new Promise(r => setTimeout(r, 2000)); 
            const data = { success: true, url: URL.createObjectURL(file) }; // Just echoing back for demo

            if (!data.success) throw new Error(data.error || 'Gagal memproses gambar.');

            resultImage.src = data.url;
            downloadBtn.href = data.url;
            resultDiv.classList.remove('hidden');

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
            controlsArea.style.display = 'block';
        } finally {
            loading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // --- 2. COMPARISON SLIDER LOGIC (NEW UPDATE) ---
    
    const sliderContainer = document.getElementById('comparisonSlider');
    const beforeWrapper = document.getElementById('beforeWrapper');
    const handle = document.getElementById('scrollerHandle');
    
    let isDragging = false;

    // Helper to calculate and apply position
    const moveSlider = (xPosition) => {
        let containerRect = sliderContainer.getBoundingClientRect();
        
        // Menghitung posisi relatif kursor terhadap container
        let offsetX = xPosition - containerRect.left;
        
        // Batasi agar tidak keluar container
        if (offsetX < 0) offsetX = 0;
        if (offsetX > containerRect.width) offsetX = containerRect.width;

        // Hitung persentase
        const percentage = (offsetX / containerRect.width) * 100;

        // Terapkan ke lebar overlay dan posisi handle
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

    // Touch Events (HP)
    sliderContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        // Pindahkan langsung saat tap pertama
        moveSlider(e.touches[0].clientX);
    }, {passive: true}); // Passive true for better scroll performance check

    window.addEventListener('touchend', () => isDragging = false);
    
    sliderContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        moveSlider(e.touches[0].clientX);
    }, {passive: false}); // Prevent default scrolling when dragging slider

    // Click to jump (Optional, for UX)
    sliderContainer.addEventListener('click', (e) => {
        moveSlider(e.clientX);
    });
});
