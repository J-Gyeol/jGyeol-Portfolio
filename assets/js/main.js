(function ($) {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * scrub: true — 스크롤과 1:1 (핀 히어로 + Lenis에서 지연 스크럽이면 경계 튕김 유발)
   * scrub: 0.65~1 — 지연 스무딩(초). 브리지·섹션 등장은 같은 값으로 통일
   */
  var HERO_SCRUB = true;
  var PAGE_SCRUB = 0.75;

  function refreshScrollTriggersHard() {
    if (typeof ScrollTrigger === "undefined") return;
    ScrollTrigger.refresh();
  }

  function scheduleScrollTriggerRefresh() {
    requestAnimationFrame(function () {
      requestAnimationFrame(refreshScrollTriggersHard);
    });
  }

  /**
   * Lenis: 전역 관성 스크롤 (GSAP ScrollTrigger와 동기화)
   * — 히어로 핀/브리지/섹션 scrub과 동일한 스크롤 파이프라인
   */
  function initLenis() {
    if (prefersReducedMotion) return null;
    if (typeof Lenis === "undefined") return null;

    var lenis = new Lenis({
      duration: 1.08,
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.1,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      },
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: prefersReducedMotion ? true : false,
    });
  }

  function initMobileNav() {
    var $body = $("body");
    var $toggle = $(".nav-toggle");
    var $panel = $("#mobile-nav");

    $toggle.on("click", function () {
      var open = !$body.hasClass("nav-open");
      $body.toggleClass("nav-open", open);
      $toggle.attr("aria-expanded", open);
      $toggle.attr("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      $panel.prop("hidden", !open);
    });

    $panel.find("a").on("click", function () {
      $body.removeClass("nav-open");
      $toggle.attr("aria-expanded", false);
      $toggle.attr("aria-label", "메뉴 열기");
      $panel.prop("hidden", true);
    });
  }

  /** About 패널(히어로 2)·Work 섹션 등 밝은 배경에서 헤더 대비 확보 */
  function initHeaderLightTheme() {
    if (!window.IntersectionObserver) return;
    var panel2 = document.querySelector(".hero-panel--2");
    var work = document.querySelector(".work-section");
    var $header = $(".site-header");
    if (!panel2 && !work) return;

    var flags = { about: false, work: false };

    function sync() {
      $header.toggleClass("site-header--on-light", flags.about || flags.work);
    }

    if (panel2) {
      var ioAbout = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            flags.about = e.intersectionRatio > 0.22;
            sync();
          });
        },
        { threshold: [0, 0.08, 0.15, 0.22, 0.35, 0.55, 0.75, 1] }
      );
      ioAbout.observe(panel2);
    }

    if (work) {
      var ioWork = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            flags.work = e.isIntersecting && e.intersectionRatio > 0.06;
            sync();
          });
        },
        { threshold: [0, 0.06, 0.12, 0.2, 0.35, 0.55, 1], rootMargin: "-56px 0px 0px 0px" }
      );
      ioWork.observe(work);
    }
  }

  function initHeroScroll() {
    var $root = $(".hero-pinned");
    if (!$root.length) return;

    if (prefersReducedMotion) {
      gsap.set(".hero-panel--2 .hero-reveal", { clearProps: "all" });
      return;
    }

    var panel1 = ".hero-panel--1";
    var panel2 = ".hero-panel--2";
    var photo = ".hero-about__photo.hero-reveal";
    var title = ".hero-about__title.hero-reveal";
    var body = ".hero-about__body.hero-reveal";
    var tags = ".hero-about__tags.hero-reveal";

    gsap.set(panel2, { yPercent: 100 });
    gsap.set(photo, { opacity: 0, x: -52 });
    gsap.set([title, body], { opacity: 0, x: 44 });
    gsap.set(tags, { opacity: 0, y: 28 });

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: $root[0],
        start: "top top",
        end: "+=200%",
        pin: true,
        pinSpacing: true,
        scrub: HERO_SCRUB,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });

    tl.to(panel1, { yPercent: -100, duration: 1 }, 0)
      .to(panel2, { yPercent: 0, duration: 1 }, 0)
      .to(
        photo,
        { opacity: 1, x: 0, duration: 0.52, ease: "power2.out" },
        0.38
      )
      .to(
        title,
        { opacity: 1, x: 0, duration: 0.48, ease: "power2.out" },
        0.44
      )
      .to(
        body,
        { opacity: 1, x: 0, duration: 0.48, ease: "power2.out" },
        0.5
      )
      .to(
        tags,
        { opacity: 1, y: 0, duration: 0.42, ease: "power2.out" },
        0.56
      );
  }

  function initSkillBridgeParallax() {
    var bridge = document.querySelector(".skill-bridge");
    var bg = document.querySelector(".js-skill-bridge-bg");
    var copy = document.querySelector(".skill-bridge__copy");
    var line1 = document.querySelector(".js-skill-bridge-line1");
    var line2 = document.querySelector(".js-skill-bridge-line2");
    if (!bridge || !bg) return;

    if (prefersReducedMotion) {
      gsap.set([bg, copy, line1, line2].filter(Boolean), { clearProps: "transform" });
      return;
    }

    var st = {
      trigger: bridge,
      start: "top bottom",
      end: "bottom top",
      scrub: PAGE_SCRUB,
      invalidateOnRefresh: true,
    };

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: st,
    });

    tl.fromTo(bg, { y: 0 }, { y: 110, duration: 1, ease: "none" }, 0);

    if (copy) {
      tl.fromTo(copy, { y: 28 }, { y: -20, duration: 1, ease: "none" }, 0);
    }

    if (line1) {
      gsap.set(line1, { transformOrigin: "left center" });
      tl.fromTo(
        line1,
        { x: "-40vw" },
        { x: "40vw", duration: 1, ease: "none" },
        0
      );
    }

    if (line2) {
      gsap.set(line2, { transformOrigin: "right center" });
      tl.fromTo(
        line2,
        { x: "40vw" },
        { x: "-40vw", duration: 1, ease: "none" },
        0
      );
    }
  }

  /**
   * 히어로/자기소개와 같이 scrub으로 부드럽게 등장 (Skill, Project, Contact)
   */
  function initSmoothScrollSections() {
    if (prefersReducedMotion) return;

    function bindScrubReveal(rootSel, childSel, stOpts) {
      stOpts = stOpts || {};
      var root = document.querySelector(rootSel);
      if (!root) return;
      var targets = gsap.utils.toArray(root.querySelectorAll(childSel));
      if (!targets.length) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root,
            start: stOpts.start || "top 92%",
            end: stOpts.end || "top 34%",
            scrub: PAGE_SCRUB,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    bindScrubReveal(".skill-section", ".js-skill-head, .skill-matrix > *", {
      start: "top 96%",
      end: "top 28%",
    });
  }

  function initSkillCardHover() {
    if (prefersReducedMotion) return;
    $(".skill-tile").each(function () {
      var el = this;
      $(el).on("mouseenter", function () {
        gsap.to(el, { scale: 1.02, duration: 0.35, ease: "power2.out" });
      });
      $(el).on("mouseleave", function () {
        gsap.to(el, { scale: 1, duration: 0.35, ease: "power2.out" });
      });
    });
  }

  /** Contact: 순차 스크롤 리빌 (헤드 -> 이메일 웨이브 -> 단락/버튼) */
  function initContactAnimations() {
    if (prefersReducedMotion) return;

    var section = document.querySelector(".contact-section");
    var email = document.querySelector(".contact-section__email-link");
    var kicker = document.querySelector(".contact-section__kicker");
    var titleRow = document.querySelector(".contact-section__title-row");
    var texts = gsap.utils.toArray(".contact-section__text");
    var cta = document.querySelector(".contact-section__mail-cta");
    if (!section || !email) return;
    if (email.dataset.splitReady === "true") return;

    var raw = (email.textContent || "").trim();
    if (!raw) return;
    email.dataset.splitReady = "true";

    email.textContent = "";

    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = raw;
    email.appendChild(sr);

    var frag = document.createDocumentFragment();
    raw.split("").forEach(function (ch) {
      var span = document.createElement("span");
      span.className = "contact-section__email-char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch;
      frag.appendChild(span);
    });
    email.appendChild(frag);

    var chars = email.querySelectorAll(".contact-section__email-char");
    if (!chars.length) return;

    gsap.set([kicker, titleRow].filter(Boolean), { y: 34, opacity: 0 });
    gsap.set(chars, { yPercent: 112, opacity: 0 });
    gsap.set(texts, { y: 34, opacity: 0 });
    if (cta) gsap.set(cta, { x: -34, opacity: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 74%",
        toggleActions: "play none none reset",
        invalidateOnRefresh: true,
      },
    });

    tl.to([kicker, titleRow].filter(Boolean), {
      y: 0,
      opacity: 1,
      duration: 0.55,
      stagger: 0.08,
      ease: "power2.out",
    })
      .to(
        chars,
        {
          keyframes: [
            { yPercent: 112, opacity: 0, duration: 0 },
            { yPercent: -18, opacity: 1, duration: 0.34, ease: "power2.out" },
            { yPercent: 0, opacity: 1, duration: 0.28, ease: "power2.inOut" },
          ],
          stagger: 0.034,
        },
        "-=0.05"
      )
      .to(
        texts,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.12"
      );

    if (cta) {
      tl.to(
        cta,
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.34"
      );
    }
  }

  /** Work: 세로 스크롤 시 섹션 핀 + 카드 트랙 가로 이동 */
  function initWorkHorizontalScroll() {
    if (prefersReducedMotion) return;
    var section = document.querySelector(".work-section");
    var track = document.querySelector(".js-work-track");
    var viewport = document.querySelector(".work-section__viewport");
    if (!section || !track || !viewport) return;

    function maxShift() {
      return Math.max(0, track.scrollWidth - viewport.offsetWidth);
    }

    function verticalScrollForPin() {
      var ms = maxShift();
      return ms > 0 ? ms : 400;
    }

    gsap.to(track, {
      x: function () {
        return -maxShift();
      },
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: function () {
          return "+=" + verticalScrollForPin();
        },
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: -1,
      },
    });

    track.querySelectorAll("img").forEach(function (img) {
      if (img.complete) return;
      img.addEventListener("load", scheduleScrollTriggerRefresh, { once: true });
    });
  }

  /** Swiper: 프로젝트 섹션 등에서 사용 예정 */
  function initSwiperPlaceholder() {
    if (typeof Swiper === "undefined") return;
    var el = document.querySelector(".js-swiper");
    if (!el) return;
    // eslint-disable-next-line no-new
    new Swiper(el, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
    });
  }

  $(function () {
    var lenis = initLenis();

    initAOS();
    initMobileNav();
    initHeroScroll();
    initHeaderLightTheme();
    initSkillBridgeParallax();
    initWorkHorizontalScroll();
    initSmoothScrollSections();
    initSkillCardHover();
    initContactAnimations();
    initSwiperPlaceholder();

    function afterLayoutRefresh() {
      scheduleScrollTriggerRefresh();
      if (lenis) lenis.resize();
    }

    var aboutImg = document.querySelector("#about .about-photo img");
    if (aboutImg) {
      if (aboutImg.complete) {
        afterLayoutRefresh();
      } else {
        aboutImg.addEventListener("load", afterLayoutRefresh, { once: true });
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(afterLayoutRefresh).catch(afterLayoutRefresh);
    }

    $(window).on("load", function () {
      afterLayoutRefresh();
      window.setTimeout(afterLayoutRefresh, 400);
      if (typeof AOS !== "undefined") AOS.refresh();
    });

    window.addEventListener(
      "pageshow",
      function (ev) {
        afterLayoutRefresh();
        if (ev.persisted) window.setTimeout(afterLayoutRefresh, 80);
      },
      false
    );

    var resizeTimer;
    $(window).on("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(afterLayoutRefresh, 200);
    });

    afterLayoutRefresh();

    if (lenis) {
      $(document).on("click", 'a[href^="#"]:not(.skip-link)', function (e) {
        var id = this.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: -76,
          duration: 1.15,
        });
      });
    }
  });
})(jQuery);
