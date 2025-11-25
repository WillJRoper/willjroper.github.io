document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas.getContext('2d');
    const outer = document.getElementById('video-container');

    // Scale the the number of pixels
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const G = 10; // Gravitational constant
    let numParticles = 30; // Reduced from 50 for better performance

    // Adjust this value to control the simulation speed
    const timeStep = 0.05;

    // Define arrays of links and icons
    const links = ['index.html',
                   'about.html',
                   'software.html',
                   'publications.html',
                   'public-engagement.html',
                   'games.html',
                   "mailto:w.roper@sussex.ac.uk",
                   "https://twitter.com/WillJRoper",
                   "https://github.com/willjroper",
                   "https://www.youtube.com/channel/UCqHvI4oq6PdLR1-jU0pRyng",
                   "https://www.linkedin.com/in/william-roper-b1a527189/"];
    const icons = ['\uf015', '\uf05a', '\uf121', '\uf1ea', '\uf0c0', '\uf11b', null, null, null, null, null];
    const imgPaths = [null, null, null, null, null, null,
                      "pictures/socials/mail_white.png",
                      "pictures/socials/Twitter_white.png",
                      "pictures/socials/GitHub_white.png",
                      "pictures/socials/YT_white.png",
                      "pictures/socials/LI_white.png"];

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
            // Adjust particle size based on screen width
            this.size = window.innerWidth <= 480 ? 28 : (window.innerWidth <= 768 ? 32 : 40);
            this.isMouseOver = false;
            this.imagePath = imagePath;
            // Pre-load image if path exists (performance optimization)
            if (this.imagePath) {
                this.image = new Image();
                this.image.src = this.imagePath;
            }
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

    // NFW halo parameters
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    const haloMass = 1000; // Total halo mass
    const scaleRadius = 100; // NFW scale radius r_s
    const concentration = 10; // Concentration parameter c = r_vir / r_s

    // Calculate NFW normalization from concentration parameter
    // M(r_vir) = 4π ρ_s r_s³ [ln(1 + c) - c/(1 + c)]
    const concentrationTerm = Math.log(1 + concentration) - concentration / (1 + concentration);
    const rho_s = haloMass / (4 * Math.PI * Math.pow(scaleRadius, 3) * concentrationTerm);

    // Function to calculate enclosed mass within radius r for NFW profile
    function nfwEnclosedMass(r) {
        const x = r / scaleRadius;
        const massTerm = Math.log(1 + x) - x / (1 + x);
        return 4 * Math.PI * rho_s * Math.pow(scaleRadius, 3) * massTerm;
    }

    // Handle window resize
    function handleResize() {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        // Update canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Calculate scale factors
        const scaleX = canvas.width / oldWidth;
        const scaleY = canvas.height / oldHeight;

        // Determine new particle size based on window width
        const newSize = window.innerWidth <= 480 ? 28 : (window.innerWidth <= 768 ? 32 : 40);

        // Scale all particle positions and update sizes
        particles.forEach(particle => {
            particle.x *= scaleX;
            particle.y *= scaleY;
            particle.size = newSize;
        });

        // Update center position
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
    }

    // Add resize listener for smooth real-time resizing
    window.addEventListener('resize', handleResize);

    // Detect if device supports touch (mobile/tablet)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    function updatePhysics() {
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

                    // Calculate gravitational force (reverted to original softening)
                    const force = (G * particle1.mass * particle2.mass) / (distanceSq + 100);

                    // Calculate components of the force
                    const fx = force * (dx / distance);
                    const fy = force * (dy / distance);

                    // Update velocities of the particles
                    particle1.vx += (fx / particle1.mass) * timeStep;
                    particle1.vy += (fy / particle1.mass) * timeStep;
                }
            }

            // Apply gravitational force from the NFW halo centered at canvas center
            const dxCenter = centerX - particle1.x;
            const dyCenter = centerY - particle1.y;
            const distanceCenterSq = dxCenter * dxCenter + dyCenter * dyCenter;
            const distanceCenter = Math.sqrt(distanceCenterSq);

            // Calculate enclosed mass at this radius using NFW profile
            const enclosedMass = nfwEnclosedMass(distanceCenter);

            // Calculate gravitational force: F = G * m * M(<r) / r²
            // Add softening to prevent singularity at center
            const forceCenter = (G * particle1.mass * enclosedMass) / (distanceCenterSq + 50 ** 2);

            // Calculate components of the force
            const fxCenter = forceCenter * (dxCenter / distanceCenter);
            const fyCenter = forceCenter * (dyCenter / distanceCenter);

            // Update velocities of the particle based on the gravitational force from the NFW halo
            particle1.vx += (fxCenter / particle1.mass) * timeStep;
            particle1.vy += (fyCenter / particle1.mass) * timeStep;
        }

        // Drift the particles
        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];
            // Drift the particles with periodic boundary conditions
            // Only freeze position for icons/links when hovered (and not on touch devices)
            if (!particle.isMouseOver || isTouchDevice || (!particle.link && !particle.icon && !particle.imagePath)) {
                particle.updatePosition();
            }
        }
    };

    function draw() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all particles
        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];
            
            // Draw particles on the canvas in white color
            if (particle.icon) {
                // Use Font Awesome icon (Font Awesome 5 uses "Font Awesome 5 Free" for solid icons)
                ctx.font = '900 ' + particle.size + 'px "Font Awesome 5 Free"';
                if (particle.isMouseOver) {
                    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                }
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';

                // Draw the Font Awesome icon directly using the font
                ctx.fillText(particle.icon, particle.x, particle.y, particle.size);
                
            } else if (particle.imagePath && particle.image && particle.image.complete) {

                // Use pre-loaded image for the particle's icon (performance optimization)
                const img = particle.image;

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
                ctx.globalAlpha = 1.0; // Reset to full opacity
                
            } else {
                // Use circle for other particles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 4,
                        0, 2 * Math.PI);
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";   
                ctx.fill();
            }
        }
    };

    // Event listener for handling clicks on particles (desktop only)
    if (!isTouchDevice) {
        canvas.addEventListener('click', function (event) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            handleParticleTap(mouseX, mouseY);
        });
    }

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
    // Only freeze particles on hover for non-touch devices
    if (!isTouchDevice) {
        canvas.addEventListener('mousemove', handleMouseEvents);
        canvas.addEventListener('mouseout', () => {
            // When the mouse moves out of the canvas, reset all particles' isMouseOver to false
            particles.forEach(particle => (particle.isMouseOver = false));
        });
    } else {
        // On touch devices, handle touch events for highlighting
        let touchStartPos = null;

        canvas.addEventListener('touchstart', function(event) {
            const rect = canvas.getBoundingClientRect();
            const touch = event.touches[0];
            touchStartPos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };

            // Highlight particles on touch start
            particles.forEach(particle => {
                const distanceSq = (touchStartPos.x - particle.x) ** 2 + (touchStartPos.y - particle.y) ** 2;
                const radiusSq = particle.size ** 2;
                particle.isMouseOver = distanceSq <= radiusSq;
            });
        });

        canvas.addEventListener('touchend', function(event) {
            // Reset all particles when touch ends
            particles.forEach(particle => (particle.isMouseOver = false));

            // If we had a touch start position, check if we tapped a particle
            if (touchStartPos) {
                // Check if this was a tap (not a drag) by seeing if position hasn't changed much
                handleParticleTap(touchStartPos.x, touchStartPos.y);
                touchStartPos = null;
            }
        });
    }

    // Handle particle tap/click for navigation
    function handleParticleTap(x, y) {
        let part_click = false;

        for (let i = 0; i < numParticles; i++) {
            const particle = particles[i];
            const distanceSq = (x - particle.x) ** 2 + (y - particle.y) ** 2;
            const radiusSq = particle.size ** 2;

            if (distanceSq <= radiusSq) {
                part_click = true;

                // Particle clicked!
                if (particle.link && particle.icon) {
                    // Open the link in this tab
                    window.open(particle.link, '_self');
                } else if (particle.link && particle.imagePath) {
                    // Open the link in a new tab
                    window.open(particle.link, '_blank');
                }
                break;
            }
        }

        // If it was a random tap, add a particle (only on desktop)
        if (part_click == false && !isTouchDevice) {
            addParticle(null, x, y);
            numParticles++;
        }
    }
    
    // Control variables for pause/play
    let isPaused = false;
    let animationId = null;

    // Modified update function to support pause/play
    function updateLoop() {
        if (!isPaused) {
            updatePhysics(); // Only update physics when not paused
        }
        draw(); // Always draw (so hover highlights work when paused)
        animationId = requestAnimationFrame(updateLoop);
    }

    // Control button functionality
    document.getElementById('addParticle').addEventListener('click', function() {
        addParticle(null, null, null);
        numParticles++;
    });

    document.getElementById('removeParticle').addEventListener('click', function() {
        if (numParticles > 0) {
            // Only remove particles without links (random particles, not icons)
            for (let i = particles.length - 1; i >= 0; i--) {
                if (!particles[i].link && !particles[i].icon && !particles[i].imagePath) {
                    particles.splice(i, 1);
                    numParticles--;
                    break;
                }
            }
        }
    });

    document.getElementById('pausePlay').addEventListener('click', function() {
        isPaused = !isPaused;
        const icon = this.querySelector('i');
        if (isPaused) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            this.classList.add('paused');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            this.classList.remove('paused');
        }
    });

    // Start the simulation
    updateLoop();
});
