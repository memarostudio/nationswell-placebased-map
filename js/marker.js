import { html } from "./preact-htm.js";

export function Marker({ marker, handleMarkerClick, x, y }) {
  return html`
    <g class="marker" onclick=${(event) => handleMarkerClick(event, marker)}>
      <g class="marker-default">
        <circle cx=${x} cy=${y} r="${24 / 2}" class="fill-white" />
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
        <circle cx=${x} cy=${y} r="${14 / 2}" class="fill-white" />
      </g>
    </g>
  `;
}
