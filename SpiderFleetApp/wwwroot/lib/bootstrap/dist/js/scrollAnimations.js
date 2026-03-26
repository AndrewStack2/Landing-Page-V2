// ── Scroll Animations (IntersectionObserver + MutationObserver) ──────────────
window.initScrollAnimations = () => {
    if (!window.scrollObserver) {
        window.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, 50);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    }

    // Track which elements we've already set up mutation observers for
    if (!window._scrollAnimMutated) {
        window._scrollAnimMutated = new WeakSet();
    }

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => {
        // Check if this element is inside a hidden container
        const isHidden = el.offsetParent === null;

        if (isHidden) {
            // Strip is-visible so it re-animates when container becomes visible
            el.classList.remove('is-visible');
        } else if (!el.classList.contains('is-visible')) {
            // Visible but not yet animated — observe it
            window.scrollObserver.observe(el);
        }

        // Set up a MutationObserver on each element only once
        if (!window._scrollAnimMutated.has(el)) {
            window._scrollAnimMutated.add(el);
            window.scrollObserver.observe(el);

            const mo = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const target = mutation.target;
                        if (target.classList.contains('scroll-animate') && !target.classList.contains('is-visible')) {
                            const rect = target.getBoundingClientRect();
                            if (rect.top < window.innerHeight && rect.bottom > 0) {
                                setTimeout(() => {
                                    target.classList.add('is-visible');
                                }, 50);
                            }
                        }
                    }
                });
            });
            mo.observe(el, { attributes: true, attributeFilter: ['class'] });
        }
    });
};

// Re-init on Blazor navigation
window.addEventListener('blazor:navigated', () => {
    setTimeout(() => window.initScrollAnimations(), 80);
});

// ── Navbar Scroll Listener (requerido por NavbarMenu.razor) ──────────────────
window.SpiderFleet = window.SpiderFleet || {};

window.SpiderFleet.registerScrollListener = (dotNetRef) => {
    const handler = () => {
        dotNetRef.invokeMethodAsync('OnScrollChanged', window.scrollY);
    };
    window.addEventListener('scroll', handler, { passive: true });
};