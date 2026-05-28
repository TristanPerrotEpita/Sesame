(function() {
    // List of mockup pages with their paths, icons, and descriptions
    const pages = [
        { name: "Accueil", file: "index.html", icon: "fas fa-house", desc: "Tableau de bord et silos actifs" },
        { name: "Connexion", file: "connexion.html", icon: "fas fa-sign-in-alt", desc: "Formulaire d'authentification MFA" },
        { name: "Inscription refusée", file: "inscription.html", icon: "fas fa-user-slash", desc: "Page de blocage / Zero Trust" },
        { name: "Explorer", file: "explorer.html", icon: "fas fa-compass", desc: "Annuaire et silos de l'organisation" },
        { name: "Équipes", file: "equipes.html", icon: "fas fa-users", desc: "Équipes actuelles et contacts de l'organisation" },
        { name: "Projet Alpha", file: "projet.html", icon: "fas fa-atom", desc: "Fichiers et documents du Silo Alpha" },
        { name: "Historique & Timeline", file: "historique.html", icon: "fas fa-history", desc: "Versionnage Git-like d'un document" },
        { name: "Gestion des Accès", file: "permissions.html", icon: "fas fa-user-shield", desc: "Contrôle d'accès des silos" },
        { name: "Profil & Sécurité", file: "profil.html", icon: "fas fa-user-cog", desc: "Paramètres utilisateur et MFA" },
        { name: "Support DSI", file: "contact.html", icon: "fas fa-life-ring", desc: "Urgence sécurité et ticket support" }
    ];

    // Determine current page filename
    let currentFile = window.location.pathname.split('/').pop();
    if (!currentFile || currentFile === '') {
        currentFile = 'index.html';
    }

    // Inject custom styles
    const styles = `
        #debug-hub-container {
            font-family: 'Inter', sans-serif;
            z-index: 99999;
        }
        .debug-backdrop-blur {
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        @keyframes debug-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.25); }
            50% { box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.08); }
        }
        .debug-btn-pulse {
            animation: debug-pulse 2s infinite;
        }
        .debug-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .debug-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .debug-scrollbar::-webkit-scrollbar-thumb {
            background: #e4e4e7;
            border-radius: 999px;
        }
        .debug-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d4d4d8;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Create the debug hub elements container
    const hubContainer = document.createElement('div');
    hubContainer.id = 'debug-hub-container';
    hubContainer.className = 'fixed bottom-6 right-6 flex flex-col items-end pointer-events-none';

    // Build the Floating Action Button (FAB)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'debug-hub-toggle';
    toggleBtn.className = 'pointer-events-auto flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-medium text-xs px-4 py-3.5 rounded-full shadow-lg border border-zinc-800 transition-all duration-300 transform hover:scale-105 active:scale-95 debug-btn-pulse';
    toggleBtn.innerHTML = `
        <i class="fas fa-cubes text-sm"></i>
        <span class="tracking-wider font-bold">HUB DE DEBUG</span>
    `;

    // Build the Panel Card
    const panel = document.createElement('div');
    panel.id = 'debug-hub-panel';
    panel.className = 'pointer-events-auto mb-4 w-96 flex flex-col rounded-2xl border border-zinc-200 bg-white/95 debug-backdrop-blur shadow-2xl transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right translate-y-4 pointer-events-none';
    
    // Build panel HTML content
    panel.innerHTML = `
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-100">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                    <i class="fas fa-shield-halved text-xs"></i>
                </div>
                <div>
                    <h4 class="font-bold text-zinc-900 text-sm">Sesame Maquette</h4>
                    <p class="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Prototype Debug Hub</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Dev Mode
                </span>
                <button id="debug-hub-close" class="text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div class="relative">
                <i class="fas fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-xs"></i>
                <input type="text" id="debug-search" placeholder="Rechercher un écran..." class="w-full pl-8 pr-4 py-2 border border-zinc-200 rounded-lg text-xs bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200">
            </div>
        </div>

        <!-- Pages list container -->
        <div id="debug-pages-list" class="p-3 overflow-y-auto max-h-[360px] space-y-1.5 debug-scrollbar">
            <!-- Items injected dynamically -->
        </div>

        <!-- Footer -->
        <div class="p-3 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center text-[10px] text-zinc-400">
            <span>Raccourci: <kbd class="px-1.5 py-0.5 bg-white border border-zinc-200 rounded shadow-xs font-bold font-mono text-zinc-600">Shift + D</kbd></span>
            <span class="flex items-center gap-1"><i class="fas fa-circle text-emerald-500 text-[6px]"></i> 9 maquettes prêtes</span>
        </div>
    `;

    hubContainer.appendChild(panel);
    hubContainer.appendChild(toggleBtn);
    document.body.appendChild(hubContainer);

    // Get references
    const searchInput = panel.querySelector('#debug-search');
    const pagesList = panel.querySelector('#debug-pages-list');
    const closeBtn = panel.querySelector('#debug-hub-close');

    let isOpen = false;

    // Open/Close toggle function
    function toggleHub(forceState) {
        isOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
        if (isOpen) {
            panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none', 'translate-y-4');
            panel.classList.add('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
            toggleBtn.classList.remove('debug-btn-pulse');
            // Auto focus search
            setTimeout(() => searchInput.focus(), 100);
        } else {
            panel.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto', 'translate-y-0');
            panel.classList.add('scale-95', 'opacity-0', 'pointer-events-none', 'translate-y-4');
            toggleBtn.classList.add('debug-btn-pulse');
        }
    }

    // Toggle button event
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHub();
    });

    // Close button event
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHub(false);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (isOpen && !hubContainer.contains(e.target)) {
            toggleHub(false);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Toggle on Shift + D
        if (e.shiftKey && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            toggleHub();
        }
        // Close on Escape
        if (e.key === 'Escape' && isOpen) {
            toggleHub(false);
        }
    });

    // Render list items function
    function renderPages(filterText = '') {
        const query = filterText.toLowerCase().trim();
        pagesList.innerHTML = '';

        const filtered = pages.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.file.toLowerCase().includes(query) || 
            p.desc.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            pagesList.innerHTML = `
                <div class="text-center py-8 text-zinc-400 text-xs">
                    <i class="fas fa-search-minus text-lg mb-2 block"></i>
                    Aucun écran trouvé pour "${filterText}"
                </div>
            `;
            return;
        }

        filtered.forEach(page => {
            const isActive = currentFile === page.file;
            const activeClass = isActive 
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' 
                : 'bg-white hover:bg-zinc-50 border-zinc-150 hover:border-zinc-200/80 text-zinc-800 hover:shadow-xs hover:-translate-y-0.5';
            const iconClass = isActive ? 'text-white' : 'text-zinc-500';
            const descClass = isActive ? 'text-zinc-400' : 'text-zinc-500';
            const activeTag = isActive 
                ? '<span class="text-[9px] bg-zinc-800 text-zinc-300 font-bold px-1.5 py-0.5 rounded border border-zinc-700 uppercase tracking-wide">Actif</span>' 
                : '';

            const item = document.createElement('a');
            item.href = page.file;
            item.className = `flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${activeClass}`;
            item.innerHTML = `
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 ${isActive ? 'bg-zinc-800' : ''} shrink-0">
                    <i class="${page.icon} ${iconClass} text-xs"></i>
                </div>
                <div class="flex-grow min-w-0">
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-bold text-xs truncate leading-tight">${page.name}</span>
                        ${activeTag}
                    </div>
                    <p class="text-[10px] ${descClass} truncate mt-0.5">${page.desc}</p>
                </div>
                <div class="shrink-0 text-zinc-300 hover:text-zinc-400 transition-colors">
                    <i class="fas fa-chevron-right text-[10px]"></i>
                </div>
            `;

            // Prevent reloading same page if already active
            if (isActive) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleHub(false);
                });
            }

            pagesList.appendChild(item);
        });
    }

    // Live search event listener
    searchInput.addEventListener('input', (e) => {
        renderPages(e.target.value);
    });

    // Prevent propagation inside panel
    panel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Initial render
    renderPages();
})();
