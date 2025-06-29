class PhotoLightbox {
    constructor() {
        this.currentIndex = 0;
        this.photos = [];
        this.isMobile = window.innerWidth <= 768;
        this.startX = 0; // Initialize as class property
        this.endX = 0; // Initialize as class property
        this.lastFocusedElement = null; // To store the element that opened the lightbox
        this.init();
    }

    init() {
        this.collectPhotos();
        this.bindEvents();
        // Debounce handleResize for performance
        this.debouncedHandleResize = this.debounce(this.handleResize.bind(this), 250);
        window.addEventListener('resize', this.debouncedHandleResize);
        this.handleResize(); // Initial call
        this.observeLazyImages();
        this.setupIntersectionObserver(); // For fade-in elements
    }

    collectPhotos() {
        const photoItems = document.querySelectorAll('.photo-item');
        this.photos = Array.from(photoItems).map(item => ({
            element: item,
            // Use data-large-src for explicit large image URL
            src: item.querySelector('img').dataset.largeSrc || item.querySelector('img').src,
            title: item.dataset.title,
            description: item.dataset.description
        }));
    }

    bindEvents() {
        this.photos.forEach((photo, index) => {
            photo.element.addEventListener('click', (e) => {
                // Prevent default behavior for links if photo-item becomes an anchor
                e.preventDefault();
                if (this.isMobile) {
                    this.handleMobileClick(photo.element, index, e);
                } else {
                    this.openLightbox(index);
                }
            });
        });

        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        closeBtn.addEventListener('click', () => this.closeLightbox());
        prevBtn.addEventListener('click', () => this.prevPhoto());
        nextBtn.addEventListener('click', () => this.nextPhoto());

        // Swipe functionality
        lightbox.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX; // Assign to class property
        });

        lightbox.addEventListener('touchend', (e) => {
            this.endX = e.changedTouches[0].clientX; // Assign to class property
            this.handleSwipe();
        });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (!this.isLightboxOpen()) return;

            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.prevPhoto();
                    break;
                case 'ArrowRight':
                    this.nextPhoto();
                    break;
                case 'Tab':
                    this.handleTabKey(e);
                    break;
            }
        });
    }

    isLightboxOpen() {
        return document.getElementById('lightbox').classList.contains('active');
    }

    handleTabKey(e) {
        const focusableElements = Array.from(document.getElementById('lightbox').querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled);

        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    openLightbox(index) {
        this.lastFocusedElement = document.activeElement; // Store the currently focused element
        this.currentIndex = index;
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');

        const photo = this.photos[this.currentIndex];
        lightboxImage.src = photo.src;
        lightboxTitle.textContent = photo.title;
        lightboxDescription.textContent = photo.description;

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false'); // Announce lightbox is active

        // Set focus to the close button for accessibility
        setTimeout(() => {
            document.querySelector('.lightbox-close').focus();
        }, 0); // Small delay to ensure element is rendered and focusable
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true'); // Announce lightbox is hidden

        // Return focus to the element that opened the lightbox
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    showPhoto(index) {
        if (index < 0) {
            this.currentIndex = this.photos.length - 1;
        } else if (index >= this.photos.length) {
            this.currentIndex = 0;
        } else {
            this.currentIndex = index;
        }
        this.updateLightboxContent();
    }

    updateLightboxContent() {
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDescription = document.getElementById('lightbox-description');
        const photo = this.photos[this.currentIndex];

        lightboxImage.src = photo.src;
        lightboxImage.alt = photo.title; // Ensure alt text is updated for accessibility
        lightboxTitle.textContent = photo.title;
        lightboxDescription.textContent = photo.description;
    }

    nextPhoto() {
        this.showPhoto(this.currentIndex + 1);
    }

    prevPhoto() {
        this.showPhoto(this.currentIndex - 1);
    }

    handleSwipe() {
        const threshold = 50;
        const diff = this.startX - this.endX; // Use class properties

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextPhoto();
            } else {
                this.prevPhoto();
            }
        }
    }

    handleMobileClick(element, index, event) {
        // For mobile, if you want a specific behavior, implement it here.
        // Currently, it just opens the lightbox, which might be sufficient.
        // You might add a class to the body to prevent scrolling when lightbox is open on mobile.
        this.openLightbox(index);
    }

    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== this.isMobile) {
            this.isMobile = newIsMobile;
            // No need for clearMobileActive in this context,
            // as mobile behavior is handled by CSS and general JS logic.
        }
    }

    // Lazy loading for images using IntersectionObserver
    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // No need to change src if native lazy loading is used
                    // just add the 'loaded' class for transition.
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the image is visible
        });

        lazyImages.forEach(img => observer.observe(img));
    }

    // Intersection Observer for fade-in elements
    setupIntersectionObserver() {
        const fadeInElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2 // Trigger when 20% of the element is visible
        });

        fadeInElements.forEach(element => observer.observe(element));
    }

    // Debounce function to limit function calls
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new PhotoLightbox();
});