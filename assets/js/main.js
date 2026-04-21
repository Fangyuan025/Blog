document.addEventListener("DOMContentLoaded", function () {
  // ===== i18n System =====
  // Persist language across pages (post.html uses the same key)
  const LANG_KEY = "site_lang";
  let currentLang = (function () {
    try {
      const v = localStorage.getItem(LANG_KEY);
      return v === "fr" || v === "en" ? v : "en";
    } catch (e) {
      return "en";
    }
  })();
  let translations = null;

  async function loadTranslations() {
    if (!translations) {
      const res = await fetch("assets/i18n.json");
      translations = await res.json();
      window.__translations = translations;
    }
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (translations[currentLang] && translations[currentLang][key]) {
        el.innerHTML = translations[currentLang][key];
      }
    });
    // Re-run typewriter with new language text
    restartTypewriter();
    // Replay chat streaming with new language
    if (chatStreamFn) chatStreamFn();
    // Ask the blog module to redraw cards + active article in the new language
    if (typeof window.__blogRefresh === "function") {
      window.__blogRefresh();
    }
  }

  // Forward declaration so loadTranslations can trigger re-stream on language change
  var chatStreamFn = null;

  var langToggle = document.getElementById("language-toggle");
  if (langToggle) {
    // Reflect the persisted language on the toggle label at init
    langToggle.textContent = currentLang === "en" ? "FR" : "EN";
    document.documentElement.lang = currentLang;
    langToggle.addEventListener("click", function (e) {
      e.preventDefault();
      currentLang = currentLang === "en" ? "fr" : "en";
      try { localStorage.setItem(LANG_KEY, currentLang); } catch (err) {}
      langToggle.textContent = currentLang === "en" ? "FR" : "EN";
      document.documentElement.lang = currentLang;
      loadTranslations();
    });
  }

  // Pre-load translations so they're ready when toggled. If the persisted
  // language is not the page's hard-coded default (EN), apply them right away
  // so data-i18n elements, typewriter, and blog cards all match on first paint.
  fetch("assets/i18n.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      translations = data;
      window.__translations = data;
      if (currentLang !== "en") {
        loadTranslations();
      } else if (typeof window.__blogRefresh === "function") {
        // Even in EN, let the blog module render once translations exist
        // so its t() helper can read them.
        window.__blogRefresh();
      }
    });

  // ===== Typewriter =====
  var typewriterEl = document.getElementById("typewriter");
  var typewriterTimeout = null;

  function runTypewriter(text) {
    var i = 0;
    typewriterEl.textContent = "";
    clearTimeout(typewriterTimeout);

    function tick() {
      if (i < text.length) {
        typewriterEl.textContent += text.charAt(i);
        i++;
        typewriterTimeout = setTimeout(tick, 80);
      }
    }
    tick();
  }

  function restartTypewriter() {
    var text =
      currentLang === "fr"
        ? "Salut ! Moi, c'est Fangyuan Lin"
        : "Hey there, I'm Fangyuan Lin";
    if (translations && translations[currentLang] && translations[currentLang].typewriter) {
      text = translations[currentLang].typewriter;
    }
    runTypewriter(text);
  }

  // Initial typewriter reflects the persisted language immediately so there's
  // no flash of EN before translations load.
  runTypewriter(
    currentLang === "fr"
      ? "Salut ! Moi, c'est Fangyuan Lin"
      : "Hey there, I'm Fangyuan Lin"
  );

  // ===== Mobile Menu =====
  var mobileMenu = document.getElementById("mobile-menu");
  var navLinks = document.querySelector(".nav-links");

  if (mobileMenu) {
    mobileMenu.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }

  // ===== Smooth Scrolling =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

  // ===== ScrollSpy =====
  var navAnchors = document.querySelectorAll(".nav-links li a[href^='#']");
  var sections = document.querySelectorAll("section");

  window.addEventListener("scroll", function () {
    var scrollPos = window.scrollY || window.pageYOffset;
    var current = "";
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop - 200) {
        current = sec.getAttribute("id");
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.remove("active");
      if (current && a.getAttribute("href") === "#" + current) {
        a.classList.add("active");
      }
    });
  });

  // ===== Section Reveal on Scroll =====
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".section").forEach(function (sec) {
    revealObserver.observe(sec);
  });

  // ===== Terminal Typewriter (DEAD STATIC card) =====
  var terminalOutput = document.getElementById("terminal-output");
  var terminalCursor = document.querySelector(".terminal-cursor");

  if (terminalOutput) {
    var terminalLines = [
      "> Initializing Dead Static v0.1...",
      "> Loading Qwen-1.7B GGUF model...",
      "> [████████████████████] 100%",
      "> Model loaded. Starting game loop.",
      "",
      "DAY 5: The horde is approaching the barricade.",
      "You hear scratching behind the east wall.",
      "",
      "[A] Fight them head-on",
      "[B] Hide in the basement",
      "[C] Scavenge for supplies",
    ];
    var lineIndex = 0;
    var charIndex = 0;
    var currentLineEl = null;

    function typeTerminal() {
      if (lineIndex >= terminalLines.length) {
        // Restart after a pause
        setTimeout(function () {
          terminalOutput.innerHTML = "";
          lineIndex = 0;
          charIndex = 0;
          currentLineEl = null;
          typeTerminal();
        }, 4000);
        return;
      }

      var line = terminalLines[lineIndex];

      if (!currentLineEl) {
        currentLineEl = document.createElement("div");
        terminalOutput.appendChild(currentLineEl);
      }

      if (line === "") {
        // Empty line — just add a break
        currentLineEl.innerHTML = "&nbsp;";
        lineIndex++;
        charIndex = 0;
        currentLineEl = null;
        setTimeout(typeTerminal, 300);
        return;
      }

      if (charIndex < line.length) {
        currentLineEl.textContent += line.charAt(charIndex);
        charIndex++;
        // Faster for loading bar line
        var delay = line.includes("█") ? 15 : 35;
        setTimeout(typeTerminal, delay);
      } else {
        lineIndex++;
        charIndex = 0;
        currentLineEl = null;
        setTimeout(typeTerminal, 400);
      }
    }

    // Start terminal animation when the card scrolls into view
    var terminalCard = document.querySelector(".bento-featured");
    if (terminalCard) {
      var terminalStarted = false;
      var terminalObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !terminalStarted) {
              terminalStarted = true;
              typeTerminal();
            }
          });
        },
        { threshold: 0.3 }
      );
      terminalObserver.observe(terminalCard);
    }
  }

  // ===== Chat Preview Replay + Streaming (Interview Chatbot) =====
  var chatPreview = document.getElementById("chat-preview");
  if (chatPreview) {
    // Clean up any stale cursor markers from previously cached HTML
    chatPreview.querySelectorAll(".stream-cursor").forEach(function (n) {
      n.remove();
    });
    var chatBubbles = chatPreview.querySelectorAll(".chat-bubble");
    var streamEls = chatPreview.querySelectorAll(".stream-text");
    var streamFallbacks = {
      proj_chatbot_chat_q1:
        "Walk me through a challenging bug you solved recently.",
      proj_chatbot_chat_q2:
        "Great example. How did you isolate the race in logs before you had a repro?"
    };
    // Each stream element is paired with a delay (ms) before it begins typing.
    // Delays align with CSS animation-delay on the parent bubbles.
    var streamSchedule = [700, 4500];
    var streamTimers = [];

    function getStreamText(el) {
      var key = el.getAttribute("data-stream-key");
      if (
        translations &&
        translations[currentLang] &&
        translations[currentLang][key]
      ) {
        return translations[currentLang][key];
      }
      return streamFallbacks[key] || "";
    }

    function clearStreamTimers() {
      streamTimers.forEach(function (t) { clearTimeout(t); });
      streamTimers = [];
    }

    var chatBody = chatPreview.querySelector(".chat-body");
    function scrollChatToBottom() {
      if (!chatBody) return;
      // Only follow along if the user hasn't scrolled up to read earlier
      // messages — a ~24px tolerance keeps normal streaming sticky without
      // yanking the viewport away from someone who scrolled back.
      var distanceFromBottom =
        chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight;
      if (distanceFromBottom < 24) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }

    function streamOne(el, startDelay) {
      el.textContent = "";
      var full = getStreamText(el);
      var i = 0;
      function tick() {
        if (i <= full.length) {
          el.textContent = full.slice(0, i);
          i++;
          scrollChatToBottom();
          var delay = 28 + Math.random() * 30;
          streamTimers.push(setTimeout(tick, delay));
        }
      }
      streamTimers.push(setTimeout(tick, startDelay));
    }

    function streamBubble() {
      clearStreamTimers();
      if (chatBody) chatBody.scrollTop = 0;
      streamEls.forEach(function (el, idx) {
        streamOne(el, streamSchedule[idx] || 500 + idx * 4000);
      });
    }

    chatStreamFn = streamBubble;

    var chatObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            chatBubbles.forEach(function (b) {
              b.style.animation = "none";
              // Force reflow so the animation can restart
              void b.offsetWidth;
              b.style.animation = "";
            });
            streamBubble();
          }
        });
      },
      { threshold: 0.35 }
    );
    chatObserver.observe(chatPreview);
  }

  // ===== Slime Mascot — click to jump to top =====
  var slimeMascot = document.getElementById("slime-mascot");
  if (slimeMascot) {
    var slimePhrases = ["BLORP! ↑", "BOING! ↑", "WHEEE ↑", "HUP! ↑", "SPLAT ↑"];
    var msgLabel = slimeMascot.querySelector(".slime-mascot-msg");
    // Hide mascot near the top so it doesn't hover over the hero
    function updateMascotVisibility() {
      if (window.scrollY < 200) {
        slimeMascot.classList.add("is-hidden");
      } else {
        slimeMascot.classList.remove("is-hidden");
      }
    }
    updateMascotVisibility();
    window.addEventListener("scroll", updateMascotVisibility, { passive: true });

    slimeMascot.addEventListener("click", function () {
      if (slimeMascot.classList.contains("hit")) return;
      if (msgLabel) {
        msgLabel.textContent = slimePhrases[Math.floor(Math.random() * slimePhrases.length)];
      }
      slimeMascot.classList.add("hit");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(function () {
        slimeMascot.classList.remove("hit");
      }, 1100);
    });

    // Click the speech bubble to dismiss it without triggering the
    // scroll-to-top action. The bubble stays hidden until the pointer
    // leaves the mascot area — then a fresh hover re-opens it.
    var slimeTooltip = slimeMascot.querySelector(".slime-tooltip");
    if (slimeTooltip) {
      slimeTooltip.addEventListener("click", function (e) {
        e.stopPropagation();
        slimeMascot.classList.add("tooltip-dismissed");
      });
      slimeMascot.addEventListener("mouseleave", function () {
        slimeMascot.classList.remove("tooltip-dismissed");
      });
      slimeMascot.addEventListener("blur", function () {
        slimeMascot.classList.remove("tooltip-dismissed");
      });
    }
  }

  // ===== Feedback Form =====
  var feedbackForm = document.getElementById("feedback-form");
  var isFormSubmitted = false;

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (isFormSubmitted) {
        return;
      }

      var form = e.target;
      var data = new FormData(form);

      fetch(form.action, {
        method: form.method,
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            document.getElementById("feedback-response").style.display = "block";
            isFormSubmitted = true;
            setTimeout(function () {
              isFormSubmitted = false;
              document.getElementById("feedback-response").style.display = "none";
            }, 30000);
          } else {
            response.json().then(function (data) {
              if (data.errors) {
                alert(data.errors.map(function (err) { return err.message; }).join(", "));
              } else {
                alert("There was a problem submitting your form.");
              }
            });
          }
        })
        .catch(function () {
          alert("There was a problem submitting your form.");
        });
    });
  }
});
