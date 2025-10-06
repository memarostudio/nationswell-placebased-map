/**
 * One-time script to pre-render the GeoTIFF population density layer
 * Run this with Node.js to generate a PNG image that can be used instead of
 * processing the GeoTIFF on every page load.
 *
 * Usage: node render-population-layer.js
 *
 * This requires: npm install canvas geotiff d3-geo
 */

import { createCanvas } from "canvas";
import * as GeoTIFF from "geotiff";
import fs from "fs";
import * as d3 from "d3-geo";

// Render at 2x resolution for better quality when zoomed
const SCALE = 2;
const WIDTH = 975 * SCALE;
const HEIGHT = 610 * SCALE;

async function renderPopulationLayer() {
  console.log("Loading GeoTIFF...");

  // Load the GeoTIFF using fromFile for Node.js
  const tiff = await GeoTIFF.fromFile("./data/GEOTIFFusa_pd_2020_1km.tif");
  const image = await tiff.getImage();
  const rasters = await image.readRasters();
  const bbox = image.getBoundingBox();

  const georaster = {
    width: image.getWidth(),
    height: image.getHeight(),
    data: rasters[0],
    bbox: bbox,
  };

  console.log("GeoTIFF loaded:", georaster.width, "x", georaster.height);
  console.log("Bbox:", bbox);

  // Create canvas at 2x resolution
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Create projection scaled up by SCALE factor
  const projection = d3
    .geoAlbersUsa()
    .scale(1300 * SCALE)
    .translate([487.5 * SCALE, 305 * SCALE]);

  // Get GeoTIFF bounds
  const [west, south, east, north] = georaster.bbox;
  const geoWidth = east - west;
  const geoHeight = north - south;

  // Find min/max values for normalization
  let minVal = Infinity;
  let maxVal = -Infinity;
  const values = [];

  console.log("Calculating value range...");
  for (let i = 0; i < georaster.data.length; i++) {
    const val = georaster.data[i];
    if (val > 0) {
      minVal = Math.min(minVal, val);
      maxVal = Math.max(maxVal, val);
      values.push(val);
    }
  }

  values.sort((a, b) => a - b);
  const p50 = values[Math.floor(values.length * 0.5)];
  const p95 = values[Math.floor(values.length * 0.95)];

  console.log("Value range:", minVal, "to", maxVal);
  console.log("Median (p50):", p50, "95th percentile:", p95);

  // Use logarithmic scale
  const logMin = Math.log(minVal + 1);
  const logMax = Math.log(maxVal + 1);

  // Create image data
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  const pixels = imageData.data;

  let renderedPixels = 0;

  console.log("Rendering canvas...");

  // Iterate through canvas pixels and sample from GeoTIFF
  for (let py = 0; py < HEIGHT; py++) {
    if (py % 100 === 0) console.log(`Progress: ${py}/${HEIGHT}`);

    for (let px = 0; px < WIDTH; px++) {
      // Convert canvas pixel to geographic coordinates
      const coords = projection.invert([px, py]);
      if (!coords) continue;

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

      if (value <= 0) continue;

      // Normalize value using logarithmic scale
      const logValue = Math.log(value + 1);
      const normalized = Math.min(
        1,
        Math.max(0, (logValue - logMin) / (logMax - logMin))
      );

      const pixelIdx = (py * WIDTH + px) * 4;

      // Color scheme: light blue (#7C99FF) to dark blue (#001251)
      const lightBlue = { r: 124, g: 153, b: 255 };
      const darkBlue = { r: 0, g: 18, b: 81 };

      const r = Math.floor(
        lightBlue.r + (darkBlue.r - lightBlue.r) * normalized
      );
      const g = Math.floor(
        lightBlue.g + (darkBlue.g - lightBlue.g) * normalized
      );
      const b = Math.floor(
        lightBlue.b + (darkBlue.b - lightBlue.b) * normalized
      );

      pixels[pixelIdx] = r;
      pixels[pixelIdx + 1] = g;
      pixels[pixelIdx + 2] = b;
      pixels[pixelIdx + 3] = 255; // Full opacity in the PNG

      renderedPixels++;
    }
  }

  console.log("Canvas pixels rendered:", renderedPixels);

  // Put image data on canvas
  ctx.putImageData(imageData, 0, 0);

  // Save as PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./data/population-density-layer.png", buffer);

  console.log("✅ Successfully saved to ./data/population-density-layer.png");
  console.log(`   Resolution: ${WIDTH}x${HEIGHT} (${SCALE}x scale)`);
}

renderPopulationLayer().catch(console.error);
