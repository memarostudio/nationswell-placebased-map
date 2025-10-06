import {
  html,
  renderComponent,
  useEffect,
  useState,
  useRef,
} from "./js/preact-htm.js";

// The TopoJSON is already pre-projected to pixel coordinates (Albers USA)
// So we use identity projection for the SVG paths
const geoPath = d3.geoPath();

// For converting lat/long to screen coordinates, we need the projection
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);

console.log("Script for place-based map loaded.");

const containerElement = document.getElementById("map");
if (containerElement) {
  // clear existing content before rendering
  containerElement.innerHTML = "";

  // wait for async Vis to resolve before rendering
  (async () => {
    renderComponent(html`<${Map} />`, containerElement);
  })();
} else {
  console.error(`Could not find container element for vis with id ${vis.id}`);
}

function Map() {
  const [usGeoData, setUsGeoData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef(null);

  // fetch US Geo data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/states-albers-10m.json"
    )
      .then((res) => res.json())
      .then(setUsGeoData);
  }, []);

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

  // Example marker - you can add more or make this dynamic
  const markers = [
    { lat: 40.7128, lon: -74.006, label: "New York City" }, // NYC
    // Add more markers here as needed
  ];

  // Convert lat/lon to screen coordinates
  function latLonToScreen(lat, lon) {
    const coords = projection([lon, lat]);
    return coords;
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

  function handleMarkerClick(marker) {
    alert(`Marker clicked: ${marker.label}`);
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
            if (!coords) return null; // Skip if outside projection bounds

            const [x, y] = coords;
            return html`<g
              class="marker"
              onclick=${() => handleMarkerClick(marker)}
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
    </div>
    <div class="map-buttons">
      <button class="map-button" onClick=${handleZoomIn}>+</button>
      <button class="map-button" onClick=${handleZoomOut}>-</button>
    </div>
  </div>`;
}

// mapping from state name to state short id
export const stateMapping = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};
