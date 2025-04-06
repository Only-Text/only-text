// script.js

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
    
    // Track if we need fresh emojis
    let needFreshEmojis = true;
    
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

    function toggleButton(button) {
        if (button === specialCharsBtn || button === codeBtn || button === aiBtn) {
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 1000); // 1 second animation
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
        } else {
            if (button.classList.contains('red')) {
                button.classList.remove('red');
                button.classList.add('green');
                // Only generate fresh emojis when emoji button is toggled
                if (button === emojiBtn) {
                    needFreshEmojis = true;
                }
            } else {
                button.classList.remove('green');
                button.classList.add('red');
            }
        }

        processText();
    }

    emojiBtn.addEventListener('click', () => toggleButton(emojiBtn));
    bulletsBtn.addEventListener('click', () => toggleButton(bulletsBtn));
    dotsBtn.addEventListener('click', () => toggleButton(dotsBtn));
    aiBtn.addEventListener('click', () => toggleButton(aiBtn));
    specialCharsBtn.addEventListener('click', () => toggleButton(specialCharsBtn));
    codeBtn.addEventListener('click', () => toggleButton(codeBtn));
    
    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        originalText = '';
    });
    
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            originalText = text;
            needFreshEmojis = true;
            processText();
        } catch (err) {
            alert('Failed to read clipboard. Please paste manually.');
        }
    });
    
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
                needFreshEmojis = true;
                processText();
            };
            reader.readAsText(file);
        }
    });
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textInput.value);
            textInput.style.backgroundColor = '#e6ffec';
            setTimeout(() => {
                textInput.style.backgroundColor = '';
            }, 300);
        } catch (err) {
            alert('Failed to copy text. Please copy manually.');
        }
    });
    
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

    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
    ];

    // Cache for emoji assignments to ensure consistency
    let emojiCache = {};

    function getRandomEmoji(lineIndex) {
        // If we need fresh emojis or this line doesn't have an emoji yet
        if (needFreshEmojis || !emojiCache[lineIndex]) {
            emojiCache[lineIndex] = emojis[Math.floor(Math.random() * emojis.length)];
        }
        return emojiCache[lineIndex];
    }

    // Fixed processText function
    function processText() {
        let text = textInput.value;
        let processedLines = [];
        let lines = text.split('\n');

        // Reset emoji cache if needed
        if (needFreshEmojis) {
            emojiCache = {};
            needFreshEmojis = false;
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // First remove existing bullet points and emojis
            line = line.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
            line = line.replace(/^\p{Emoji}\s*/gu, '');
            
            // Remove trailing dots if needed
            if (!dotsBtn.classList.contains('green')) {
                line = line.replace(/\.\s*$/, '');
            }
            
            // Remove emoji if needed
            if (emojiBtn.classList.contains('red')) {
                line = line.replace(/\p{Emoji}/gu, '');
            }
            
            // Clean AI markers if needed
            if (aiBtn.classList.contains('red')) {
                line = line.replace(/\[\[\w+\]\]/g, '');
                line = line.replace(/\{(\w+):[^}]*\}/g, '');
                line = line.replace(/[\u200B-\u200D\uFEFF]/g, '');
            }
            
            // Clean special characters if needed
            if (specialCharsBtn.classList.contains('red')) {
                line = line.replace(/\s+\-\s+/g, ', ');
                line = line.replace(/[^\w\s.,{}"-]/g, '');
                line = line.replace(/\s{2,}/g, ' ');
            }
            
            // Clean code symbols if needed
            if (codeBtn.classList.contains('red')) {
                line = line.replace(/\{\}/g, '');
                line = line.replace(/\{|\}/g, '');
                line = line.replace(/`{1,3}[^`]*`{1,3}/g, '');
            }
            
            // Add a dot if needed and line is not empty
            if (dotsBtn.classList.contains('green') && line !== '' && !/[.!?]$/.test(line)) {
                line += '.';
            }
            
            // Add bullet point if needed and line is not empty
            if (bulletsBtn.classList.contains('green') && line !== '') {
                line = '• ' + line;
            }
            
            // Add emoji if needed and line is not empty
            if (emojiBtn.classList.contains('green') && line !== '') {
                line = getRandomEmoji(i) + ' ' + line;
            }
            
            processedLines.push(line);
        }
        
        textInput.value = processedLines.join('\n');
    }

    textInput.addEventListener('input', function() {
        originalText = textInput.value;
        processText();
    });
});
