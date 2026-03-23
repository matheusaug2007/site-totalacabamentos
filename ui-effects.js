/* ==============================================
       SCROLL REVEAL — IntersectionObserver
    ============================================== */
    (function () {
      const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
      const elements = document.querySelectorAll(revealClasses.join(','));

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
    })();

    /* ==============================================
       ANIMATED COUNTERS
    ============================================== */
    (function () {
      function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1400; // ms
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(ease * target);
          el.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      }

      const statEls = document.querySelectorAll('.stat-num[data-target]');
      if (!statEls.length) return;

      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      statEls.forEach((el) => counterObserver.observe(el));
    })();

    /* ==============================================
       DYNAMIC STORE STATUS (Aberto / Fechado)
    ============================================== */
    (function () {
      const statusDot = document.querySelector('#info-bar .status-dot');
      const statusText = document.querySelector('#info-bar .info-status span:last-child');
      if (!statusDot || !statusText) return;

      function updateStatus() {
        const now = new Date();
        const day = now.getDay(); // 0=Dom, 1=Seg, 6=Sab
        const h = now.getHours();
        const m = now.getMinutes();
        const totalMin = h * 60 + m;

        let isOpen = false;
        if (day >= 1 && day <= 5) {
          // Seg-Sex 07h–18h
          isOpen = totalMin >= 7 * 60 && totalMin < 18 * 60;
        } else if (day === 6) {
          // Sab 07h–12h
          isOpen = totalMin >= 7 * 60 && totalMin < 12 * 60;
        }

        if (isOpen) {
          statusDot.style.background = '#22c55e';
          statusText.textContent = 'Loja Aberta';
        } else {
          statusDot.style.background = '#ef4444';
          statusDot.style.animation = 'none';
          statusText.textContent = 'Loja Fechada';
        }
      }

      updateStatus();
      // Atualiza a cada minuto
      setInterval(updateStatus, 60000);
    })();

    /* ==============================================
       SHOWCASE MOUSE PARALLAX
    ============================================== */
    (function () {
      document.addEventListener('mousemove', (e) => {
        const showcase = document.querySelector('.showcase-spotlight');
        const visual = document.querySelector('.showcase-visual-icon-wrap');
        
        if (!showcase || !visual) return;

        const rect = showcase.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const moveX = (x - centerX) / 30;
          const moveY = (y - centerY) / 30;
          
          visual.style.transform = `translate(${moveX}px, ${moveY}px) rotateX(${-moveY/2}deg) rotateY(${moveX/2}deg)`;
        } else {
          visual.style.transform = `translate(0, 0) rotateX(0deg) rotateY(0deg)`;
        }
      });
    })();

