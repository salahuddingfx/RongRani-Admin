import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRevealManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Respect user's reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) return;

        const selector = '.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-down, .reveal-scale';

        const observerCallback = (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        });

        // Function to observe elements
        const observeElements = () => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
                if (!el.classList.contains('active')) { // only search for un-activated ones
                    observer.observe(el);
                }
            });
        };

        // Initial check
        observeElements();

        // Retry mechanism for lazy-loaded content (Suspense)
        // Check repeatedly for a few seconds to catch elements appearing after loading
        const intervals = [100, 300, 500, 1000, 2000, 3000];
        const timers = intervals.map(delay => setTimeout(observeElements, delay));

        return () => {
            observer.disconnect();
            timers.forEach(t => clearTimeout(t));
        };
    }, [location.pathname]);

    return null;
};

export default ScrollRevealManager;
