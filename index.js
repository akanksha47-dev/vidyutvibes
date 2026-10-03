document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    const body = document.body;
    
    const desktopSearchInput = document.getElementById('desktop-search');
    const desktopSearchButton = document.getElementById('desktop-search-button');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const mobileSearchBar = document.getElementById('mobile-search-bar');
    const mobileSearchForm = document.getElementById('mobile-search-form');
    const mobileSearchInput = document.getElementById('mobile-search');
    const mobileSearchButton = document.getElementById('mobile-search-button');

    let lastSearchIconClickTime = 0;

    if (desktopSearchInput && desktopSearchButton) {
        function updateDesktopButtonState() {
            desktopSearchButton.disabled = (desktopSearchInput.value.trim() === '');
        }
        desktopSearchInput.addEventListener('input', updateDesktopButtonState);
        updateDesktopButtonState();
    }

    if (mobileSearchBtn && mobileSearchBar && mobileSearchForm && mobileSearchInput && mobileSearchButton) {
        
        mobileSearchBtn.addEventListener('click', function() {
            const isHidden = !mobileSearchBar.classList.contains('show');
            mobileSearchBar.classList.toggle('show');
            
            if (isHidden) {
                lastSearchIconClickTime = Date.now();
                setTimeout(() => {
                    if (mobileSearchInput) mobileSearchInput.focus();
                }, 300);
            }
        });

        function updateMobileButtonState() {
            mobileSearchButton.disabled = (mobileSearchInput.value.trim() === '');
        }
        mobileSearchInput.addEventListener('input', updateMobileButtonState);
        updateMobileButtonState();

        mobileSearchForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const query = mobileSearchInput.value.trim();
            if (query) {
                window.location.href = `search.php?q=${encodeURIComponent(query)}&source=mobile_search`;
            }
        });
    }

    function hideMobileSearchBar() {
        if (Date.now() - lastSearchIconClickTime < 200) {
            return;
        }
        if (mobileSearchBar && mobileSearchBar.classList.contains('show')) {
            mobileSearchBar.classList.remove('show');
        }
    }
    document.addEventListener('click', function(event) {
        if (mobileSearchBar && mobileSearchBtn) {
            if (!mobileSearchBar.contains(event.target) && !mobileSearchBtn.contains(event.target)) {
                hideMobileSearchBar();
            }
        }
    });
    window.addEventListener('scroll', hideMobileSearchBar);
    
    function openMobileMenu() {
        if (mobileMenu && mobileMenuOverlay && menuBtn) {
            mobileMenu.classList.add("show");
            mobileMenuOverlay.classList.add("show");
            body.classList.add("menu-open");
            menuBtn.setAttribute("aria-expanded", "true");
        }
    }
    
    function closeMobileMenu() {
        if (mobileMenu && mobileMenuOverlay && menuBtn) {
            mobileMenu.classList.remove("show");
            mobileMenuOverlay.classList.remove("show");
            body.classList.remove("menu-open");
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.blur(); 
        }
    }

    if (menuBtn) {
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (mobileMenu.classList.contains("show")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener("click", closeMobileMenu);
    
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", (e) => closeMobileMenu());
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (mobileMenu && mobileMenu.classList.contains("show")) closeMobileMenu();
        }
    });

    if (mobileMenu) {
        let menuTouchStartX = 0;
        let menuTouchCurrentX = 0;
        const swipeThreshold = 50;
        mobileMenu.addEventListener('touchstart', (e) => {
            menuTouchStartX = e.touches[0].clientX;
            menuTouchCurrentX = menuTouchStartX;
            mobileMenu.style.transition = 'none'; 
        }, { passive: true });
        mobileMenu.addEventListener('touchmove', (e) => {
            menuTouchCurrentX = e.touches[0].clientX;
            const diffX = menuTouchCurrentX - menuTouchStartX;
            if (diffX < 0) {
                mobileMenu.style.transform = `translateX(${diffX}px)`;
            }
        }, { passive: true });
        mobileMenu.addEventListener('touchend', (e) => {
            mobileMenu.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            mobileMenu.style.transform = '';
            if (menuTouchStartX - menuTouchCurrentX > swipeThreshold) {
                closeMobileMenu();
            }
        }, { passive: true });
    }

    const form = document.getElementById("contactForm");
    const formSubmissionMessage = document.getElementById("form-submission-message");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            let isValid = true;
            document.querySelectorAll(".text-red-500").forEach((el) => el.classList.add("hidden"));
            if (formSubmissionMessage) formSubmissionMessage.classList.add("hidden");

            const nameField = document.getElementById("name");
            const phoneField = document.getElementById("phone");
            const addressField = document.getElementById("address");
            const nameError = document.getElementById("nameError");
            const phoneError = document.getElementById("phoneError");
            const addressError = document.getElementById("addressError");
            const serviceError = document.getElementById("serviceError");

            if (!nameField || !nameField.value.trim() || nameField.value.length < 2) { isValid = false; if (nameError) nameError.classList.remove("hidden"); }
            if (!phoneField || !phoneField.value.trim().match(/^[6-9][0-9]{9}$/)) { isValid = false; if (phoneError) phoneError.classList.remove("hidden"); }
            if (!addressField || !addressField.value.trim() || addressField.value.length < 10) { isValid = false; if (addressError) addressError.classList.remove("hidden"); }
            if (document.querySelectorAll('input[name="service[]"]:checked').length === 0) { isValid = false; if (serviceError) serviceError.classList.remove("hidden"); }

            if (!isValid) {
                if (formSubmissionMessage) {
                    formSubmissionMessage.className = "p-4 rounded-md text-center bg-red-100 text-red-700";
                    formSubmissionMessage.textContent = "Please fill in all required fields correctly.";
                    formSubmissionMessage.classList.remove("hidden");
                }
                return;
            }

            const formData = new FormData(form);
            try {
                const response = await fetch("quote_process.php", { method: "POST", body: formData, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                if (!response.ok) throw new Error('Network response was not ok');
                const result = await response.json();

                if (result.status === "success") {
                    const popup = document.getElementById('global-popup');
                    const popupMessage = document.getElementById('global-popup-message');

                    if (popup && popupMessage && result.name) {
                        popupMessage.textContent = `${result.name}, Thank You. Our team Will Contact You Soon.`;
                        
                        popup.classList.remove('top-[-100px]');
                        popup.classList.add('top-[90px]');
                        
                        setTimeout(() => {
                            popup.classList.remove('top-[90px]');
                            popup.classList.add('top-[-100px]');
                        }, 5000);
                    }
                    form.reset();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    if (formSubmissionMessage) {
                        formSubmissionMessage.className = "p-4 rounded-md text-center bg-red-100 text-red-700";
                        formSubmissionMessage.textContent = result.message || "Please try again.";
                        formSubmissionMessage.classList.remove("hidden");
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                if (formSubmissionMessage) {
                    formSubmissionMessage.className = "p-4 rounded-md text-center bg-red-100 text-red-700";
                    formSubmissionMessage.textContent = "Connection error. Please check your internet and try again.";
                    formSubmissionMessage.classList.remove("hidden");
                }
            }
        });
    }

    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) e.preventDefault();
    }, { passive: false });
    
    const contactPanel = document.getElementById('contact-left-panel');
    const textContainer = document.getElementById('contact-text-anim-container');

    if (contactPanel && textContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    textContainer.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(contactPanel);
    }

    window.addEventListener('error', (e) => { console.error('Global error caught:', e.error); return true; });
    window.addEventListener('unhandledrejection', (e) => { console.error('Unhandled promise rejection:', e.reason); e.preventDefault(); });

    console.log("%cVidyut Vibes", "color: #f59e0b; font-size: 22px; font-weight: bold; text-shadow: 1px 1px 2px #000;");
    console.log("%cWelcome! For developers: Please note that while the front-end is robust, the primary security logic is enforced on the server-side.", "color: #10b981; font-size: 12px;");
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function() {
            this.blur();
        });
    });
});