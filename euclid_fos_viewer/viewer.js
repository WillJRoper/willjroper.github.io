import Regions from "./regions.js";

// ---- Configuration & State ----
const STORAGE_KEY = "euclid_home_view";
const MAIN_KEY = "main";
let currentKey = MAIN_KEY;
let idleTimer;
let viewer;
let hotspotTrackers = [];
let regions;
let history = [];

/** Initialize the OpenSeadragon viewer
 *
 *  Note that this needs killing everytime we open a new image.
 */
function initViewer() {
  viewer = OpenSeadragon({
    element: "viewer",
    prefixUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.0.0/images/",

    // Start 4× zoom when the image opens:
    defaultZoomLevel: 0.5,

    // Never allow zooming in past 4×:
    maxZoomPixelRatio: 4,

    // (optional) prevent zooming all the way out too far:
    minZoomImageRatio: 0.5,

    // Show the navigator panel
    showNavigator: true,

    // Desktop gesture settings
    gestureSettingsMouse: {
      scrollToZoom: true,
      clickToZoom: false,
      dblClickToZoom: false,
      pinchToZoom: true,
    },

    // Mobile gesture settings
    gestureSettingsTouch: {
      scrollToZoom: false,
      pinchToZoom: true,
      clickToZoom: false,
      dblClickToZoom: false,
      flickEnabled: true,
    },
  });

  // Add the handlers
  viewer.addHandler("open", () => {
    clearHotspots();
    renderRegions(currentKey); // draw hotspots
    toggleBackButton(); // show/hide back-arrow
  });

  // Make sure the idle timer is reset on any interaction
  const container = document.getElementById("viewer");
  container.addEventListener("pointerdown", startIdleTimer);
  container.addEventListener("wheel", startIdleTimer, { passive: true });
}

/** Clear all hotspots and trackers.
 *
 * This is called when switching images or when the viewer is destroyed.
 * It removes the hotspot overlays and stops tracking with mouse events
 */
function clearHotspots() {
  viewer.clearOverlays();
  hotspotTrackers.forEach((tr) => {
    tr.setTracking(false);
    tr.destroy();
  });
  hotspotTrackers = [];
}

/** Load regions.yaml and kick things off. */
async function loadRegions() {
  try {
    regions = await Regions.load("regions.yaml");
  } catch (err) {
    console.error("Failed to load regions:", err);
  }
}

/** Draw hotspots for a given key.
 *
 * This function is called whenever a new image is opened in the viewer
 * and it renders the hotspots defined in the regions.yaml file for that key.
 */
function renderRegions(key) {
  (regions[key] || []).forEach((def) => {
    // 2) Find the region center in viewport coordinates
    const imgPt = new OpenSeadragon.Point(def.x_px, def.y_px);
    const vpCenter = viewer.viewport.imageToViewportCoordinates(imgPt);

    // 3) Build a small viewport‐space rectangle centered on that point
    const vpRect = new OpenSeadragon.Rect(vpCenter.x, vpCenter.y, 0.005, 0.005);

    // 4) Create the hotspot element
    const elt = document.createElement("div");
    elt.className = "region-hotspot";

    // 5) Add it as an overlay
    viewer.addOverlay(elt, vpRect);

    // 6) Attach the MouseTracker for clicks
    const tracker = new OpenSeadragon.MouseTracker({
      element: elt,
      clickHandler: () => switchTo(def.target),
    });
    tracker.setTracking(true);
    hotspotTrackers.push(tracker);
  });
}

/** Show/hide the back-arrow based on currentKey. */
function toggleBackButton() {
  const btn = document.getElementById("backMain");
  if (currentKey === MAIN_KEY) {
    btn.classList.add("hidden");
  } else {
    btn.classList.remove("hidden");
  }
}

/** Switch to a new key (image) in the viewer.
 *
 * This function handles the logic of switching images, it will destroy
 * the existing viewer to remove an listeners and overlays,
 * then re-initialize the viewer with the new image.
 */
