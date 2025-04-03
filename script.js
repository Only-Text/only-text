document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputTextArea = document.getElementById('input-text');
    const outputTextArea = document.getElementById('output-text');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileUpload = document.getElementById('file-upload');
    
    // Option checkboxes
    const removeEmojisCheckbox = document.getElementById('remove-emojis');
    const removeBulletsCheckbox = document.getElementById('remove-bullets');
    const removeSpecialCharsCheckbox = document.getElementById('remove-special-chars');
    const replaceHyphensCheckbox = document.getElementById('replace-hyphens');
    
    // Process text whenever input changes or options change
    inputTextArea.addEventListener('input', processText);
    removeEmojisCheckbox.addEventListener('change', processText);
    removeBulletsCheckbox.addEventListener('change', processText);
    removeSpecialCharsCheckbox.addEventListener('change', processText);
    replaceHyphensCheckbox.addEventListener('change', processText);
    
    // Clear button functionality
    clearBtn.addEventListener('click', function() {
        inputTextArea.value = '';
        outputTextArea.value = '';
    });
    
    // Copy button functionality
    copyBtn.addEventListener('click', function() {
        if (outputTextArea.value) {
            outputTextArea.select();
            document.execCommand('copy');
            
            // Visual feedback for copying
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        }
    });
    
    // Download button functionality
    downloadBtn.addEventListener('click', function() {
        if (outputTextArea.value) {
            const blob = new Blob([outputTextArea.value], { type: 'text/plain' });
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
    
    // Upload button functionality
    uploadBtn.addEventListener('click', function() {
        fileUpload.click();
    });
    
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            inputTextArea.value = e.target.result;
            processText();
        };
        reader.readAsText(file);
    });
    
    // Drag and drop functionality
    inputTextArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        inputTextArea.classList.add('dragover');
    });
    
    inputTextArea.addEventListener('dragleave', function() {
        inputTextArea.classList.remove('dragover');
    });
    
    inputTextArea.addEventListener('drop', function(e) {
        e.preventDefault();
        inputTextArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            inputTextArea.value = e.target.result;
            processText();
        };
        reader.readAsText(file);
    });
    
    // Process text function - core functionality
    function processText() {
        let text = inputTextArea.value;
        
        if (!text) {
            outputTextArea.value = '';
            return;
        }
        
        // Remove emojis
        if (removeEmojisCheckbox.checked) {
            // Unicode ranges for emojis
            text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        }
        
        // Remove bullet points
        if (removeBulletsCheckbox.checked) {
            // Common bullet point characters and formatting
            text = text.replace(/[•○●◆◇◈★☆✓✔✕✖✗✘✙✚✛✜✝✞✟✠✡✢✣✤✥✦✧✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄❅❆❇❈❉❊❋❖]/g, '');
            // Numbered lists (1., 2., i., ii., a., etc.)
            text = text.replace(/^(\d+[\.\)]\s|\w+[\.\)]\s|[\*\-\+]\s)/gm, '');
        }
        
        // Remove special characters
        if (removeSpecialCharsCheckbox.checked) {
            // Preserve necessary punctuation
            text = text.replace(/[^\w\s\.\,\?\!\":;'\/\(\)\[\]@#$%&*+=<>{}]/g, '');
        }
        
        // Replace hyphens with spaces
        if (replaceHyphensCheckbox.checked) {
            text = text.replace(/(\w)-(\w)/g, '$1 $2');
        }
        
        // Clean up multiple spaces and align text left
        text = text.replace(/\s+/g, ' ').trim();
        text = text.split('\n').map(line => line.trim()).join('\n');
        
        outputTextArea.value = text;
    }
});
