// ---- Configuration & State ----
const STORAGE_KEY = 'euclid_home_view';
const MAIN_KEY    = 'main';
let regions       = {};
let currentKey    = MAIN_KEY;
let idleTimer;
let viewer;

/** Initialize the OpenSeadragon viewer */
function initViewer() {
  viewer = OpenSeadragon({
    element: 'viewer',
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.0.0/images/',
    
    // Start 4× zoom when the image opens:
    defaultZoomLevel: 1,
    
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
      pinchToZoom: true
    },

    // Mobile gesture settings 
    gestureSettingsTouch: {
      scrollToZoom: false,
      pinchToZoom: true,
      clickToZoom: false,
      dblClickToZoom: false,
      flickEnabled: true
    },
  });

  // Add the handlers
  viewer.addHandler('open', () => {
      renderRegions(currentKey);   // draw hotspots
      toggleBackButton();          // show/hide back-arrow
  });

}

/** Load regions.yaml and kick things off */
function loadRegions() {
  fetch('regions.yaml')
    .then(res => res.text())
    .then(txt => {
      regions = jsyaml.load(txt) || {};
      console.log('Regions loaded:', regions);
      openMainImage();
    })
    .catch(err => console.error('YAML load failed:', err));
}

/** Open the main DZI and render its hotspots */
function openMainImage() {
  viewer.open(`${MAIN_KEY}/euclid.dzi`);
}

/** Draw hotspots for a given key */
function renderRegions(key) {
  viewer.clearOverlays();

  (regions[key] || []).forEach(def => {
    // 2) Find the region center in viewport coordinates
    const imgPt = new OpenSeadragon.Point(def.x_px, def.y_px);
    const vpCenter = viewer.viewport.imageToViewportCoordinates(imgPt);

    // 3) Build a small viewport‐space rectangle centered on that point
    const vpRect = new OpenSeadragon.Rect(
      vpCenter.x,
      vpCenter.y,
      0.01,
      0.01
    );

    console.log('Creating hotspot for', def.name, 'at', vpRect);

    // 4) Create the hotspot element
    const elt = document.createElement('div');
    elt.className = 'region-hotspot';

    // 5) Add it as an overlay
    viewer.addOverlay(elt, vpRect);

    // 6) Attach the MouseTracker for clicks
    new OpenSeadragon.MouseTracker({
      element: elt,
      clickHandler: () => switchTo(def.target)
    }).setTracking(true);
  });
}

/** Remove all existing hotspot elements */
function clearHotspots() {
  document.querySelectorAll('.region-hotspot').forEach(e => e.remove());
}

/** Handler when a hotspot is clicked */
function onHotspotClick(def) {
  console.log('hotspot clicked', def.name, '->', def.target);
  switchTo(def.target);
}

/** Show/hide the back-arrow based on currentKey */
function toggleBackButton() {
  const btn = document.getElementById('backMain');
  if (currentKey === MAIN_KEY) {
    btn.classList.add('hidden');
  } else {
    btn.classList.remove('hidden');
  }
}

/** Switch the viewer to another DZI */
function switchTo(key) {

  /** Restart the idle timer */
  clearTimeout(idleTimer);

  /** Set the current key */
  currentKey = key;

  /* Handle the stupid naming convention I used for the main image while 
   * Getting the file we need to open. */
  const file = key === MAIN_KEY ? 'euclid.dzi' : `${key}.dzi`;

  console.log('switchTo', key, file);

  /** Open the new DZI */
  viewer.open(`${key}/${file}`);
}

/** Restore saved home view if any */
function maybeRestoreHome(key) {
  if (key !== MAIN_KEY) return;
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved) {
    viewer.viewport.fitBounds(
      new OpenSeadragon.Rect(saved.x, saved.y, saved.width, saved.height),
      true
    );
  }
}

/** Schedule auto-return to MAIN_KEY after 30s */
function scheduleReturnMain() {
  idleTimer = setTimeout(() => switchTo(MAIN_KEY), 30000);
}

/** Save current viewport as “home” */
function saveHomeView() {
  const b = viewer.viewport.getBounds();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  console.log('Home view saved', b);
  document.getElementById('saveHome').classList.add('hidden');
  scheduleReturnMain();
}

/** Initialize control buttons */
function initControls() {
  document.getElementById('saveHome')
    .addEventListener('click', saveHomeView);
  document.getElementById('backMain')
    .addEventListener('click', () => switchTo(MAIN_KEY));
}

/** Kick everything off */
function init() {
  localStorage.removeItem(STORAGE_KEY);
  initViewer();
  initControls();
  loadRegions();
}

// Wait for the HTML to be parsed before we look up any elements
document.addEventListener('DOMContentLoaded', init);
