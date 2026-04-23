(function ($) {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function refreshScrollTriggersHard() {
    if (typeof ScrollTrigger === "undefined") return;
    if (typeof ScrollTrigger.getAll === "function" && ScrollTrigger.getAll().length === 0) return;
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

    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }

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

  function createInviewObserver(targets, options, onChange) {
    if (!window.IntersectionObserver) return null;
    var list = Array.isArray(targets) ? targets.filter(Boolean) : [targets].filter(Boolean);
    if (!list.length) return null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        onChange(entry);
      });
    }, options || {});
    list.forEach(function (el) {
      io.observe(el);
    });
    return io;
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
    var root = $root[0];
    var panel1 = root.querySelector(".hero-panel--1");
    var panel2 = root.querySelector(".hero-panel--2");
    var photo = root.querySelector(".hero-about__photo.hero-reveal");
    var title = root.querySelector(".hero-about__title.hero-reveal");
    var body = root.querySelector(".hero-about__body.hero-reveal");
    var tags = root.querySelector(".hero-about__tags.hero-reveal");
    if (!panel1 || !panel2) return;

    function clearHeroProps() {
      gsap.set([panel1, panel2, photo, title, body, tags].filter(Boolean), { clearProps: "all" });
    }

    // 스크롤 기반 패널 전환을 완전히 비활성화하고 순차 레이아웃으로 표시
    root.classList.add("hero-pinned--static");
    clearHeroProps();
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

  /**
   * Hero 패널 1: codepen.html과 동일 — tgX/Y = clientX/Y(뷰포트 좌표), lerp로 부드럽게 추적.
   * 패널 밖으로 나가면 타깃을 패널 중앙의 화면 좌표로 되돌림.
   */
  function initHeroPanel1BlobInteractive() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

    var hero = document.querySelector(".hero-panel--1");
    var inter = document.querySelector(".js-hero-blob-interactive");
    if (!hero || !inter) return;

    var curX = 0;
    var curY = 0;
    var tgX = 0;
    var tgY = 0;
    var ease = 14;

    function heroCenterClient() {
      var r = hero.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      };
    }

    function syncNeutral() {
      var c = heroCenterClient();
      tgX = c.x;
      tgY = c.y;
      curX = c.x;
      curY = c.y;
    }

    syncNeutral();

    function tick() {
      curX += (tgX - curX) / ease;
      curY += (tgY - curY) / ease;
      inter.style.transform = "translate(" + Math.round(curX) + "px," + Math.round(curY) + "px)";
      requestAnimationFrame(tick);
    }

    function onMove(e) {
      tgX = e.clientX;
      tgY = e.clientY;
    }

    function onLeave() {
      var c = heroCenterClient();
      tgX = c.x;
      tgY = c.y;
    }

    hero.addEventListener("mousemove", onMove, { passive: true });
    hero.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener(
      "resize",
      function () {
        if (!hero.matches(":hover")) syncNeutral();
      },
      { passive: true }
    );

    requestAnimationFrame(tick);
  }

  function initSkillBridgeParallax() {
    var bridge = document.querySelector(".skill-bridge");
    var bg = document.querySelector(".skill-bridge__media .skill-bridge__bg");
    var copy = document.querySelector(".skill-bridge__copy");
    var line1 = document.querySelector(".js-skill-bridge-line1");
    var line2 = document.querySelector(".js-skill-bridge-line2");
    if (!bridge || !bg) return;

    gsap.set(bg, { clearProps: "transform,translate,rotate,scale" });

    if (prefersReducedMotion) {
      gsap.set([copy, line1, line2].filter(Boolean), { clearProps: "transform" });
      return;
    }

    gsap.set([copy, line1, line2].filter(Boolean), { force3D: true });

    if (copy) {
      gsap.set(copy, { y: 26 });
      var copyPlayed = false;
      createInviewObserver(
        bridge,
        { threshold: [0, 0.1, 0.3], rootMargin: "0px 0px -8% 0px" },
        function (entry) {
          if (entry.isIntersecting && !copyPlayed) {
            copyPlayed = true;
            gsap.to(copy, {
              y: -24,
              duration: 0.95,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
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
      gsap.set(line1, { x: 0 });
    }

    if (line2) {
      gsap.set(line2, { x: 0 });
    }

    var line1Target = 0;
    var line2Target = 0;
    var rafId = 0;
    var active = false;

    function clamp01(n) {
      return Math.max(0, Math.min(1, n));
    }

    function recalcTargets() {
      if (line1) {
        var line1Width = line1.getBoundingClientRect().width || 0;
        var line1Clip = getTwoCharClipPx(line1);
        line1Target = Math.max(0, window.innerWidth - line1Width + line1Clip);
      }
      if (line2) {
        var line2Width = line2.getBoundingClientRect().width || 0;
        var line2Clip = getTwoCharClipPx(line2);
        line2Target = -Math.max(0, window.innerWidth - line2Width + line2Clip);
      }
    }

    function updateLines() {
      rafId = 0;
      var rect = bridge.getBoundingClientRect();
      var startPx = window.innerHeight * 0.92;
      var endPx = -rect.height;
      var progress = clamp01((startPx - rect.top) / Math.max(1, startPx - endPx));
      if (line1) line1.style.transform = "translate3d(" + (line1Target * progress).toFixed(3) + "px,0,0)";
      if (line2) line2.style.transform = "translate3d(" + (line2Target * progress).toFixed(3) + "px,0,0)";
    }

    function requestLineUpdate() {
      if (!active) return;
      if (rafId) return;
      rafId = requestAnimationFrame(updateLines);
    }

    createInviewObserver(bridge, { threshold: [0, 0.01, 1] }, function (entry) {
      active = entry.isIntersecting;
      if (active) requestLineUpdate();
    });

    recalcTargets();
    window.addEventListener("resize", function () {
      recalcTargets();
      requestLineUpdate();
    });
    window.addEventListener("scroll", requestLineUpdate, { passive: true });
  }

  /**
   * 히어로/자기소개와 같이 scrub으로 부드럽게 등장 (Skill, Project, Contact)
   */
  function initSmoothScrollSections() {
    if (prefersReducedMotion) return;

    function bindInviewReveal(rootSel, childSel) {
      var root = document.querySelector(rootSel);
      if (!root) return;
      var targets = gsap.utils.toArray(root.querySelectorAll(childSel));
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y: 48 });

      var active = false;
      createInviewObserver(
        root,
        { threshold: [0, 0.18, 0.45], rootMargin: "0px 0px -14% 0px" },
        function (entry) {
          if (entry.isIntersecting && !active) {
            active = true;
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.75,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
        }
      );
    }

    bindInviewReveal(".skill-section", ".js-skill-head");
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

      createInviewObserver(
        group[0],
        { threshold: [0, 0.08, 0.2], rootMargin: "0px 0px -8% 0px" },
        function (entry) {
          if (!entry.isIntersecting) return;
          group.forEach(function (el) {
            el.classList.add("is-inview");
          });
        }
      );
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

      fill.style.transition = "width 1.2s cubic-bezier(.22,.61,.36,1)";
      var played = false;

      createInviewObserver(
        row,
        { threshold: [0, 0.12, 0.26], rootMargin: "0px 0px -8% 0px" },
        function (entry) {
          if (entry.isIntersecting) {
            if (played) return;
            played = true;
            requestAnimationFrame(function () {
              fill.style.width = level + "%";
            });
          }
        }
      );
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

      var triggerEl = typeof cfg.trigger === "string" ? document.querySelector(cfg.trigger) : cfg.trigger;
      if (!triggerEl) return;
      var wasInview = false;
      createInviewObserver(
        triggerEl,
        { threshold: [0, 0.12, 0.3], rootMargin: "0px 0px -10% 0px" },
        function (entry) {
          if (entry.isIntersecting && !wasInview) {
            wasInview = true;
            gsap.set(chars, { yPercent: 112, opacity: 0 });
            tl.restart();
            return;
          }
          if (!entry.isIntersecting) {
            if (cfg.onEnterBack === false && entry.boundingClientRect.top < 0) return;
            wasInview = false;
          }
        }
      );
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

    var tl = gsap.timeline({ paused: true });

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

    var entered = false;
    createInviewObserver(
      section,
      { threshold: [0, 0.18, 0.35], rootMargin: "0px 0px -16% 0px" },
      function (entry) {
        if (entry.isIntersecting && !entered) {
          entered = true;
          tl.restart();
          return;
        }
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
          entered = false;
          tl.pause(0);
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
        }
      }
    );
  }

  /** Contact 톤을 가져온 절제된 리빌 (Work intro / Footer) */
  function initSubtleContentReveals() {
    if (prefersReducedMotion) return;

    var footerTitles = gsap.utils.toArray(".site-footer__label, .site-footer__madeby");
    var footerBodies = gsap.utils.toArray(".site-footer__link, .site-footer__copy");
    if (footerTitles.length || footerBodies.length) {
      gsap.set(footerTitles, { y: 28, opacity: 0 });
      gsap.set(footerBodies, { y: 28, opacity: 0 });

      var footerTl = gsap.timeline({ paused: true });

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

      var footer = document.querySelector(".site-footer");
      if (!footer) return;
      var entered = false;
      createInviewObserver(
        footer,
        { threshold: [0, 0.1, 0.24], rootMargin: "0px 0px -6% 0px" },
        function (entry) {
          if (entry.isIntersecting && !entered) {
            entered = true;
            footerTl.restart();
            return;
          }
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            entered = false;
            footerTl.pause(0);
            gsap.set(footerTitles, { y: 28, opacity: 0 });
            gsap.set(footerBodies, { y: 28, opacity: 0 });
          }
        }
      );
    }
  }

  /** Work: 세로 스크롤 시 섹션 핀 + 카드 트랙 가로 이동 */
  function initWorkHorizontalScroll() {
    var WORK_END_EXTRA = 18;
    var WORK_PIN_LEAD_HOLD = 260;
    var WORK_PIN_TAIL_HOLD = 340;

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

    section.classList.remove("work-section--native-pin");
    section.style.removeProperty("--work-scroll-span");
    track.style.removeProperty("transform");
    viewport.style.removeProperty("transform");

    function verticalScrollForPin() {
      var ms = maxShift();
      return (ms > 0 ? ms : 400) + WORK_PIN_LEAD_HOLD + WORK_PIN_TAIL_HOLD;
    }

    var trackTl = gsap.timeline({
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

    trackTl
      .to(track, {
        x: 0,
        duration: WORK_PIN_LEAD_HOLD,
        ease: "none",
      })
      .to(track, {
        x: function () {
          return -maxShift();
        },
        duration: function () {
          return Math.max(1, maxShift());
        },
        ease: "none",
      })
      .to(track, {
        x: function () {
          return -maxShift();
        },
        duration: WORK_PIN_TAIL_HOLD,
        ease: "none",
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

  /** 히어로 패널 1: 마우스 오브 difference가 타이포 색을 왜곡하지 않도록 body 클래스 전환 */
  function initHeroPanel1OrbContext() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;

    var panel = document.querySelector(".hero-panel--1");
    if (!panel) return;

    panel.addEventListener(
      "mouseenter",
      function () {
        document.body.classList.add("hero-panel-1--hover");
      },
      { passive: true }
    );
    panel.addEventListener(
      "mouseleave",
      function () {
        document.body.classList.remove("hero-panel-1--hover");
      },
      { passive: true }
    );
  }

  $(function () {
    var lenis = initLenis();

    initAOS();
    initMouseOrbEffect();
    initHeroPanel1OrbContext();
    initHeaderHeight();
    initSiteMenu();
    initHeaderLightTheme();
    initHeroTitleFadeUp();
    initHeroPanel1BlobInteractive();
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
