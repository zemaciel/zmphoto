class PhotoLightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxTitle = document.getElementById('lightbox-title');
        this.lightboxDescription = document.getElementById('lightbox-description');
        this.photos = Array.from(document.querySelectorAll('.photo-item'));
        this.currentIndex = 0;
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;

        this.init();
    }

    init() {
        this.bindEvents();
        this.bindLightboxEvents();
    }

    bindEvents() {
        this.photos.forEach((photo, index) => {
            photo.addEventListener('click', (e) => {
                if (this.isMobile && !photo.classList.contains('mobile-active')) {
                    photo.classList.add('mobile-active');
                    e.preventDefault();
                } else {
                    this.openLightbox(index);
                }
            });

            const closeBtn = photo.querySelector('.mobile-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    photo.classList.remove('mobile-active');
                    e.stopPropagation();
                });
            }
        });
    }

    bindLightboxEvents() {
        document.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        document.querySelector('.lightbox-prev').addEventListener('click', () => this.navigate(-1));
        document.querySelector('.lightbox-next').addEventListener('click', () => this.navigate(1));

        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.navigate(-1);
                    break;
                case 'ArrowRight':
                    this.navigate(1);
                    break;
            }
        });

        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) this.closeLightbox();
        });
    }

    openLightbox(index) {
        this.currentIndex = index;
        const photo = this.photos[index];
        const img = photo.querySelector('img');

        this.lightboxImg.src = img.dataset.largeSrc || img.src;
        this.lightboxImg.alt = img.alt;

        this.lightboxTitle.textContent = photo.dataset.title || '';
        this.lightboxDescription.textContent = photo.dataset.description || '';

        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';

        this.photos.forEach(photo => photo.classList.remove('mobile-active'));
    }

    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.photos.length) % this.photos.length;
        this.openLightbox(this.currentIndex);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhotoLightbox();
});