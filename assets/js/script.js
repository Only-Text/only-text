
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const fileUpload = document.getElementById('file-upload');
    
    // Settings Elements
    const removeEmojis = document.getElementById('remove-emojis');
    const removeBullets = document.getElementById('remove-bullets');
    const removeSpecialChars = document.getElementById('remove-special-chars');
    const removeExtraSpaces = document.getElementById('remove-extra-spaces');
    const fixHyphenation = document.getElementById('fix-hyphenation');
    const trimLines = document.getElementById('trim-lines');

    // Process text when input changes (real-time processing)
    inputText.addEventListener('input', processText);
    
    // Process text when settings change
    removeEmojis.addEventListener('change', processText);
    removeBullets.addEventListener('change', processText);
    removeSpecialChars.addEventListener('change', processText);
    removeExtraSpaces.addEventListener('change', processText);
    fixHyphenation.addEventListener('change', processText);
    trimLines.addEventListener('change', processText);

    // Clear button
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        if (!outputText.value) return;
        
        outputText.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = 'var(--success)';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '';
        }, 1500);
    });

    // Download button
    downloadBtn.addEventListener('click', function() {
        if (!outputText.value) return;
        
        const blob = new Blob([outputText.value], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = 'clean-text.txt';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    });

    // File upload
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            inputText.value = e.target.result;
            processText();
        };
        
        reader.readAsText(file);
    });

    // Drag and drop support
    inputText.addEventListener('dragover', function(e) {
        e.preventDefault();
        inputText.classList.add('dragover');
    });

    inputText.addEventListener('dragleave', function() {
        inputText.classList.remove('dragover');
    });

    inputText.addEventListener('drop', function(e) {
        e.preventDefault();
        inputText.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            inputText.value = e.target.result;
            processText();
        };
        
        reader.readAsText(file);
    });

    // Process text function
    function processText() {
        let text = inputText.value;
        if (!text) {
            outputText.value = '';
            return;
        }

        // Remove emojis
        if (removeEmojis.checked) {
            // Match emoji pattern - covers most emojis including combined ones
            text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        }

        // Remove bullet points
        if (removeBullets.checked) {
            // Common bullet point characters and formats
            text = text.replace(/[•●■◆▪▫◊●○♦⦿⚫⚪◉☉■□▢▣▤▥▦▧▨▩▪▫▬▭▮▯◆◇◈◉◊○◌◍◎●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡]/g, '');
            text = text.replace(/[\s]*[-*]\s+/g, ''); // Markdown bullet points
            text = text.replace(/[\s]*\d+\.\s+/g, ''); // Numbered lists
        }

        // Remove special characters (but keep basic punctuation)
        if (removeSpecialChars.checked) {
            // Keep periods, commas, semicolons, colons, question marks, exclamation points, and quotes
            text = text.replace(/[^\w\s\.,;:?!'"()/-]/g, '');
        }

        // Fix hyphenation
        if (fixHyphenation.checked) {
            // Replace hyphens with spaces but keep hyphens in words 
            text = text.replace(/(\w)-(\w)/g, '$1 $2');
        }

        // Remove extra spaces
        if (removeExtraSpaces.checked) {
            text = text.replace(/\s+/g, ' ');
        }

        // Trim lines
        if (trimLines.checked) {
            // Trim beginning and end of each line
            const lines = text.split('\n');
            text = lines.map(line => line.trim()).join('\n');
            
            // Remove empty lines
            text = text.replace(/^\s*[\r\n]/gm, '');
        }

        // Always trim the final text
        text = text.trim();

        // Update output
        outputText.value = text;
    }

    // Initialize the app with any text that might be present
    processText();
});
