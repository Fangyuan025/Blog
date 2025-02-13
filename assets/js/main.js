// Mobile Navigation Toggle
document.addEventListener("DOMContentLoaded", function() {
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
         target.scrollIntoView({
           behavior: "smooth"
         });
       }
       // Close mobile menu if open
       if (navLinks.classList.contains("active")) {
         navLinks.classList.remove("active");
       }
     });
  });

  // Projects filtering functionality
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      // Remove active class from all buttons
      filterButtons.forEach(button => button.classList.remove("active"));
      this.classList.add("active");

      const filter = this.getAttribute("data-filter");
      projectItems.forEach(item => {
        if (filter === "all" || item.getAttribute("data-category") === filter) {
          item.style.display = "block";
          // Fade in
          setTimeout(() => {
            item.style.opacity = 1;
          }, 50);
        } else {
          // Fade out then hide
          item.style.opacity = 0;
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });
});
