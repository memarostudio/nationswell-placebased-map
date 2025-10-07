import { html } from "./preact-htm.js";

export function Overlay({ place, handleCloseDetails }) {
  if (!place) {
    return null;
  }
  return html`<div class="map-details-overlay">
    <div class="map-details-content">
      <img
        class="close-icon"
        src="https://raw.githubusercontent.com/memarostudio/nationswell-placebased-map/refs/heads/main/data/close.svg"
        alt="Close map details overlay"
        onclick=${handleCloseDetails}
      />
      <p>details view of ${place.name}</p>
    </div>
    <div class="map-details-background"></div>
  </div>`;
}
