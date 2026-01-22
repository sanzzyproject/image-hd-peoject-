document.addEventListener('DOMContentLoaded', () => {
    // --- Elements (Updated references for new modal structure) ---
    const triggerButtons = document.querySelectorAll('.trigger-upload-btn');
    const fileInput = document.getElementById('fileInput');
    const uploadOverlay = document.getElementById('uploadOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlayBtn');
    const uploadForm = document.getElementById('uploadForm');
    
    // Editor UI Elements
    const loadingDiv = document.getElementById('loading');
    const errorMsg = document.getElementById('errorMsg');
    const editorContent = document.getElementById('editorContent');
    const editorAfterImg = document.getElementById('editorAfterImg');
    const editorBeforeImg = document.getElementById('editorBeforeImg');
    // Note: Resolution labels are static for now as backend doesn't return res
    // const resAfterLabel = document.getElementById('resAfterLabel'); 
    // const resBeforeLabel = document.getElementById('resBeforeLabel');
    const downloadBtnHeader = document.getElementById('downloadBtnHeader');
    const retryBtn = document.getElementById('retryBtn');


    // --- Event Listeners ---

    triggerButtons.forEach(btn => btn.addEventListener('click', () => fileInput.click()));

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Harap upload file gambar (JPG, PNG, HEIC).');
            return;
        }
        
        // Reset state & show modal
        uploadOverlay.classList.remove('hidden');
        editorContent.classList.add('hidden');
        errorMsg.classList.add('hidden');
        loadingDiv.classList.remove('hidden'); // Start showing loading immediately
        downloadBtnHeader.classList.add('hidden');

        // Set "Before" image
        const reader = new FileReader();
        reader.onload = (e) => {
            editorBeforeImg.src = e.target.result;
            // Auto-submit form after file is read
            uploadForm.dispatchEvent(new Event('submit'));
        };
        reader.readAsDataURL(file);
    }

    closeOverlayBtn.addEventListener('click', () => {
        uploadOverlay.classList.add('hidden');
        fileInput.value = '';
        resetEditorState();
    });

    retryBtn.addEventListener('click', () => {
        fileInput.click(); // Simple retry logic: pick file again
    });

    function resetEditorState() {
        loadingDiv.classList.add('hidden');
        editorContent.classList.add('hidden');
        errorMsg.classList.add('hidden');
        downloadBtnHeader.classList.add('hidden');
        editorAfterImg.src = '';
        editorBeforeImg.src = '';
    }

    // --- Handle Form Submit (Backend Interaction - Core Logic Unchanged) ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        // Scale is fixed to 4 in hidden input
        formData.append('scale', document.getElementById('scale').value); 

        // UI Updates: Ensure loading is shown
        loadingDiv.classList.remove('hidden');
        editorContent.classList.add('hidden');
        errorMsg.classList.add('hidden');
        downloadBtnHeader.classList.add('hidden');

        try {
            const response = await fetch('/api/upscale', { method: 'POST', body: formData });
            const data = await response.json();

            if (!data.success) throw new Error(data.error || 'Gagal memproses gambar.');

            // Success: Show editor content
            editorAfterImg.src = data.url;
            downloadBtnHeader.href = data.url;
            downloadBtnHeader.classList.remove('hidden');
            editorContent.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
            
            // (Optional) Update resolution labels here if backend provided them
            // resAfterLabel.textContent = `Setelah ${data.width}x${data.height}`;

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
        }
    });
});
