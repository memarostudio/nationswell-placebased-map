import { html } from "./preact-htm.js";

export function Overlay({ place, handleCloseOverlay }) {
  if (!place) {
    return null;
  }
  return html`<div class="map-details-overlay absolute inset-0 z-[10001]">
    <div
      class="map-details-content absolute p-4 bg-white rounded-lg shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[11] max-w-[80%] max-h-[80%] overflow-y-auto"
    >
      <svg
        class="close-icon absolute top-2 right-2 cursor-pointer h-6 w-6"
        onclick=${handleCloseOverlay}
        width="34"
        height="35"
        viewBox="0 0 34 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.7574 13.56L17 17.8027M17 17.8027L21.2426 22.0453M17 17.8027L21.2426 13.56M17 17.8027L12.7574 22.0453"
          stroke="lightgray"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p>details view of ${place.name}</p>
    </div>
    <div
      class="map-details-background absolute inset-0 bg-black opacity-50 backdrop-blur-md"
    ></div>
  </div>`;
}
