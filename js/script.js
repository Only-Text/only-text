document.addEventListener('DOMContentLoaded', () => {
    // --- Algemene functies ---
    const setCurrentYear = () => {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };

    setCurrentYear();

    // --- Tool Specifieke Functionaliteit (alleen uitvoeren als elementen bestaan) ---
    const inputTextarea = document.getElementById('inputText');
    const outputTextarea = document.getElementById('outputText');
    const cleanButton = document.getElementById('cleanButton');
    const copyButton = document.getElementById('copyButton');
    const inputCharCount = document.getElementById('inputCharCount');
    const outputCharCount = document.getElementById('outputCharCount');
    const fileInput = document.getElementById('fileInput');
    const fileInputLabel = document.querySelector('.file-input-label'); // Gebruik class selector
    const fileNameDisplay = document.getElementById('fileName');
    const downloadButton = document.getElementById('downloadButton');
    
    // Controleer of we op een pagina zijn met de tool elementen
    if (inputTextarea && outputTextarea && cleanButton && copyButton) {

        // Functie om tekst op te schonen
        const cleanText = (text) => {
            // Verwijder speciale tekens behalve letters, nummers en spaties
            // Je kunt deze regex aanpassen voor meer controle (bv. interpunctie behouden)
            // [\p{L}\p{N}\s] -> Houdt letters (alle talen), nummers, en spaties
            // [^\p{L}\p{N}\s] -> Matcht alles wat GEEN letter, nummer of spatie is
            const cleaned = text.replace(/[^\p{L}\p{N}\s]/gu, ''); // 'u' flag for Unicode
            // Optioneel: verwijder extra spaties
            return cleaned.replace(/\s+/g, ' ').trim();
        };

        // Functie om karaktertelling bij te werken
        const updateCharCount = (textarea, displayElement) => {
            if (textarea && displayElement) {
                const text = textarea.value;
                const countWithSpaces = text.length;
                const countWithoutSpaces = text.replace(/\s/g, '').length;
                // Gebruik innerText of textContent voor veiligheid
                displayElement.textContent = `${countWithSpaces} characters (${countWithoutSpaces} without spaces)`; 
            }
        };

        // Event Listener voor de opschoonknop
        cleanButton.addEventListener('click', () => {
            const input = inputTextarea.value;
            const cleaned = cleanText(input);
            outputTextarea.value = cleaned;
            updateCharCount(inputTextarea, inputCharCount);
            updateCharCount(outputTextarea, outputCharCount);
        });

        // Event Listener voor real-time opschonen (optioneel, kan zwaar zijn bij grote tekst)
        // Haal commentaar weg om te activeren
        /*
        inputTextarea.addEventListener('input', () => {
            const input = inputTextarea.value;
            const cleaned = cleanText(input);
            outputTextarea.value = cleaned;
            updateCharCount(inputTextarea, inputCharCount);
            updateCharCount(outputTextarea, outputCharCount);
        });
        */
        
        // Update counts bij handmatig typen/plakken in input (ook als real-time uit staat)
         inputTextarea.addEventListener('input', () => {
             updateCharCount(inputTextarea, inputCharCount);
             // Reset output count als input wijzigt en niet direct geschoond wordt
             if (outputTextarea.value && !cleanButton.disabled) { // Check of real-time actief is of niet
                updateCharCount(outputTextarea, outputCharCount); 
             } else {
                 // outputTextarea.value = ''; // Optioneel: leeg output als input wijzigt
                 // outputCharCount.textContent = '0 characters (0 without spaces)'; 
             }
         });


        // Event Listener voor de kopieerknop
        copyButton.addEventListener('click', async () => {
            if (outputTextarea.value) {
                try {
                    await navigator.clipboard.writeText(outputTextarea.value);
                    // Geef feedback aan de gebruiker
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    copyButton.style.backgroundColor = '#5cb85c'; // Groen
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                        copyButton.style.backgroundColor = ''; // Reset kleur
                    }, 2000); // Na 2 seconden
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    alert('Could not copy text. Your browser might not support this feature or permissions are denied.');
                }
            } else {
                alert('Nothing to copy!');
            }
        });
        
        // Event Listener voor File Input
        if (fileInput && fileInputLabel && fileNameDisplay) {
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Toon bestandsnaam
                     fileNameDisplay.textContent = `Selected: ${file.name}`;

                    // Lees alleen .txt bestanden
                    if (file.type === "text/plain") {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            inputTextarea.value = e.target.result;
                            // Update count na laden bestand
                            updateCharCount(inputTextarea, inputCharCount); 
                            // Optioneel: direct opschonen na laden
                             cleanButton.click(); 
                        };
                        reader.onerror = (e) => {
                            console.error("File reading error", e);
                            alert("Error reading file.");
                             fileNameDisplay.textContent = ''; // Reset bestandsnaam
                        };
                        reader.readAsText(file);
                    } else {
                        alert("Please upload a .txt file.");
                        fileNameDisplay.textContent = ''; // Reset bestandsnaam
                        fileInput.value = ''; // Reset input
                    }
                } else {
                     fileNameDisplay.textContent = ''; // Reset als geen bestand gekozen is
                }
            });
        }

        // Event Listener voor Download Knop
        if (downloadButton) {
             downloadButton.addEventListener('click', () => {
                 const textToSave = outputTextarea.value;
                 if (!textToSave) {
                     alert("Nothing to download!");
                     return;
                 }
                 
                 // Maak een Blob object (binary large object)
                 const blob = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
                 
                 // Maak een URL voor de Blob
                 const url = URL.createObjectURL(blob);
                 
                 // Maak een tijdelijke link
                 const link = document.createElement('a');
                 link.href = url;
                 link.download = 'cleaned_text.txt'; // Bestandsnaam voor download
                 
                 // Klik programmatisch op de link
                 document.body.appendChild(link); // Nodig voor Firefox
                 link.click();
                 
                 // Ruim op
                 document.body.removeChild(link);
                 URL.revokeObjectURL(url); 
             });
        }
        
        // Initiele telling bij laden pagina
         updateCharCount(inputTextarea, inputCharCount);
         updateCharCount(outputTextarea, outputCharCount);

    } // Einde van if (tool elementen bestaan)

}); // Einde DOMContentLoaded
