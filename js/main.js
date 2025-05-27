document.addEventListener("DOMContentLoaded", () => {
    const lang = localStorage.getItem("lang") || "fi";
    // Keep a reference to the carousel instance - it will be set by carousel.js if loaded.
    // main.js will look for window.destinationCarouselInstance

    loadHeaderFooter();
    loadLanguage(lang);
    loadMessageBox();
    initializeHeroSlideshow();

    // Sticky header show/hide on scroll
    let lastScrollY = window.scrollY;
    let ticking = false;
    const header = document.querySelector('header');
    function onScroll() {
        if (!header) return;
        if (window.scrollY > lastScrollY && window.scrollY > 80) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScrollY = window.scrollY;
        ticking = false;
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });

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
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
        // Add golf course markers after map is fully loaded
        addGolfCourseMarkers(satelliteMap);
    });

    satelliteMap.on('error', (e) => {
        console.error('Mapbox error:', e.error);
    });
}

// New function to add golf course markers
async function addGolfCourseMarkers(map) {
    let currentPopup = null;
    try {
        const response = await fetch('./assets/golf-courses.json');
        const data = await response.json();
        const courses = data.destinations;

        courses.forEach(course => {
            // Create a DOM element for the marker
            const el = document.createElement('div');
            el.className = 'golf-marker';
            el.innerHTML = '⛳'; // Golf flag emoji as marker
            
            // Style the marker
            el.style.fontSize = '20px';
            el.style.cursor = 'pointer';
            el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.7)';

            // Create popup content
            const popupContent = `
                <div class="golf-popup">
                    <h3>${course.name}</h3>
                    <p><strong>Address:</strong> ${course.Address}</p>
                    ${course.website ? `<p><a href="${course.website}" target="_blank">Visit Website</a></p>` : ''}
                </div>
            `;

            const popup = new mapboxgl.Popup({ 
                offset: 25,
                closeButton: true,
                closeOnClick: false
            }).setHTML(popupContent);

            // Add the marker to the map
            const marker = new mapboxgl.Marker(el)
                .setLngLat([course.longitude, course.latitude])
                .setPopup(popup)
                .addTo(map);

            // Ensure only one popup is open at a time
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentPopup && currentPopup.isOpen()) {
                    currentPopup.remove();
                }
                popup.addTo(map);
                currentPopup = popup;
            });
            // Also close the reference if the popup is closed by user
            popup.on('close', () => {
                if (currentPopup === popup) {
                    currentPopup = null;
                }
            });
        });

        console.log(`Added ${courses.length} golf course markers to the map`);
    } catch (error) {
        console.error('Error loading golf courses:', error);
    }
}


function loadHeaderFooter() {
    fetch("./components/header.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
            // Initialize navigation after header is loaded
            initializeNavigation();
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

    fetch("./components/footer.html")
        .then(res => res.text())
        .then(data => {
            document.querySelector("footer").innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

function loadMessageBox() {
    fetch("./components/message-box.html")
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
    fetch(`./lang/${lang}.json`)
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

function initializeHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    function showNextSlide() {
        // Remove active class from current slide
        slides[currentSlide].classList.remove('active');
        
        // Move to next slide (loop back to 0 if at the end)
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add active class to new slide
        slides[currentSlide].classList.add('active');
    }

    // Start the slideshow - change every 4 seconds (4000ms)
    setInterval(showNextSlide, 4000);
}

// Navigation hamburger menu functionality
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!hamburger || !navMenu) {
        console.warn('Navigation elements not found');
        return;
    }

    // Toggle hamburger menu
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // Close menu when clicking hamburger
    hamburger.addEventListener('click', toggleMenu);

    // Close menu when clicking close button
    if (navClose) {
        navClose.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close menu on window resize if screen becomes larger
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}
