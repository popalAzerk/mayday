window.diagnosticsData = {
    "preDiagnostics": {
        "mri": {
            "name": "MRI System Check",
            "duration": 5
        },
        "display": {
            "name": "Test Qualité Affichage",
            "duration": 5
        },
        "audio": {
            "name": "Test Audio",
            "duration": 5
        },
        "keyboard": {
            "name": "Test Clavier",
            "duration": 5
        },
        "trackpad": {
            "name": "Trackpad Calibration",
            "duration": 5
        },
        "ports": {
            "name": "Test Ports I/O",
            "duration": 5
        },
        "asd_efi": {
            "name": "ASD EFI",
            "duration": 90
        },
        "asd_os": {
            "name": "ASD OS",
            "duration": 30
        }
    },
    "postDiagnostics": {
        "appleSilicon": [
            {
                "name": "Diagnostic rapide (Apple Silicon)",
                "duration": 3
            },
            {
                "name": "Test complet du système (Apple Silicon)",
                "duration": 7
            }
        ],
        "intel": [
            {
                "name": "Apple Diagnostics (Intel)",
                "duration": 5
            },
            {
                "name": "Test de stress thermique (Intel)",
                "duration": 10
            }
        ]
    },
    "constants": {
        "vintageThresholdYears": 5,
        "obsoleteThresholdYears": 10,
        "averageRepairMinutes": 90
    }
};
