        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Fade in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in elements
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });

        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(26, 26, 26, 0.98)';
            } else {
                navbar.style.background = 'rgba(26, 26, 26, 0.95)';
            }
        });

        // Photo item stagger animation
        const photoItems = document.querySelectorAll('.photo-item');
        photoItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });

        class PhotoLightbox {
            constructor() {
                this.currentIndex = 0;
                this.photos = [];
                this.isMobile = window.innerWidth <= 768;
                this.init();
            }

            init() {
                this.collectPhotos();
                this.bindEvents();
                this.handleResize();
            }

            collectPhotos() {
                const photoItems = document.querySelectorAll('.photo-item');
                this.photos = Array.from(photoItems).map(item => ({
                    element: item,
                    src: item.querySelector('img').src.replace('w=500&h=400', 'w=1200&h=900'),
                    title: item.dataset.title,
                    description: item.dataset.description
                }));
            }

            bindEvents() {
                // Photo item clicks
                this.photos.forEach((photo, index) => {
                    photo.element.addEventListener('click', (e) => {
                        if (this.isMobile) {
                            this.handleMobileClick(photo.element, index, e);
                        } else {
                            this.openLightbox(index);
                        }
                    });
                });

                // Lightbox events
                const lightbox = document.getElementById('lightbox');
                const closeBtn = document.querySelector('.lightbox-close');
                const prevBtn = document.querySelector('.lightbox-prev');
                const nextBtn = document.querySelector('.lightbox-next');

                closeBtn.addEventListener('click', () => this.closeLightbox());
                prevBtn.addEventListener('click', () => this.prevPhoto());
                nextBtn.addEventListener('click', () => this.nextPhoto());

                // Close on backdrop click
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        this.closeLightbox();
                    }
                });

                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (!lightbox.classList.contains('active')) return;

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
                    }
                });

                // Touch events for mobile swipe
                if (this.isMobile) {
                    this.bindTouchEvents();
                }

                // Window resize
                window.addEventListener('resize', () => this.handleResize());
            }

            handleMobileClick(element, index, e) {
                const expandBtn = element.querySelector('.expand-btn');

                if (e.target === expandBtn) {
                    this.openLightbox(index);
                    return;
                }

                if (element.classList.contains('mobile-active')) {
                    // Second tap - open lightbox
                    this.openLightbox(index);
                } else {
                    // First tap - show overlay
                    this.clearMobileActive();
                    element.classList.add('mobile-active');
                }
            }

            clearMobileActive() {
                this.photos.forEach(photo => {
                    photo.element.classList.remove('mobile-active');
                });
            }

            openLightbox(index) {
                this.currentIndex = index;
                const photo = this.photos[index];

                const lightbox = document.getElementById('lightbox');
                const img = document.getElementById('lightbox-img');
                const title = document.getElementById('lightbox-title');
                const description = document.getElementById('lightbox-description');

                img.src = photo.src;
                img.alt = photo.title;
                title.textContent = photo.title;
                description.textContent = photo.description;

                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            closeLightbox() {
                const lightbox = document.getElementById('lightbox');
                lightbox.classList.remove('active');
                document.body.style.overflow = '';

                if (this.isMobile) {
                    this.clearMobileActive();
                }
            }

            prevPhoto() {
                this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
                this.updateLightboxContent();
            }

            nextPhoto() {
                this.currentIndex = (this.currentIndex + 1) % this.photos.length;
                this.updateLightboxContent();
            }

            updateLightboxContent() {
                const photo = this.photos[this.currentIndex];
                const img = document.getElementById('lightbox-img');
                const title = document.getElementById('lightbox-title');
                const description = document.getElementById('lightbox-description');

                img.src = photo.src;
                img.alt = photo.title;
                title.textContent = photo.title;
                description.textContent = photo.description;
            }

            bindTouchEvents() {
                const lightbox = document.getElementById('lightbox');
                let startX = 0;
                let endX = 0;

                lightbox.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                });

                lightbox.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    this.handleSwipe();
                });
            }

            handleSwipe() {
                const threshold = 50;
                const diff = startX - endX;

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        this.nextPhoto();
                    } else {
                        this.prevPhoto();
                    }
                }
            }

            handleResize() {
                const newIsMobile = window.innerWidth <= 768;
                if (newIsMobile !== this.isMobile) {
                    this.isMobile = newIsMobile;
                    this.clearMobileActive();
                }
            }
        }
        // Cookie functionality
        function showCookieBanner() {
            if (!localStorage.getItem('cookiesAccepted') && !localStorage.getItem('cookiesDeclined')) {
                setTimeout(() => {
                    document.getElementById('cookieBanner').classList.add('show');
                }, 2000);
            }
        }

        function acceptCookies() {
            localStorage.setItem('cookiesAccepted', 'true');
            document.getElementById('cookieBanner').classList.remove('show');
        }

        function declineCookies() {
            localStorage.setItem('cookiesDeclined', 'true');
            document.getElementById('cookieBanner').classList.remove('show');
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new PhotoLightbox();
            showCookieBanner(); // Move this inside DOMContentLoaded
        });