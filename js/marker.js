import { html, useState } from "./preact-htm.js";

export function Marker({ marker, handleMarkerClick, x, y, zoom = 1 }) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate dynamic width based on marker name length
  const baseWidth = 0; // minimum width
  const charWidth = 7.75; // average width per character (adjust as needed)
  const textWidth = baseWidth + marker.name.length * charWidth;

  // Calculate inverse scale to maintain constant size
  const inverseScale = 1 / zoom;

  return html`
    <g
      class="marker pointer-events-auto cursor-pointer transition-transform duration-300"
      transform="translate(${x}, ${y}) scale(${inverseScale}) translate(${-x}, ${-y})"
      onclick=${(event) => handleMarkerClick(event, marker)}
      onMouseEnter=${() => {
        setIsHovered(true);
      }}
      onMouseLeave=${() => {
        setIsHovered(false);
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

        <g class="tooltip-layer" transform="translate(24, 1)">
          <rect
            x="${x + 15}"
            y="${y - 15}"
            width="${marker.city.length * 7 + 24}"
            height="26"
            fill="black"
            rx="4"
            ry="4"
          />
          <text
            x="${x + 27}"
            y="${y - 2}"
            dy="1"
            fill="white"
            font-size="14px"
            font-family="system-ui, sans-serif"
            dominant-baseline="middle"
          >
            ${marker.city}
          </text>
        </g>
      </g>
    </g>
  `;
}
