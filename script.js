document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const backToTop = document.getElementById('backToTop');
  const year = document.getElementById('year');

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    mainNav.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLightbox();
    }
  });

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    backToTop.classList.toggle('visible', y > 450);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Highlight the navigation item for the section currently in view.
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Reveal-on-scroll animation with a graceful fallback.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('revealed'));
  }

  // Accessible FAQ accordion; keep one answer open at a time.
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const shouldOpen = !item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      if (shouldOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Gallery lightbox.
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      lightboxImage.src = item.dataset.full || image.src;
      lightboxImage.alt = image.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    });
  });

  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);

  // Validate quote requests, then open WhatsApp with the request prefilled.
  const quoteForm = document.getElementById('quoteForm');
  const formMessage = document.getElementById('formMessage');
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    formMessage.className = 'form-message';
    formMessage.textContent = '';

    const data = new FormData(quoteForm);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').replace(/[^\d+]/g, '');
    const pickup = String(data.get('pickup') || '').trim();
    const delivery = String(data.get('delivery') || '').trim();
    const service = String(data.get('service') || '').trim();
    const notes = String(data.get('notes') || '').trim();

    if (name.length < 2) return showError('من فضلك اكتب اسم صحيح.');
    if (!/^(\+?20)?0?1[0125]\d{8}$/.test(phone)) return showError('من فضلك اكتب رقم موبايل مصري صحيح مكوّن من 11 رقم.');
    if (!pickup || !delivery) return showError('من فضلك اكتب مكان الاستلام ومكان التسليم.');
    if (!service) return showError('من فضلك اختار نوع الخدمة.');

    const message = [
      'طلب عرض سعر جديد',
      `الاسم: ${name}`,
      `رقم الموبايل: ${phone}`,
      `مكان الاستلام: ${pickup}`,
      `مكان التسليم: ${delivery}`,
      `نوع الخدمة: ${service}`,
      ...(notes ? [`تفاصيل إضافية: ${notes}`] : [])
    ].join('\n');
    const whatsappUrl = `https://wa.me/201066315174?text=${encodeURIComponent(message)}`;

    formMessage.classList.add('success');
    formMessage.textContent = 'جارٍ فتح واتساب برسالتك؛ اضغط إرسال لتأكيد الطلب.';
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });

  function showError(message) {
    formMessage.classList.add('error');
    formMessage.textContent = message;
  }
});
