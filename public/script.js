document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const triggerButtons = document.querySelectorAll('.trigger-upload-btn');
    const fileInput = document.getElementById('fileInput');
    
    // Editor Page elements
    const uploadOverlay = document.getElementById('uploadOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const uploadForm = document.getElementById('uploadForm');
    
    // Inside Editor
    const previewArea = document.getElementById('previewArea');
    const imagePreview = document.getElementById('imagePreview');
    const controlsArea = document.getElementById('controlsArea'); // Panel pilih skala
    const submitBtn = document.getElementById('submitBtn');
    
    // Result States
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const resultImage = document.getElementById('resultImage');
    const resultActions = document.getElementById('resultActions'); // Tombol Download & Reset
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const errorMsg = document.getElementById('errorMsg');

    // Variabel untuk menyimpan URL hasil agar bisa di-download otomatis
    let currentResultUrl = '';

    // --- 1. CORE FLOW (Upload -> Full Page Editor) ---

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

        // Reset state
        resetEditorState();

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            // Tampilkan elemen editor
            previewArea.style.display = 'block';
            controlsArea.style.display = 'block';
            
            // Buka Overlay Full Screen
            uploadOverlay.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Tombol Kembali (Close Editor)
    closeOverlayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        uploadOverlay.classList.add('hidden');
        fileInput.value = ''; 
    });

    // Tombol Edit Foto Lain (Reset)
    resetBtn.addEventListener('click', () => {
        resetEditorState();
        fileInput.click();
    });

    function resetEditorState() {
        previewArea.style.display = 'none';
        controlsArea.style.display = 'none';
        
        loading.classList.add('hidden');
        resultDiv.classList.add('hidden');
        resultActions.classList.add('hidden');
        errorMsg.classList.add('hidden');
        
        submitBtn.disabled = false;
        currentResultUrl = '';
    }

    // --- 2. BACKEND INTERACTION (Strictly Preserved) ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('scale', document.getElementById('scale').value);

        // UI Updates: Sembunyikan kontrol, munculkan loading
        submitBtn.disabled = true;
        controlsArea.style.display = 'none';
        loading.classList.remove('hidden');
        errorMsg.classList.add('hidden');

        try {
            // --- KODE BACKEND ASLI ---
            const response = await fetch('/api/upscale', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Gagal memproses gambar.');

            // Sukses
            currentResultUrl = data.url; // Simpan URL
            resultImage.src = data.url;
            
            // Sembunyikan preview asli, tampilkan hasil
            previewArea.style.display = 'none';
            resultDiv.classList.remove('hidden');
            
            // Tampilkan tombol aksi (Download)
            resultActions.classList.remove('hidden');

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
            controlsArea.style.display = 'block'; // Tampilkan kontrol lagi untuk coba ulang
            previewArea.style.display = 'block';
        } finally {
            loading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // --- 3. AUTO DOWNLOAD LOGIC (FORCE DOWNLOAD FIX) ---
    downloadBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!currentResultUrl) return;

        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = "Mengunduh...";
        downloadBtn.disabled = true;

        try {
            // Teknik Force Download:
            // 1. Fetch ulang gambar sebagai Blob (Binary Large Object)
            // Ini mengatasi masalah cross-origin atau browser yang hanya membuka tab baru
            const response = await fetch(currentResultUrl);
            const blob = await response.blob();
            
            // 2. Buat URL objek sementara dari blob
            const blobUrl = window.URL.createObjectURL(blob);
            
            // 3. Buat elemen anchor <a> tersembunyi
            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            
            // Buat nama file unik
            const fileName = `pixelcut-hd-${new Date().getTime()}.png`;
            tempLink.setAttribute('download', fileName);
            
            // 4. Klik link secara programatis
            document.body.appendChild(tempLink);
            tempLink.click();
            
            // 5. Bersihkan
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(blobUrl);

        } catch (err) {
            console.error("Download failed:", err);
            alert("Gagal mengunduh otomatis. Gambar akan dibuka di tab baru.");
            window.open(currentResultUrl, '_blank');
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    });

    // --- 4. SLIDER LOGIC (Home Page) ---
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

        sliderContainer.addEventListener('mousedown', () => isDragging = true);
        window.addEventListener('mouseup', () => isDragging = false);
        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            moveSlider(e.clientX);
        });

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
