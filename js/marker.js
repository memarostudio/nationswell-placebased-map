import { html, useState } from "./preact-htm.js";

export function Marker({ marker, handleMarkerClick, x, y }) {
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

        <g class="tooltip-layer" transform="translate(0, 1)">
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
            font-size="14"
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

//  <rect
//           x="${x + 66 / 2 + 3}"
//           y="${y - 28 / 2}"
//           width="${textWidth}"
//           height="28"
//           rx="6"
//           ry="6"
//           class="fill-black"
//         />
//         <text
//           x="${x + 66 / 2 + 3 + 10}"
//           y="${y}"
//           dy="1"
//           class="fill-white font-authentic text-sm line-height-[20px]"
//           dominant-baseline="middle"
//           >${marker.name}</text
//         >
