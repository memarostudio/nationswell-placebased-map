import { html, useState } from "./preact-htm.js";

export function Marker({ marker, handleMarkerHover, handleMarkerClick, x, y }) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dynamic width based on marker name length
  const baseWidth = 0; // minimum width
  const charWidth = 7.75; // average width per character (adjust as needed)
  const textWidth = baseWidth + marker.name.length * charWidth;

  console.log(
    `Rendering marker: ${marker.name} at (${x}, ${y} with textWidth: ${textWidth})`
  );

  return html`
    <g
      class="marker pointer-events-auto cursor-pointer"
      onclick=${(event) => handleMarkerClick(event, marker)}
      onMouseEnter=${() => {
        setIsHovered(true);
        handleMarkerHover(marker);
      }}
      onMouseLeave=${() => {
        setIsHovered(false);
        // handleMarkerHover(null);
      }}
    >
      <g
        class="marker-default ${isHovered
          ? "opacity-0"
          : "opacity-100"} transition-opacity duration-300"
      >
        <circle cx=${x} cy=${y} r="${24 / 2}" class="fill-white" />
      </g>

      <g
        class="marker-hovered ${isHovered
          ? "opacity-100"
          : "opacity-0"} transition-opacity duration-300"
      >
        <circle
          cx=${x}
          cy=${y}
          r="${66 / 2}"
          fill="#061A6199"
          stroke="#061A61"
          stroke-width="2"
        />
        <circle cx=${x} cy=${y} r="${14 / 2}" class="fill-white" />
      </g>
    </g>
  `;
}
