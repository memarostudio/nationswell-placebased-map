import { html, useState } from "./preact-htm.js";

export function Marker({ marker, handleMarkerClick, x, y }) {
  const [isHovered, setIsHovered] = useState(false);

  return html`
    <g
      class="marker pointer-events-auto cursor-pointer"
      onclick=${(event) => handleMarkerClick(event, marker)}
      onMouseEnter=${() => setIsHovered(true)}
      onMouseLeave=${() => setIsHovered(false)}
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
