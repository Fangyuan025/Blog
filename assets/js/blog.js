/*
 * Blog index module (runs on the main page only)
 * ----------------------------------------------------------------
 *  - Loads posts/posts.json
 *  - Renders a post-cards grid into #blog-index
 *  - Cards link out to post.html?slug=<slug> for a dedicated reading page
 *  - Re-renders in the active language via window.__blogRefresh() hook,
 *    which main.js invokes when the user toggles EN / FR
 */
(function () {
  var indexEl = document.getElementById("blog-index");
  if (!indexEl) return;

  var manifest = null;
  var manifestPromise = null;

  function getLang() {
    return (document.documentElement.lang === "fr") ? "fr" : "en";
  }

  function t(key, fallback) {
    var lang = getLang();
    var dict = window.__translations;
    if (dict && dict[lang] && dict[lang][key]) return dict[lang][key];
    return fallback;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso + "T12:00:00");
      var lang = getLang() === "fr" ? "fr-FR" : "en-US";
      return d.toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  function loadManifest() {
    if (manifest) return Promise.resolve(manifest);
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch("posts/posts.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("posts.json " + r.status);
        return r.json();
      })
      .then(function (data) {
        manifest = data;
        return data;
      })
      .catch(function (err) {
        manifestPromise = null;
        throw err;
      });
    return manifestPromise;
  }

  function renderIndex() {
    loadManifest().then(function (data) {
      var lang = getLang();
      var posts = (data.posts || []).slice().sort(function (a, b) {
        return (b.date || "").localeCompare(a.date || "");
      });

      if (!posts.length) {
        indexEl.innerHTML =
          '<p class="blog-empty">' +
          escapeHtml(t("blog_empty", "No posts yet. Check back soon.")) +
          "</p>";
        return;
      }

      var readLabel = t("blog_read_more", "Read post →");
      var minutesLabel = t("blog_minutes_read", "min read");

      indexEl.innerHTML = posts
        .map(function (p) {
          var title = p["title_" + lang] || p.title_en;
          var excerpt = p["excerpt_" + lang] || p.excerpt_en || "";
          var tags = p["tags_" + lang] || p.tags_en || [];
          var tagHtml = tags
            .map(function (tg) {
              return '<span class="blog-tag">' + escapeHtml(tg) + "</span>";
            })
            .join("");
          var minutes = p.reading_minutes
            ? '<span class="blog-card-dot">·</span><span>' +
              p.reading_minutes +
              " " +
              escapeHtml(minutesLabel) +
              "</span>"
            : "";
          var cover = p.cover
            ? '<div class="blog-card-cover" style="background-image:url(\'' +
              p.cover +
              "')\"></div>"
            : "";
          return (
            '<a class="blog-card" href="post.html#' +
            encodeURIComponent(p.slug) +
            '">' +
            cover +
            '<div class="blog-card-body">' +
            '<div class="blog-card-meta">' +
            "<span>" +
            escapeHtml(formatDate(p.date)) +
            "</span>" +
            minutes +
            "</div>" +
            "<h3>" +
            escapeHtml(title) +
            "</h3>" +
            '<p class="blog-card-excerpt">' +
            escapeHtml(excerpt) +
            "</p>" +
            '<div class="blog-tags">' +
            tagHtml +
            "</div>" +
            '<span class="blog-card-cta">' +
            escapeHtml(readLabel) +
            "</span>" +
            "</div>" +
            "</a>"
          );
        })
        .join("");
    }).catch(function (err) {
      indexEl.innerHTML =
        '<p class="blog-empty">Could not load posts: ' +
        escapeHtml(err.message) +
        "</p>";
    });
  }

  renderIndex();

  // Let main.js trigger a redraw when the language changes
  window.__blogRefresh = renderIndex;
})();
