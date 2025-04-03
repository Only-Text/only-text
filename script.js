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

    // Toggle button functionality - improved to handle state better
    function toggleButton(button) {
        if (button.classList.contains('red')) {
            button.classList.remove('red');
            button.classList.add('green');
        } else {
            button.classList.remove('green');
            button.classList.add('red');
        }
        
        // Special animation for AI button
        if (button === aiBtn && button.classList.contains('red')) {
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 1500);
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
    
    // Process text based on active toggles - completely reworked
    function processText() {
        // Start with original text or current input if there's no original
        let text = textInput.value;
        
        // Split text into lines for better processing
        let lines = text.split('\n');
        
        // Process each line based on active toggles
        lines = lines.map(line => {
            let processedLine = line;
            
            // EMOJI BUTTON
            if (emojiBtn.classList.contains('red')) {
                // Remove emojis and any space after emoji at line start
                if (/^\p{Emoji}\s/.test(processedLine)) {
                    processedLine = processedLine.replace(/^\p{Emoji}\s+/, '');
                }
                // Remove other emojis
                processedLine = processedLine.replace(/\p{Emoji}/gu, '');
            } else {
                // Add random emoji at the beginning if line is not empty
                if (processedLine.trim() !== '') {
                    processedLine = getRandomEmoji() + ' ' + processedLine;
                }
            }
            
            // SPECIAL CHARACTERS BUTTON
            if (specialCharsBtn.classList.contains('red')) {
                // Handle the specific case: "word - word" to "word, word"
                processedLine = processedLine.replace(/\s+\-\s+/g, ', ');
                
                // Remove other special characters but keep basic punctuation
                processedLine = processedLine.replace(/[^\w\s.,?!()'";\-:]/g, '');
            }
            
            // BULLETS BUTTON
            if (bulletsBtn.classList.contains('red')) {
                // Remove bullet points, numbers, etc. at beginning of lines, including any space after
                processedLine = processedLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
            } else {
                // Add bullet point to non-empty lines only if it doesn't already start with one
                if (processedLine.trim() !== '' && !/^[\s]*[•]/.test(processedLine)) {
                    processedLine = '• ' + processedLine;
                }
            }
            
            return processedLine;
        });
        
        // Get the processed text
        let processedText = lines.join('\n');
        
        // AI BUTTON (removing invisible markers)
        if (aiBtn.classList.contains('red')) {
            // Remove common AI markers, both visible and invisible
            processedText = processedText.replace(/\[AI\]|\<AI\>|\{AI\}|[\u200B-\u200F\uFEFF]/gi, '');
            // Normalize whitespace
            processedText = processedText.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n');
        }
        
        // DOTS BUTTON
        if (dotsBtn.classList.contains('red')) {
            // Remove all periods
            processedText = processedText.replace(/\./g, '');
        } else {
            // If dots are enabled, make sure non-empty lines end with a period
            lines = processedText.split('\n');
            lines = lines.map(line => {
                if (line.trim() !== '' && !/[.!?]$/.test(line.trim())) {
                    return line.trimEnd() + '.';
                }
                return line;
            });
            processedText = lines.join('\n');
        }
        
        // CODE BUTTON
        if (codeBtn.classList.contains('red')) {
            // Remove code blocks, inline code markers, and common code syntax
            processedText = processedText.replace(/```[\s\S]*?```/g, '');
            processedText = processedText.replace(/`([^`]*)`/g, '$1');
            processedText = processedText.replace(/\{|\}|\[|\]|\<|\>|\/\/|\/\*|\*\/|#include|import\s+|function|class|def|return|if|else|for|while|\$/g, ' ');
        }
        
        // Update textarea with processed text
        textInput.value = processedText;
    }
    
    // Process text when user types
    textInput.addEventListener('input', function() {
        // Store the original text when user types
        originalText = textInput.value;
        processText();
    });
});