function switchTo(key) {
  // Abort any pending “return to main”
  clearTimeout(idleTimer);

  // If there’s an existing viewer, tear it down
  if (viewer) {
    viewer.destroy(); // removes canvas, handlers, overlays
  }

  // Record where we are going in the history
  if (currentKey !== MAIN_KEY) {
    history.push(currentKey);
  }

  // Reset the state
  currentKey = key;

  // Re-init OpenSeadragon viewer & handlers
  initViewer();

  // Now open the new DZI
  const file = key === MAIN_KEY ? "euclid.dzi" : `${key}.dzi`;
  viewer.open(`${key}/${file}`);

  // Restart the idle timer
  startIdleTimer();
}

/** Start the idle timer to return to home after 30s of inactivity.
 *
 * This function is called whenever the user interacts with the viewer,
 * such as panning or zooming.
 */
function startIdleTimer() {
  clearTimeout(idleTimer);

  // Only start the timer if we have a location to return to
  if (!localStorage.getItem(STORAGE_KEY)) {
    return;
  }

  // Set a new timer to return to home after 30 seconds of inactivity
  idleTimer = setTimeout(returnToHome, 30000);
}

/** Return to home location if it has been set.
 *
 * This function is similar to the switchTo function, but instead of switching
 * to a new image, it will jump to the saved home view on the main image.
 */
function returnToHome() {
  clearTimeout(idleTimer);

  if (viewer) {
    viewer.destroy();
  }

  currentKey = MAIN_KEY;
  initViewer(); // installs the global `open` handler

  const url = `${MAIN_KEY}/euclid.dzi`;
  viewer.open(url);

  // Clear out the history since we are returning to the main image
  history = [];

  // Only once, when that image is ready:
  viewer.addOnceHandler("open", () => {
    // Now that DZI is loaded, we can fit to the saved bounds
    const homeView = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (homeView) {
      viewer.viewport.fitBounds(
        new OpenSeadragon.Rect(
          homeView.x,
          homeView.y,
          homeView.width,
          homeView.height,
        ),
        true, // animate
      );
    }
  });

  // Restart the idle timer
  startIdleTimer();
}

/** Switch to the last key in the history or the main image.
 *
 * This function handles the logic of switching images, it will destroy
 * the existing viewer to remove an listeners and overlays,
 * then re-initialize the viewer with the new image.
 */
function returnTo() {
  // Abort any pending “return to main”
  clearTimeout(idleTimer);

  // If there’s an existing viewer, tear it down
  if (viewer) {
    viewer.destroy(); // removes canvas, handlers, overlays
  }

  // Reset the state
  if (history.length > 0) {
    currentKey = history.pop();
  } else {
    currentKey = MAIN_KEY;
  }

  // Re-init OpenSeadragon viewer & handlers
  initViewer();

  // Now open the new DZI
  const file = currentKey === MAIN_KEY ? "euclid.dzi" : `${currentKey}.dzi`;
  viewer.open(`${currentKey}/${file}`);

  // Restart the idle timer
  startIdleTimer();
}

/** Save current viewport as “home”. */
function saveHomeView() {
  const b = viewer.viewport.getBounds();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  document.getElementById("saveHome").classList.add("hidden");
  startIdleTimer();
}

/** Initialize control buttons. */
function initControls() {
  document.getElementById("saveHome").addEventListener("click", saveHomeView);
  document
    .getElementById("backMain")
    .addEventListener("click", () => returnTo());
}

/** Kick everything off */
async function init() {
  localStorage.removeItem(STORAGE_KEY);
  initViewer();
  initControls();
  await loadRegions();
  viewer.open(`${MAIN_KEY}/euclid.dzi`);
}

// Wait for the HTML to be parsed before we look up any elements
document.addEventListener("DOMContentLoaded", init);
