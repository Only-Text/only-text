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

    // Flags
    let dotsToggled = false; // false: initial state = do nothing with dots
    let needFreshEmojis = true; // voor emoji processing

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
        // Special handling voor codeBtn: alleen animatie wanneer hij wordt aangezet (van groen naar rood)
        if (button === codeBtn) {
            if (!button.classList.contains('red')) {
                // Knop wordt aangezet, dus animatie (0,5 sec)
                button.classList.add('orange');
                setTimeout(() => {
                    button.classList.remove('orange');
                }, 500);
                button.classList.remove('green');
                button.classList.add('red');
            } else {
                // Uitzetten: geen animatie
                button.classList.remove('red');
                button.classList.add('green');
            }
        }
        // Speciale knoppen waarvoor de standaard 1 sec animatie geldt (specialChars en AI)
        else if (button === specialCharsBtn || button === aiBtn) {
            button.classList.add('orange');
            setTimeout(() => {
                button.classList.remove('orange');
            }, 1000);
            if (!button.classList.contains('red')) {
                button.classList.remove('green');
                button.classList.add('red');
            }
        }
        // Voor de overige knoppen (emoji, bullets, dots)
        else {
            // Voor dotsKnop: als dit de eerste keer is, markeer dat hij getoggled is
            if (button === dotsBtn) {
                dotsToggled = true;
            }
            if (button.classList.contains('red')) {
                button.classList.remove('red');
                button.classList.add('green');
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

    // Cache voor emoji-toewijzing per regel
    let emojiCache = {};

    function getRandomEmoji(lineIndex) {
        if (needFreshEmojis || !emojiCache[lineIndex]) {
            emojiCache[lineIndex] = emojis[Math.floor(Math.random() * emojis.length)];
        }
        return emojiCache[lineIndex];
    }

    // processText verwerkt de tekstregel voor regel op basis van de knoppen
    function processText() {
        let text = textInput.value;
        let processedLines = [];
        let lines = text.split('\n');

        // Reset emoji cache indien nodig
        if (needFreshEmojis) {
            emojiCache = {};
            needFreshEmojis = false;
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Eerst bestaande bullets en emoji's verwijderen
            line = line.replace(/^[\s]*[•\-\*\+\◦\○\●\■\□\▪\▫\♦\♣\♠\♥\d+\.]\s*/g, '');
            line = line.replace(/^\p{Emoji}\s*/gu, '');
            
            // Dots-processing:
            // Alleen toepassen als de dots-knop al getoggled is
            if (dotsToggled) {
                if (dotsBtn.classList.contains('green') && line !== '' && !/[.!?]$/.test(line)) {
                    // Wanneer dots-knop "aan" staat, voeg een punt toe als er nog geen eindpunctuation is
                    line += '.';
                } else if (dotsBtn.classList.contains('red')) {
                    // Wanneer dots-knop "uit" staat, verwijder eventuele trailing punt
                    line = line.replace(/\.\s*$/, '');
                }
            }
            
            // Emoji: als de emoji-knop "uit" staat (red), verwijder emoji's
            if (emojiBtn.classList.contains('red')) {
                line = line.replace(/\p{Emoji}/gu, '');
            }
            
            // AI markers: als AI-knop "uit" staat (red), verwijder AI-sporen en onzichtbare tekens
            if (aiBtn.classList.contains('red')) {
                line = line.replace(/\[\[\w+\]\]/g, '');
                line = line.replace(/\{(\w+):[^}]*\}/g, '');
                line = line.replace(/[\u200B-\u200D\uFEFF]/g, '');
            }
            
            // Special characters: als de knop "uit" staat (red), voer de vervangingen uit
            if (specialCharsBtn.classList.contains('red')) {
                line = line.replace(/\s+\-\s+/g, ', ');
                line = line.replace(/[^\w\s.,{}"-]/g, '');
                line = line.replace(/\s{2,}/g, ' ');
            }
            
            // Code symbols: als de code-knop "uit" staat (red), verwijder code-symbolen
            if (codeBtn.classList.contains('red')) {
                line = line.replace(/\{\}/g, '');
                line = line.replace(/\{|\}/g, '');
                line = line.replace(/`{1,3}[^`]*`{1,3}/g, '');
            }
            
            // Bullets: als de bullet-knop "aan" staat (green) en de regel niet leeg is, voeg bullet toe
            if (bulletsBtn.classList.contains('green') && line !== '') {
                line = '• ' + line;
            }
            
            // Emoji toevoegen: als de emoji-knop "aan" staat (green) en de regel niet leeg is, voeg een emoji toe
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
