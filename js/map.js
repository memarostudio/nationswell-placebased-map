import { html, useState, useRef } from "./preact-htm.js";
import { stateMapping } from "./helper.js";

// The TopoJSON is already pre-projected to pixel coordinates (Albers USA)
// So we use identity projection for the SVG paths
const geoPath = d3.geoPath();

// For converting lat/long to screen coordinates, we need the projection
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);

export function Map({ usGeoData }) {
  console.log("Rendering Map with usGeoData:", usGeoData);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);
  const [showMarkerDetails, setShowMarkerDetails] = useState(false);
  const [markerDetails, setMarkerDetails] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  if (!usGeoData) {
    return html`<div>Loading US Geo data...</div>`;
  }

  const states = topojson.feature(usGeoData, usGeoData.objects.states).features;

  const statesArray = states.map((d) => {
    return {
      name: d.properties.name,
      id: stateMapping[d.properties.name],
      path: geoPath(d),
      fillColor: "#7C99FF",
    };
  });

  const width = 975;
  const height = 610;

  const markers = [
    { lat: 40.7128, lon: -74.006, label: "New York City" }, // NYC
  ];

  // Convert lat/lon to screen coordinates
  function latLonToScreen(lat, lon) {
    return projection([lon, lat]);
  }

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

  function viewProjectDetails(marker) {
    console.log(`Viewing details for marker: ${marker.label}`);
    setShowOverlay(true);
  }

  function handleCloseDetails() {
    setShowMarkerDetails(false);
    setMarkerDetails(null);
    setShowOverlay(false);
  }

  return html`<div class="inner-map" ref=${mapContainerRef}>
    <div
      class="map-content"
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
      <svg class="map-svg" viewBox="0 0 ${width} ${height}">
        ${statesArray.map((state) => {
          return html`<path d=${state.path} fill=${state.fillColor} />`;
        })}
      </svg>
      <img
        src="https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/population-density-layer_adjusted1.png"
        class="map-overlay"
        alt="Population density overlay"
        width="${width}"
        height="${height}"
      />

      <svg class="map-svg" viewBox="0 0 ${width} ${height}">
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
          ${markers.map((marker) => {
            const coords = latLonToScreen(marker.lat, marker.lon);
            console.log("Marker coords for", marker.label, ":", coords);
            if (!coords) return null; // Skip if outside projection bounds

            const [x, y] = coords;
            return html`<g
              class="marker"
              onclick=${(event) => handleMarkerClick(event, marker)}
            >
              <g class="marker-default">
                <circle cx=${x} cy=${y} r="${24 / 2}" fill="white" />
              </g>

              <g class="marker-hovered">
                <circle
                  cx=${x}
                  cy=${y}
                  r="${66 / 2}"
                  fill="#061A6199"
                  stroke="#061A61"
                  stroke-width="2"
                />
                <circle cx=${x} cy=${y} r="${14 / 2}" fill="white" />
              </g>
            </g>`;
          })}
        </g>
      </svg>
      ${showMarkerDetails &&
      html`<div
        className="marker-details"
        style="top: ${markerDetails
          ? markerDetails.y
          : 0}px; left: ${markerDetails ? markerDetails.x : 0}px;"
      >
        <p>Marker Details</p>
        <button onclick=${() => viewProjectDetails(markerDetails)}>
          View project details
        </button>
      </div>`}
    </div>
    <div class="map-buttons">
      <button class="map-button" onClick=${handleZoomIn}>+</button>
      <button class="map-button" onClick=${handleZoomOut}>-</button>
    </div>
    ${showOverlay &&
    html`<div class="map-details-overlay">
      <div class="map-details-content">
        <img
          class="close-icon"
          src="https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/close.svg"
          alt="Close map details overlay"
          onclick=${handleCloseDetails}
        />
        <p>details view</p>
      </div>
      <div class="map-details-background"></div>
    </div>`}
  </div>`;
}
