document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const pasteBtn = document.getElementById('paste-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const removeEmoji = document.getElementById('remove-emoji');
    const removeBullets = document.getElementById('remove-bullets');
    const removeSpecial = document.getElementById('remove-special');
    const replaceHyphens = document.getElementById('replace-hyphens');

    // Process text function
    function processText() {
        let text = inputText.value;
        
        if (text.trim() === '') {
            outputText.value = '';
            return;
        }
        
        // Remove emojis
        if (removeEmoji.checked) {
            // This regex range covers most common emoji Unicode ranges
            text = text.replace(/[\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        }
        
        // Remove bullet points
        if (removeBullets.checked) {
            // Common bullet point characters and markdown bullets
            text = text.replace(/[•‣⁃⁌⁍∙◦→⇒◆◇◈★☆✦✧✩✪✫✬✭✮✯❋❃❂]/g, '');
            text = text.replace(/^\s*[\*\-\+]\s+/gm, ''); // Markdown bullets
            text = text.replace(/^\s*\d+\.\s+/gm, ''); // Numbered lists
        }
        
        // Remove special characters
        if (removeSpecial.checked) {
            // Preserve essential punctuation while removing other special characters
            text = text.replace(/[^\w\s.,;:!?()'"\/\-]/g, '');
        }
        
        // Replace hyphens in words with spaces
        if (replaceHyphens.checked) {
            text = text.replace(/(\w+)-(\w+)/g, '$1 $2');
        }
        
        // Normalize spacing: replace multiple spaces with single space
        text = text.replace(/\s+/g, ' ');
        
        // Remove spaces at the beginning of lines
        text = text.replace(/^\s+/gm, '');
        
        // Clean up extra spaces around punctuation
        text = text.replace(/\s+([.,;:!?])/g, '$1');
        
        outputText.value = text.trim();
    }

    // Event listeners
    inputText.addEventListener('input', processText);
    
    // Toggle options event listeners
    removeEmoji.addEventListener('change', processText);
    removeBullets.addEventListener('change', processText);
    removeSpecial.addEventListener('change', processText);
    replaceHyphens.addEventListener('change', processText);

    // Paste button functionality
    pasteBtn.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            inputText.value = text;
            processText();
        } catch (err) {
            alert('Unable to paste from clipboard. Please paste manually or check permissions.');
        }
    });

    // Upload button functionality
    uploadBtn.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.docx,.doc,.rtf,.md';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                inputText.value = e.target.result;
                processText();
            };
            
            reader.readAsText(file);
        };
        
        fileInput.click();
    });

    // Clear button functionality
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
    });

    // Copy button functionality
    copyBtn.addEventListener('click', async function() {
        if (outputText.value.trim() === '') return;
        
        try {
            await navigator.clipboard.writeText(outputText.value);
            
            // Visual feedback for copy
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        } catch (err) {
            alert('Unable to copy to clipboard. Please copy manually or check permissions.');
        }
    });

    // Download button functionality
    downloadBtn.addEventListener('click', function() {
        if (outputText.value.trim() === '') return;
        
        const blob = new Blob([outputText.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'cleaned-text.txt';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });

    // File drag and drop handling
    inputText.addEventListener('dragover', function(e) {
        e.preventDefault();
        inputText.style.borderColor = var(--secondary-color);
    });

    inputText.addEventListener('dragleave', function() {
        inputText.style.borderColor = var(--border-color);
    });

    inputText.addEventListener('drop', function(e) {
        e.preventDefault();
        inputText.style.borderColor = var(--border-color);
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            inputText.value = e.target.result;
            processText();
        };
        
        reader.readAsText(file);
    });

    // Handle scroll sync between textareas
    inputText.addEventListener('scroll', function() {
        const percentage = inputText.scrollTop / (inputText.scrollHeight - inputText.clientHeight);
        outputText.scrollTop = percentage * (outputText.scrollHeight - outputText.clientHeight);
    });

    outputText.addEventListener('scroll', function() {
        const percentage = outputText.scrollTop / (outputText.scrollHeight - outputText.clientHeight);
        inputText.scrollTop = percentage * (inputText.scrollHeight - inputText.clientHeight);
    });

    // Scroll to tool when 'Use the Tool' button is clicked
    document.querySelector('.cta-button').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.tool-section').scrollIntoView({
            behavior: 'smooth'
        });
    });
});
