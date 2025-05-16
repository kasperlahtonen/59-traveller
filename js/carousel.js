class DestinationCarousel {
    constructor() {
        this.track = document.querySelector('.carousel-track');
        this.dotsContainer = document.querySelector('.carousel-dots');
        this.prevButton = document.querySelector('.carousel-button.prev');
        this.nextButton = document.querySelector('.carousel-button.next');
        this.currentIndex = 0;
        this.destinations = [];
        this.map = null;
        
        this.init();
    }

    async init() {
        try {
            const response = await fetch('./assets/destinations.json');
            const data = await response.json();
            this.destinations = data.destinations;
            
            this.createCards();
            this.createDots();
            this.updateButtons();
            this.addEventListeners();
            
            // If the map instance was already set by the time destinations loaded, attempt to zoom.
            if (this.map) {
                this.zoomToCurrentDestination();
            }
        } catch (error) {
            console.error('Error loading destinations:', error);
        }
    }

    createCards() {
        this.destinations.forEach((destination, index) => {
            const card = document.createElement('div');
            card.className = 'explore-card';
            card.setAttribute('data-destination', destination.destination_name);
            card.innerHTML = `
                <div class="explore-card-img-container">
                    <img src="./assets/images/${destination.image}" 
                         alt="${destination.destination_name}" 
                         class="explore-card-img"
                         onerror="this.src='./assets/images/destinations/default-destination.jpg'">
                </div>
                <div class="explore-card-info">
                    <h3>${destination.destination_name}</h3>
                    <p>${destination.description}</p>
                    <p class="best-season">Best time to visit: ${destination.best_season}</p>
                </div>
            `;
            this.track.appendChild(card);
        });
    }

    createDots() {
        this.destinations.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    updateButtons() {
        this.prevButton.disabled = this.currentIndex === 0;
        this.nextButton.disabled = this.currentIndex === this.destinations.length - 1;
    }

    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    zoomToCurrentDestination() {
        if (!this.map) return;
        
        const currentDestination = this.destinations[this.currentIndex];
        if (currentDestination) {
            this.map.flyTo({
                center: [currentDestination.longitude, currentDestination.latitude],
                zoom: 4,
                duration: 3000
            });
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.track.style.transform = `translateX(-${index * 100}%)`;
        this.updateDots();
        this.updateButtons();
        this.zoomToCurrentDestination();
    }

    addEventListeners() {
        this.prevButton.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.goToSlide(this.currentIndex - 1);
            }
        });

        this.nextButton.addEventListener('click', () => {
            if (this.currentIndex < this.destinations.length - 1) {
                this.goToSlide(this.currentIndex + 1);
            }
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentIndex > 0) {
                this.goToSlide(this.currentIndex - 1);
            } else if (e.key === 'ArrowRight' && this.currentIndex < this.destinations.length - 1) {
                this.goToSlide(this.currentIndex + 1);
            }
        });
    }

    // New method to receive the map instance
    setMap(mapInstance) {
        this.map = mapInstance;
        // If destinations are already loaded by the time map is set, attempt to zoom.
        if (this.destinations && this.destinations.length > 0) {
            this.zoomToCurrentDestination();
        }
    }
}

// Initialize the carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Carousel is instantiated here, but map is set by main.js
    if (typeof DestinationCarousel !== 'undefined') {
         // Ensure it's globally accessible or handle differently if main.js instantiates it.
        window.destinationCarouselInstance = new DestinationCarousel(); 
    }
}); 