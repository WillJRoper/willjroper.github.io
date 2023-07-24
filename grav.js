// script.js - N-body simulation with Newtonian gravity calculations

// Get the icons
var icon1 = document.getElementById('home');
var icon2 = document.getElementById('about');
// Add more icons as needed

// Set up the gravitational constant (adjust as needed for your simulation)
var G = 0.01;

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

        console.log(accelerations[i].x, accelerations[i].y);

        velocities[i].x += 0.5 * accelerations[i].x;
        velocities[i].y += 0.5 * accelerations[i].y;

        // Update icon positions with periodic boundary conditions
        var iconRect = icons[i].getBoundingClientRect();
        var containerRect = document.querySelector('.video-section').getBoundingClientRect();

        if (iconRect.left + velocities[i].x < containerRect.left) {
            icons[i].style.left = (containerRect.right - iconRect.width) + 'px';
        } else if (iconRect.right + velocities[i].x > containerRect.right) {
            icons[i].style.left = containerRect.left + 'px';
        } else {
            icons[i].style.left = (iconRect.left + velocities[i].x) + 'px';
        }

        if (iconRect.top + velocities[i].y < containerRect.top) {
            icons[i].style.top = (containerRect.bottom - iconRect.height) + 'px';
        } else if (iconRect.bottom + velocities[i].y > containerRect.bottom) {
            icons[i].style.top = containerRect.top + 'px';
        } else {
            icons[i].style.top = (iconRect.top + velocities[i].y) + 'px';
        }

        velocities[i].x += 0.5 * accelerations[i].x;
        velocities[i].y += 0.5 * accelerations[i].y;

        console.log(icons[i].style.left, icons[i].style.top);
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

// Add event listeners for mouseover and mouseout events
for (var i = 0; i < icons.length; i++) {
    icons[i].addEventListener('mouseover', showTooltip);
    icons[i].addEventListener('mouseout', hideTooltip);
}

// Start the simulation
updatePositions();
