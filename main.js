(function() {
  // ---- Dark Mode Toggle ----
  const darkToggleBtn = document.getElementById('darkToggle');
  const body = document.body;
  let isDark = false;
  if (darkToggleBtn) {
    darkToggleBtn.addEventListener('click', () => {
      isDark = !isDark;
      if (isDark) {
        body.classList.add('dark');
        darkToggleBtn.textContent = 'Light Mode';
      } else {
        body.classList.remove('dark');
        darkToggleBtn.textContent = 'Dark Mode';
      }
    });
  }

  // ---- Elementen voor de Text Cleaner Tool ----
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const removeEmojiCheckbox = document.getElementById('removeEmoji');
  const removePunctuationCheckbox = document.getElementById('removePunctuation');
  const pasteBtn = document.getElementById('pasteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fileInput = document.getElementById('fileInput');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');

  // ---- Update Output Functie ----
  function updateOutput() {
    let text = inputText.value;
    // Verwijder spaties aan het begin van elke nieuwe regel
    text = text.split("\n").map(line => line.trimStart()).join("\n");
    inputText.value = text;
    
    // Update input statistieken
    const inputCharCount = text.length;
    const inputWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    inputStats.textContent = `${inputCharCount} characters, ${inputWordCount} words`;
    
    // Bouw de regex op basis van opties
    let allowed = '\\p{L}\\p{N}\\s';
    if (!removePunctuationCheckbox.checked) {
      allowed += '\\p{P}';
    }
    if (!removeEmojiCheckbox.checked) {
      allowed += '\\p{Extended_Pictographic}';
    }
    const regex = new RegExp(`[^${allowed}]`, 'gu');
    const cleaned = text.replace(regex, '');
    outputText.value = cleaned;
    
    // Update output statistieken
    const outCharCount = cleaned.length;
    const outWordCount = cleaned.trim() ? cleaned.trim().split(/\s+/).length : 0;
    outputStats.textContent = `${outCharCount} characters, ${outWordCount} words`;
  }

  if (inputText && outputText) {
    inputText.addEventListener('input', updateOutput);
    removeEmojiCheckbox.addEventListener('change', updateOutput);
    removePunctuationCheckbox.addEventListener('change', updateOutput);
  }

  // ---- Paste Functionaliteit ----
  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          const clipText = await navigator.clipboard.readText();
          inputText.value = clipText;
          updateOutput();
        } catch (err) {
          console.error('Clipboard read failed:', err);
        }
      } else {
        const text = prompt('Paste your text here:');
        if (text !== null) {
          inputText.value = text;
          updateOutput();
        }
      }
    });
  }

  // ---- File Upload Functionaliteit ----
  if (fileInput) {
    fileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          inputText.value = e.target.result;
          updateOutput();
        };
        reader.readAsText(file);
      }
    });
  }

  // ---- Clear Functionaliteit ----
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inputText.value = '';
      outputText.value = '';
      updateOutput();
    });
  }

  // ---- Copy Functionaliteit ----
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const cleaned = outputText.value;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(cleaned)
          .then(() => alert('Copied to clipboard!'))
          .catch(() => fallbackCopy(cleaned));
      } else {
        fallbackCopy(cleaned);
      }
    });
  }
  function fallbackCopy(text) {
    outputText.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
  }

  // ---- Download Functionaliteit ----
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const cleaned = outputText.value;
      const blob = new Blob([cleaned], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned_text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Initialiseer output bij het laden van de pagina
  updateOutput();
})();
