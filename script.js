document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const pasteBtn = document.getElementById('paste-btn');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Toggle buttons
    const emojiBtn = document.getElementById('emoji-btn');
    const bulletsBtn = document.getElementById('bullets-btn');
    const dotsBtn = document.getElementById('dots-btn');
    const aiBtn = document.getElementById('ai-btn');
    const specialCharsBtn = document.getElementById('special-chars-btn');
    const codeBtn = document.getElementById('code-btn');

    // Store original text for safe reprocessing
    let originalText = '';
    
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

    // Updated toggle button functionality
    function toggleButton(button) {
        // Special case for buttons that can only be red (off)
        if (button === specialCharsBtn || button === codeBtn) {
            // Special chars and code buttons animation: red -> orange -> red
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 750);
            
            // Make sure they stay red
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
        } 
        // Special case for AI button - only animation, no functionality
        else if (button === aiBtn) {
            // AI button special animation: red -> orange -> red
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 750);
            
            // Make sure it stays red
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
            
            // No processText() call for AI button - it has no functionality
            return;
        }
        // Normal toggle buttons (can be green or red)
        else {
            if (button.classList.contains('red')) {
                button.classList.remove('red');
                button.classList.add('green');
            } else {
                button.classList.remove('green');
                button.classList.add('red');
            }
        }
        
        processText();
    }
    
    // Event listeners for toggle buttons
    emojiBtn.addEventListener('click', () => toggleButton(emojiBtn));
    bulletsBtn.addEventListener('click', () => toggleButton(bulletsBtn));
    dotsBtn.addEventListener('click', () => toggleButton(dotsBtn));
    aiBtn.addEventListener('click', () => toggleButton(aiBtn));
    specialCharsBtn.addEventListener('click', () => toggleButton(specialCharsBtn));
    codeBtn.addEventListener('click', () => toggleButton(codeBtn));
    
    // Clear button functionality
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        originalText = '';
    });
    
    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            originalText = text;
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
                originalText = e.target.result;
                processText();
            };
            reader.readAsText(file);
        }
    });
    
    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textInput.value);
            // Flash effect instead of alert
            textInput.style.backgroundColor = '#e6ffec';
            setTimeout(() => {
                textInput.style.backgroundColor = '';
            }, 300);
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

    // List of emojis for random selection
    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
    ];

    // Get random emoji from list
    function getRandomEmoji() {
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    // Process text function
    function processText() {
        // Get the current content
        let text = textInput.value;
        
        // Split text into lines for better processing
        let lines = text.split('\n');
        
        // Process each line based on active toggles
        lines = lines.map(line => {
            let processedLine = line;
            
            // Create a clean version of the line without leading/trailing spaces
            let cleanLine = processedLine.trim();
            
            // First, remove all formatting to start from a clean state
            // Remove all bullets
            cleanLine = cleanLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
            // Remove all emojis from beginning
            cleanLine = cleanLine.replace(/^\p{Emoji}\s*/gu, '');
            // Remove periods at end
            cleanLine = cleanLine.replace(/\.\s*$/, '');
            
            // Now apply the formatting based on toggle states
            
            // EMOJI BUTTON
            if (emojiBtn.classList.contains('green')) {
                // Add emoji to non-empty lines
                if (cleanLine !== '') {
                    cleanLine = getRandomEmoji() + ' ' + cleanLine;
                }
            } else {
                // When emoji button is red, remove all emojis anywhere in the line
                cleanLine = cleanLine.replace(/\p{Emoji}/gu, '');
            }
            
            // BULLETS BUTTON
            if (bulletsBtn.classList.contains('green')) {
                // Add bullet point to non-empty lines
                if (cleanLine !== '') {
                    cleanLine = '• ' + cleanLine;
                }
            }
            
            // DOTS BUTTON
            if (dotsBtn.classList.contains('green')) {
                // Add period at end of non-empty lines if they don't already end with punctuation
                if (cleanLine !== '' && !/[.!?]$/.test(cleanLine)) {
                    cleanLine = cleanLine + '.';
                }
            }
            
            // SPECIAL CHARACTERS BUTTON
            if (specialCharsBtn.classList.contains('red')) {
                // Handle the specific case: "word - word" to "word, word"
                cleanLine = cleanLine.replace(/\s+\-\s+/g, ', ');
                
                // Remove punctuation marks except periods, commas, and {} brackets
                cleanLine = cleanLine.replace(/[^\w\s.,{}"-]/g, '');
                
                // Remove extra spaces (more than one consecutive space)
                cleanLine = cleanLine.replace(/\s{2,}/g, ' ');
            }
            
            // AI BUTTON - Simulated cleaning of AI markers
            if (aiBtn.classList.contains('red')) {
                // Remove specific AI markers (brackets, formatting)
                cleanLine = cleanLine.replace(/\[\[\w+\]\]/g, ''); // Remove [[tokens]]
                cleanLine = cleanLine.replace(/\{(\w+):[^}]*\}/g, ''); // Remove {key:value} pairs
                
                // Remove zero-width characters often left by AI tools
                cleanLine = cleanLine.replace(/[\u200B-\u200D\uFEFF]/g, '');
            }
            
            // CODE BUTTON
            if (codeBtn.classList.contains('red')) {
                // Remove code blocks, inline code markers, and {} symbols
                cleanLine = cleanLine.replace(/\{\}/g, '');
                cleanLine = cleanLine.replace(/\{|\}/g, '');
                cleanLine = cleanLine.replace(/`{1,3}[^`]*`{1,3}/g, ''); // Remove code blocks with backticks
            }
            
            return cleanLine;
        });
        
        // Get the processed text
        let processedText = lines.join('\n');
        
        // Update textarea with processed text
        textInput.value = processedText;
    }
    
    // Process text when user types
    textInput.addEventListener('input', function() {
        // Store the current text when user types
        originalText = textInput.value;
        processText();
    });
});
