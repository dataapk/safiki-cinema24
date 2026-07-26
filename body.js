
/*==========================================
   LANDING PAGE — FULL JAVASCRIPT
   Hero Slider | Auto Slide | Interactions
========================================== */

(function() {
  'use strict';
  


  /* ==========================================
     HOME VIEW SWITCH
     Guest / Member Section
  ========================================== */

  function updateHomeView(){

      const guestSection = document.getElementById("guest-section");
      const memberSection = document.getElementById("member-section");


      if(!guestSection || !memberSection) return;


      if(currentUser){

          guestSection.style.display = "none";
          memberSection.style.display = "block";

      }else{

          guestSection.style.display = "block";
          memberSection.style.display = "none";

      }

  }


  /* ==========================================
     2. HERO BANNER SLIDER
  ========================================== */

  /* ==========================================
     2. HERO BANNER SLIDER
  ========================================== */

  const HeroSlider = {
    slides: [],
    dots: [],
    currentIndex: 0,
    interval: null,
    duration: 4500, // 4.5 seconds per slide

    init() {
      this.slides = document.querySelectorAll('.hero-slide');
      this.dots = document.querySelectorAll('.hero-dot');
      
      if (this.slides.length === 0) return;
      
      this.startAutoSlide();
      this.bindEvents();
    },

    goTo(index) {
      if (index < 0) index = this.slides.length - 1;
      if (index >= this.slides.length) index = 0;
      
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      this.currentIndex = index;
    },

    next() {
      this.goTo(this.currentIndex + 1);
    },

    startAutoSlide() {
      this.stopAutoSlide();
      this.interval = setInterval(() => this.next(), this.duration);
    },

    stopAutoSlide() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    bindEvents() {
      const slider = document.getElementById('heroSlider');
      if (!slider) return;
      
      // Pause on hover
      slider.addEventListener('mouseenter', () => this.stopAutoSlide());
      slider.addEventListener('mouseleave', () => this.startAutoSlide());
      
      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;
      
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    },

    handleSwipe(startX, endX) {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next(); // Swipe left → next
        } else {
          this.goTo(this.currentIndex - 1); // Swipe right → prev
        }
      }
    }
  };

  // Global function for dot clicks
  window.goToSlide = function(index) {
    HeroSlider.goTo(index);
    HeroSlider.stopAutoSlide();
    setTimeout(() => HeroSlider.startAutoSlide(), 8000); // Resume after 8s
  };

  /* ==========================================
     3. GAMES MARQUEE — CSS handles animation
     (No JS needed for basic marquee)
  ========================================== */

  const GamesMarquee = {
    init() {
      // Optional: Pause on hover is handled by CSS
      // Optional: Dynamic speed based on screen width
      this.adjustSpeed();
      window.addEventListener('resize', () => this.adjustSpeed());
    },

    adjustSpeed() {
      const track = document.querySelector('.marquee-content');
      if (!track) return;
      
      // Slower on mobile for readability
      if (window.innerWidth < 480) {
        track.style.animationDuration = '35s';
      } else {
        track.style.animationDuration = '25s';
      }
    }
  };

  /* ==========================================
     5. RECENT WINNERS SLIDER
     CSS handles animation, JS for dynamic data
  ========================================== */

  const WinnersSlider = {
    init() {
      this.duplicateForSeamlessLoop();
    },

    duplicateForSeamlessLoop() {
      // Ensure seamless loop by duplicating cards if needed
      const track = document.getElementById('winnersTrack');
      if (!track) return;
      
      // The HTML already has 10 cards, CSS animation handles the rest
      // This function can be used to dynamically add more winners from API
    },

    // Add new winner dynamically (for future backend integration)
    addWinner(name, game, amount, avatarColor) {
      const track = document.getElementById('winnersTrack');
      if (!track) return;
      
      const card = document.createElement('div');
      card.className = 'winner-card';
      card.style.cssText = 'background: var(--surface); border: 1px solid var(--border);';
      card.innerHTML = `
        <div class="winner-avatar" style="background: ${avatarColor};">${name.charAt(0)}</div>
        <span class="winner-name" style="color: var(--text);">${name}</span>
        <span class="winner-game" style="color: var(--text-muted);">${game}</span>
        <span class="winner-amount" style="color: var(--yellow);">${amount}</span>
      `;
      
      track.appendChild(card);
    }
  };

  /* ==========================================
     STICKY BOTTOM BAR
  ========================================== */

  const StickyBar = {
    init() {
      this.checkScroll();
      window.addEventListener('scroll', () => this.checkScroll());
    },

    checkScroll() {
      const bar = document.getElementById('stickyBottomBar');
      if (!bar) return;
      
      // Show sticky bar after scrolling down 200px
      if (window.scrollY > 200) {
        bar.style.transform = 'translateY(0)';
      } else {
        bar.style.transform = 'translateY(100%)';
      }
    }
  };

  /* ==========================================
     SMOOTH SCROLL FOR FOOTER LINKS
  ========================================== */

  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return; // Skip placeholder links
          
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };

  /* ==========================================
     ANIMATION ON SCROLL (Intersection Observer)
  ========================================== */

  const ScrollAnimations = {
    init() {
      if (!('IntersectionObserver' in window)) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.offer-card, .why-card, .crypto-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
      });
    }
  };

  /* ==========================================
     COUNTER ANIMATION (for future stats)
 ========================================== */

  const CounterAnimation = {
    animate(element, target, duration = 2000) {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start).toLocaleString();
        }
      }, 16);
    }
  };

  /* ==========================================
     TOAST NOTIFICATION
  ========================================== */

  window.showLandingToast = function(message, type = 'success') {
    const existing = document.querySelector('.landing-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'landing-toast';
    
    const colors = {
      success: 'linear-gradient(135deg, #1d8548, #16a34a)',
      error: 'linear-gradient(135deg, #ef4444, #ff5252)',
      info: 'linear-gradient(135deg, #2979ff, #448aff)',
      warning: 'linear-gradient(135deg, #d6c61a, #e8d52a)'
    };

    toast.innerHTML = `<span>${message}</span>`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: ${colors[type] || colors.success};
      color: #fff;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      white-space: nowrap;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  /* ==========================================
     LOGIN / REGISTER / DEPOSIT HANDLERS
     (Placeholder for future integration)
  ========================================== */

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.sticky-btn, .hero-btn');
    if (!btn) return;
    
    const text = btn.textContent.trim().toLowerCase();
    
    if (text.includes('login')) {
      // window.location.href = '/login';
      console.log('Login clicked');
    } else if (text.includes('register') || text.includes('join')) {
      // window.location.href = '/register';
      console.log('Register clicked');
    } else if (text.includes('deposit')) {
      // window.location.href = '/deposit';
      console.log('Deposit clicked');
    } else if (text.includes('claim')) {
      showLandingToast('Please login to claim this offer', 'info');
    }
  });

  /* ==========================================
     INITIALIZATION
  ========================================== */

  document.addEventListener('DOMContentLoaded', function() {
    HeroSlider.init();
    GamesMarquee.init();
    WinnersSlider.init();
    StickyBar.init();
    SmoothScroll.init();
    ScrollAnimations.init();
    
    console.log('Landing Page JS initialized');
  });

})();
