document.addEventListener('DOMContentLoaded', () => {
    const dropzone1 = document.getElementById('dropzone1');
    const dropzone2 = document.getElementById('dropzone2');
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const status1 = document.getElementById('status1');
    const status2 = document.getElementById('status2');
    const compareBtn = document.getElementById('compare-btn');

    let file1 = null;
    let file2 = null;

    // Helper to setup dropzone events
    const setupDropzone = (dropzone, fileInput, statusEl, isFile1) => {
        // Click to upload
        dropzone.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0], statusEl, isFile1);
            }
        });

        // Drag and drop events
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files; // Sync with input
                handleFile(e.dataTransfer.files[0], statusEl, isFile1);
            }
        });
    };

    // Handle the selected/dropped file
    const handleFile = (file, statusEl, isFile1) => {
        // Store reference
        if (isFile1) {
            file1 = file;
        } else {
            file2 = file;
        }

        // Update UI
        statusEl.textContent = `Selected: ${file.name}`;
        statusEl.classList.add('visible');

        // Check if both files are ready
        checkReadyState();
    };

    // Enable button if both files are uploaded
    const checkReadyState = () => {
        if (file1 && file2) {
            compareBtn.classList.remove('btn-disabled');
            compareBtn.disabled = false;
        } else {
            compareBtn.classList.add('btn-disabled');
            compareBtn.disabled = true;
        }
    };

    // Handle compare button click
    compareBtn.addEventListener('click', () => {
        if (file1 && file2) {
            alert('File comparison functionality will be implemented in a future update!\n\nBase File: ' + file1.name + '\nNew File: ' + file2.name);
        }
    });

    // Initialize dropzones
    setupDropzone(dropzone1, file1Input, status1, true);
    setupDropzone(dropzone2, file2Input, status2, false);
});
