import { html, renderComponent, useEffect, useState } from "./js/preact-htm.js";

// The TopoJSON is already pre-projected to pixel coordinates (Albers USA)
// So we use identity projection for the SVG paths
const geoPath = d3.geoPath();

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

  const ZOOM_STEP = 0.3;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;

  function handleZoomIn() {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM));
  }

  function handleZoomOut() {
    setZoom((prevZoom) => {
      const newZoom = Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM);
      // Reset pan when zooming out to minimum
      if (newZoom === MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
      }
      return newZoom;
    });
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

    setZoom((prevZoom) => {
      const newZoom = Math.min(
        Math.max(prevZoom + zoomChange, MIN_ZOOM),
        MAX_ZOOM
      );

      // Reset pan when zooming out to minimum
      if (newZoom === MIN_ZOOM) {
        setPan({ x: 0, y: 0 });
      }

      return newZoom;
    });
  }

  // Calculate transform style for zoom and pan
  const transformStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.3s ease-out",
    cursor: isDragging ? "grabbing" : "grab",
  };

  return html`<div class="inner-map">
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
        src="./data/population-density-layer.png"
        class="map-overlay"
        alt="Population density overlay"
        width="${width}"
        height="${height}"
      />

      <svg class="map-svg" viewBox="0 0 ${width} ${height}">
        ${statesArray.map((state) => {
          return html`<path
            d=${state.path}
            fill="none"
            stroke="var(--color-palette--blue)"
            stroke-width="1.5"
          />`;
        })}
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
