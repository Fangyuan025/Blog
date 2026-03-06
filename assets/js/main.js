// Mobile Navigation Toggle, Typewriter Animation, and Improved Filter Transition
document.addEventListener("DOMContentLoaded", function() {
  // Typewriter effect for the hero text
  const typewriterElement = document.getElementById("typewriter");
  const fullTextEn = "Welcome! I'm Fangyuan Lin";
  const fullTextFr = "Bienvenue! Je suis Fangyuan Lin";
  const fullText = document.documentElement.lang === "fr" ? fullTextFr : fullTextEn;
  let currentIndex = 0;
  function typeWriter() {
    if (currentIndex < fullText.length) {
      typewriterElement.innerHTML += fullText.charAt(currentIndex);
      currentIndex++;
      setTimeout(typeWriter, 100);
    }
  }
  typeWriter();

  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  mobileMenu.addEventListener("click", function() {
    navLinks.classList.toggle("active");
  });

  // Smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

// Projects filtering functionality with improved smooth transitions
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");
  const transitionDuration = 400; // 400ms to match the CSS transition

  // Set default filter to 'ml' on load
  projectItems.forEach(item => {
    if (item.getAttribute("data-category") !== "ml") {
      item.style.display = "none";
      item.classList.add("fade-out");
    } else {
      item.style.display = "flex";
      item.classList.add("fade-in");
    }
  });

  filterButtons.forEach(btn => {
    // Trigger on 'click' instead of 'mouseenter' to prevent rapid-fire glitching
    btn.addEventListener("click", function() {
      if (this.classList.contains("active")) return; // Do nothing if clicking the already active button

      // Update button active states
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");

      projectItems.forEach(item => {
        // 1. Fade everything out first
        item.classList.remove("fade-in");
        item.classList.add("fade-out");

        // 2. Wait for the fade-out animation to finish, then swap displays and fade in
        setTimeout(() => {
          if (item.getAttribute("data-category") === filter) {
            item.style.display = "flex"; 
            
            // Force browser reflow so the display change registers before fading in
            void item.offsetWidth;
            
            item.classList.remove("fade-out");
            item.classList.add("fade-in");
          } else {
            item.style.display = "none";
          }
        }, transitionDuration);
      });
    });
  });

  // Scroll animation for sections
  const sections = document.querySelectorAll(".section");
  const options = {
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });
});
