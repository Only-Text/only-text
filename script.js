
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
        if (button === specialCharsBtn || button === codeBtn) {
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 750);
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
        } else if (button === aiBtn) {
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 750);
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
            return;
        } else {
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

    function getRandomEmoji() {
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    // ✅ Verbeterde processText functie
    function processText() {
        let text = textInput.value;
        let lines = text.split('\n');

        lines = lines.map(line => {
            let cleanLine = line.trim();

            cleanLine = cleanLine.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
            cleanLine = cleanLine.replace(/^\p{Emoji}\s*/gu, '');
            cleanLine = cleanLine.replace(/\.\s*$/, '');

            if (emojiBtn.classList.contains('green')) {
                if (cleanLine !== '') {
                    cleanLine = getRandomEmoji() + ' ' + cleanLine;
                }
            } else {
                cleanLine = cleanLine.replace(/\p{Emoji}/gu, '');
            }

            if (bulletsBtn.classList.contains('green')) {
                if (cleanLine !== '') {
                    cleanLine = '• ' + cleanLine;
                }
            }

            if (dotsBtn.classList.contains('green')) {
                if (cleanLine !== '' && !/[.!?]$/.test(cleanLine)) {
                    cleanLine += '.';
                }
            }

            if (specialCharsBtn.classList.contains('red')) {
                cleanLine = cleanLine.replace(/\s+\-\s+/g, ', ');
                cleanLine = cleanLine.replace(/[^\w\s.,{}"-]/g, '');
                cleanLine = cleanLine.replace(/\s{2,}/g, ' ');
            }

            if (aiBtn.classList.contains('red')) {
                cleanLine = cleanLine.replace(/\[\[\w+\]\]/g, '');
                cleanLine = cleanLine.replace(/\{(\w+):[^}]*\}/g, '');
                cleanLine = cleanLine.replace(/[\u200B-\u200D\uFEFF]/g, '');
            }

            if (codeBtn.classList.contains('red')) {
                cleanLine = cleanLine.replace(/\{\}/g, '');
                cleanLine = cleanLine.replace(/\{|\}/g, '');
                cleanLine = cleanLine.replace(/`{1,3}[^`]*`{1,3}/g, '');
            }

            return cleanLine;
        });

        textInput.value = lines.join('\n');
    }

    textInput.addEventListener('input', function() {
        originalText = textInput.value;
        processText();
    });
});
