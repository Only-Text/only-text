(function() {
  const body = document.body;
  const darkToggleBtn = document.getElementById('darkToggle');
  // Bepaal taal voor juiste knop- en meldtekst
  const isDutch = document.documentElement.lang === 'nl';
  const darkText = isDutch ? 'Donkere modus' : 'Dark Mode';
  const lightText = isDutch ? 'Lichte modus' : 'Light Mode';
  if (darkToggleBtn) {
    // Stel beginmodus in op basis van vorige voorkeur
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark');
      darkToggleBtn.textContent = lightText;
    } else {
      body.classList.remove('dark');
      darkToggleBtn.textContent = darkText;
    }
    // Schakel donker/licht modus bij klikken
    darkToggleBtn.addEventListener('click', function() {
      if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        localStorage.removeItem('theme');
        darkToggleBtn.textContent = darkText;
      } else {
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        darkToggleBtn.textContent = lightText;
      }
    });
  }

  // Functionaliteit van de Only Text-tool (indien aanwezig op de pagina)
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  if (inputText && outputText) {
    const removeEmojiCheckbox = document.getElementById('removeEmoji');
    const removePunctuationCheckbox = document.getElementById('removePunctuation');
    const charCountSpan = document.getElementById('charCount');
    const wordCountSpan = document.getElementById('wordCount');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    // Teksten voor kopieer-melding en bestandsnaam (afhankelijk van taal)
    const copyMessage = isDutch ? 'Opgeschoonde tekst gekopieerd naar het klembord.' : 'Copied cleaned text to clipboard.';
    const fileName = isDutch ? 'opgeschoonde_tekst.txt' : 'cleaned_text.txt';

    function cleanText() {
      const text = inputText.value;
      const removeEmoji = removeEmojiCheckbox.checked;
      const removePunctuation = removePunctuationCheckbox.checked;
      // Regex-patroon opstellen voor te verwijderen tekens
      let pattern = '[^\\p{L}\\p{N}\\s';
      if (!removePunctuation) {
        pattern += '\\p{P}';
      }
      if (!removeEmoji) {
        pattern += '\\p{Extended_Pictographic}';
      }
      pattern += ']';
      const regex = new RegExp(pattern, 'gu');
      const cleaned = text.replace(regex, '');
      outputText.value = cleaned;
      // Bijwerken van karakter- en woordtelling
      const charCount = cleaned.length;
      let wordCount = 0;
      if (cleaned.trim() !== '') {
        wordCount = cleaned.trim().split(/\\s+/).length;
      }
      charCountSpan.textContent = charCount;
      wordCountSpan.textContent = wordCount;
    }

    // Event listeners voor live voorbeeld
    inputText.addEventListener('input', cleanText);
    removeEmojiCheckbox.addEventListener('change', cleanText);
    removePunctuationCheckbox.addEventListener('change', cleanText);

    // Kopieer de outputtekst naar het klembord
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        const text = outputText.value;
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => {
            alert(copyMessage);
          }).catch(err => {
            // Fallback indien Clipboard API faalt
            outputText.select();
            document.execCommand('copy');
            alert(copyMessage);
          });
        } else {
          // Fallback voor oudere browsers
          outputText.select();
          document.execCommand('copy');
          alert(copyMessage);
        }
      });
    }

    // Download de outputtekst als .txt bestand
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
        const text = outputText.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Initialiseer de output (lege tekst)
    cleanText();
  }
})();
