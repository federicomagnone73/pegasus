// Configurazione e variabili globali
const appContent = document.getElementById('app-content');
const bottomNav = document.getElementById('bottom-nav');
const body = document.body;
const SETTINGS_KEY = 'pegasusSettings';
const DEFAULT_SETTINGS = {
    theme: 'light'
};

const THEMES = [
    { id: 'light', name: 'Chiaro', icon: 'fas fa-sun' },
    { id: 'dark', name: 'Scuro', icon: 'fas fa-moon' },
];

let currentSettings = DEFAULT_SETTINGS;

// --- GESTIONE IMPOSTAZIONI E TEMI ---

/** Carica le impostazioni e applica il tema */
function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        if (storedSettings) {
            currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
        }
    } catch (e) {
        console.error("Errore durante il caricamento delle impostazioni PEGASUS:", e);
        currentSettings = DEFAULT_SETTINGS;
    }
    applyTheme(currentSettings.theme);
}

/** Salva le impostazioni correnti */
function saveSettings() {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
    } catch (e) {
        console.error("Errore durante il salvataggio delle impostazioni PEGASUS:", e);
    }
}

/** Applica un tema aggiornando l'attributo data-theme */
function applyTheme(themeName) {
    body.setAttribute('data-theme', themeName);
    currentSettings.theme = themeName;
    saveSettings();
}

// --- GESTIONE PAGINE ---

const pageTemplates = {
    home: `
        <h1 class="text-4xl font-extrabold mb-4 text-center text-[var(--accent-color)]">PEGASUS</h1>
        <div class="card p-6 rounded-xl shadow-lg mt-8 text-center">
            <i class="fas fa-magic text-6xl text-[var(--accent-color)] mb-4"></i>
            <p class="text-lg font-semibold">Benvenuto nella tua app base PEGASUS!</p>
            <p class="mt-2 text-sm opacity-75">Questa è una Single Page Application (SPA) reattiva.</p>
        </div>
    `,
    dashboard: `
        <h1 class="text-3xl font-bold mb-4 text-[var(--accent-color)]">Dashboard</h1>
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-xl font-semibold mb-3">Statistiche veloci</h2>
            <ul class="space-y-2">
                <li><i class="fas fa-check-circle text-green-500 mr-2"></i> Progetto Attivo: 1</li>
                <li><i class="fas fa-users text-blue-500 mr-2"></i> Utenti Connessi: 42</li>
                <li><i class="fas fa-bell text-yellow-500 mr-2"></i> Notifiche: 3</li>
            </ul>
        </div>
    `,
    profile: `
        <h1 class="text-3xl font-bold mb-4 text-[var(--accent-color)]">Profilo Utente</h1>
        <div class="card p-6 rounded-xl shadow-lg text-center">
            <i class="fas fa-user-circle text-5xl text-[var(--accent-color)] mb-3"></i>
            <p class="text-xl font-bold">Utente Demo PEGASUS</p>
            <p class="text-sm opacity-75">Accesso base</p>
            <button class="bg-red-600 text-white px-4 py-2 mt-4 rounded-full hover:bg-red-700 transition">
                Esci
            </button>
        </div>
    `,
    settings: `
        <h1 class="text-3xl font-bold mb-6 text-[var(--accent-color)]">Impostazioni App</h1>
        <div class="card p-6 rounded-xl shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Selezione Tema</h2>
            <div id="theme-selector" class="flex gap-4">
                ${THEMES.map(theme => `
                    <button
                        data-theme-id="${theme.id}"
                        class="theme-btn flex-1 flex flex-col items-center p-3 rounded-lg border-2 hover:opacity-80 transition-all text-sm"
                    >
                        <i class="${theme.icon} text-2xl mb-2 text-[var(--accent-color)]"></i>
                        <span>${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `
};

/** Aggiorna il contenuto principale e l'elemento attivo della navbar. */
function renderPage(pageName) {
    const template = pageTemplates[pageName] || pageTemplates.home;
    appContent.innerHTML = `<div class="p-2">${template}</div>`;

    // Aggiorna navigazione
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeNavBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }

    if (pageName === 'settings') {
        // Applica lo stato attivo del tema ai pulsanti
        document.querySelectorAll('.theme-btn').forEach(btn => {
            const themeId = btn.getAttribute('data-theme-id');
            if (themeId === currentSettings.theme) {
                btn.classList.add('border-[var(--accent-color)]', 'font-bold');
            } else {
                btn.classList.add('border-gray-300', 'dark:border-gray-600');
            }
        });
        setupSettingsListeners();
    }
}

/** Configura i listener specifici per la pagina delle impostazioni. */
function setupSettingsListeners() {
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const themeId = e.currentTarget.getAttribute('data-theme-id');
            applyTheme(themeId);

            // Aggiorna l'aspetto dei pulsanti tema
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('border-[var(--accent-color)]', 'font-bold');
                btn.classList.add('border-gray-300', 'dark:border-gray-600');
            });
            e.currentTarget.classList.add('border-[var(--accent-color)]', 'font-bold');
            e.currentTarget.classList.remove('border-gray-300', 'dark:border-gray-600');
        });
    });
}

// --- EVENT HANDLERS GLOBALI ---

bottomNav.addEventListener('click', (e) => {
    const button = e.target.closest('.nav-item');
    if (button) {
        const page = button.getAttribute('data-page');
        if (page) {
            renderPage(page);
        }
    }
});

// --- INIZIALIZZAZIONE ---

window.onload = function() {
    loadSettings();
    renderPage('home');
};
