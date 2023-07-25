document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas.getContext('2d');

    // Scale the the number of pixels
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const G = 10; // Gravitational constant
    let numParticles = 50;

    // Adjust this value to control the simulation speed
    const timeStep = 0.05;

    // Define arrays of links and icons
    const links = ['https://willjroper.github.io',
                   'https://willjroper.github.io/about.html',
                   "mailto:w.roper@sussex.ac.uk",
                   "https://twitter.com/WillJRoper",
                   "https://github.com/willjroper",
                   "https://www.youtube.com/channel/UCqHvI4oq6PdLR1-jU0pRyng",
                   "https://www.linkedin.com/in/william-roper-b1a527189/",
                   'https://willjroper.github.io/games.html',
                   'https://willjroper.github.io/publications.html'];
    const icons = ['\uf015', '\uf05a', null, null, null, null, null, '\uf11b', '\uf1ea'];
    const imgPaths = [null, null,
                      "pictures/socials/mail_white.png",
                      "pictures/socials/Twitter_white.png",
                      "pictures/socials/GitHub_white.png",
                      "pictures/socials/YT_white.png",
                      "pictures/socials/LI_white.png", null, null];

    // Particle class representing each element in the simulation
    class Particle {
        constructor(x, y, mass, link, icon, imagePath, vx, vy) {
            this.x = x;
            this.y = y;
            this.mass = mass;
            this.vx = vx;
            this.vy = vy;
            this.link = link;
            this.icon = icon; // Font Awesome unicode.
            this.size = 40;
            this.isMouseOver = false;
            this.imagePath = imagePath;
        }

        // Method to update position with periodic boundary conditions
        updatePosition() {
            this.x = ((this.x + this.vx) % canvas.width + canvas.width) % canvas.width;
            this.y = ((this.y + this.vy) % canvas.height + canvas.height) % canvas.height;
        }
    }

    function addParticle(i, x, y) {

        // Define the properties of a particle
        if (x == null) {
            x = (Math.random() * canvas.width / 2) + (canvas.width / 4);
        }
        if (y == null) {
            y = (Math.random() * canvas.height / 2) + (canvas.height / 4);
        }
        const mass = 10 + Math.random() * 20;
        let link = null;
        let icon = null;
        let imgPath = null;
        if (i != null) {
            if (i < links.length) {
                link = links[i];
                icon = icons[i];
                imgPath = imgPaths[i];
            }
        }

        // Calculate the velocity components for orbiting around the center
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Initial orbital speed
        const orbitSpeed = 1;
            
        // Calculate the initial velocities vx and vy
        const vx = -orbitSpeed * dy / distance;
        const vy = orbitSpeed * dx / distance;

        particles.push(
            new Particle(x, y, mass, link, icon, imgPath, vx, vy)
        );
    };

    // Create an array to hold all the particles
    const particles = [];
    
    // Initialize particles with random positions, masses, and hyperlinks
    for (let i = 0; i < numParticles; i++) {
        addParticle(i, null, null);
    }

    // Place a fixed invisible heavy particle at the center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerMass = 1000; // Adjust the mass as desired

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
            const dxCenter = centerX - particle1.x;
            const dyCenter = centerY - particle1.y;
            const distanceCenterSq = dxCenter * dxCenter + dyCenter * dyCenter;
            const distanceCenter = Math.sqrt(distanceCenterSq);
        
            // Calculate gravitational force
            const forceCenter = (G * particle1.mass * centerMass) / (distanceCenterSq + 50 ** 2);
        
            // Calculate components of the force
            const fxCenter = forceCenter * (dxCenter / distanceCenter);
            const fyCenter = forceCenter * (dyCenter / distanceCenter);
            
            // Update velocities of the particle based on the gravitational force from the center particle
            particle1.vx += (fxCenter / particle1.mass) * timeStep;
            particle1.vy += (fyCenter / particle1.mass) * timeStep;
        }

        // Drift and draw the particles
        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];

            // Drift the particles with periodic boundary conditions
            particle.updatePosition();
            
            // Draw particles on the canvas in white color
            if (particle.icon) {
                // Use Font Awesome icon
                ctx.font = particle.size + 'px FontAwesome';
                if (particle.isMouseOver) {
                    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";   
                }
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                
                // Draw the Font Awesome icon directly using the font
                ctx.fillText(particle.icon, particle.x, particle.y, particle.size);
                
            } else if (particle.imagePath) {
                
                // Use image for the particle's icon
                const img = new Image();
                img.src = particle.imagePath;
                
                // Calculate the aspect ratio of the image
                const aspectRatio = img.width / img.height;

                // Calculate the scaled dimensions based on particle.size and aspectRatio
                let width, height;
                if (aspectRatio >= 1) {
                    // Image is wider than tall (landscape)
                    width = particle.size;
                    height = particle.size / aspectRatio;
                } else {
                    // Image is taller than wide (portrait)
                    width = particle.size * aspectRatio;
                    height = particle.size;
                }

                // Draw the image on the canvas with the desired opacity
                ctx.globalAlpha = particle.isMouseOver ? 1 : 0.5;
                ctx.drawImage(img, particle.x - width / 2,
                              particle.y - height / 2, width, height);
                ctx.globalAlpha = 0.5;
                
            } else {
                // Use circle for other particles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 4,
                        0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";   
                ctx.fill();
            }
        }

        // Request the next animation frame
        requestAnimationFrame(update);
    };

    // Event listener for handling clicks on particles
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Flag if an icon was clicked on
        let part_click = false;
        
        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];
            const distanceSq = (mouseX - particle.x) ** 2 + (mouseY - particle.y) ** 2;
            const radiusSq = particle.size ** 2;
            
            if (distanceSq <= radiusSq) {

                // The user clicked on a particle
                part_click = true;
                
                // Particle clicked!
                if (particle.link && particle.icon) {
                    // Open the link in this tab
                    window.open(particle.link, '_self');
                } else if (particle.link && particle.imagePath) {
                    // Open the link in a new tab
                    window.open(particle.link, '_blank');
                } else {
                    // Do something else if there is no link associated with the particle
                    console.log(`Particle at (${particle.x}, ${particle.y}) clicked!`);
                }
                break; // No need to check other particles if one is already clicked
            }
        }

        // If it was a random click add a particle
        if (part_click == false) {
            addParticle(null, mouseX, mouseY);
            numParticles++;
        }
    });

    // Update function to handle mouse events
    function handleMouseEvents(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if the mouse is over any particle
        particles.forEach(particle => {
            const distanceSq = (mouseX - particle.x) ** 2 + (mouseY - particle.y) ** 2;
            const radiusSq = particle.size ** 2;
            
            if (distanceSq <= radiusSq) {
                // Mouse is over the particle, set its isMouseOver property to true
                particle.isMouseOver = true;
            } else {
                // Mouse is not over the particle, set its isMouseOver property to false
                particle.isMouseOver = false;
            }
        });
    }

    // Add event listeners to the canvas
    canvas.addEventListener('mousemove', handleMouseEvents);
    canvas.addEventListener('mouseout', () => {
        // When the mouse moves out of the canvas, reset all particles' isMouseOver to false
        particles.forEach(particle => (particle.isMouseOver = false));
    });
    
    // Start the simulation
    update();
});
