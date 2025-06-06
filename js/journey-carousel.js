class JourneyCarousel {
    constructor() {
        this.track = document.querySelector('.journey-carousel-track');
        this.dotsContainer = document.querySelector('.journey-carousel-dots');
        this.prevButton = document.querySelector('.journey-carousel-button.prev');
        this.nextButton = document.querySelector('.journey-carousel-button.next');
        this.currentIndex = 0;
        this.journeys = [];
        
        this.init();
    }

    init() {
        if (!this.track) return;
        
        // Get all journey links from the track
        this.journeys = Array.from(this.track.querySelectorAll('.journey-link'));
        
        if (this.journeys.length <= 1) {
            // Hide controls if there's only one or no journeys
            this.hideControls();
            return;
        }
        
        this.createDots();
        this.addEventListeners();
        this.updateControls();
    }

    createDots() {
        if (!this.dotsContainer) return;
        
        this.journeys.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `journey-carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
    }

    updateControls() {
        // Update button states
        if (this.prevButton) {
            this.prevButton.disabled = this.currentIndex === 0;
        }
        if (this.nextButton) {
            this.nextButton.disabled = this.currentIndex === this.journeys.length - 1;
        }
        
        // Update dots
        this.updateDots();
    }

    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.journey-carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.journeys.length) return;
        
        this.currentIndex = index;
        
        // Calculate the proper transform value
        // Since we have padding on the links, we need to account for that
        const containerWidth = this.track.parentElement.offsetWidth;
        const cardWidth = this.journeys[0].offsetWidth; // Get actual card width including padding
        const translateValue = -(index * cardWidth);
        
        this.track.style.transform = `translateX(${translateValue}px)`;
        
        this.updateControls();
    }

    goToPrevious() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    goToNext() {
        if (this.currentIndex < this.journeys.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    hideControls() {
        if (this.prevButton) this.prevButton.style.display = 'none';
        if (this.nextButton) this.nextButton.style.display = 'none';
        if (this.dotsContainer) this.dotsContainer.style.display = 'none';
    }

    addEventListeners() {
        // Previous button
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.goToPrevious());
        }

        // Next button
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.goToNext());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Only handle if the carousel is visible and has focus context
            if (!this.track || this.journeys.length <= 1) return;
            
            if (e.key === 'ArrowLeft') {
                this.goToPrevious();
            } else if (e.key === 'ArrowRight') {
                this.goToNext();
            }
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let endX = 0;

        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });

        this.track.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            this.track.style.cursor = 'grabbing';
        });

        this.track.addEventListener('mouseup', (e) => {
            endX = e.clientX;
            this.handleSwipe();
            this.track.style.cursor = 'grab';
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = startX - endX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swiped left, go to next
                this.goToNext();
            } else {
                // Swiped right, go to previous
                this.goToPrevious();
            }
        }
    }
}

// Initialize the journey carousel when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JourneyCarousel();
}); 