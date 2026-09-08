(function () {
  "use strict";

  function rootPrefix() {
    return document.body.getAttribute("data-root") || "";
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function categoryLabel(category) {
    return category === "design" ? "Design" : "Publishing";
  }

  function mediaHtml(work, prefix) {
    if (work.media === "logo") {
      return (
        '<div class="work-card__brand-logo ' +
        esc(work.logoClass || "") +
        '" aria-hidden="true">' +
        esc(work.logoText || work.title) +
        "</div>"
      );
    }

    return (
      '<img src="' +
      esc(prefix + work.image) +
      '" alt="' +
      esc(work.imageAlt || work.title) +
      '" loading="lazy" decoding="async" class="work-card__brand-image work-card__brand-image--company" />'
    );
  }

  function tagsHtml(tags, className) {
    return (tags || [])
      .map(function (tag) {
        return "<li>" + esc(tag) + "</li>";
      })
      .join("");
  }

  function featuredCard(work, prefix) {
    return (
      '<article class="work-card ' +
      esc(work.shape || "work-card--sq") +
      " " +
      esc(work.brandClass || "") +
      '">' +
      '<a class="work-card__link" href="' +
      esc(prefix + work.href) +
      '" aria-label="' +
      esc(work.title) +
      ' 작업 상세 보기">' +
      '<div class="work-card__media">' +
      mediaHtml(work, prefix) +
      "</div>" +
      '<div class="work-card__overlay">' +
      '<p class="work-card__badge">' +
      categoryLabel(work.category) +
      "</p>" +
      "<h3 class=\"work-card__title\">" +
      esc(work.title) +
      "</h3>" +
      '<ul class="work-card__tags">' +
      tagsHtml(work.tags) +
      "</ul>" +
      '<span class="work-card__cta">View more</span>' +
      "</div>" +
      "</a>" +
      "</article>"
    );
  }

  function externalAction(href, label) {
    if (!href) return "";
    return (
      '<a class="archive-card__action" href="' +
      esc(href) +
      '" target="_blank" rel="noopener noreferrer">' +
      esc(label) +
      "</a>"
    );
  }

  function archiveCard(work, prefix) {
    var href = prefix + work.href;
    var actions = externalAction(work.live, "Live") + externalAction(work.figma, "Figma");

    return (
      '<article class="archive-card ' +
      esc(work.brandClass || "") +
      '">' +
      '<a class="archive-card__link" href="' +
      esc(href) +
      '">' +
      '<div class="archive-card__media">' +
      mediaHtml(work, prefix) +
      "</div>" +
      '<div class="archive-card__copy">' +
      "<h2 class=\"archive-card__title\">" +
      esc(work.title) +
      "</h2>" +
      '<p class="archive-card__summary">' +
      esc(work.summary) +
      "</p>" +
      '<ul class="archive-card__tags">' +
      tagsHtml(work.tags) +
      "</ul>" +
      "</div>" +
      "</a>" +
      '<div class="archive-card__foot">' +
      '<a class="archive-card__cta" href="' +
      esc(href) +
      '">View more</a>' +
      (actions ? '<div class="archive-card__actions">' + actions + "</div>" : "") +
      "</div>" +
      "</article>"
    );
  }

  function render() {
    var prefix = rootPrefix();
    var list = window.PORTFOLIO_WORKS || [];
    var track = document.querySelector("[data-work-render='featured']");

    if (track) {
      track.innerHTML = list
        .filter(function (work) {
          return work.featured;
        })
        .sort(function (a, b) {
          return (a.homeOrder || 99) - (b.homeOrder || 99);
        })
        .map(function (work) {
          return featuredCard(work, prefix);
        })
        .join("");
    }

    var archive = document.querySelector("[data-work-archive]");
    if (!archive) return;

    var category = archive.getAttribute("data-work-archive");
    var filtered = list
      .filter(function (work) {
        return work.category === category;
      })
      .sort(function (a, b) {
        return (a.listOrder || a.homeOrder || 99) - (b.listOrder || b.homeOrder || 99);
      });
    var count = document.querySelector("[data-work-count]");

    if (count) count.textContent = String(filtered.length);

    if (!filtered.length) {
      archive.innerHTML = '<p class="archive-empty">아직 등록된 작업이 없습니다.</p>';
      return;
    }

    archive.innerHTML = filtered
      .map(function (work) {
        return archiveCard(work, prefix);
      })
      .join("");
  }

  render();
})();
