// Particle background animation with cool mouse-focus lines

const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particlesArray = [];
const baseParticlesCount = 150;
const maxVelocity = 0.5;
const mouseConnectionDistance = 120;
const particleConnectionDistance = 60;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Global mouse object to track mouse coordinates
const mouse = {
  x: undefined,
  y: undefined,
};

// Update mouse coordinates on move and spawn a couple of particles near the pointer
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  
  // Spawn a couple of particles near the pointer for interactive effect
  for (let i = 0; i < 2; i++) {
    particlesArray.push(new Particle(mouse.x, mouse.y));
  }
});

// On mouse click, spawn a burst of particles at the click location
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  for (let i = 0; i < 10; i++) {
    particlesArray.push(new Particle(x, y));
  }
});

// Particle class; accepts optional x,y coordinates for interactive spawning
class Particle {
  constructor(x, y) {
    this.x = (typeof x === "number") ? x : Math.random() * canvas.width;
    this.y = (typeof y === "number") ? y : Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * maxVelocity;
    this.speedY = (Math.random() - 0.5) * maxVelocity;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Initialize base particles
function initParticles() {
  particlesArray = [];
  for (let i = 0; i < baseParticlesCount; i++) {
    particlesArray.push(new Particle());
  }
}

// Draw lines connecting particles to the mouse if close enough
function drawLinesToMouse() {
  if (mouse.x === undefined || mouse.y === undefined) return;
  for (let i = 0; i < particlesArray.length; i++) {
    const dx = particlesArray[i].x - mouse.x;
    const dy = particlesArray[i].y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouseConnectionDistance) {
      ctx.beginPath();
      ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(174, 174, 174, ${1 - distance / mouseConnectionDistance})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// Draw lines between nearby particles for extra cool effect
function drawConnectionsBetweenParticles() {
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      const dx = particlesArray[a].x - particlesArray[b].x;
      const dy = particlesArray[a].y - particlesArray[b].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < particleConnectionDistance) {
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.strokeStyle = `rgba(200, 200, 200, ${1 - distance / particleConnectionDistance})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// Animation loop: update, draw particles, and draw connecting lines
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach((particle) => {
    particle.update();
    particle.draw();
  });
  
  drawLinesToMouse();
  drawConnectionsBetweenParticles();
  
  requestAnimationFrame(animateParticles);
}

// On window resize, update canvas dimensions and reinitialize particles
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

initParticles();
animateParticles();