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
    const specialCharsBtn = document.getElementById('special-chars-btn');
    const bulletsBtn = document.getElementById('bullets-btn');
    const aiBtn = document.getElementById('ai-btn');
    const dotsBtn = document.getElementById('dots-btn');
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

    // Updated toggle button functionality based on new requirements
    function toggleButton(button) {
        // Special case for buttons that can only be red (off)
        if (button === aiBtn || button === specialCharsBtn || button === codeBtn) {
            // AI button special animation: red -> orange -> red
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 1500);
            
            // Make sure it stays red
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
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
    specialCharsBtn.addEventListener('click', () => toggleButton(specialCharsBtn));
    bulletsBtn.addEventListener('click', () => toggleButton(bulletsBtn));
    aiBtn.addEventListener('click', () => toggleButton(aiBtn));
    dotsBtn.addEventListener('click', () => toggleButton(dotsBtn));
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
    
    // Updated process text based on new requirements
    function processText() {
        // Start with current input
        let text = textInput.value;
        
        // Split text into lines for better processing
        let lines = text.split('\n');
        
        // Process each line based on active toggles
        lines = lines.map(line => {
            let processedLine = line;
            
            // EMOJI BUTTON - Fixed to properly handle emoji + space as a group
            if (emojiBtn.classList.contains('red')) {
                // Remove emojis and space after them if at beginning of line
                processedLine = processedLine.replace(/^\p{Emoji}\s/gu, '');
                // Remove other emojis anywhere in the text but don't touch bullet points
                processedLine = processedLine.replace(/\p{Emoji}/gu, '');
            } else {
                // Add random emoji at the beginning if line is not empty and doesn't already have emoji
                if (processedLine.trim() !== '' && !/^\p{Emoji}/u.test(processedLine)) {
                    processedLine = getRandomEmoji() + ' ' + processedLine;
                }
            }
            
            // SPECIAL CHARACTERS BUTTON - Modified to preserve {} code brackets
            if (specialCharsBtn.classList.contains('red')) {
                // Handle the specific case: "word - word" to "word, word"
                processedLine = processedLine.replace(/\s+\-\s+/g, ', ');
                
                // Remove punctuation marks except periods, commas, and {} brackets
                processedLine = processedLine.replace(/[^\w\s.,?!{};:'"-]/g, '');
            }
            
            // BULLETS BUTTON - Fixed to show only one bullet and prevent conflicts
            if (bulletsBtn.classList.contains('red')) {
                // Remove bullet points at beginning of lines, but don't affect emojis
                processedLine = processedLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
                // Also remove all extra spacing at the beginning of lines when bullets are removed
                processedLine = processedLine.replace(/^\s+/, '');
            } else {
                // Add bullet point to non-empty lines only if it doesn't already start with one
                // and doesn't begin with an emoji
                if (processedLine.trim() !== '' && 
                    !/^[\s]*[•]/.test(processedLine) && 
                    !/^\p{Emoji}/u.test(processedLine)) {
                    processedLine = '• ' + processedLine;
                }
            }
            
            // DOTS BUTTON - Fixed to handle conflicts with emojis and bullet points
            if (dotsBtn.classList.contains('red')) {
                // Remove periods at the end of lines
                processedLine = processedLine.replace(/\.\s*$/, '');
            } else {
                // Add period at end of non-empty lines if they don't already end with punctuation
                if (processedLine.trim() !== '' && !/[.!?]$/.test(processedLine.trim())) {
                    processedLine = processedLine.trimEnd() + '.';
                }
            }
            
            // CODE BUTTON - Fixed to handle removal of {} symbols
            if (codeBtn.classList.contains('red')) {
                // Remove code blocks, inline code markers, and {} symbols
                processedLine = processedLine.replace(/\{\}/g, '');
                processedLine = processedLine.replace(/\{|\}/g, '');
            }
            
            return processedLine;
        });
        
        // Get the processed text
        let processedText = lines.join('\n');
        
        // AI BUTTON - This button should do nothing functional per requirements
        // but we'll keep the existing code for invisible markers removal
        if (aiBtn.classList.contains('red')) {
            // Remove common AI markers, both visible and invisible
            processedText = processedText.replace(/\[AI\]|\<AI\>|\{AI\}|[\u200B-\u200F\uFEFF]/gi, '');
            // Normalize whitespace
            processedText = processedText.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n');
        }
        
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
