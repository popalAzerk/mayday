// Configuration and Constants
window.CONFIG = {
    REFERENCE_DATE: new Date(),
    CURRENT_YEAR: new Date().getFullYear(),
    // Reference: https://support.apple.com/en-us/102772
    // Vintage: 5-7 years since discontinuation (still serviceable)
    // Obsolete: 7+ years since discontinuation (no service)
    VINTAGE_THRESHOLD_YEARS: 5,
    OBSOLETE_THRESHOLD_YEARS: 7,
    AVERAGE_REPAIR_MINS: 90
};

window.LEVEL_COLORS = ['green', 'yellow', 'orange', 'red', 'purple'];

window.DEFAULT_SETTINGS = {
    geniusCount: 4,
    workHours: 8,
    timeMultiplier: 1.0,
    ripCount: 0
};

// Helper function to get Mac status
// Supports both Intel and Apple Silicon products
// Apple Silicon products can now be Vintage/Obsolete (e.g. M1 from 2020)
// Reference: https://support.apple.com/en-us/102772
window.getMacStatus = function (year, chip) {
    const age = window.CONFIG.CURRENT_YEAR - year;

    // Check vintage threshold for ALL Macs
    // Obsolete products are considered Vintage as they are still repairable (e.g. Battery)
    if (age >= window.CONFIG.VINTAGE_THRESHOLD_YEARS) return "Vintage";
    
    return "Current";
};
