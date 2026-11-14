// Main JavaScript for Vertex Construction Group Portfolio Template (Vanilla JS)

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initMobileMenu();
  initTestimonialsCarousel();
  initServicesTabs();
  initProjectsFilter();
  initProjectGallery();
  initContactForm();
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ---------------- 1. THEME MANAGER ---------------- */
function initTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'dark'); // default dark as original

  applyTheme(initialTheme);

  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark';
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  updateLogoAndHeader();
}

/* ---------------- 2. HEADER SCROLL & LOGO ---------------- */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    const isScrolled = window.scrollY > 20;
    if (isScrolled) {
      header.classList.add('bg-background/20', 'backdrop-blur-md', 'shadow-sm');
      header.classList.remove('bg-transparent');
    } else {
      header.classList.remove('bg-background/20', 'backdrop-blur-md', 'shadow-sm');
      header.classList.add('bg-transparent');
    }
    updateLogoAndHeader(isScrolled);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

function updateLogoAndHeader(isScrolled = window.scrollY > 20) {
  const isDark = document.documentElement.classList.contains('dark');
  const logos = document.querySelectorAll('.site-logo');
  const navLinks = document.querySelectorAll('.nav-link');
  const siteBrand = document.querySelector('.site-brand-text');

  // Invert logo logic matching original React Header:
  // className={`w-16 sm:w-28 transition-all duration-300 ${theme =="dark" ?'invert':"invert-0"} ${!scrolled && theme === "light" && "invert"}`}
  logos.forEach(logo => {
    if (isDark || (!isScrolled && !isDark)) {
      logo.classList.add('invert');
      logo.classList.remove('invert-0');
    } else {
      logo.classList.remove('invert');
      logo.classList.add('invert-0');
    }
  });

  if (siteBrand) {
    if (!isScrolled) {
      siteBrand.classList.add('text-white');
    } else {
      siteBrand.classList.remove('text-white');
    }
  }

  const useLightText = !isScrolled || isDark;
  navLinks.forEach(link => {
    const isActive = link.getAttribute('data-active') === 'true';
    if (isActive) {
      if (useLightText) {
        link.className = 'nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors relative group text-white';
      } else {
        link.className = 'nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors relative group text-primary';
      }
    } else {
      if (useLightText) {
        link.className = 'nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors relative group text-white/90 hover:text-white';
      } else {
        link.className = 'nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors relative group text-foreground hover:text-primary';
      }
    }
  });
}

/* ---------------- 3. MOBILE MENU ---------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggleBtn || !menu) return;

  const iconMenu = toggleBtn.querySelector('.menu-icon');
  const iconClose = toggleBtn.querySelector('.close-icon');

  toggleBtn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      menu.classList.add('hidden');
      if (iconMenu) iconMenu.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    } else {
      menu.classList.remove('hidden');
      if (iconMenu) iconMenu.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    }
    if (window.lucide) window.lucide.createIcons();
  });
}

/* ---------------- 4. TESTIMONIALS CAROUSEL ---------------- */
function initTestimonialsCarousel() {
  const container = document.getElementById('testimonials-carousel');
  if (!container) return;

  const slides = container.querySelectorAll('.testimonial-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (slides.length === 0) return;

  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      if (i === current) {
        slide.classList.remove('hidden');
        slide.classList.add('block');
      } else {
        slide.classList.add('hidden');
        slide.classList.remove('block');
      }
    });

    dots.forEach((dot, i) => {
      if (i === current) {
        dot.classList.add('bg-primary');
        dot.classList.remove('bg-muted-foreground/30');
      } else {
        dot.classList.remove('bg-primary');
        dot.classList.add('bg-muted-foreground/30');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => showSlide(current - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => showSlide(current + 1));
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showSlide(idx));
  });

  showSlide(0);
}

