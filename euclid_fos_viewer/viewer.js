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
let viewHistory = [];
let defaultZoom = 1.0;
let zoomReturnArmed = false;
let canvasOverlay;
let iconImg = new Image();
iconImg.src = "clickMe-512px.png"; // your downsampled PNG
let currentHotspotDefs = [];

/** Initialize the OpenSeadragon viewer
 *
 *  Note that this needs killing everytime we open a new image.
 */
function initViewer() {
  viewer = OpenSeadragon({
    element: "viewer",
    prefixUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.0.0/images/",
    fullPage: true,
    blendTime: 0,
    animationTime: 0,
    immediateRender: true,
    defaultZoomLevel: defaultZoom,
    maxZoomPixelRatio: 4,
    minZoomImageRatio: 0.45,
    showNavigator: false,
    gestureSettingsMouse: {
      scrollToZoom: true,
      clickToZoom: false,
      dblClickToZoom: false,
      pinchToZoom: true,
    },
    gestureSettingsTouch: {
      scrollToZoom: false,
      pinchToZoom: true,
      clickToZoom: false,
      dblClickToZoom: false,
      flickEnabled: true,
    },
  });

  viewer.addHandler("open", () => {
    // clear any old overlay
    if (canvasOverlay) {
      canvasOverlay.clear();
    }
    // create a new CanvasOverlay
    canvasOverlay = OpenSeadragonCanvasOverlay(viewer);

    // redraw on every pan/zoom
    canvasOverlay.canvas.addHandler("update", drawHotspots);

    // global click handler
    viewer.addHandler("canvas-click", onCanvasClick);

    // now call renderRegions to set up defs & draw immediately
    renderRegions(currentKey);
    toggleBackButton();
    document.querySelector("#viewer .openseadragon-canvas").style.opacity = 1;
    zoomReturnArmed = true;
  });

  // // Watch zoom changes to catch when we should go back
  // viewer.addHandler("zoom", (evt) => {
  //   // Get the viewport and zoom level
  //   const vp = viewer.viewport;
  //   const minZ = vp.getMinZoom();
  //   const curZ = evt.zoom;
  //
  //   // When user zooms out to (or below) that minimum, go back
  //   if (zoomReturnArmed && curZ <= minZ + 1e-6) {
  //     zoomReturnArmed = false;
  //     // guard so we only trigger once per “reaching min”
  //     if (currentKey !== MAIN_KEY) {
  //       zoomReturnTo();
  //     }
  //   }
  // });

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

/** Set the default zoom level for the viewer.
 *
 * This is a simple helper to update the default zoom level for each
 * new image opened in the viewer.
 */
function setDefaultZoom(zoom) {
  defaultZoom = zoom;
}

/** Draw hotspots for a given key.
 *
 * This function is called whenever a new image is opened in the viewer
 * and it renders the hotspots defined in the regions.yaml file for that key.
 */
/** Draw hotspots for a given key. */
function renderRegions(key) {
  currentHotspotDefs = regions[key] || [];
  // force an immediate draw (so you don't wait for the next pan/zoom)
  drawHotspots({
    context: canvasOverlay.context,
    viewportToViewerElement: canvasOverlay.viewportToViewerElement,
  });
}

/** Internal: draw all currentHotspotDefs into the overlay canvas */
function drawHotspots(event) {
  const ctx = event.context;
  const toViewer = event.viewportToViewerElement;
  const defs = currentHotspotDefs;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // get full image width in px
  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) return;
  const imgW = tiledImage.getContentSize().x;

  // ← tweak this to resize your hotspots
  const hotspotPxSize = 40;
  const half = hotspotPxSize / 2;

  defs.forEach((def) => {
    const imgPt = new OpenSeadragon.Point(def.x_px, def.y_px);
    const vpPt = viewer.viewport.imageToViewportCoordinates(imgPt);
    const screenPt = toViewer(vpPt);

    ctx.drawImage(
      iconImg,
      screenPt.x - half,
      screenPt.y - half,
      hotspotPxSize,
      hotspotPxSize,
    );
  });
}

