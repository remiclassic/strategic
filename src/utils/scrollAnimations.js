// Utility function to check if we're on mobile/small viewport
export const isMobileView = () => window.innerWidth <= 768;

// Default observer options
const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px 0px 0px'
};

// Animation types
const ANIMATION_TYPES = {
    FADE_UP: 'fade-up',
    FADE_IN: 'fade-in',
    SLIDE_LEFT: 'slide-left',
    SLIDE_RIGHT: 'slide-right',
    ZOOM_IN: 'zoom-in',
    REVEAL: 'reveal'
};

// Create and return an Intersection Observer
export const createScrollObserver = (options = defaultOptions) => {
    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get animation type from data attribute
                const animationType = entry.target.dataset.scrollAnimation || ANIMATION_TYPES.FADE_UP;
                entry.target.classList.add('animate', animationType);
                
                // Add staggered animation to children if specified
                if (entry.target.dataset.stagger) {
                    const children = entry.target.querySelectorAll('[data-stagger-child]');
                    children.forEach((child, index) => {
                        child.style.transitionDelay = `${index * 0.1}s`;
                    });
                }
            } else if (entry.target.dataset.reset) {
                // Reset animation if specified
                entry.target.classList.remove('animate', ...Object.values(ANIMATION_TYPES));
            }
        });
    }, options);
};

// Initialize scroll animations for a section
export const initSectionAnimations = (sectionElement) => {
    const observer = createScrollObserver();
    
    // Find all elements with data-scroll-animation
    const animatedElements = sectionElement.querySelectorAll('[data-scroll-animation]');
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Clean up function
    return () => observer.disconnect();
};

// Handle resize events
let resizeTimeout;
export const handleResize = (callback) => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(callback, 250);
};

// Respect user's motion preferences
export const respectMotionPreferences = (element) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.style.transition = 'none';
        element.querySelectorAll('*').forEach(child => {
            child.style.transition = 'none';
            child.style.animation = 'none';
        });
    }
}; 