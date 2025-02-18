// Mobile Navigation Toggle, Typewriter Animation, and Improved Filter Transition
document.addEventListener("DOMContentLoaded", function() {
  // Typewriter effect for the hero text
  const typewriterElement = document.getElementById("typewriter");
  const fullText = "Welcome! I'm Fangyuan Lin";
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
  let transitionDuration = 800; // duration in milliseconds

  // Set default filter to 'chatbot' on load by hiding non-chatbot items
  projectItems.forEach(item => {
    if (item.getAttribute("data-category") !== "chatbot") {
      item.style.display = "none";
    } else {
      item.classList.add("fade-in");
    }
  });

  filterButtons.forEach(btn => {
    btn.addEventListener("mouseenter", function() {
      // Remove active class from all buttons and set active class for current button
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      let hidePromises = [];

      // Fade out items that don't match the new filter
      projectItems.forEach(item => {
        if (item.getAttribute("data-category") !== filter && item.style.display !== "none") {
          item.classList.remove("fade-in");
          item.classList.add("fade-out");
          // Create promise that resolves after the transitionDuration
          hidePromises.push(new Promise(resolve => setTimeout(resolve, transitionDuration)));
        }
      });

      // After fade-out finishes, update the items
      Promise.all(hidePromises).then(() => {
        projectItems.forEach(item => {
          if (item.getAttribute("data-category") === filter) {
            // For items that were hidden, set them to display block and initialize them with fade-out first
            if (item.style.display === "none") {
              item.style.display = "block";
              item.classList.remove("fade-in", "fade-out");
              item.classList.add("fade-out");
              // Force reflow to ensure the transition is applied
              void item.offsetWidth;
            }
            // Now remove fade-out and add fade-in for a smooth transition
            item.classList.remove("fade-out");
            item.classList.add("fade-in");
          } else {
            item.style.display = "none";
          }
        });
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