/* ---------------- 5. SERVICES TABS ---------------- */
function initServicesTabs() {
  const triggers = document.querySelectorAll('.service-tab-trigger');
  const contents = document.querySelectorAll('.service-tab-content');
  if (triggers.length === 0) return;

  function activateTab(tabId) {
    triggers.forEach(t => {
      const id = t.getAttribute('data-tab');
      if (id === tabId) {
        t.setAttribute('data-state', 'active');
        t.classList.add('bg-primary', 'text-primary-foreground');
        t.classList.remove('text-muted-foreground');
      } else {
        t.setAttribute('data-state', 'inactive');
        t.classList.remove('bg-primary', 'text-primary-foreground');
        t.classList.add('text-muted-foreground');
      }
    });

    contents.forEach(c => {
      const id = c.getAttribute('data-tab-content');
      if (id === tabId) {
        c.classList.remove('hidden');
      } else {
        c.classList.add('hidden');
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  triggers.forEach(t => {
    t.addEventListener('click', () => {
      const tabId = t.getAttribute('data-tab');
      activateTab(tabId);
    });
  });

  // Check URL hash
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const matching = document.querySelector(`.service-tab-trigger[data-tab="${hash}"]`);
    if (matching) {
      activateTab(hash);
      return;
    }
  }

  // Default to design or first tab
  activateTab('design');
}

/* ---------------- 6. PROJECTS FILTER ---------------- */
function initProjectsFilter() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category').toLowerCase();

      filterBtns.forEach(b => {
        if (b === btn) {
          b.classList.add('bg-primary', 'text-primary-foreground');
          b.classList.remove('border', 'border-input', 'bg-background', 'hover:bg-accent');
        } else {
          b.classList.remove('bg-primary', 'text-primary-foreground');
          b.classList.add('border', 'border-input', 'bg-background', 'hover:bg-accent');
        }
      });

      projectCards.forEach(card => {
        const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ---------------- 7. PROJECT GALLERY & LIGHTBOX ---------------- */
function initProjectGallery() {
  const gallery = document.getElementById('project-gallery');
  if (!gallery) return;

  const mainImage = document.getElementById('gallery-main-image');
  const thumbnails = gallery.querySelectorAll('.gallery-thumb');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const maximizeBtn = document.getElementById('gallery-maximize');

  const lightbox = document.getElementById('project-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxClose = document.getElementById('lightbox-close');

  const images = [];
  thumbnails.forEach(t => {
    images.push(t.getAttribute('data-src'));
  });

  if (images.length === 0) return;
  let currentIndex = 0;

  function updateMain(idx) {
    currentIndex = (idx + images.length) % images.length;
    if (mainImage) mainImage.src = images[currentIndex];
    if (lightboxImg) lightboxImg.src = images[currentIndex];

    thumbnails.forEach((t, i) => {
      if (i === currentIndex) {
        t.classList.add('ring-2', 'ring-primary', 'opacity-100');
        t.classList.remove('opacity-70');
      } else {
        t.classList.remove('ring-2', 'ring-primary', 'opacity-100');
        t.classList.add('opacity-70');
      }
    });
  }

  thumbnails.forEach((t, i) => {
    t.addEventListener('click', () => updateMain(i));
  });

  if (prevBtn) prevBtn.addEventListener('click', () => updateMain(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => updateMain(currentIndex + 1));

  function openLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    updateMain(currentIndex);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.style.overflow = '';
  }

  if (maximizeBtn) maximizeBtn.addEventListener('click', openLightbox);
  if (mainImage) mainImage.addEventListener('click', openLightbox);

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); updateMain(currentIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); updateMain(currentIndex + 1); });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (lightbox && !lightbox.classList.contains('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') updateMain(currentIndex - 1);
      if (e.key === 'ArrowRight') updateMain(currentIndex + 1);
    }
  });

  updateMain(0);
}

/* ---------------- 8. CONTACT FORM (WHATSAPP INTEGRATION) ---------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successBox = document.getElementById('contact-success');
  if (!form) return;

  const WHATSAPP_NUMBER = '15552345678';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = fd.get('name') || '';
    const email = fd.get('email') || '';
    const subject = fd.get('subject') || '';
    const message = fd.get('message') || '';

    const text = encodeURIComponent(
      `Hello! I have a new inquiry:\n\n` +
      `*Name:* ${name}\n` +
      `*Email:* ${email}\n` +
      `*Subject:* ${subject}\n` +
      `*Message:*\n${message}`
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(whatsappUrl, '_blank');

    form.reset();
    if (successBox) {
      successBox.classList.remove('hidden');
      form.classList.add('hidden');
    }
  });
}
