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

// For the canvas overlay, we need to create a projection that matches
// the pre-projected coordinate space. The default Albers USA projection
// with scale(1300) and translate([487.5, 305]) creates a 975x610 space.
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
  const [georaster, setGeoraster] = useState(null);
  const canvasRef = useRef(null);

  // fetch US Geo data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/states-albers-10m.json"
    )
      .then((res) => res.json())
      .then(setUsGeoData);
  }, []);

  //   fetch and parse GeoTIFF
  useEffect(() => {
    async function loadGeoTIFF() {
      try {
        const response = await fetch("./data/GEOTIFFusa_pd_2020_1km.tif");
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const rasters = await image.readRasters();
        const bbox = image.getBoundingBox();

        setGeoraster({
          width: image.getWidth(),
          height: image.getHeight(),
          data: rasters[0], // First band
          bbox: bbox, // [west, south, east, north]
        });
        console.log("GeoTIFF loaded:", rasters, bbox);
      } catch (error) {
        console.error("Error loading GeoTIFF:", error);
      }
    }
    loadGeoTIFF();
  }, []);

  const width = 975;
  const height = 610;

  // render GeoTIFF to canvas when data is ready
  useEffect(() => {
    if (!georaster || !canvasRef.current) return;

    console.log("Rendering GeoTIFF to canvas...", georaster);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get GeoTIFF bounds
    const [west, south, east, north] = georaster.bbox;
    const geoWidth = east - west;
    const geoHeight = north - south;

    console.log("GeoTIFF bbox:", georaster.bbox);
    console.log("GeoTIFF dimensions:", georaster.width, "x", georaster.height);

    // Find min/max values for normalization using logarithmic scale
    let minVal = Infinity;
    let maxVal = -Infinity;
    const values = [];

    for (let i = 0; i < georaster.data.length; i++) {
      const val = georaster.data[i];
      if (val > 0) {
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
        values.push(val);
      }
    }

    // Calculate percentiles for better color distribution
    values.sort((a, b) => a - b);
    const p50 = values[Math.floor(values.length * 0.5)];
    const p95 = values[Math.floor(values.length * 0.95)];

    console.log("GeoTIFF value range:", minVal, "to", maxVal);
    console.log("GeoTIFF median (p50):", p50, "95th percentile:", p95);

    // Use logarithmic scale for better distribution
    const logMin = Math.log(minVal + 1);
    const logMax = Math.log(maxVal + 1);

    // Create inverse projection (screen -> geo)
    const projectionInverse = projection.invert;

    // Create image data for the canvas
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    let renderedPixels = 0;

    // REVERSE APPROACH: Iterate through canvas pixels and sample from GeoTIFF
    // This is more efficient and prevents overwriting
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        // Convert canvas pixel to geographic coordinates
        const coords = projectionInverse([px, py]);
        if (!coords) continue; // Skip if outside projection

        const [lon, lat] = coords;

        // Check if coordinates are within GeoTIFF bounds
        if (lon < west || lon > east || lat < south || lat > north) continue;

        // Convert geographic coordinates to GeoTIFF pixel indices
        const gx = Math.floor(((lon - west) / geoWidth) * georaster.width);
        const gy = Math.floor(((north - lat) / geoHeight) * georaster.height);

        // Bounds check
        if (gx < 0 || gx >= georaster.width || gy < 0 || gy >= georaster.height)
          continue;

        // Sample the value from GeoTIFF
        const idx = gy * georaster.width + gx;
        const value = georaster.data[idx];

        if (value <= 0) continue; // Skip nodata

        // Normalize value using logarithmic scale for better distribution
        const logValue = Math.log(value + 1);
        const normalized = Math.min(
          1,
          Math.max(0, (logValue - logMin) / (logMax - logMin))
        );

        const pixelIdx = (py * width + px) * 4;

        // Color scheme: blue (low) to yellow to red (high) gradient
        let r, g, b;
        if (normalized < 0.5) {
          // Blue to yellow
          const t = normalized * 2;
          r = Math.floor(t * 255);
          g = Math.floor(t * 255);
          b = Math.floor((1 - t) * 255);
        } else {
          // Yellow to red
          const t = (normalized - 0.5) * 2;
          r = 255;
          g = Math.floor((1 - t) * 255);
          b = 0;
        }

        pixels[pixelIdx] = r; // Red
        pixels[pixelIdx + 1] = g; // Green
        pixels[pixelIdx + 2] = b; // Blue
        pixels[pixelIdx + 3] = 180; // Alpha (slightly more transparent)

        renderedPixels++;
      }
    }

    console.log("Canvas pixels rendered:", renderedPixels);

    ctx.putImageData(imageData, 0, 0);
  }, [georaster]);

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

  return html`<div class="inner-map">
    <svg class="map-svg" viewBox="0 0 ${width} ${height}">
      ${statesArray.map((state) => {
        return html`<path
          d=${state.path}
          fill=${state.fillColor}
          stroke="var(--color-palette--blue)"
          stroke-width="1"
        />`;
      })}
    </svg>
    <canvas ref=${canvasRef} class="map-canvas"></canvas>
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
