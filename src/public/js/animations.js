/**
 * Apple-inspired animations and micro-interactions for DailyEdge
 * Enhances user experience with smooth, delightful animations
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        animationDuration: 300,
        scrollThreshold: 0.1,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    };

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initializeAnimations);

    function initializeAnimations() {
        setupScrollAnimations();
        setupHoverEffects();
        setupClickAnimations();
        setupToggleAnimations();
        setupParallaxEffect();
        setupProgressBarAnimations();
    }

    /**
     * Intersection Observer for scroll-triggered animations
     */
    function setupScrollAnimations() {
        if (!window.IntersectionObserver) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    element.classList.add('animate-in');
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: config.scrollThreshold,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements with animation classes
        const elementsToAnimate = document.querySelectorAll(
            '.animation-fadeIn, .animation-fadeInUp, .animation-slideUp, .animation-scaleIn, .step-card'
        );
        
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    }

    /**
     * Enhanced hover effects for interactive elements
     */
    function setupHoverEffects() {
        // Card hover effects
        const cards = document.querySelectorAll('.card:not(.bg-primary):not(.bg-success):not(.bg-info):not(.bg-warning)');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.01)';
                card.style.transition = `all ${config.animationDuration}ms ${config.easing}`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('btn-outline-primary') && 
                    !button.classList.contains('btn-outline-danger') &&
                    !button.classList.contains('btn-outline-secondary')) {
                    button.style.transform = 'translateY(-2px)';
                    button.style.transition = `all ${config.animationDuration}ms ${config.easing}`;
                }
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });

        // Navbar brand animation
        const navbarBrand = document.querySelector('.navbar-brand');
        if (navbarBrand) {
            navbarBrand.addEventListener('mouseenter', () => {
                navbarBrand.style.transform = 'scale(1.05)';
                navbarBrand.style.transition = `all ${config.animationDuration}ms ${config.easing}`;
            });

            navbarBrand.addEventListener('mouseleave', () => {
                navbarBrand.style.transform = 'scale(1)';
            });
        }
    }

    /**
     * Click animations for better feedback
     */
    function setupClickAnimations() {
        // Button click effects
        const buttons = document.querySelectorAll('.btn, .interactive');
        buttons.forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.98)';
                button.style.transition = `all 150ms ${config.easing}`;
            });

            button.addEventListener('mouseup', () => {
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 100);
            });

            // Handle mouse leave during click
            button.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    /**
     * Enhanced toggle switch animations
     */
    function setupToggleAnimations() {
        const toggles = document.querySelectorAll('.form-check-input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                // Add a satisfying scale animation
                toggle.style.transform = 'scale(1.1)';
                toggle.style.transition = `all 200ms ${config.easing}`;
                
                setTimeout(() => {
                    toggle.style.transform = 'scale(1)';
                }, 200);

                // Add ripple effect
                createRipple(toggle);
            });
        });
    }

    /**
     * Subtle parallax effect for hero section
     */
    function setupParallaxEffect() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            
            heroSection.style.transform = `translateY(${parallax}px)`;
        });
    }

    /**
     * Animated progress bars
     */
    function setupProgressBarAnimations() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const width = progressBar.style.width;
                    
                    // Reset width and animate
                    progressBar.style.width = '0%';
                    progressBar.style.transition = `width 1000ms ${config.easing}`;
                    
                    setTimeout(() => {
                        progressBar.style.width = width;
                    }, 100);
                    
                    observer.unobserve(progressBar);
                }
            });
        });

        progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }

    /**
     * Create ripple effect for interactions
     */
    function createRipple(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = rect.width / 2 - size / 2;
        const y = rect.height / 2 - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        // Add ripple styles
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple-animation 600ms linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('style[data-ripple]')) {
            style.setAttribute('data-ripple', 'true');
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Smooth scroll for anchor links
     */
    function setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Page transition effect
     */
    function setupPageTransitions() {
        // Add loading state for navigation
        const navLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"])');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only for same-origin links
                if (link.hostname === window.location.hostname) {
                    document.body.style.opacity = '0.7';
                    document.body.style.transition = 'opacity 300ms ease';
                }
            });
        });
    }

    /**
     * Add CSS for animations if not already present
     */
    function addAnimationStyles() {
        if (document.querySelector('style[data-animations]')) return;

        const style = document.createElement('style');
        style.setAttribute('data-animations', 'true');
        style.textContent = `
            .animate-in {
                animation-play-state: running !important;
            }
            
            /* Enhance existing animations */
            .animation-fadeIn:not(.animate-in) {
                opacity: 0;
                animation-play-state: paused;
            }
            
            .animation-fadeInUp:not(.animate-in) {
                opacity: 0;
                transform: translateY(30px);
                animation-play-state: paused;
            }
            
            .animation-slideUp:not(.animate-in) {
                opacity: 0;
                transform: translateY(40px);
                animation-play-state: paused;
            }
            
            .animation-scaleIn:not(.animate-in) {
                opacity: 0;
                transform: scale(0.9);
                animation-play-state: paused;
            }
            
            .step-card:not(.animate-in) {
                opacity: 0;
                transform: translateY(40px);
                animation-play-state: paused;
            }
            
            /* Enhanced hover states */
            .hover-enhanced {
                transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .hover-enhanced:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
        `;
        
        document.head.appendChild(style);
    }

    // Initialize additional features
    setupSmoothScroll();
    setupPageTransitions();
    addAnimationStyles();

    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

})();