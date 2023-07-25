// script.js - N-body simulation with Newtonian gravity calculations

// Get the icons
var icon1 = document.getElementById('home');
var icon2 = document.getElementById('about');
// var icon3 = document.getElementById('email');
// var icon4 = document.getElementById('twitter');
// var icon5 = document.getElementById('github');
// var icon6 = document.getElementById('yt');
// var icon7 = document.getElementById('linkedin');
// Add more icons as needed

// Set up the gravitational constant (adjust as needed for your simulation)
var G = 0.000000001;

// Create an array to store the icons
var icons = [icon1, icon2];
// var icons = [icon1, icon2, icon3, icon4, icon5, icon6, icon7];
// Add more icons to the array as needed

// Initialize initial velocities and accelerations to zero for all icons
var velocities = Array.from({ length: icons.length }, () => ({ x: 0, y: 0 }));
var accelerations = Array.from({ length: icons.length }, () => ({ x: 0, y: 0 }));

// Function to set initial positions of the icons
function setInitialPositions() {
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;

    for (var i = 0; i < icons.length; i++) {
        var initialX = Math.random() * containerWidth; // Random initial X position
        var initialY = Math.random() * containerHeight; // Random initial Y position

        icons[i].style.left = initialX + 'px';
        icons[i].style.top = initialY + 'px';

        velocities[i] = { x: 0, y: 0 };
        accelerations[i] = { x: 0, y: 0 };
    }
}

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

// Function to calculate the gravitational force between an icon and central mass
function calculateGravitationalForceCentral(icon) {
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;
    
    var dx = icon.offsetLeft - (containerWidth / 2);
    var dy = icon.style.top - (containerHeight / 2);
    var distanceSquared = dx * dx + dy * dy;
    var forceMagnitude = G * 1000 / distanceSquared;

    var angle = Math.atan2(dy, dx);
    var forceX = forceMagnitude * Math.cos(angle);
    var forceY = forceMagnitude * Math.sin(angle);

    return { x: forceX, y: forceY };
}

// Function to update the positions of the icons using kick-drift-kick method
function updatePositions() {
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;

    var timestep = 0.00001;
    var halfTimestep = timestep / 2;
    
    for (var i = 0; i < icons.length; i++) {
        accelerations[i].x = 0;
        accelerations[i].y = 0;

        // // Force from "black hole"
        // var force = calculateGravitationalForceCentral(icons[i]);
        // accelerations[i].x += force.x;
        // accelerations[i].y += force.y;

        for (var j = 0; j < icons.length; j++) {
            if (i !== j) {
                var force = calculateGravitationalForce(icons[i], icons[j]);
                accelerations[i].x += force.x;
                accelerations[i].y += force.y;
            }
        }

        console.log(accelerations[i].x, accelerations[i].y);

        velocities[i].x += 0.5 * accelerations[i].x * halfTimestep ** 2;
        velocities[i].y += 0.5 * accelerations[i].y * halfTimestep ** 2;

        console.log(velocities[i].x, velocities[i].y);

        // Update icon positions with periodic boundary conditions
        var newLeft = (icons[i].offsetLeft + (velocities[i].x * timestep)) % containerWidth;
        var newTop = (icons[i].offsetTop + (velocities[i].y * timestep)) % containerHeight;
        console.log(newLeft, newTop);
        // Handle negative values (when the icon crosses the left or top boundary)
        newLeft = (newLeft >= 0) ? newLeft : containerWidth + newLeft;
        newTop = (newTop >= 0) ? newTop : containerHeight + newTop;

        console.log(newLeft, newTop);

        icons[i].style.left = newLeft + 'px';
        icons[i].style.top = newTop + 'px';

        console.log(icons[i].style.left, icons[i].style.top);

        velocities[i].x += 0.5 * accelerations[i].x * halfTimestep ** 2;
        velocities[i].y += 0.5 * accelerations[i].y * halfTimestep ** 2;

    }
    
    requestAnimationFrame(updatePositions);
}

// Function to show tooltip on mouseover
function showTooltip(event) {
    var icon = event.target.closest('.icon-link');
    if (!icon) return;
  
    var tooltipText = icon.getAttribute('data-tooltip');
    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    document.body.appendChild(tooltip);
  
    var rect = icon.getBoundingClientRect();
    tooltip.style.top = (rect.top - 30) + 'px'; // Adjust the distance of the tooltip from the icon
    tooltip.style.left = (rect.left + rect.width / 2) + 'px'; // Center the tooltip horizontally
}

// Function to hide tooltip on mouseout
function hideTooltip(event) {
    var tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Set initial positions before starting the animation
setInitialPositions();

// Add event listeners for mouseover and mouseout events
for (var i = 0; i < icons.length; i++) {
    icons[i].addEventListener('mouseover', showTooltip);
    icons[i].addEventListener('mouseout', hideTooltip);
}

// Start the simulation
updatePositions();
