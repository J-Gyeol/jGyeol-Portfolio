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

  /** 실제 헤더 바 높이 → --header-h (고정 px와 불일치로 생기는 메뉴·딤 간격 제거) */
  function initHeaderHeight() {
    var bar = document.querySelector(".site-header--bar");
    if (!bar) return;

    function sync() {
      var h = bar.getBoundingClientRect().height;
      if (!h) return;
      document.documentElement.style.setProperty("--header-h", Math.round(h * 100) / 100 + "px");
    }

    sync();
    requestAnimationFrame(function () {
      requestAnimationFrame(sync);
    });

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(sync);
      ro.observe(bar);
    }

    $(window).on("resize.headerH", sync);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sync).catch(sync);
    }
  }

  function getHeaderScrollOffset() {
    var raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    var n = parseFloat(raw);
    if (isNaN(n)) return -64;
    return -Math.ceil(n);
  }

  function initSiteMenu() {
    var $body = $("body");
    var $wrap = $(".site-header-wrap");
    var $toggle = $("#site-menu-trigger");
    var $panel = $("#site-menu-panel");
    var $backdrop = $("#site-menu-backdrop");

    if (!$toggle.length || !$panel.length) return;

    function setOpen(open) {
      $body.toggleClass("site-menu-open", open);
      if ($wrap.length) {
        $wrap.toggleClass("site-header-wrap--open", open);
      }
      $toggle.attr("aria-expanded", open);
      $panel.prop("hidden", !open);
      if ($backdrop.length) {
        $backdrop.prop("hidden", !open);
      }

      window.setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
      }, 0);
    }

    $toggle.on("click", function (e) {
      e.stopPropagation();
      setOpen(!$body.hasClass("site-menu-open"));
    });

    $backdrop.on("click", function () {
      setOpen(false);
    });

    $panel.find("a").on("click", function () {
      setOpen(false);
    });

    $(document).on("keydown.siteMenu", function (e) {
      if (e.key === "Escape" && $body.hasClass("site-menu-open")) {
        setOpen(false);
      }
    });
  }

  /** About 패널·Work 등 밝은 배경에서 헤더 텍스트·보더 톤 전환 */
  function initHeaderLightTheme() {
    if (!window.IntersectionObserver) return;
    var panel2 = document.querySelector(".hero-panel--2");
    var work = document.querySelector(".work-section");
    var $wrap = $(".site-header-wrap");
    if (!$wrap.length) return;
    if (!panel2 && !work) return;

    var flags = { about: false, work: false };

    function sync() {
      var onLight = flags.about || flags.work;
      $wrap.toggleClass("site-header--on-light", onLight);
      document.documentElement.classList.toggle("site-scroll--light", onLight);
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
    var desktopQuery = "(min-width: 901px)";
    var mobileQuery = "(max-width: 900px)";

    // 브레이크포인트 변경(리사이즈) 시 데스크톱/모바일 상태를 자동 전환
    if (gsap.matchMedia) {
      var mm = gsap.matchMedia();

      mm.add(desktopQuery, function () {
        var isAboutColumnLayout = window.matchMedia("(max-width: 768px)").matches;

        gsap.set(panel2, { yPercent: 100 });
        if (isAboutColumnLayout) {
          gsap.set(photo, { opacity: 0, y: 56 });
          gsap.set([title, body], { opacity: 0, y: 46 });
          gsap.set(tags, { opacity: 0, y: 32 });
        } else {
          gsap.set(photo, { opacity: 0, x: -52 });
          gsap.set([title, body], { opacity: 0, x: 44 });
          gsap.set(tags, { opacity: 0, y: 28 });
        }

        var tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: $root[0],
            start: "top top",
            end: "+=105%",
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
            isAboutColumnLayout
              ? { opacity: 1, y: 0, duration: 0.52, ease: "power2.out" }
              : { opacity: 1, x: 0, duration: 0.52, ease: "power2.out" },
            0.38
          )
          .to(
            title,
            isAboutColumnLayout
              ? { opacity: 1, y: 0, duration: 0.48, ease: "power2.out" }
              : { opacity: 1, x: 0, duration: 0.48, ease: "power2.out" },
            0.44
          )
          .to(
            body,
            isAboutColumnLayout
              ? { opacity: 1, y: 0, duration: 0.48, ease: "power2.out" }
              : { opacity: 1, x: 0, duration: 0.48, ease: "power2.out" },
            0.5
          )
          .to(
            tags,
            { opacity: 1, y: 0, duration: 0.42, ease: "power2.out" },
            0.56
          );
      });

      mm.add(mobileQuery, function () {
        gsap.set([panel1, panel2, photo, title, body, tags], { clearProps: "all" });
      });
      return;
    }

    // fallback: matchMedia 미지원 환경에서는 기존 데스크톱 동작 유지
    if (!window.matchMedia(desktopQuery).matches) {
      gsap.set([panel1, panel2, photo, title, body, tags], { clearProps: "all" });
      return;
    }
  }

  /** Hero 1st panel title: fade up on initial load */
  function initHeroTitleFadeUp() {
    var heroTitle = document.querySelector(".hero-panel--1 .hero-title");
    if (!heroTitle) return;

    if (prefersReducedMotion) {
      gsap.set(heroTitle, { clearProps: "all" });
      return;
    }

    gsap.fromTo(
      heroTitle,
      { opacity: 0, y: 34 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.12,
        ease: "power2.out",
        overwrite: "auto",
      }
    );
  }

  /** Hero 1st panel background: pointer-follow subtle parallax */
  function initHeroPointerParallax() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

    var hero = document.querySelector(".hero-panel--1");
    var bg = document.querySelector(".hero-panel__bg--1");
    if (!hero || !bg) return;

    var moveX = gsap.quickTo(bg, "x", { duration: 0.42, ease: "power3.out" });
    var moveY = gsap.quickTo(bg, "y", { duration: 0.42, ease: "power3.out" });
    var moveMX = gsap.quickTo(bg, "--hero-mx", { duration: 0.34, ease: "power2.out", unit: "%" });
    var moveMY = gsap.quickTo(bg, "--hero-my", { duration: 0.34, ease: "power2.out", unit: "%" });
    var maxShift = 14;

    function onMove(e) {
      var rect = hero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var nx = (e.clientX - rect.left) / rect.width - 0.5;
      var ny = (e.clientY - rect.top) / rect.height - 0.5;
      moveX(nx * maxShift);
      moveY(ny * maxShift);
      moveMX((nx + 0.5) * 100);
      moveMY((ny + 0.5) * 100);
    }

    function onLeave() {
      moveX(0);
      moveY(0);
      moveMX(50);
      moveMY(50);
    }

    hero.addEventListener("mousemove", onMove, { passive: true });
    hero.addEventListener("mouseleave", onLeave, { passive: true });
    hero.addEventListener("blur", onLeave, { passive: true });
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

    // 스크럽 없이도 체감되도록 진입/복귀를 명시적으로 제어
    gsap.set([bg, copy, line1, line2].filter(Boolean), { force3D: true });

    gsap.fromTo(
      bg,
      { y: 0 },
      {
        y: 110,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: bridge,
          start: "top 92%",
          end: "bottom top",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      }
    );

    if (copy) {
      gsap.fromTo(
        copy,
        { y: 26 },
        {
          y: -24,
          duration: 0.95,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bridge,
            start: "top 92%",
            end: "bottom top",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        }
      );
    }

    function getTwoCharClipPx(el) {
      if (!el) return 40;
      var text = (el.textContent || "").trim();
      var textLen = Math.max(1, text.length);
      var lineWidth = el.getBoundingClientRect().width || 0;
      var avgChar = lineWidth > 0 ? lineWidth / textLen : parseFloat(getComputedStyle(el).fontSize || "20");
      return Math.max(24, avgChar * 2);
    }

    if (line1) {
      gsap.fromTo(
        line1,
        { x: 0 },
        {
          x: function () {
            var lineWidth = line1.getBoundingClientRect().width || 0;
            var clip = getTwoCharClipPx(line1);
            return Math.max(0, window.innerWidth - lineWidth + clip);
          },
          ease: "none",
          scrollTrigger: {
            trigger: bridge,
            start: "top 92%",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    if (line2) {
      gsap.fromTo(
        line2,
        { x: 0 },
        {
          x: function () {
            var lineWidth = line2.getBoundingClientRect().width || 0;
            var clip = getTwoCharClipPx(line2);
            return -Math.max(0, window.innerWidth - lineWidth + clip);
          },
          ease: "none",
          scrollTrigger: {
            trigger: bridge,
            start: "top 92%",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
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

    bindScrubReveal(".skill-section", ".js-skill-head", {
      start: "top 96%",
      end: "top 28%",
    });
  }

  /** Skill: 2열 한 행씩 동시 등장 (좌/우 컬럼 함께 리빌) */
  function initSkillRowsRise() {
    var items = gsap.utils.toArray(".js-skill-lists .skill-reveal-item");
    if (!items.length) return;

    var rowGroups = [];
    for (var i = 0; i < items.length; i += 2) {
      rowGroups.push(items.slice(i, i + 2));
    }

    rowGroups.forEach(function (group) {
      if (!group.length) return;
      if (prefersReducedMotion) {
        group.forEach(function (el) {
          el.classList.add("is-inview");
        });
        return;
      }

      ScrollTrigger.create({
        trigger: group[0],
        start: "top 92%",
        onEnter: function () {
          group.forEach(function (el) {
            el.classList.add("is-inview");
          });
        },
        onEnterBack: function () {
          group.forEach(function (el) {
            el.classList.add("is-inview");
          });
        },
      });
    });

    // Skill 섹션을 완전히 벗어나면 상태 리셋 → 재진입 시 다시 리빌
    ScrollTrigger.create({
      trigger: ".skill-section",
      start: "top bottom",
      end: "bottom top",
      onLeave: function () {
        items.forEach(function (el) {
          el.classList.remove("is-inview");
        });
      },
      onLeaveBack: function () {
        items.forEach(function (el) {
          el.classList.remove("is-inview");
        });
      },
    });
  }

  /** Skill: 행이 뷰포트에 들어올 때 프로그레스바 0% → 목표% */
  function initSkillProgressBars() {
    var section = document.querySelector(".skill-section");
    if (!section) return;

    var rows = section.querySelectorAll(".skill-row[data-skill-level]");
    if (!rows.length) return;

    rows.forEach(function (row) {
      var fill = row.querySelector(".js-skill-fill");
      if (!fill) return;

      var raw = row.getAttribute("data-skill-level");
      var level = parseFloat(raw, 10);
      if (isNaN(level)) level = 0;
      level = Math.max(0, Math.min(100, level));

      gsap.set(fill, { width: "0%" });

      if (prefersReducedMotion) {
        gsap.set(fill, { width: level + "%" });
        return;
      }

      var tween = gsap.to(fill, {
        width: level + "%",
        duration: 1.2,
        ease: "sine.out",
        paused: true,
      });

      ScrollTrigger.create({
        trigger: row,
        start: "top 88%",
        onEnter: function () {
          gsap.set(fill, { width: "0%" });
          tween.restart();
        },
        onEnterBack: function () {
          gsap.set(fill, { width: "0%" });
          tween.restart();
        },
      });
    });

    // Skill 섹션을 완전히 벗어나면 게이지 초기화
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onLeave: function () {
        rows.forEach(function (row) {
          var fill = row.querySelector(".js-skill-fill");
          if (fill) gsap.set(fill, { width: "0%" });
        });
      },
      onLeaveBack: function () {
        rows.forEach(function (row) {
          var fill = row.querySelector(".js-skill-fill");
          if (fill) gsap.set(fill, { width: "0%" });
        });
      },
    });
  }

  function splitTextToChars(el, charClass, readyKey) {
    if (!el) return [];
    if (el.dataset[readyKey] === "true") {
      return el.querySelectorAll("." + charClass);
    }

    var raw = (el.textContent || "").trim();
    if (!raw) return [];
    el.dataset[readyKey] = "true";

    el.textContent = "";
    var sr = document.createElement("span");
    sr.className = "visually-hidden";
    sr.textContent = raw;
    el.appendChild(sr);

    var frag = document.createDocumentFragment();
    raw.split("").forEach(function (ch) {
      var span = document.createElement("span");
      span.className = charClass;
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    return el.querySelectorAll("." + charClass);
  }

  /** WORK / SKILL 타이틀: Contact 이메일과 유사한 문자 단위 웨이브 */
  function initSectionTitleCharAnimations() {
    if (prefersReducedMotion) return;

    var titleConfigs = [
      {
        el: document.querySelector("#work-heading"),
        trigger: ".work-section",
        start: "top 86%",
        onEnterBack: false,
      },
      {
        el: document.querySelector("#skill-heading"),
        trigger: ".skill-section",
        start: "top 88%",
        onEnterBack: true,
      },
    ];

    titleConfigs.forEach(function (cfg) {
      if (!cfg.el) return;
      var chars = splitTextToChars(cfg.el, "section-title__char", "splitTitleReady");
      if (!chars.length) return;

      gsap.set(chars, { yPercent: 112, opacity: 0 });

      var tl = gsap.timeline({ paused: true });
      tl.to(chars, {
        keyframes: [
          { yPercent: 112, opacity: 0, duration: 0 },
          { yPercent: -18, opacity: 1, duration: 0.34, ease: "power2.out" },
          { yPercent: 0, opacity: 1, duration: 0.28, ease: "power2.inOut" },
        ],
        stagger: 0.034,
      });

      ScrollTrigger.create({
        trigger: cfg.trigger,
        start: cfg.start,
        onEnter: function () {
          gsap.set(chars, { yPercent: 112, opacity: 0 });
          tl.restart();
        },
        onEnterBack: function () {
          if (cfg.onEnterBack === false) return;
          gsap.set(chars, { yPercent: 112, opacity: 0 });
          tl.restart();
        },
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
    function isTabletOrDown() {
      return window.matchMedia("(max-width: 900px)").matches;
    }

    gsap.set([kicker, titleRow].filter(Boolean), { y: 34, opacity: 0 });
    gsap.set(chars, { yPercent: 112, opacity: 0 });
    gsap.set(texts, { y: 34, opacity: 0 });
    if (cta) {
      gsap.set(cta, {
        x: function () {
          return isTabletOrDown() ? 0 : -34;
        },
        y: function () {
          return isTabletOrDown() ? 34 : 0;
        },
        opacity: 0,
      });
    }

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
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.34"
      );
    }
  }

  /** Contact 톤을 가져온 절제된 리빌 (Work intro / Footer) */
  function initSubtleContentReveals() {
    if (prefersReducedMotion) return;

    var footerTitles = gsap.utils.toArray(".site-footer__label, .site-footer__madeby");
    var footerBodies = gsap.utils.toArray(".site-footer__link, .site-footer__copy");
    if (footerTitles.length || footerBodies.length) {
      gsap.set(footerTitles, { y: 28, opacity: 0 });
      gsap.set(footerBodies, { y: 28, opacity: 0 });

      var footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".site-footer",
          start: "top 96%",
          toggleActions: "play none none reset",
          invalidateOnRefresh: true,
        },
      });

      footerTl.to(footerTitles, {
        keyframes: [
          { y: 28, opacity: 0, duration: 0 },
          { y: -6, opacity: 1, duration: 0.3, ease: "power2.out" },
          { y: 0, opacity: 1, duration: 0.22, ease: "power2.inOut" },
        ],
        stagger: 0.06,
      }).to(
        footerBodies,
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: "power2.out",
        },
        "-=0.1"
      );
    }
  }

  /** Work: 세로 스크롤 시 섹션 핀 + 카드 트랙 가로 이동 */
  function initWorkHorizontalScroll() {
    var WORK_END_EXTRA = 18;

    if (prefersReducedMotion) return;
    var section = document.querySelector(".work-section");
    var track = document.querySelector(".js-work-track");
    var viewport = document.querySelector(".work-section__viewport");
    if (!section || !track || !viewport) return;

    function viewportLeadInset() {
      var styles = getComputedStyle(viewport);
      var leftPad = parseFloat(styles.paddingLeft || "0");
      if (isNaN(leftPad)) leftPad = 0;
      return leftPad;
    }

    function maxShift() {
      // 마지막 카드가 완전히 보일 때까지 이동량 보정
      return Math.max(0, track.scrollWidth - viewport.offsetWidth + viewportLeadInset() + WORK_END_EXTRA);
    }

    function verticalScrollForPin() {
      var ms = maxShift();
      return ms > 0 ? ms : 400;
    }

    var trackTween = gsap.to(track, {
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

    gsap.fromTo(
      viewport,
      { x: 180 },
      {
        x: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 92%",
          end: "top 62%",
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      }
    );

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

  /** 마우스 오브: ypine 감성(심플/부드러운 추적), 감도는 약간 빠르게 */
  function initMouseOrbEffect() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

    var orb = document.getElementById("mouse-orb");
    var core = document.getElementById("mouse-orb-core");
    if (!orb || !core) return;

    document.body.classList.add("has-mouse-orb");

    function move(e) {
      var x = e.clientX;
      var y = e.clientY;
      // 실제 포인터와 체감 차이가 거의 없도록 즉시 동기화
      orb.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      core.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      document.body.classList.add("mouse-orb-active");
    }

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseenter", function () {
      document.body.classList.add("mouse-orb-active");
    });
    document.addEventListener("mouseleave", function () {
      document.body.classList.remove("mouse-orb-active");
      document.body.classList.remove("mouse-orb-hover");
    });

    document.addEventListener("mouseover", function (e) {
      var hit = e.target.closest(
        'a, button, [role="button"], summary, .site-menu__link, .work-card__link, .contact-section__mail-cta'
      );
      document.body.classList.toggle("mouse-orb-hover", !!hit);
    });
  }

  $(function () {
    var lenis = initLenis();

    initAOS();
    initMouseOrbEffect();
    initHeaderHeight();
    initSiteMenu();
    initHeaderLightTheme();
    initHeroTitleFadeUp();
    initHeroPointerParallax();
    initHeroScroll();
    initSkillBridgeParallax();
    initWorkHorizontalScroll();
    initSmoothScrollSections();
    initSectionTitleCharAnimations();
    initSkillRowsRise();
    initSkillProgressBars();
    initContactAnimations();
    initSubtleContentReveals();
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
        if (id === "#home") {
          e.preventDefault();
          lenis.scrollTo(0, {
            offset: 0,
            duration: 1.05,
          });
          return;
        }
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {
          offset: getHeaderScrollOffset(),
          duration: 1.15,
        });
      });
    }
  });
})(jQuery);
