(function () {
  "use strict";

  var WORKS = [
    {
      id: "ai",
      title: "AI",
      lead: "AI로 만든 브랜드 이미지입니다. 인스타그램 업로드를 위해 제작했으며, 계정 확인이 가능합니다.",
      works: [
        {
          title: "인스타그램",
          summary: "프로필은 왼쪽에 고정하고, 피드는 오른쪽에서 펼칩니다.",
          layout: "instagram",
          link: "https://www.instagram.com/fotton_style/",
          linkLabel: "피드 바로가기",
          profile: { src: "AI/AI_인스타그램.webp", alt: "인스타그램 프로필" },
          feeds: [
            { title: "피드 01", theme: "테일러링 · 요트 · 바다", images: feedShots(["1-1", "1-2", "1-3", "2-1", "2-2", "2-3", "3-1", "3-2", "3-3"]) },
            { title: "피드 02", theme: "리넨 · 테니스 · 아틀리에", images: feedShots(["4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "5-1", "5-2", "5-3"]) },
            { title: "피드 03", theme: "시티 · 스트리트 · 트래블", images: feedShots(["5-4", "6-1", "6-2", "6-3", "6-4", "7-1", "7-2", "7-3", "7-4", "7-5"]) },
          ],
        },
        {
          title: "원단",
          layout: "split",
          link: "https://www.instagram.com/fottongarment/",
          linkLabel: "원단 바로가기",
          groups: [
            {
              title: "Loro Piana",
              layout: "triple",
              lead: [fabricThumb(1), fabricThumb(2)],
              images: fabricRange(1, 3),
            },
            {
              title: "Scabal",
              layout: "triple",
              lead: [fabricThumb(3), fabricReel()],
              images: fabricRange(4, 6),
            },
          ],
        },
      ],
    },
    {
      id: "image",
      title: "GRAPHIC IMAGES",
      lead: "실제 작업한 그래픽 작업물들을 모아둔 항목입니다.",
      works: [
        {
          title: "배너",
          layout: "pair",
          images: [graphic("이미지_배너1.webp", "배너 1"), graphic("이미지_배너2.webp", "배너 2")],
        },
        {
          title: "프로모션",
          groups: [
            {
              title: "프로모션",
              wide: [graphic("이미지_프로모션3.webp", "프로모션 3")],
              images: [1, 2, 4].map(function (n) {
                return graphic("이미지_프로모션" + n + ".webp", "프로모션 " + n);
              }),
            },
            {
              title: "가격표",
              images: [
                graphic("이미지_프로모션가격표.webp", "프로모션 가격표"),
                graphic("이미지_패키지가격표.webp", "패키지 가격표"),
              ],
            },
            {
              title: "문자/이벤트 이미지",
              images: [
                graphic("이미지_문자용.webp", "문자용 이미지"),
                graphic("이미지_플래너시상.webp", "플래너 시상"),
              ],
            },
          ],
        },
        {
          title: "추석 휴무 피드",
          layout: "feed",
          images: [
            graphic("이미지_피드추석휴무1.webp", "추석 휴무 피드 1"),
            graphic("이미지_피드추석휴무2.webp", "추석 휴무 피드 2"),
            graphic("이미지_피드추석휴무3.webp", "추석 휴무 피드 3"),
          ],
        },
        {
          title: "프로모션 수정",
          summary: "수정 전과 수정 후를 나눠 두었습니다.",
          compare: [
            {
              title: "수정 전",
              layout: "cards",
              images: [1, 2, 3, 4, 5].map(function (n) {
                return graphic("이미지_프로모션수정전" + n + ".webp", "프로모션 수정 전 " + n);
              }),
            },
            {
              title: "수정 후",
              layout: "cards",
              images: [1, 2, 3, 4, 5].map(function (n) {
                return graphic("이미지_프로모션수정후" + n + ".webp", "프로모션 수정 후 " + n);
              }),
            },
          ],
        },
      ],
    },
    {
      id: "personal",
      title: "PERSONAL",
      lead: "개인 작업물입니다. 그래픽 디자인, 포스터, 테마, 로고로 나눴습니다.",
      works: [
        {
          title: "그래픽 디자인",
          layout: "pair",
          images: [1, 2, 3].map(function (n) {
            return privateImg("header_" + n + ".webp", "그래픽 디자인 " + n);
          }),
        },
        {
          title: "포스터",
          layout: "portrait",
          images: [3, 4, 5, 6, 7].map(function (n) {
            return privateImg("poster_" + n + ".webp", "포스터 " + n);
          }),
        },
        {
          title: "테마",
          groups: [
            {
              title: "테마 01",
              theme: "편집 · 타이포 · 레이아웃",
              layout: "portrait",
              images: [1, 2].map(function (n) {
                return privateImg("theme1_" + n + ".webp", "테마 01-" + n);
              }),
            },
            {
              title: "테마 02",
              theme: "용 · 먹 · 구름",
              layout: "portrait",
              images: [1, 2, 3, 4].map(function (n) {
                return privateImg("theme2_" + n + ".webp", "테마 02-" + n);
              }),
            },
            {
              title: "테마 03",
              theme: "포스터 · 아포칼립스 · 무드",
              layout: "portrait",
              images: [1, 2, 3].map(function (n) {
                return privateImg("theme3_" + n + ".webp", "테마 03-" + n);
              }),
            },
          ],
        },
        {
          title: "로고",
          layout: "portrait",
          images: [
            logoImg("logo_1.webp", "로고 1"),
            logoImg("logo_2.webp", "로고 2"),
            Object.assign(logoImg("logo-company-2.webp", "로고 3"), { inset: true }),
          ],
        },
      ],
    },
    {
      id: "print",
      title: "PRINT",
      lead: "인쇄용으로 구성한 작업입니다.",
      works: [
        {
          title: "박람회 부채",
          layout: "wide",
          images: [{ src: "print/인쇄물_박람회부채.webp", alt: "박람회 부채" }],
        },
        {
          title: "CD",
          layout: "pair",
          images: [{ src: "print/인쇄물_cd1.webp", alt: "CD 1" }],
        },
        {
          title: "폰케이스",
          layout: "pair",
          images: [
            { src: "print/인쇄물_폰케이스1.webp", alt: "폰케이스 1" },
            { src: "print/인쇄물_폰케이스2.webp", alt: "폰케이스 2" },
          ],
        },
      ],
    },
    {
      id: "publishing-design",
      title: "PUBLISH",
      lead: "웹 화면에 쓰는 배너와 사이즈표입니다. 구현 확인이 가능합니다.",
      works: [
        {
          title: "홈페이지 배너",
          layout: "wide",
          link: "https://www.fottongarment.co.kr/",
          linkLabel: "홈페이지 바로가기",
          images: [{ src: "publishing/퍼블리싱_1홈페이지배너.webp", alt: "홈페이지 배너" }],
        },
        {
          title: "사이즈표",
          layout: "wide",
          link: "https://www.fottongarment.co.kr/product/list_rental.html?cate_no=84",
          linkLabel: "사이즈표 바로가기",
          images: [{ src: "publishing/퍼블리싱_사이즈표.webp", alt: "사이즈표" }],
        },
      ],
    },
    {
      id: "survey",
      title: "SURVEY",
      lead: "여러 사이트를 비교·분석 후 제작한 설문조사입니다.",
      link: "https://fottongarment.fillout.com/t/nTmRkraTPFus",
      linkLabel: "설문 바로가기",
      works: [
        {
          title: "사이트 분석",
          layout: "wide",
          images: [{ src: "survey/설문조사_1사이트분석.webp", alt: "설문 사이트 분석" }],
        },
        {
          title: "메인",
          layout: "wide",
          images: [
            { src: "survey/설문조사_2메인.webp", alt: "설문 메인" },
            { src: "survey/설문조사_3항목.webp", alt: "설문 항목" },
          ],
        },
      ],
    },
  ];

  function graphic(file, alt) {
    return { src: "design_img/" + file, alt: alt };
  }

  function privateImg(file, alt) {
    return { src: "design_img/private/" + file, alt: alt };
  }

  function logoImg(file, alt) {
    return { src: "logo/" + file, alt: alt };
  }

  function feedShots(names) {
    return names.map(function (name) {
      return { src: "AI/" + name + ".webp", alt: "인스타그램 " + name };
    });
  }

  function fabricThumb(n) {
    return { src: "AI/원단/AI_원단썸네일" + n + ".webp", alt: "원단 썸네일 " + n };
  }

  function fabricReel() {
    return { src: "AI/원단/AI_릴스썸네일.webp", alt: "원단 릴스 썸네일" };
  }

  function fabricRange(from, to) {
    var images = [];
    var n;
    var i;
    for (n = from; n <= to; n += 1) {
      for (i = 1; i <= 3; i += 1) {
        images.push({ src: "AI/원단/AI_원단" + n + "_" + i + ".webp", alt: "원단 " + n + "-" + i });
      }
    }
    return images;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function countWorks() {
    return WORKS.reduce(function (sum, purpose) {
      return sum + purpose.works.length;
    }, 0);
  }

  function imageButton(image, groupId, index) {
    return (
      '<button type="button" class="design-shot' +
      (image.inset ? " design-shot--inset" : "") +
      '" data-group="' +
      esc(groupId) +
      '" data-index="' +
      index +
      '">' +
      '<img src="' +
      esc(image.src) +
      '" alt="' +
      esc(image.alt) +
      '" loading="lazy" decoding="async" />' +
      "</button>"
    );
  }

  function gridHtml(group, groupId) {
    return (
      '<div class="design-grid design-grid--' +
      esc(group.layout || "cards") +
      '">' +
      group.images
        .map(function (image, index) {
          return imageButton(image, groupId, index);
        })
        .join("") +
      "</div>"
    );
  }

  function orientedHtml(group, groupId) {
    var wide = group.wide || [];
    var images = group.images || [];
    var html = "";

    if (group.lead) {
      html +=
        '<div class="design-grid design-grid--lead">' +
        group.lead
          .map(function (image, index) {
            return imageButton(image, groupId + "-lead", index);
          })
          .join("") +
        "</div>";
    }

    if (wide.length) {
      html +=
        '<div class="design-grid design-grid--' +
        (wide.length > 1 ? "pair" : "wide") +
        '">' +
        wide
          .map(function (image, index) {
            return imageButton(image, groupId + "-wide", index);
          })
          .join("") +
        "</div>";
    }

    if (images.length) {
      html += gridHtml({ layout: group.layout || "portrait", images: images }, groupId);
    }

    return html;
  }

  function groupHtml(group, groupId) {
    var count = (group.lead || []).length + (group.wide || []).length + (group.images || []).length;

    if (!group.title) {
      return '<div class="design-group">' + orientedHtml(group, groupId) + "</div>";
    }

    return (
      '<details class="design-fold design-group">' +
      '<summary class="design-fold__summary">' +
      '<span class="design-feed__label">' +
      '<span class="design-group__title">' +
      esc(group.title) +
      "</span>" +
      (group.theme ? '<span class="design-feed__theme">' + esc(group.theme) + "</span>" : "") +
      "</span>" +
      (group.theme
        ? ""
        : '<span class="design-fold__count">' + count + "</span>") +
      "</summary>" +
      '<div class="design-fold__body">' +
      orientedHtml(group, groupId) +
      "</div>" +
      "</details>"
    );
  }

  function instagramHtml(work, groupId) {
    return (
      '<article class="design-ig">' +
      '<div class="design-ig__profile">' +
      imageButton(work.profile, groupId + "-profile", 0) +
      "</div>" +
      '<div class="design-ig__feeds">' +
      work.feeds
        .map(function (feed, index) {
          return (
            '<details class="design-fold design-ig__feed">' +
            '<summary class="design-fold__summary">' +
            '<span class="design-feed__label">' +
            '<span class="design-group__title">' +
            esc(feed.title) +
            "</span>" +
            (feed.theme ? '<span class="design-feed__theme">' + esc(feed.theme) + "</span>" : "") +
            "</span>" +
            "</summary>" +
            '<div class="design-fold__body">' +
            gridHtml({ layout: "feed", images: feed.images }, groupId + "-feed-" + index) +
            "</div>" +
            "</details>"
          );
        })
        .join("") +
      "</div>" +
      "</article>"
    );
  }

  function externalLinkHtml(href, label) {
    return (
      '<p class="design-purpose__link-wrap"><a class="design-purpose__link" href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(label || "바로가기") +
      '<svg class="design-purpose__link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 5h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</a></p>"
    );
  }

  function workHtml(work, purposeId, workIndex) {
    var groupId = purposeId + "-" + workIndex;

    if (work.layout === "instagram") {
      return (
        (work.link ? externalLinkHtml(work.link, work.linkLabel) : "") +
        instagramHtml(work, groupId)
      );
    }

    var body = "";

    if (work.compare) {
      body =
        '<div class="design-compare">' +
        work.compare
          .map(function (side, index) {
            return (
              '<div class="design-compare__side">' +
              '<p class="design-compare__label">' +
              esc(side.title) +
              "</p>" +
              gridHtml(side, groupId + "-" + index) +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    } else if (work.groups) {
      body = work.groups
        .map(function (group, index) {
          return groupHtml(group, groupId + "-" + index);
        })
        .join("");
      if (work.layout === "split") {
        body = '<div class="design-split">' + body + "</div>";
      }
    } else {
      body = gridHtml(work, groupId);
    }

    return (
      '<details class="design-fold design-work">' +
      '<summary class="design-fold__summary">' +
      "<span class=\"design-work__title\">" +
      esc(work.title) +
      "</span>" +
      (work.summary ? '<span class="design-work__summary">' + esc(work.summary) + "</span>" : "") +
      "</summary>" +
      '<div class="design-fold__body">' +
      (work.link ? externalLinkHtml(work.link, work.linkLabel) : "") +
      body +
      "</div>" +
      "</details>"
    );
  }

  function render(root) {
    var count = document.querySelector("[data-work-count]");
    if (count) count.textContent = String(countWorks());

    var nav = document.querySelector("[data-design-nav]");
    if (nav) {
      nav.innerHTML = WORKS.map(function (purpose) {
        return (
          '<a class="archive-switch__link" href="#' +
          esc(purpose.id) +
          '">' +
          esc(purpose.title) +
          "</a>"
        );
      }).join("");

      nav.addEventListener("click", function (event) {
        var link = event.target.closest("a[href^='#']");
        if (!link) return;
        var target = document.getElementById(link.getAttribute("href").slice(1));
        if (target && target.tagName === "DETAILS") target.open = true;
      });
    }

    root.innerHTML = WORKS.map(function (purpose) {
      return (
        '<details class="design-fold design-purpose" id="' +
        esc(purpose.id) +
        '">' +
        '<summary class="design-fold__summary design-purpose__head">' +
        "<span class=\"design-purpose__title\">" +
        esc(purpose.title) +
        "</span>" +
        '<span class="design-purpose__lead">' +
        esc(purpose.lead) +
        "</span>" +
        "</summary>" +
        '<div class="design-fold__body">' +
        (purpose.link ? externalLinkHtml(purpose.link, purpose.linkLabel) : "") +
        purpose.works
          .map(function (work, index) {
            return workHtml(work, purpose.id, index);
          })
          .join("") +
        "</div>" +
        "</details>"
      );
    }).join("");
  }

  function collectGroup(groupId) {
    return Array.prototype.slice.call(
      document.querySelectorAll('.design-shot[data-group="' + groupId + '"]')
    );
  }

  function initLightbox() {
    var dialog = document.querySelector("[data-design-lightbox]");
    if (!dialog) return;

    var figure = dialog.querySelector("[data-lightbox-image]");
    var caption = dialog.querySelector("[data-lightbox-caption]");
    var current = [];
    var index = 0;

    function show(nextIndex) {
      if (!current.length) return;
      index = (nextIndex + current.length) % current.length;
      var button = current[index];
      var img = button.querySelector("img");
      figure.src = img.getAttribute("src");
      figure.alt = img.getAttribute("alt") || "";
      caption.textContent = figure.alt;
    }

    function open(button) {
      current = collectGroup(button.getAttribute("data-group"));
      index = current.indexOf(button);
      if (index < 0) index = 0;
      show(index);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    function close() {
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else dialog.removeAttribute("open");
    }

    document.addEventListener("click", function (event) {
      var shot = event.target.closest(".design-shot");
      if (shot) {
        open(shot);
        return;
      }
      if (event.target.closest("[data-lightbox-close]")) close();
      if (event.target.closest("[data-lightbox-prev]")) show(index - 1);
      if (event.target.closest("[data-lightbox-next]")) show(index + 1);
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close();
    });

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      close();
    });

    document.addEventListener("keydown", function (event) {
      if (!dialog.open) return;
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
  }

  var root = document.querySelector("[data-design-gallery]");
  if (!root) return;
  render(root);
  initLightbox();
})();
