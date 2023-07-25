document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas.getContext('2d');

    const G = 10; // Gravitational constant
    const numParticles = 10;

    // Adjust this value to control the simulation speed
    const timeStep = 0.05;

      // Function to convert Font Awesome icon to Image object
    function getIconImage(iconName) {
        const icon = document.createElement('i');
        icon.classList.add('fas', iconName); // Assuming you're using Font Awesome Free (fas)
        const iconSvg = icon.outerHTML;
        const svgBlob = new Blob([iconSvg], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const image = new Image();
        image.src = svgUrl;
        return image;
    }

    // Particle class representing each element in the simulation
    class Particle {
        constructor(x, y, mass, link, icon, vx, vy) {
            this.x = x;
            this.y = y;
            this.mass = mass;
            this.vx = vx;
            this.vy = vy;
            this.link = link;
            this.icon = icon; // Font Awesome icon name, e.g., 'fa-bug', 'fa-star', etc.
        }

        // Method to update position with periodic boundary conditions
        updatePosition() {
            this.x = ((this.x + this.vx) % canvas.width + canvas.width) % canvas.width;
            this.y = ((this.y + this.vy) % canvas.height + canvas.height) % canvas.height;
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
        const icon = i % 2 === 0 ? 'fa-home' : 'fa-info-circle'; // Use different icons for even and odd particles

        // Calculate the velocity components for orbiting around the center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Calculate the initial speed for orbiting (adjust this value to control the orbit speed)
        const orbitSpeed = 0.1;

        // Calculate the initial velocities vx and vy
        const vx = -orbitSpeed * dy / distance;
        const vy = orbitSpeed * dx / distance;

        particles.push(new Particle(x, y, mass, link, icon, vx, vy));
    }

    // Place a fixed invisible heavy particle at the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerMass = 100; // Adjust the mass as desired
    
    // Add the fixed center particle to the particles array
    particles.push(new Particle(centerX, centerY, centerMass, null, null, 0, 0));

    function update() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate gravitational forces and update velocities
        for (let i = 0; i < numParticles; i++) {
            const particle1 = particles[i];
            for (let j = 0; j < numParticles; j++) {
                if (i !== j) {
                    const particle2 = particles[j];
                    
                    const dx = particle2.x - particle1.x;
                    const dy = particle2.y - particle1.y;
                    const distanceSq = dx * dx + dy * dy;
                    const distance = Math.sqrt(distanceSq);
                    
                    // Calculate gravitational force
                    const force = (G * particle1.mass * particle2.mass) / (distanceSq + 100);
                    
                    // Calculate components of the force
                    const fx = force * (dx / distance);
                    const fy = force * (dy / distance);

                    // Update velocities of the particles
                    particle1.vx += (fx / particle1.mass) * timeStep;
                    particle1.vy += (fy / particle1.mass) * timeStep;
                }
            }

            // Apply gravitational force from the fixed center particle
            const centerParticle = particles[numParticles]; 
            const dxCenter = centerParticle.x - particle1.x;
            const dyCenter = centerParticle.y - particle1.y;
            const distanceCenterSq = dxCenter * dxCenter + dyCenter * dyCenter;
            const distanceCenter = Math.sqrt(distanceCenterSq);
        
            // Calculate gravitational force
            const forceCenter = (G * particle1.mass * centerParticle.mass) / (distanceCenterSq + 100);
        
            // Calculate components of the force
            const fxCenter = forceCenter * (dxCenter / distanceCenter);
            const fyCenter = forceCenter * (dyCenter / distanceCenter);
            
            // Update velocities of the particle based on the gravitational force from the center particle
            particle1.vx += (fxCenter / particle1.mass) * timeStep;
            particle1.vy += (fyCenter / particle1.mass) * timeStep;
        }

        // Update positions based on velocities with periodic boundary conditions
        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];
            particle.updatePosition();
            
            // Draw particles on the canvas in white color
            if (particle.icon) {
                const iconImage = getIconImage(particle.icon);
                const iconSize = 20; // Adjust the size as needed
                const x = particle.x - iconSize / 2; // Center the icon at the particle's position
                const y = particle.y - iconSize / 2; // Center the icon at the particle's position
                ctx.drawImage(iconImage, x, y, iconSize, iconSize);
            } else {
                // Use circle for other particles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'white'; // Set the fill color to white
                ctx.fill();
            }
        }

        // Request the next animation frame
        requestAnimationFrame(update);
    }

    // Event listener for handling clicks on particles
    canvas.addEventListener('click', function (event) {
        const mouseX = event.clientX - canvas.offsetLeft;
        const mouseY = event.clientY - canvas.offsetTop;
        
        for (const particle of particles) {
            const distanceSq = (mouseX - particle.x) ** 2 + (mouseY - particle.y) ** 2;
            const radiusSq = 5 ** 2; // Radius of the particle squared (assuming a circle with radius 5)

            console.log("Clicked");
            
            if (distanceSq <= radiusSq) {
                // Particle clicked!
                if (particle.link) {
                    // Open the link in a new tab
                    window.open(particle.link, '_blank');
                } else {
                    // Do something else if there is no link associated with the particle
                    console.log(`Particle at (${particle.x}, ${particle.y}) clicked!`);
                }
                break; // No need to check other particles if one is already clicked
            }
        }
    });
    
    // Start the simulation
    update();
});
