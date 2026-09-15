/**
 * one4k Official IPTV - Frontend Interactions & Dynamic Behaviors
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initAccordions();
    initTabs();
    initStickyHeader();
    initContactForms();
    initSmoothScroll();
    initLazyLoadFallback();
  });

  /**
   * Mobile Sidebar / Off-canvas Menu
   */
  function initMobileMenu() {
    const mobileMenu = document.getElementById('main-menu');
    const toggles = document.querySelectorAll('.mobile-nav-toggle, a[data-open="#main-menu"], .menu-icon, .nav-icon');
    
    // Create overlay backdrop if missing
    let overlay = document.querySelector('.mfp-bg');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'mfp-bg mfp-ready';
      overlay.style.display = 'none';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
      overlay.style.zIndex = '99998';
      overlay.style.transition = 'opacity 0.3s ease';
      document.body.appendChild(overlay);
    }

    function openMenu(e) {
      if (e) e.preventDefault();
      if (!mobileMenu) return;
      
      mobileMenu.classList.remove('mfp-hide');
      mobileMenu.classList.add('is-open');
      mobileMenu.style.display = 'block';
      mobileMenu.style.position = 'fixed';
      mobileMenu.style.top = '0';
      mobileMenu.style.left = '0';
      mobileMenu.style.bottom = '0';
      mobileMenu.style.width = '300px';
      mobileMenu.style.maxWidth = '85%';
      mobileMenu.style.zIndex = '99999';
      mobileMenu.style.backgroundColor = '#0b0f19';
      mobileMenu.style.boxShadow = '5px 0 25px rgba(0,0,0,0.5)';
      mobileMenu.style.transition = 'transform 0.3s ease';
      mobileMenu.style.overflowY = 'auto';
      
      overlay.style.display = 'block';
      overlay.style.opacity = '1';
      document.body.classList.add('off-canvas-active');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu(e) {
      if (e) e.preventDefault();
      if (!mobileMenu) return;
      
      mobileMenu.classList.add('mfp-hide');
      mobileMenu.classList.remove('is-open');
      mobileMenu.style.display = 'none';
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      document.body.classList.remove('off-canvas-active');
      document.body.style.overflow = '';
    }

    toggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('is-open')) {
          closeMenu(e);
        } else {
          openMenu(e);
        }
      });
    });

    overlay.addEventListener('click', closeMenu);

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMenu(e);
      }
    });

    // Close button inside sidebar if present
    const closeButtons = mobileMenu ? mobileMenu.querySelectorAll('.sidebar-close, .close-menu') : [];
    closeButtons.forEach(function(btn) {
      btn.addEventListener('click', closeMenu);
    });
  }

  /**
   * Accordions (Elementor FAQ toggles)
   */
  function initAccordions() {
    const accordionHeaders = document.querySelectorAll('.elementor-accordion .elementor-tab-title, .accordion-title');
    
    accordionHeaders.forEach(function(header) {
      header.addEventListener('click', function(e) {
        e.preventDefault();
        const parentItem = header.closest('.elementor-accordion-item') || header.parentElement;
        const content = parentItem.querySelector('.elementor-tab-content, .accordion-inner');
        const isActive = header.classList.contains('elementor-active') || header.getAttribute('aria-expanded') === 'true';

        // Toggle current
        if (isActive) {
          header.classList.remove('elementor-active');
          header.setAttribute('aria-expanded', 'false');
          if (content) {
            content.style.display = 'none';
            content.classList.remove('elementor-active');
          }
        } else {
          header.classList.add('elementor-active');
          header.setAttribute('aria-expanded', 'true');
          if (content) {
            content.style.display = 'block';
            content.classList.add('elementor-active');
          }
        }
      });
    });
  }

  /**
   * Elementor Tabs
   */
  function initTabs() {
    const tabTitles = document.querySelectorAll('.elementor-tabs .elementor-tab-title');
    tabTitles.forEach(function(tab) {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        const tabsWrapper = tab.closest('.elementor-tabs');
        if (!tabsWrapper) return;
        
        const tabNumber = tab.getAttribute('data-tab');
        const allTitles = tabsWrapper.querySelectorAll('.elementor-tab-title');
        const allContents = tabsWrapper.querySelectorAll('.elementor-tab-content');

        allTitles.forEach(t => {
          t.classList.remove('elementor-active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        allContents.forEach(c => {
          c.classList.remove('elementor-active');
          c.style.display = 'none';
        });

        tab.classList.add('elementor-active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        const activeContent = tabsWrapper.querySelector('.elementor-tab-content[data-tab="' + tabNumber + '"]');
        if (activeContent) {
          activeContent.classList.add('elementor-active');
          activeContent.style.display = 'block';
        }
      });
    });
  }

  /**
   * Sticky Header on Scroll
   */
  function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > 100) {
        header.classList.add('has-sticky-header');
        header.classList.add('is-sticky');
      } else {
        header.classList.remove('has-sticky-header');
        header.classList.remove('is-sticky');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  /**
   * Contact Form AJAX Handling with Node.js backend
   */
  function initContactForms() {
    const forms = document.querySelectorAll('.wpcf7-form, form[action*="contact"], form.contact-form');
    
    forms.forEach(function(form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.value || submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          if (submitBtn.tagName === 'INPUT') submitBtn.value = 'Sending...';
          else submitBtn.textContent = 'Sending...';
        }

        let responseOutput = form.querySelector('.wpcf7-response-output');
        if (!responseOutput) {
          responseOutput = document.createElement('div');
          responseOutput.className = 'wpcf7-response-output';
          responseOutput.style.padding = '12px 16px';
          responseOutput.style.marginTop = '15px';
          responseOutput.style.borderRadius = '6px';
          responseOutput.style.fontSize = '14px';
          responseOutput.style.fontWeight = '500';
          form.appendChild(responseOutput);
        }

        const formData = new FormData(form);
        const data = {};
        formData.forEach((val, key) => { data[key] = val; });

        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await res.json();

          if (res.ok && result.success) {
            responseOutput.style.display = 'block';
            responseOutput.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
            responseOutput.style.border = '1px solid #28a745';
            responseOutput.style.color = '#28a745';
            responseOutput.textContent = result.message || 'Thank you! Your message has been sent successfully.';
            form.reset();
          } else {
            responseOutput.style.display = 'block';
            responseOutput.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
            responseOutput.style.border = '1px solid #dc3545';
            responseOutput.style.color = '#dc3545';
            responseOutput.textContent = result.message || 'There was an error sending your message. Please try again or message us on WhatsApp.';
          }
        } catch (err) {
          responseOutput.style.display = 'block';
          responseOutput.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
          responseOutput.style.border = '1px solid #dc3545';
          responseOutput.style.color = '#dc3545';
          responseOutput.textContent = 'Network error. Please reach out to our WhatsApp support at +44 7311 129243.';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitBtn.tagName === 'INPUT') submitBtn.value = originalBtnText;
            else submitBtn.textContent = originalBtnText;
          }
        }
      });
    });
  }

  /**
   * Smooth Scroll for Internal Anchors
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href="#main-menu"])').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /**
   * Lazy Load Images Observer Fallback
   */
  function initLazyLoadFallback() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src], .e-lazyloaded');
      const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      });
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

})();
