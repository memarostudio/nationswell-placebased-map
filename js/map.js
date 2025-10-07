import { html, useState, useRef } from "./preact-htm.js";
import { stateMapping, latLonToScreen } from "./helper.js";
import { Marker } from "./marker.js";
import { Overlay } from "./overlay.js";
import { MarkerDetails } from "./markerDetails.js";

export function Map({ usGeoData, places }) {
  console.log(
    "Rendering Map with usGeoData:",
    usGeoData,
    "and placesData:",
    places
  );

  // map state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  const [showMarkerDetails, setShowMarkerDetails] = useState(false);
  const [markerDetails, setMarkerDetails] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPlaceId, setOverlayPlaceId] = useState(null);

  if (!usGeoData) {
    return html`<div>Loading US Geo data...</div>`;
  }
  if (!places) {
    return html`<div>Loading Places data...</div>`;
  }

  const states = topojson.feature(usGeoData, usGeoData.objects.states).features;

  const statesArray = states.map((d) => {
    return {
      name: d.properties.name,
      id: stateMapping[d.properties.name],
      path: d3.geoPath()(d), // The TopoJSON is already pre-projected to pixel coordinates (Albers USA), so we use identity projection for the SVG paths
      fillColor: "#7C99FF",
    };
  });

  const width = 975;
  const height = 610;

  const markers = [{ lat: 40.7128, lon: -74.006, label: "New York City" }];

  const ZOOM_STEP = 0.3;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;

  // Helper function to zoom toward a specific point
  function zoomToPoint(newZoom, clientX, clientY) {
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();

    // Get mouse position relative to container center
    const mouseX = clientX - rect.left - rect.width / 2;
    const mouseY = clientY - rect.top - rect.height / 2;

    // Calculate the point in the map space before zoom
    const pointX = (mouseX - pan.x) / zoom;
    const pointY = (mouseY - pan.y) / zoom;

    // Calculate new pan to keep the point under the cursor
    const newPan = {
      x: mouseX - pointX * newZoom,
      y: mouseY - pointY * newZoom,
    };

    setPan(newPan);
    setZoom(newZoom);
  }

  // Zoom to current center (for buttons)
  function zoomToCenter(newZoom) {
    // Keep the current center point fixed when zooming with buttons
    // This means we adjust pan proportionally to the zoom change
    const zoomRatio = newZoom / zoom;
    setPan({
      x: pan.x * zoomRatio,
      y: pan.y * zoomRatio,
    });
    setZoom(newZoom);
  }

  function handleZoomIn() {
    const newZoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    zoomToCenter(newZoom);
  }

  function handleZoomOut() {
    const newZoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);

    // Reset pan when zooming out to minimum
    if (newZoom === MIN_ZOOM) {
      setPan({ x: 0, y: 0 });
      setZoom(newZoom);
    } else {
      zoomToCenter(newZoom);
    }
  }

  // Panning handlers
  function handleMouseDown(e) {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  }

  function handleMouseMove(e) {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Touch handlers for mobile
  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  }

  function handleTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }

  function handleTouchEnd() {
    setIsDragging(false);
  }

  // Mouse wheel zoom
  function handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY * -0.01; // Normalize scroll direction
    const zoomChange = delta * 0.5; // Smaller steps for smoother zoom

    const newZoom = Math.min(Math.max(zoom + zoomChange, MIN_ZOOM), MAX_ZOOM);

    // Reset pan when zooming out to minimum
    if (newZoom === MIN_ZOOM) {
      setPan({ x: 0, y: 0 });
      setZoom(newZoom);
    } else {
      // Zoom to cursor position
      zoomToPoint(newZoom, e.clientX, e.clientY);
    }
  }

  // Calculate transform style for zoom and pan
  const transformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.3s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
  };

  function handleMarkerClick(event, marker) {
    setShowMarkerDetails(true);

    setMarkerDetails({ ...marker, x: event.clientX, y: event.clientY });
  }

  function viewProjectDetails(placeId) {
    console.log(`Viewing details for marker with id ${placeId}`);
    setShowOverlay(true);
    setOverlayPlaceId(placeId);
  }

  function handleCloseOverlay() {
    setShowMarkerDetails(false);
    setMarkerDetails(null);
    setShowOverlay(false);
  }

  function handleCloseDetails() {
    setShowMarkerDetails(false);
    setMarkerDetails(null);
  }

  return html`<div
    class="inner-map"
    ref=${mapContainerRef}
    class="position-relative w-full h-full overflow-hidden"
  >
    <div
      class="map-content relative w-full h-full select-none touch-none"
      style=${transformStyle}
      onMouseDown=${handleMouseDown}
      onMouseMove=${handleMouseMove}
      onMouseUp=${handleMouseUp}
      onMouseLeave=${handleMouseUp}
      onTouchStart=${handleTouchStart}
      onTouchMove=${handleTouchMove}
      onTouchEnd=${handleTouchEnd}
      onWheel=${handleWheel}
    >
      <svg
        class="map-svg absolute top-0 left-0 w-full h-full object-contain block"
        viewBox="0 0 ${width} ${height}"
      >
        ${statesArray.map((state) => {
          return html`<path d=${state.path} fill=${state.fillColor} />`;
        })}
      </svg>
      <img
        src="https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/population-density-layer_adjusted1.png"
        class="map-overlay absolute top-0 left-0 w-full h-full object-contain block pointer-events-none opacity-90 object-contain "
        alt="Population density overlay"
        width="${width}"
        height="${height}"
        style="image-rendering: auto;"
      />

      <svg
        class="map-svg absolute top-0 left-0 w-full h-full object-contain block"
        viewBox="0 0 ${width} ${height}"
      >
        <g class="states-layer">
          ${statesArray.map((state) => {
            return html`<path
              d=${state.path}
              fill="none"
              stroke="var(--color-palette--blue)"
              stroke-width="1.5"
            />`;
          })}
        </g>
        <g class="markers-layer">
          ${places.map((marker) => {
            const coords = latLonToScreen(marker.lat, marker.lon);
            if (!coords) return null; // Skip if outside projection bounds or undefined

            const [x, y] = coords;
            return html`<${Marker}
              marker=${marker}
              x=${x}
              y=${y}
              handleMarkerClick=${handleMarkerClick}
            />`;
          })}
        </g>
      </svg>
      ${showMarkerDetails &&
      html`<${MarkerDetails}
        markerDetails=${markerDetails}
        viewProjectDetails=${viewProjectDetails}
        handleCloseDetails=${handleCloseDetails}
      />`}
    </div>
    <div
      class="map-buttons absolute bottom-10 right-4 z-10 flex flex-col space-y-2"
    >
      <button
        class="map-button border border-solid border-white"
        onClick=${handleZoomIn}
      >
        +
      </button>
      <button
        class="map-button border border-solid border-white"
        onClick=${handleZoomOut}
      >
        -
      </button>
    </div>
    ${showOverlay &&
    html`<${Overlay}
      place=${places.filter((p) => p.id === overlayPlaceId)[0]}
      handleCloseOverlay=${handleCloseOverlay}
    />`}
  </div>`;
}
