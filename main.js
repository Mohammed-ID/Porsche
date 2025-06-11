/**
 * Porsche Insurance Website - Optimized JavaScript
 * Improves performance by reducing DOM operations and optimizing animations
 */

// Immediately invoked function expression to avoid global scope pollution
(function () {
  // Store DOM references to minimize DOM lookups
  let nav, navGradient, menuBtn, navMenu;

  /**
   * Update header state
   * Simplified to use fewer style operations
   */
  const updateHeader = () => {
    if (!nav || !navGradient) return;

    // Apply all styles at once without conditional logic for better performance
    navGradient.style.opacity = "1";
    nav.style.backgroundColor = "transparent";
    nav.style.boxShadow = "none";
  };

  /**
   * Handle mobile menu toggle with event delegation
   */
  const setupMobileMenu = () => {
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("hidden");
    });

    // Use event delegation instead of multiple event listeners
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navMenu.classList.add("hidden");
      }
    });
  };

  /**
   * Smooth scrolling with performance optimizations
   * Reduces the number of scroll calculations
   */
  const setupSmoothScrolling = () => {
    // Use event delegation for better performance
    document.addEventListener("click", (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      // Cache header height to avoid reflow
      const navHeight = nav.offsetHeight;

      // Calculate scroll position once
      const offsetTop =
        targetElement.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight;

      // Perform the scroll
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    });
  };

  /**
   * Section animations using Intersection Observer
   * More efficient than scroll event listeners
   */
  const initSectionAnimations = () => {
    const animateSections = document.querySelectorAll(".animate-section");
    if (!animateSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Stop observing after animation is triggered to save resources
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    // Observe all sections
    animateSections.forEach((section) => {
      observer.observe(section);
    });
  };

  /**
   * Optimized fade animations with requestAnimationFrame
   */
  const initFadeAnimations = () => {
    const fadeElements = document.querySelectorAll(".animate-fade");
    if (!fadeElements.length) return;

    fadeElements.forEach((el) => {
      if (el.style.opacity !== "1") {
        // Set initial state once
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";

        // Use data attribute instead of style for animation delay
        const delay = parseFloat(el.dataset.delay || 0) * 1000;

        setTimeout(() => {
          // Use requestAnimationFrame for smoother animation
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            
            // Add the animated class after animation completes to release GPU resources
            el.addEventListener('transitionend', () => {
              el.classList.add('animated');
            }, { once: true });
          });
        }, delay);
      }
    });
  };

  /**
   * Add hover animation to navigation links
   */
  const setupNavHoverEffects = () => {
    const navLinks = document.querySelectorAll(".nav-link");
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        link.classList.add("hover-active");
      });

      link.addEventListener("mouseleave", () => {
        link.classList.remove("hover-active");
      });
    });
  };

  /**
   * Hero section video optimization
   */
  const optimizeHeroVideo = () => {
    const heroVideo = document.querySelector("#hero video");
    if (!heroVideo) return;

    // Add loaded class once video is ready
    heroVideo.addEventListener("loadeddata", () => {
      const hero = document.getElementById("hero");
      if (hero) {
        hero.classList.add("video-loaded");
      }
    });

    // Pause video when not in viewport to save resources
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroVideo.play();
          } else {
            heroVideo.pause();
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    heroObserver.observe(heroVideo);
  };

  /**
   * Language translations
   */
  const translations = {
    en: {
      // Navigation
      "insurance-coverage": "Insurance Coverage",
      "why-porsche-insurance": "Why Porsche Insurance",
      "insurance-partners": "Insurance Partners",
      "get-porsche-covered": "Get Your Porsche Covered",
      
      // Hero Section
      "hero-title": "Premium protection for your Porsche",
      "hero-description": "Specialized car insurance tailored for the precision, performance, and value of your Porsche.",
      "scroll": "Scroll",
      
      // Insurance Coverage Section
      "insurance-coverage-title": "Insurance Coverage",
      "insurance-coverage-desc": "Comprehensive car insurance features designed specifically for Porsche vehicles.",
      "performance-coverage": "Performance Coverage",
      "concierge-services": "Concierge Insurance Services",
      "premium-protection": "Premium Vehicle Protection",
      "comprehensive-coverage": "Comprehensive Coverage",
      
      // Performance Coverage
      "track-day-insurance": "Recreational track day insurance",
      "performance-parts": "Performance parts coverage",
      "aftermarket-insurance": "Aftermarket modifications insurance",
      "safe-driver": "Safe driver discounts",
      
      // Concierge Services
      "claims-specialist": "Dedicated claims specialist",
      "expedited-claims": "Expedited claims processing",
      "owner-events": "Porsche owner events access",
      "policy-concierge": "Insurance policy concierge",
      
      // Premium Protection
      "agreed-value": "Agreed value insurance",
      "oem-parts": "OEM parts guarantee",
      "diminished-value": "Diminished value coverage",
      "collectors-insurance": "Collectors vehicle insurance",
      
      // Comprehensive Coverage
      "international-coverage": "International driving coverage",
      "roadside-assistance": "Premium roadside assistance",
      "digital-claims": "Digital claims filing",
      "luxury-transport": "Luxury vehicle transport",
      
      // Feature Banner
      "exceptional-insurance": "Car insurance as exceptional as your Porsche",
      "exceptional-desc": "Our specialized auto insurance is designed with the same attention to detail and performance standards that define your Porsche, providing coverage that understands the unique value of your vehicle.",
      "insurance-matches": "Insurance That Matches Your Porsche",
      "insurance-matches-desc": "Protection that recognizes the precision engineering, performance capabilities, and distinctive value of your Porsche.",
      
      // Why Choose Us
      "why-choose-title": "Why Choose Porsche Insurance?",
      "why-choose-desc": "Specialized auto insurance developed exclusively for Porsche owners by those who understand your vehicle.",
      "model-specific": "Model-Specific Coverage",
      "model-specific-desc": "Insurance plans specifically tailored for each Porsche model, with coverage options designed around your vehicle's unique characteristics.",
      "certified-repairs": "Porsche-Certified Repairs",
      "certified-repairs-desc": "All insurance claims are processed with Porsche-certified technicians ensuring your vehicle receives proper care and original parts.",
      "expedited-claims-process": "Expedited Claims Process",
      "expedited-claims-desc": "Fast-track claims processing and premium service levels for Porsche owners, minimizing time without your vehicle.",
      
      // Why Choose Us List Items
      "customized-model": "Customized for your specific model",
      "adaptable-driving": "Adaptable to your driving habits",
      "factory-technicians": "Factory-trained technicians",
      "genuine-parts": "Genuine Porsche parts guarantee",
      "rapid-assessment": "Rapid claims assessment",
      "personal-advisor": "Personal Porsche claims advisor",
      
      // Quote CTA
      "premium-insurance": "Premium insurance for a premium vehicle",
      "premium-insurance-desc": "Get specialized insurance coverage tailored to your Porsche model and driving lifestyle.",
      
      // Partners
      "partners-title": "Insurance Partners",
      "partners-desc": "We collaborate with leading auto insurance providers to deliver specialized coverage and service for your Porsche.",
      "partners-quality": "All our insurance partners meet rigorous qualification standards to ensure they deliver the exceptional service Porsche owners expect. Our combined expertise provides comprehensive protection that respects the engineering excellence of your vehicle.",
      
      // Footer
      "porsche-insurance-desc": "Porsche Insurance delivers specialized auto coverage designed with the same precision and performance standards as the vehicles we protect.",
      "ready-protect": "Ready to protect your Porsche?",
      "get-coverage": "Get specialized insurance coverage tailored for your Porsche model.",
      "copyright": "© 2025 Porsche Insurance. All rights reserved. Porsche is a registered trademark."
    },
    ar: {
      // Navigation
      "insurance-coverage": "تغطية التأمين",
      "why-porsche-insurance": "لماذا تأمين بورش",
      "insurance-partners": "شركاء التأمين",
      "get-porsche-covered": "احصل على تغطية لسيارتك بورش",
      
      // Hero Section
      "hero-title": "حماية متميزة لسيارتك بورش",
      "hero-description": "تأمين سيارات متخصص مصمم خصيصًا لدقة وأداء وقيمة سيارتك بورش.",
      "scroll": "تصفح",
      
      // Insurance Coverage Section
      "insurance-coverage-title": "تغطية التأمين",
      "insurance-coverage-desc": "ميزات تأمين شاملة للسيارات مصممة خصيصًا لسيارات بورش.",
      "performance-coverage": "تغطية الأداء",
      "concierge-services": "خدمات التأمين المتميزة",
      "premium-protection": "حماية السيارة المتميزة",
      "comprehensive-coverage": "تغطية شاملة",
      
      // Performance Coverage
      "track-day-insurance": "تأمين أيام السباق الترفيهية",
      "performance-parts": "تغطية قطع الأداء",
      "aftermarket-insurance": "تأمين التعديلات الإضافية",
      "safe-driver": "خصومات للسائق الآمن",
      
      // Concierge Services
      "claims-specialist": "أخصائي مطالبات مخصص",
      "expedited-claims": "معالجة مطالبات سريعة",
      "owner-events": "الوصول إلى فعاليات مالكي بورش",
      "policy-concierge": "خدمة كونسيرج لبوليصة التأمين",
      
      // Premium Protection
      "agreed-value": "تأمين القيمة المتفق عليها",
      "oem-parts": "ضمان قطع غيار أصلية",
      "diminished-value": "تغطية انخفاض القيمة",
      "collectors-insurance": "تأمين سيارات المقتنيات",
      
      // Comprehensive Coverage
      "international-coverage": "تغطية القيادة الدولية",
      "roadside-assistance": "مساعدة متميزة على الطريق",
      "digital-claims": "تقديم المطالبات رقميًا",
      "luxury-transport": "نقل السيارات الفاخرة",
      
      // Feature Banner
      "exceptional-insurance": "تأمين سيارات استثنائي كسيارتك بورش",
      "exceptional-desc": "تم تصميم تأميننا المتخصص بنفس الاهتمام بالتفاصيل ومعايير الأداء التي تميز سيارتك بورش، مما يوفر تغطية تفهم القيمة الفريدة لسيارتك.",
      "insurance-matches": "تأمين يتناسب مع سيارتك بورش",
      "insurance-matches-desc": "حماية تعترف بالهندسة الدقيقة وقدرات الأداء والقيمة المميزة لسيارتك بورش.",
      
      // Why Choose Us
      "why-choose-title": "لماذا تختار تأمين بورش؟",
      "why-choose-desc": "تأمين سيارات متخصص تم تطويره حصريًا لمالكي سيارات بورش من قبل أولئك الذين يفهمون سيارتك.",
      "model-specific": "تغطية خاصة بالطراز",
      "model-specific-desc": "خطط تأمين مصممة خصيصًا لكل طراز بورش، مع خيارات تغطية مصممة حول الخصائص الفريدة لسيارتك.",
      "certified-repairs": "إصلاحات معتمدة من بورش",
      "certified-repairs-desc": "تتم معالجة جميع مطالبات التأمين بواسطة فنيين معتمدين من بورش لضمان حصول سيارتك على الرعاية المناسبة وقطع الغيار الأصلية.",
      "expedited-claims-process": "عملية مطالبات سريعة",
      "expedited-claims-desc": "معالجة سريعة للمطالبات ومستويات خدمة متميزة لمالكي سيارات بورش، مما يقلل وقت بقائك بدون سيارتك.",
      
      // Why Choose Us List Items
      "customized-model": "مصممة خصيصًا لطراز سيارتك",
      "adaptable-driving": "قابلة للتكيف مع عادات القيادة الخاصة بك",
      "factory-technicians": "فنيون مدربون في المصنع",
      "genuine-parts": "ضمان قطع غيار بورش الأصلية",
      "rapid-assessment": "تقييم سريع للمطالبات",
      "personal-advisor": "مستشار مطالبات بورش شخصي",
      
      // Quote CTA
      "premium-insurance": "تأمين متميز لسيارة متميزة",
      "premium-insurance-desc": "احصل على تغطية تأمين متخصصة مصممة لطراز بورش الخاص بك وأسلوب القيادة.",
      
      // Partners
      "partners-title": "شركاء التأمين",
      "partners-desc": "نتعاون مع مزودي تأمين السيارات الرائدين لتقديم تغطية وخدمة متخصصة لسيارتك بورش.",
      "partners-quality": "يلبي جميع شركاء التأمين لدينا معايير تأهيل صارمة لضمان تقديم الخدمة الاستثنائية التي يتوقعها مالكو سيارات بورش. توفر خبرتنا المشتركة حماية شاملة تحترم التميز الهندسي لسيارتك.",
      
      // Footer
      "porsche-insurance-desc": "يقدم تأمين بورش تغطية سيارات متخصصة مصممة بنفس دقة ومعايير الأداء التي تميز السيارات التي نحميها.",
      "ready-protect": "هل أنت مستعد لحماية سيارتك بورش؟",
      "get-coverage": "احصل على تغطية تأمين متخصصة مصممة لطراز بورش الخاص بك.",
      "copyright": "© 2025 تأمين بورش. جميع الحقوق محفوظة. بورش هي علامة تجارية مسجلة."
    }
  };

  /**
   * Setup language switching functionality
   */
  const setupLanguageSwitcher = () => {
    const langButtons = document.querySelectorAll('.lang-btn');
    const htmlRoot = document.getElementById('html-root');
    
    if (!langButtons.length || !htmlRoot) return;
    
    // Add data attributes to all elements that need to be translated
    const elementsToTranslate = document.querySelectorAll('[data-translate-key]');
    
    // Function to switch language
    const switchLanguage = (lang) => {
      // Update active button
      langButtons.forEach(btn => {
        if (btn.dataset.lang === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Set HTML attributes
      htmlRoot.lang = lang;
      htmlRoot.dir = lang === 'ar' ? 'rtl' : 'ltr';
      
      // Update all translated elements
      elementsToTranslate.forEach(el => {
        const key = el.dataset.translateKey;
        if (key && translations[lang] && translations[lang][key]) {
          el.textContent = translations[lang][key];
        }
      });
      
      // Handle RTL specific adjustments
      const svgArrows = document.querySelectorAll('.rtl-flip');
      if (lang === 'ar') {
        svgArrows.forEach(svg => {
          svg.style.transform = 'scaleX(-1)';
        });
        
        // Add additional RTL classes for responsiveness
        document.body.classList.add('rtl-active');
      } else {
        svgArrows.forEach(svg => {
          svg.style.transform = 'none';
        });
        
        // Remove RTL classes
        document.body.classList.remove('rtl-active');
      }
      
      // Force reflow for proper RTL layout
      document.body.offsetHeight;
      
      // Store preference in localStorage
      localStorage.setItem('porscheLanguage', lang);
    };
    
    // Add click event to language buttons
    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        switchLanguage(lang);
      });
    });
    
    // Set initial language from localStorage or default to English
    const savedLang = localStorage.getItem('porscheLanguage') || 'en';
    switchLanguage(savedLang);
  };

  /**
   * Initialize everything when DOM is loaded
   * Using a single event listener
   */
  document.addEventListener("DOMContentLoaded", () => {
    // Cache DOM elements
    nav = document.querySelector("nav");
    navGradient = nav ? nav.querySelector("div:first-child") : null;
    menuBtn = document.getElementById("menuBtn");
    navMenu = document.getElementById("navMenu");

    // Initialize critical components first for better perceived performance
    updateHeader();
    setupMobileMenu();
    optimizeHeroVideo();

    // Defer non-critical initializations
    requestIdleCallback(() => {
      setupSmoothScrolling();
      initSectionAnimations();
      setupNavHoverEffects();
      setupLanguageSwitcher();
      
      // Initialize animations last
      setTimeout(() => {
        initFadeAnimations();
      }, 100);
    }, { timeout: 500 });

    // Add passive event listener for better scroll performance
    window.addEventListener("scroll", updateHeader, { passive: true });

    // Listen for resize events with debounce
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateHeader();
        }, 100);
      },
      { passive: true }
    );
  });

  // Polyfill for requestIdleCallback
  window.requestIdleCallback = window.requestIdleCallback || 
    function(cb, options) {
      const start = Date.now();
      return setTimeout(function() {
        cb({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, options?.timeout || 1);
    };
    
  /**
   * Optimize image loading by progressively enhancing them
   */
  const optimizeImages = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Force immediate loading when in viewport
            img.loading = 'eager';
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '200px 0px', // Start loading before they appear
        threshold: 0.01
      });
      
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    // Handle image errors with fallbacks
    document.addEventListener('error', function(e) {
      if (e.target.tagName.toLowerCase() === 'img') {
        console.log('Image loading error, attempting fallback');
        // If the error is on an image with srcset, fallback to main src
        if (e.target.srcset) {
          e.target.srcset = '';
          // Only retry once
          e.target.onerror = null;
        }
      }
    }, true);
  };
  
  // Initialize image optimization
  document.addEventListener('DOMContentLoaded', optimizeImages);
})();
