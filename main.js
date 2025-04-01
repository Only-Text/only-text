(function() {
  // ----- Dark Mode Functionaliteit -----
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

  // ----- Elementen voor de Only Text Tool -----
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const removeEmojiCheckbox = document.getElementById('removeEmoji');
  const removePunctuationCheckbox = document.getElementById('removePunctuation');
  const pasteBtn = document.getElementById('pasteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');

  // ----- Update Functionaliteit -----
  function updateOutput() {
    let text = inputText.value;
    // Update input stats
    const inputCharCount = text.length;
    const inputWordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    inputStats.textContent = `${inputCharCount} characters, ${inputWordCount} words`;

    // Bouw regex dynamisch op basis van de opties
    // Basis: letters, nummers en whitespace worden altijd behouden.
    let allowed = '\\p{L}\\p{N}\\s';
    // Als Remove Punctuation is aangevinkt, verwijder leestekens
    if (removePunctuationCheckbox.checked) {
      // Do nothing: leestekens worden verwijderd door de regex hieronder
    } else {
      allowed += '\\p{P}';
    }
    // Als Remove Emojis is aangevinkt, verwijder emoji's
    if (removeEmojiCheckbox.checked) {
      // Emoji's vallen onder Extended Pictographic
      // (We gebruiken hier Unicode property escapes; dit werkt in moderne browsers)
    } else {
      allowed += '\\p{Extended_Pictographic}';
    }
    // Regex: alles wat niet in de allowed set zit wordt verwijderd.
    const regex = new RegExp(`[^${allowed}]`, 'gu');
    const cleaned = text.replace(regex, '');
    outputText.value = cleaned;
    // Update output stats
    const outCharCount = cleaned.length;
    const outWordCount = cleaned.trim() ? cleaned.trim().split(/\s+/).length : 0;
    outputStats.textContent = `${outCharCount} characters, ${outWordCount} words`;
  }

  if (inputText && outputText) {
    inputText.addEventListener('input', updateOutput);
    removeEmojiCheckbox.addEventListener('change', updateOutput);
    removePunctuationCheckbox.addEventListener('change', updateOutput);
  }

  // ----- Paste Functionaliteit -----
  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          const clipText = await navigator.clipboard.readText();
          inputText.value = clipText;
          updateOutput();
        } catch (err) {
          console.error('Failed to read clipboard contents:', err);
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

  // ----- Copy Functionaliteit -----
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

  // ----- Download Functionaliteit -----
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

  // Initialiseer de output bij pagina laden
  updateOutput();
})();
