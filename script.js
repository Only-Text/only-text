document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    
    // Checkboxes
    const removeEmojis = document.getElementById('remove-emojis');
    const removeBullets = document.getElementById('remove-bullets');
    const removeSpecial = document.getElementById('remove-special');
    const removeExtraSpaces = document.getElementById('remove-extra-spaces');
    const convertHyphens = document.getElementById('convert-hyphens');
    const trimLines = document.getElementById('trim-lines');
    
    // Process text whenever input changes or checkboxes are toggled
    inputText.addEventListener('input', processText);
    
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', processText);
    });
    
    // Clear button
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        fileName.textContent = 'No file selected';
    });
    
    // Copy button
    copyBtn.addEventListener('click', function() {
        if (outputText.value) {
            outputText.select();
            document.execCommand('copy');
            
            // Feedback animation
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', function() {
        if (outputText.value) {
            const blob = new Blob([outputText.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'clean-text.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
    
    // File upload
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            inputText.value = e.target.result;
            processText();
        };
        reader.readAsText(file);
    });
    
    // Drag and drop functionality
    inputText.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#1a365d';
    });
    
    inputText.addEventListener('dragleave', function() {
        this.style.borderColor = '';
    });
    
    inputText.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            inputText.value = e.target.result;
            processText();
        };
        reader.readAsText(file);
    });
    
    // Main text processing function
    function processText() {
        let text = inputText.value;
        
        if (!text) {
            outputText.value = '';
            return;
        }
        
        // Count removed elements
        let removedCount = 0;
        let originalLength = text.length;
        
        // 1. Remove emojis
        if (removeEmojis.checked) {
            const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
            const beforeLength = text.length;
            text = text.replace(emojiRegex, '');
            removedCount += (beforeLength - text.length);
        }
        
        // 2. Remove bullet points
        if (removeBullets.checked) {
            const bulletRegex = /^[\s•\-–—*+◦●■]+|[\s•\-–—*+◦●■]+(?=\s)/gm;
            const beforeLength = text.length;
            text = text.replace(bulletRegex, '');
            removedCount += (beforeLength - text.length);
        }
        
        // 3. Remove special characters (but keep punctuation that's needed)
        if (removeSpecial.checked) {
            // Keep letters, numbers, common punctuation, spaces
            const keepRegex = /[^\p{L}\p{N}\s.,;:!?"'()[\]{}\/\\@#$%&_=<>|~`^-]/gu;
            const beforeLength = text.length;
            text = text.replace(keepRegex, '');
            removedCount += (beforeLength - text.length);
        }
        
        // 4. Convert hyphens to spaces
        if (convertHyphens.checked) {
            // This preserves hyphens within words but replaces standalone hyphens
            text = text.replace(/(\w)-(\w)/g, '$1 $2');
        }
        
        // 5. Remove extra spaces
        if (removeExtraSpaces.checked) {
            const beforeLength = text.length;
            text = text.replace(/\s+/g, ' ').trim();
            removedCount += (beforeLength - text.length);
        }
        
        // 6. Trim line spaces
        if (trimLines.checked) {
            const beforeLength = text.length;
            text = text.split('\n').map(line => line.trim()).join('\n');
            removedCount += (beforeLength - text.length);
        }
        
        // Update output
        outputText.value = text;
    }
    
    // Create a placeholder logo if not available
    document.addEventListener('error', function(e) {
        if (e.target.id === 'logo') {
            e.target.style.display = 'none';
            document.querySelector('.logo a span').style.marginLeft = '0';
        }
    }, true);
});

// Create a favicon programmatically if none is provided
(function createFavicon() {
    if (!document.querySelector("link[rel='icon']")) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = '#1a365d';
        ctx.fillRect(0, 0, 32, 32);
        
        // Draw "OT" text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OT', 16, 16);
        
        // Create favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = canvas.toDataURL();
        document.head.appendChild(link);
    }
})();
