document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const pasteBtn = document.getElementById('paste-btn');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // Toggle buttons
    const emojiBtn = document.getElementById('emoji-btn');
    const specialCharsBtn = document.getElementById('special-chars-btn');
    const bulletsBtn = document.getElementById('bullets-btn');
    const aiBtn = document.getElementById('ai-btn');
    const dotsBtn = document.getElementById('dots-btn');
    const codeBtn = document.getElementById('code-btn');
    
    // CTA button scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Toggle button functionality
    function toggleButton(button) {
        if (button.classList.contains('red')) {
            button.classList.remove('red');
            button.classList.add('green');
        } else {
            button.classList.remove('green');
            button.classList.add('red');
        }
        processText();
    }
    
    // Event listeners for toggle buttons
    emojiBtn.addEventListener('click', () => toggleButton(emojiBtn));
    specialCharsBtn.addEventListener('click', () => toggleButton(specialCharsBtn));
    bulletsBtn.addEventListener('click', () => toggleButton(bulletsBtn));
    aiBtn.addEventListener('click', () => toggleButton(aiBtn));
    dotsBtn.addEventListener('click', () => toggleButton(dotsBtn));
    codeBtn.addEventListener('click', () => toggleButton(codeBtn));
    
    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            processText();
        } catch (err) {
            alert('Failed to read clipboard. Please paste manually.');
        }
    });
    
    // Import text file
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                textInput.value = e.target.result;
                processText();
            };
            reader.readAsText(file);
        }
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textInput.value);
            alert('Text copied to clipboard!');
        } catch (err) {
            alert('Failed to copy text. Please copy manually.');
        }
    });
    
    // Download as text file
    downloadBtn.addEventListener('click', () => {
        const text = textInput.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cleaned_text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
    
    // Process text based on active toggles
    function processText() {
        let text = textInput.value;
        
        // Remove emoji if toggle is red
        if (emojiBtn.classList.contains('red')) {
            text = removeEmojis(text);
        }
        
        // Remove special characters if toggle is red
        if (specialCharsBtn.classList.contains('red')) {
            text = removeSpecialChars(text);
        }
        
        // Handle bullets
        if (bulletsBtn.classList.contains('red')) {
            // Remove bullet points
            text = removeBulletPoints(text);
        } else {
            // Add bullet points at the beginning of each line
            text = addBulletPoints(text);
        }
        
        // Remove AI-specific markers if toggle is red
        if (aiBtn.classList.contains('red')) {
            text = removeAIMarkers(text);
        }
        
        // Handle dots/periods
        if (dotsBtn.classList.contains('red')) {
            text = removeDots(text);
        }
        
        // Handle code formatting
        if (codeBtn.classList.contains('green')) {
            // Keep code formatting
        } else {
            // Remove code formatting
            text = removeCodeFormatting(text);
        }
        
        // Update textarea without triggering another process
        if (textInput.value !== text) {
            textInput.value = text;
        }
    }
    
    // Functions for text processing
    function removeEmojis(text) {
        // Remove emoji using regex
        return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    }
    
    function removeSpecialChars(text) {
        // Remove special characters but keep basic punctuation
        return text.replace(/[^\w\s.,?!()'";\-:]/g, '');
    }
    
    function removeBulletPoints(text) {
        // Remove bullet points, dashes, asterisks at line beginnings
        return text.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥][\s]*/gm, '');
    }
    
    function addBulletPoints(text) {
        // Add bullet points at the beginning of each non-empty line
        return text.replace(/^(?=\S)/gm, '• ');
    }
    
    function removeAIMarkers(text) {
        // Remove AI markers like [AI], <AI>, etc.
        return text.replace(/\[AI\]|\<AI\>|\{AI\}/gi, '');
    }
    
    function removeDots(text) {
        // Remove all periods
        return text.replace(/\./g, '');
    }
    
    function removeCodeFormatting(text) {
        // Remove code blocks, inline code markers
        return text.replace(/```[\s\S]*?```/g, '')
                  .replace(/`([^`]*)`/g, '$1');
    }
    
    // Process initial text and setup event listening
    textInput.addEventListener('input', processText);
});
