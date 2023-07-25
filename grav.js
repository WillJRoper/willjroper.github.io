const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const G = 10; // Gravitational constant
const numParticles = 10;

// Particle class representing each element in the simulation
class Particle {
  constructor(x, y, mass, link, icon) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.vx = 0;
    this.vy = 0;
    this.link = link;
    this.icon = icon; // Font Awesome icon name, e.g., 'fa-bug', 'fa-star', etc.
  }
}

// Create an array to hold all the particles
const particles = [];

// Initialize particles with random positions, masses, and hyperlinks
for (let i = 0; i < numParticles; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const mass = 1 + Math.random() * 4; // Random mass between 1 and 5
  const link = `https://example.com/${i}`; // Replace with the desired hyperlink
  const icon = i % 2 === 0 ? 'fa-bug' : 'fa-star'; // Use different icons for even and odd particles
  particles.push(new Particle(x, y, mass, link, icon));
}

function update() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate gravitational forces and update velocities
  for (let i = 0; i < numParticles; i++) {
    for (let j = 0; j < numParticles; j++) {
      if (i !== j) {
        const particle1 = particles[i];
        const particle2 = particles[j];

        const dx = particle2.x - particle1.x;
        const dy = particle2.y - particle1.y;
        const distanceSq = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSq);

        // Calculate gravitational force
        const force = (G * particle1.mass * particle2.mass) / distanceSq;

        // Calculate components of the force
        const fx = force * (dx / distance);
        const fy = force * (dy / distance);

        // Update velocities of the particles
        particle1.vx += fx / particle1.mass;
        particle1.vy += fy / particle1.mass;
      }
    }
  }

  // Update positions based on velocities
  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Draw particles on the canvas
    if (particle.icon) {
      // Use Font Awesome icon
      ctx.font = '20px FontAwesome';
      ctx.fillStyle = 'black';
      ctx.fillText(String.fromCharCode(parseInt('0x' + particle.icon.substring(3), 16)), particle.x, particle.y);
    } else {
      // Use circle for other particles
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    }
  }

  // Request the next animation frame
  requestAnimationFrame(update);
}

// Event listener for handling clicks on particles
canvas.addEventListener('click', function (event) {
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  for (const particle of particles) {
    const dx = mouseX - particle.x;
    const dy = mouseY - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 5) {
      // If the click is inside the particle, open the associated hyperlink
      window.open(particle.link, '_blank');
      break; // Stop checking other particles
    }
  }
});

// Start the simulation
update();
