// script.js - N-body simulation with Newtonian gravity calculations

// Get the icons
var icon1 = document.getElementById('home');
var icon2 = document.getElementById('about');
// Add more icons as needed

// Set up the gravitational constant (adjust as needed for your simulation)
var G = 0.001;

// Create an array to store the icons
var icons = [icon1, icon2];
// Add more icons to the array as needed

// Initialize initial velocities and accelerations to zero for all icons
var velocities = Array.from({ length: icons.length }, () => ({ x: 0, y: 0 }));
var accelerations = Array.from({ length: icons.length }, () => ({ x: 0, y: 0 }));

// Function to calculate the gravitational force between two icons
function calculateGravitationalForce(icon1, icon2) {
    var dx = icon2.offsetLeft - icon1.offsetLeft;
    var dy = icon2.offsetTop - icon1.offsetTop;
    var distanceSquared = dx * dx + dy * dy;
    var forceMagnitude = G / distanceSquared;

    var angle = Math.atan2(dy, dx);
    var forceX = forceMagnitude * Math.cos(angle);
    var forceY = forceMagnitude * Math.sin(angle);

    return { x: forceX, y: forceY };
}

// Function to update the positions of the icons using kick-drift-kick method
function updatePositions() {
    for (var i = 0; i < icons.length; i++) {
        accelerations[i].x = 0;
        accelerations[i].y = 0;

        for (var j = 0; j < icons.length; j++) {
            if (i !== j) {
                var force = calculateGravitationalForce(icons[i], icons[j]);
                accelerations[i].x += force.x;
                accelerations[i].y += force.y;
            }
        }
    }

    for (var i = 0; i < icons.length; i++) {
        velocities[i].x += 0.5 * accelerations[i].x;
        velocities[i].y += 0.5 * accelerations[i].y;

        icons[i].style.left = icons[i].offsetLeft + velocities[i].x + 'px';
        icons[i].style.top = icons[i].offsetTop + velocities[i].y + 'px';

        velocities[i].x += 0.5 * accelerations[i].x;
        velocities[i].y += 0.5 * accelerations[i].y;
    }

    requestAnimationFrame(updatePositions);
}

// Start the simulation
updatePositions();
