// SoluNex Tech - Main JavaScript Controls

document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileMenu();
    initStatsCounter();
    initTestimonialSlider();
    initAccordionFAQ();
    initAOSAndGSAP();
    initProcessTimeline();
});

// 1. Sticky Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// 2. Mobile Hamburger Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
        hamburger.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
        
        // Toggle active classes
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Icon swap
        const icon = hamburger.querySelector('i');
        if (icon) {
            if (navMenu.classList.contains('active')) {
                icon.className = 'fas fa-xmark';
            } else {
                icon.className = 'fas fa-bars';
            }
        }
    });

    // Close menu when clicking navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                hamburger.setAttribute('aria-expanded', 'false');
                hamburger.setAttribute('aria-label', 'Open menu');
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                const icon = hamburger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });
    });
}

// 3. Stats Counter Animation on Scroll
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const countUpObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-count'), 10);
                const suffix = target.getAttribute('data-suffix') || '';
                let current = 0;
                const duration = 2000; // 2 seconds total count animation
                const increment = Math.ceil(countTo / (duration / 30));
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= countTo) {
                        target.textContent = countTo + suffix;
                        clearInterval(timer);
                    } else {
                        target.textContent = current + suffix;
                    }
                }, 30);

                observer.unobserve(target);
            }
        });
    }, observerOptions);

    stats.forEach(stat => countUpObserver.observe(stat));
}

// 4. Testimonial Slider Carousel
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (slides.length === 0) return;

    let currentIndex = 0;
    let sliderTimer;

    // Dynamically create dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (idx === 0) dot.classList.add('active');
            dot.setAttribute('data-index', idx);
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Go to testimonial slide ${idx + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetTimer();
            });
            dotsContainer.appendChild(dot);
        });
    }

    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.remove('active');
            if (dots[idx]) dots[idx].classList.remove('active');
        });

        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');

        const wrapper = document.querySelector('.slider-wrapper');
        if (wrapper) {
            wrapper.style.transform = `translateX(-${index * 100}%)`;
        }
        currentIndex = index;
    }

    function nextSlide() {
        let next = currentIndex + 1;
        if (next >= slides.length) next = 0;
        goToSlide(next);
    }

    function resetTimer() {
        clearInterval(sliderTimer);
        sliderTimer = setInterval(nextSlide, 5000);
    }

    // Initialize Auto Rotate
    sliderTimer = setInterval(nextSlide, 5000);
}

// 5. Accordion FAQs
function initAccordionFAQ() {
    const headers = document.querySelectorAll('.accordion-header');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const expanded = header.getAttribute('aria-expanded') === 'true';
            
            // Close other items
            const activeItems = document.querySelectorAll('.accordion-item.active');
            activeItems.forEach(activeItem => {
                if (activeItem !== item) {
                    activeItem.classList.remove('active');
                    const activeHeader = activeItem.querySelector('.accordion-header');
                    const activeContent = activeItem.querySelector('.accordion-content');
                    if (activeHeader) activeHeader.setAttribute('aria-expanded', 'false');
                    if (activeContent) activeContent.style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            header.setAttribute('aria-expanded', !expanded);

            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = null;
            }
        });

        // Add keyboard support for Space/Enter
        header.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                header.click();
            }
        });
    });
}

// 6. Interactive Process Timeline Connector Animation
function initProcessTimeline() {
    const timeline = document.querySelector('.timeline');
    const steps = document.querySelectorAll('.timeline-step');
    const progressBar = document.querySelector('.timeline-progress');

    if (!timeline || steps.length === 0 || !progressBar) return;

    function handleTimelineScroll() {
        const triggerPoint = window.innerHeight * 0.7;
        const timelineRect = timeline.getBoundingClientRect();
        
        // Check how far we've scrolled down the timeline
        let progressHeight = 0;
        let lastActiveIdx = -1;

        steps.forEach((step, idx) => {
            const stepRect = step.getBoundingClientRect();
            if (stepRect.top < triggerPoint) {
                step.classList.add('active');
                lastActiveIdx = idx;
            } else {
                step.classList.remove('active');
            }
        });

        if (lastActiveIdx !== -1) {
            // Find coordinates of the last active step's node to scale the fill height
            const nodes = document.querySelectorAll('.timeline-node');
            if (nodes[lastActiveIdx]) {
                const nodeRect = nodes[lastActiveIdx].getBoundingClientRect();
                progressHeight = nodeRect.top - timelineRect.top + (nodeRect.height / 2);
            }
        }
        
        progressBar.style.height = `${Math.max(0, progressHeight)}px`;
    }

    window.addEventListener('scroll', handleTimelineScroll);
    handleTimelineScroll(); // Initial check
}

// 7. Initialize libraries: AOS & GSAP Hero text reveal
function initAOSAndGSAP() {
    // 1. Initialize Animate on Scroll
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100,
            delay: 100
        });
    }

    // 2. Initialize GSAP for hero entrances
    if (typeof gsap !== 'undefined') {
        gsap.from('.hero-badge', {
            opacity: 0,
            y: -20,
            duration: 0.6,
            delay: 0.2,
            ease: 'power3.out'
        });

        gsap.from('.hero-title', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.out'
        });

        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.6,
            ease: 'power3.out'
        });

        gsap.from('.hero-btns', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.hero-trust .trust-item', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            stagger: 0.15,
            delay: 1.0,
            ease: 'power3.out'
        });
    }
}
