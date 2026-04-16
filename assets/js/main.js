document.addEventListener("DOMContentLoaded", function () {
  // ===== i18n System =====
  let currentLang = "en";
  let translations = null;

  async function loadTranslations() {
    if (!translations) {
      const res = await fetch("assets/i18n.json");
      translations = await res.json();
    }
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (translations[currentLang] && translations[currentLang][key]) {
        el.innerHTML = translations[currentLang][key];
      }
    });
    // Re-run typewriter with new language text
    restartTypewriter();
  }

  var langToggle = document.getElementById("language-toggle");
  if (langToggle) {
    langToggle.addEventListener("click", function (e) {
      e.preventDefault();
      currentLang = currentLang === "en" ? "fr" : "en";
      langToggle.textContent = currentLang === "en" ? "FR" : "EN";
      document.documentElement.lang = currentLang;
      loadTranslations();
    });
  }

  // Pre-load translations so they're ready when toggled
  fetch("assets/i18n.json")
    .then(function (r) { return r.json(); })
    .then(function (data) { translations = data; });

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
        ? "Bienvenue! Je suis Fangyuan Lin"
        : "Welcome! I'm Fangyuan Lin";
    if (translations && translations[currentLang] && translations[currentLang].typewriter) {
      text = translations[currentLang].typewriter;
    }
    runTypewriter(text);
  }

  runTypewriter("Welcome! I'm Fangyuan Lin");

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

  // ===== Chat Preview Replay (Interview Chatbot) =====
  var chatPreview = document.getElementById("chat-preview");
  if (chatPreview) {
    var chatBubbles = chatPreview.querySelectorAll(".chat-bubble");
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
          }
        });
      },
      { threshold: 0.35 }
    );
    chatObserver.observe(chatPreview);
  }

  // ===== Slime Mascot (Math Adventure easter egg) =====
  var slimeMascot = document.getElementById("slime-mascot");
  if (slimeMascot) {
    var xpValues = [5, 10, 15, 20, 25];
    var xpLabel = slimeMascot.querySelector(".slime-mascot-xp");
    slimeMascot.addEventListener("click", function () {
      if (slimeMascot.classList.contains("hit")) return;
      if (xpLabel) {
        xpLabel.textContent = "+" + xpValues[Math.floor(Math.random() * xpValues.length)] + " XP";
      }
      slimeMascot.classList.add("hit");
      setTimeout(function () {
        slimeMascot.classList.remove("hit");
      }, 900);
    });
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
