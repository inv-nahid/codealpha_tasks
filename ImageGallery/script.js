// Gallery functionality
class ImageGallery {
    constructor() {
        this.currentImageIndex = 0;
        this.filteredImages = [];
        this.allImages = [];
        this.init();
    }

    async init() {
        await this.loadImagesFromAPI();
        this.setupEventListeners();
        this.filterImages('all');
    }

    async loadImagesFromAPI() {
        try {
            // Show loading spinner
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading images...</p></div>';

            // Define our image categories and corresponding Picsum IDs
            const imageCategories = {
                nature: [
                    { id: 1015, title: "Mountain Lake" },
                    { id: 1018, title: "Forest Path" },
                    { id: 1019, title: "Ocean Waves" },
                    { id: 1020, title: "Waterfall" },
                    { id: 1021, title: "Sunset Valley" }
                ],
                city: [
                    { id: 1000, title: "City Skyline" },
                    { id: 1001, title: "Urban Street" },
                    { id: 1003, title: "Metropolis" },
                    { id: 1004, title: "Night Lights" },
                    { id: 1005, title: "Downtown" }
                ],
                people: [
                    { id: 1006, title: "Portrait" },
                    { id: 1009, title: "Street Photography" },
                    { id: 1011, title: "Group Photo" },
                    { id: 1012, title: "Candid Moment" },
                    { id: 1013, title: "Fashion Shoot" }
                ],
                animals: [
                    { id: 1022, title: "Wild Cat" },
                    { id: 1024, title: "Bird" },
                    { id: 1025, title: "Puppy" },
                    { id: 1028, title: "Elephant" },
                    { id: 1031, title: "Tropical Fish" }
                ]
            };

            // Process each category
            for (const [category, images] of Object.entries(imageCategories)) {
                for (const image of images) {
                    this.allImages.push({
                        id: image.id,
                        src: `https://picsum.photos/id/${image.id}/600/400`,
                        alt: image.title,
                        title: image.title,
                        category: category.charAt(0).toUpperCase() + category.slice(1),
                        categoryData: category
                    });
                }
            }

            // Render the gallery items
            this.renderGalleryItems();

        } catch (error) {
            console.error("Error loading images:", error);
            document.getElementById('gallery').innerHTML = '<p class="error-message">Failed to load images. Please try again later.</p>';
        }
    }

    renderGalleryItems() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        this.allImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.category = image.categoryData;

            galleryItem.innerHTML = `
                <img src="${image.src}" alt="${image.alt}" loading="lazy">
                <div class="gallery-item-overlay">
                    <div class="gallery-item-title">${image.title}</div>
                    <div class="gallery-item-category">${image.category}</div>
                </div>
            `;

            gallery.appendChild(galleryItem);
        });
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                // Filter images
                this.filterImages(e.target.dataset.filter);
            });
        });

        // Gallery items (using event delegation since items are dynamic)
        document.getElementById('gallery').addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = Array.from(galleryItem.parentNode.children).indexOf(galleryItem);
                this.openLightbox(index);
            }
        });

        // Lightbox controls
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        const lightbox = document.getElementById('lightbox');

        lightboxClose.addEventListener('click', () => this.closeLightbox());
        lightboxPrev.addEventListener('click', () => this.prevImage());
        lightboxNext.addEventListener('click', () => this.nextImage());

        // Close lightbox when clicking outside
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox').classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.prevImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    }

    filterImages(filter) {
        const galleryItems = document.querySelectorAll('.gallery-item');

        // Reset filtered images array
        this.filteredImages = [];

        galleryItems.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;

            if (shouldShow) {
                item.classList.remove('hidden');
                this.filteredImages.push(this.allImages[index]);
                // Add staggered animation
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 50);
            } else {
                item.classList.add('hidden');
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
            }
        });

        // Update current image index for lightbox
        this.currentImageIndex = 0;
    }

    openLightbox(index) {
        // Find the index in filtered images
        const clickedImage = this.allImages[index];
        const filteredIndex = this.filteredImages.findIndex(img =>
            img.src === clickedImage.src && img.title === clickedImage.title
        );

        if (filteredIndex !== -1) {
            this.currentImageIndex = filteredIndex;
            this.updateLightboxContent();
            document.getElementById('lightbox').classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.filteredImages.length) % this.filteredImages.length;
        this.updateLightboxContent();
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.filteredImages.length;
        this.updateLightboxContent();
    }

    updateLightboxContent() {
        const currentImage = this.filteredImages[this.currentImageIndex];
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxCategory = document.getElementById('lightboxCategory');

        // Add fade effect
        lightboxImage.style.opacity = '0';

        setTimeout(() => {
            // Use higher resolution image for lightbox
            const highResSrc = currentImage.src.replace('/600/400', '/1200/800');
            lightboxImage.src = highResSrc;
            lightboxImage.alt = currentImage.alt;
            lightboxTitle.textContent = currentImage.title;
            lightboxCategory.textContent = currentImage.category;

            lightboxImage.style.opacity = '1';
        }, 150);

        // Update navigation button visibility
        const prevBtn = document.getElementById('lightboxPrev');
        const nextBtn = document.getElementById('lightboxNext');

        if (this.filteredImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create gallery instance
    window.gallery = new ImageGallery();

    // Add touch support for mobile
    addTouchSupport();

    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Touch support for mobile lightbox navigation
function addTouchSupport() {
    const lightbox = document.getElementById('lightbox');
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next image
                gallery.nextImage();
            } else {
                // Swiped right - previous image
                gallery.prevImage();
            }
        }
    }
}

// Add resize handler for responsive behavior
window.addEventListener('resize', () => {
    const gallery = document.querySelector('.gallery');
    if (gallery) {
        // Force recalculation of grid layout
        gallery.style.display = 'none';
        gallery.offsetHeight; // Trigger reflow
        gallery.style.display = 'grid';
    }
});