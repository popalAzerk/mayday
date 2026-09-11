window.PART_DIAGNOSTICS = {
    "Carte USB-C": {
        systemConfig: false,
        diags: ["MagSafe 3 et ports d'alimentation", "Diagnostic post-réparation"]
    },
    "Module ventilateur/antenne": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte logique": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte MagSafe 3": {
        systemConfig: false,
        diags: ["MagSafe 3 et ports d'alimentation", "Diagnostic post-réparation"]
    },
    "Carte MagSafe": { // Normalization alias
        systemConfig: false,
        diags: ["MagSafe 3 et ports d'alimentation", "Diagnostic post-réparation"]
    },
    "Capteur d'ouverture/de fermeture (AMR)": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Haut-parleurs": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation"]
    },
    "Ventilateur": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Ventilateurs": { // Normalization alias
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Déblocage flash": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation"]
    },
    "Ports USB-C avant": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Nappe de connexion haute vitesse": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Boîtier": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Châssis intérieur": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte d'E/S": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation"]
    },
    "Façade des E/S": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Nappe de connexion basse vitesse": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Bouton d'alimentation": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Bloc d'alimentation": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Lecteur de carte SDXC": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Socle": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Kit de montage VESA": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte audio": {
        systemConfig: false,
        diags: ["Audio", "Diagnostic post-réparation"]
    },
    "Batterie": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Nappe de connexion de la BMU": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Boîtier intérieur": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Écran": {
        systemConfig: true,
        diags: ["Anomalies d'affichage", "Persistance d'image", "Diagnostic post-réparation"]
    },
    "Boîtier supérieur": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation", "Clavier", "Trackpad", "Réactivité de la Touch Bar", "Anomalies de pixels de la Touch Bar"]
    },
    "Carte du Touch ID": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation", "Touch ID"]
    },
    "Touch ID": { // Normalization alias
        systemConfig: true,
        diags: ["Diagnostic post-réparation", "Touch ID"]
    },
    "Câble du Touch ID": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation", "Touch ID"]
    },
    "Trackpad": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation", "Vérification de l'étalonnage du trackpad"]
    },
    "Entrée de l'alimentation secteur": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte d'adaptateur": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Antennes": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte du connecteur d'antenne": {
        systemConfig: true,
        diags: ["Diagnostic post-réparation"]
    },
    "Ports Thunderbolt 4 arrière": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Pieds (bouton)": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Caméra et câble eDP": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte d'E/S mixte": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Câble de rétroéclairage de l'écran": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Carte Ethernet": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    },
    "Protection contre les interférences électromagnétiques": {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    }
};

window.getDiagnosticsForPart = function (partName) {
    // Normalize string: lowercase and remove accents
    const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const target = normalize(partName);

    // Direct lookup first (case insensitive)
    for (const key of Object.keys(window.PART_DIAGNOSTICS)) {
        if (key.toLowerCase() === partName.toLowerCase()) return window.PART_DIAGNOSTICS[key];
    }

    // Fuzzy match with normalization
    for (const key of Object.keys(window.PART_DIAGNOSTICS)) {
        const dbKey = normalize(key);

        // Exact match after normalization
        if (dbKey === target) return window.PART_DIAGNOSTICS[key];

        // Containment
        if (target.includes(dbKey)) return window.PART_DIAGNOSTICS[key];
        if (dbKey.includes(target)) return window.PART_DIAGNOSTICS[key];
    }

    // Default fallback
    return {
        systemConfig: false,
        diags: ["Diagnostic post-réparation"]
    };
};
