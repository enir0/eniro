'use strict';

(() => {
  const mq = window.matchMedia('(min-width: 766px)');
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger === 'undefined' || typeof DrawSVGPlugin === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  const FIGMA_W = 1440;
  const LINES = [
    {
      el: '.eniro-line--03',
      w: 1440,
      h: 2965,
      x: 0,
      reverse: true,
    },
    {
      el: '.eniro-line--02',
      w: 1440,
      h: 2925,
      x: 420,
      reverse: false,
    },
    {
      el: '.eniro-line--04',
      w: 2407,
      h: 2441,
      x: 1440 - 2407 + 180,
      reverse: false,
    },
  ];

  let ctx;
  const pageY = (el) => el.getBoundingClientRect().top + window.scrollY;

  function place() {
    const mocks = document.querySelector('.top_kv_mocks');
    const members = document.querySelector('#members');
    const faq = document.querySelector('#faq');
    if (!mocks || !members || !faq) return;

    const scale = window.innerWidth / FIGMA_W;
    const artboard = FIGMA_W * scale;
    const offsetX = (window.innerWidth - artboard) / 2;
    const heights = LINES.map((line) => line.h * scale);

    const t03 = pageY(mocks) - 140 * scale;
    const t02 = pageY(members) - 200 * scale;
    const t04 = pageY(faq) - 40 * scale;

    const tops = [t03, t02, t04];

    LINES.forEach((line, i) => {
      const wrap = document.querySelector(line.el);
      if (!wrap) return;
      wrap.style.width = `${line.w * scale}px`;
      wrap.style.height = `${heights[i]}px`;
      wrap.style.left = `${offsetX + line.x * scale}px`;
      wrap.style.top = `${tops[i]}px`;

      const path = wrap.querySelector('.eniro-line__path');
      const dot = wrap.querySelector('.eniro-line__dot');
      if (path && dot) {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(len);
        dot.setAttribute('cx', String(pt.x));
        dot.setAttribute('cy', String(pt.y));
      }
    });
  }

  function init() {
    if (ctx) ctx.revert();
    if (!mq.matches) {
      LINES.forEach((line) => {
        const wrap = document.querySelector(line.el);
        if (!wrap) return;
        wrap.style.width = '';
        wrap.style.height = '';
        wrap.style.left = '';
        wrap.style.top = '';
      });
      return;
    }

    place();

    ctx = gsap.context(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

      LINES.forEach((line) => {
        const wrap = document.querySelector(line.el);
        const path = wrap?.querySelector('.eniro-line__path');
        const dot = wrap?.querySelector('.eniro-line__dot');
        if (!wrap || !path) return;

        if (reduce) {
          gsap.set(path, { drawSVG: '0% 100%' });
          if (dot) gsap.set(dot, { opacity: 1 });
          return;
        }

        const hidden = line.reverse ? '100% 100%' : '0% 0%';
        gsap.set(path, { drawSVG: hidden });

        gsap.fromTo(
          path,
          { drawSVG: hidden },
          {
            drawSVG: '0% 100%',
            ease: 'none',
            immediateRender: true,
            scrollTrigger: {
              trigger: wrap,
              start: 'top 40%',
              end: 'bottom 50%',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        if (dot) {
          gsap.fromTo(
            dot,
            { opacity: 0 },
            {
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: wrap,
                start: 'bottom 80%',
                end: 'bottom 60%',
                scrub: 1,
              },
            }
          );
        }
      });
    });

    ScrollTrigger.refresh();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(init, 180);
  });
  mq.addEventListener('change', init);

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
