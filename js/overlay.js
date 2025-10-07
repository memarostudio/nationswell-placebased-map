import { html } from "./preact-htm.js";

export function Overlay({ place, handleCloseOverlay }) {
  if (!place) {
    return null;
  }
  return html`<div class="map-details-overlay">
    <div class="map-details-content">
      <svg
        class="close-icon"
        onclick=${handleCloseOverlay}
        width="34"
        height="35"
        viewBox="0 0 34 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.7574 13.56L17 17.8027M17 17.8027L21.2426 22.0453M17 17.8027L21.2426 13.56M17 17.8027L12.7574 22.0453"
          stroke="#FBF9F4"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p>details view of ${place.name}</p>
    </div>
    <div class="map-details-background"></div>
  </div>`;
}
