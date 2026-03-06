const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particlesArray = [];
const baseParticlesCount = 100; // Slightly reduced for cleaner look with the glowing background
const maxVelocity = 0.5;
const mouseConnectionDistance = 150; // Increased reach
const particleConnectionDistance = 80;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = {
  x: undefined,
  y: undefined,
};

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
  
  for (let i = 0; i < 2; i++) {
    particlesArray.push(new Particle(mouse.x, mouse.y));
  }
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  for (let i = 0; i < 10; i++) {
    particlesArray.push(new Particle(x, y));
  }
});

class Particle {
  constructor(x, y) {
    this.x = (typeof x === "number") ? x : Math.random() * canvas.width;
    this.y = (typeof y === "number") ? y : Math.random() * canvas.height;
    this.size = Math.random() * 2.5 + 1;
    this.speedX = (Math.random() - 0.5) * maxVelocity;
    this.speedY = (Math.random() - 0.5) * maxVelocity;
    // Randomly assign Cyan or Purple to match the new CSS variables
    this.color = Math.random() > 0.5 ? '#00f0ff' : '#8a2be2'; 
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15; // Adds the neon glow effect
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    // Reset shadow so it doesn't affect the lines too heavily
    ctx.shadowBlur = 0; 
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < baseParticlesCount; i++) {
    particlesArray.push(new Particle());
  }
}

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
      // Cyan connection lines to the mouse
      ctx.strokeStyle = `rgba(0, 240, 255, ${1 - distance / mouseConnectionDistance})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

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
        // Purple/Blue translucent connection lines between particles
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.4 - distance / particleConnectionDistance})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

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

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

initParticles();
animateParticles();
