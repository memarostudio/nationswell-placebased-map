import { html, useState, useRef } from "./preact-htm.js";
import {
  stateMapping,
  latLonToScreen,
  getTouchDistance,
  getTouchCenter,
} from "./helper.js";
import { Marker } from "./marker.js";
import { Overlay } from "./overlay.js";
import { MarkerDetails } from "./markerDetails.js";
import { FocusAreaGroupLegend } from "./focusAreas.js";

export function Map({ usGeoData, places, partners, allFocusAreas }) {
  console.log(
    "Rendering Map with usGeoData:",
    usGeoData,
    "and placesData:",
    places,
    "and partnersData:",
    partners,
    "and allFocusAreas:",
    allFocusAreas
  );

  // map state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialPinchZoom, setInitialPinchZoom] = useState(1);
  const [pinchCenter, setPinchCenter] = useState({ x: 0, y: 0 });
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

  // state shapes
  const states = topojson.feature(usGeoData, usGeoData.objects.states).features;
  const statesArray = states.map((d) => {
    return {
      name: d.properties.name,
      id: stateMapping[d.properties.name],
      path: d3.geoPath()(d), // The TopoJSON is already pre-projected to pixel coordinates (Albers USA), so we use identity projection for the SVG paths
      fillColor: "#ADC7FF",
    };
  });

  // markers - group places by lat and lon to handle same-location cases, group together when markers would overlap
  const groupedPlaces = {};
  places
    .filter((p) => p.lat !== 0 && p.lon !== 0)
    .forEach((place) => {
      const key = `${place.lat.toFixed(4)}_${place.lon.toFixed(4)}`; // Group by lat/lon rounded to 4 decimal places, TODO: make clustering zoom dependent
      if (!groupedPlaces[key]) {
        groupedPlaces[key] = [];
      }
      groupedPlaces[key].push(place);
    });

  // dimensions
  const width = 975;
  const height = 610;

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

  function closeFocusAreaDropdown() {
    const containerElement = document.getElementById(
      "focus-areas-dropdown-container"
    );
    if (containerElement) {
      containerElement.style.display = "none";
    }
  }

  // Panning handlers
  function handleMouseDown(e) {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
    closeFocusAreaDropdown();
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

  // Touch handlers for mobile and tablets
  function handleTouchStart(e) {
    closeFocusAreaDropdown();

    if (e.touches.length === 1) {
      // Single touch - start panning
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      // Two touches - start pinching
      e.preventDefault();
      setIsDragging(false); // Stop any panning
      setIsPinching(true);

      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);

      setInitialPinchDistance(distance);
      setInitialPinchZoom(zoom);
      setPinchCenter(center);
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 1 && isDragging && !isPinching) {
      // Single touch panning
      e.preventDefault();
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && isPinching) {
      // Two touch pinch-to-zoom
      e.preventDefault();

      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);

      // Calculate zoom based on distance change (with reduced sensitivity)
      const rawZoomFactor = currentDistance / initialPinchDistance;
      // Reduce sensitivity by using a dampening factor
      const zoomFactor = 1 + (rawZoomFactor - 1) * 0.5;
      const newZoom = Math.min(
        Math.max(initialPinchZoom * zoomFactor, MIN_ZOOM),
        MAX_ZOOM
      );

      // Use the existing zoomToPoint function with the FIXED initial pinch center
      // This keeps the zoom focal point completely stable
      zoomToPoint(newZoom, pinchCenter.x, pinchCenter.y);

      // Reset pan when zooming out to minimum
      if (newZoom === MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
        setZoom(MIN_ZOOM);
      }
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      // All touches ended
      setIsDragging(false);
      setIsPinching(false);
    } else if (e.touches.length === 1 && isPinching) {
      // Went from two touches to one - switch from pinching to panning
      setIsPinching(false);
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
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
    transition: isDragging || isPinching ? "none" : "transform 0.3s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
  };

  function handleMarkerClick(event, markerGroup) {
    setShowMarkerDetails(true);

    const markerRect = event.target.getBoundingClientRect();
    const containerRect = mapContainerRef.current.getBoundingClientRect();

    const markerCenterX =
      markerRect.left - containerRect.left + markerRect.width / 2;

    const popupWidth = 448;
    const popupHeight = 318;

    const offsetX = markerCenterX + 33 + 9;

    let finalX = offsetX;
    if (offsetX + popupWidth > containerRect.width) {
      finalX = markerCenterX - popupWidth - 33 - 9;
    }

    setMarkerDetails({
      markerGroup,
      x: finalX,
      y: markerRect.top - containerRect.top + 33 - popupHeight / 2,
    });
  }

  function viewProjectDetails(placeId) {
    console.log(`Viewing details for marker with id ${placeId}`);
    setShowOverlay(true);
    setOverlayPlaceId(placeId);
    setMarkerDetails(null);
    setShowMarkerDetails(false);
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
      class="map-content relative w-full h-full select-none"
      style=${{
        ...transformStyle,
        touchAction: "none", // Prevent default touch behaviors
      }}
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
              stroke="#F0F0F0"
              stroke-width="1.5"
            />`;
          })}
        </g>
        <rect
          width=${width}
          height=${height}
          fill-opacity="0"
          onclick=${handleCloseDetails}
          pointer-events="all"
        />
        <g class="markers-layer">
          ${Object.values(groupedPlaces).map((placesGroup) => {
            const coords = latLonToScreen(
              placesGroup[0].lat,
              placesGroup[0].lon
            );
            if (!coords) return null; // Skip if outside projection bounds or undefined

            const [x, y] = coords;
            return html`<${Marker}
              markerGroup=${placesGroup}
              x=${x}
              y=${y}
              zoom=${zoom}
              handleMarkerClick=${handleMarkerClick}
              height=${height}
              numberOfMarkers=${placesGroup.length}
              allFocusAreas=${allFocusAreas}
            />`;
          })}
        </g>
      </svg>
    </div>
    ${showMarkerDetails &&
    html`<${MarkerDetails}
      markerDetails=${markerDetails}
      viewProjectDetails=${viewProjectDetails}
      handleCloseDetails=${handleCloseDetails}
    />`}
    <div
      class="map-buttons absolute bottom-12 right-4 z-10 flex flex-col space-y-2"
    >
      <button
        class="map-button border border-solid text-[#2E5AF4] text-xl border-[#2E5AF4] h-[30px] w-[30px] rounded-[50%] bg-[#dfe3f0] hover:bg-[#cdd1e0] transition-colors"
        onClick=${handleZoomIn}
      >
        +
      </button>
      <button
        class="map-button border border-solid text-[#2E5AF4] text-xl border-[#2E5AF4] h-[30px] w-[30px] rounded-[50%] bg-[#dfe3f0] hover:bg-[#cdd1e0] transition-colors"
        onClick=${handleZoomOut}
      >
        -
      </button>
    </div>
    <${FocusAreaGroupLegend} allFocusAreas=${allFocusAreas} />
    ${showOverlay &&
    html`<${Overlay}
      place=${places.filter((p) => p.id === overlayPlaceId)[0]}
      partners=${partners}
      allFocusAreas=${allFocusAreas}
      handleCloseOverlay=${handleCloseOverlay}
    />`}
  </div> `;
}