/** Internal: hit-test clicks against currentHotspotDefs */
function onCanvasClick(evt) {
  const point = evt.position; // in viewer‐element px
  const defs = currentHotspotDefs;

  const tiledImage = viewer.world.getItemAt(0);
  if (!tiledImage) return;
  const imgW = tiledImage.getContentSize().x;

  const hotspotPxSize = 40;
  const half = hotspotPxSize / 2;

  defs.forEach((def) => {
    const imgPt = new OpenSeadragon.Point(def.x_px, def.y_px);
    const vpPt = viewer.viewport.imageToViewportCoordinates(imgPt);
    const screenPt = canvasOverlay.viewportToViewerElement(vpPt);

    if (
      point.x >= screenPt.x - half &&
      point.x <= screenPt.x + half &&
      point.y >= screenPt.y - half &&
      point.y <= screenPt.y + half
    ) {
      setDefaultZoom(def.default_zoom || defaultZoom);
      switchTo(def.target);
    }
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

  // Fade out
  const osdCanvas = document.querySelector("#viewer .openseadragon-canvas");
  osdCanvas.style.opacity = 0;

  // Wait for the CSS fade (100ms)
  setTimeout(() => {
    // Record where we were in the history
    history.push(currentKey);
    viewHistory.push(viewer.viewport.getBounds());

    // Reset the state
    currentKey = key;

    // Now open the new DZI
    const file = key === MAIN_KEY ? "euclid.dzi" : `${key}.dzi`;
    viewer.open(`${key}/${file}`);

    // Restart the idle timer
    startIdleTimer();
  }, 100);
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

  // Get the home view from localStorage
  const homeView = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

  // Nothing to do if we are already at home
  const currentBounds = viewer.viewport.getBounds();
  if (
    homeView &&
    currentBounds.x === homeView.x &&
    currentBounds.y === homeView.y &&
    currentBounds.width === homeView.width &&
    currentBounds.height === homeView.height
  ) {
    return;
  }

  // Fade out
  const osdCanvas = document.querySelector("#viewer .openseadragon-canvas");
  osdCanvas.style.opacity = 0;

  // Wait for the CSS fade (100ms)
  setTimeout(() => {
    currentKey = MAIN_KEY;

    const url = `${MAIN_KEY}/euclid.dzi`;
    viewer.open(url);

    // Clear out the history since we are returning to the main image
    history = [];

    // Only once, when that image is ready:
    viewer.addOnceHandler("open", () => {
      // Now that DZI is loaded, we can fit to the saved bounds
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
  }, 100);
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

  // Fade out
  const osdCanvas = document.querySelector("#viewer .openseadragon-canvas");
  osdCanvas.style.opacity = 0;

  // Wait for the CSS fade (100ms)
  setTimeout(() => {
    // Reset the state
    let lastView;
    if (history.length > 0) {
      currentKey = history.pop();
      lastView = viewHistory.pop();
    } else {
      currentKey = MAIN_KEY;
      lastView = null;
    }

    // Now open the new DZI
    const file = currentKey === MAIN_KEY ? "euclid.dzi" : `${currentKey}.dzi`;
    viewer.open(`${currentKey}/${file}`);

    // Update the viewport to the last view if available
    if (lastView) {
      viewer.addOnceHandler("open", () => {
        viewer.viewport.fitBounds(
          new OpenSeadragon.Rect(
            lastView.x,
            lastView.y,
            lastView.width,
            lastView.height,
          ),
          true, // animate
        );
      });
    }

    // Restart the idle timer
    startIdleTimer();
  }, 100);
}

/** Switch to the last key in the history via zooming out.
 *
 * This function handles the logic of switching images, it will destroy
 * the existing viewer to remove an listeners and overlays,
 * then re-initialize the viewer with the new image.
 */
function zoomReturnTo() {
  clearTimeout(idleTimer);

  const osdCanvas = document.querySelector("#viewer .openseadragon-canvas");
  osdCanvas.style.opacity = 0;

  // 1) Pop history now, and capture leavingKey here
  let lastView = null;
  let leavingKey = currentKey;
  if (history.length) {
    currentKey = history.pop();
    lastView = viewHistory.pop();
  } else {
    currentKey = MAIN_KEY;
  }

  // 2) Open the new DZI
  const url = `${currentKey}/${currentKey === MAIN_KEY ? "euclid.dzi" : currentKey + ".dzi"}`;
  viewer.open(url);

  // 3) Wait for the new image to load before doing any viewport work
  viewer.addOnceHandler(
    "open",
    () => {
      // fade the canvas back in
      osdCanvas.style.opacity = 1;

      // find the region that pointed to our previous key
      const leavingRegion = regions[currentKey]?.find(
        (r) => r.target === leavingKey,
      );

      if (leavingRegion) {
        // compute its viewport-point
        const imgPt = new OpenSeadragon.Point(
          leavingRegion.x_px,
          leavingRegion.y_px,
        );
        const focusPt = viewer.viewport.imageToViewportCoordinates(imgPt);
        viewer.viewport.zoomTo(1e4, focusPt, true); // huge number to guarantee max
      } else if (lastView) {
        // otherwise restore the saved bounds
        viewer.viewport.fitBounds(lastView, true);
      }

      startIdleTimer();
    },
    { once: true },
  );
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
