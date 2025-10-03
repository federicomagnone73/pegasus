let deferredPrompt = null;
let installButton = null; 

// Funzione chiamata all'avvio
window.onload = () => {
  // Ottiene il riferimento al pulsante una volta che il DOM è caricato
  installButton = document.getElementById('install-button');

  // Aggiunge il listener al pulsante di installazione
  if (installButton) {
    installButton.addEventListener('click', handleInstallClick);
  }
};

/**
 * Funzione che gestisce il click sul pulsante "Installa".
 */
function handleInstallClick() {
  if (!deferredPrompt) {
    console.warn('L\'evento di installazione non è disponibile.');
    return;
  }

  // Mostra il prompt nativo di installazione
  deferredPrompt.prompt();

  // Monitora la scelta dell'utente
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('L\'utente ha accettato l\'installazione di PEGASUS.');
    } else {
      console.log('L\'utente ha rifiutato l\'installazione di PEGASUS.');
    }
  
    // Nasconde la promozione, indipendentemente dalla scelta
    installButton.classList.add('hidden');
    deferredPrompt = null; // L'evento non può essere riutilizzato
  });
}

/**
  * Funzione per mostrare un'interfaccia utente (pulsante/banner) che invita all'installazione.
  */
function showInstallPromotion() {
  console.log('Mostra promozione installazione PEGASUS');
  // Qui andrebbe la logica per mostrare il pulsante "Installa"
  if (installButton) {
    installButton.classList.remove('hidden');
  }
}

  // 1. GESTIONE INSTALLAZIONE (A2HS - Add to Home Screen)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Impedisce al browser di mostrare il prompt predefinito
    e.preventDefault();
    // Salva l'evento, in modo che possa essere attivato in seguito da un pulsante
    deferredPrompt = e;
    // Mostra un elemento UI per l'installazione
    showInstallPromotion(); 
        
    console.log('Evento beforeinstallprompt catturato. App PEGASUS pronta per l\'installazione.');
    }
  );
