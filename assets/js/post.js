/*
 * Post page script
 * ----------------------------------------------------------------
 *  - Runs on post.html
 *  - Reads ?slug=<slug> from the URL
 *  - Fetches posts/<slug>.<lang>.md and renders it into #blog-article-body
 *  - Handles the shared language toggle, mobile menu, slime mascot,
 *    and data-i18n re-translation using assets/i18n.json
 */
(function () {
  var LANG_KEY = "site_lang";
  var currentLang =
    (function () {
      try { return localStorage.getItem(LANG_KEY) || "en"; } catch (e) { return "en"; }
    })();

  var translations = null;
  var mdCache = {};
  var slug = null;
  var articleBody = document.getElementById("blog-article-body");

  // ---------- i18n ----------

  function applyTranslations() {
    if (!translations) return;
    var dict = translations[currentLang] || translations.en;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.innerHTML = dict[key];
    });
    document.documentElement.lang = currentLang;
    document.title =
      (currentLang === "fr" ? "Blog · " : "Blog · ") + "Fangyuan Lin";
  }

  function loadTranslations() {
    return fetch("assets/i18n.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        translations = data;
        window.__translations = data;
        applyTranslations();
      });
  }

  // ---------- language toggle ----------

  var langToggle = document.getElementById("language-toggle");
  if (langToggle) {
    langToggle.textContent = currentLang === "en" ? "FR" : "EN";
    langToggle.addEventListener("click", function (e) {
      e.preventDefault();
      currentLang = currentLang === "en" ? "fr" : "en";
      try { localStorage.setItem(LANG_KEY, currentLang); } catch (err) {}
      langToggle.textContent = currentLang === "en" ? "FR" : "EN";
      applyTranslations();
      if (slug) renderArticle(slug);
    });
  }

  // ---------- article render ----------

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fetchMarkdown(slug, lang) {
    var key = slug + "|" + lang;
    if (mdCache[key]) return Promise.resolve(mdCache[key]);
    var url = "posts/" + encodeURIComponent(slug) + "." + lang + ".md";
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) {
        if (lang !== "en") return fetchMarkdown(slug, "en");
        throw new Error("Post not found: " + slug);
      }
      return r.text().then(function (txt) {
        mdCache[key] = txt;
        return txt;
      });
    });
  }

  function enhanceArticle(container) {
    // External links open in a new tab
    container.querySelectorAll("a[href^='http']").forEach(function (a) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });

    // YouTube embeds
    container.querySelectorAll(".youtube-embed[data-youtube-id]").forEach(function (node) {
      var id = node.getAttribute("data-youtube-id");
      if (!id) return;
      node.innerHTML =
        '<div class="youtube-frame">' +
        '<iframe src="https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(id) +
        '" title="YouTube video" frameborder="0" ' +
        'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        'allowfullscreen loading="lazy"></iframe></div>';
    });

    // News-style pull-quotes.
    // Markdown convention:
    //     > Body text of the quote.
    //     > — Source, [link](url)
    // marked renders this as a blockquote containing one <p> whose HTML
    // looks like: "Body text...\n— Source, <a>link</a>" (single newline
    // because we run marked with breaks:false). We split on the LAST
    // newline-followed-by-em-dash to separate body from attribution.
    var EM_DASH_RE = /(\r?\n)(—|&mdash;|&#8212;|-)\s/;
    container.querySelectorAll("blockquote").forEach(function (bq) {
      // Two-paragraph form: <p>body</p><p>— source</p>
      var ps = bq.querySelectorAll(":scope > p");
      if (ps.length >= 2) {
        var last = ps[ps.length - 1];
        var lastText = last.textContent.trim();
        if (/^(—|-\s)/.test(lastText)) {
          bq.classList.add("news-quote");
          // Merge previous paragraphs into a body span, wrap last as source
          var bodyHtml = Array.prototype.slice
            .call(ps, 0, ps.length - 1)
            .map(function (p) { return p.innerHTML; })
            .join("<br>");
          var newP = document.createElement("p");
          newP.innerHTML =
            '<span class="news-quote-body">' + bodyHtml + "</span>" +
            '<span class="news-quote-source">' + last.innerHTML + "</span>";
          while (bq.firstChild) bq.removeChild(bq.firstChild);
          bq.appendChild(newP);
          return;
        }
      }
      // Single-paragraph form with embedded newline + em-dash
      var p = bq.querySelector("p");
      if (!p) return;
      var html = p.innerHTML;
      var m = html.match(EM_DASH_RE);
      if (!m) return;
      var idx = html.lastIndexOf(m[0]);
      var body = html.slice(0, idx);
      var srcLine = html.slice(idx + m[1].length).trim();
      if (!/^(—|&mdash;|&#8212;|-\s)/.test(srcLine)) return;
      bq.classList.add("news-quote");
      p.innerHTML =
        '<span class="news-quote-body">' + body + "</span>" +
        '<span class="news-quote-source">' + srcLine + "</span>";
    });
  }

  function renderArticle(targetSlug) {
    slug = targetSlug;
    articleBody.innerHTML =
      '<p class="blog-empty">' +
      escapeHtml(
        translations && translations[currentLang] && translations[currentLang].blog_loading
          ? translations[currentLang].blog_loading
          : "Loading…"
      ) +
      "</p>";

    fetchMarkdown(targetSlug, currentLang)
      .then(function (md) {
        if (!window.marked) {
          articleBody.innerHTML =
            '<p class="blog-empty">Markdown renderer failed to load.</p>';
          return;
        }
        if (window.marked.setOptions) {
          window.marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });
        }
        articleBody.innerHTML = window.marked.parse(md);
        enhanceArticle(articleBody);
        window.scrollTo({ top: 0, behavior: "instant" });
      })
      .catch(function (err) {
        articleBody.innerHTML =
          '<p class="blog-empty">Could not load post: ' +
          escapeHtml(err.message) +
          "</p>";
      });
  }

  // ---------- slime mascot ----------
  (function initMascot() {
    var mascot = document.getElementById("slime-mascot");
    if (!mascot) return;
    var slimePhrases = ["BLORP! ↑", "BOING! ↑", "WHEEE ↑", "HUP! ↑", "SPLAT ↑"];
    var msgLabel = mascot.querySelector(".slime-mascot-msg");
    function update() {
      if (window.scrollY < 200) mascot.classList.add("is-hidden");
      else mascot.classList.remove("is-hidden");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    mascot.addEventListener("click", function () {
      if (mascot.classList.contains("hit")) return;
      if (msgLabel) msgLabel.textContent = slimePhrases[Math.floor(Math.random() * slimePhrases.length)];
      mascot.classList.add("hit");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(function () { mascot.classList.remove("hit"); }, 1100);
    });
  })();

  // ---------- mobile menu ----------
  (function initMobileMenu() {
    var btn = document.getElementById("mobile-menu");
    var links = document.querySelector(".nav-links");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      links.classList.toggle("active");
    });
  })();

  // ---------- boot ----------
  // Slug is passed as the URL hash (post.html#<slug>). Hash works with both
  // `serve`'s clean-URL rewrites and GitHub Pages, unlike query strings which
  // some static hosts strip during extension-less redirects. Falls back to
  // ?slug= for backward compatibility with any older links.
  function getSlugFromUrl() {
    var h = (window.location.hash || "").replace(/^#/, "").trim();
    if (h) return decodeURIComponent(h);
    var params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  var urlSlug = getSlugFromUrl();
  if (!urlSlug) {
    articleBody.innerHTML =
      '<p class="blog-empty">No post selected. <a href="index.html#blog">Browse all posts →</a></p>';
  }

  // If the user navigates between posts by changing the hash, re-render
  window.addEventListener("hashchange", function () {
    var s = getSlugFromUrl();
    if (s) renderArticle(s);
  });

  loadTranslations().then(function () {
    if (urlSlug) renderArticle(urlSlug);
  });
})();
