// Mobile Navigation Toggle and Typewriter Animation
document.addEventListener("DOMContentLoaded", function() {
  // Typewriter effect for the hero text
  const typewriterElement = document.getElementById("typewriter");
  const fullText = "Welcome! I'm Fangyuan Lin";
  let currentIndex = 0;
  function typeWriter() {
    if (currentIndex < fullText.length) {
      typewriterElement.innerHTML += fullText.charAt(currentIndex);
      currentIndex++;
      setTimeout(typeWriter, 100); // Adjust delay for speed (in ms)
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
      // Close mobile menu if open
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
      }
    });
  });

  // Projects filtering functionality with smooth animation on mouse hover
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");

  filterButtons.forEach(btn => {
    btn.addEventListener("mouseenter", function() {
      // Remove active class from all buttons
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      projectItems.forEach(item => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.classList.remove("fade-out");
          item.classList.add("fade-in");
          item.style.display = "block";
        } else {
          item.classList.remove("fade-in");
          item.classList.add("fade-out");
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
});