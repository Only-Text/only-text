// Import the Tailwind CSS (if using a separate CSS file via Vite)
// import './style.css';

// Select elements from the DOM
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const removeEmojiCheckbox = document.getElementById('removeEmoji');
const removePuncCheckbox = document.getElementById('removePunc');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const themeToggle = document.getElementById('themeToggle');
const toggleOptionsBtn = document.getElementById('toggleOptions');
const optionsPanel = document.getElementById('optionsPanel');
const inputChars = document.getElementById('inputChars');
const inputWords = document.getElementById('inputWords');
const outputChars = document.getElementById('outputChars');
const outputWords = document.getElementById('outputWords');

// Regex patterns for removing emojis and punctuation
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
const punctuationRegex = /[\p{P}]/gu;  // Unicode punctuation characters

// Function to clean text based on options
function cleanText(text) {
  let cleaned = text;
  if (removeEmojiCheckbox.checked) {
    cleaned = cleaned.replace(emojiRegex, '');       // Remove emojis/symbols
  }
  if (removePuncCheckbox.checked) {
    cleaned = cleaned.replace(punctuationRegex, '');  // Remove punctuation
  }
  return cleaned;
}

// Function to update output and counts
function updateOutput() {
  const inputVal = inputText.value;
  // Clean the input text based on selected options
  const cleaned = cleanText(inputVal);
  outputText.value = cleaned;

  // Update character and word counts for input and output
  inputChars.textContent = inputVal.length;
  outputChars.textContent = cleaned.length;
  // Word count: split on whitespace and filter out empty strings
  const inputWordCount = inputVal.trim() === '' ? 0 : inputVal.trim().split(/\s+/).length;
  const outputWordCount = cleaned.trim() === '' ? 0 : cleaned.trim().split(/\s+/).length;
  inputWords.textContent = inputWordCount;
  outputWords.textContent = outputWordCount;
}

// Event listener: whenever input text changes, update output live
inputText.addEventListener('input', updateOutput);
// Event listeners: when checkboxes toggle, update the output accordingly
removeEmojiCheckbox.addEventListener('change', updateOutput);
removePuncCheckbox.addEventListener('change', updateOutput);

// Copy output text to clipboard
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(outputText.value).then(() => {
    alert('Output copied to clipboard!');
  }).catch(err => {
    console.error('Copy failed', err);
  });
});

// Download output text as a .txt file
downloadBtn.addEventListener('click', () => {
  const blob = new Blob([outputText.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cleaned_text.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Toggle display of the Advanced Options panel
toggleOptionsBtn.addEventListener('click', () => {
  const isHidden = optionsPanel.classList.contains('hidden');
  if (isHidden) {
    optionsPanel.classList.remove('hidden');
    toggleOptionsBtn.innerHTML = 'Advanced Options &#x25B4;';  // change arrow to up (▴)
  } else {
    optionsPanel.classList.add('hidden');
    toggleOptionsBtn.innerHTML = 'Advanced Options &#x25BE;';  // change arrow to down (▾)
  }
});

// Theme toggle (Dark/Light mode)
function setTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    themeToggle.textContent = '☀️';  // show sun icon when in dark mode
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    themeToggle.textContent = '🌙';  // show moon icon when in light mode
    localStorage.setItem('theme', 'light');
  }
}

// On page load, apply saved theme or default to light
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  setTheme(true);
} else {
  setTheme(false);
}
// Handle theme toggle click
themeToggle.addEventListener('click', () => {
  const currentlyDark = document.documentElement.classList.contains('dark');
  setTheme(!currentlyDark);
});

// Initialize output (in case input has some preset value)
updateOutput();

