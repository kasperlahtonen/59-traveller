document.addEventListener("DOMContentLoaded", () => {
    const lang = localStorage.getItem("lang") || "fi";
    // Keep a reference to the carousel instance - it will be set by carousel.js if loaded.
    // main.js will look for window.destinationCarouselInstance

    loadHeaderFooter();
    loadLanguage(lang);
    loadMessageBox();

    // Initialize map only when it comes into viewport
    const satelliteMapContainer = document.getElementById('satellite-map');
    if (satelliteMapContainer) {
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Map is in viewport, initialize it
                    initializeMap(satelliteMapContainer);
                    // Once initialized, we don't need to observe anymore
                    mapObserver.unobserve(entry.target);
                }
            });
        }, {
            // Start loading when the map container is 20% visible
            threshold: 0.2
        });

        mapObserver.observe(satelliteMapContainer);
    }
});

// Separate map initialization into its own function
function initializeMap(container) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2FzcGVybGFodG9uZW4iLCJhIjoiY203bHBtbXM5MGM0MjJrczZpMWJteGpwdCJ9.8jSzxNuPUGkVDLdIPfvykg';

    const satelliteMap = new mapboxgl.Map({
        container: 'satellite-map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [2.3, 48.8],
        zoom: 1.5
    });

    satelliteMap.on('style.load', () => {
        console.log('Satellite map style loaded');
        satelliteMap.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        satelliteMap.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        satelliteMap.addControl(new mapboxgl.NavigationControl());
        satelliteMap.addControl(new mapboxgl.FullscreenControl());

        // Pass the map instance to the carousel if it exists
        if (window.destinationCarouselInstance && typeof window.destinationCarouselInstance.setMap === 'function') {
            window.destinationCarouselInstance.setMap(satelliteMap);
        } else {
            // Poll for a short time in case carousel.js initializes slightly later
            let attempts = 0;
            const intervalId = setInterval(() => {
                attempts++;
                if (window.destinationCarouselInstance && typeof window.destinationCarouselInstance.setMap === 'function') {
                    window.destinationCarouselInstance.setMap(satelliteMap);
                    clearInterval(intervalId);
                } else if (attempts > 10) {
                    clearInterval(intervalId);
                    console.warn('Carousel instance not found or setMap not available after polling.');
                }
            }, 100);
        }
    });

    satelliteMap.on('load', () => {
        console.log("Map fully loaded (including tiles)");
    });

    satelliteMap.on('error', (e) => {
        console.error('Mapbox error:', e.error);
    });
}

function loadHeaderFooter() {
    fetch("/components/header.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
            // Add language switch listener after header is loaded
            const langSwitch = document.getElementById("lang-switch");
            if (langSwitch) {
                langSwitch.addEventListener("click", () => {
                    const newLang = (localStorage.getItem("lang") === "fi") ? "en" : "fi";
                    localStorage.setItem("lang", newLang);
                    loadLanguage(newLang);
                });
            }
        })
        .catch(error => console.error('Error loading header:', error));

    fetch("/components/footer.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("footer").innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

function loadMessageBox() {
    fetch("/components/message-box.html")
        .then(res => res.text())
        .then(data => {
            const messageBox = document.getElementById("message-box");
            if (messageBox) {
                messageBox.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading message box:', error));
}

function loadLanguage(lang) {
    fetch(`/lang/${lang}.json`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(translations => {
            document.querySelectorAll("[data-translate]").forEach(el => {
                const key = el.getAttribute("data-translate");
                if (translations[key]) {
                    el.textContent = translations[key];
                }
            });
            const langSwitch = document.getElementById("lang-switch");
            if (langSwitch) {
                langSwitch.textContent = (lang === "fi") ? "EN" : "FI";
            }
        })
        .catch(error => {
            console.error('Error loading language file:', error);
            // Create default translations if file is missing
            const defaultTranslations = {
                "fi": {
                    "welcome": "Tervetuloa",
                    "about": "Tietoa meistä",
                    "contact": "Yhteystiedot"
                },
                "en": {
                    "welcome": "Welcome",
                    "about": "About Us",
                    "contact": "Contact"
                }
            };
            // Apply default translations
            document.querySelectorAll("[data-translate]").forEach(el => {
                const key = el.getAttribute("data-translate");
                if (defaultTranslations[lang] && defaultTranslations[lang][key]) {
                    el.textContent = defaultTranslations[lang][key];
                }
            });
        });
}
